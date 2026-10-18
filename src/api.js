// שכבת התקשורת עם השרת: שומרת את ה-JWT, שולחת אותו ב-header של כל בקשה,
// ומתרגמת כל תשובת שגיאה של השרת לאובייקט ApiError אחד.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5080';
const STORAGE_KEY = 'workshophub.auth';

/**
 * שגיאה שחזרה מהשרת. השרת מחזיר תמיד את אותו מבנה:
 * { status, code, message, correlationId, errors? } – ולכן הלקוח יכול להחליט מה להציג לפי status ו-code.
 */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? 'אירעה שגיאה בלתי צפויה.');
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code ?? 'unknown_error';
    this.correlationId = body?.correlationId ?? null;
    this.fieldErrors = body?.errors ?? null;
  }

  /** 409 – הבקשה תקינה, אבל מתנגשת עם המצב הנוכחי של המשאב (למשל: המקום נתפס). */
  get isConflict() {
    return this.status === 409;
  }
}

// ---------- שמירת ה-JWT ----------

export function loadAuth() {
  try {
    const auth = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!auth?.accessToken || new Date(auth.expiresAtUtc) <= new Date()) {
      return null; // אין token, או שפג תוקפו
    }
    return auth;
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

// מאפשר ל-App להגיב כשהשרת מודיע שה-token כבר לא תקף
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// ---------- בקשה כללית ----------

async function request(method, path, { query, body } = {}) {
  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      url.searchParams.set(key, value);
    }
  }

  const headers = { Accept: 'application/json' };
  const auth = loadAuth();
  if (auth) {
    // ה-JWT נשלח בכל בקשה. ההרשאות עצמן נבדקות בשרת – הלקוח רק מציג או מסתיר כפתורים.
    headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, {
      code: 'network_error',
      message: `אין תקשורת עם השרת (${API_URL}). ודאי שהוא רץ.`,
    });
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      onUnauthorized();
    }
    throw new ApiError(response.status, data);
  }

  return data;
}

// ---------- הפעולות שהלקוח משתמש בהן ----------

export const api = {
  // התחברות והרשמה
  login: (email, password) => request('POST', '/api/tokens', { body: { email, password } }),
  register: (fullName, email, password) => request('POST', '/api/users', { body: { fullName, email, password } }),

  // רשימות (pagination בצד השרת)
  getCategories: () => request('GET', '/api/categories'),
  getSessions: (query) => request('GET', '/api/sessions', { query }),
  getMyRegistrations: (query) => request('GET', '/api/users/me/registrations', { query }),

  // הפעולה על המשאב המוגבל
  registerToSession: (sessionId, joinWaitlistIfFull) =>
    request('POST', `/api/sessions/${sessionId}/registrations`, { body: { joinWaitlistIfFull } }),
  cancelRegistration: (registrationId) => request('DELETE', `/api/registrations/${registrationId}`),

  // מנהלת: עדכון מפגש. ה-rowVersion שנטען עם המפגש חוזר לשרת, והשרת דוחה ב-409 אם המפגש השתנה בינתיים.
  updateSession: (session, changes) =>
    request('PUT', `/api/sessions/${session.id}`, {
      body: {
        startsAtUtc: session.startsAtUtc,
        durationMinutes: session.durationMinutes,
        location: session.location,
        capacity: session.capacity,
        ...changes,
        rowVersion: session.rowVersion,
      },
    }),
};

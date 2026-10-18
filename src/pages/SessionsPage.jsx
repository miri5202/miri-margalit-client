import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import Pagination from '../components/Pagination.jsx';

const PAGE_SIZE = 5;

const formatDate = (isoUtc) =>
  new Date(isoUtc).toLocaleString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

// מסכים 2-4: רשימת המפגשים עם pagination מול השרת, כפתור הפעולה על המשאב המוגבל (הרשמה),
// והצגה ברורה של המקרה שבו השרת מחזיר 409.
export default function SessionsPage({ user }) {
  const [filters, setFilters] = useState({ search: '', categoryId: '', onlyAvailable: false });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null); // { error, sessionId, wasRegistration }
  const [message, setMessage] = useState(null);
  const [busySessionId, setBusySessionId] = useState(null);
  const [capacityEdit, setCapacityEdit] = useState(null); // { session, value } – המפגש שהמנהלת עורכת כרגע

  const isAdmin = user.role === 'Admin';

  // הרשימה נטענת מהשרת בכל שינוי של עמוד או סינון. השרת מחזיר רק את העמוד המבוקש ואת הספירה הכוללת.
  const load = useCallback(async () => {
    try {
      setResult(await api.getSessions({ ...filters, page, pageSize: PAGE_SIZE }));
      setLoadError(null);
    } catch (apiError) {
      setLoadError(apiError);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const changeFilter = (changes) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

  // כל פעולה: מריצים, ואז טוענים את הרשימה מחדש – גם כשהפעולה נכשלה.
  // אחרי 409 זה בדיוק מה שצריך: הרשימה שעל המסך התיישנה, והמצב האמיתי נמצא בשרת.
  const run = async (sessionId, action, successMessage, wasRegistration = false) => {
    setBusySessionId(sessionId);
    setActionError(null);
    setMessage(null);
    try {
      const response = await action();
      setMessage(typeof successMessage === 'function' ? successMessage(response) : successMessage);
    } catch (apiError) {
      setActionError({ error: apiError, sessionId, wasRegistration });
    } finally {
      await load();
      setBusySessionId(null);
    }
  };

  const register = (session, joinWaitlistIfFull) =>
    run(
      session.id,
      () => api.registerToSession(session.id, joinWaitlistIfFull),
      (registration) =>
        registration.status === 'Waitlisted'
          ? `נכנסת לרשימת ההמתנה של "${session.workshopTitle}". אם יתפנה מקום – הוא יישמר לך אוטומטית.`
          : `נרשמת ל"${session.workshopTitle}". המקום שלך שמור.`,
      true,
    );

  const cancel = (session) =>
    run(session.id, () => api.cancelRegistration(session.myRegistrationId), `ההרשמה ל"${session.workshopTitle}" בוטלה.`);

  const saveCapacity = (event) => {
    event.preventDefault();
    const { session, value } = capacityEdit;
    const capacity = Number.parseInt(value, 10);
    setCapacityEdit(null);
    if (!Number.isInteger(capacity)) {
      return;
    }
    // נשלח עם ה-rowVersion שנטען כשהמנהלת פתחה את העריכה. אם מישהי נרשמה מאז – השרת יחזיר 409.
    run(session.id, () => api.updateSession(session, { capacity }), `מספר המקומות עודכן ל-${capacity}.`);
  };

  // אחרי 409 על הרשמה: המפגש כפי שהוא עכשיו בשרת, כדי להציע את הצעד הבא (המתנה או ניסיון נוסף)
  const conflictSession =
    actionError?.wasRegistration &&
    actionError.error.isConflict &&
    result?.items.find((session) => session.id === actionError.sessionId);

  return (
    <section>
      <h1>מפגשים קרובים</h1>

      <div className="filters">
        <input
          placeholder="חיפוש לפי סדנה או מנחה"
          value={filters.search}
          onChange={(e) => changeFilter({ search: e.target.value })}
        />
        <select value={filters.categoryId} onChange={(e) => changeFilter({ categoryId: e.target.value })}>
          <option value="">כל הקטגוריות</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="inline">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => changeFilter({ onlyAvailable: e.target.checked })}
          />
          רק מפגשים עם מקום פנוי
        </label>
      </div>

      {message && <p className="banner banner-success">{message}</p>}

      {/* המקרה החשוב: השרת החזיר 409. מציגים מה קרה, והרשימה שמתחת כבר נטענה מחדש עם המצב העדכני. */}
      <ErrorNotice error={actionError?.error}>
        {conflictSession && conflictSession.isFull && !conflictSession.myRegistrationId && (
          <button className="primary" onClick={() => register(conflictSession, true)}>
            להצטרף לרשימת ההמתנה
          </button>
        )}
        {conflictSession && !conflictSession.isFull && !conflictSession.myRegistrationId && (
          <button className="primary" onClick={() => register(conflictSession, false)}>
            עדיין יש מקום – לנסות שוב
          </button>
        )}
      </ErrorNotice>

      <ErrorNotice error={loadError} />

      {!result && !loadError && <p className="muted">טוען…</p>}
      {result && result.items.length === 0 && <p className="muted">לא נמצאו מפגשים.</p>}

      <ul className="list">
        {result?.items.map((session) => (
          <li key={session.id} className="card">
            <div className="card-main">
              <h2>{session.workshopTitle}</h2>
              <p className="muted">
                {session.instructorName} · {session.categoryName}
              </p>
              <p>
                {formatDate(session.startsAtUtc)} · {session.durationMinutes} דקות · {session.location}
              </p>
              <p className={session.isFull ? 'seats full' : session.seatsLeft === 1 ? 'seats last' : 'seats'}>
                {session.isFull
                  ? `מלא (${session.capacity} מתוך ${session.capacity})`
                  : session.seatsLeft === 1
                    ? `נשאר מקום אחרון (מתוך ${session.capacity})`
                    : `נשארו ${session.seatsLeft} מקומות מתוך ${session.capacity}`}
                {session.waitlistCount > 0 && ` · ${session.waitlistCount} ברשימת ההמתנה`}
              </p>
            </div>

            <div className="card-actions">
              {session.myRegistrationStatus === 'Confirmed' && <span className="chip chip-ok">את רשומה</span>}
              {session.myRegistrationStatus === 'Waitlisted' && <span className="chip chip-wait">את ברשימת ההמתנה</span>}

              {session.myRegistrationId ? (
                <button onClick={() => cancel(session)} disabled={busySessionId === session.id}>
                  ביטול ההרשמה
                </button>
              ) : session.isFull ? (
                <button onClick={() => register(session, true)} disabled={busySessionId === session.id}>
                  הצטרפות לרשימת ההמתנה
                </button>
              ) : (
                <button className="primary" onClick={() => register(session, false)} disabled={busySessionId === session.id}>
                  הרשמה
                </button>
              )}

              {/* הכפתור מוסתר ממי שאינה מנהלת – אבל ההגנה האמיתית היא בשרת: PUT בלי תפקיד Admin מחזיר 403 */}
              {isAdmin && capacityEdit?.session.id !== session.id && (
                <button
                  className="link"
                  onClick={() => setCapacityEdit({ session, value: String(session.capacity) })}
                  disabled={busySessionId === session.id}
                >
                  שינוי מספר המקומות
                </button>
              )}
              {isAdmin && capacityEdit?.session.id === session.id && (
                <form className="capacity-form" onSubmit={saveCapacity}>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    aria-label="מספר המקומות"
                    value={capacityEdit.value}
                    onChange={(e) => setCapacityEdit({ ...capacityEdit, value: e.target.value })}
                  />
                  <button className="primary">שמירה</button>
                  <button type="button" onClick={() => setCapacityEdit(null)}>
                    ביטול
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>

      {result && (
        <Pagination page={result.page} totalPages={result.totalPages} totalCount={result.totalCount} onChange={setPage} />
      )}
    </section>
  );
}

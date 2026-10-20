import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import Pagination from '../components/Pagination.jsx';
import HeroFan from '../components/HeroFan.jsx';
import { WorkshopArt } from '../components/Illustrations.jsx';
import { DateStub, SeatDots } from '../components/Ticket.jsx';

const PAGE_SIZE = 6;

const seatsText = (session) =>
  session.isFull
    ? `מלא – ${session.capacity} מתוך ${session.capacity}`
    : session.seatsLeft === 1
      ? `נשאר מקום אחרון מתוך ${session.capacity}`
      : `נשארו ${session.seatsLeft} מקומות מתוך ${session.capacity}`;

const seatsTone = (session) => (session.isFull ? 'full' : session.seatsLeft === 1 ? 'last' : 'open');

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
  const firstName = user.fullName.split(' ')[0];

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
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="hero-greeting">שלום, {firstName}</p>
          <h1>שומרים לך מקום.</h1>
          <p className="hero-lead">
            בכל סדנה יש מספר מקומות קבוע. נרשמים בלחיצה אחת, ואם המפגש מלא – נכנסים לרשימת ההמתנה, והמקום הראשון
            שמתפנה נשמר לך אוטומטית.
          </p>
          <ul className="legend" aria-label="מקרא">
            <li>
              <span className="seat seat-taken" /> מקום תפוס
            </li>
            <li>
              <span className="seat" /> מקום פנוי
            </li>
            <li>
              <span className="seat seat-mine" /> המקום שלך
            </li>
          </ul>
        </div>
        <HeroFan />
      </section>

      <section className="toolbar" aria-label="סינון מפגשים">
        <label className="search">
          <span className="visually-hidden">חיפוש</span>
          <input
            type="search"
            placeholder="חיפוש לפי סדנה או מנחה"
            value={filters.search}
            onChange={(e) => changeFilter({ search: e.target.value })}
          />
        </label>
        <label>
          <span className="visually-hidden">קטגוריה</span>
          <select value={filters.categoryId} onChange={(e) => changeFilter({ categoryId: e.target.value })}>
            <option value="">כל הקטגוריות</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => changeFilter({ onlyAvailable: e.target.checked })}
          />
          רק עם מקום פנוי
        </label>
      </section>

      <div className="messages" aria-live="polite">
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
      </div>

      {!result && !loadError && <p className="empty">טוענים את המפגשים…</p>}
      {result && result.items.length === 0 && (
        <p className="empty">אין מפגשים שמתאימים לחיפוש. אפשר לנקות את הסינון ולנסות שוב.</p>
      )}

      <ul className="tickets">
        {result?.items.map((session) => {
          const tone = seatsTone(session);
          const isMineConfirmed = session.myRegistrationStatus === 'Confirmed';

          return (
            <li key={session.id} className={`ticket ticket-${tone}`}>
              <DateStub isoUtc={session.startsAtUtc} />

              <div className="ticket-body">
                <div className="ticket-art">
                  <WorkshopArt title={session.workshopTitle} category={session.categoryName} />
                </div>
                <div className="ticket-head">
                  <span className="category">{session.categoryName}</span>
                  {isMineConfirmed && <span className="stamp stamp-ok">את רשומה</span>}
                  {session.myRegistrationStatus === 'Waitlisted' && <span className="stamp stamp-wait">בהמתנה</span>}
                </div>

                <h2>{session.workshopTitle}</h2>
                <p className="meta">
                  בהנחיית {session.instructorName}
                  <br />
                  {session.location}, {session.durationMinutes} דקות
                </p>

                <SeatDots capacity={session.capacity} taken={session.seatsTaken ?? session.capacity - session.seatsLeft} mine={isMineConfirmed} />
                <p className={`seats-text seats-${tone}`}>
                  {seatsText(session)}
                  {session.waitlistCount > 0 && <span className="waitlist">, {session.waitlistCount} ברשימת ההמתנה</span>}
                </p>

                <div className="ticket-actions">
                  {session.myRegistrationId ? (
                    <button className="ghost" onClick={() => cancel(session)} disabled={busySessionId === session.id}>
                      ביטול ההרשמה
                    </button>
                  ) : session.isFull ? (
                    <button className="secondary" onClick={() => register(session, true)} disabled={busySessionId === session.id}>
                      הצטרפות לרשימת ההמתנה
                    </button>
                  ) : (
                    <button className="primary" onClick={() => register(session, false)} disabled={busySessionId === session.id}>
                      {busySessionId === session.id ? 'שומרים…' : 'הרשמה'}
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
                </div>

                {isAdmin && capacityEdit?.session.id === session.id && (
                  <form className="capacity-form" onSubmit={saveCapacity}>
                    <label>
                      מספר מקומות
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={capacityEdit.value}
                        onChange={(e) => setCapacityEdit({ ...capacityEdit, value: e.target.value })}
                      />
                    </label>
                    <button className="primary small">שמירה</button>
                    <button type="button" className="ghost small" onClick={() => setCapacityEdit(null)}>
                      ביטול
                    </button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {result && (
        <Pagination page={result.page} totalPages={result.totalPages} totalCount={result.totalCount} onChange={setPage} />
      )}
    </>
  );
}

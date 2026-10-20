// מציג שגיאה שחזרה מהשרת.
// 409 מקבל הצגה משלו: זו לא "תקלה" אלא הודעה שהמשאב נתפס או השתנה – והמשתמשת צריכה לדעת מה לעשות עכשיו.
export default function ErrorNotice({ error, children }) {
  if (!error) {
    return null;
  }

  const fieldErrors = error.fieldErrors ? Object.values(error.fieldErrors).flat() : [];

  if (error.isConflict) {
    return (
      <div className="banner banner-conflict" role="alert">
        <span className="conflict-badge" aria-hidden="true">
          409
        </span>
        <div className="conflict-content">
          <strong>{CONFLICT_TITLES[error.code] ?? 'הפעולה לא בוצעה'}</strong>
          <p>{error.message}</p>
          {children && <div className="conflict-actions">{children}</div>}
          <small className="muted">
            קוד השגיאה: {error.code}
            {error.correlationId && (
              <>
                {', '}מזהה בקשה: <span dir="ltr">{error.correlationId}</span>
              </>
            )}
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="banner banner-error" role="alert">
      <p>{error.message}</p>
      {fieldErrors.length > 0 && (
        <ul>
          {fieldErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {error.correlationId && (
        <small className="muted">
          מזהה בקשה: <span dir="ltr">{error.correlationId}</span>
        </small>
      )}
    </div>
  );
}

const CONFLICT_TITLES = {
  concurrency_conflict: 'מישהי אחרת הקדימה אותך',
  session_full: 'המפגש כבר מלא',
  already_registered: 'את כבר רשומה למפגש הזה',
  already_cancelled: 'ההרשמה כבר בוטלה',
  session_already_started: 'המפגש כבר התחיל',
  capacity_below_seats_taken: 'אי אפשר להקטין את מספר המקומות',
  email_taken: 'כתובת המייל כבר רשומה',
};

import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import Pagination from '../components/Pagination.jsx';

const PAGE_SIZE = 5;

const STATUS_LABELS = {
  Confirmed: { text: 'מאושרת', className: 'chip chip-ok' },
  Waitlisted: { text: 'ברשימת ההמתנה', className: 'chip chip-wait' },
  Cancelled: { text: 'בוטלה', className: 'chip chip-off' },
};

const formatDate = (isoUtc) =>
  new Date(isoUtc).toLocaleString('he-IL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ההרשמות של המשתמשת המחוברת – גם כאן ה-pagination נעשה בשרת.
export default function MyRegistrationsPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setResult(await api.getMyRegistrations({ page, pageSize: PAGE_SIZE }));
    } catch (apiError) {
      setError(apiError);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (registration) => {
    setBusyId(registration.id);
    setError(null);
    try {
      await api.cancelRegistration(registration.id);
    } catch (apiError) {
      setError(apiError);
    } finally {
      await load();
      setBusyId(null);
    }
  };

  return (
    <section>
      <h1>ההרשמות שלי</h1>

      <ErrorNotice error={error} />

      {!result && !error && <p className="muted">טוען…</p>}
      {result && result.items.length === 0 && <p className="muted">עדיין לא נרשמת לאף מפגש.</p>}

      <ul className="list">
        {result?.items.map((registration) => {
          const status = STATUS_LABELS[registration.status] ?? { text: registration.status, className: 'chip' };
          const isUpcoming = new Date(registration.sessionStartsAtUtc) > new Date();

          return (
            <li key={registration.id} className="card">
              <div className="card-main">
                <h2>{registration.workshopTitle}</h2>
                <p>
                  {formatDate(registration.sessionStartsAtUtc)} · {registration.location}
                </p>
              </div>
              <div className="card-actions">
                <span className={status.className}>{status.text}</span>
                {registration.status !== 'Cancelled' && isUpcoming && (
                  <button onClick={() => cancel(registration)} disabled={busyId === registration.id}>
                    ביטול ההרשמה
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {result && (
        <Pagination page={result.page} totalPages={result.totalPages} totalCount={result.totalCount} onChange={setPage} />
      )}
    </section>
  );
}

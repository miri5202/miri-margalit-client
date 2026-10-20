import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import Pagination from '../components/Pagination.jsx';
import { DateStub } from '../components/Ticket.jsx';
import { WorkshopArt } from '../components/Illustrations.jsx';

const PAGE_SIZE = 6;

const STATUS = {
  Confirmed: { text: 'מאושרת', className: 'stamp stamp-ok' },
  Waitlisted: { text: 'בהמתנה', className: 'stamp stamp-wait' },
  Cancelled: { text: 'בוטלה', className: 'stamp stamp-off' },
};

// ההרשמות של המשתמשת המחוברת – גם כאן ה-pagination נעשה בשרת.
export default function MyRegistrationsPage({ onBrowse }) {
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
    <>
      <header className="page-header">
        <h1>ההרשמות שלי</h1>
        <p className="hero-lead">כל המפגשים שנרשמת אליהם, כולל רשימות ההמתנה. ביטול משחרר את המקום למשתתפת הבאה בתור.</p>
      </header>

      <ErrorNotice error={error} />

      {!result && !error && <p className="empty">טוענים את ההרשמות…</p>}
      {result && result.items.length === 0 && (
        <div className="empty empty-action">
          <p>עדיין לא נרשמת לאף מפגש.</p>
          <button className="primary" onClick={onBrowse}>
            למפגשים הקרובים
          </button>
        </div>
      )}

      <ul className="tickets">
        {result?.items.map((registration) => {
          const status = STATUS[registration.status] ?? { text: registration.status, className: 'stamp' };
          const isUpcoming = new Date(registration.sessionStartsAtUtc) > new Date();

          return (
            <li key={registration.id} className={`ticket ${registration.status === 'Cancelled' ? 'ticket-void' : ''}`}>
              <DateStub isoUtc={registration.sessionStartsAtUtc} />

              <div className="ticket-body">
                <div className="ticket-art ticket-art-small">
                  <WorkshopArt title={registration.workshopTitle} />
                </div>
                <div className="ticket-head">
                  <span className={status.className}>{status.text}</span>
                </div>
                <h2>{registration.workshopTitle}</h2>
                <p className="meta">{registration.location}</p>

                {registration.status !== 'Cancelled' && isUpcoming && (
                  <div className="ticket-actions">
                    <button className="ghost" onClick={() => cancel(registration)} disabled={busyId === registration.id}>
                      ביטול ההרשמה
                    </button>
                  </div>
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

import { useCallback, useEffect, useState } from 'react';
import { clearAuth, loadAuth, saveAuth, setUnauthorizedHandler } from './api.js';
import AuthPage from './pages/AuthPage.jsx';
import SessionsPage from './pages/SessionsPage.jsx';
import MyRegistrationsPage from './pages/MyRegistrationsPage.jsx';

const ROLE_LABELS = { Admin: 'מנהלת', Member: 'משתתפת' };

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth());
  const [page, setPage] = useState('sessions');
  const [notice, setNotice] = useState(null);

  const logout = useCallback((message = null) => {
    clearAuth();
    setAuth(null);
    setPage('sessions');
    setNotice(message);
  }, []);

  // אם השרת עונה 401 על בקשה עם token – ה-token פג או נפסל, וחוזרים למסך ההתחברות
  useEffect(() => {
    setUnauthorizedHandler(() => logout('פג תוקף ההתחברות. התחברי מחדש.'));
  }, [logout]);

  const handleLoggedIn = (tokenResponse) => {
    saveAuth(tokenResponse);
    setAuth(tokenResponse);
    setNotice(null);
    setPage('sessions');
  };

  if (!auth) {
    return (
      <div className="shell">
        <header className="topbar">
          <span className="brand">WorkshopHub</span>
          <span className="muted">הרשמה לסדנאות</span>
        </header>
        <main>
          {notice && <p className="banner banner-info">{notice}</p>}
          <AuthPage onLoggedIn={handleLoggedIn} />
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">WorkshopHub</span>
        <nav className="tabs">
          <button className={page === 'sessions' ? 'tab active' : 'tab'} onClick={() => setPage('sessions')}>
            מפגשים
          </button>
          <button className={page === 'mine' ? 'tab active' : 'tab'} onClick={() => setPage('mine')}>
            ההרשמות שלי
          </button>
        </nav>
        <span className="user">
          {auth.user.fullName} · {ROLE_LABELS[auth.user.role] ?? auth.user.role}
          <button className="link" onClick={() => logout()}>
            התנתקות
          </button>
        </span>
      </header>
      <main>
        {page === 'sessions' ? <SessionsPage user={auth.user} /> : <MyRegistrationsPage />}
      </main>
    </div>
  );
}

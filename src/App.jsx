import { useCallback, useEffect, useState } from 'react';
import { clearAuth, loadAuth, saveAuth, setUnauthorizedHandler } from './api.js';
import AuthPage from './pages/AuthPage.jsx';
import SessionsPage from './pages/SessionsPage.jsx';
import MyRegistrationsPage from './pages/MyRegistrationsPage.jsx';

const ROLE_LABELS = { Admin: 'מנהלת', Member: 'משתתפת' };

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 28" aria-hidden="true">
      <path d="M4 2h32a2 2 0 0 1 2 2v6a4 4 0 0 0 0 8v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a4 4 0 0 0 0-8V4a2 2 0 0 1 2-2z" />
      <circle cx="14" cy="14" r="3" />
      <circle cx="26" cy="14" r="3" />
    </svg>
  );
}

function Brand() {
  return (
    <span className="brand">
      <BrandMark />
      <span className="brand-text">
        <span className="brand-name">WorkshopHub</span>
        <span className="brand-tagline">סדנאות קטנות, מקום שמור</span>
      </span>
    </span>
  );
}

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
      <div className="app">
        <header className="topbar">
          <div className="topbar-inner">
            <Brand />
          </div>
        </header>
        <main className="page">
          {notice && <p className="banner banner-info">{notice}</p>}
          <AuthPage onLoggedIn={handleLoggedIn} />
        </main>
      </div>
    );
  }

  const initials = auth.user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <Brand />

          <nav className="tabs" aria-label="ניווט ראשי">
            <button
              className={page === 'sessions' ? 'tab active' : 'tab'}
              aria-current={page === 'sessions' ? 'page' : undefined}
              onClick={() => setPage('sessions')}
            >
              מפגשים
            </button>
            <button
              className={page === 'mine' ? 'tab active' : 'tab'}
              aria-current={page === 'mine' ? 'page' : undefined}
              onClick={() => setPage('mine')}
            >
              ההרשמות שלי
            </button>
          </nav>

          <div className="user">
            <span className="avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="user-text">
              <span className="user-name">{auth.user.fullName}</span>
              <span className="user-role">{ROLE_LABELS[auth.user.role] ?? auth.user.role}</span>
            </span>
            <button className="ghost small" onClick={() => logout()}>
              התנתקות
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        {page === 'sessions' ? <SessionsPage user={auth.user} /> : <MyRegistrationsPage onBrowse={() => setPage('sessions')} />}
      </main>

      <footer className="footer">פרויקט גמר ב-.NET של מרים מרגלית</footer>
    </div>
  );
}

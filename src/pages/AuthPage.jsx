import { useState } from 'react';
import { api } from '../api.js';
import ErrorNotice from '../components/ErrorNotice.jsx';
import HeroFan from '../components/HeroFan.jsx';

// משתמשי הדמו – רק בהרצה מקומית (npm run dev). בבנייה לאתר המפורסם import.meta.env.DEV הוא false,
// הרשימה ריקה והכפתורים לא נכללים בכלל. באתר עצמו חשבונות הדמו נעולים בשרת.
const DEMO_USERS = !import.meta.env.DEV ? [] : [
  { label: 'משתתפת לדוגמה', email: 'rachel@workshophub.local', password: 'Member#2026!' },
  { label: 'מנהלת לדוגמה', email: 'admin@workshophub.local', password: 'Admin#2026!' },
];

// מסך 1: התחברות והרשמה. אחרי התחברות מוצלחת ה-JWT נשמר (ב-App) ונשלח מעכשיו בכל בקשה.
export default function AuthPage({ onLoggedIn }) {
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isRegister) {
        // הרשמה (POST /api/users) ואז התחברות (POST /api/tokens) עם אותם פרטים
        await api.register(fullName, email, password);
      }
      onLoggedIn(await api.login(email, password));
    } catch (apiError) {
      setError(apiError);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (user) => {
    setMode('login');
    setEmail(user.email);
    setPassword(user.password);
    setError(null);
  };

  return (
    <div className="auth">
      <section className="auth-intro">
        <h1>שומרים לך מקום.</h1>
        <p className="hero-lead">
          סדנאות אפייה, קליגרפיה, מחשבים ועוד – בקבוצות קטנות עם מספר מקומות קבוע. מתחברים, בוחרים מפגש, והמקום שלך.
        </p>
        <HeroFan />
      </section>

      <section className="auth-card">
        <div className="segmented" role="tablist" aria-label="סוג הכניסה">
          <button
            role="tab"
            aria-selected={!isRegister}
            className={!isRegister ? 'active' : ''}
            onClick={() => {
              setMode('login');
              setError(null);
            }}
          >
            התחברות
          </button>
          <button
            role="tab"
            aria-selected={isRegister}
            className={isRegister ? 'active' : ''}
            onClick={() => {
              setMode('register');
              setError(null);
            }}
          >
            משתמשת חדשה
          </button>
        </div>

        <form onSubmit={submit} className="form">
          {isRegister && (
            <label>
              שם מלא
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} autoComplete="name" />
            </label>
          )}
          <label>
            כתובת מייל
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            סיסמה
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            {isRegister && <span className="hint">לפחות 8 תווים</span>}
          </label>

          <ErrorNotice error={error} />

          <button className="primary wide" disabled={busy}>
            {busy ? 'רגע…' : isRegister ? 'יצירת חשבון והתחברות' : 'התחברות'}
          </button>
        </form>

        {!isRegister && DEMO_USERS.length > 0 && (
          <div className="demo">
            <p>לנסות בלי להירשם:</p>
            <div className="demo-buttons">
              {DEMO_USERS.map((user) => (
                <button key={user.email} type="button" className="ghost small" onClick={() => fillDemo(user)}>
                  {user.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

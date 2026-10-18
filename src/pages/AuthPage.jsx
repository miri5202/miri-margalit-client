import { useState } from 'react';
import { api } from '../api.js';
import ErrorNotice from '../components/ErrorNotice.jsx';

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

  return (
    <section className="card narrow">
      <h1>{isRegister ? 'הרשמה למערכת' : 'התחברות'}</h1>

      <form onSubmit={submit}>
        {isRegister && (
          <label>
            שם מלא
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
          </label>
        )}
        <label>
          כתובת מייל
          <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
          />
        </label>

        <ErrorNotice error={error} />

        <button className="primary" disabled={busy}>
          {busy ? 'רגע…' : isRegister ? 'הרשמה והתחברות' : 'התחברות'}
        </button>
      </form>

      <button
        className="link"
        onClick={() => {
          setMode(isRegister ? 'login' : 'register');
          setError(null);
        }}
      >
        {isRegister ? 'כבר יש לי חשבון – להתחברות' : 'אין לי חשבון – להרשמה'}
      </button>
    </section>
  );
}

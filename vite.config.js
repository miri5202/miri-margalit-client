import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// הפורט קבוע (5173) כי זה ה-origin שהשרת מאשר ב-CORS (appsettings.Development.json)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // אופציונלי: עם VITE_API_URL=http://localhost:5173 הבקשות ל-/api עוברות דרך שרת הפיתוח אל ה-API,
    // והדפדפן מדבר עם כתובת אחת בלבד. ברירת המחדל היא פנייה ישירה ל-API (עם CORS).
    proxy: {
      '/api': 'http://localhost:5080',
    },
  },
});

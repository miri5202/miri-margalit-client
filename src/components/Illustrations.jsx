// איורים שצוירו במיוחד לאתר (SVG, בלי תמונות חיצוניות): לכל סדנה תמונה שמתארת אותה.
// הבחירה לפי מילת מפתח בשם הסדנה, ואם אין התאמה – לפי הקטגוריה.
// כל האיורים באותה שפה: צורות שטוחות, פלטת הצבעים של האתר, ורקע בצבע של הנושא.

const C = {
  ink: '#17324d',
  teal: '#0e7c74',
  tealLight: '#7fc8bf',
  saffron: '#f2a93b',
  saffronLight: '#ffd88f',
  rose: '#c9395e',
  roseLight: '#f5a3b7',
  cream: '#fff8ec',
  white: '#ffffff',
  brown: '#b86b2b',
  brownLight: '#e2a25e',
};

function Frame({ bg, children, label }) {
  return (
    <svg viewBox="0 0 320 160" className="illustration" role="img" aria-label={label} direction="ltr" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="160" fill={bg} />
      <circle cx="40" cy="30" r="46" fill={C.white} opacity="0.18" />
      <circle cx="290" cy="140" r="60" fill={C.white} opacity="0.14" />
      <circle cx="262" cy="28" r="6" fill={C.white} opacity="0.5" />
      <circle cx="58" cy="128" r="4" fill={C.white} opacity="0.5" />
      {children}
    </svg>
  );
}

function Sparkle({ x, y, s = 1, fill = C.white }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0-10 C1.5-2 2-1.5 10 0 C2 1.5 1.5 2 0 10 C-1.5 2 -2 1.5 -10 0 C-2-1.5 -1.5-2 0-10Z"
      fill={fill}
    />
  );
}

// ---------- אפייה ----------

function Challah() {
  return (
    <Frame bg="#f6c76a" label="חלה קלועה על קרש">
      <rect x="70" y="112" width="180" height="16" rx="8" fill={C.brown} />
      <rect x="236" y="116" width="40" height="8" rx="4" fill={C.brown} />
      <g>
        <ellipse cx="160" cy="96" rx="78" ry="24" fill={C.brown} />
        <ellipse cx="112" cy="88" rx="30" ry="22" fill={C.brownLight} />
        <ellipse cx="148" cy="80" rx="30" ry="24" fill={C.brownLight} />
        <ellipse cx="186" cy="82" rx="30" ry="23" fill={C.brownLight} />
        <ellipse cx="220" cy="92" rx="22" ry="18" fill={C.brownLight} />
        <path d="M100 80 q12-8 24 0 M136 72 q12-8 24 0 M174 74 q12-8 24 0 M208 86 q10-6 20 0" stroke={C.cream} strokeWidth="3" fill="none" strokeLinecap="round" />
        {[118, 132, 156, 170, 192, 204, 224].map((x, i) => (
          <ellipse key={x} cx={x} cy={i % 2 ? 76 : 70} rx="2.2" ry="1.4" fill={C.cream} />
        ))}
      </g>
      <path d="M128 40 q6-10 0-18 M160 36 q6-10 0-18 M192 40 q6-10 0-18" stroke={C.white} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      <Sparkle x={262} y={60} s={0.9} />
    </Frame>
  );
}

function Cake() {
  return (
    <Frame bg="#f5b5c4" label="עוגה מעוצבת בשלוש קומות">
      <ellipse cx="160" cy="136" rx="86" ry="10" fill={C.white} opacity="0.7" />
      <rect x="92" y="96" width="136" height="40" rx="8" fill={C.white} />
      <rect x="110" y="64" width="100" height="34" rx="8" fill={C.cream} />
      <rect x="128" y="38" width="64" height="28" rx="8" fill={C.white} />
      <path d="M92 104 q11 10 22 0 t22 0 t22 0 t22 0 t22 0 t22 0" fill="none" stroke={C.rose} strokeWidth="5" strokeLinecap="round" />
      <path d="M110 72 q10 9 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke={C.saffron} strokeWidth="5" strokeLinecap="round" />
      {[140, 160, 180].map((x) => (
        <circle key={x} cx={x} cy="52" r="5" fill={C.rose} />
      ))}
      <rect x="157" y="16" width="6" height="22" rx="3" fill={C.teal} />
      <path d="M160 4 q7 8 0 14 q-7-6 0-14z" fill={C.saffron} />
      <Sparkle x={66} y={70} s={1.1} />
      <Sparkle x={258} y={58} s={0.8} />
    </Frame>
  );
}

// ---------- מלאכת יד ----------

function Calligraphy() {
  return (
    <Frame bg="#bfe3dd" label="קולמוס, קסת דיו והאות א">
      <rect x="66" y="26" width="150" height="112" rx="6" fill={C.cream} transform="rotate(-4 141 82)" />
      <text x="140" y="112" textAnchor="middle" fontSize="86" fontFamily="'Frank Ruhl Libre', 'David', serif" fontWeight="700" fill={C.ink} transform="rotate(-4 141 82)">
        א
      </text>
      <path d="M96 128 h88" stroke={C.saffron} strokeWidth="4" strokeLinecap="round" transform="rotate(-4 141 82)" />
      <ellipse cx="248" cy="128" rx="24" ry="8" fill={C.ink} opacity="0.25" />
      <path d="M226 96 h44 v28 q0 8 -8 8 h-28 q-8 0 -8 -8z" fill={C.ink} />
      <rect x="236" y="88" width="24" height="10" rx="3" fill={C.teal} />
      <path d="M252 92 L292 16 q6 -6 6 4 L258 96z" fill={C.white} />
      <path d="M258 96 L272 64" stroke={C.tealLight} strokeWidth="2" />
      <Sparkle x={290} y={70} s={0.8} />
    </Frame>
  );
}

function Sewing() {
  return (
    <Frame bg="#f7d29a" label="סליל חוט, מחט ומספריים">
      <rect x="80" y="40" width="64" height="86" rx="8" fill={C.brown} />
      <rect x="86" y="50" width="52" height="66" rx="4" fill={C.rose} />
      {[58, 68, 78, 88, 98, 108].map((y) => (
        <line key={y} x1="86" y1={y} x2="138" y2={y} stroke={C.roseLight} strokeWidth="3" />
      ))}
      <rect x="74" y="34" width="76" height="12" rx="6" fill={C.brownLight} />
      <rect x="74" y="120" width="76" height="12" rx="6" fill={C.brownLight} />
      <path d="M138 90 C190 70 200 130 250 104" fill="none" stroke={C.rose} strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
      <path d="M244 40 L262 122" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="246" cy="50" rx="3" ry="7" fill={C.white} transform="rotate(-12 246 50)" />
      <g transform="translate(200 30) rotate(30)">
        <circle cx="0" cy="0" r="10" fill="none" stroke={C.teal} strokeWidth="5" />
        <circle cx="22" cy="0" r="10" fill="none" stroke={C.teal} strokeWidth="5" />
        <path d="M6 8 L40 46 M16 8 L-14 46" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

function Knitting() {
  return (
    <Frame bg="#c9e7e2" label="כדור צמר ומסרגות">
      <circle cx="150" cy="88" r="50" fill={C.rose} />
      <path d="M108 62 q42 20 84 0 M102 84 q48 22 96 0 M106 106 q44 20 88 0" stroke={C.roseLight} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M126 44 q-12 44 6 92 M160 38 q-16 50 4 100" stroke={C.roseLight} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M196 112 C230 130 250 110 280 128" fill="none" stroke={C.rose} strokeWidth="5" strokeLinecap="round" />
      <path d="M200 24 L264 120" stroke={C.saffron} strokeWidth="6" strokeLinecap="round" />
      <path d="M226 20 L240 126" stroke={C.saffron} strokeWidth="6" strokeLinecap="round" />
      <circle cx="198" cy="22" r="7" fill={C.ink} />
      <circle cx="226" cy="18" r="7" fill={C.ink} />
      <Sparkle x={70} y={110} s={0.9} />
    </Frame>
  );
}

// ---------- מחשבים ----------

function Spreadsheet() {
  return (
    <Frame bg="#bde4d0" label="גיליון אלקטרוני עם תרשים">
      <rect x="64" y="24" width="192" height="118" rx="10" fill={C.white} />
      <rect x="64" y="24" width="192" height="22" rx="10" fill={C.teal} />
      <rect x="64" y="36" width="192" height="10" fill={C.teal} />
      {[60, 78, 96, 114].map((y) => (
        <line key={y} x1="64" y1={y} x2="150" y2={y} stroke="#d4e0dd" strokeWidth="2" />
      ))}
      {[92, 120].map((x) => (
        <line key={x} x1={x} y1="46" x2={x} y2="132" stroke="#d4e0dd" strokeWidth="2" />
      ))}
      <rect x="160" y="96" width="16" height="34" rx="3" fill={C.saffron} />
      <rect x="182" y="74" width="16" height="56" rx="3" fill={C.rose} />
      <rect x="204" y="86" width="16" height="44" rx="3" fill={C.teal} />
      <rect x="226" y="60" width="16" height="70" rx="3" fill={C.ink} />
      <path d="M164 84 L190 62 L212 72 L236 48" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="78" y="72" fontSize="12" fontWeight="700" fill={C.teal} fontFamily="Arial">
        =SUM
      </text>
    </Frame>
  );
}

function Laptop() {
  return (
    <Frame bg="#9fd3cb" label="מחשב נייד עם קוד">
      <rect x="84" y="28" width="152" height="96" rx="10" fill={C.ink} />
      <rect x="94" y="38" width="132" height="76" rx="4" fill="#20476b" />
      <text x="110" y="70" fontSize="22" fontWeight="700" fill={C.saffron} fontFamily="Consolas, monospace">
        {'{ }'}
      </text>
      <rect x="150" y="56" width="58" height="6" rx="3" fill={C.tealLight} />
      <rect x="110" y="80" width="86" height="6" rx="3" fill={C.roseLight} />
      <rect x="122" y="94" width="62" height="6" rx="3" fill={C.tealLight} />
      <path d="M64 124 h192 l-12 14 h-168z" fill="#c7d6e2" />
      <rect x="140" y="124" width="40" height="5" rx="2.5" fill="#9fb2c2" />
      <text x="248" y="60" fontSize="26" fontWeight="700" fill={C.white} fontFamily="Arial">
        C#
      </text>
      <Sparkle x={60} y={52} s={0.9} />
    </Frame>
  );
}

function Design() {
  return (
    <Frame bg="#f9c9a3" label="לוח צבעים ומכחול">
      <rect x="168" y="30" width="96" height="104" rx="8" fill={C.white} transform="rotate(6 216 82)" />
      <rect x="180" y="44" width="72" height="34" rx="6" fill={C.teal} transform="rotate(6 216 82)" />
      <rect x="182" y="88" width="52" height="7" rx="3.5" fill={C.ink} transform="rotate(6 216 82)" />
      <rect x="182" y="102" width="68" height="7" rx="3.5" fill="#d4e0dd" transform="rotate(6 216 82)" />
      <path d="M70 92 c-6-40 40-62 74-44 c18 10 10 26 -4 24 c-12-2 -16 12 -6 18 c14 9 6 34 -26 32 c-22-1 -36-12 -38-30z" fill={C.cream} />
      <circle cx="94" cy="72" r="9" fill={C.rose} />
      <circle cx="120" cy="60" r="9" fill={C.saffron} />
      <circle cx="90" cy="100" r="9" fill={C.teal} />
      <circle cx="116" cy="114" r="8" fill={C.ink} />
      <path d="M150 128 L196 40" stroke={C.brown} strokeWidth="7" strokeLinecap="round" />
      <path d="M196 40 l8 -16 l-2 18z" fill={C.rose} />
    </Frame>
  );
}

// ---------- ניהול ופיתוח אישי ----------

function Budget() {
  return (
    <Frame bg="#cfe6b8" label="צנצנת חיסכון ומטבעות">
      <path d="M110 52 h80 v14 q14 10 14 30 v26 q0 14 -14 14 h-80 q-14 0 -14 -14 v-26 q0 -20 14 -30z" fill={C.white} opacity="0.9" />
      <rect x="104" y="40" width="92" height="16" rx="6" fill={C.teal} />
      {[
        [130, 122],
        [156, 122],
        [182, 122],
        [143, 108],
        [169, 108],
        [156, 94],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y} rx="12" ry="6" fill={C.brown} />
          <ellipse cx={x} cy={y - 3} rx="12" ry="6" fill={C.saffron} />
        </g>
      ))}
      <circle cx="244" cy="70" r="20" fill={C.saffron} />
      <circle cx="244" cy="70" r="14" fill="none" stroke={C.brown} strokeWidth="3" />
      <text x="244" y="77" textAnchor="middle" fontSize="18" fontWeight="700" fill={C.brown} fontFamily="Arial">
        ₪
      </text>
      <Sparkle x={70} y={60} s={1} />
    </Frame>
  );
}

function Clock() {
  return (
    <Frame bg="#c6d8f2" label="שעון ולוח שנה">
      <rect x="170" y="40" width="96" height="92" rx="10" fill={C.white} />
      <rect x="170" y="40" width="96" height="24" rx="10" fill={C.rose} />
      <rect x="170" y="54" width="96" height="10" fill={C.rose} />
      {[0, 1, 2, 3].map((col) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={180 + col * 21}
            y={74 + row * 18}
            width="14"
            height="11"
            rx="3"
            fill={col === 2 && row === 1 ? C.saffron : '#d4e0dd'}
          />
        )),
      )}
      <circle cx="110" cy="84" r="50" fill={C.ink} />
      <circle cx="110" cy="84" r="42" fill={C.cream} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <circle key={i} cx={110 + Math.sin(a) * 34} cy={84 - Math.cos(a) * 34} r={i % 3 ? 2 : 3.5} fill={C.ink} />;
      })}
      <path d="M110 84 L110 56" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M110 84 L132 96" stroke={C.teal} strokeWidth="5" strokeLinecap="round" />
      <circle cx="110" cy="84" r="5" fill={C.rose} />
    </Frame>
  );
}

// ---------- בחירת איור ----------

const BY_TITLE = [
  [/חל(ה|ות)|לחם/, Challah],
  [/עוג/, Cake],
  [/קליגרפ|כתיב/, Calligraphy],
  [/תפיר/, Sewing],
  [/סריג|רקמ/, Knitting],
  [/excel|גיליון/i, Spreadsheet],
  [/תכנות|c#|קוד/i, Laptop],
  [/canva|עיצוב|גרפ/i, Design],
  [/תקציב|כסף|כלכל/, Budget],
  [/זמן|סדר יום/, Clock],
];

const BY_CATEGORY = [
  [/אפי|בישול/, Challah],
  [/יד|יצירה|אמנות/, Knitting],
  [/מחשב|טכנולוג/, Laptop],
  [/ניהול|אישי/, Clock],
];

export function WorkshopArt({ title = '', category = '' }) {
  const match = BY_TITLE.find(([pattern]) => pattern.test(title)) ?? BY_CATEGORY.find(([pattern]) => pattern.test(category));
  const Art = match ? match[1] : Design;
  return <Art />;
}

export const HERO_ART = [Challah, Calligraphy, Laptop];

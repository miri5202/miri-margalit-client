// חלקי ה"כרטיס" שכל מפגש מוצג בו: ספח התאריך, ושורת המקומות שמראה את המשאב המוגבל בעיניים.

const MAX_DOTS = 20;

export function DateStub({ isoUtc }) {
  const date = new Date(isoUtc);
  const day = date.toLocaleDateString('he-IL', { day: 'numeric' });
  const month = date.toLocaleDateString('he-IL', { month: 'long' });
  const weekday = date.toLocaleDateString('he-IL', { weekday: 'long' });
  const time = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="stub" aria-label={`${weekday}, ${day} ב${month}, ${time}`}>
      <span className="stub-weekday">{weekday}</span>
      <span className="stub-day">{day}</span>
      <span className="stub-month">{month}</span>
      <span className="stub-time" dir="ltr">
        {time}
      </span>
    </div>
  );
}

// כל מקום במפגש הוא נקודה: מלאה = תפוס, ריקה = פנוי. כך רואים מיד כמה נשאר.
// במפגש גדול (יותר מ-20 מקומות) מוצג פס מילוי במקום נקודות.
export function SeatDots({ capacity, taken, mine = false }) {
  const label = `${taken} מתוך ${capacity} מקומות תפוסים`;

  if (capacity > MAX_DOTS) {
    const percent = Math.min(100, Math.round((taken / capacity) * 100));
    return (
      <div className="seat-bar" role="img" aria-label={label}>
        <span style={{ width: `${percent}%` }} />
      </div>
    );
  }

  return (
    <div className="seats-row" role="img" aria-label={label}>
      {Array.from({ length: capacity }, (_, index) => {
        const isTaken = index < taken;
        const isMine = mine && index === taken - 1;
        return <span key={index} className={isMine ? 'seat seat-mine' : isTaken ? 'seat seat-taken' : 'seat'} />;
      })}
    </div>
  );
}

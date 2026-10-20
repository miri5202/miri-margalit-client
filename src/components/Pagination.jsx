// ניווט בין עמודים. העמודים עצמם מגיעים מהשרת (page / pageSize ב-query string) –
// הלקוח מחזיק רק את העמוד הנוכחי, לא את כל הרשימה.
export default function Pagination({ page, totalPages, totalCount, onChange }) {
  if (!totalPages || totalPages <= 1) {
    return totalCount > 0 ? <p className="muted pager">{totalCount} בסך הכול</p> : null;
  }

  return (
    <div className="pager">
      <button className="ghost small" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        הקודם
      </button>
      <span>
        עמוד {page} מתוך {totalPages} ({totalCount} בסך הכול)
      </span>
      <button className="ghost small" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        הבא
      </button>
    </div>
  );
}

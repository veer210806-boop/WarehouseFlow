export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'accent-purple',
  onClick
}) {
  return (
    <div
      className={`kpi-card ${accent} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="kpi-card-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {hint && <div className="kpi-hint">{hint}</div>}
      </div>
      {Icon && (
        <div className="kpi-icon-badge">
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

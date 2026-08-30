export default function Badge({ variant = 'neutral', children }) {
  const map = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
    // Order statuses
    DELIVERED: 'badge-success',
    IN_TRANSIT: 'badge-info',
    APPROVED: 'badge-warning',
    PENDING: 'badge-warning',
    DRAFT: 'badge-neutral',
    CANCELLED: 'badge-danger'
  };

  const cls = map[variant] || map[children] || 'badge-neutral';

  return <span className={`badge ${cls}`}>{children}</span>;
}

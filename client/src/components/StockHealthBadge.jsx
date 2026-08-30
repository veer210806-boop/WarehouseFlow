export default function StockHealthBadge({ status, stock, minAlert, safetyStock }) {
  // If status is passed directly or calculated from props
  let computed = status;

  if (!computed && stock !== undefined) {
    const s = Number(stock);
    const min = Number(minAlert || 15);
    const safe = Number(safetyStock || 5);

    if (s === 0) computed = 'OUT_OF_STOCK';
    else if (s <= safe) computed = 'CRITICAL';
    else if (s <= min) computed = 'LOW';
    else computed = 'HEALTHY';
  }

  switch (computed) {
    case 'OUT_OF_STOCK':
      return (
        <span className="health-pill health-out">
          <span className="health-dot" />
          <span>Out of Stock</span>
        </span>
      );
    case 'CRITICAL':
      return (
        <span className="health-pill health-critical">
          <span className="health-dot" />
          <span>Critical Risk</span>
        </span>
      );
    case 'LOW':
    case 'LOW_STOCK':
      return (
        <span className="health-pill health-low">
          <span className="health-dot" />
          <span>Low Stock</span>
        </span>
      );
    case 'HEALTHY':
    default:
      return (
        <span className="health-pill health-healthy">
          <span className="health-dot" />
          <span>Healthy</span>
        </span>
      );
  }
}

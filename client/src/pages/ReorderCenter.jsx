import { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ShoppingCart,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  IndianRupee,
  Layers
} from 'lucide-react';
import api, { formatINR } from '../api/axiosClient';
import StockHealthBadge from '../components/StockHealthBadge';
import Loading from '../components/Loading';

export default function ReorderCenter({ onAddToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingPOFor, setCreatingPOFor] = useState(null);
  const [customQuantities, setCustomQuantities] = useState({});
  const [filterUrgency, setFilterUrgency] = useState('ALL');

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reorder/recommendations');
      setData(res.data.data);
      // Initialize custom quantities
      const initial = {};
      res.data.data.recommendations.forEach((r) => {
        initial[r.productId] = r.suggestedQuantity;
      });
      setCustomQuantities(initial);
    } catch (err) {
      onAddToast?.('Failed to compute smart reorder recommendations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleCreatePO = async (item) => {
    try {
      setCreatingPOFor(item.productId);
      const qty = customQuantities[item.productId] || item.suggestedQuantity;

      const res = await api.post('/reorder/create-po', {
        productId: item.productId,
        suggestedQuantity: qty
      });

      onAddToast?.(
        `Purchase Order ${res.data.data.poNumber} created for ${item.name} (${qty} units)!`,
        'success'
      );
      loadRecommendations();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Failed to create Purchase Order.', 'error');
    } finally {
      setCreatingPOFor(null);
    }
  };

  if (loading) return <Loading message="Running Smart Reorder Algorithm & DSA Urgency Analysis..." />;
  if (!data) return null;

  const { recommendations, summary } = data;

  const filtered = recommendations.filter((r) => {
    if (filterUrgency === 'CRITICAL') return r.status === 'CRITICAL' || r.status === 'OUT_OF_STOCK';
    if (filterUrgency === 'LOW') return r.status === 'LOW';
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={22} color="var(--warning)" />
            <h1>Smart Restock & Reorder Center</h1>
          </div>
          <p>
            An automatic helper that calculates how much stock to buy so you never run out of customer favorites.
          </p>
        </div>
      </div>

      {/* Logic Formula Explainer Card */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(19, 29, 49, 0.9))',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <HelpCircle size={18} color="#818cf8" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
            How the Smart Restock Helper Works (In Simple Terms)
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>1. Daily Customer Sales</strong>
            <code>Weekly Sales ÷ 7 Days</code><br />
            Counts how many units are sold on an average day.
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>2. Supplier Waiting Period</strong>
            <code>Daily Sales × Supplier Delivery Days</code><br />
            Units you will sell while the delivery truck is on its way.
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>3. Reorder Alert Trigger</strong>
            <code>Waiting Demand + Safety Buffer</code><br />
            When stock falls to this number, place an order right away!
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>4. Recommended Order Qty</strong>
            <code>(1 Month Needs) - Current Stock</code><br />
            Restocks enough items to safely last for the next 30 days.
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card accent-amber">
          <div className="kpi-card-content">
            <div className="kpi-label">Products to Reorder</div>
            <div className="kpi-value">{summary.totalItemsToReorder}</div>
            <div className="kpi-hint">Running low on stock</div>
          </div>
          <div className="kpi-icon-badge"><AlertTriangle size={22} /></div>
        </div>

        <div className="kpi-card accent-rose">
          <div className="kpi-card-content">
            <div className="kpi-label">Emergency / Zero Stock</div>
            <div className="kpi-value">{summary.criticalItemsCount}</div>
            <div className="kpi-hint">Requires immediate purchase</div>
          </div>
          <div className="kpi-icon-badge"><TrendingDown size={22} /></div>
        </div>

        <div className="kpi-card accent-purple">
          <div className="kpi-card-content">
            <div className="kpi-label">Total Units to Order</div>
            <div className="kpi-value">{summary.totalSuggestedUnits}</div>
            <div className="kpi-hint">Combined units across all items</div>
          </div>
          <div className="kpi-icon-badge"><Layers size={22} /></div>
        </div>

        <div className="kpi-card accent-emerald">
          <div className="kpi-card-content">
            <div className="kpi-label">Estimated Money Needed</div>
            <div className="kpi-value">{formatINR(summary.totalEstimatedCapital)}</div>
            <div className="kpi-hint">Total cost to buy all suggested stock</div>
          </div>
          <div className="kpi-icon-badge"><IndianRupee size={22} /></div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
          Ranked Replenishment Queue ({filtered.length})
        </div>

        <div className="filter-controls">
          <select
            className="select-control"
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
          >
            <option value="ALL">All Reorder Items ({recommendations.length})</option>
            <option value="CRITICAL">🚨 Critical / Stockouts Only ({summary.criticalItemsCount})</option>
            <option value="LOW">🟡 Low Stock ({summary.lowStockItemsCount})</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards */}
      {filtered.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px' }}>
          <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
            All Inventory Levels are Healthy!
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            No products currently satisfy reorder trigger conditions based on current sales velocity and supplier lead times.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((item, index) => (
            <div
              key={item.productId}
              className="panel"
              style={{
                borderLeft: `4px solid ${
                  item.status === 'OUT_OF_STOCK' || item.status === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)'
                }`,
                margin: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      SKU: <strong style={{ color: '#cbd5e1' }}>{item.sku}</strong> · Category: {item.category}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StockHealthBadge status={item.status} />
                  <span
                    className={`badge ${
                      item.urgencyLevel === 'CRITICAL' ? 'badge-danger' : 'badge-warning'
                    }`}
                  >
                    Priority Score: {item.urgencyScore}
                  </span>
                </div>
              </div>

              {/* Warning explanation banner */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK' ? '#fca5a5' : '#fde68a',
                  marginBottom: '16px'
                }}
              >
                {item.warningMessage}
              </div>

              {/* Calculation Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  backgroundColor: 'var(--bg-elevated)',
                  padding: '14px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}
              >
                <div className="metric-box">
                  <span className="metric-title">Current Stock</span>
                  <span className="metric-val" style={{ color: item.currentStock === 0 ? 'var(--danger)' : '#fff' }}>
                    {item.currentStock} units
                  </span>
                </div>

                <div className="metric-box">
                  <span className="metric-title">Weekly Sales</span>
                  <span className="metric-val">{item.weeklySales} units</span>
                </div>

                <div className="metric-box">
                  <span className="metric-title">Daily Velocity</span>
                  <span className="metric-val">{item.dailyVelocity} / day</span>
                </div>

                <div className="metric-box">
                  <span className="metric-title">Supplier Lead Time</span>
                  <span className="metric-val">{item.leadTimeDays} days</span>
                </div>

                <div className="metric-box">
                  <span className="metric-title">Reorder Point (ROP)</span>
                  <span className="metric-val" style={{ color: 'var(--warning)' }}>{item.reorderPoint} units</span>
                </div>

                <div className="metric-box">
                  <span className="metric-title">Days to Stockout</span>
                  <span
                    className="metric-val"
                    style={{ color: item.daysUntilStockout <= item.leadTimeDays ? 'var(--danger)' : '#fff' }}
                  >
                    {item.daysUntilStockout} days
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Supplier: <strong style={{ color: '#fff' }}>{item.supplier?.company || 'Unassigned'}</strong>
                  {item.supplier?.email && ` (${item.supplier.email})`}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>ORDER QTY:</span>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      style={{ width: '90px', padding: '6px 10px', textAlign: 'center', fontWeight: 700 }}
                      value={customQuantities[item.productId] ?? item.suggestedQuantity}
                      onChange={(e) =>
                        setCustomQuantities({
                          ...customQuantities,
                          [item.productId]: Number(e.target.value)
                        })
                      }
                    />
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc', minWidth: '100px' }}>
                    Cost: {formatINR((customQuantities[item.productId] ?? item.suggestedQuantity) * item.costPrice)}
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    disabled={creatingPOFor === item.productId || !item.supplier}
                    onClick={() => handleCreatePO(item)}
                  >
                    <ShoppingCart size={15} />
                    <span>{creatingPOFor === item.productId ? 'Generating PO...' : '1-Click Create PO'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

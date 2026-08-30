import { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  Plus,
  ArrowUpFromLine,
  ArrowDownToLine,
  Calendar,
  Layers,
  IndianRupee,
  ShieldAlert,
  Flame,
  Info,
  ExternalLink
} from 'lucide-react';
import api, { formatINR } from '../api/axiosClient';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function BatchTracker({ onAddToast }) {
  const [batches, setBatches] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Add Batch Form
  const [newBatch, setNewBatch] = useState({
    productId: '',
    batchNumber: '',
    quantity: 50,
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    location: 'Aisle 1 - Section A',
    notes: ''
  });

  // Oldest Stock Dispatch Form
  const [dispatchForm, setDispatchForm] = useState({
    productId: '',
    quantity: 10,
    reason: 'Sales Order Dispatch (Oldest Stock)',
    referenceNumber: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchRes, sumRes, prodRes] = await Promise.all([
        api.get(`/batches?status=${statusFilter}&urgency=${urgencyFilter}&search=${encodeURIComponent(searchQuery)}`),
        api.get('/batches/summary'),
        api.get('/products?all=true')
      ]);

      setBatches(batchRes.data.data || []);
      setSummaryData(sumRes.data.data || null);
      setProducts(prodRes.data.data || []);

      if (!newBatch.productId && prodRes.data.data?.length > 0) {
        setNewBatch((prev) => ({ ...prev, productId: prodRes.data.data[0]._id }));
        setDispatchForm((prev) => ({ ...prev, productId: prodRes.data.data[0]._id }));
      }
    } catch (err) {
      onAddToast?.('Failed to load batch data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [urgencyFilter, statusFilter, searchQuery]);

  // Generate an auto batch ID
  const generateBatchNumber = (prodName = '') => {
    const prefix = prodName ? prodName.slice(0, 3).toUpperCase() : 'BAT';
    const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
    const rand = Math.floor(100 + Math.random() * 900);
    return `BATCH-${prefix}-${dateStr}-${rand}`;
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/batches', newBatch);
      onAddToast?.(`Batch ${res.data.data.batchNumber} created successfully!`, 'success');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Failed to create batch.', 'error');
    }
  };

  const handleOldestStockDispatch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/batches/dispatch-fifo', dispatchForm);
      onAddToast?.(
        `Dispatch successful: ${res.data.data.dispatchedQuantity} units automatically allocated from earliest expiring batches!`,
        'success'
      );
      setShowDispatchModal(false);
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Stock dispatch failed.', 'error');
    }
  };

  // Helper to render Countdown Badge
  const renderCountdownBadge = (days) => {
    if (days === null || days === undefined) return <span className="badge badge-neutral">No Date</span>;
    if (days <= 0) {
      return (
        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800 }}>
          <XCircle size={12} />
          <span>EXPIRED ({Math.abs(days)}d ago)</span>
        </span>
      );
    }
    if (days <= 20) {
      return (
        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800 }}>
          <Flame size={12} />
          <span>Expires in {days} days (Sell First!)</span>
        </span>
      );
    }
    if (days <= 60) {
      return (
        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
          <Clock size={12} />
          <span>Expires in {days} days</span>
        </span>
      );
    }
    return (
      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <CheckCircle2 size={12} />
        <span>Expires in {days} days (Fresh)</span>
      </span>
    );
  };

  const summary = summaryData?.summary || {
    totalActiveBatches: 0,
    criticalCount: 0,
    warningCount: 0,
    healthyCount: 0,
    capitalAtRisk: 0
  };

  const priorityQueue = summaryData?.fifoPriorityQueue || [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={22} color="var(--warning)" />
            <h1>Expiry Date & Batch Tracker</h1>
          </div>
          <p>
            Track batch numbers, manufacturing dates, and countdowns. Automatically pick and sell oldest expiring stock first so goods never spoil.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setDispatchForm({
                productId: products[0]?._id || '',
                quantity: 10,
                reason: 'Customer Order Dispatch (Oldest Stock)',
                referenceNumber: 'SO-' + Math.floor(1000 + Math.random() * 9000)
              });
              setShowDispatchModal(true);
            }}
          >
            <ArrowUpFromLine size={16} color="#f43f5e" />
            <span>Dispatch Oldest Stock First</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const defaultProd = products[0];
              setNewBatch({
                productId: defaultProd?._id || '',
                batchNumber: generateBatchNumber(defaultProd?.name),
                quantity: 50,
                mfgDate: new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                location: defaultProd?.location || 'Aisle 1 - Section A',
                notes: 'Standard incoming batch shipment'
              });
              setShowAddModal(true);
            }}
          >
            <Plus size={16} />
            <span>Receive New Batch</span>
          </button>
        </div>
      </div>

      {/* Priority Dispatch Queue Banner */}
      {priorityQueue.length > 0 && (
        <div
          className="panel"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(19, 29, 49, 0.95))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            marginBottom: '20px'
          }}
        >
          <div className="panel-header" style={{ borderColor: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="panel-title" style={{ color: '#fbbf24' }}>
                <Flame size={20} color="#fbbf24" />
                <span>Priority Queue — Sell These Oldest Batches First!</span>
              </div>
              <div className="panel-desc">
                Sorted automatically by earliest expiration date. Pick from these specific shelves first to avoid product spoilage.
              </div>
            </div>
            <button
              className="btn btn-warning"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#0f172a',
                fontWeight: 800,
                border: '1px solid #b45309',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)',
                padding: '8px 16px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => {
                const target = priorityQueue[0];
                const matchedProd = products.find((p) => p.sku === target.sku);
                setDispatchForm({
                  productId: matchedProd?._id || products[0]?._id,
                  quantity: target.remainingQuantity,
                  reason: `Urgent Dispatch (${target.batchNumber})`,
                  referenceNumber: 'SO-EXPIRY-PRIORITY'
                });
                setShowDispatchModal(true);
              }}
            >
              <ArrowUpFromLine size={15} color="#0f172a" />
              <span>Dispatch Oldest Batch</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {priorityQueue.slice(0, 3).map((item, idx) => (
              <div
                key={item.batchId}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#f59e0b', color: '#000', borderRadius: '4px', padding: '1px 6px', fontWeight: 800, fontSize: '0.7rem' }}>
                      #{idx + 1} PICK
                    </span>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{item.productName}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Batch: {item.batchNumber} · Shelf: {item.location}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    {renderCountdownBadge(item.daysToExpiry)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Unsold Stock</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>
                    {item.remainingQuantity} <span style={{ fontSize: '0.75rem' }}>{item.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card accent-purple">
          <div className="kpi-card-content">
            <div className="kpi-label">Active Batches in Godown</div>
            <div className="kpi-value">{summary.totalActiveBatches}</div>
            <div className="kpi-hint">Batches with unsold stock</div>
          </div>
          <div className="kpi-icon-badge"><Layers size={22} /></div>
        </div>

        <div className="kpi-card accent-rose">
          <div className="kpi-card-content">
            <div className="kpi-label">🔴 Expiring in &lt; 20 Days</div>
            <div className="kpi-value">{summary.criticalCount}</div>
            <div className="kpi-hint">Must sell or dispatch today</div>
          </div>
          <div className="kpi-icon-badge"><Flame size={22} /></div>
        </div>

        <div className="kpi-card accent-amber">
          <div className="kpi-card-content">
            <div className="kpi-label">🟡 Expiring in 21–60 Days</div>
            <div className="kpi-value">{summary.warningCount}</div>
            <div className="kpi-hint">Priority to sell next</div>
          </div>
          <div className="kpi-icon-badge"><Clock size={22} /></div>
        </div>

        <div className="kpi-card accent-emerald">
          <div className="kpi-card-content">
            <div className="kpi-label">Capital at Expiry Risk</div>
            <div className="kpi-value">{formatINR(summary.capitalAtRisk)}</div>
            <div className="kpi-hint">Cost value of urgent batches</div>
          </div>
          <div className="kpi-icon-badge"><IndianRupee size={22} /></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Batch #, Product Name, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="select-control"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="ALL">All Expiry Windows</option>
            <option value="CRITICAL">🚨 Expiring Soon (&lt; 20 Days)</option>
            <option value="WARNING">🟡 Warning (21 to 60 Days)</option>
            <option value="HEALTHY">🟢 Fresh &amp; Safe (&gt; 60 Days)</option>
            <option value="EXPIRED">❌ Expired Batches</option>
          </select>

          <select
            className="select-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ACTIVE">Active Stock Batches</option>
            <option value="ALL">All (Including Depleted 0 Stock)</option>
            <option value="DEPLETED">Depleted (Sold Out)</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      {loading ? (
        <Loading message="Loading batches and calculating expiry countdowns..." />
      ) : batches.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px' }}>
          <Clock size={48} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
            No Batches Found
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Try adjusting your search or urgency filter, or click <strong>Receive New Batch</strong> above.
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Batch Number</th>
                <th>Product &amp; SKU</th>
                <th>Godown Shelf</th>
                <th>Stock (Remaining / Initial)</th>
                <th>Manufacturing Date</th>
                <th>Expiry Date</th>
                <th>Expiry Countdown</th>
                <th>Batch Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {b.batchNumber}
                    </div>
                    {b.notes && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{b.notes}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{b.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {b.sku}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {b.location || 'Aisle 1'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: b.remainingQuantity === 0 ? 'var(--text-dim)' : '#fff' }}>
                      {b.remainingQuantity} / {b.initialQuantity} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.unit}</span>
                    </div>
                    {/* Visual mini bar */}
                    <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.round((b.remainingQuantity / b.initialQuantity) * 100))}%`,
                          height: '100%',
                          background: b.daysToExpiry <= 20 ? '#ef4444' : '#10b981'
                        }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {new Date(b.mfgDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                      {new Date(b.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td>
                    {renderCountdownBadge(b.daysToExpiry)}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>
                      {formatINR(b.totalValue)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      @{formatINR(b.costPrice)}/unit
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Receive New Batch */}
      {showAddModal && (
        <Modal
          title="Receive New Product Batch"
          onClose={() => setShowAddModal(false)}
          size="md"
        >
          <form onSubmit={handleCreateBatch}>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Select Product *</label>
                <select
                  className="select-control"
                  required
                  value={newBatch.productId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    const p = products.find((x) => x._id === pId);
                    setNewBatch({
                      ...newBatch,
                      productId: pId,
                      batchNumber: generateBatchNumber(p?.name),
                      location: p?.location || 'Aisle 1 - Section A'
                    });
                  }}
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) — Current Stock: {p.stock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Number *</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newBatch.batchNumber}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const p = products.find((x) => x._id === newBatch.productId);
                      setNewBatch({ ...newBatch, batchNumber: generateBatchNumber(p?.name) });
                    }}
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Quantity (Units) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={newBatch.quantity}
                  onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Manufacturing Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={newBatch.mfgDate}
                  onChange={(e) => setNewBatch({ ...newBatch, mfgDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date (Best Before) *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={newBatch.expiryDate}
                  onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Warehouse Shelf / Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Aisle 1 - Section A"
                  value={newBatch.location}
                  onChange={(e) => setNewBatch({ ...newBatch, location: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Notes / Supplier Batch Memo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Fresh summer harvest, high aroma grade"
                  value={newBatch.notes}
                  onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save &amp; Add to Stock
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Smart Stock Dispatch (Oldest First) */}
      {showDispatchModal && (
        <Modal
          title="Smart Stock Dispatch (Oldest First)"
          onClose={() => setShowDispatchModal(false)}
          size="md"
        >
          <form onSubmit={handleOldestStockDispatch}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <Sparkles size={16} />
                <span>How Selling Oldest Stock First Protects Your Goods</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                You do not need to manually choose which batch to sell. The system will automatically deduct units starting from the <strong>earliest expiring batch first</strong>.
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Select Product to Dispatch *</label>
                <select
                  className="select-control"
                  required
                  value={dispatchForm.productId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, productId: e.target.value })}
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) — Available Stock: {p.stock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Dispatch *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={dispatchForm.quantity}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, quantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reference / Order #</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SO-8902"
                  value={dispatchForm.referenceNumber}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, referenceNumber: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Reason / Customer Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Local supermarket order fulfillment"
                  value={dispatchForm.reason}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, reason: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDispatchModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Dispatch (Oldest First)
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

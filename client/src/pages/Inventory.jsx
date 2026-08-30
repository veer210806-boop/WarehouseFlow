import { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Sliders,
  History,
  Search,
  Filter,
  Package,
  Layers
} from 'lucide-react';
import api from '../api/axiosClient';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function Inventory({ onAddToast }) {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'control' | 'ledger'
  const [activeTab, setActiveTab] = useState('control');

  // Ledger Filters
  const [logType, setLogType] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'IN' | 'OUT' | 'ADJUST'
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [newStockVal, setNewStockVal] = useState(0);
  const [reason, setReason] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [costPrice, setCostPrice] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, logRes] = await Promise.all([
        api.get('/products?all=true&sortBy=name&order=asc'),
        api.get(`/inventory/logs?type=${logType}&limit=100`)
      ]);
      setProducts(prodRes.data.data || []);
      setLogs(logRes.data.data || []);
    } catch (err) {
      onAddToast?.('Failed to load inventory data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [logType]);

  const handleStockIn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/in', {
        productId: selectedProductId,
        quantity: Number(quantity),
        reason: reason || 'Goods Received / Inward Shipment',
        referenceNumber: refNumber,
        costPrice: costPrice ? Number(costPrice) : undefined
      });
      onAddToast?.('Stock received successfully!', 'success');
      closeModal();
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Stock In failed.', 'error');
    }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/out', {
        productId: selectedProductId,
        quantity: Number(quantity),
        reason: reason || 'Sales Dispatch / Customer Fulfillment',
        referenceNumber: refNumber
      });
      onAddToast?.('Stock dispatched successfully!', 'success');
      closeModal();
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Stock Out failed.', 'error');
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjust', {
        productId: selectedProductId,
        newStock: Number(newStockVal),
        reason: reason || 'Physical Audit Cycle Count'
      });
      onAddToast?.('Stock level adjusted successfully!', 'success');
      closeModal();
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Stock adjustment failed.', 'error');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedProductId('');
    setQuantity(10);
    setNewStockVal(0);
    setReason('');
    setRefNumber('');
    setCostPrice('');
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  // Filter logs by search query
  const filteredLogs = logs.filter((log) => {
    if (!logSearch) return true;
    const q = logSearch.toLowerCase();
    return (
      log.productName?.toLowerCase().includes(q) ||
      log.sku?.toLowerCase().includes(q) ||
      log.referenceNumber?.toLowerCase().includes(q) ||
      log.reason?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Stock Management & Movements</h1>
          <p>Add new stock received from suppliers, record items sold or dispatched, and view full history.</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-success"
            onClick={() => {
              setSelectedProductId(products[0]?._id || '');
              setActiveModal('IN');
            }}
          >
            <ArrowDownToLine size={16} />
            <span>Receive Stock (Add)</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSelectedProductId(products[0]?._id || '');
              setActiveModal('OUT');
            }}
          >
            <ArrowUpFromLine size={16} color="#f43f5e" />
            <span>Dispatch Stock (Sell)</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const p = products[0];
              setSelectedProductId(p?._id || '');
              setNewStockVal(p?.stock || 0);
              setActiveModal('ADJUST');
            }}
          >
            <Sliders size={16} />
            <span>Correct Stock Count</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'control' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('control')}
        >
          <Layers size={15} />
          <span>📦 Current Stock Levels</span>
        </button>
        <button
          className={`btn ${activeTab === 'ledger' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('ledger')}
        >
          <History size={15} />
          <span>📋 Stock Movement History ({logs.length})</span>
        </button>
      </div>

      {loading ? (
        <Loading message="Loading inventory state..." />
      ) : activeTab === 'control' ? (
        /* Stock Control Table */
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Thresholds (Min/Safe)</th>
                <th>Storage Location</th>
                <th>Supplier</th>
                <th style={{ textAlign: 'right' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="product-cell">
                      <div className="product-avatar">{p.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="product-title">{p.name}</div>
                        <div className="product-sku">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{p.category}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: p.stock === 0 ? 'var(--danger)' : '#fff' }}>
                      {p.stock} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.unit || 'Units'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      Alert: <strong>{p.minStockAlert}</strong> | Safety: <strong>{p.safetyStock}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.location || 'Aisle 1'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{p.supplier?.company || 'Unassigned'}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedProductId(p._id);
                          setQuantity(20);
                          setActiveModal('IN');
                        }}
                      >
                        <ArrowDownToLine size={13} color="#10b981" />
                        <span>In</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedProductId(p._id);
                          setQuantity(5);
                          setActiveModal('OUT');
                        }}
                      >
                        <ArrowUpFromLine size={13} color="#f43f5e" />
                        <span>Out</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Inventory Audit Ledger */
        <div>
          <div className="filter-bar">
            <div className="search-input-group">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search audit trail by SKU, product, reference..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                className="select-control"
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
              >
                <option value="ALL">All Transaction Types</option>
                <option value="IN">📥 Stock Inward (IN)</option>
                <option value="OUT">📤 Stock Outward (OUT)</option>
                <option value="ADJUSTMENT">⚙️ Audit Adjustment</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Delta / Quantity</th>
                  <th>Stock Change</th>
                  <th>Reference / Reason</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      {log.type === 'IN' ? (
                        <span className="badge badge-success">INWARD</span>
                      ) : log.type === 'OUT' ? (
                        <span className="badge badge-danger">OUTWARD</span>
                      ) : (
                        <span className="badge badge-warning">ADJUST</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{log.productName}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {log.sku}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: log.type === 'IN' ? 'var(--success)' : log.type === 'OUT' ? 'var(--danger)' : 'var(--warning)'
                        }}
                      >
                        {log.type === 'IN' ? `+${log.quantity}` : log.type === 'OUT' ? `-${log.quantity}` : log.quantity}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-dim)' }}>{log.previousStock}</span>
                      <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>➔</span>
                      <strong style={{ color: '#fff' }}>{log.newStock}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{log.reason}</div>
                      {log.referenceNumber && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          Ref: {log.referenceNumber}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.user || 'System'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      {activeModal === 'IN' && (
        <Modal title="Stock In · Receive Inventory" onClose={closeModal}>
          <form onSubmit={handleStockIn}>
            <div className="form-group">
              <label className="form-label">Select Product *</label>
              <select
                required
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku}) — Current: {p.stock} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Inward Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Cost (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="e.g. 450"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PO or Delivery Reference #</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. PO-20260830-1004"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note / Receipt Details</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Received shipment in good condition at Dock 2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ margin: '0 -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                Confirm Stock In
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Out Modal */}
      {activeModal === 'OUT' && (
        <Modal title="Stock Out · Dispatch / Sales Issue" onClose={closeModal}>
          <form onSubmit={handleStockOut}>
            <div className="form-group">
              <label className="form-label">Select Product *</label>
              <select
                required
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku}) — Available: {p.stock} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dispatch Quantity *</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              {selectedProduct && (
                <div className="form-help">
                  Available in stock: <strong>{selectedProduct.stock}</strong> units
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Sales Order / Customer Reference</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SO-9055 / Client Delivery"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dispatch Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dispatched to client via Delhivery Express"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ margin: '0 -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger">
                Confirm Dispatch
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Adjustment Modal */}
      {activeModal === 'ADJUST' && (
        <Modal title="Adjust Stock Level · Physical Audit" onClose={closeModal}>
          <form onSubmit={handleAdjust}>
            <div className="form-group">
              <label className="form-label">Select Product *</label>
              <select
                required
                className="form-select"
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find((prod) => prod._id === e.target.value);
                  if (p) setNewStockVal(p.stock);
                }}
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku}) — Recorded: {p.stock}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">New Verified Stock Count *</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={newStockVal}
                onChange={(e) => setNewStockVal(e.target.value)}
              />
              {selectedProduct && (
                <div className="form-help">
                  Previously recorded: <strong>{selectedProduct.stock}</strong> units. Delta: <strong>{newStockVal - selectedProduct.stock}</strong>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Discrepancy / Adjustment *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Monthly Physical Warehouse Cycle Count Reconciliation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ margin: '0 -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Stock Count
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

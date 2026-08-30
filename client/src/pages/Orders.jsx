import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  ShoppingCart,
  CheckCircle,
  Truck,
  Eye,
  Trash2,
  Calendar,
  IndianRupee,
  FileText,
  Printer
} from 'lucide-react';
import api, { formatINR, formatINRWords } from '../api/axiosClient';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Loading from '../components/Loading';

export default function Orders({ onAddToast }) {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // New PO Form
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [poItems, setPoItems] = useState([
    { product: '', quantity: 20, unitCost: 0 }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderRes, suppRes, prodRes] = await Promise.all([
        api.get(`/orders?status=${statusFilter}&search=${encodeURIComponent(search)}`),
        api.get('/suppliers'),
        api.get('/products?all=true')
      ]);
      setOrders(orderRes.data.data || []);
      setSuppliers(suppRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      onAddToast?.('Failed to load purchase orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleAddItemRow = () => {
    setPoItems([...poItems, { product: '', quantity: 10, unitCost: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...poItems];
    updated[index][field] = value;

    // Auto fill cost price when product selected
    if (field === 'product') {
      const selectedProd = products.find((p) => p._id === value);
      if (selectedProd) {
        updated[index].unitCost = selectedProd.costPrice || 0;
      }
    }
    setPoItems(updated);
  };

  // Calculate live PO totals
  const subtotal = poItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
  }, 0);
  const taxAmount = subtotal * 0.18; // 18% GST
  const grandTotal = subtotal + taxAmount + Number(shippingCost || 0);

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      onAddToast?.('Please select a supplier.', 'error');
      return;
    }

    const validItems = poItems.filter((item) => item.product && Number(item.quantity) > 0);
    if (validItems.length === 0) {
      onAddToast?.('Please add at least one product item.', 'error');
      return;
    }

    try {
      const payload = {
        supplier: selectedSupplierId,
        items: validItems,
        notes: poNotes,
        shippingCost: Number(shippingCost || 0),
        taxRate: 0.18
      };

      const res = await api.post('/orders', payload);
      onAddToast?.(`Purchase Order ${res.data.data.poNumber} created successfully!`, 'success');
      setShowCreateModal(false);
      resetCreateForm();
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Failed to create PO.', 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      onAddToast?.(`PO status transitioned to "${newStatus}"!`, 'success');
      loadData();
      if (viewOrder && viewOrder._id === orderId) {
        const updated = await api.get(`/orders/${orderId}`);
        setViewOrder(updated.data.data);
      }
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Status update failed.', 'error');
    }
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Delete Purchase Order ${order.poNumber}?`)) return;
    try {
      await api.delete(`/orders/${order._id}`);
      onAddToast?.('Purchase Order deleted.', 'success');
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const resetCreateForm = () => {
    setSelectedSupplierId('');
    setPoNotes('');
    setShippingCost(0);
    setPoItems([{ product: '', quantity: 20, unitCost: 0 }]);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Purchase Orders</h1>
          <p>Create procurement orders, track shipping logistics, and automatically receive inventory on delivery.</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by PO Number (e.g. PO-202608)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="select-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered & Stocked</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <Loading message="Loading purchase orders..." />
      ) : orders.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '50px' }}>
          <ShoppingCart size={40} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>No purchase orders found.</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Generate a new PO manually or use 1-Click Smart Reorder suggestions.
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Items Ordered</th>
                <th>Order Value (₹)</th>
                <th>Status</th>
                <th>Expected Delivery</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {po.poNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Created: {new Date(po.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{po.supplier?.company || 'Unassigned'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{po.supplier?.name}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#a5b4fc' }}>
                      {po.items?.length || 0} line items
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {po.items?.reduce((s, i) => s + i.quantity, 0)} total units
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                      {formatINR(po.totalAmount)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Subtotal: {formatINR(po.subtotal)}
                    </div>
                  </td>
                  <td>
                    <Badge variant={po.status}>{po.status}</Badge>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {po.expectedDeliveryDate
                        ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="View PO Details"
                        onClick={() => setViewOrder(po)}
                      >
                        <Eye size={14} />
                      </button>

                      {po.status === 'PENDING' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Approve Order"
                          onClick={() => handleStatusChange(po._id, 'APPROVED')}
                        >
                          Approve
                        </button>
                      )}

                      {po.status === 'APPROVED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Mark In Transit"
                          onClick={() => handleStatusChange(po._id, 'IN_TRANSIT')}
                        >
                          <Truck size={14} color="#38bdf8" />
                          <span>Dispatch</span>
                        </button>
                      )}

                      {po.status === 'IN_TRANSIT' && (
                        <button
                          className="btn btn-success btn-sm"
                          title="Receive Goods into Warehouse"
                          onClick={() => handleStatusChange(po._id, 'DELIVERED')}
                        >
                          <CheckCircle size={14} />
                          <span>Receive Stock</span>
                        </button>
                      )}

                      {po.status !== 'DELIVERED' && (
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete PO"
                          onClick={() => handleDelete(po)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <Modal title="Create Purchase Order" onClose={() => setShowCreateModal(false)} size="lg">
          <form onSubmit={handleCreatePO}>
            <div className="form-group">
              <label className="form-label">Select Supplier *</label>
              <select
                required
                className="form-select"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
              >
                <option value="">-- Select Vendor --</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.company} ({s.leadTimeDays} days lead time)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="form-label" style={{ margin: 0 }}>Line Items *</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItemRow}>
                  <Plus size={13} />
                  <span>Add Line Item</span>
                </button>
              </div>

              {poItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '10px',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}
                >
                  <select
                    required
                    className="form-select"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.sku}) — Cost: ₹{p.costPrice}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="form-input"
                    placeholder="Unit Cost ₹"
                    value={item.unitCost}
                    onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={poItems.length === 1}
                    onClick={() => handleRemoveItemRow(index)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Shipping / Freight Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Order Notes / Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Expedited air shipment requested"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Calculations Summary Card */}
            {(() => {
              const activeSupp = suppliers.find(s => s._id === selectedSupplierId);
              const isIntra = activeSupp?.stateCode === '27' || (!activeSupp?.stateCode && activeSupp?.state === 'Maharashtra');
              const cgst = isIntra ? taxAmount / 2 : 0;
              const sgst = isIntra ? taxAmount / 2 : 0;
              const igst = isIntra ? 0 : taxAmount;

              return (
                <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Taxable Subtotal:</span>
                    <strong style={{ color: '#fff' }}>{formatINR(subtotal)}</strong>
                  </div>
                  {isIntra ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>CGST (9% Intra-State):</span>
                        <strong style={{ color: '#38bdf8' }}>{formatINR(cgst)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>SGST (9% Intra-State):</span>
                        <strong style={{ color: '#38bdf8' }}>{formatINR(sgst)}</strong>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>IGST (18% Inter-State):</span>
                      <strong style={{ color: '#a5b4fc' }}>{formatINR(igst)}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shipping / Freight:</span>
                    <strong style={{ color: '#fff' }}>{formatINR(shippingCost)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-medium)', fontSize: '1.1rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Total Payable (₹ INR):</span>
                    <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatINR(grandTotal)}</strong>
                  </div>
                </div>
              );
            })()}

            <div className="modal-footer" style={{ margin: '0 -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Issue Purchase Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View PO Invoice / Printable Modal */}
      {viewOrder && (
        <Modal title={`Tax Invoice & Purchase Order · ${viewOrder.poNumber}`} onClose={() => setViewOrder(null)} size="lg">
          <div className="invoice-view" style={{ background: '#ffffff', color: '#1e293b', padding: '24px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #0f172a', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>WAREHOUSEFLOW INDIA</h2>
                <p style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Central Logistics & Inventory Fulfillment Hub</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Bhiwandi Logistics Hub, Building C-4, Thane, Maharashtra - 421302</p>
                <p style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: '2px' }}>
                  <strong>GSTIN:</strong> 27AAACW8899F1Z4 &nbsp;|&nbsp; <strong>State:</strong> 27 - Maharashtra
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                  TAX INVOICE & PURCHASE ORDER
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>{viewOrder.poNumber}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {new Date(viewOrder.createdAt).toLocaleDateString('en-IN')}</p>
                {viewOrder.ewayBillNo && (
                  <div style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 700, color: '#0f172a', display: 'inline-block' }}>
                    E-Way Bill: {viewOrder.ewayBillNo}
                  </div>
                )}
                <div style={{ marginTop: '6px' }}>
                  <Badge variant={viewOrder.status}>{viewOrder.status}</Badge>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px', background: '#f8fafc', padding: '14px', borderRadius: '6px' }}>
              <div>
                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                  SUPPLIER / VENDOR DETAILS (BILLED FROM)
                </strong>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {viewOrder.supplier?.company}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>Attn: {viewOrder.supplier?.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>{viewOrder.supplier?.email} · {viewOrder.supplier?.phone}</div>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>{viewOrder.supplier?.address}</div>
                {viewOrder.supplier?.gstin && (
                  <div style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: '4px' }}>
                    <strong>GSTIN:</strong> {viewOrder.supplier.gstin} &nbsp;|&nbsp; <strong>State:</strong> {viewOrder.supplier.state || 'Maharashtra'} ({viewOrder.supplier.stateCode || '27'})
                  </div>
                )}
              </div>

              <div>
                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                  DISPATCH & LOGISTICS INFO
                </strong>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                  Place of Supply: <strong>{viewOrder.placeOfSupply || 'Maharashtra (27)'}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
                  Expected Delivery: <strong>{new Date(viewOrder.expectedDeliveryDate).toLocaleDateString('en-IN')}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
                  Payment Terms: <strong>{viewOrder.supplier?.paymentTerms || 'Net 30'}</strong>
                </div>
                {viewOrder.deliveredAt && (
                  <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                    Delivered & Inward Stocked: {new Date(viewOrder.deliveredAt).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            <table className="custom-table" style={{ marginBottom: '16px', background: '#fff', color: '#0f172a' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>#</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>SKU & Description</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>HSN / SAC</th>
                  <th style={{ textAlign: 'center', color: '#0f172a', fontWeight: 700 }}>Qty</th>
                  <th style={{ textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>Rate (₹)</th>
                  <th style={{ textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>Taxable Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                {viewOrder.items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}>
                        {item.hsnCode || 'HSN 8479'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                      {item.quantity} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.unit || 'Pcs'}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatINR(item.unitCost)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatINR(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* GST Summary & Amounts in Words */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '16px', alignItems: 'start' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Amount Chargeable (in words):
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', fontStyle: 'italic' }}>
                  {formatINRWords(viewOrder.totalAmount)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px', lineHeight: 1.4 }}>
                  <strong>Declaration:</strong> We declare that this invoice/PO shows the actual price of the goods described and that all particulars are true and correct under Indian GST Law.
                </div>
              </div>

              <div style={{ fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#475569' }}>
                  <span>Taxable Subtotal:</span>
                  <strong style={{ color: '#0f172a' }}>{formatINR(viewOrder.subtotal)}</strong>
                </div>

                {viewOrder.gstType === 'INTRA_STATE' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#475569' }}>
                      <span>CGST (9%):</span>
                      <strong style={{ color: '#0f172a' }}>{formatINR(viewOrder.cgstAmount || (viewOrder.taxAmount / 2))}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#475569' }}>
                      <span>SGST (9%):</span>
                      <strong style={{ color: '#0f172a' }}>{formatINR(viewOrder.sgstAmount || (viewOrder.taxAmount / 2))}</strong>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#475569' }}>
                    <span>IGST (18% Inter-State):</span>
                    <strong style={{ color: '#0f172a' }}>{formatINR(viewOrder.igstAmount || viewOrder.taxAmount)}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#475569' }}>
                  <span>Shipping & Freight:</span>
                  <strong style={{ color: '#0f172a' }}>{formatINR(viewOrder.shippingCost || 0)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '2px solid #0f172a', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  <span>Total Amount (₹):</span>
                  <span style={{ color: '#4f46e5' }}>{formatINR(viewOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={15} />
              <span>Print Formal GST Invoice</span>
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setViewOrder(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

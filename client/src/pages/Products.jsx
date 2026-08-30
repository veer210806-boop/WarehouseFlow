import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ArrowUpDown
} from 'lucide-react';
import api, { formatINR } from '../api/axiosClient';
import Modal from '../components/Modal';
import StockHealthBadge from '../components/StockHealthBadge';
import Loading from '../components/Loading';

export default function Products({ onAddToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [healthStatus, setHealthStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [quickStockModal, setQuickStockModal] = useState(null); // { product, type: 'IN' | 'OUT' }
  const [stockQty, setStockQty] = useState(10);
  const [stockReason, setStockReason] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'General',
    hsnCode: 'HSN 8479',
    gstRate: 18,
    costPrice: '',
    sellingPrice: '',
    stock: 0,
    minStockAlert: 15,
    safetyStock: 5,
    weeklySales: 10,
    supplier: '',
    unit: 'Pieces',
    location: 'Aisle 1'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, suppRes, catRes] = await Promise.all([
        api.get(`/products?search=${encodeURIComponent(search)}&category=${category}&healthStatus=${healthStatus}&sortBy=${sortBy}&order=${order}&all=true`),
        api.get('/suppliers'),
        api.get('/products/meta/categories')
      ]);

      setProducts(prodRes.data.data || []);
      setSuppliers(suppRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      onAddToast?.('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, category, healthStatus, sortBy, order]);

  // Handle Form Submit (Add/Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
        onAddToast?.(`Product "${formData.name}" updated successfully!`, 'success');
      } else {
        await api.post('/products', formData);
        onAddToast?.(`Product "${formData.name}" created successfully!`, 'success');
      }
      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Failed to save product.', 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete product "${product.name}" (${product.sku})?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      onAddToast?.('Product deleted successfully.', 'success');
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Failed to delete product.', 'error');
    }
  };

  const handleQuickStock = async (e) => {
    e.preventDefault();
    if (!quickStockModal) return;

    try {
      const endpoint = quickStockModal.type === 'IN' ? '/inventory/in' : '/inventory/out';
      await api.post(endpoint, {
        productId: quickStockModal.product._id,
        quantity: Number(stockQty),
        reason: stockReason || (quickStockModal.type === 'IN' ? 'Quick Stock In Receipt' : 'Quick Sales Dispatch')
      });

      onAddToast?.(
        `Successfully ${quickStockModal.type === 'IN' ? 'received' : 'dispatched'} ${stockQty} units of ${quickStockModal.product.name}!`,
        'success'
      );
      setQuickStockModal(null);
      setStockQty(10);
      setStockReason('');
      loadData();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Inventory update failed.', 'error');
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      hsnCode: product.hsnCode || 'HSN 8479',
      gstRate: product.gstRate !== undefined ? product.gstRate : 18,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStockAlert: product.minStockAlert,
      safetyStock: product.safetyStock,
      weeklySales: product.weeklySales,
      supplier: product.supplier?._id || product.supplier || '',
      unit: product.unit || 'Pieces',
      location: product.location || 'Aisle 1'
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      category: 'General',
      hsnCode: 'HSN 8479',
      gstRate: 18,
      costPrice: '',
      sellingPrice: '',
      stock: 0,
      minStockAlert: 15,
      safetyStock: 5,
      weeklySales: 10,
      supplier: '',
      unit: 'Pieces',
      location: 'Aisle 1'
    });
  };

  // Export to CSV with HSN & GST details
  const exportCSV = () => {
    const headers = ['SKU', 'HSN Code', 'Name', 'Category', 'GST Rate (%)', 'Cost Price (INR)', 'Selling Price (INR)', 'Stock', 'Unit', 'Weekly Sales', 'Location'];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.hsnCode || 'HSN 8479'}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      p.gstRate || 18,
      p.costPrice,
      p.sellingPrice,
      p.stock,
      `"${p.unit || 'Pieces'}"`,
      p.weeklySales,
      `"${p.location || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Warehouse_Catalog_India_GST_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Product Catalog</h1>
          <p>Manage your products, set buying and selling prices, check stock levels, and assign warehouse shelf locations.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={16} />
            <span>Add New Product</span>
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
            placeholder="Search by SKU, Product name, or Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="select-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={healthStatus}
            onChange={(e) => setHealthStatus(e.target.value)}
          >
            <option value="ALL">All Stock Health</option>
            <option value="HEALTHY">🟢 Healthy</option>
            <option value="LOW">🟡 Low Stock</option>
            <option value="CRITICAL">🔴 Critical Risk</option>
            <option value="OUT_OF_STOCK">⚫ Out of Stock</option>
          </select>

          <select
            className="select-control"
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-');
              setSortBy(f);
              setOrder(o);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
            <option value="weeklySales-desc">Sales Velocity (Highest)</option>
            <option value="sellingPrice-asc">Price: Low to High</option>
            <option value="sellingPrice-desc">Price: High to Low</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <Loading message="Loading product catalog..." />
      ) : products.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '50px' }}>
          <Boxes size={40} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>No products match your criteria.</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Try adjusting your search query or active filters.
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>HSN Code</th>
                <th>Category</th>
                <th>Cost / Selling (₹)</th>
                <th>Stock Level</th>
                <th>Weekly Velocity</th>
                <th>Health Status</th>
                <th>Supplier</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
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
                        <div className="product-sku">{p.sku} · {p.location || 'Aisle 1'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                      {p.hsnCode || 'HSN 8479'}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      GST: {p.gstRate || 18}%
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{p.category}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{formatINR(p.sellingPrice)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cost: {formatINR(p.costPrice)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: p.stock === 0 ? 'var(--danger)' : '#fff' }}>
                      {p.stock} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.unit || 'Units'}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Min: {p.minStockAlert} | Safe: {p.safetyStock}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#a5b4fc' }}>{p.weeklySales} units/wk</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {(p.weeklySales / 7).toFixed(1)} / day
                    </div>
                  </td>
                  <td>
                    <StockHealthBadge
                      status={p.healthStatus}
                      stock={p.stock}
                      minAlert={p.minStockAlert}
                      safetyStock={p.safetyStock}
                    />
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {p.supplier?.company || p.supplier?.name || 'Unassigned'}
                    </div>
                    {p.supplier?.leadTimeDays && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        Lead time: {p.supplier.leadTimeDays} days
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Quick Stock In"
                        onClick={() => {
                          setQuickStockModal({ product: p, type: 'IN' });
                          setStockQty(20);
                        }}
                      >
                        <ArrowDownToLine size={14} color="#10b981" />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Quick Stock Out"
                        onClick={() => {
                          setQuickStockModal({ product: p, type: 'OUT' });
                          setStockQty(5);
                        }}
                      >
                        <ArrowUpFromLine size={14} color="#f43f5e" />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Edit Product"
                        onClick={() => openEdit(p)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Delete Product"
                        onClick={() => handleDeleteProduct(p)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <Modal
          title={editingProduct ? `Edit Product · ${editingProduct.sku}` : 'Add New Warehouse Product'}
          onClose={() => setShowAddModal(false)}
          size="lg"
        >
          <form onSubmit={handleSaveProduct}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">SKU / Product Code *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. FAS-M8-HEX"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. M8 Stainless Steel Hex Bolts"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">HSN / SAC Code *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. HSN 7318, HSN 8544"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Rate (%) *</label>
                <select
                  className="form-select"
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                >
                  <option value={0}>0% GST (Exempt)</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST (Standard)</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Fasteners, Electronics, Tools"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure (UOM)</label>
                <select
                  className="form-select"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="Pieces">Pieces (Pcs)</option>
                  <option value="Boxes">Boxes (Bxs)</option>
                  <option value="Packs">Packs (Pks)</option>
                  <option value="Bags">Bags (Bgs)</option>
                  <option value="Kilograms (Kg)">Kilograms (Kg)</option>
                  <option value="Quintal (Qtl)">Quintal (Qtl)</option>
                  <option value="Metric Tonnes (MT)">Metric Tonnes (MT)</option>
                  <option value="Litres (L)">Litres (L)</option>
                  <option value="Meters (m)">Meters (m)</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Sets">Sets</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Cost Price (₹ INR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="form-input"
                  placeholder="e.g. 450"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price (₹ INR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="form-input"
                  placeholder="e.g. 700"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Current Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="form-input"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Average Weekly Sales (Velocity)</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="form-input"
                  placeholder="e.g. 20"
                  value={formData.weeklySales}
                  onChange={(e) => setFormData({ ...formData, weeklySales: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.minStockAlert}
                  onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Critical Safety Stock Level</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.safetyStock}
                  onChange={(e) => setFormData({ ...formData, safetyStock: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Assigned Supplier</label>
                <select
                  className="form-select"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.company} ({s.leadTimeDays}d lead time)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Storage Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Aisle 2 - Rack B-04"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '0 -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Stock Modal */}
      {quickStockModal && (
        <Modal
          title={`${quickStockModal.type === 'IN' ? 'Stock In (Receive)' : 'Stock Out (Dispatch)'} · ${quickStockModal.product.name}`}
          onClose={() => setQuickStockModal(null)}
        >
          <form onSubmit={handleQuickStock}>
            <div className="form-group">
              <label className="form-label">Quantity ({quickStockModal.product.unit || 'Units'}) *</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
              />
              <div className="form-help">
                Current Stock: <strong>{quickStockModal.product.stock}</strong> units
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Reference Note</label>
              <input
                type="text"
                className="form-input"
                placeholder={quickStockModal.type === 'IN' ? 'e.g. Vendor Inward Invoice #402' : 'e.g. Sales Dispatch Order #902'}
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ margin: '0 -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setQuickStockModal(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${quickStockModal.type === 'IN' ? 'btn-success' : 'btn-danger'}`}
              >
                {quickStockModal.type === 'IN' ? 'Confirm Stock In' : 'Confirm Dispatch'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

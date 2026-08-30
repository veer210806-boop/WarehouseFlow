import { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Package,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Info,
  Warehouse,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { formatINR } from '../api/axiosClient';
import Modal from '../components/Modal';
import StockHealthBadge from '../components/StockHealthBadge';
import Loading from '../components/Loading';

// Warehouse Standard Layout Map Schema
const WAREHOUSE_LAYOUT = [
  {
    aisleId: 'AISLE-1',
    aisleName: 'Aisle 1',
    category: 'Groceries & Foods',
    description: 'Fast-Moving Consumer Goods & Food Grains',
    color: '#10b981',
    shelves: [
      { id: 'Aisle 1 - Section A', name: 'Section A', code: 'A1-SEC-A', capacity: 150 },
      { id: 'Aisle 1 - Section B', name: 'Section B', code: 'A1-SEC-B', capacity: 100 },
      { id: 'Aisle 1 - Section C', name: 'Section C', code: 'A1-SEC-C', capacity: 120 },
      { id: 'Aisle 1 - Section D', name: 'Section D (Reserve)', code: 'A1-SEC-D', capacity: 100 }
    ]
  },
  {
    aisleId: 'AISLE-2',
    aisleName: 'Aisle 2',
    category: 'Home & Hardware',
    description: 'Kitchenware, Locks & General Hardware Tools',
    color: '#f59e0b',
    shelves: [
      { id: 'Aisle 2 - Shelf A-04', name: 'Shelf A-04', code: 'A2-SH-A04', capacity: 80 },
      { id: 'Aisle 2 - Shelf B-01', name: 'Shelf B-01', code: 'A2-SH-B01', capacity: 80 },
      { id: 'Aisle 2 - Shelf B-02', name: 'Shelf B-02 (Reserve)', code: 'A2-SH-B02', capacity: 80 }
    ]
  },
  {
    aisleId: 'AISLE-3',
    aisleName: 'Aisle 3',
    category: 'Electronics & Electricals',
    description: 'Cables, Lighting Bulbs & Mobile Accessories',
    color: '#6366f1',
    shelves: [
      { id: 'Aisle 3 - Shelf E-05', name: 'Shelf E-05', code: 'A3-SH-E05', capacity: 60 },
      { id: 'Aisle 3 - Shelf E-12', name: 'Shelf E-12', code: 'A3-SH-E12', capacity: 60 },
      { id: 'Aisle 3 - Shelf E-18', name: 'Shelf E-18 (Reserve)', code: 'A3-SH-E18', capacity: 60 }
    ]
  },
  {
    aisleId: 'AISLE-4',
    aisleName: 'Aisle 4',
    category: 'Stationery & Office',
    description: 'Books, Note Pads, Pens & Office Supplies',
    color: '#ec4899',
    shelves: [
      { id: 'Aisle 4 - Shelf D-02', name: 'Shelf D-02', code: 'A4-SH-D02', capacity: 150 },
      { id: 'Aisle 4 - Shelf D-06', name: 'Shelf D-06', code: 'A4-SH-D06', capacity: 100 },
      { id: 'Aisle 4 - Shelf D-10', name: 'Shelf D-10 (Reserve)', code: 'A4-SH-D10', capacity: 100 }
    ]
  },
  {
    aisleId: 'AISLE-5',
    aisleName: 'Aisle 5',
    category: 'Packaging & Bulk Storage',
    description: 'Shipping Cartons, Bubble Wrap Rolls & Pallet Stacking',
    color: '#38bdf8',
    shelves: [
      { id: 'Aisle 5 - Pallet Zone', name: 'Pallet Zone', code: 'A5-PLT-01', capacity: 200 },
      { id: 'Aisle 5 - Rack C', name: 'Rack C', code: 'A5-RK-C', capacity: 50 },
      { id: 'Aisle 5 - Rack D', name: 'Rack D (Reserve)', code: 'A5-RK-D', capacity: 50 }
    ]
  }
];

export default function WarehouseMap({ onAddToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedHealth, setSelectedHealth] = useState('ALL');

  // Selected Shelf for Drawer/Modal Inspector
  const [selectedShelf, setSelectedShelf] = useState(null);

  // Quick Stock Action inside Shelf Modal
  const [quickStockAction, setQuickStockAction] = useState(null); // { product, type: 'IN' | 'OUT' }
  const [quickQty, setQuickQty] = useState(10);
  const [quickReason, setQuickReason] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products?all=true');
      setProducts(res.data.data || []);
    } catch (err) {
      onAddToast?.('Failed to load warehouse inventory map.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Map products to their physical shelf locations
  const shelfDataMap = useMemo(() => {
    const map = {};

    // Initialize all shelves
    WAREHOUSE_LAYOUT.forEach((aisle) => {
      aisle.shelves.forEach((shelf) => {
        map[shelf.id] = {
          ...shelf,
          aisleId: aisle.aisleId,
          aisleName: aisle.aisleName,
          category: aisle.category,
          products: [],
          totalUnits: 0,
          status: 'empty' // 'healthy' | 'low' | 'critical' | 'empty'
        };
      });
    });

    // Populate products
    products.forEach((p) => {
      const loc = p.location || '';
      // Find matching shelf
      let targetShelfId = Object.keys(map).find(
        (key) => loc.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(loc.toLowerCase())
      );

      if (!targetShelfId) {
        targetShelfId = 'Aisle 1 - Section A';
      }

      if (map[targetShelfId]) {
        map[targetShelfId].products.push(p);
        map[targetShelfId].totalUnits += Number(p.stock || 0);
      }
    });

    // Compute health status for each shelf
    Object.values(map).forEach((shelf) => {
      if (shelf.products.length === 0) {
        shelf.status = 'empty';
      } else {
        const hasOutOfStock = shelf.products.some((p) => Number(p.stock) === 0);
        const hasCritical = shelf.products.some((p) => Number(p.stock) <= Number(p.safetyStock || 5));
        const hasLow = shelf.products.some((p) => Number(p.stock) <= Number(p.minStockAlert || 15));

        if (hasOutOfStock || hasCritical) {
          shelf.status = 'critical';
        } else if (hasLow) {
          shelf.status = 'low';
        } else {
          shelf.status = 'healthy';
        }
      }
    });

    return map;
  }, [products]);

  // Search Beacon Matcher (find shelf matching the searched product)
  const beaconMatchedShelfIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();

    const matchedShelves = new Set();
    Object.values(shelfDataMap).forEach((shelf) => {
      const match = shelf.products.some(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.hsnCode && p.hsnCode.toLowerCase().includes(q))
      );
      if (match || shelf.name.toLowerCase().includes(q) || shelf.id.toLowerCase().includes(q)) {
        matchedShelves.add(shelf.id);
      }
    });

    return Array.from(matchedShelves);
  }, [searchQuery, shelfDataMap]);

  // Calculate Overall Warehouse Floor Statistics
  const stats = useMemo(() => {
    const allShelves = Object.values(shelfDataMap);
    const totalShelves = allShelves.length;
    const healthyCount = allShelves.filter((s) => s.status === 'healthy').length;
    const lowCount = allShelves.filter((s) => s.status === 'low').length;
    const criticalCount = allShelves.filter((s) => s.status === 'critical').length;
    const emptyCount = allShelves.filter((s) => s.status === 'empty').length;
    const totalStoredUnits = allShelves.reduce((sum, s) => sum + s.totalUnits, 0);

    return {
      totalShelves,
      healthyCount,
      lowCount,
      criticalCount,
      emptyCount,
      totalStoredUnits,
      occupiedShelves: totalShelves - emptyCount
    };
  }, [shelfDataMap]);

  // Handle Quick Stock In / Out directly from shelf view
  const handleExecuteQuickStock = async (e) => {
    e.preventDefault();
    if (!quickStockAction) return;

    try {
      const endpoint = quickStockAction.type === 'IN' ? '/inventory/in' : '/inventory/out';
      await api.post(endpoint, {
        productId: quickStockAction.product._id,
        quantity: Number(quickQty),
        reason: quickReason || (quickStockAction.type === 'IN' ? 'Map Quick Stock In' : 'Map Quick Dispatch')
      });

      onAddToast?.(
        `Successfully ${quickStockAction.type === 'IN' ? 'received' : 'dispatched'} ${quickQty} units of ${quickStockAction.product.name}!`,
        'success'
      );

      setQuickStockAction(null);
      setQuickQty(10);
      setQuickReason('');

      // Reload products to update map colors
      const res = await api.get('/products?all=true');
      setProducts(res.data.data || []);

      // Refresh currently open shelf modal
      if (selectedShelf) {
        setSelectedShelf((prev) => ({
          ...prev,
          products: res.data.data.filter((p) => p.location === prev.id)
        }));
      }
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Inventory update failed.', 'error');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Warehouse size={22} color="var(--primary)" />
            <h1>Interactive 2D Warehouse Map (Godown Floor Plan)</h1>
          </div>
          <p>
            Visual floor map showing storage aisles and shelves. Color-coded in real-time to instantly pinpoint stockouts, low inventory, and product locations.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/inventory" className="btn btn-secondary">
            <Package size={16} />
            <span>Stock Ledger</span>
          </Link>
          <Link to="/reorder" className="btn btn-primary">
            <Sparkles size={16} />
            <span>Restock Helper</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="kpi-grid">
        <div className="kpi-card accent-purple">
          <div className="kpi-card-content">
            <div className="kpi-label">Total Storage Shelves</div>
            <div className="kpi-value">{stats.totalShelves}</div>
            <div className="kpi-hint">{stats.occupiedShelves} occupied with products</div>
          </div>
          <div className="kpi-icon-badge"><Layers size={22} /></div>
        </div>

        <div className="kpi-card accent-emerald">
          <div className="kpi-card-content">
            <div className="kpi-label">🟢 Full / Healthy Shelves</div>
            <div className="kpi-value">{stats.healthyCount}</div>
            <div className="kpi-hint">Adequate stock buffer</div>
          </div>
          <div className="kpi-icon-badge"><CheckCircle2 size={22} /></div>
        </div>

        <div className="kpi-card accent-amber">
          <div className="kpi-card-content">
            <div className="kpi-label">🟡 Low Stock Shelves</div>
            <div className="kpi-value">{stats.lowCount}</div>
            <div className="kpi-hint">Needs reorder soon</div>
          </div>
          <div className="kpi-icon-badge"><AlertTriangle size={22} /></div>
        </div>

        <div className="kpi-card accent-rose">
          <div className="kpi-card-content">
            <div className="kpi-label">🔴 Out of Stock / Critical</div>
            <div className="kpi-value">{stats.criticalCount}</div>
            <div className="kpi-hint">Zero stock or critical buffer</div>
          </div>
          <div className="kpi-icon-badge"><XCircle size={22} /></div>
        </div>
      </div>

      {/* Filter and Product Finder Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Type product name or SKU to locate its shelf (e.g. 'Basmati Rice', 'Havells LED', 'boAt Cable')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="select-control"
            value={selectedHealth}
            onChange={(e) => setSelectedHealth(e.target.value)}
          >
            <option value="ALL">All Shelf Statuses</option>
            <option value="healthy">🟢 Healthy Shelves Only</option>
            <option value="low">🟡 Low Stock Shelves Only</option>
            <option value="critical">🔴 Critical / Out of Stock</option>
            <option value="empty">⚪ Empty Available Bays</option>
          </select>

          {searchQuery && (
            <button className="btn btn-secondary btn-sm" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Color Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div className="map-legend">
          <span style={{ fontWeight: 700, color: '#fff', marginRight: '6px' }}>Map Key:</span>
          <div className="legend-item">
            <span className="shelf-dot healthy"></span>
            <span>🟢 Full Stock</span>
          </div>
          <div className="legend-item">
            <span className="shelf-dot low"></span>
            <span>🟡 Low Stock (Order Soon)</span>
          </div>
          <div className="legend-item">
            <span className="shelf-dot critical"></span>
            <span>🔴 Empty / Critical (0 Left)</span>
          </div>
          <div className="legend-item">
            <span className="shelf-dot empty"></span>
            <span>⚪ Empty Storage Slot</span>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          💡 <em>Click any shelf on the floor plan to see all products stored inside it.</em>
        </div>
      </div>

      {/* 2D Interactive Godown Floor Plan Blueprint */}
      {loading ? (
        <Loading message="Rendering 2D warehouse map..." />
      ) : (
        <div className="map-container">
          <div className="map-blueprint-grid">
            {/* Inward Loading Gate */}
            <div className="dock-zone dock-inward">
              <div className="dock-title" style={{ color: '#10b981' }}>
                <Truck size={18} />
                <span>GATE 1 — INWARD GOODS RECEIVING DOCK (UNLOADING BAY)</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                INWARD LOGISTICS
              </span>
            </div>

            {/* Aisles & Racks Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {WAREHOUSE_LAYOUT.map((aisle) => {
                // Filter shelves based on selected health
                const visibleShelves = aisle.shelves.filter((shelf) => {
                  const data = shelfDataMap[shelf.id];
                  if (selectedHealth !== 'ALL' && data.status !== selectedHealth) {
                    return false;
                  }
                  return true;
                });

                if (visibleShelves.length === 0 && selectedHealth !== 'ALL') {
                  return null;
                }

                return (
                  <div key={aisle.aisleId} className="aisle-row">
                    {/* Aisle Left Tag */}
                    <div className="aisle-label-tag" style={{ borderLeftColor: aisle.color }}>
                      <div className="aisle-name">{aisle.aisleName}</div>
                      <div className="aisle-category">{aisle.category.split(' ')[0]}</div>
                    </div>

                    {/* Shelves on this Aisle */}
                    <div className="shelves-grid">
                      {aisle.shelves.map((shelf) => {
                        const data = shelfDataMap[shelf.id] || {
                          products: [],
                          totalUnits: 0,
                          status: 'empty'
                        };

                        const isBeaconActive = beaconMatchedShelfIds.includes(shelf.id);
                        const isDimmed =
                          selectedHealth !== 'ALL' && data.status !== selectedHealth;

                        if (isDimmed) return null;

                        return (
                          <div
                            key={shelf.id}
                            className={`shelf-card ${data.status} ${isBeaconActive ? 'beacon-active' : ''}`}
                            onClick={() => setSelectedShelf(data)}
                            title={`Click to inspect ${shelf.id}`}
                          >
                            <div className="shelf-header">
                              <span className="shelf-code">{shelf.name}</span>
                              <span className={`shelf-dot ${data.status}`}></span>
                            </div>

                            {data.products.length > 0 ? (
                              <div>
                                <div className="shelf-product-preview" title={data.products[0].name}>
                                  {data.products[0].name}
                                  {data.products.length > 1 && ` (+${data.products.length - 1} more)`}
                                </div>
                                <div className="shelf-meta">
                                  <span>{data.totalUnits} {data.products[0].unit || 'Units'}</span>
                                  <span style={{ textTransform: 'capitalize', fontWeight: 700, color: data.status === 'healthy' ? '#10b981' : data.status === 'low' ? '#f59e0b' : '#ef4444' }}>
                                    {data.status === 'healthy' ? 'Full' : data.status === 'low' ? 'Low' : 'Empty / Alert'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', margin: '4px 0 8px' }}>
                                  Available Bay
                                </div>
                                <div className="shelf-meta">
                                  <span>0 Units</span>
                                  <span>Ready</span>
                                </div>
                              </div>
                            )}

                            {isBeaconActive && (
                              <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.65rem', background: '#0284c7', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                                MATCHED
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Outward Dispatch Gate */}
            <div className="dock-zone dock-outward">
              <div className="dock-title" style={{ color: '#38bdf8' }}>
                <Truck size={18} />
                <span>GATE 2 — OUTWARD SALES DISPATCH & PACKING BAY</span>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                OUTBOUND LOGISTICS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Shelf Products Inspector Modal */}
      {selectedShelf && (
        <Modal
          title={`Shelf Details · ${selectedShelf.id}`}
          onClose={() => {
            setSelectedShelf(null);
            setQuickStockAction(null);
          }}
          size="lg"
        >
          <div>
            {/* Shelf Banner Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  {selectedShelf.id}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Zone: <strong style={{ color: '#cbd5e1' }}>{selectedShelf.aisleName} ({selectedShelf.category})</strong> · Code: <code style={{ color: '#38bdf8' }}>{selectedShelf.code}</code>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Shelf Health</div>
                <div style={{ marginTop: '4px' }}>
                  {selectedShelf.status === 'healthy' && <span className="badge badge-success">🟢 Full Stock</span>}
                  {selectedShelf.status === 'low' && <span className="badge badge-warning">🟡 Low Stock Warning</span>}
                  {selectedShelf.status === 'critical' && <span className="badge badge-danger">🔴 Out of Stock / Critical</span>}
                  {selectedShelf.status === 'empty' && <span className="badge badge-neutral">⚪ Empty Storage Bay</span>}
                </div>
              </div>
            </div>

            {/* Quick Stock In / Out Action Panel (If clicked) */}
            {quickStockAction && (
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <form onSubmit={handleExecuteQuickStock}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '12px' }}>
                    {quickStockAction.type === 'IN' ? '📥 Receive New Stock' : '📤 Dispatch Stock'} · {quickStockAction.product.name}
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Quantity ({quickStockAction.product.unit || 'Units'}) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-input"
                        value={quickQty}
                        onChange={(e) => setQuickQty(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reason / Notes</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Inward supplier shipment receipt"
                        value={quickReason}
                        onChange={(e) => setQuickReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setQuickStockAction(null)}>
                      Cancel
                    </button>
                    <button type="submit" className={`btn ${quickStockAction.type === 'IN' ? 'btn-success' : 'btn-primary'} btn-sm`}>
                      Confirm {quickStockAction.type === 'IN' ? 'Stock In' : 'Stock Out'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table inside this Shelf */}
            <div style={{ marginBottom: '12px', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
              Products Stored in this Shelf ({selectedShelf.products.length})
            </div>

            {selectedShelf.products.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '30px', margin: 0 }}>
                <Package size={36} style={{ color: 'var(--text-dim)', marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, color: '#fff' }}>This shelf is currently empty.</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  You can assign incoming products to <strong>{selectedShelf.id}</strong> from the Product Catalog.
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product Name & SKU</th>
                      <th>Category</th>
                      <th>Stock Level</th>
                      <th>Price (₹)</th>
                      <th>Health Status</th>
                      <th style={{ textAlign: 'right' }}>Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedShelf.products.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                            {p.sku} · {p.hsnCode || 'HSN 8479'}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-neutral">{p.category}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: p.stock === 0 ? 'var(--danger)' : '#fff' }}>
                            {p.stock} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.unit || 'Units'}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            Min: {p.minStockAlert} | Safe: {p.safetyStock}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{formatINR(p.sellingPrice)}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Cost: {formatINR(p.costPrice)}</div>
                        </td>
                        <td>
                          <StockHealthBadge
                            status={p.healthStatus}
                            stock={p.stock}
                            minAlert={p.minStockAlert}
                            safetyStock={p.safetyStock}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Receive Stock (+)"
                              onClick={() => {
                                setQuickStockAction({ product: p, type: 'IN' });
                                setQuickQty(20);
                              }}
                            >
                              <ArrowDownToLine size={14} color="#10b981" />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Dispatch Stock (-)"
                              onClick={() => {
                                setQuickStockAction({ product: p, type: 'OUT' });
                                setQuickQty(5);
                              }}
                            >
                              <ArrowUpFromLine size={14} color="#f43f5e" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <Link to="/products" className="btn btn-secondary" onClick={() => setSelectedShelf(null)}>
                <ExternalLink size={15} />
                <span>Go to Product Catalog</span>
              </Link>
              <button type="button" className="btn btn-primary" onClick={() => setSelectedShelf(null)}>
                Close Map Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


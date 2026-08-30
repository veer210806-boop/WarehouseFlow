import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Edit2,
  Trash2,
  ShoppingCart,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  Award,
  TrendingUp,
  PackageX,
  FileCheck,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import api, { formatINR } from '../api/axiosClient';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function Suppliers({ onAddToast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedScorecardSupplier, setSelectedScorecardSupplier] = useState(null);
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null);
  const [inspectingSupplier, setInspectingSupplier] = useState(null);

  // Inspection Form State
  const [inspectionForm, setInspectionForm] = useState({
    wasOnTime: true,
    totalUnits: 50,
    damagedUnits: 0,
    priceHikePercent: 0,
    notes: 'Standard delivery inspection passed'
  });

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    state: 'Maharashtra',
    stateCode: '27',
    pan: '',
    leadTimeDays: 4,
    paymentTerms: 'Net 30 (RTGS/NEFT)',
    rating: 4.8,
    onTimeDeliveryRate: 96.0,
    qualityDefectRate: 1.0,
    priceStabilityScore: 92.0
  });

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const [suppRes, scoreRes] = await Promise.all([
        api.get(`/suppliers?search=${encodeURIComponent(search)}`),
        api.get('/suppliers/scorecards')
      ]);

      setSuppliers(suppRes.data.data || []);
      setSummaryData(scoreRes.data.data?.summary || null);
    } catch (err) {
      onAddToast?.('Failed to load suppliers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData);
        onAddToast?.(`Supplier "${formData.company}" updated!`, 'success');
      } else {
        await api.post('/suppliers', formData);
        onAddToast?.(`Supplier "${formData.company}" added!`, 'success');
      }
      setShowModal(false);
      setEditingSupplier(null);
      resetForm();
      loadSuppliers();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Failed to save supplier.', 'error');
    }
  };

  const handleRecordInspection = async (e) => {
    e.preventDefault();
    if (!inspectingSupplier) return;
    try {
      const res = await api.post(`/suppliers/${inspectingSupplier._id}/inspection`, inspectionForm);
      onAddToast?.(res.data.message || 'Delivery inspection recorded successfully!', 'success');
      setInspectingSupplier(null);
      loadSuppliers();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Failed to record inspection.', 'error');
    }
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${supplier.company}"?`)) return;
    try {
      await api.delete(`/suppliers/${supplier._id}`);
      onAddToast?.('Supplier deleted.', 'success');
      loadSuppliers();
    } catch (err) {
      onAddToast?.(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const openScorecard = async (supplier) => {
    try {
      const res = await api.get(`/suppliers/${supplier._id}`);
      setSelectedScorecardSupplier(res.data.data);
    } catch (err) {
      onAddToast?.('Failed to fetch supplier scorecard.', 'error');
    }
  };

  const openEdit = (s) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      company: s.company,
      email: s.email,
      phone: s.phone,
      address: s.address || '',
      gstin: s.gstin || '',
      state: s.state || 'Maharashtra',
      stateCode: s.stateCode || '27',
      pan: s.pan || '',
      leadTimeDays: s.leadTimeDays || 4,
      paymentTerms: s.paymentTerms || 'Net 30 (RTGS/NEFT)',
      rating: s.rating || 4.8,
      onTimeDeliveryRate: s.onTimeDeliveryRate || 96.0,
      qualityDefectRate: s.qualityDefectRate || 1.0,
      priceStabilityScore: s.priceStabilityScore || 92.0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      state: 'Maharashtra',
      stateCode: '27',
      pan: '',
      leadTimeDays: 4,
      paymentTerms: 'Net 30 (RTGS/NEFT)',
      rating: 4.8,
      onTimeDeliveryRate: 96.0,
      qualityDefectRate: 1.0,
      priceStabilityScore: 92.0
    });
  };

  // Helper to render Star Rating component
  const renderStars = (rating = 4.5) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        {[...Array(5)].map((_, i) => {
          const isFilled = i < fullStars || (i === fullStars && hasHalf);
          return (
            <Star
              key={i}
              size={14}
              fill={isFilled ? '#fbbf24' : 'transparent'}
              color={isFilled ? '#fbbf24' : '#475569'}
            />
          );
        })}
        <strong style={{ marginLeft: '4px', color: '#fbbf24', fontSize: '0.85rem' }}>
          {rating.toFixed(1)}
        </strong>
      </div>
    );
  };

  // Helper to render Grade Badge
  const renderGradeBadge = (grade = 'A') => {
    if (grade === 'A+') {
      return (
        <span className="badge badge-success" style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
          🏆 GRADE A+ (TOP TIER)
        </span>
      );
    }
    if (grade === 'A') {
      return (
        <span className="badge badge-info" style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
          ⭐ GRADE A (RELIABLE)
        </span>
      );
    }
    if (grade === 'B') {
      return (
        <span className="badge badge-warning" style={{ fontWeight: 800 }}>
          🟡 GRADE B (MODERATE)
        </span>
      );
    }
    return (
      <span className="badge badge-danger" style={{ fontWeight: 800 }}>
        🔴 GRADE C (HIGH RISK)
      </span>
    );
  };

  const summary = summaryData || {
    totalSuppliers: suppliers.length,
    avgOnTimeRate: 96.1,
    avgDefectRate: 0.9,
    topSupplierName: 'Punjab Food Mills & Grains Ltd',
    topSupplierRating: 4.9
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Award size={22} color="#fbbf24" />
            <h1>Supplier Quality & Reliability Scorecard</h1>
          </div>
          <p>
            Automatically grades your suppliers from 1 to 5 Stars based on on-time delivery %, damaged goods %, and price stability.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingSupplier(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Scorecard Summary */}
      <div className="kpi-grid">
        <div className="kpi-card accent-purple">
          <div className="kpi-card-content">
            <div className="kpi-label">Verified Suppliers</div>
            <div className="kpi-value">{summary.totalSuppliers}</div>
            <div className="kpi-hint">Active vendors in directory</div>
          </div>
          <div className="kpi-icon-badge"><Truck size={22} /></div>
        </div>

        <div className="kpi-card accent-emerald">
          <div className="kpi-card-content">
            <div className="kpi-label">⏰ Avg On-Time Delivery</div>
            <div className="kpi-value">{summary.avgOnTimeRate}%</div>
            <div className="kpi-hint">Punctual shipment arrivals</div>
          </div>
          <div className="kpi-icon-badge"><CheckCircle2 size={22} /></div>
        </div>

        <div className="kpi-card accent-rose">
          <div className="kpi-card-content">
            <div className="kpi-label">📦 Avg Damaged Goods Rate</div>
            <div className="kpi-value">{summary.avgDefectRate}%</div>
            <div className="kpi-hint">Low defect rate across all lots</div>
          </div>
          <div className="kpi-icon-badge"><PackageX size={22} /></div>
        </div>

        <div className="kpi-card accent-amber">
          <div className="kpi-card-content">
            <div className="kpi-label">🏆 Top Rated Supplier</div>
            <div className="kpi-value" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {summary.topSupplierName.split(' ')[0]}
            </div>
            <div className="kpi-hint">⭐ {summary.topSupplierRating} / 5.0 Stars (Grade A+)</div>
          </div>
          <div className="kpi-icon-badge"><Award size={22} /></div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search suppliers by company, city, contact person, or GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Supplier Scorecards Grid */}
      {loading ? (
        <Loading message="Calculating supplier quality scores and ratings..." />
      ) : suppliers.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '50px' }}>
          <Truck size={40} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>No suppliers found.</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add your first vendor above.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
          {suppliers.map((s) => (
            <div key={s._id} className="panel" style={{ display: 'flex', flexDirection: 'column', margin: 0, position: 'relative' }}>
              {/* Top Header & Star Rating */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{s.company}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Contact: <strong style={{ color: '#cbd5e1' }}>{s.name}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {renderStars(s.rating || 4.8)}
                  <div style={{ marginTop: '4px' }}>
                    {renderGradeBadge(s.grade || 'A+')}
                  </div>
                </div>
              </div>

              {/* GSTIN & State Tags */}
              {s.gstin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981', fontSize: '0.75rem' }}>
                    GSTIN: {s.gstin}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>
                    {s.state || 'Maharashtra'} ({s.stateCode || '27'})
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="var(--primary)" />
                  <span>{s.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="var(--success)" />
                  <span>{s.phone}</span>
                </div>
                {s.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={14} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ lineHeight: 1.3 }}>{s.address}</span>
                  </div>
                )}
              </div>

              {/* Scorecard 3-Pillar Mini Metrics Box */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '14px'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                  <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      ⏰ On-Time
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: (s.onTimeDeliveryRate || 95) >= 95 ? '#10b981' : '#f59e0b' }}>
                      {s.onTimeDeliveryRate || 96}%
                    </div>
                  </div>

                  <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      📦 Damaged
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: (s.qualityDefectRate || 1.0) <= 1.0 ? '#10b981' : '#ef4444' }}>
                      {s.qualityDefectRate || 0.8}%
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      💰 Price Stability
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>
                      {s.priceStabilityScore || 92}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openScorecard(s)} title="View Complete Scorecard">
                    <Award size={14} color="#fbbf24" />
                    <span>Scorecard</span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setInspectingSupplier(s);
                      setInspectionForm({
                        wasOnTime: true,
                        totalUnits: 50,
                        damagedUnits: 0,
                        priceHikePercent: 0,
                        notes: `Quality audit for shipment from ${s.company}`
                      });
                    }}
                    title="Log incoming shipment quality & arrival inspection"
                  >
                    <FileCheck size={14} color="#10b981" />
                    <span>Inspect</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)} title="Edit Details">
                    <Edit2 size={13} />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)} title="Delete Supplier">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Comprehensive Supplier Scorecard Detail Modal */}
      {selectedScorecardSupplier && (
        <Modal
          title={`Supplier Scorecard · ${selectedScorecardSupplier.company}`}
          onClose={() => setSelectedScorecardSupplier(null)}
          size="lg"
        >
          <div>
            {/* Scorecard Top Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(19, 29, 49, 0.95))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '18px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={24} color="#fbbf24" />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    {selectedScorecardSupplier.company}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedScorecardSupplier.evaluationNotes || 'Consistent supplier with high on-time delivery record.'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {renderStars(selectedScorecardSupplier.rating || 4.8)}
                <div style={{ marginTop: '6px' }}>
                  {renderGradeBadge(selectedScorecardSupplier.grade || 'A+')}
                </div>
              </div>
            </div>

            {/* 3 Pillar Scorecard Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Clock size={16} />
                  <span>On-Time Delivery Rate</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                  {selectedScorecardSupplier.onTimeDeliveryRate || 96}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Lead Time: <strong>{selectedScorecardSupplier.leadTimeDays} Days</strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <PackageX size={16} />
                  <span>Damaged Goods %</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: (selectedScorecardSupplier.qualityDefectRate || 1) <= 1 ? '#10b981' : '#f43f5e' }}>
                  {selectedScorecardSupplier.qualityDefectRate || 0.8}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Quality Acceptance: <strong>{(100 - (selectedScorecardSupplier.qualityDefectRate || 0.8)).toFixed(1)}% Perfect</strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <TrendingUp size={16} />
                  <span>Price Stability</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
                  {selectedScorecardSupplier.priceStabilityScore || 92}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Payment Terms: <strong>{selectedScorecardSupplier.paymentTerms}</strong>
                </div>
              </div>
            </div>

            {/* Products Supplied Table */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
              Catalog Products Assigned ({selectedScorecardSupplier.products?.length || 0})
            </h3>

            {selectedScorecardSupplier.products?.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', padding: '15px 0' }}>No products currently mapped.</div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Cost Price</th>
                      <th>Current Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedScorecardSupplier.products?.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.sku}</td>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="badge badge-neutral">{p.category}</span></td>
                        <td>{formatINR(p.costPrice)}</td>
                        <td>{p.stock} {p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedScorecardSupplier(null)}>
                Close Scorecard
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Log Quality & Delivery Inspection */}
      {inspectingSupplier && (
        <Modal
          title={`Log Delivery & Quality Inspection · ${inspectingSupplier.company}`}
          onClose={() => setInspectingSupplier(null)}
          size="md"
        >
          <form onSubmit={handleRecordInspection}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <ShieldCheck size={16} />
                <span>Automatic Rating Recalculation</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Recording this delivery audit will automatically re-compute <strong>{inspectingSupplier.company}'s</strong> On-Time %, Defect %, Star rating, and Grade badge.
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Did the shipment truck arrive on time? *</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#fff' }}>
                    <input
                      type="radio"
                      name="wasOnTime"
                      checked={inspectionForm.wasOnTime === true}
                      onChange={() => setInspectionForm({ ...inspectionForm, wasOnTime: true })}
                    />
                    <span>✅ Yes, Arrived On-Time ({inspectingSupplier.leadTimeDays} days)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#f87171' }}>
                    <input
                      type="radio"
                      name="wasOnTime"
                      checked={inspectionForm.wasOnTime === false}
                      onChange={() => setInspectionForm({ ...inspectionForm, wasOnTime: false })}
                    />
                    <span>❌ Delayed Arrival</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Total Units in Lot *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={inspectionForm.totalUnits}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, totalUnits: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Damaged / Defective Units *</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="form-input"
                  value={inspectionForm.damagedUnits}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, damagedUnits: Number(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Any Price Hike in this Shipment?</label>
                <select
                  className="form-select"
                  value={inspectionForm.priceHikePercent}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, priceHikePercent: Number(e.target.value) })}
                >
                  <option value="0">No Price Change (Agreed Rate)</option>
                  <option value="5">Minor +5% Price Hike</option>
                  <option value="10">Substantial +10% Price Hike</option>
                  <option value="20">Severe +20% Price Hike</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Inspection Remarks / Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Good packaging, zero moisture damages"
                  value={inspectionForm.notes}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setInspectingSupplier(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                Submit &amp; Update Rating
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: Add / Edit Supplier Modal */}
      {showModal && (
        <Modal
          title={editingSupplier ? `Edit Supplier · ${editingSupplier.company}` : 'Add New Supplier'}
          onClose={() => setShowModal(false)}
          size="lg"
        >
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Punjab Food Mills & Grains Ltd"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Rajesh Malhotra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. sales@punjabfoodmills.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. +91 98201 45678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">GSTIN (15-digit GST Number)</label>
                <input
                  type="text"
                  maxLength="15"
                  className="form-input"
                  placeholder="e.g. 03AABCB1234F1Z2"
                  value={formData.gstin}
                  onChange={(e) => {
                    const gstin = e.target.value.toUpperCase();
                    const stateCode = gstin.slice(0, 2);
                    setFormData({ ...formData, gstin, ...(stateCode ? { stateCode } : {}) });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State &amp; Place of Supply *</label>
                <select
                  className="form-select"
                  value={formData.stateCode}
                  onChange={(e) => {
                    const stateMap = {
                      '27': 'Maharashtra',
                      '29': 'Karnataka',
                      '24': 'Gujarat',
                      '03': 'Punjab',
                      '07': 'Delhi',
                      '19': 'West Bengal',
                      '33': 'Tamil Nadu',
                      '36': 'Telangana',
                      '09': 'Uttar Pradesh',
                      '06': 'Haryana',
                      '08': 'Rajasthan'
                    };
                    setFormData({
                      ...formData,
                      stateCode: e.target.value,
                      state: stateMap[e.target.value] || 'Other'
                    });
                  }}
                >
                  <option value="27">27 - Maharashtra (Warehouse State)</option>
                  <option value="29">29 - Karnataka</option>
                  <option value="24">24 - Gujarat</option>
                  <option value="03">03 - Punjab</option>
                  <option value="07">07 - Delhi</option>
                  <option value="19">19 - West Bengal</option>
                  <option value="33">33 - Tamil Nadu</option>
                  <option value="36">36 - Telangana</option>
                  <option value="09">09 - Uttar Pradesh</option>
                  <option value="06">06 - Haryana</option>
                  <option value="08">08 - Rajasthan</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Factory / Office Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Plot 42, GT Road Industrial Area, Ludhiana, Punjab - 141003"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Typical Lead Time (Days) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <select
                  className="form-select"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                >
                  <option value="Immediate UPI/RTGS">Immediate UPI / RTGS</option>
                  <option value="Net 15 (UPI/NEFT)">Net 15 Days (UPI/NEFT)</option>
                  <option value="Net 30 (RTGS/NEFT)">Net 30 Days (RTGS/NEFT)</option>
                  <option value="Net 45">Net 45 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Advance Against PI">Advance Against Proforma Invoice</option>
                </select>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '0 -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingSupplier ? 'Save Changes' : 'Create Supplier'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  XCircle,
  Clock,
  IndianRupee,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Boxes,
  Activity,
  Truck
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import api, { formatINR } from '../api/axiosClient';
import StatCard from '../components/StatCard';
import StockHealthBadge from '../components/StockHealthBadge';
import Loading from '../components/Loading';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Dashboard({ onAddToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <Loading message="Analyzing warehouse inventory..." />;
  if (error) return <div className="panel" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data) return null;

  const { kpi, charts, smartReorder, recentActivities } = data;

  // Chart 1: Stock Levels by Category (Doughnut)
  const categoryChartData = {
    labels: charts.categoryDistribution.map((c) => c.category),
    datasets: [
      {
        data: charts.categoryDistribution.map((c) => c.units),
        backgroundColor: [
          '#6366f1',
          '#10b981',
          '#f59e0b',
          '#38bdf8',
          '#ec4899',
          '#8b5cf6'
        ],
        borderWidth: 2,
        borderColor: '#131d31'
      }
    ]
  };

  // Chart 2: Top Moving Products (Horizontal Bar)
  const topMovingChartData = {
    labels: charts.topMovingProducts.map((p) => p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name),
    datasets: [
      {
        label: 'Weekly Sales (Units)',
        data: charts.topMovingProducts.map((p) => p.weeklySales),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 6
      }
    ]
  };

  // Chart 3: Monthly Inbound vs Outbound Movements (Line)
  const movementsChartData = {
    labels: charts.monthlyMovements.map((m) => m.label),
    datasets: [
      {
        label: 'Stock In (Received)',
        data: charts.monthlyMovements.map((m) => m.stockIn),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true
      },
      {
        label: 'Stock Out (Dispatched)',
        data: charts.monthlyMovements.map((m) => m.stockOut),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        tension: 0.35,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(51, 65, 85, 0.3)' }
      },
      y: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(51, 65, 85, 0.3)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
      }
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Warehouse Overview & Analytics</h1>
          <p>Easily check your total stock, product values, low-stock warnings, and orders in one simple dashboard.</p>
        </div>
        <div className="header-actions">
          <Link to="/reorder" className="btn btn-primary">
            <Sparkles size={16} />
            <span>Restock Helper ({smartReorder.summary.totalItemsToReorder} to buy)</span>
          </Link>
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          icon={Package}
          label="Total Products"
          value={kpi.totalProducts}
          hint={`${kpi.totalStockUnits} total items available in warehouse`}
          accent="accent-purple"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Stock Value (Cost)"
          value={formatINR(kpi.totalInventoryCostValue)}
          hint={`Retail Selling Value: ${formatINR(kpi.totalRetailValue)}`}
          accent="accent-emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Warning"
          value={kpi.stockHealth.lowStock}
          hint="Items getting close to running out"
          accent="accent-amber"
        />
        <StatCard
          icon={XCircle}
          label="Out of Stock (0 Left)"
          value={kpi.stockHealth.outOfStock}
          hint={`${kpi.stockHealth.critical} items at critical emergency level`}
          accent="accent-rose"
        />
        <StatCard
          icon={Clock}
          label="Pending Supplier Orders"
          value={kpi.pendingOrders}
          hint="Purchase orders waiting to arrive"
          accent="accent-sky"
        />
      </div>

      {/* Smart Reorder Recommendation Banner */}
      {smartReorder.recommendations.length > 0 && (
        <div className="panel" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Sparkles size={20} color="var(--warning)" />
                <span>Smart Restock Helper — Recommended Orders</span>
              </div>
              <div className="panel-desc">
                The smart assistant noticed that {smartReorder.summary.totalItemsToReorder} products are selling quickly and need to be reordered soon.
              </div>
            </div>
            <Link to="/reorder" className="btn btn-secondary btn-sm">
              <span>View All Recommended Orders</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {smartReorder.recommendations.slice(0, 3).map((item) => (
              <div key={item.productId} className="reorder-card" style={{ padding: '16px', margin: 0 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{item.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Code: {item.sku} · Supplier: {item.supplier?.company || 'Unassigned'}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <StockHealthBadge status={item.status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      In Stock: <strong style={{ color: '#fff' }}>{item.currentStock}</strong> (Order when below {item.reorderPoint})
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Recommended to Buy
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8' }}>
                    {item.suggestedQuantity} units
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Boxes size={18} />
                <span>Stock Distribution by Category</span>
              </div>
              <div className="panel-desc">Unit breakdown across product classifications</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <TrendingUp size={18} />
                <span>Fastest Moving Products</span>
              </div>
              <div className="panel-desc">Top SKUs by weekly sales volume</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar
              data={topMovingChartData}
              options={{
                ...chartOptions,
                indexAxis: 'y',
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Second Row: Stock Movement Trend & Real-Time Activity Log */}
      <div className="charts-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Activity size={18} />
                <span>Monthly Inventory Flow (In vs Out)</span>
              </div>
              <div className="panel-desc">Comparison of received stock vs customer dispatches</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <Line data={movementsChartData} options={chartOptions} />
          </div>
        </div>

        {/* Real-Time Activity Log / Timeline */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Activity size={18} />
                <span>Live Warehouse Activity Log</span>
              </div>
              <div className="panel-desc">Chronological transaction audit trail</div>
            </div>
            <Link to="/inventory" className="btn btn-secondary btn-sm">
              <span>View Ledger</span>
            </Link>
          </div>

          <div className="activity-timeline">
            {recentActivities.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px' }}>
                No recent activity recorded.
              </div>
            ) : (
              recentActivities.slice(0, 5).map((act) => (
                <div key={act._id} className="activity-item">
                  <div className={`activity-icon ${act.badgeType}`}>
                    <Activity size={16} />
                  </div>
                  <div className="activity-main">
                    <div className="activity-title">{act.action}</div>
                    <div className="activity-details">{act.details}</div>
                  </div>
                  <div className="activity-time">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

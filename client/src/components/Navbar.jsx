import { Menu, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar({ onToggleSidebar, onQuickSeed }) {
  const { user } = useAuth();
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-toggle" onClick={onToggleSidebar} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <div>
          <div className="topbar-title">Warehouse Central</div>
        </div>
        <div className="topbar-badge">
          <span className="health-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="topbar-actions">
        {onQuickSeed && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onQuickSeed}
            title="Reset & Seed Realistic Warehouse Demo Catalog"
          >
            <RefreshCw size={14} />
            <span>Reset Demo Data</span>
          </button>
        )}
        <Link to="/reorder" className="btn btn-primary btn-sm">
          <Sparkles size={15} />
          <span>Smart Reorder</span>
        </Link>
      </div>
    </header>
  );
}

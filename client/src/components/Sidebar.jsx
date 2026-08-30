import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  Sparkles,
  Truck,
  ShoppingCart,
  LogOut,
  Warehouse,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose, lowStockCount = 0 }) {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/warehouse-map', label: '2D Warehouse Map', icon: MapPin },
    { to: '/products', label: 'Product Catalog', icon: Boxes },
    { to: '/batches', label: 'Expiry & Batch Tracker', icon: Clock },
    { to: '/inventory', label: 'Stock & Movements', icon: ArrowLeftRight },
    {
      to: '/reorder',
      label: 'Restock Helper',
      icon: Sparkles,
      badge: lowStockCount > 0 ? `${lowStockCount} to Buy` : null,
      badgeType: 'warning'
    },
    { to: '/suppliers', label: 'Suppliers & Vendors', icon: Truck },
    { to: '/orders', label: 'Orders & GST Invoices', icon: ShoppingCart }
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-logo">
            <Warehouse size={22} />
          </div>
          <div>
            <div className="brand-title">WarehouseFlow</div>
            <div className="brand-subtitle">Smart Inventory OS</div>
          </div>
        </div>

        <nav className="nav-group">
          <div className="nav-label">Core Modules</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badgeType || ''}`}>{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {(user?.name || 'V').charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Veer Goel (Admin)'}</div>
              <div className="user-role">{user?.role?.replace('_', ' ') || 'Admin'}</div>
            </div>
            <button className="logout-btn" title="Sign Out" onClick={logout}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

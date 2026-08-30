import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import WarehouseMap from './pages/WarehouseMap';
import Products from './pages/Products';
import BatchTracker from './pages/BatchTracker';
import Inventory from './pages/Inventory';
import ReorderCenter from './pages/ReorderCenter';
import Suppliers from './pages/Suppliers';
import Orders from './pages/Orders';
import Login from './pages/Login';
import api from './api/axiosClient';

function ProtectedLayout({ children, onAddToast }) {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Fetch low stock count for sidebar badge
  const refreshBadge = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data?.data?.kpi?.stockHealth) {
        setLowStockCount(res.data.data.kpi.stockHealth.needsAttention || 0);
      }
    } catch (e) {
      // Quiet fail if offline
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshBadge();
    }
  }, [isAuthenticated]);

  const handleQuickSeed = async () => {
    try {
      await api.post('/seed');
      onAddToast('Database successfully re-seeded with realistic warehouse catalog!', 'success');
      window.location.reload();
    } catch (err) {
      onAddToast('Failed to seed database.', 'error');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        lowStockCount={lowStockCount}
      />
      <div className="main-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onQuickSeed={handleQuickSeed}
        />
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedLayout onAddToast={addToast}>
              <Dashboard onAddToast={addToast} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/warehouse-map"
          element={
            <ProtectedLayout onAddToast={addToast}>
              <WarehouseMap onAddToast={addToast} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedLayout onAddToast={addToast}>
              <Products onAddToast={addToast} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/batches"
          element={
            <ProtectedLayout onAddToast={addToast}>
              <BatchTracker onAddToast={addToast} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedLayout onAddToast={addToast}>
              <Inventory onAddToast={addToast} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/reorder"
          element={
            <ProtectedLayout onAddToast={addToast}>
              <ReorderCenter onAddToast={addToast} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedLayout onAddToast={addToast}>
              <Suppliers onAddToast={addToast} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedLayout onAddToast={addToast}>
              <Orders onAddToast={addToast} />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast toasts={toasts} onDismiss={removeToast} />
    </>
  );
}

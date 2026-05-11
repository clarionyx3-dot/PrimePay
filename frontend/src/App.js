import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/UI';
import { Sidebar } from './components/Sidebar';
import './index.css';

// Pages
import Login          from './pages/Login';
import Register       from './pages/Register';
import Success        from './pages/Success';
import AddMenu        from './pages/AddMenu'; // <-- Naya Import
import SADashboard    from './pages/superadmin/SADashboard';
import SARestaurants from './pages/superadmin/SARestaurants';
import SARevenue      from './pages/superadmin/SARevenue';
import SAFees         from './pages/superadmin/SAFees';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders    from './pages/admin/AdminOrders';
import AdminMenu      from './pages/admin/AdminMenu';
import AdminTables    from './pages/admin/AdminTables';
import AdminStaff     from './pages/admin/AdminStaff';
import Payments       from './pages/admin/Payments';
import Invoices       from './pages/admin/Invoices';
import CreditLine     from './pages/admin/CreditLine';
import Payroll        from './pages/admin/Payroll';
import Inventory      from './pages/admin/Inventory';
import Employees      from './pages/admin/Employees';
import POS            from './pages/client/POS';

// ── Route guard ───────────────────────────────────────────────
function Guard({ roles, children }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role) && role !== 'superadmin') return <Navigate to="/" replace />;
  return children;
}

// ── Role redirect ─────────────────────────────────────────────
function RoleHome() {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'superadmin') return <Navigate to="/sa" replace />;
  if (role === 'admin')      return <Navigate to="/admin" replace />;
  if (role === 'client')     return <Navigate to="/pos" replace />;
  return <Navigate to="/login" replace />;
}

// ── SuperAdmin layout ─────────────────────────────────────────
const SA_NAV = [
  { section: 'Platform' },
  { to: '/sa',             icon: '⊞', label: 'Dashboard',   end: true },
  { to: '/sa/restaurants', icon: '🏪', label: 'Restaurants' },
  { to: '/sa/revenue',     icon: '📊', label: 'Revenue' },
  { to: '/sa/fees',        icon: '💰', label: 'Fee Config' },
];

function SALayout() {
  const { logout } = useAuth();
  const nav = useNavigate();
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar navItems={SA_NAV} onLogout={async () => { await logout(); nav('/login'); }} />
      <div style={{ flex: 1, overflowY: 'auto', background: '#F4F6FB' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>PrimePay SuperAdmin</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

// ── Admin layout ──────────────────────────────────────────────
const ADMIN_NAV = [
  { section: 'Restaurant' },
  { to: '/admin',            icon: '⊞', label: 'Dashboard',  end: true },
  { to: '/admin/orders',     icon: '🧾', label: 'Live Orders' },
  { to: '/admin/menu',       icon: '🍽️', label: 'Menu List' },
  { to: '/admin/add-item',   icon: '🍔', label: 'Add Menu Item' }, // <-- Sidebar mein naya link
  { to: '/admin/tables',     icon: '🪑', label: 'Tables' },
  { to: '/admin/staff',      icon: '👥', label: 'Staff' },
  { section: 'Finance' },
  { to: '/admin/payments',   icon: '💳', label: 'Payments' },
  { to: '/admin/invoices',   icon: '📄', label: 'Invoices' },
  { to: '/admin/credit',     icon: '🏦', label: 'Credit Line' },
  { to: '/admin/payroll',    icon: '💵', label: 'Payroll' },
  { to: '/admin/inventory',  icon: '📦', label: 'Inventory' },
  { to: '/admin/employees',  icon: '👤', label: 'Employees' },
];

function AdminLayout() {
  const { logout, profile } = useAuth();
  const nav = useNavigate();
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar navItems={ADMIN_NAV} onLogout={async () => { await logout(); nav('/login'); }} />
      <div style={{ flex: 1, overflowY: 'auto', background: '#F4F6FB', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>{profile?.name || 'Restaurant'} — Admin</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

// ── Client layout ─────────────────────────────────────────────
const CLIENT_NAV = [
  { section: 'POS' },
  { to: '/pos',    icon: '🛒', label: 'Place Order', end: true },
];

function ClientLayout() {
  const { logout, profile } = useAuth();
  const nav = useNavigate();
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar navItems={CLIENT_NAV} onLogout={async () => { await logout(); nav('/login'); }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>POS — {profile?.name || 'Cashier'}</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/"       element={<RoleHome />} />

          {/* SuperAdmin */}
          <Route path="/sa" element={<Guard roles={['superadmin']}><SALayout /></Guard>}>
            <Route index              element={<SADashboard />} />
            <Route path="restaurants" element={<SARestaurants />} />
            <Route path="revenue"     element={<SARevenue />} />
            <Route path="fees"        element={<SAFees />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<Guard roles={['admin']}><AdminLayout /></Guard>}>
            <Route index              element={<AdminDashboard />} />
            <Route path="orders"      element={<AdminOrders />} />
            <Route path="menu"        element={<AdminMenu />} />
            <Route path="add-item"    element={<AddMenu />} /> {/* <-- Route for AddMenu page */}
            <Route path="tables"      element={<AdminTables />} />
            <Route path="staff"       element={<AdminStaff />} />
            <Route path="payments"    element={<Payments />} />
            <Route path="invoices"    element={<Invoices />} />
            <Route path="credit"      element={<CreditLine />} />
            <Route path="payroll"     element={<Payroll />} />
            <Route path="inventory"   element={<Inventory />} />
            <Route path="employees"   element={<Employees />} />
          </Route>

          {/* Client */}
          <Route path="/pos" element={<Guard roles={['client']}><ClientLayout /></Guard>}>
            <Route index element={<POS />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
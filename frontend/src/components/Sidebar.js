// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLOR = { superadmin: '#7C3AED', admin: '#0052FF', client: '#00C48C' };
const ROLE_LABEL = { superadmin: 'SuperAdmin', admin: 'Admin', client: 'Cashier / Waiter' };

function NavItem({ to, icon, label, end, color }) {
  return (
    <NavLink to={to} end={end}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 8,
        marginBottom: 2, textDecoration: 'none', fontSize: 13, fontWeight: 500,
        background: isActive ? (color || '#0052FF') : 'transparent',
        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
        transition: 'all .12s',
      })}>
      <span style={{ fontSize: 15 }}>{icon}</span> {label}
    </NavLink>
  );
}

export function Sidebar({ navItems, onLogout }) {
  const { user, profile, role } = useAuth();
  const color = ROLE_COLOR[role] || '#0052FF';
  const name  = profile?.name || user?.email?.split('@')[0] || 'User';

  return (
    <aside style={{ width: 218, background: '#0D1B2A', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: role === 'superadmin' ? 16 : 12, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
          {role === 'superadmin' ? '👑' : 'PP'}
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'Syne, sans-serif' }}>PrimePay</div>
          <div style={{ fontSize: 9, letterSpacing: '.9px', textTransform: 'uppercase', color }}>{ROLE_LABEL[role]}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map((item, i) => (
          item.section
            ? <div key={i} style={{ fontSize: 9, letterSpacing: '1.1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '10px 8px 4px', marginTop: i > 0 ? 6 : 0 }}>{item.section}</div>
            : <NavItem key={i} to={item.to} icon={item.icon} label={item.label} end={item.end} color={color} />
        ))}
      </nav>

      {/* User foot */}
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px', marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: '100%', padding: '7px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 7, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          ⏏ Sign out
        </button>
      </div>
    </aside>
  );
}

// src/components/UI.js — All shared UI components

import React, { useState, useEffect } from 'react';

// ── Toast ─────────────────────────────────────────────────────
let toastFn = null;
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    toastFn = (msg, type = 'success') => {
      const id = Date.now();
      setToasts(t => [...t, { id, msg, type }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };
  }, []);
  const colors = { success: '#0D1B2A', error: '#EF4444', info: '#0052FF', warning: '#F59E0B' };
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: colors[t.type] || colors.success, color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 340, animation: 'slideIn .2s ease' }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
export const toast = (msg, type) => toastFn && toastFn(msg, type);

// ── Button ────────────────────────────────────────────────────
export function Btn({ children, variant = 'blue', size = 'md', onClick, disabled, type = 'button', style }) {
  const variants = {
    blue:   { background: '#0052FF', color: '#fff', border: 'none' },
    green:  { background: '#00C48C', color: '#fff', border: 'none' },
    purple: { background: '#7C3AED', color: '#fff', border: 'none' },
    red:    { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' },
    ghost:  { background: '#fff', color: '#718096', border: '1px solid #E2E8F0' },
    dark:   { background: '#0D1B2A', color: '#fff', border: 'none' },
  };
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12, borderRadius: 7 },
    md: { padding: '9px 18px', fontSize: 13, borderRadius: 9 },
    lg: { padding: '12px 24px', fontSize: 15, borderRadius: 10 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all .12s', ...variants[variant], ...sizes[size], ...style }}>
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 20px', marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}

export function CardHead({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600 }}>{title}</div>
      {action}
    </div>
  );
}

// ── Stats Grid ────────────────────────────────────────────────
export function StatsGrid({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>{s.label}</div>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: s.color || '#0D1B2A' }}>{s.value}</div>
          {s.note && <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 3 }}>{s.note}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
export function Badge({ status, label }) {
  const map = {
    active:'#00C48C', approved:'#00C48C', paid:'#00C48C', available:'#00C48C', ready:'#00C48C',
    pending:'#F59E0B', open:'#F59E0B', under_review:'#F59E0B', occupied:'#F59E0B',
    preparing:'#0052FF', 'in progress':'#0052FF',
    suspended:'#EF4444', rejected:'#EF4444', cancelled:'#EF4444', failed:'#EF4444', overdue:'#EF4444', hidden:'#EF4444',
  };
  const color = map[(status || '').toLowerCase()] || '#718096';
  return (
    <span style={{ background: color + '20', color, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {label || status}
    </span>
  );
}

// ── Form Field ────────────────────────────────────────────────
export function Field({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</label>}
      {children}
    </div>
  );
}

export const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0D1B2A', transition: 'border .12s' };

export function Input({ ...props }) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} onFocus={e => e.target.style.borderColor = '#0052FF'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />;
}

export function Select({ children, ...props }) {
  return <select {...props} style={{ ...inputStyle, ...props.style }}>{children}</select>;
}

// ── List Row ──────────────────────────────────────────────────
export function ListRow({ icon, iconBg, title, sub, right, actions, extra }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #F7FAFC' }}>
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg || '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1 }}>{sub}</div>}
        {extra}
      </div>
      {right && <div style={{ fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{right}</div>}
      {actions && <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function Empty({ text }) {
  return <div style={{ padding: '36px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>{text}</div>;
}

// ── Loading ───────────────────────────────────────────────────
export function Loading() {
  return (
    <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #E2E8F0', borderTopColor: '#0052FF', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

// ── Form Box ──────────────────────────────────────────────────
export function FormBox({ title, children, onCancel }) {
  return (
    <div style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 20, marginBottom: 16 }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{title}</div>}
      {children}
      {onCancel && (
        <div style={{ marginTop: 12 }}>
          <Btn variant="ghost" size="sm" onClick={onCancel}>Cancel</Btn>
        </div>
      )}
    </div>
  );
}

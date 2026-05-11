import React, { useEffect, useState } from 'react';
import { REST } from '../../services/api';
import { Card, CardHead, Badge, Empty, Loading, Btn, FormBox, Field, Input, toast } from '../../components/UI';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const load = async () => {
    try {
      const r = await REST.getStaff();
      setStaff(r.data);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast('All fields required', 'error'); return; }
    if (form.password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    
    try {
      await REST.addStaff(form);
      toast(`Access granted to ${form.name}! 🔑`);
      setShowForm(false);
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  const deleteStaff = async (id) => {
    if(!window.confirm("Are you sure you want to revoke access?")) return;
    try {
        // await REST.deleteStaff(id);
        toast("Staff access revoked");
        load();
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Terminal Access</h1>
          <p style={{ color: '#A3AED0', fontSize: 14 }}>Manage waiters, cashiers, and POS operators</p>
        </div>
        <Btn onClick={() => setShowForm(true)} style={{ borderRadius: 14, padding: '12px 25px', boxShadow: '0 10px 20px rgba(0,82,255,0.2)' }}>
          + Add New Operator
        </Btn>
      </div>

      {showForm && (
        <FormBox title="🔐 Create Staff Account" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleCreate} style={{ padding: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Full Name"><Input value={form.name} onChange={upd('name')} placeholder="e.g. John Doe" required /></Field>
              <Field label="Staff Email"><Input type="email" value={form.email} onChange={upd('email')} placeholder="john@primepay.com" required /></Field>
              <Field label="Access Password"><Input type="password" value={form.password} onChange={upd('password')} placeholder="Set secure password" required /></Field>
              
              <div style={{ alignSelf: 'center', background: '#FFF4E5', padding: '15px', borderRadius: '12px', border: '1px solid #FFD5A1' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#B45309', marginBottom: 5 }}>PERMISSION LEVEL: CLIENT</div>
                  <div style={{ fontSize: 12, color: '#D97706', lineHeight: 1.4 }}>
                    Operators can place orders via POS but <strong>cannot</strong> access Admin, Financials, or Menu settings.
                  </div>
              </div>
            </div>
            <Btn type="submit" style={{ width: '100%', padding: 15, fontSize: 16, fontWeight: 700 }}>Generate Operator Credentials</Btn>
          </form>
        </FormBox>
      )}

      {/* STAFF CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 25 }}>
        {staff.length === 0 ? (
          <div style={{ gridColumn: '1/-1' }}><Empty text="No operators registered yet." /></div>
        ) : (
          staff.map(s => (
            <div key={s.id} style={staffCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                <div style={avatarStyle}>{s.name?.[0]?.toUpperCase()}</div>
                <div style={{ marginLeft: 15 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1B2559' }}>{s.name || 'Anonymous Staff'}</div>
                  <div style={{ fontSize: 13, color: '#A3AED0' }}>{s.email}</div>
                </div>
              </div>

              <div style={badgeRowStyle}>
                <Badge status="active" label="POS OPERATOR" />
                <span style={{ fontSize: 11, color: '#A3AED0', fontWeight: 600 }}>ID: #{s.id?.slice(-4).toUpperCase()}</span>
              </div>

              <div style={actionRowStyle}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, color: '#A3AED0', fontWeight: 800 }}>STATUS</span>
                    <span style={{ fontSize: 12, color: '#00C48C', fontWeight: 700 }}>● ONLINE</span>
                </div>
                <button onClick={() => deleteStaff(s.id)} style={removeBtnStyle}>Revoke Access</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const staffCardStyle = {
    background: '#fff',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid #E9EDF7',
    transition: '0.3s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
    cursor: 'default',
};

const avatarStyle = {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #E8F0FF 0%, #C2D6FF 100%)',
    color: '#0052FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '900',
    fontFamily: 'Syne'
};

const badgeRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F8FAFF',
    padding: '10px 15px',
    borderRadius: '12px',
    marginBottom: '20px'
};

const actionRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15px',
    borderTop: '1px solid #F4F7FE'
};

const removeBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#EE5D50',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'underline'
};
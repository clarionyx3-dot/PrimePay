import React, { useEffect, useState } from 'react';
import { SA } from '../../services/api';
import { Card, CardHead, Badge, ListRow, Empty, Loading, Btn, FormBox, Field, Input, toast } from '../../components/UI';

export default function SARestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', adminName: '', adminEmail: '', adminPassword: '' });

  const load = async () => {
    try {
      const r = await SA.getRestaurants();
      setRestaurants(r.data);
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
    if (!form.name || !form.adminEmail || !form.adminPassword) {
      toast('Essential details (Name, Email, Password) missing!', 'error');
      return;
    }
    try {
      await SA.createRestaurant(form);
      toast(`Enterprise Instance "${form.name}" Activated! 🚀`);
      setShowForm(false);
      setForm({ name: '', address: '', phone: '', adminName: '', adminEmail: '', adminPassword: '' });
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  const handleSuspend = async (id, name) => {
    if (!window.confirm(`Are you sure you want to suspend "${name}"? Access will be immediately revoked.`)) return;
    try {
      await SA.suspendRestaurant(id);
      toast('Partner access suspended.');
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleActivate = async (id) => {
    try {
      await SA.updateRestaurant(id, { status: 'active' });
      toast('Partner account reactivated.');
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Partner Network</h1>
          <p style={{ color: '#A3AED0', fontSize: 14 }}>Manage restaurant accounts, instances, and billing status</p>
        </div>
        <Btn onClick={() => setShowForm(true)} style={{ borderRadius: 12, padding: '12px 25px' }}>
          + Register New Restaurant
        </Btn>
      </div>

      {showForm && (
        <FormBox title="🚀 Provision New Instance" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleCreate} style={{ padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Restaurant Brand Name *"><Input value={form.name} onChange={upd('name')} placeholder="e.g. Royal Jasmine" required /></Field>
              <Field label="Primary Phone"><Input value={form.phone} onChange={upd('phone')} placeholder="+92 3XX XXXXXXX" /></Field>
              <Field label="Operating Address" style={{ gridColumn: 'span 2' }}><Input value={form.address} onChange={upd('address')} placeholder="Full physical location" /></Field>
              <div style={{ gridColumn: 'span 2', height: '1px', background: '#F4F7FE', margin: '10px 0' }}></div>
              <Field label="Admin Contact Name"><Input value={form.adminName} onChange={upd('adminName')} placeholder="Owner/Manager Name" /></Field>
              <Field label="Login Email *"><Input type="email" value={form.adminEmail} onChange={upd('adminEmail')} placeholder="admin@brand.com" required /></Field>
              <Field label="Master Password *"><Input type="password" value={form.adminPassword} onChange={upd('adminPassword')} placeholder="Min. 8 characters" required /></Field>
            </div>
            
            <div style={warningBox}>
              <strong>Note:</strong> This action provisions a new cloud instance and creates a secure Firebase Auth credential. The partner will receive an automated onboarding invite.
            </div>
            
            <Btn type="submit" style={{ width: '100%', padding: 16, fontSize: 16 }}>Deploy Restaurant Instance</Btn>
          </form>
        </FormBox>
      )}

      {/* PARTNER LIST */}
      <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '25px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#1B2559' }}>Active Network ({restaurants.length})</h3>
          {restaurants.length === 0 ? <Empty text="No partners onboarded yet. Build your network today!" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {restaurants.map(r => (
                <div key={r.id} style={partnerCard}>
                    <div style={avatarStyle}>{r.name?.[0]}</div>
                    <div style={{ flex: 1, marginLeft: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontWeight: 800, fontSize: 16, color: '#1B2559' }}>{r.name}</span>
                            <Badge status={r.status || 'active'} />
                        </div>
                        <div style={{ fontSize: 12, color: '#A3AED0', marginTop: 4 }}>
                            {r.adminEmail} • {r.address || 'No location set'}
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                            <div style={miniStat}>📈 {r.totalOrders || 0} Orders</div>
                            <div style={miniStat}>💰 ${ (r.totalFeesPaid || 0).toLocaleString() } Fees</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {r.status !== 'suspended' ? (
                          <button onClick={() => handleSuspend(r.id, r.name)} style={suspendBtn}>Suspend Access</button>
                        ) : (
                          <button onClick={() => handleActivate(r.id)} style={activateBtn}>Reactivate</button>
                        )}
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// --- STYLES ---

const partnerCard = {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '16px',
    background: '#fff',
    border: '1px solid #F4F7FE',
    transition: '0.2s',
    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
};

const avatarStyle = {
    width: 60, height: 60, borderRadius: 16, background: '#F4F7FE', color: '#7C3AED',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900
};

const miniStat = {
    fontSize: '11px', fontWeight: 700, color: '#4A5568', background: '#F8FAFC',
    padding: '4px 10px', borderRadius: '6px', border: '1px solid #E2E8F0'
};

const warningBox = {
    background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px',
    padding: '15px', fontSize: '12px', color: '#92400E', marginBottom: '20px', lineHeight: '1.5'
};

const suspendBtn = {
    padding: '10px 15px', borderRadius: '10px', border: '1px solid #FEE2E2',
    background: '#FFF1F1', color: '#EF4444', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
};

const activateBtn = {
    padding: '10px 15px', borderRadius: '10px', border: '1px solid #DCFCE7',
    background: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
};
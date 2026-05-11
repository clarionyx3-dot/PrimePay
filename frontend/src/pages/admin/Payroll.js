import React, { useEffect, useState } from 'react';
import { FIN } from '../../services/api';
import { Card, CardHead, Badge, Empty, Loading, Btn, FormBox, Field, Input, Select, toast } from '../../components/UI';

export default function Payroll() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    employeeName: '', 
    amount: '', 
    payDate: new Date().toISOString().split('T')[0], 
    role: 'Staff',
    paymentMethod: 'Bank Transfer'
  });

  const load = async () => {
    try { 
      const r = await FIN.getPayroll(); 
      setData(r.data); 
    } catch (e) { 
      toast(e.message, 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await FIN.createPayroll({ 
        ...form, 
        amount: parseFloat(form.amount),
        status: 'paid' 
      });
      toast('Payment Processed Successfully! 🏦');
      setShowForm(false);
      setForm({ 
        employeeName: '', 
        amount: '', 
        payDate: new Date().toISOString().split('T')[0], 
        role: 'Staff',
        paymentMethod: 'Bank Transfer'
      });
      load();
    } catch (e) { 
      toast(e.response?.data?.error || e.message, 'error'); 
    }
  };

  if (loading) return <Loading />;

  // Financial Analytics
  const totalPaid = data.reduce((s, r) => s + (r.amount || 0), 0);
  const thisMonthPaid = data
    .filter(r => new Date(r.payDate).getMonth() === new Date().getMonth())
    .reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Staff Payroll</h1>
          <p style={{ color: '#A3AED0', fontSize: 14 }}>Manage employee compensation & salary history</p>
        </div>
        <Btn onClick={() => setShowForm(true)} style={{ borderRadius: 14, padding: '12px 25px' }}>
          🚀 Process New Salary
        </Btn>
      </div>

      {/* QUICK STATS CARDS */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
          <div style={statCard}>
              <span style={statLabel}>TOTAL DISBURSED (LIFETIME)</span>
              <div style={{ ...statValue, color: '#0052FF' }}>${totalPaid.toLocaleString()}</div>
          </div>
          <div style={statCard}>
              <span style={statLabel}>PAID THIS MONTH</span>
              <div style={{ ...statValue, color: '#059669' }}>${thisMonthPaid.toLocaleString()}</div>
          </div>
          <div style={statCard}>
              <span style={statLabel}>EMPLOYEES PAID</span>
              <div style={{ ...statValue, color: '#1B2559' }}>{data.length} Payments</div>
          </div>
      </div>

      {showForm && (
        <FormBox title="🏦 Process Employee Payment" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleCreate} style={{ padding: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Employee Name"><Input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} required placeholder="Full Name" /></Field>
              <Field label="Designation / Role">
                <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {['Staff', 'Manager', 'Chef', 'Cashier', 'Admin'].map(r => <option key={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="Amount ($)"><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></Field>
              <Field label="Payment Date"><Input type="date" value={form.payDate} onChange={e => setForm(f => ({ ...f, payDate: e.target.value }))} required /></Field>
            </div>
            <Btn type="submit" style={{ width: '100%', padding: 16, fontSize: 16 }}>Confirm & Authorize Payment</Btn>
          </form>
        </FormBox>
      )}

      {/* PAYROLL LIST */}
      <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: 25 }}>
          {data.length === 0 ? <Empty text="No payroll records found." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.map(r => (
                <div key={r.id} style={payrollRowStyle}>
                    <div style={avatarStyle}>{r.employeeName.charAt(0)}</div>
                    <div style={{ flex: 1, marginLeft: 15 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1B2559' }}>{r.employeeName}</div>
                        <div style={{ fontSize: 12, color: '#A3AED0' }}>{r.role} • Paid via Bank</div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 30 }}>
                        <div style={{ fontSize: 12, color: '#A3AED0' }}>PAY DATE</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(r.payDate).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 100 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>${(r.amount || 0).toFixed(2)}</div>
                        <Badge status="paid" label="PROCESSED" />
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
const statCard = { flex: 1, background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '5px' };
const statLabel = { fontSize: '11px', fontWeight: 800, color: '#A3AED0', letterSpacing: '0.5px' };
const statValue = { fontSize: '24px', fontWeight: 900 };

const payrollRowStyle = {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    padding: '15px 20px',
    borderRadius: '16px',
    border: '1px solid #E9EDF7',
    transition: '0.2s',
    cursor: 'default'
};

const avatarStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    background: '#F4F7FE',
    color: '#0052FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '800'
};
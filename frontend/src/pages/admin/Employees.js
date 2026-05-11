import React, { useEffect, useState } from 'react';
import { FIN } from '../../services/api';
import { Card, CardHead, Badge, Empty, Loading, Btn, FormBox, Field, Input, toast } from '../../components/UI';

export default function Employees() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', salary: '', email: '', phone: '' });

  const load = async () => {
    try {
      const r = await FIN.getEmployees();
      setData(r.data);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await FIN.addEmployee({ ...form, salary: parseFloat(form.salary) });
      toast('HR Record Created! 📑');
      setShowForm(false);
      setForm({ name: '', role: '', salary: '', email: '', phone: '' });
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  if (loading) return <Loading />;

  // Analytics for the HR Manager
  const totalMonthlyPayroll = data.reduce((acc, curr) => acc + (curr.salary || 0), 0);

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER & TOP STATS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Human Resources</h1>
          <p style={{ color: '#A3AED0', fontSize: 14 }}>Internal employee database & compensation tracking</p>
        </div>
        <Btn onClick={() => setShowForm(true)} style={{ borderRadius: 14, padding: '12px 25px' }}>
          + Register Employee
        </Btn>
      </div>

      {/* HR INSIGHTS BAR */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
          <div style={hrStatCard}>
              <span style={statLabel}>TOTAL HEADCOUNT</span>
              <div style={{ ...statValue, color: '#0052FF' }}>{data.length} Members</div>
          </div>
          <div style={hrStatCard}>
              <span style={statLabel}>ESTIMATED MONTHLY PAYROLL</span>
              <div style={{ ...statValue, color: '#059669' }}>${totalMonthlyPayroll.toLocaleString()}</div>
          </div>
          <div style={hrStatCard}>
              <span style={statLabel}>RECORDS STATUS</span>
              <div style={{ ...statValue, color: '#1B2559' }}>100% Verified</div>
          </div>
      </div>

      {showForm && (
        <FormBox title="📝 New Employee File" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleAdd} style={{ padding: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Full Name *"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Full Name" /></Field>
              <Field label="Professional Role *"><Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Executive Chef" required /></Field>
              <Field label="Monthly Salary ($)"><Input type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="0.00" /></Field>
              <Field label="Contact Email"><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@company.com" /></Field>
              <Field label="Phone Number" style={{ gridColumn: 'span 2' }}><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" /></Field>
            </div>
            <Btn type="submit" style={{ width: '100%', padding: 16, fontSize: 16, fontWeight: 700 }}>Save HR Record</Btn>
          </form>
        </FormBox>
      )}

      {/* EMPLOYEES GRID */}
      <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: 25 }}>
          {data.length === 0 ? <Empty text="No internal records found." /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
              {data.map(emp => (
                <div key={emp.id} style={employeeCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={avatarStyle}>{emp.name?.[0]?.toUpperCase()}</div>
                    <div style={{ marginLeft: 15, flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#1B2559' }}>{emp.name}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0052FF' }}>{emp.role.toUpperCase()}</div>
                    </div>
                    <Badge status={emp.status || 'active'} />
                  </div>
                  
                  <div style={contactBoxStyle}>
                    <div style={{ fontSize: 13, color: '#718096' }}>📧 {emp.email || 'No email registered'}</div>
                    <div style={{ fontSize: 13, color: '#718096', marginTop: 5 }}>📞 {emp.phone || 'No phone registered'}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 15, borderTop: '1px solid #F4F7FE' }}>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#A3AED0' }}>BASE SALARY</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>
                           {emp.salary ? `$${emp.salary.toLocaleString()}` : 'N/A'}
                        </div>
                    </div>
                    <button style={editBtnStyle}>View Profile</button>
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

const hrStatCard = { flex: 1, background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '5px' };
const statLabel = { fontSize: '11px', fontWeight: 800, color: '#A3AED0', letterSpacing: '0.8px' };
const statValue = { fontSize: '24px', fontWeight: 900 };

const employeeCardStyle = {
    background: '#fff',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid #E9EDF7',
    transition: '0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
};

const avatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '14px',
    background: '#F4F7FE',
    color: '#0052FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '900',
    fontFamily: 'Syne'
};

const contactBoxStyle = {
    marginTop: '20px',
    padding: '12px 15px',
    background: '#F8FAFF',
    borderRadius: '12px'
};

const editBtnStyle = {
    background: 'none',
    border: '1px solid #E2E8F0',
    padding: '8px 15px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer'
};
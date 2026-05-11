import React, { useEffect, useState } from 'react';
import { REST } from '../../services/api';
import { Card, CardHead, Empty, Loading, Btn, FormBox, Field, Input, toast } from '../../components/UI';

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '4' });

  const load = async () => {
    try {
      const r = await REST.getTables();
      setTables(r.data);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.tableNumber) { toast('Table number required', 'error'); return; }
    try {
      await REST.addTable({ tableNumber: +form.tableNumber, capacity: +form.capacity || 4 });
      toast(`Table ${form.tableNumber} added to floor! 🪑`);
      setShowForm(false);
      setForm({ tableNumber: '', capacity: '4' });
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  if (loading) return <Loading />;

  const statusColor = { available: '#00C48C', occupied: '#F59E0B', reserved: '#0052FF' };

  // Calculations for Floor Stats
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0;

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Floor Management</h1>
          <p style={{ color: '#A3AED0', fontSize: 14 }}>Live floor plan and table occupancy status</p>
        </div>
        <Btn onClick={() => setShowForm(true)} style={{ borderRadius: 12, padding: '12px 25px', boxShadow: '0 10px 20px rgba(0,82,255,0.15)' }}>
          + Add New Table
        </Btn>
      </div>

      {/* QUICK FLOOR STATS */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
          <div style={floorStatCard}>
              <span style={statLabel}>TOTAL TABLES</span>
              <div style={statValue}>{tables.length}</div>
          </div>
          <div style={floorStatCard}>
              <span style={statLabel}>OCCUPANCY RATE</span>
              <div style={{ ...statValue, color: '#F59E0B' }}>{occupancyRate}%</div>
          </div>
          <div style={floorStatCard}>
              <span style={statLabel}>AVAILABLE NOW</span>
              <div style={{ ...statValue, color: '#00C48C' }}>{tables.length - occupiedCount}</div>
          </div>
      </div>

      {showForm && (
        <FormBox title="🪑 Design New Table" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleAdd} style={{ padding: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Table Identifier"><Input type="number" value={form.tableNumber} onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))} placeholder="e.g. 10" required /></Field>
              <Field label="Max Capacity"><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="4" /></Field>
            </div>
            <Btn type="submit" style={{ width: '100%', padding: 15, fontSize: 16, fontWeight: 700 }}>Confirm & Add to Floor</Btn>
          </form>
        </FormBox>
      )}

      {/* LIVE FLOOR GRID */}
      <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#1B2559' }}>Restaurant Floor Plan</h3>
            <div style={{ display: 'flex', gap: 15 }}>
              {Object.entries(statusColor).map(([status, color]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#A3AED0', textTransform: 'uppercase' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }}></div> {status}
                </div>
              ))}
            </div>
          </div>

          {tables.length === 0 ? <Empty text="Your restaurant floor is currently empty." /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 20 }}>
              {tables.sort((a, b) => a.tableNumber - b.tableNumber).map(t => (
                <div key={t.id} style={tableCardStyle(t.status, statusColor)}>
                  <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.6, marginBottom: 5 }}>TABLE</div>
                  <div style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, marginBottom: 5 }}>{t.tableNumber}</div>
                  <div style={statusBadgeStyle(t.status, statusColor)}>
                    {t.status || 'available'}
                  </div>
                  <div style={{ fontSize: 11, color: '#718096', marginTop: 12, fontWeight: 600 }}>
                    👥 Capacity: {t.capacity || 4}
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

// --- ADVANCED STYLES ---

const floorStatCard = { 
  flex: 1, 
  background: '#fff', 
  padding: '25px', 
  borderRadius: '20px', 
  boxShadow: '0 4px 12px rgba(0,0,0,0.02)', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '5px' 
};

const statLabel = { 
  fontSize: '11px', 
  fontWeight: 800, 
  color: '#A3AED0', 
  letterSpacing: '0.8px' 
};

const statValue = { 
  fontSize: '28px', 
  fontWeight: 900, 
  color: '#1B2559' 
};

const tableCardStyle = (status, colors) => ({
  background: status === 'occupied' ? '#F8FAFF' : '#fff',
  border: `2.5px solid ${colors[status || 'available']}`,
  borderRadius: '24px',
  padding: '24px 15px',
  textAlign: 'center',
  transition: '0.3s ease',
  boxShadow: status === 'occupied' ? `0 10px 20px ${colors.occupied}20` : 'none',
  position: 'relative'
});

const statusBadgeStyle = (status, colors) => ({
  fontSize: '10px',
  fontWeight: 800,
  textTransform: 'uppercase',
  padding: '4px 10px',
  borderRadius: '8px',
  background: `${colors[status || 'available']}20`,
  color: colors[status || 'available'],
  display: 'inline-block'
});
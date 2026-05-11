import React, { useEffect, useState } from 'react';
import { REST } from '../../services/api';
import { Card, CardHead, StatsGrid, Badge, Empty, Loading, Btn, toast } from '../../components/UI';
// Analytics ke liye Recharts use karenge (Highly Recommended)
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_NEXT  = { open: 'preparing', preparing: 'ready', ready: 'paid' };
const STATUS_LABEL = { open: '→ Preparing', preparing: '→ Ready', ready: '→ Mark Paid' };

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, o] = await Promise.all([REST.getStats(), REST.getTodayOrders()]);
      setStats(s.data); 
      setOrders(o.data.orders || []);
    } catch (e) { 
      toast(e.message, 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    load(); 
    const t = setInterval(load, 30000); 
    return () => clearInterval(t); 
  }, []);

  const advance = async (id, status) => {
    const next = STATUS_NEXT[status];
    if (!next) return;
    try { 
      await REST.updateOrderStatus(id, next); 
      toast(`Order updated to ${next.toUpperCase()} 🚀`); 
      load(); 
    } catch (e) { 
      toast(e.message, 'error'); 
    }
  };

  if (loading) return <Loading />;

  const liveOrders = orders.filter(o => ['open', 'preparing', 'ready'].includes(o.status));
  const paidOrders = orders.filter(o => o.status === 'paid');

  // Graphical Data Logic
  const chartData = [
    { name: 'Revenue', value: stats?.today?.revenue || 0, color: '#00C48C' },
    { name: 'Fees', value: stats?.today?.fees || 0, color: '#F59E0B' },
    { name: 'Profit', value: (stats?.today?.revenue - stats?.today?.fees) || 0, color: '#0052FF' }
  ];

  const statCards = [
    { label: 'Total Volume', value: `$${(+stats?.today?.revenue || 0).toFixed(2)}`, icon: '📈', color: '#0052FF' },
    { label: 'Net Payout', value: `$${(stats?.today?.revenue - stats?.today?.fees || 0).toFixed(2)}`, icon: '💰', color: '#00C48C' },
    { label: 'Platform Fees', value: `$${(+stats?.today?.fees || 0).toFixed(2)}`, icon: '⚖️', color: '#F59E0B' },
    { label: 'Order Velocity', value: `${orders.length} items`, icon: '⚡', color: '#7C3AED' },
  ];

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0 }}>
            {stats?.restaurant?.name || 'PrimePay'} Analytics
          </h1>
          <p style={{ color: '#A3AED0', margin: '5px 0 0', fontSize: 14 }}>Real-time terminal performance and sales insights</p>
        </div>
        <Btn variant="blue" onClick={load} style={{ borderRadius: 12, padding: '10px 20px' }}>
          🔄 Sync Real-time Data
        </Btn>
      </div>

      {/* STATS OVERVIEW */}
      <StatsGrid stats={statCards} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 25, marginTop: 25 }}>
        
        {/* LEFT COLUMN: LIVE ORDERS TRACKER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
          <Card style={{ borderRadius: 20, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #F4F7FE', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: '#1B2559' }}>Terminal Live Feed ({liveOrders.length})</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#A3AED0' }}>
                   <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C48C' }}></span> Active
                 </div>
              </div>
            </div>
            
            <div style={{ padding: 20 }}>
              {liveOrders.length === 0 ? <Empty text="All clear! No pending orders in the queue." /> :
                liveOrders.map(o => (
                  <div key={o.id} style={liveOrderCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <span style={tableBadgeStyle}>TABLE {o.tableNumber}</span>
                        <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 600 }}>{o.items?.length} Items Ordered</span>
                      </div>
                      <Badge status={o.status} />
                    </div>
                    
                    <div style={{ fontSize: 14, color: '#718096', marginBottom: 15 }}>
                      {o.items?.map(i => `${i.name} (${i.qty})`).join(' • ')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 15px', borderRadius: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#A3AED0' }}>Total (incl. fee)</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1B2559' }}>${(o.total || 0).toFixed(2)}</div>
                      </div>
                      {STATUS_NEXT[o.status] && (
                        <button onClick={() => advance(o.id, o.status)} style={actionButtonStyle}>
                          {STATUS_LABEL[o.status]}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: ANALYTICS & HISTORY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
          
          {/* REVENUE CHART CARD */}
          <Card style={{ borderRadius: 20, padding: 20 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 16 }}>Revenue vs Fees</h3>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* RECENT SETTLEMENTS */}
          <Card style={{ borderRadius: 20, padding: 20 }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: 16 }}>Settled Orders</h3>
            {paidOrders.length === 0 ? <Empty text="No settlements today" /> :
              paidOrders.slice(0, 6).map(o => (
                <div key={o.id} style={settledRowStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Table {o.tableNumber}</div>
                    <div style={{ fontSize: 11, color: '#A3AED0' }}>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#00C48C' }}>+${(o.total || 0).toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: '#F59E0B' }}>Fee paid</div>
                  </div>
                </div>
              ))}
          </Card>

        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const liveOrderCardStyle = {
  background: '#F7F9FF',
  borderRadius: 16,
  padding: 20,
  marginBottom: 15,
  border: '1px solid #E9EDF7',
  transition: '0.3s'
};

const tableBadgeStyle = {
  background: '#1B2559',
  color: '#fff',
  padding: '4px 10px',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 700,
  fontFamily: 'Syne'
};

const actionButtonStyle = {
  background: '#0052FF',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
  boxShadow: '0 4px 14px rgba(0, 82, 255, 0.3)'
};

const settledRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #F4F7FE'
};
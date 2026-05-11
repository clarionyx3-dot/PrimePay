import React, { useEffect, useState } from 'react';
import { REST } from '../../services/api';
import { Card, CardHead, Badge, Empty, Loading, Btn, toast } from '../../components/UI';

const NEXT  = { open: 'preparing', preparing: 'ready', ready: 'paid' };
const LABEL = { open: '→ Preparing', preparing: '→ Ready', ready: '→ Mark Paid' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('live');

  const load = async () => {
    try {
      const r = await REST.getTodayOrders();
      setOrders(r.data.orders || []);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  const advance = async (id, status) => {
    try {
      await REST.updateOrderStatus(id, NEXT[status]);
      toast(`Order moved to ${NEXT[status].toUpperCase()} 🚀`);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  if (loading) return <Loading />;

  const live = orders.filter(o => ['open', 'preparing', 'ready'].includes(o.status));
  const closed = orders.filter(o => ['paid', 'cancelled'].includes(o.status));
  const shown = filter === 'live' ? live : closed;

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER AREA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Live Transactions</h1>
          <p style={{ color: '#A3AED0', fontSize: 14, margin: '5px 0 0' }}>Monitor and settle real-time floor activity</p>
        </div>
        <Btn variant="ghost" onClick={load} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12 }}>
          🔄 Sync Feed
        </Btn>
      </div>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 25 }}>
        {[
          { key: 'live', label: 'Active Pipeline', count: live.length, color: '#0052FF' },
          { key: 'closed', label: 'Settled History', count: closed.length, color: '#64748B' }
        ].map(tab => (
          <button 
            key={tab.key} 
            onClick={() => setFilter(tab.key)} 
            style={filter === tab.key ? activeTabStyle : inactiveTabStyle}
          >
            {tab.label}
            <span style={filter === tab.key ? activeCountStyle : inactiveCountStyle}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {shown.length === 0 ? (
          <Card><Empty text={filter === 'live' ? 'No active orders on the floor.' : 'No transactions settled today.'} /></Card>
        ) : (
          shown.map(o => {
            // Logic to check if order is late (more than 15 mins old)
            const isLate = filter === 'live' && (new Date() - new Date(o.createdAt)) / 60000 > 15;

            return (
              <div key={o.id} style={orderCardStyle(isLate)}>
                
                {/* CARD HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={tableBadgeStyle}>T{o.tableNumber}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#1B2559' }}>Order #{o.id?.slice(-5).toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: '#A3AED0' }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                  <Badge status={o.status} />
                </div>

                {/* ITEMS & NOTES */}
                <div style={itemContainerStyle}>
                  {(o.items || []).map((i, idx) => (
                    <div key={idx} style={itemChipStyle}>
                      {i.name} <span style={{ color: '#0052FF', fontWeight: 800 }}>×{i.qty}</span>
                    </div>
                  ))}
                </div>

                {o.note && (
                  <div style={noteBoxStyle}>
                    <span style={{ fontWeight: 800 }}>Note:</span> {o.note}
                  </div>
                )}

                {/* FOOTER & ACTIONS */}
                <div style={footerStyle}>
                  <div style={{ display: 'flex', gap: 25 }}>
                    <div>
                      <div style={smallLabel}>SUBTOTAL</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#1B2559' }}>${(o.total - (o.platformFee || 0)).toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={smallLabel}>FEE (0.70)</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>${(o.platformFee || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: 20 }}>
                      <div style={smallLabel}>GRAND TOTAL</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#0052FF' }}>${(o.total || 0).toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    {o.placedByName && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={smallLabel}>SERVER</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#4A5568' }}>{o.placedByName}</div>
                      </div>
                    )}
                    {NEXT[o.status] && (
                      <Btn variant="blue" style={actionBtnStyle} onClick={() => advance(o.id, o.status)}>
                        {LABEL[o.status]}
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// --- ADVANCED STYLES ---

const inactiveTabStyle = { padding: '12px 24px', borderRadius: '14px', border: 'none', background: '#fff', color: '#64748B', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s' };
const activeTabStyle = { ...inactiveTabStyle, background: '#0052FF', color: '#fff', boxShadow: '0 10px 20px rgba(0, 82, 255, 0.2)' };

const inactiveCountStyle = { marginLeft: 10, background: '#F1F5F9', color: '#0052FF', padding: '2px 8px', borderRadius: '6px', fontSize: '12px' };
const activeCountStyle = { ...inactiveCountStyle, background: 'rgba(255,255,255,0.2)', color: '#fff' };

const orderCardStyle = (isLate) => ({
  background: '#fff',
  borderRadius: '24px',
  padding: '24px',
  border: isLate ? '2px solid #EE5D50' : '1px solid #E9EDF7',
  boxShadow: isLate ? '0 10px 30px rgba(238, 93, 80, 0.1)' : '0 4px 20px rgba(0,0,0,0.02)',
  transition: '0.3s ease'
});

const tableBadgeStyle = {
  width: '50px', height: '50px', borderRadius: '15px', background: '#1B2559', color: '#fff', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, fontFamily: 'Syne'
};

const itemContainerStyle = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' };
const itemChipStyle = { padding: '6px 14px', background: '#F8FAFF', borderRadius: '10px', fontSize: '13px', color: '#1B2559', fontWeight: 600, border: '1px solid #E2E8F0' };

const noteBoxStyle = { padding: '12px 16px', background: '#FFFBEB', borderRadius: '12px', fontSize: '13px', color: '#92400E', marginBottom: '20px', borderLeft: '4px solid #F59E0B' };

const footerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #F4F7FE' };
const smallLabel = { fontSize: '10px', fontWeight: 800, color: '#A3AED0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 };

const actionBtnStyle = { padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', boxShadow: '0 4px 12px rgba(0,82,255,0.2)' };
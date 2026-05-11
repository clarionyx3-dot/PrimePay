import React, { useEffect, useState } from 'react';
import { SA } from '../../services/api';
import { Card, CardHead, StatsGrid, Badge, Empty, Loading, Btn, toast } from '../../components/UI';

export default function SADashboard() {
  const [revenue, setRevenue] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [fee, setFee] = useState({ perOrderFee: 0.70 });
  const [loading, setLoading] = useState(true);

  const loadAllData = () => {
    setLoading(true);
    Promise.allSettled([SA.getRevenue(), SA.getRestaurants(), SA.getFeeConfig()])
      .then(([rev, rests, fc]) => {
        if (rev.status === 'fulfilled')   setRevenue(rev.value.data);
        if (rests.status === 'fulfilled') setRestaurants(rests.value.data);
        if (fc.status === 'fulfilled')    setFee(fc.value.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAllData(); }, []);

  if (loading) return <Loading />;

  // Modern Fintech Stats
  const stats = [
    { label: 'Total Ecosystem', value: restaurants.length, icon: '🌐', color: '#7C3AED', note: 'Registered Partners' },
    { label: 'Platform Revenue', value: `$${(revenue?.totalFees || 0).toLocaleString()}`, icon: '💎', color: '#059669', note: 'Lifetime Earnings' },
    { label: 'Network Orders', value: (revenue?.totalOrders || 0).toLocaleString(), icon: '⚡', color: '#0052FF', note: 'Processed via PrimePay' },
    { label: 'Avg. Ticket Size', value: `$${((revenue?.totalFees || 0) / (revenue?.totalOrders || 1)).toFixed(2)}`, icon: '📊', color: '#F59E0B', note: 'Earning per order' },
  ];

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER WITH SYNC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>PrimePay Central</h1>
          <p style={{ color: '#A3AED0', fontSize: 16 }}>Network-wide performance & fee settlement overview</p>
        </div>
        <Btn onClick={loadAllData} variant="ghost" style={{ background: '#fff', borderRadius: 12 }}>🔄 Force Sync</Btn>
      </div>

      <StatsGrid stats={stats} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 25, marginTop: 25 }}>
        
        {/* REVENUE SETTINGS CARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
          <Card style={{ border: '2px solid #7C3AED', background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>GLOBAL COMMISSION RATE</div>
                <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'Syne', margin: '10px 0' }}>
                  ${fee.perOrderFee?.toFixed(2)} <span style={{fontSize: 18, fontWeight: 400}}>/ order</span>
                </div>
                <p style={{ fontSize: 13, opacity: 0.9 }}>This fee is automatically deducted from every transaction across the network.</p>
              </div>
              <Btn variant="ghost" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }} onClick={() => window.location.hash = '#/sa/fees'}>
                Adjust Fee
              </Btn>
            </div>
          </Card>

          {/* TOP PARTNERS LIST */}
          <Card style={{ borderRadius: 24 }}>
            <CardHead title="Top Revenue Partners" />
            <div style={{ padding: '0 20px 20px' }}>
              {restaurants.length === 0 ? <Empty text="No active partners." /> :
                restaurants.sort((a, b) => (b.totalFeesPaid || 0) - (a.totalFeesPaid || 0)).slice(0, 5).map(r => (
                  <div key={r.id} style={partnerRowStyle}>
                    <div style={avatarStyle}>{r.name?.[0]}</div>
                    <div style={{ flex: 1, marginLeft: 15 }}>
                      <div style={{ fontWeight: 800, color: '#1B2559' }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: '#A3AED0' }}>{r.totalOrders || 0} Successful Orders</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: '#059669' }}>+${(r.totalFeesPaid || 0).toFixed(2)}</div>
                      <Badge status={r.status || 'active'} />
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* RECENT FEE LOGS */}
        <Card style={{ borderRadius: 24 }}>
          <CardHead title="Live Fee Settlements" />
          <div style={{ padding: '0 20px 20px', maxHeight: '600px', overflowY: 'auto' }}>
            {revenue?.recentTxns?.length ? (
              revenue.recentTxns.map(t => (
                <div key={t.id} style={txnRowStyle}>
                  <div style={iconCircle}>💸</div>
                  <div style={{ flex: 1, marginLeft: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1B2559' }}>{t.restaurantName}</div>
                    <div style={{ fontSize: 11, color: '#A3AED0' }}>{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#7C3AED' }}>+${(t.feeAmount || 0).toFixed(2)}</div>
                </div>
              ))
            ) : <Empty text="No transactions logged." />}
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- STYLES ---
const partnerRowStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '15px 0',
  borderBottom: '1px solid #F4F7FE'
};

const avatarStyle = {
  width: 45, height: 45, borderRadius: 12, background: '#F4F7FE', color: '#7C3AED',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900
};

const txnRowStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #F4F7FE'
};

const iconCircle = {
  width: 35, height: 35, borderRadius: '50%', background: '#FFF3E0', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
};
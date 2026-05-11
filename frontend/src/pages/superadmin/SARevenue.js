import React, { useEffect, useState } from 'react';
import { SA } from '../../services/api';
import { Card, CardHead, StatsGrid, ListRow, Empty, Loading, toast } from '../../components/UI';

export default function SARevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SA.getRevenue()
      .then(r => setData(r.data))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  // Financial Analytics Logic
  const totalFees = data?.totalFees || 0;
  const totalOrders = data?.totalOrders || 0;
  const avgFee = totalOrders ? (totalFees / totalOrders).toFixed(2) : '0.00';
  const restaurantCount = Object.keys(data?.byRestaurant || {}).length;

  const stats = [
    { label: 'TOTAL ECOSYSTEM REVENUE', value: `$${totalFees.toLocaleString()}`, icon: '💰', color: '#059669', note: 'Lifetime Collection' },
    { label: 'NETWORK VOLUME', value: totalOrders.toLocaleString(), icon: '🧾', color: '#0052FF', note: 'Total Orders Processed' },
    { label: 'AVG TAKE RATE', value: `$${avgFee}`, icon: '📊', color: '#7C3AED', note: 'Earning Per Transaction' },
    { label: 'ACTIVE PARTNERS', value: restaurantCount, icon: '🏪', color: '#F59E0B', note: 'Enterprise Accounts' },
  ];

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Financial Insights</h1>
          <p style={{ color: '#A3AED0', fontSize: 15 }}>Real-time platform fee collection and partner performance analytics</p>
        </div>
        <div style={liveSyncBox}>
            <span style={pulseDot}></span> LIVE SYSTEM SYNC
        </div>
      </div>

      <StatsGrid stats={stats} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 25, marginTop: 25 }}>
        
        {/* REVENUE LEADERBOARD */}
        <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <CardHead title="Top Performing Partners" />
          <div style={{ padding: '0 20px 20px' }}>
            {Object.entries(data?.byRestaurant || {}).length === 0 ? (
              <Empty text="No partner data detected yet." />
            ) : (
              Object.entries(data?.byRestaurant || {})
                .sort((a, b) => b[1].fees - a[1].fees)
                .map(([id, d], index) => (
                  <div key={id} style={revenueRowStyle}>
                    <div style={rankBadge(index)}>{index + 1}</div>
                    <div style={{ flex: 1, marginLeft: 15 }}>
                      <div style={{ fontWeight: 800, color: '#1B2559' }}>{d.restaurantName}</div>
                      <div style={{ fontSize: 11, color: '#A3AED0' }}>{d.orders} network orders</div>
                    </div>
                    <div style={{ fontWeight: 900, color: '#059669', fontSize: 16 }}>
                      ${d.fees.toLocaleString()}
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        {/* RECENT SETTLEMENTS */}
        <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <CardHead title="Recent Fee Settlements" />
          <div style={{ padding: '0 20px 20px', maxHeight: '550px', overflowY: 'auto' }}>
            {data?.recentTxns?.length ? (
              data.recentTxns.map(t => (
                <ListRow key={t.id} 
                  icon="💸" 
                  iconBg="#F0FDF4"
                  title={t.restaurantName || 'Platform Transaction'} 
                  sub={t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}
                  right={<span style={{ color: '#7C3AED', fontWeight: 900, fontSize: 16 }}>+${(t.feeAmount || 0).toFixed(2)}</span>}
                />
              ))
            ) : <Empty text="Waiting for new settlements..." />}
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- ADVANCED STYLES ---

const liveSyncBox = {
    background: '#fff',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#1B2559',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
};

const pulseDot = {
    width: '8px',
    height: '8px',
    background: '#00C48C',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 0 rgba(0, 196, 140, 0.4)',
    animation: 'pulse 2s infinite'
};

const revenueRowStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #F4F7FE'
};

const rankBadge = (index) => ({
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: index < 3 ? '#EDE9FE' : '#F4F7FE',
    color: index < 3 ? '#7C3AED' : '#A3AED0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '900'
});
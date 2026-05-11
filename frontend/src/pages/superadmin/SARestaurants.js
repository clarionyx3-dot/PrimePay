import React, { useEffect, useState } from 'react';
import { SA } from '../../services/api';
import { Card, CardHead, Badge, Empty, Loading, Btn, toast } from '../../components/UI';

export default function SARestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await SA.getRestaurants();
      // Safety check: Agar data list nahi hai toh khali list set karein
      setRestaurants(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 25 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559' }}>Network Partners</h1>
        <Btn onClick={fetchRestaurants} variant="ghost">🔄 Refresh List</Btn>
      </div>

      <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <CardHead title="All Registered Restaurants" />
        <div style={{ padding: '25px' }}>
          
          {/* MAIN SAFETY CHECK */}
          {(!Array.isArray(restaurants) || restaurants.length === 0) ? (
            <Empty text="No partners onboarded yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {restaurants.map((r) => (
                <div key={r.id} style={partnerCardStyle}>
                  {/* Avatar/Logo */}
                  <div style={avatarStyle}>{r.name?.[0] || 'R'}</div>
                  
                  {/* Info Section */}
                  <div style={{ flex: 1, marginLeft: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 18, color: '#1B2559' }}>{r.name}</span>
                      <Badge status={r.status || 'active'} />
                    </div>
                    <div style={{ fontSize: 13, color: '#A3AED0', marginTop: 4 }}>
                      {r.adminEmail} • {r.address || 'Location not set'}
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div style={{ display: 'flex', gap: 20, marginRight: 30 }}>
                    <div style={miniStatStyle}>
                      <span style={{ fontSize: 11, color: '#A3AED0' }}>ORDERS</span>
                      <div style={{ fontWeight: 800 }}>{r.totalOrders || 0}</div>
                    </div>
                    <div style={miniStatStyle}>
                      <span style={{ fontSize: 11, color: '#A3AED0' }}>REVENUE</span>
                      <div style={{ fontWeight: 800, color: '#059669' }}>
                        ${(r.totalFeesPaid || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Btn variant="ghost" style={{ border: '1px solid #E2E8F0', borderRadius: 12 }}>
                    Manage
                  </Btn>
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
const partnerCardStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '20px',
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #F4F7FE',
  transition: '0.2s ease'
};

const avatarStyle = {
  width: 55,
  height: 55,
  borderRadius: 15,
  background: '#F4F7FE',
  color: '#7C3AED',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  fontWeight: 900
};

const miniStatStyle = {
  textAlign: 'center',
  minWidth: 80
};

import React, { useEffect, useState } from 'react';
import { SA } from '../../services/api';
import { Card, Btn, Loading, toast } from '../../components/UI';

export default function SAFees() {
  const [fee, setFee] = useState({ perOrderFee: 0.70, enabled: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SA.getFeeConfig()
      .then(r => setFee(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await SA.saveFeeConfig(fee);
      toast('Platform monetization updated! 🚀');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  if (loading) return <Loading />;

  // Financial Projection Logic
  const monthlyProjection = (fee.perOrderFee * 5000).toLocaleString(); 

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Monetization Hub</h1>
        <p style={{ color: '#A3AED0', fontSize: 14 }}>Global configuration for per-transaction platform fees</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
        
        {/* MAIN CONFIG CARD */}
        <Card style={{ borderRadius: 24, padding: 30, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={infoBox}>
            <div style={{ fontSize: 20 }}>💡</div>
            <div>
               <strong style={{ display: 'block', marginBottom: 4 }}>Platform Fee Protocol</strong>
               This fee is invisible to the diner but deducted from the restaurant's payout to cover PrimePay infrastructure.
            </div>
          </div>

          <div style={{ marginBottom: 35 }}>
            <label style={labelHeader}>GLOBAL FEE PER ORDER ($)</label>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={dollarSign}>$</span>
              <input 
                type="number" 
                value={fee.perOrderFee} 
                min="0" 
                step="0.01"
                onChange={e => setFee(f => ({ ...f, perOrderFee: parseFloat(e.target.value) || 0 }))}
                style={feeInputStyle} 
              />
            </div>
          </div>

          <div style={{ marginBottom: 35 }}>
            <label style={labelHeader}>MONETIZATION STATUS</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setFee(f => ({ ...f, enabled: true }))}
                style={statusBtn(fee.enabled === true, '#00C48C')}
              >
                {fee.enabled ? '✓ ACTIVE' : 'ACTIVATE'}
              </button>
              <button 
                onClick={() => setFee(f => ({ ...f, enabled: false }))}
                style={statusBtn(fee.enabled === false, '#EF4444')}
              >
                {!fee.enabled ? '✕ DISABLED' : 'DISABLE'}
              </button>
            </div>
          </div>

          <Btn variant="purple" onClick={save} style={{ width: '100%', padding: 18, fontSize: 16, fontWeight: 800 }}>
            Authorize & Apply Changes
          </Btn>
        </Card>

        {/* REVENUE FORECAST CARD */}
        <Card style={{ borderRadius: 24, background: '#1B2559', color: '#fff', border: 'none', padding: 30 }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 20, marginTop: 0 }}>Revenue Projection</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Estimated monthly income based on platform usage.</p>
            
            <div style={{ marginTop: 40 }}>
                <div style={forecastRow}>
                    <span>5,000 Orders/mo</span>
                    <strong style={{ color: '#00C48C' }}>+${monthlyProjection}</strong>
                </div>
                <div style={forecastRow}>
                    <span>10,000 Orders/mo</span>
                    <strong style={{ color: '#00C48C' }}>+${(fee.perOrderFee * 10000).toLocaleString()}</strong>
                </div>
                <div style={forecastRow}>
                    <span>50,000 Orders/mo</span>
                    <strong style={{ color: '#00C48C' }}>+${(fee.perOrderFee * 50000).toLocaleString()}</strong>
                </div>
            </div>

            <div style={platformTip}>
                <span style={{ fontSize: 12, fontWeight: 800 }}>PRO TIP:</span>
                <p style={{ fontSize: 12, margin: '5px 0 0', opacity: 0.8 }}>
                    Most modern POS systems charge between $0.50 and $1.00 per order to cover processing costs.
                </p>
            </div>
        </Card>
      </div>
    </div>
  );
}

// --- STYLES ---
const infoBox = { background: '#F5F3FF', borderRadius: '16px', padding: '20px', marginBottom: '35px', fontSize: '13px', color: '#5B21B6', lineHeight: '1.6', display: 'flex', gap: '15px', border: '1px solid #DDD6FE' };
const labelHeader = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#A3AED0', marginBottom: '15px', letterSpacing: '1px' };
const dollarSign = { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '24px', fontWeight: '800', color: '#7C3AED' };
const feeInputStyle = { padding: '15px 15px 15px 40px', border: '2px solid #E9EDF7', borderRadius: '16px', fontSize: '32px', fontWeight: '900', fontFamily: 'Syne', color: '#1B2559', width: '200px', outline: 'none', background: '#F8FAFC' };
const statusBtn = (active, color) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: active ? `2px solid ${color}` : '2px solid #E9EDF7', background: active ? `${color}15` : '#fff', color: active ? color : '#718096', fontWeight: '800', fontSize: '12px', cursor: 'pointer' });
const forecastRow = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '15px' };
const platformTip = { marginTop: '50px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #7C3AED' };
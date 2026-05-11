import React, { useEffect, useState } from 'react';
import { FIN } from '../../services/api';
import { Card, CardHead, Badge, ListRow, Empty, Loading, Btn, FormBox, Field, Input, toast } from '../../components/UI';

export default function CreditLine() {
  const [credit, setCredit] = useState(null);
  const [txns, setTxns]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState('overview'); 
  const [amount, setAmount] = useState('');
  const [applyForm, setApplyForm] = useState({ businessName: '', monthlyRevenue: '', requestedAmount: '' });

  const load = async () => {
    try {
      const [c, t] = await Promise.allSettled([FIN.getCredit(), FIN.getCreditTxns()]);
      if (c.status === 'fulfilled') setCredit(c.value.data);
      if (t.status === 'fulfilled') setTxns(t.value.data);
    } catch (e) {
      console.error("Credit load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await FIN.applyCredit({ 
        ...applyForm, 
        monthlyRevenue: +applyForm.monthlyRevenue, 
        requestedAmount: +applyForm.requestedAmount 
      });
      toast('Application under technical review! 🏦');
      setView('overview');
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  const handleDraw = async (e) => {
    e.preventDefault();
    try {
      const r = await FIN.drawCredit(+amount);
      toast('Funds disbursed to your account! 💸');
      setAmount('');
      setView('overview');
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  const handleRepay = async (e) => {
    e.preventDefault();
    try {
      const r = await FIN.repayCredit(+amount);
      toast('Repayment successful. Credit limit restored! ✅');
      setAmount('');
      setView('overview');
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  if (loading) return <Loading />;

  const approved = credit?.approvedAmount || 0;
  const used = credit?.usedAmount || 0;
  const available = approved - used;
  const pct = approved > 0 ? Math.min(100, Math.round((used / approved) * 100)) : 0;

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Business Capital</h1>
          <p style={{ color: '#A3AED0', fontSize: 14 }}>Access flexible funding for your restaurant growth</p>
        </div>
        {!credit && <Btn onClick={() => setView('apply')}>Apply for Funding</Btn>}
      </div>

      {/* MODALS / FORMS */}
      {view === 'apply' && (
        <FormBox title="🚀 PrimePay Capital Application" onCancel={() => setView('overview')}>
          <form onSubmit={handleApply} style={{ padding: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Legal Business Name"><Input value={applyForm.businessName} onChange={e => setApplyForm(f => ({ ...f, businessName: e.target.value }))} required /></Field>
              <Field label="Avg Monthly Sales ($)"><Input type="number" value={applyForm.monthlyRevenue} onChange={e => setApplyForm(f => ({ ...f, monthlyRevenue: e.target.value }))} required /></Field>
              <Field label="Amount Needed ($)"><Input type="number" value={applyForm.requestedAmount} onChange={e => setApplyForm(f => ({ ...f, requestedAmount: e.target.value }))} required /></Field>
              <div style={infoBoxStyle}>
                Our system analyzes your PrimePay transaction history to approve limits instantly.
              </div>
            </div>
            <Btn type="submit" style={{ width: '100%', padding: 15 }}>Submit for Approval</Btn>
          </form>
        </FormBox>
      )}

      {(view === 'draw' || view === 'repay') && (
        <FormBox title={view === 'draw' ? '💰 Draw Capital' : '💳 Make Repayment'} onCancel={() => setView('overview')}>
          <form onSubmit={view === 'draw' ? handleDraw : handleRepay} style={{ padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#64748B', marginBottom: 15 }}>Enter amount to {view}</div>
            <Input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="0.00" 
              required 
              style={amountInputStyle} 
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 25 }}>
               <Btn type="submit" style={{ flex: 1, padding: 15 }}>Confirm {view === 'draw' ? 'Withdrawal' : 'Payment'}</Btn>
            </div>
          </form>
        </FormBox>
      )}

      {/* MAIN CONTENT */}
      {credit ? (
        <div style={heroCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 1 }}>ACTIVE CREDIT LINE</div>
              <div style={{ fontFamily: 'Syne', fontSize: 42, fontWeight: 900, marginTop: 5 }}>${approved.toLocaleString()}</div>
            </div>
            <Badge status={credit.status || 'pending'} label={credit.status?.toUpperCase()} />
          </div>

          {/* Progress Bar */}
          <div style={{ background: 'rgba(255,255,255,0.1)', height: 12, borderRadius: 20, overflow: 'hidden', marginBottom: 15, position: 'relative' }}>
            <div style={{ 
              background: 'linear-gradient(90deg, #4285F4, #34A853)', 
              height: '100%', 
              width: `${pct}%`, 
              boxShadow: '0 0 15px rgba(66, 133, 244, 0.5)' 
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <div>Used: <strong style={{ color: '#EE5D50', fontSize: 16 }}>${used.toLocaleString()}</strong></div>
            <div style={{ textAlign: 'center' }}>Available: <strong style={{ color: '#34A853', fontSize: 16 }}>${available.toLocaleString()}</strong></div>
            <div style={{ textAlign: 'right' }}>Interest: <strong>{credit.interestRate || 8.5}% APR</strong></div>
          </div>

          {credit.status === 'approved' && (
            <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
              <button onClick={() => setView('draw')} style={primaryActionBtn}>Draw Funds</button>
              <button onClick={() => setView('repay')} style={secondaryActionBtn}>Repay Balance</button>
            </div>
          )}
        </div>
      ) : view === 'overview' && (
        <Card><Empty text="No credit facility active. Start growing your business today." /></Card>
      )}

      {/* TRANSACTION LOG */}
      <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
        <CardHead title="Recent Capital Activity" />
        <div style={{ padding: '0 20px 20px' }}>
          {txns.length === 0 ? <Empty text="No transaction history yet." /> :
            txns.map(t => (
              <div key={t.id} style={txnRowStyle}>
                <div style={t.type === 'draw' ? iconDraw : iconRepay}>
                    {t.type === 'draw' ? '↘' : '↖'}
                </div>
                <div style={{ flex: 1, marginLeft: 15 }}>
                  <div style={{ fontWeight: 800, color: '#1B2559', textTransform: 'capitalize' }}>Capital {t.type}</div>
                  <div style={{ fontSize: 11, color: '#A3AED0' }}>{new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 900, color: t.type === 'draw' ? '#EE5D50' : '#059669', fontSize: 16 }}>
                  {t.type === 'draw' ? '-' : '+'}${t.amount.toFixed(2)}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}

// --- STYLES ---
const heroCardStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '28px',
    padding: '35px',
    color: '#fff',
    marginBottom: '30px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.05)'
};

const txnRowStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #F4F7FE'
};

const iconDraw = { width: 40, height: 40, borderRadius: 12, background: '#FFF1F2', color: '#EE5D50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 };
const iconRepay = { width: 40, height: 40, borderRadius: 12, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 };

const primaryActionBtn = { flex: 1, padding: '14px', background: '#0052FF', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', transition: '0.3s' };
const secondaryActionBtn = { flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' };

const amountInputStyle = { fontSize: '32px', fontWeight: 800, textAlign: 'center', border: 'none', borderBottom: '2px solid #E2E8F0', width: '100%', outline: 'none', color: '#1B2559' };
const infoBoxStyle = { gridColumn: '1 / span 2', background: '#F8FAFF', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#0052FF', border: '1px solid #D6E4FF' };
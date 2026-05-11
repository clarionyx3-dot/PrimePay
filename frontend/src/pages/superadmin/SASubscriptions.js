import React, { useEffect, useState } from 'react';
import { SA } from '../../services/api'; // Super Admin API service
import { Card, Badge, Btn, Loading, toast, FormBox, Field, Input } from '../../components/UI';

export default function SASubscriptions() {
  const [plans, setPlans] = useState([
    { id: 'p1', name: 'Starter', price: 29, features: 'Basic POS, 50 Items', color: '#64748B' },
    { id: 'p2', name: 'Pro Business', price: 79, features: 'Inventory, Payroll, Unlimited Items', color: '#0052FF' },
    { id: 'p3', name: 'Enterprise', price: 149, features: 'Credit Line, Multi-outlet, 24/7 Support', color: '#1B2559' }
  ]);
  const [activeSubs, setActiveSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);

  useEffect(() => {
    // Super Admin level subscription fetch logic
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      // const res = await SA.getAllSubscriptions();
      // setActiveSubs(res.data);
      setLoading(false);
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Subscription Engine</h1>
          <p style={{ color: '#A3AED0', fontSize: 14 }}>Manage global plans and recurring revenue models</p>
        </div>
        <Btn onClick={() => setShowPlanForm(true)}>+ Create New Plan</Btn>
      </div>

      {/* PRICING TIERS (LIVE PREVIEW) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
        {plans.map(plan => (
          <div key={plan.id} style={planCardStyle(plan.color)}>
            <div style={{ fontSize: '12px', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{plan.name}</div>
            <div style={{ fontSize: '36px', fontWeight: 900 }}>${plan.price}<small style={{ fontSize: 14, fontWeight: 400 }}>/mo</small></div>
            <div style={{ margin: '20px 0', fontSize: '14px', lineHeight: '1.6', opacity: 0.9 }}>
              {plan.features.split(',').map((f, i) => <div key={i}>✅ {f.trim()}</div>)}
            </div>
            <button style={editPlanBtn}>Configure Plan</button>
          </div>
        ))}
      </div>

      {/* ACTIVE SUBSCRIPTIONS TABLE */}
      <Card>
        <CardHead title="Recent Activations" />
        <div style={{ padding: '0 20px 20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#A3AED0', fontSize: '12px', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '15px 0' }}>RESTAURANT</th>
                <th>PLAN</th>
                <th>STATUS</th>
                <th>NEXT BILLING</th>
                <th>REVENUE</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy Data for UI Feel */}
              {[
                { name: 'Bundu Khan', plan: 'Enterprise', status: 'active', date: 'June 10, 2026', rev: '$149.00' },
                { name: 'Cafe Flo', plan: 'Pro Business', status: 'active', date: 'June 12, 2026', rev: '$79.00' },
                { name: 'Student Biryani', plan: 'Starter', status: 'past_due', date: 'May 05, 2026', rev: '$29.00' }
              ].map((sub, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F4F7FE', fontSize: '14px' }}>
                  <td style={{ padding: '18px 0', fontWeight: 700, color: '#1B2559' }}>{sub.name}</td>
                  <td><Badge label={sub.plan} /></td>
                  <td><Badge status={sub.status} /></td>
                  <td style={{ color: '#64748B' }}>{sub.date}</td>
                  <td style={{ fontWeight: 800, color: '#059669' }}>{sub.rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showPlanForm && (
        <FormBox title="New Revenue Tier" onCancel={() => setShowPlanForm(false)}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Plan Name"><Input placeholder="e.g. Platinum" /></Field>
              <Field label="Monthly Price ($)"><Input type="number" placeholder="99" /></Field>
              <Field label="Features (Comma separated)" style={{ gridColumn: 'span 2' }}>
                <Input placeholder="Inventory, Multi-user, API Access" />
              </Field>
           </div>
           <Btn style={{ width: '100%', marginTop: 20 }}>Deploy Plan</Btn>
        </FormBox>
      )}
    </div>
  );
}

// --- STYLES ---
const planCardStyle = (color) => ({
  background: color,
  padding: '35px',
  borderRadius: '24px',
  color: '#fff',
  boxShadow: `0 15px 35px ${color}40`,
  transition: '0.3s',
  cursor: 'pointer'
});

const editPlanBtn = {
  width: '100%',
  padding: '12px',
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '12px',
  color: '#fff',
  fontWeight: 700,
  marginTop: '20px',
  cursor: 'pointer'
};

const receiptLineStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '14px' };
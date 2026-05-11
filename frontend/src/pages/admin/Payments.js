// src/pages/admin/Payments.js
import React, { useEffect, useState } from 'react';
import { FIN } from '../../services/api';
import { Card, CardHead, Badge, ListRow, Empty, Loading, Btn, FormBox, Field, Input, Select, toast } from '../../components/UI';

export default function Payments() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ recipient: '', amount: '', method: 'bank_transfer', note: '' });

  const load = async () => {
    try { const r = await FIN.getPayments(); setData(r.data); }
    catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await FIN.createPayment({ ...form, amount: parseFloat(form.amount) });
      toast('Payment created!'); setShowForm(false);
      setForm({ recipient: '', amount: '', method: 'bank_transfer', note: '' });
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Payments</h1><p>Track all outgoing payments</p></div>
        <Btn onClick={() => setShowForm(s => !s)}>+ New Payment</Btn>
      </div>

      {showForm && (
        <FormBox title="New Payment" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Recipient *"><Input value={form.recipient} onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))} placeholder="Company / Person" required /></Field>
              <Field label="Amount ($) *"><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" required /></Field>
              <Field label="Method">
                <Select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </Select>
              </Field>
              <Field label="Note"><Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note" /></Field>
            </div>
            <Btn type="submit">Submit Payment</Btn>
          </form>
        </FormBox>
      )}

      <Card>
        <CardHead title={`Payments (${data.length})`} />
        {data.length === 0 ? <Empty text="No payments yet" /> :
          data.map(p => (
            <ListRow key={p.id} icon="💳" iconBg="#E8F0FF"
              title={p.recipient}
              sub={`${p.method} · ${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}`}
              right={<span style={{ color: '#0052FF' }}>${(p.amount || 0).toFixed(2)}</span>}
              extra={<div style={{ marginTop: 3 }}><Badge status={p.status || 'pending'} /></div>}
            />
          ))}
      </Card>
    </div>
  );
}

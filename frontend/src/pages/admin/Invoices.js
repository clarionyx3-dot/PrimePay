import React, { useEffect, useState } from 'react';
import { FIN } from '../../services/api';
import { Card, CardHead, Badge, Empty, Loading, Btn, FormBox, Field, Input, toast } from '../../components/UI';

export default function Invoices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientName: '', amount: '', dueDate: '', note: '' });

  const load = async () => {
    try {
      const r = await FIN.getInvoices();
      setData(r.data);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Professional Invoice Number generate karna (e.g., INV-1001)
      const invNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      await FIN.createInvoice({ 
        ...form, 
        invoiceNumber: invNumber,
        amount: parseFloat(form.amount),
        status: 'pending' 
      });
      toast('Professional Invoice Generated! 📄');
      setShowForm(false);
      setForm({ clientName: '', amount: '', dueDate: '', note: '' });
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  const markPaid = async (id) => {
    try {
      await FIN.updateInvoice(id, { status: 'paid' });
      toast('Payment Settled! 💰');
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  // Financial Stats Calculation
  const totalPending = data.filter(i => i.status === 'pending').reduce((a, b) => a + b.amount, 0);
  const totalReceived = data.filter(i => i.status === 'paid').reduce((a, b) => a + b.amount, 0);

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E293B', margin: 0, fontFamily: 'Syne' }}>Accounts Receivable</h1>
          <p style={{ color: '#64748B', fontSize: 14 }}>Manage B2B billing and catering invoices</p>
        </div>
        <Btn onClick={() => setShowForm(true)} style={{ borderRadius: 12, padding: '12px 24px' }}>
          + Generate New Invoice
        </Btn>
      </div>

      {/* FINANCIAL SUMMARY CARDS */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
          <div style={financeCard('#0052FF')}>
              <span style={labelStyle}>PENDING PAYMENTS</span>
              <div style={valueStyle}>${totalPending.toLocaleString()}</div>
          </div>
          <div style={financeCard('#00C48C')}>
              <span style={labelStyle}>TOTAL RECEIVED</span>
              <div style={valueStyle}>${totalReceived.toLocaleString()}</div>
          </div>
          <div style={financeCard('#64748B')}>
              <span style={labelStyle}>INVOICE COUNT</span>
              <div style={valueStyle}>{data.length} Issued</div>
          </div>
      </div>

      {showForm && (
        <FormBox title="📝 Create Client Invoice" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleCreate} style={{ padding: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Client Name / Company"><Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="e.g. Corporate Events Inc." required /></Field>
              <Field label="Amount to Charge ($)"><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" required /></Field>
              <Field label="Payment Due Date"><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></Field>
              <Field label="Memo / Note"><Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Reference or PO Number" /></Field>
            </div>
            <Btn type="submit" style={{ width: '100%', padding: 15 }}>Finalize & Issue Invoice</Btn>
          </form>
        </FormBox>
      )}

      {/* INVOICE GRID */}
      <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: 25 }}>
          {data.length === 0 ? <Empty text="No invoices issued yet." /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {data.map(inv => (
                <div key={inv.id} style={invoiceCardStyle(inv.status)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#0052FF', marginBottom: 4 }}>{inv.invoiceNumber}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{inv.clientName}</div>
                        </div>
                        <Badge status={inv.status === 'paid' ? 'active' : 'pending'} label={inv.status.toUpperCase()} />
                    </div>
                    
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 15 }}>
                        <div>📅 Due: {inv.dueDate || 'Immediate'}</div>
                        {inv.note && <div style={{ marginTop: 5, fontStyle: 'italic' }}>📌 {inv.note}</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 15 }}>
                        <div>
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>AMOUNT DUE</span>
                            <div style={{ fontSize: 20, fontWeight: 900, color: '#1E293B' }}>${inv.amount.toFixed(2)}</div>
                        </div>
                        {inv.status === 'pending' && (
                            <Btn variant="green" size="sm" onClick={() => markPaid(inv.id)}>Mark as Paid</Btn>
                        )}
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

// --- STYLES ---
const financeCard = (color) => ({
    flex: 1, background: '#fff', padding: '25px', borderRadius: '20px', borderLeft: `6px solid ${color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
});
const labelStyle = { fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' };
const valueStyle = { fontSize: '26px', fontWeight: 900, color: '#1E293B', marginTop: '5px' };

const invoiceCardStyle = (status) => ({
    background: '#fff',
    padding: '20px',
    borderRadius: '18px',
    border: '1px solid #E2E8F0',
    position: 'relative',
    transition: '0.3s',
    boxShadow: status === 'pending' ? '0 10px 20px rgba(0,0,0,0.02)' : 'none',
    opacity: status === 'paid' ? 0.8 : 1
});
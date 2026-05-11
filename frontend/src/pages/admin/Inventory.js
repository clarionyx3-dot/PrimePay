import React, { useEffect, useState } from 'react';
import { FIN } from '../../services/api';
import { Card, CardHead, Badge, Empty, Loading, Btn, FormBox, Field, Input, Select, toast } from '../../components/UI';

export default function Inventory() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [form, setForm] = useState({ name: '', sku: '', price: '', stock: '', category: 'General' });

  const load = async () => {
    try {
      const r = await FIN.getInventory();
      setData(r.data);
      setFilteredData(r.data);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Filter Logic
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter(i => i.category === activeFilter));
    }
  }, [activeFilter, data]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await FIN.addInventory({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) });
      toast('Item added to Vault! 📦');
      setShowForm(false);
      setForm({ name: '', sku: '', price: '', stock: '', category: 'General' });
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will remove the item from stock tracking.')) return;
    try {
      await FIN.deleteInventory(id);
      toast('Item removed');
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  // Calculations for Admin Stats
  const totalStockValue = data.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
  const lowStockItems = data.filter(i => i.stock < 10 && i.stock > 0).length;

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '30px', background: '#F4F7FE', minHeight: '100vh' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B2559', margin: 0, fontFamily: 'Syne' }}>Inventory Vault</h1>
          <p style={{ color: '#A3AED0', fontSize: 14 }}>Real-time stock tracking & valuation</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" onClick={load}>🔄 Sync</Btn>
            <Btn onClick={() => setShowForm(true)}>+ Add New Stock</Btn>
        </div>
      </div>

      {/* QUICK STATS BARS */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
          <div style={miniStatCard}>
              <span style={{ fontSize: 12, color: '#A3AED0', fontWeight: 700 }}>TOTAL INVENTORY VALUE</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>${totalStockValue.toLocaleString()}</div>
          </div>
          <div style={miniStatCard}>
              <span style={{ fontSize: 12, color: '#A3AED0', fontWeight: 700 }}>LOW STOCK ALERTS</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#E11D48' }}>{lowStockItems} Items</div>
          </div>
          <div style={miniStatCard}>
              <span style={{ fontSize: 12, color: '#A3AED0', fontWeight: 700 }}>TOTAL SKU COUNT</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1B2559' }}>{data.length} Items</div>
          </div>
      </div>

      {/* CATEGORY FILTERS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 5 }}>
          {['All', 'General', 'Food', 'Beverages', 'Equipment', 'Packaging'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCat(cat)}
                style={activeFilter === cat ? activeTabStyle : tabStyle}
              >
                  {cat}
              </button>
          ))}
      </div>

      {showForm && (
        <FormBox title="🚀 Add Item to Inventory" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleAdd} style={{ padding: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <Field label="Item Name"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Burger Buns" /></Field>
              <Field label="SKU (Bar-code)"><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU-8829" /></Field>
              <Field label="Category">
                <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['General', 'Food', 'Beverages', 'Equipment', 'Packaging'].map(c => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Cost Price ($)"><Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></Field>
              <Field label="Initial Stock"><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required /></Field>
            </div>
            <Btn type="submit" style={{ width: '100%', padding: 15 }}>Authorize & Add Stock</Btn>
          </form>
        </FormBox>
      )}

      {/* INVENTORY LIST */}
      <Card style={{ borderRadius: 20, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: 20 }}>
          {filteredData.length === 0 ? <Empty text="No items found in this category." /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 15 }}>
              {filteredData.map(item => (
                <div key={item.id} style={itemCardStyle(item.stock)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#A3AED0', textTransform: 'uppercase' }}>{item.category}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1B2559', margin: '4px 0' }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>SKU: {item.sku || 'N/A'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#0052FF' }}>${item.price.toFixed(2)}</div>
                            <span style={{ fontSize: 10, color: '#A3AED0' }}>Per Unit</span>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 15px', borderRadius: 12 }}>
                        <div>
                            <span style={{ fontSize: 12, color: '#718096' }}>Stock Status:</span>
                            <div style={{ fontWeight: 800, color: item.stock < 10 ? '#E11D48' : '#059669' }}>
                                {item.stock <= 0 ? 'OUT OF STOCK' : `${item.stock} Units Left`}
                            </div>
                        </div>
                        <Btn variant="red" size="sm" onClick={() => handleDelete(item.id)}>🗑️</Btn>
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
const miniStatCard = { flex: 1, background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '5px' };
const itemCardStyle = (stock) => ({
    background: stock <= 0 ? '#FFF1F2' : stock < 10 ? '#FFFBEB' : '#F8FAFF',
    padding: '20px',
    borderRadius: '16px',
    border: `1.5px solid ${stock <= 0 ? '#FECDD3' : stock < 10 ? '#FEF3C7' : '#E9EDF7'}`,
    transition: '0.3s'
});

const tabStyle = { padding: '8px 20px', borderRadius: '12px', border: 'none', background: '#fff', color: '#64748B', fontWeight: 600, cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' };
const activeTabStyle = { ...tabStyle, background: '#1B2559', color: '#fff' };
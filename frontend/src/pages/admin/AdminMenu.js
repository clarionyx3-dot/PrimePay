// src/pages/admin/AdminMenu.js
import React, { useEffect, useState } from 'react';
import { REST } from '../../services/api';
import { Card, CardHead, Badge, ListRow, Empty, Loading, Btn, FormBox, Field, Input, Select, toast } from '../../components/UI';

const CATS = ['Main', 'Starter', 'Drinks', 'Desserts', 'Specials'];

export default function AdminMenu() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ name: '', price: '', category: 'Main', emoji: '🍽️', description: '' });

  const load = async () => {
    try { const r = await REST.getAllMenu(); setItems(r.data); }
    catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast('Name and price required', 'error'); return; }
    try {
      await REST.addMenuItem({ ...form, price: parseFloat(form.price) });
      toast('Item added!');
      setShowForm(false);
      setForm({ name: '', price: '', category: 'Main', emoji: '🍽️', description: '' });
      load();
    } catch (e) { toast(e.response?.data?.error || e.message, 'error'); }
  };

  const toggleAvail = async (id, current) => {
    try { await REST.updateMenuItem(id, { available: !current }); toast(current ? 'Item hidden' : 'Item visible'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div><h1>Menu Manager</h1><p>Add, edit and manage your restaurant menu</p></div>
        <Btn onClick={() => setShowForm(s => !s)}>+ Add Item</Btn>
      </div>

      {showForm && (
        <FormBox title="New Menu Item" onCancel={() => setShowForm(false)}>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12, marginBottom: 12 }}>
              <Field label="Item Name *"><Input value={form.name} onChange={upd('name')} placeholder="e.g. Chicken Burger" required /></Field>
              <Field label="Price ($) *"><Input type="number" step="0.01" value={form.price} onChange={upd('price')} placeholder="0.00" required /></Field>
              <Field label="Emoji"><Input value={form.emoji} onChange={upd('emoji')} style={{ fontSize: 22, textAlign: 'center' }} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 14 }}>
              <Field label="Category">
                <Select value={form.category} onChange={upd('category')}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Description">
                <Input value={form.description} onChange={upd('description')} placeholder="Short description (optional)" />
              </Field>
            </div>
            <Btn type="submit">Add Item</Btn>
          </form>
        </FormBox>
      )}

      <Card>
        <CardHead title={`Menu Items (${items.length})`} />
        {items.length === 0 ? <Empty text="No menu items yet. Click '+ Add Item' to start." /> :
          items.map(item => (
            <ListRow key={item.id}
              icon={item.emoji || '🍽️'} iconBg="#F4F6FB"
              title={item.name}
              sub={`${item.category}${item.description ? ' · ' + item.description : ''}`}
              right={<span style={{ color: '#0052FF', fontWeight: 700 }}>${(item.price || 0).toFixed(2)}</span>}
              extra={<div style={{ marginTop: 3 }}><Badge status={item.available !== false ? 'available' : 'hidden'} /></div>}
              actions={[
                <Btn key="t" variant="ghost" size="sm" onClick={() => toggleAvail(item.id, item.available !== false)}>
                  {item.available !== false ? 'Hide' : 'Show'}
                </Btn>
              ]}
            />
          ))}
      </Card>
    </div>
  );
}
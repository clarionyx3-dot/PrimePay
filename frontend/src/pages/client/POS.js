import React, { useEffect, useState } from 'react';
import { REST } from '../../services/api';
import { Loading, Btn, toast } from '../../components/UI';

export default function POS() {
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState({});
  const [selTable, setSelTable] = useState(null);
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [note, setNote] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // --- NEW: FINANCIAL STATES ---
  const [discount, setDiscount] = useState(0); 
  const [taxRate, setTaxRate] = useState(5); // Default 5% GST

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    Promise.all([REST.getMenu(), REST.getTables()])
      .then(([m, t]) => { 
        setMenu(m.data); 
        setTables(t.data); 
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  const cats = ['All', ...new Set(menu.map(m => m.category || 'Main'))];
  
  const filtered = menu.filter(m => {
    const matchesCat = activeCat === 'All' || m.category === activeCat;
    return matchesCat && m.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const addItem = (item) => setCart(c => ({ ...c, [item.id]: { ...item, qty: (c[item.id]?.qty || 0) + 1 } }));
  const changeQty = (id, d) => setCart(c => {
    const next = { ...c, [id]: { ...c[id], qty: (c[id]?.qty || 0) + d } };
    if (next[id].qty <= 0) delete next[id];
    return next;
  });

  // --- LOGIC: ASLI FINANCIAL ENGINE ---
  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = parseFloat((taxableAmount + taxAmount).toFixed(2));

  const placeOrder = async () => {
    if (!cartItems.length || !selTable) return;
    setPlacing(true);
    try {
      const orderData = {
        tableId: selTable.id,
        tableNumber: selTable.tableNumber,
        items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        subtotal: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: total,
        note: note,
        createdAt: new Date().toISOString()
      };

      await REST.placeOrder(orderData);
      setLastOrder(orderData); 
      setShowReceipt(true); 
      toast('Order sent to Kitchen! ⚡');
      setCart({}); setNote(''); setSelTable(null); setDiscount(0);
      loadData();
    } catch (e) {
      toast(e.response?.data?.error || e.message, 'error');
    } finally { setPlacing(false); }
  };

  if (loading) return <Loading />;

  return (
    <div style={containerStyle}>
      {/* --- LEFT: MENU GRID --- */}
      <div style={leftPanelStyle}>
        <div style={headerActionStyle}>
          <input type="text" placeholder="Search dish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={searchStyle} />
          <div style={categoryWrapperStyle}>
            {cats.map(c => (
              <button key={c} onClick={() => setActiveCat(c)} style={activeCat === c ? activeTabStyle : tabStyle}>{c}</button>
            ))}
          </div>
        </div>

        <div style={gridStyle}>
          {filtered.map(item => {
            const qty = cart[item.id]?.qty || 0;
            return (
              <div key={item.id} onClick={() => addItem(item)} style={qty > 0 ? activeCardStyle : cardStyle}>
                {qty > 0 && <div style={badgeStyle}>{qty}</div>}
                <div style={imageContainerStyle}><img src={item.imageUrl || 'https://via.placeholder.com/150'} alt="" style={imgStyle} /></div>
                <div style={cardContentStyle}>
                  <span style={itemCatStyle}>{item.category}</span>
                  <div style={itemNameStyle}>{item.name}</div>
                  <div style={itemPriceStyle}>${item.price.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT: BILLING ENGINE --- */}
      <div style={rightPanelStyle}>
        <div style={cartHeaderStyle}>
          <div style={{fontFamily: 'Syne', fontSize: 18, fontWeight: 800}}>Checkout Dashboard</div>
          {selTable && <div style={tableTagStyle}>Table {selTable.tableNumber}</div>}
        </div>

        <div style={cartListStyle}>
          {cartItems.length === 0 ? (
            <div style={emptyStateStyle}><div style={{fontSize: 40}}>🛒</div><p>Cart is hungry!</p></div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} style={cartItemRowStyle}>
                <div style={cartItemInfoStyle}>
                    <div style={cartItemNameStyle}>{item.name}</div>
                    <div style={cartItemPriceStyle}>${(item.price * item.qty).toFixed(2)}</div>
                </div>
                <div style={counterStyle}>
                  <button onClick={() => changeQty(item.id, -1)} style={counterBtnStyle}>−</button>
                  <span style={{fontWeight: 700, width: 20, textAlign: 'center'}}>{item.qty}</span>
                  <button onClick={() => addItem(item)} style={counterBtnStyle}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={footerStyle}>
          <div style={{marginBottom: 15}}>
            <div style={labelStyle}>Select Table</div>
            <div style={tableGridStyle}>
              {tables.map(t => (
                <button key={t.id} onClick={() => setSelTable(t)}
                  style={selTable?.id === t.id ? activeTableBtnStyle : t.status === 'occupied' ? occupiedTableBtnStyle : tableBtnStyle}>
                  {t.tableNumber}
                </button>
              ))}
            </div>
          </div>

          {/* NEW: Financial Adjustments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 15 }}>
            <div>
              <label style={smallLabelStyle}>Discount (%)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} style={smallInputStyle} />
            </div>
            <div>
              <label style={smallLabelStyle}>Tax (GST %)</label>
              <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} style={smallInputStyle} />
            </div>
          </div>

          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Special instructions..." style={noteStyle} />

          <div style={totalContainerStyle}>
            <div style={summaryLineStyle}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={summaryLineStyle}><span>Discount</span><span style={{color: '#EF4444'}}>-${discountAmount.toFixed(2)}</span></div>
            <div style={summaryLineStyle}><span>Tax</span><span>+${taxAmount.toFixed(2)}</span></div>
            <div style={grandTotalStyle}><span>Grand Total</span><span>${total.toFixed(2)}</span></div>
          </div>

          <button onClick={placeOrder} disabled={placing || !cartItems.length || !selTable} style={orderBtnStyle(cartItems.length && selTable)}>
            {placing ? 'Processing...' : 'Place Order & Print'}
          </button>
        </div>
      </div>

      {/* --- ELITE RECEIPT --- */}
      {showReceipt && lastOrder && (
        <div style={modalOverlayStyle}>
          <div style={receiptModalStyle}>
            <div id="printable-receipt" style={{ padding: '30px', background: '#fff' }}>
              <div style={{ textAlign: 'center', marginBottom: 15 }}>
                <h2 style={{ fontFamily: 'Syne', margin: 0 }}>PRIME PAY</h2>
                <div style={{ fontSize: 12 }}>Terminal ID: #001 | Table {lastOrder.tableNumber}</div>
              </div>
              <div style={{ borderBottom: '1px dashed #000', margin: '15px 0' }}></div>
              {lastOrder.items.map((i, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span>{i.qty}x {i.name}</span>
                  <span>${(i.qty * i.price).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderBottom: '1px dashed #000', margin: '15px 0' }}></div>
              <div style={receiptLineStyle}><span>Subtotal:</span><span>${lastOrder.subtotal.toFixed(2)}</span></div>
              <div style={receiptLineStyle}><span>Discount:</span><span>-${lastOrder.discount.toFixed(2)}</span></div>
              <div style={receiptLineStyle}><span>Tax:</span><span>+${lastOrder.tax.toFixed(2)}</span></div>
              <div style={{ ...receiptLineStyle, fontWeight: 900, fontSize: 18, marginTop: 10 }}>
                <span>TOTAL:</span><span>${lastOrder.total.toFixed(2)}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: 10, marginTop: 20 }}>{new Date().toLocaleString()}</div>
            </div>
            <div style={{ padding: 20, display: 'flex', gap: 10 }}>
              <button onClick={() => window.print()} style={printBtnStyle}>🖨️ Print</button>
              <button onClick={() => setShowReceipt(false)} style={closeBtnStyle}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES (NEW & UPDATED) ---
const containerStyle = { display: 'flex', height: 'calc(100vh - 54px)', background: '#F8FAFC', overflow: 'hidden' };
const leftPanelStyle = { flex: 1, display: 'flex', flexDirection: 'column', padding: '30px', overflow: 'hidden' };
const headerActionStyle = { marginBottom: 25 };
const searchStyle = { width: '100%', padding: '15px 20px', borderRadius: '15px', border: '1px solid #E2E8F0', fontSize: '15px', marginBottom: '15px', outline: 'none' };
const categoryWrapperStyle = { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' };
const tabStyle = { padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#fff', color: '#64748B', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' };
const activeTabStyle = { ...tabStyle, background: '#0052FF', color: '#fff' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', overflowY: 'auto' };
const cardStyle = { background: '#fff', borderRadius: '20px', border: '1px solid #E2E8F0', cursor: 'pointer', position: 'relative' };
const activeCardStyle = { ...cardStyle, borderColor: '#0052FF', boxShadow: '0 8px 20px rgba(0,82,255,0.1)' };
const imageContainerStyle = { height: '130px', borderRadius: '20px 20px 0 0', overflow: 'hidden' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const cardContentStyle = { padding: '12px' };
const itemCatStyle = { fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' };
const itemNameStyle = { fontSize: '14px', fontWeight: 700, color: '#1E293B' };
const itemPriceStyle = { fontSize: '15px', fontWeight: 800, color: '#0052FF' };
const badgeStyle = { position: 'absolute', top: '10px', right: '10px', background: '#00C48C', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, zIndex: 2 };
const rightPanelStyle = { width: '420px', background: '#fff', borderLeft: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' };
const cartHeaderStyle = { padding: '25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' };
const tableTagStyle = { background: '#E8F0FF', color: '#0052FF', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 };
const cartListStyle = { flex: 1, overflowY: 'auto', padding: '0 25px' };
const emptyStateStyle = { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' };
const cartItemRowStyle = { display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #F8FAFC' };
const cartItemInfoStyle = { flex: 1 };
const cartItemNameStyle = { fontSize: '14px', fontWeight: 700 };
const cartItemPriceStyle = { fontSize: '13px', color: '#64748B' };
const counterStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: '#F1F5F9', padding: '5px 10px', borderRadius: '10px' };
const counterBtnStyle = { border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 700 };
const footerStyle = { padding: '25px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' };
const labelStyle = { fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase' };
const tableGridStyle = { display: 'flex', flexWrap: 'wrap', gap: '8px' };
const tableBtnStyle = { width: '45px', height: '45px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#fff', fontWeight: 700, cursor: 'pointer' };
const activeTableBtnStyle = { ...tableBtnStyle, background: '#0052FF', color: '#fff' };
const occupiedTableBtnStyle = { ...tableBtnStyle, background: '#FFEDD5', color: '#D97706' };
const noteStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', marginTop: '15px', resize: 'none' };
const totalContainerStyle = { marginTop: '15px', borderTop: '2px dashed #E2E8F0', paddingTop: '15px' };
const summaryLineStyle = { display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '14px', marginBottom: '5px' };
const grandTotalStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 900, color: '#1E293B' };
const orderBtnStyle = (active) => ({ width: '100%', padding: '18px', borderRadius: '15px', border: 'none', background: active ? '#0052FF' : '#CBD5E1', color: '#fff', fontSize: '16px', fontWeight: 800, cursor: active ? 'pointer' : 'not-allowed', marginTop: '15px' });
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const receiptModalStyle = { background: '#fff', width: '380px', borderRadius: '24px' };
const receiptLineStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '14px' };
const printBtnStyle = { flex: 1, padding: '14px', background: '#0052FF', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800 };
const closeBtnStyle = { flex: 1, padding: '14px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '12px', fontWeight: 700 };
const smallLabelStyle = { fontSize: '10px', fontWeight: 800, color: '#A3AED0' };
const smallInputStyle = { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' };
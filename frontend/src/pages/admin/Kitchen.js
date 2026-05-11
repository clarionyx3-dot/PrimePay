import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from '../../components/UI';

export default function Kitchen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const prevOrdersCount = useRef(0);

    // Order aane par sound bajane ke liye
    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Sound play error:", e));
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/active');
            const newOrders = res.data;
            
            // Agar naya order aaye toh bell bajao
            if (newOrders.length > prevOrdersCount.current) {
                playNotificationSound();
                toast("New Order Received! 🔔");
            }
            
            prevOrdersCount.current = newOrders.length;
            setOrders(newOrders);
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Har 5 second baad check karega
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
            toast(`Order moved to ${newStatus} status`);
            fetchOrders();
        } catch (e) { 
            toast("Status update failed", "error"); 
        }
    };

    // Timer calculation logic
    const getTimeDifference = (createdAt) => {
        const diff = Math.floor((new Date() - new Date(createdAt)) / 60000); // Minutes mein
        return diff;
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#111827', color: '#fff' }}>
            <div className="loader">Loading Kitchen...</div>
        </div>
    );

    return (
        <div style={{ padding: '30px', background: '#111827', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #374151', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, fontFamily: 'Syne' }}>👨‍🍳 Kitchen Display</h1>
                    <p style={{ color: '#9CA3AF', margin: '5px 0 0' }}>Live Orders: {orders.length}</p>
                </div>
                <div style={{ background: '#059669', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '700' }}>
                    ONLINE
                </div>
            </div>

            {/* Orders Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                {orders.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: '#1F2937', borderRadius: '20px', color: '#6B7280' }}>
                        <div style={{ fontSize: '50px' }}>😴</div>
                        <h3>No active orders. Kitchen is quiet.</h3>
                    </div>
                ) : (
                    orders.map(order => {
                        const waitTime = getTimeDifference(order.createdAt);
                        const isLate = waitTime >= 10; // 10 min se zyada ho gaye toh late

                        return (
                            <div key={order.id} style={{ 
                                background: '#1F2937', 
                                borderRadius: '18px', 
                                overflow: 'hidden', 
                                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                                border: isLate ? '2px solid #EF4444' : '1px solid #374151'
                            }}>
                                {/* Card Header */}
                                <div style={{ padding: '15px 20px', background: order.status === 'preparing' ? '#D97706' : '#2563EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '900', fontSize: '18px' }}>TABLE {order.tableNumber}</span>
                                    <span style={{ 
                                        background: isLate ? '#EF4444' : 'rgba(0,0,0,0.2)', 
                                        padding: '4px 10px', 
                                        borderRadius: '6px', 
                                        fontSize: '13px', 
                                        fontWeight: '700' 
                                    }}>
                                        {waitTime} MIN AGO
                                    </span>
                                </div>

                                {/* Items List */}
                                <div style={{ padding: '20px' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #374151' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ background: '#374151', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: '800', color: '#10B981' }}>
                                                    {item.qty}
                                                </span>
                                                <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {order.note && (
                                        <div style={{ marginTop: '15px', padding: '10px', background: '#374151', borderRadius: '8px', borderLeft: '4px solid #FCD34D' }}>
                                            <span style={{ fontSize: '12px', color: '#FCD34D', fontWeight: '700' }}>NOTE:</span>
                                            <p style={{ margin: '5px 0 0', fontSize: '14px', fontStyle: 'italic' }}>{order.note}</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                        {order.status === 'pending' ? (
                                            <button onClick={() => updateStatus(order.id, 'preparing')} style={actionBtnStyle('#D97706')}>
                                                🔥 Start Preparing
                                            </button>
                                        ) : (
                                            <button onClick={() => updateStatus(order.id, 'ready')} style={actionBtnStyle('#10B981')}>
                                                ✅ Mark as Ready
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// Button Styling
const actionBtnStyle = (bg) => ({
    flex: 1,
    padding: '14px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '14px',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
});
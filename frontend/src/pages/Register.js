import React, { useState } from 'react';
import axios from 'axios';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', ownerName: '', phone: '',
    restaurantName: '', businessAddress: '', city: '', taxId: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Firebase Auth Account Create Karna
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const restaurantId = `res_${Date.now()}`;

      // 2. User Profile (Admin) save karna Firestore mein
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, 
        email: formData.email, 
        name: formData.ownerName,
        role: 'admin', 
        restaurantId, 
        isPaid: false, 
        createdAt: new Date()
      });

      // 3. Restaurant Instance create karna
      await setDoc(doc(db, 'restaurants', restaurantId), {
        id: restaurantId, 
        name: formData.restaurantName, 
        address: formData.businessAddress,
        city: formData.city, 
        taxId: formData.taxId, 
        status: 'pending_payment',
        ownerUid: user.uid
      });

      // 4. Stripe Checkout Session create karna via Backend
      const response = await axios.post('http://localhost:5000/api/payments/create-checkout-session', {
        email: formData.email, 
        restaurantId, 
        amount: 50
      });

      // Redirect to Stripe Secure Checkout Page
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration Error: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Visual Background Decor */}
      <div style={decorCircle1}></div>
      <div style={decorCircle2}></div>

      <div style={cardStyle}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={logoMini}>PP</div>
          <h2 style={titleStyle}>Join PrimePay Network</h2>
          <p style={subtitleStyle}>Professional terminal suite for modern restaurants</p>
        </div>

        {/* STEP INDICATOR */}
        <div style={stepContainer}>
            <div style={stepIndicator(step >= 1)}>1</div>
            <div style={stepLine(step >= 2)}></div>
            <div style={stepIndicator(step === 2)}>2</div>
        </div>

        <form onSubmit={handleRegister}>
          {step === 1 ? (
            <div className="fade-in">
              <label style={labelStyle}>Owner Name</label>
              <input type="text" name="ownerName" placeholder="Full Name" onChange={handleChange} style={inputFieldStyle} required />
              
              <label style={labelStyle}>Business Email</label>
              <input type="email" name="email" placeholder="admin@restaurant.com" onChange={handleChange} style={inputFieldStyle} required />
              
              <label style={labelStyle}>Secure Password</label>
              <input type="password" name="password" placeholder="••••••••" onChange={handleChange} style={inputFieldStyle} required />
              
              <label style={labelStyle}>Phone Number</label>
              <input type="text" name="phone" placeholder="+92 3XX XXXXXXX" onChange={handleChange} style={inputFieldStyle} required />
              
              <button type="button" onClick={() => setStep(2)} style={primaryBtnStyle}>
                Next: Business Details →
              </button>
            </div>
          ) : (
            <div className="fade-in">
              <label style={labelStyle}>Restaurant Brand Name</label>
              <input type="text" name="restaurantName" placeholder="e.g. Karachi Grill" onChange={handleChange} style={inputFieldStyle} required />
              
              <label style={labelStyle}>HQ Address</label>
              <input type="text" name="businessAddress" placeholder="Street Address" onChange={handleChange} style={inputFieldStyle} required />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input type="text" name="city" placeholder="Karachi" onChange={handleChange} style={inputFieldStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Tax ID / NTN</label>
                    <input type="text" name="taxId" placeholder="99-XXXXXXX" onChange={handleChange} style={inputFieldStyle} required />
                  </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setStep(1)} style={backBtnStyle}>Back</button>
                <button type="submit" disabled={loading} style={payBtnStyle(loading)}>
                  {loading ? 'Securing Stripe...' : 'Pay $50 & Activate'}
                </button>
              </div>
              <p style={secureNote}>🔒 Secure payment via Stripe Capital</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// --- ELITE STYLING ---
const containerStyle = { background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '20px', fontFamily: 'Inter, sans-serif' };
const cardStyle = { maxWidth: '480px', width: '100%', padding: '45px', backgroundColor: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.04)', zIndex: 10 };
const logoMini = { width: '40px', height: '40px', background: '#0052FF', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 900, fontFamily: 'Syne' };
const titleStyle = { fontSize: '26px', fontWeight: 800, color: '#1B2559', marginBottom: '8px', fontFamily: 'Syne' };
const subtitleStyle = { color: '#A3AED0', fontSize: '14px', lineHeight: 1.5 };
const labelStyle = { fontSize: '11px', fontWeight: 800, color: '#1B2559', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' };
const inputFieldStyle = { width: '100%', padding: '14px 16px', marginBottom: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '15px', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' };
const primaryBtnStyle = { width: '100%', padding: '16px', background: '#0052FF', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Syne', boxShadow: '0 10px 20px rgba(0,82,255,0.15)' };
const backBtnStyle = { flex: '1', padding: '16px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' };
const payBtnStyle = (loading) => ({ flex: '2', padding: '16px', background: '#00C48C', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 });
const stepContainer = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '35px' };
const stepIndicator = (active) => ({ width: '32px', height: '32px', borderRadius: '10px', background: active ? '#0052FF' : '#E2E8F0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, transition: '0.3s' });
const stepLine = (active) => ({ height: '2px', width: '40px', background: active ? '#0052FF' : '#E2E8F0', transition: '0.3s' });
const secureNote = { textAlign: 'center', fontSize: '11px', color: '#A3AED0', marginTop: '20px', fontWeight: 600 };
const decorCircle1 = { position: 'absolute', width: '600px', height: '600px', background: 'rgba(0, 82, 255, 0.03)', borderRadius: '50%', top: '-10%', right: '-5%' };
const decorCircle2 = { position: 'absolute', width: '400px', height: '400px', background: 'rgba(0, 196, 140, 0.03)', borderRadius: '50%', bottom: '-10%', left: '-5%' };

// --- CRITICAL EXPORT ---
export default Register;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await login(email, pass);
      navigate('/');
    } catch (ex) {
      const msg = ex.code === 'auth/invalid-credential' || ex.code === 'auth/wrong-password'
        ? 'Invalid email or password. Please try again.' : ex.message;
      setErr(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={containerStyle}>
      {/* Abstract Background Blobs */}
      <div style={blob1}></div>
      <div style={blob2}></div>

      <div style={loginCardStyle}>
        {/* LOGO SECTION */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={logoIcon}>PP</div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 19, color: '#1B2559' }}>PrimePay</div>
            <div style={{ fontSize: 10, color: '#0052FF', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Terminal Suite</div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: '#1B2559', margin: '0 0 8px 0' }}>Welcome Back</h2>
        <p style={{ color: '#A3AED0', fontSize: 14, marginBottom: 30 }}>Enter your credentials to access the terminal.</p>

        {err && (
          <div style={errorStyle}>
            <span style={{ marginRight: 8 }}>⚠️</span> {err}
          </div>
        )}

        <form onSubmit={handle}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
              placeholder="admin@restaurant.com"
              style={inputFieldStyle} 
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={labelStyle}>Password</label>
              <span style={{ fontSize: 11, color: '#0052FF', fontWeight: 700, cursor: 'pointer' }}>Forgot?</span>
            </div>
            <input 
              type="password" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              required
              placeholder="••••••••"
              style={inputFieldStyle} 
            />
          </div>

          <button type="submit" disabled={loading} style={submitBtnStyle(loading)}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 13, color: '#A3AED0' }}>
              Need help? <span style={{ color: '#0052FF', fontWeight: 700, cursor: 'pointer' }}>Support Center</span>
            </p>
        </div>
      </div>
    </div>
  );
}

// --- ELITE STYLES ---

const containerStyle = { 
  minHeight: '100vh', 
  background: '#F4F7FE', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  fontFamily: 'Inter, sans-serif',
  position: 'relative',
  overflow: 'hidden'
};

const loginCardStyle = { 
  background: 'rgba(255, 255, 255, 0.95)', 
  backdropFilter: 'blur(10px)',
  borderRadius: 24, 
  padding: '45px', 
  width: 400, 
  boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
  border: '1px solid #fff',
  zIndex: 10
};

const logoIcon = { 
  width: 42, height: 42, 
  background: 'linear-gradient(135deg, #0052FF 0%, #003199 100%)', 
  borderRadius: 12, 
  display: 'flex', alignItems: 'center', justifyContent: 'center', 
  fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: '#fff',
  boxShadow: '0 8px 16px rgba(0,82,255,0.2)'
};

const labelStyle = { 
  fontSize: '12px', 
  fontWeight: '700', 
  color: '#1B2559', 
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputFieldStyle = { 
  width: '100%', 
  padding: '14px 16px', 
  border: '1px solid #E2E8F0', 
  borderRadius: '12px', 
  fontSize: '15px', 
  outline: 'none', 
  boxSizing: 'border-box',
  background: '#fff',
  transition: '0.2s ease',
  fontFamily: 'inherit'
};

const submitBtnStyle = (loading) => ({ 
  width: '100%', 
  padding: 16, 
  background: '#0052FF', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '14px', 
  fontSize: '15px', 
  fontWeight: '800', 
  cursor: loading ? 'not-allowed' : 'pointer', 
  fontFamily: 'Syne', 
  transition: '0.3s',
  opacity: loading ? 0.7 : 1,
  boxShadow: '0 10px 20px rgba(0,82,255,0.15)'
});

const errorStyle = { 
  background: '#FFF1F2', 
  color: '#EF4444', 
  padding: '12px 16px', 
  borderRadius: '12px', 
  fontSize: '13px', 
  marginBottom: 20,
  border: '1px solid #FECDD3',
  fontWeight: 600
};

const blob1 = {
    position: 'absolute', width: '600px', height: '600px',
    background: 'rgba(0, 82, 255, 0.04)', borderRadius: '50%',
    top: '-10%', left: '-5%', filter: 'blur(80px)'
};

const blob2 = {
    position: 'absolute', width: '400px', height: '400px',
    background: 'rgba(0, 196, 140, 0.04)', borderRadius: '50%',
    bottom: '-10%', right: '-5%', filter: 'blur(80px)'
};
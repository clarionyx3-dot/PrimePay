import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  // Auto-redirect to login after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={containerStyle}>
      {/* SUCCESS CARD */}
      <div style={cardStyle}>
        {/* Animated Checkmark UI */}
        <div style={checkmarkWrapper}>
          <div style={checkmarkCircle}>
            <span style={checkmarkStem}></span>
            <span style={checkmarkKick}></span>
          </div>
        </div>

        <h1 style={titleStyle}>Payment Verified!</h1>
        <p style={subtitleStyle}>
          Mubarak ho! Aapka **PrimePay Enterprise** instance activate ho chuka hai.
        </p>

        <div style={infoBoxStyle}>
            <div style={infoTitle}>Next Steps for You:</div>
            <ul style={listStyle}>
                <li>Setup your menu categories</li>
                <li>Assign restaurant tables</li>
                <li>Onboard your staff members</li>
            </ul>
        </div>

        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button style={actionBtnStyle}>
            Launch Dashboard Now
          </button>
        </Link>

        <p style={autoRedirectNote}>
            Redirecting to login automatically in 10 seconds...
        </p>
      </div>

      <div style={footerStyle}>
        © 2026 PrimePay Network. All rights reserved.
      </div>
    </div>
  );
};

// --- ELITE STYLES ---

const containerStyle = {
  minHeight: '100vh',
  background: '#F8FAFC',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, sans-serif',
  padding: '20px'
};

const cardStyle = {
  maxWidth: '450px',
  width: '100%',
  background: '#ffffff',
  borderRadius: '32px',
  padding: '50px 40px',
  textAlign: 'center',
  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.05)',
  border: '1px solid #F1F5F9'
};

const checkmarkWrapper = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '30px'
};

const checkmarkCircle = {
  width: '80px',
  height: '80px',
  background: '#00C48C',
  borderRadius: '50%',
  position: 'relative',
  boxShadow: '0 10px 20px rgba(0, 196, 140, 0.2)'
};

const checkmarkStem = {
  position: 'absolute',
  width: '3px',
  height: '35px',
  background: '#fff',
  left: '42px',
  top: '18px',
  transform: 'rotate(45deg)',
  borderRadius: '2px'
};

const checkmarkKick = {
  position: 'absolute',
  width: '20px',
  height: '3px',
  background: '#fff',
  left: '26px',
  top: '45px',
  transform: 'rotate(45deg)',
  borderRadius: '2px'
};

const titleStyle = {
  fontFamily: 'Syne, sans-serif',
  fontSize: '28px',
  fontWeight: 800,
  color: '#1B2559',
  margin: '0 0 10px 0'
};

const subtitleStyle = {
  fontSize: '15px',
  color: '#A3AED0',
  lineHeight: '1.6',
  marginBottom: '30px'
};

const infoBoxStyle = {
    background: '#F8FAFC',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'left',
    marginBottom: '30px',
    border: '1px solid #E2E8F0'
};

const infoTitle = {
    fontSize: '12px',
    fontWeight: 800,
    color: '#1B2559',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px'
};

const listStyle = {
    paddingLeft: '20px',
    margin: 0,
    fontSize: '13px',
    color: '#4A5568',
    lineHeight: '2'
};

const actionBtnStyle = {
  width: '100%',
  padding: '16px',
  background: '#0052FF',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  fontSize: '16px',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'Syne',
  boxShadow: '0 10px 25px rgba(0, 82, 255, 0.2)',
  transition: '0.3s'
};

const autoRedirectNote = {
    marginTop: '20px',
    fontSize: '11px',
    color: '#CBD5E1',
    fontWeight: 500
};

const footerStyle = {
    marginTop: '30px',
    fontSize: '12px',
    color: '#A3AED0'
};

export default Success;
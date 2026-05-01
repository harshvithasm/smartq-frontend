// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    },
    glow: {
      position: 'absolute',
      width: 500,
      height: 500,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(124,106,247,0.08) 0%, transparent 70%)',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    },
    card: {
      background: '#111118',
      border: '0.5px solid rgba(255,255,255,0.1)',
      borderRadius: 24,
      padding: '44px 40px',
      width: '100%',
      maxWidth: 420,
      position: 'relative',
      zIndex: 1,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 14,
      background: 'rgba(124,106,247,0.12)',
      border: '0.5px solid rgba(124,106,247,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      marginBottom: 20,
    },
    title: {
      fontFamily: "'Syne', sans-serif",
      fontSize: 26,
      fontWeight: 700,
      color: '#f0f0f5',
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: '#7a7a8c',
      marginBottom: 32,
    },
    label: {
      display: 'block',
      fontSize: 11,
      color: '#7a7a8c',
      marginBottom: 7,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
    inputWrap: {
      position: 'relative',
      marginBottom: 16,
    },
    input: {
      width: '100%',
      background: '#1a1a24',
      border: '0.5px solid rgba(255,255,255,0.1)',
      borderRadius: 11,
      padding: '13px 16px',
      color: '#f0f0f5',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
    },
    inputFocus: {
      borderColor: 'rgba(124,106,247,0.5)',
    },
    eyeBtn: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#7a7a8c',
      cursor: 'pointer',
      fontSize: 16,
      padding: 0,
      lineHeight: 1,
    },
    error: {
      background: 'rgba(248,113,113,0.08)',
      border: '0.5px solid rgba(248,113,113,0.3)',
      borderRadius: 10,
      padding: '11px 14px',
      color: '#f87171',
      fontSize: 13,
      marginBottom: 16,
    },
    btn: {
      width: '100%',
      background: loading ? '#1a1a24' : '#7c6af7',
      color: loading ? '#7a7a8c' : '#fff',
      border: 'none',
      borderRadius: 12,
      padding: '14px',
      fontSize: 15,
      fontFamily: "'Syne', sans-serif",
      fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      marginTop: 4,
    },
    hint: {
      marginTop: 24,
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 10,
      border: '0.5px solid rgba(255,255,255,0.06)',
    },
    hintText: {
      fontSize: 12,
      color: '#555',
      lineHeight: 1.6,
    },
    hintVal: {
      color: '#7a7a8c',
      fontFamily: 'monospace',
    },
  };

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.card}>
        <div style={s.iconWrap}>🔐</div>
        <div style={s.title}>Admin Login</div>
        <div style={s.subtitle}>Sign in to manage queues and counters</div>

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email Address</label>
          <div style={s.inputWrap}>
            <input
              style={s.input}
              type="email"
              placeholder="admin@smartq.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <label style={s.label}>Password</label>
          <div style={s.inputWrap}>
            <input
              style={{ ...s.input, paddingRight: 44 }}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              style={s.eyeBtn}
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>

          {error && <div style={s.error}>⚠ {error}</div>}

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={s.hint}>
          <div style={s.hintText}>
            Default credentials (change after first login):<br />
            Email: <span style={s.hintVal}>admin@smartq.com</span><br />
            Password: <span style={s.hintVal}>smartq123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

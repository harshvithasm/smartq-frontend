// src/pages/CustomerPage.js — Phase 3: Priority category selection + smart wait time
import React, { useState, useEffect } from 'react';
import { joinQueue } from '../api';
import { useDomain } from '../context/DomainContext';
import TokenCard from '../components/TokenCard';

// Priority categories are loaded from DomainContext (domainConfig from backend)
// but we also embed them here as fallback constants
const PRIORITY_CATEGORIES = {
  hospital: [
    { key: 'normal',    label: 'General / Normal',       badge: '👤', desc: 'Regular patient' },
    { key: 'senior',    label: 'Senior Citizen (60+)',    badge: '👴', desc: 'Age 60 and above' },
    { key: 'pregnant',  label: 'Pregnant / Infant',       badge: '🤰', desc: 'Pregnant woman or infant' },
    { key: 'disabled',  label: 'Differently Abled',       badge: '♿', desc: 'Physical disability' },
    { key: 'emergency', label: 'Emergency / Critical',    badge: '🚨', desc: 'Life-threatening condition' },
  ],
  bank: [
    { key: 'normal',  label: 'Regular Customer',         badge: '👤', desc: 'Standard account holder' },
    { key: 'senior',  label: 'Senior Citizen (60+)',     badge: '👴', desc: 'Age 60 and above' },
    { key: 'disabled',label: 'Differently Abled',        badge: '♿', desc: 'Physical disability' },
    { key: 'vip',     label: 'Premium / VIP Customer',   badge: '⭐', desc: 'Premium account holder' },
  ],
  college: [
    { key: 'normal',   label: 'UG Student',              badge: '📚', desc: 'Undergraduate student' },
    { key: 'senior',   label: 'PG / PhD Student',        badge: '🎓', desc: 'Post-graduate student' },
    { key: 'disabled', label: 'Differently Abled',       badge: '♿', desc: 'Physical disability' },
    { key: 'faculty',  label: 'Faculty / Staff',         badge: '👨‍🏫', desc: 'College employee' },
  ],
  foodcourt: [
    { key: 'normal',   label: 'Walk-in Customer',        badge: '🚶', desc: 'Regular walk-in order' },
    { key: 'preorder', label: 'Pre-Order / App Order',   badge: '📱', desc: 'Ordered via app in advance' },
  ],
  retail: [
    { key: 'normal',   label: 'Regular Customer',        badge: '🛒', desc: 'Standard checkout' },
    { key: 'express',  label: 'Express (≤5 items)',       badge: '⚡', desc: 'Fast checkout eligible' },
    { key: 'senior',   label: 'Senior Citizen (60+)',    badge: '👴', desc: 'Age 60 and above' },
    { key: 'disabled', label: 'Differently Abled',       badge: '♿', desc: 'Physical disability' },
    { key: 'staff',    label: 'Staff / Employee',        badge: '🏷️', desc: 'Store employee purchase' },
  ],
};

export default function CustomerPage() {
  const { activeDomain, meta, domainConfig } = useDomain();
  const [form, setForm]     = useState({ customerName: '', phone: '', serviceType: '', priorityCategory: 'normal', priorityReason: '' });
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [step, setStep]     = useState(1); // 1: details, 2: priority

  // Reset when domain changes
  useEffect(() => {
    setToken(null);
    setForm({ customerName: '', phone: '', serviceType: '', priorityCategory: 'normal', priorityReason: '' });
    setStep(1);
    setError('');
  }, [activeDomain]);

  const color      = meta?.color || '#7c6af7';
  const categories = PRIORITY_CATEGORIES[activeDomain] || PRIORITY_CATEGORIES.hospital;
  const services   = domainConfig?.serviceTypes || [];
  const counterLbl = domainConfig?.counterLabel || 'Counter';

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.serviceType) { setError('Please select a service type'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await joinQueue({ ...form, domain: activeDomain });
      setToken(res.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = categories.find((c) => c.key === form.priorityCategory);

  const s = {
    page:     { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans', sans-serif" },
    card:     { background: '#111118', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 480 },
    badge:    { display: 'inline-flex', alignItems: 'center', gap: 8, background: `${color}18`, border: `0.5px solid ${color}55`, color, borderRadius: 30, padding: '6px 14px', fontSize: 13, marginBottom: 20 },
    title:    { fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: '#f0f0f5', marginBottom: 6 },
    sub:      { fontSize: 13, color: '#7a7a8c', marginBottom: 24 },
    label:    { display: 'block', fontSize: 11, color: '#7a7a8c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' },
    input:    { width: '100%', background: '#1a1a24', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f5', fontSize: 14, marginBottom: 16, outline: 'none', boxSizing: 'border-box' },
    select:   { width: '100%', background: '#1a1a24', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f5', fontSize: 14, marginBottom: 16, outline: 'none', boxSizing: 'border-box' },
    btn:      { width: '100%', background: color, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 600, cursor: 'pointer' },
    btnGhost: { width: '100%', background: 'transparent', color: '#7a7a8c', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', fontSize: 14, cursor: 'pointer', marginTop: 10 },
    error:    { color: '#f87171', fontSize: 13, marginBottom: 12 },
    // Priority grid
    catGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
    catCard:  (active) => ({ background: active ? `${color}15` : '#1a1a24', border: active ? `1px solid ${color}55` : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' }),
    catBadge: { fontSize: 20, marginBottom: 4 },
    catLabel: (active) => ({ fontSize: 13, fontWeight: 600, color: active ? color : '#c0c0cc', marginBottom: 2 }),
    catDesc:  { fontSize: 11, color: '#7a7a8c' },
    // Step indicator
    steps:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 },
    stepDot:  (active) => ({ width: 24, height: 24, borderRadius: '50%', background: active ? color : 'rgba(255,255,255,0.08)', color: active ? '#fff' : '#7a7a8c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }),
    stepLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' },
    stepLbl:  (active) => ({ fontSize: 11, color: active ? color : '#7a7a8c' }),
  };

  if (token) return (
    <div style={s.page}>
      <TokenCard token={token} color={color} onBack={() => { setToken(null); setStep(1); }} domain={activeDomain} counterLabel={counterLbl} />
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.badge}>{meta?.icon} {meta?.label}</div>

        {/* Step indicator */}
        <div style={s.steps}>
          <div style={s.stepDot(true)}>1</div>
          <div style={s.stepLbl(step === 1)}>Your Details</div>
          <div style={s.stepLine} />
          <div style={s.stepDot(step === 2)}>2</div>
          <div style={s.stepLbl(step === 2)}>Priority</div>
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <>
            <div style={s.title}>Join the Queue</div>
            <div style={s.sub}>Fill in your details to get a token</div>

            <label style={s.label}>Your Name</label>
            <input style={s.input} placeholder="e.g. Priya Sharma" value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })} />

            <label style={s.label}>Phone (optional)</label>
            <input style={s.input} placeholder="+91 98765 43210" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <label style={s.label}>Service Type *</label>
            <select style={s.select} value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required>
              <option value="">— Select a service —</option>
              {services.map((svc) => (
                <option key={svc} value={svc}>{svc}</option>
              ))}
            </select>

            {error && <div style={s.error}>{error}</div>}
            <button style={s.btn} onClick={handleNext}>Next: Select Priority →</button>
          </>
        )}

        {/* Step 2: Priority */}
        {step === 2 && (
          <>
            <div style={s.title}>Select Category</div>
            <div style={s.sub}>This helps us prioritise your visit fairly.</div>

            <div style={s.catGrid}>
              {categories.map((cat) => (
                <div key={cat.key} style={s.catCard(form.priorityCategory === cat.key)}
                  onClick={() => setForm({ ...form, priorityCategory: cat.key })}>
                  <div style={s.catBadge}>{cat.badge}</div>
                  <div style={s.catLabel(form.priorityCategory === cat.key)}>{cat.label}</div>
                  <div style={s.catDesc}>{cat.desc}</div>
                </div>
              ))}
            </div>

            {/* Optional reason for high-priority categories */}
            {selectedCat && selectedCat.key !== 'normal' && selectedCat.key !== 'preorder' && selectedCat.key !== 'express' && (
              <>
                <label style={s.label}>Reason (optional)</label>
                <input style={s.input} placeholder={`e.g. ${selectedCat.desc}`}
                  value={form.priorityReason}
                  onChange={(e) => setForm({ ...form, priorityReason: e.target.value })} />
              </>
            )}

            {error && <div style={s.error}>{error}</div>}

            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? 'Getting Token...' : 'Get My Token →'}
            </button>
            <button style={s.btnGhost} onClick={() => setStep(1)}>← Back</button>
          </>
        )}
      </div>
    </div>
  );
}

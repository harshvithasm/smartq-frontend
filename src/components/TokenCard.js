// src/components/TokenCard.js — Phase 3: shows priority badge + smart wait time
import React, { useState, useEffect } from 'react';
import { getTokenStatus, submitRating } from '../api';

const PRIORITY_BADGE = {
  emergency: { label: 'Emergency',       badge: '🚨', color: '#ef4444' },
  senior:    { label: 'Senior Citizen',  badge: '👴', color: '#f59e0b' },
  pregnant:  { label: 'Pregnant',        badge: '🤰', color: '#ec4899' },
  disabled:  { label: 'Differently Abled', badge: '♿', color: '#8b5cf6' },
  vip:       { label: 'VIP / Premium',   badge: '⭐', color: '#f59e0b' },
  faculty:   { label: 'Faculty',         badge: '👨‍🏫', color: '#22c9a5' },
  preorder:  { label: 'Pre-Order',       badge: '📱', color: '#22c9a5' },
  express:   { label: 'Express',         badge: '⚡', color: '#4ea8e8' },
  staff:     { label: 'Staff',           badge: '🏷️', color: '#22c9a5' },
  normal:    { label: 'General',         badge: '👤', color: '#6b7280' },
};

export default function TokenCard({ token: initialToken, color, onBack, domain, counterLabel = 'Counter' }) {
  const [token, setToken]   = useState(initialToken);
  const [rating, setRating] = useState(null);
  const [rated, setRated]   = useState(false);

  // Poll for status updates every 8 seconds
  useEffect(() => {
    if (!initialToken?._id) return;
    const poll = setInterval(async () => {
      try {
        const res = await getTokenStatus(initialToken._id);
        setToken(res.token);
        if (res.token.status === 'served') clearInterval(poll);
      } catch {}
    }, 8000);
    return () => clearInterval(poll);
  }, [initialToken?._id]);

  const handleRate = async (stars) => {
    setRating(stars);
    try {
      await submitRating(token._id, stars);
      setRated(true);
    } catch {}
  };

  const priorityCat  = token.priorityCategory || 'normal';
  const priorityInfo = PRIORITY_BADGE[priorityCat] || PRIORITY_BADGE.normal;
  const statusColor  = token.status === 'serving' ? '#22c9a5' : token.status === 'served' ? '#7c6af7' : color;

  const s = {
    card:    { background: '#111118', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 420, fontFamily: "'DM Sans', sans-serif" },
    header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    tokenNum:{ fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, color, lineHeight: 1 },
    statusPill: { background: `${statusColor}18`, border: `0.5px solid ${statusColor}55`, color: statusColor, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },
    name:    { fontSize: 18, fontWeight: 600, color: '#f0f0f5', marginBottom: 4 },
    service: { fontSize: 13, color: '#7a7a8c' },
    divider: { height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '20px 0' },
    grid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 },
    infoBox: { background: '#1a1a24', borderRadius: 12, padding: '12px 14px' },
    infoLbl: { fontSize: 11, color: '#7a7a8c', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' },
    infoVal: { fontSize: 16, fontWeight: 700, color: '#f0f0f5', fontFamily: "'Syne', sans-serif" },
    priorityBox: { display: 'flex', alignItems: 'center', gap: 10, background: `${priorityInfo.color}10`, border: `0.5px solid ${priorityInfo.color}33`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 },
    // served state
    servedBig: { textAlign: 'center', padding: '16px 0' },
    servedEmoji: { fontSize: 48, marginBottom: 8 },
    servedTitle: { fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: '#f0f0f5', marginBottom: 4 },
    stars:  { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 },
    star:   (active) => ({ fontSize: 26, cursor: 'pointer', opacity: active ? 1 : 0.3, transition: 'opacity 0.15s' }),
    backBtn: { width: '100%', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', color: '#7a7a8c', borderRadius: 12, padding: '12px', fontSize: 14, cursor: 'pointer', marginTop: 16 },
  };

  if (token.status === 'served') return (
    <div style={s.card}>
      <div style={s.servedBig}>
        <div style={s.servedEmoji}>✅</div>
        <div style={s.servedTitle}>Service Completed</div>
        <div style={{ fontSize: 13, color: '#7a7a8c' }}>Token {token.tokenNumber} · Thank you, {token.customerName}!</div>
        {!rated ? (
          <>
            <div style={{ fontSize: 13, color: '#7a7a8c', marginTop: 16 }}>Rate your experience</div>
            <div style={s.stars}>
              {[1,2,3,4,5].map((n) => (
                <span key={n} style={s.star(rating >= n)} onClick={() => handleRate(n)}>★</span>
              ))}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: '#22c9a5', marginTop: 16 }}>⭐ Thanks for your feedback!</div>
        )}
      </div>
      <button style={s.backBtn} onClick={onBack}>← Join Again</button>
    </div>
  );

  if (token.status === 'serving') return (
    <div style={s.card}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: '#22c9a5' }}>It's your turn!</div>
        <div style={{ fontSize: 13, color: '#7a7a8c', marginTop: 4 }}>Please proceed to {token.assignedCounter}</div>
      </div>
      <div style={s.header}>
        <div style={s.tokenNum}>{token.tokenNumber}</div>
        <div style={s.statusPill}>Serving Now</div>
      </div>
      <div style={s.name}>{token.customerName}</div>
      <div style={s.service}>{token.serviceType}</div>
      <button style={s.backBtn} onClick={onBack}>← Back</button>
    </div>
  );

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div>
          <div style={s.tokenNum}>{token.tokenNumber}</div>
          <div style={s.name}>{token.customerName}</div>
          <div style={s.service}>{token.serviceType}</div>
        </div>
        <div style={s.statusPill}>Waiting</div>
      </div>

      {/* Priority badge — only show if not normal */}
      {priorityCat !== 'normal' && (
        <div style={s.priorityBox}>
          <span style={{ fontSize: 22 }}>{priorityInfo.badge}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: priorityInfo.color }}>{priorityInfo.label}</div>
            <div style={{ fontSize: 11, color: '#7a7a8c' }}>Priority queue</div>
          </div>
        </div>
      )}

      <div style={s.divider} />

      <div style={s.grid}>
        <div style={s.infoBox}>
          <div style={s.infoLbl}>Position</div>
          <div style={s.infoVal}>#{token.queuePosition || '—'}</div>
        </div>
        <div style={s.infoBox}>
          <div style={s.infoLbl}>
            Est. Wait
            {token.aiWaitMinutes != null && (
              <span style={{
                marginLeft: 6, fontSize: 9, padding: '1px 5px', borderRadius: 6,
                background: 'rgba(167,139,250,0.15)', color: '#a78bfa',
                border: '0.5px solid rgba(167,139,250,0.3)', verticalAlign: 'middle',
              }}>
                🤖 AI {token.aiWaitConfidence || ''}
              </span>
            )}
          </div>
          <div style={s.infoVal}>
            {(token.aiWaitMinutes ?? token.estimatedWaitMinutes) > 0
              ? `~${token.aiWaitMinutes ?? token.estimatedWaitMinutes} min`
              : '< 5 min'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#7a7a8c', textAlign: 'center', marginBottom: 16 }}>
        ↻ Auto-refreshes every 8 seconds
      </div>

      <button style={s.backBtn} onClick={onBack}>← Join Different Queue</button>
    </div>
  );
}

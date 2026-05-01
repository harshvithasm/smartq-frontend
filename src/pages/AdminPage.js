// src/pages/AdminPage.js — Phase 4: AI Features
import React, { useEffect, useState, useCallback } from 'react';
import {
  getQueue, getQueueStats, getCounters,
  markServed, skipToken, callNextFromCounter,
  toggleCounter, createCounter, updateCounter, deleteCounter,
} from '../api';
import { useDomain }  from '../context/DomainContext';
import { useSocket }  from '../context/SocketContext';
import { useAuth }    from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── StatBox ───────────────────────────────────────────────────────
function StatBox({ num, label, color, icon }) {
  return (
    <div style={{ background: '#111118', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, color, display:'flex', alignItems:'center', gap:6 }}>
        {icon && <span style={{fontSize:18}}>{icon}</span>}{num}
      </div>
      <div style={{ fontSize: 12, color: '#7a7a8c', marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ── Risk Badge ────────────────────────────────────────────────────
function RiskBadge({ riskLevel, noShowRisk }) {
  if (!riskLevel || riskLevel === 'low') return null;
  const cfg = {
    high:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: '🔴', label: 'High Risk' },
    medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: '🟡', label: 'Med Risk' },
  };
  const c = cfg[riskLevel];
  if (!c) return null;
  return (
    <span title={`No-show risk: ${Math.round((noShowRisk||0)*100)}%`} style={{
      fontSize: 10, padding: '2px 7px', borderRadius: 10,
      background: c.bg, color: c.color,
      border: `0.5px solid ${c.color}44`, marginLeft: 4,
    }}>
      {c.icon} {c.label}
    </span>
  );
}

// ── Congestion Alert Banner ───────────────────────────────────────
function CongestionBanner({ alerts, onDismiss, color }) {
  if (!alerts || alerts.length === 0) return null;
  const critical = alerts.find((a) => a.severity === 'critical');
  const worst    = critical || alerts[0];
  const isCrit   = worst.severity === 'critical';

  return (
    <div style={{
      background: isCrit ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.08)',
      border: `0.5px solid ${isCrit ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.4)'}`,
      borderRadius: 14,
      padding: '14px 18px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 13, fontWeight: 700,
          color: isCrit ? '#f87171' : '#fbbf24',
          marginBottom: 4,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {isCrit ? '🚨' : '⚠️'} {isCrit ? 'CRITICAL ALERT' : 'CONGESTION WARNING'}
          <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>
            ({alerts.length} issue{alerts.length > 1 ? 's' : ''})
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#f0f0f5', marginBottom: 6 }}>{worst.message}</div>
        {worst.suggestion && (
          <div style={{ fontSize: 12, color: '#7a7a8c' }}>
            💡 {worst.suggestion}
          </div>
        )}
        {alerts.length > 1 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {alerts.slice(1).map((a, i) => (
              <span key={i} style={{
                fontSize: 11,
                color: a.severity === 'critical' ? '#f87171' : '#fbbf24',
                background: a.severity === 'critical' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                padding: '2px 8px', borderRadius: 8,
              }}>
                {a.type === 'long_wait' ? '⏱' : a.type === 'priority_neglected' ? '🔺' : '📊'} {a.message}
              </span>
            ))}
          </div>
        )}
      </div>
      <button onClick={onDismiss} style={{
        background: 'transparent', border: 'none', color: '#7a7a8c',
        cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0,
      }}>×</button>
    </div>
  );
}

// ── Counter Form Modal ────────────────────────────────────────────
function CounterModal({ counter, domain, domainConfig, color, onSave, onClose }) {
  const isEdit = !!counter;
  const [name,         setName]         = useState(counter?.name         || '');
  const [staffName,    setStaffName]    = useState(counter?.staffName    || '');
  const [serviceTypes, setServiceTypes] = useState(counter?.serviceTypes || []);
  const [avgTime,      setAvgTime]      = useState(counter?.avgServiceTime || 5);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  const allServices = domainConfig?.serviceTypes || [];
  const toggleService = (svc) =>
    setServiceTypes((prev) => prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]);

  const handleSave = async () => {
    if (!name.trim()) { setError('Counter name is required'); return; }
    setSaving(true); setError('');
    try {
      await onSave({ name: name.trim(), staffName: staffName.trim(), serviceTypes, avgServiceTime: Number(avgTime), domain });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 };
  const modal   = { background: '#111118', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 480, fontFamily: "'DM Sans', sans-serif", maxHeight: '90vh', overflowY: 'auto' };
  const inp     = { width: '100%', background: '#1a1a24', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: '#f0f0f5', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14 };
  const lbl     = { display: 'block', fontSize: 11, color: '#7a7a8c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: '#f0f0f5', marginBottom: 4 }}>
          {isEdit ? 'Edit Counter' : 'Add New Counter'}
        </div>
        <div style={{ fontSize: 13, color: '#7a7a8c', marginBottom: 24 }}>
          {isEdit ? 'Update counter details' : `Add a counter for ${domain}`}
        </div>

        <label style={lbl}>Counter Name *</label>
        <input style={inp} placeholder="e.g. Counter 1, Teller A" value={name} onChange={(e) => setName(e.target.value)} />

        <label style={lbl}>Staff Name</label>
        <input style={inp} placeholder="e.g. Dr. Sharma" value={staffName} onChange={(e) => setStaffName(e.target.value)} />

        <label style={lbl}>Avg. Service Time (minutes)</label>
        <input style={inp} type="number" min={1} max={60} value={avgTime} onChange={(e) => setAvgTime(e.target.value)} />

        {allServices.length > 0 && (
          <>
            <label style={{ ...lbl, marginBottom: 10 }}>Service Types handled</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {allServices.map((svc) => {
                const active = serviceTypes.includes(svc);
                return (
                  <button key={svc} type="button" onClick={() => toggleService(svc)}
                    style={{ background: active ? `${color}20` : '#1a1a24', border: `0.5px solid ${active ? color : 'rgba(255,255,255,0.1)'}`, color: active ? color : '#7a7a8c', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
                    {svc}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, background: saving ? '#1a1a24' : color, color: '#fff', border: 'none', borderRadius: 11, padding: '12px', fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : isEdit ? 'Update Counter' : 'Add Counter'}
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', color: '#7a7a8c', borderRadius: 11, padding: '12px 20px', fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AI Insights Panel ─────────────────────────────────────────────
function AIInsightsPanel({ tokens, stats, color }) {
  const waiting = tokens.filter((t) => t.status === 'waiting');
  const highRisk = waiting.filter((t) => t.riskLevel === 'high');
  const medRisk  = waiting.filter((t) => t.riskLevel === 'medium');

  const aiPowered = waiting.filter((t) => t.aiWaitMinutes != null);
  const avgAiWait = aiPowered.length
    ? Math.round(aiPowered.reduce((s, t) => s + (t.aiWaitMinutes || 0), 0) / aiPowered.length)
    : null;

  const infoRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' };
  const label   = { fontSize: 13, color: '#7a7a8c' };
  const value   = { fontSize: 13, fontWeight: 600, color: '#f0f0f5' };

  return (
    <div style={{ background: '#111118', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 20px' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: '#7a7a8c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, display:'flex', alignItems:'center', gap: 8 }}>
        <span>🤖</span> AI Insights
      </div>

      {/* Module 1 — Wait predictor */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: color, fontWeight: 600, marginBottom: 8 }}>Wait Time Predictor</div>
        <div style={infoRow}>
          <span style={label}>AI-powered predictions</span>
          <span style={value}>{aiPowered.length} / {waiting.length} tokens</span>
        </div>
        {avgAiWait != null && (
          <div style={infoRow}>
            <span style={label}>Avg predicted wait</span>
            <span style={{ ...value, color: '#a78bfa' }}>{avgAiWait} min</span>
          </div>
        )}
      </div>

      {/* Module 2 — No-show risk */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: color, fontWeight: 600, marginBottom: 8 }}>No-Show Risk</div>
        <div style={infoRow}>
          <span style={label}>🔴 High risk customers</span>
          <span style={{ ...value, color: highRisk.length > 0 ? '#f87171' : '#22c9a5' }}>{highRisk.length}</span>
        </div>
        <div style={infoRow}>
          <span style={label}>🟡 Medium risk</span>
          <span style={{ ...value, color: medRisk.length > 0 ? '#fbbf24' : '#22c9a5' }}>{medRisk.length}</span>
        </div>
        {stats?.skippedToday != null && (
          <div style={infoRow}>
            <span style={label}>Skipped today</span>
            <span style={value}>{stats.skippedToday}</span>
          </div>
        )}
      </div>

      {/* Module 3 — Smart assignment */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: color, fontWeight: 600, marginBottom: 8 }}>Smart Assignment</div>
        <div style={{ fontSize: 12, color: '#7a7a8c', lineHeight: 1.6 }}>
          Counters are auto-selected based on service type match, availability, workload, and speed. Reassignment happens when a better counter scores 15+ points higher.
        </div>
      </div>

      {/* Module 4 — Congestion */}
      <div>
        <div style={{ fontSize: 12, color: color, fontWeight: 600, marginBottom: 8 }}>Congestion Monitor</div>
        <div style={{ fontSize: 12, color: '#7a7a8c', lineHeight: 1.6 }}>
          Queue health is checked every 60 s. Alerts fire when waiting count, average wait, or high-priority wait exceeds domain thresholds.
        </div>
      </div>
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────
export default function AdminPage() {
  const { activeDomain, meta }            = useDomain();
  const { joinDomain, onEvent, offEvent } = useSocket();
  const { admin, logout }                 = useAuth();
  const navigate                          = useNavigate();

  const [tokens,       setTokens]       = useState([]);
  const [counters,     setCounters]     = useState([]);
  const [stats,        setStats]        = useState(null);
  const [domainConfig, setDomainConfig] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('queue');

  // Counter modal
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editCounter, setEditCounter] = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);

  // Phase 4: congestion alerts
  const [congestionAlerts,    setCongestionAlerts]    = useState([]);
  const [alertDismissed,      setAlertDismissed]      = useState(false);

  const color = meta?.color || '#7c6af7';

  const fetchAll = useCallback(async () => {
    try {
      const [q, s, c] = await Promise.all([
        getQueue(activeDomain),
        getQueueStats(activeDomain),
        getCounters(activeDomain),
      ]);
      setTokens(q.tokens    || []);
      setStats(s.stats);
      setCounters(c.counters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeDomain]);

  useEffect(() => {
    import('../api').then(({ getDomainConfig }) => {
      getDomainConfig(activeDomain).then((r) => setDomainConfig(r.config)).catch(() => {});
    });
  }, [activeDomain]);

  // Handle congestion alert from socket
  const handleCongestionAlert = useCallback((payload) => {
    if (payload.domain === activeDomain) {
      setCongestionAlerts(payload.alerts || []);
      setAlertDismissed(false);
    }
  }, [activeDomain]);

  const handleCongestionClear = useCallback((payload) => {
    if (payload.domain === activeDomain) setCongestionAlerts([]);
  }, [activeDomain]);

  useEffect(() => {
    setLoading(true);
    joinDomain(activeDomain);
    fetchAll();
    onEvent('queue_updated',      fetchAll);
    onEvent('counters_updated',   fetchAll);
    onEvent('congestion_alert',   handleCongestionAlert);
    onEvent('congestion_clear',   handleCongestionClear);
    return () => {
      offEvent('queue_updated',     fetchAll);
      offEvent('counters_updated',  fetchAll);
      offEvent('congestion_alert',  handleCongestionAlert);
      offEvent('congestion_clear',  handleCongestionClear);
    };
  }, [activeDomain, fetchAll, handleCongestionAlert, handleCongestionClear]);

  const handleServe    = async (id)  => { await markServed(id); };
  const handleSkip     = async (id)  => { await skipToken(id); };
  const handleCallNext = async (cid) => { await callNextFromCounter(cid); };
  const handleToggle   = async (cid) => { await toggleCounter(cid); };

  const handleSaveCounter = async (data) => {
    if (editCounter) await updateCounter(editCounter._id, data);
    else await createCounter(data);
    fetchAll();
  };

  const handleDelete = async (id) => {
    await deleteCounter(id);
    setDeletingId(null);
    fetchAll();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const statusColor = { waiting: '#ffc832', serving: color, served: '#22c9a5', skipped: '#7a7a8c' };

  const s = {
    page:        { minHeight: '100vh', background: '#0a0a0f', padding: '24px', fontFamily: "'DM Sans', sans-serif" },
    topBar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
    titleBlock:  { display: 'flex', alignItems: 'center', gap: 12 },
    title:       { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: '#f0f0f5' },
    subtitle:    { fontSize: 13, color: '#7a7a8c', marginTop: 2 },
    adminBadge:  { display: 'flex', alignItems: 'center', gap: 10 },
    adminName:   { fontSize: 13, color: '#7a7a8c' },
    logoutBtn:   { background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.25)', color: '#f87171', borderRadius: 9, padding: '7px 14px', fontSize: 12, cursor: 'pointer' },
    statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 },
    tabs:        { display: 'flex', gap: 4, marginBottom: 20, background: '#111118', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, width: 'fit-content', flexWrap: 'wrap' },
    tab:         (active) => ({ background: active ? 'rgba(255,255,255,0.07)' : 'transparent', border: 'none', color: active ? '#f0f0f5' : '#7a7a8c', borderRadius: 9, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }),
    panel:       { background: '#111118', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' },
    panelHead:   { padding: '14px 18px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    panelTitle:  { fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7a8c', display: 'flex', alignItems: 'center', gap: 8 },
    dot:         { width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` },
    panelBody:   { padding: 16 },
    tokenRow:    { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#1a1a24', border: '0.5px solid rgba(255,255,255,0.06)', marginBottom: 8, flexWrap: 'wrap' },
    tokenNum:    { fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color, minWidth: 56 },
    tokenInfo:   { flex: 1, minWidth: 120 },
    tokenName:   { fontSize: 13, fontWeight: 500, color: '#f0f0f5' },
    tokenSvc:    { fontSize: 11, color: '#7a7a8c' },
    badge:       (status) => ({ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${statusColor[status] || '#888'}18`, color: statusColor[status] || '#888', border: `0.5px solid ${statusColor[status] || '#888'}44`, textTransform: 'capitalize' }),
    btnSmall:    (c) => ({ background: `${c}18`, border: `0.5px solid ${c}44`, color: c, borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', marginLeft: 4 }),
    counterCard: { background: '#1a1a24', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 },
    counterName: { fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: '#f0f0f5', marginBottom: 3 },
    counterInfo: { fontSize: 12, color: '#7a7a8c', marginBottom: 10 },
    openBadge:   (open) => ({ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: open ? '#22c9a518' : '#7a7a8c18', color: open ? '#22c9a5' : '#7a7a8c', border: `0.5px solid ${open ? '#22c9a5' : '#7a7a8c'}44` }),
    empty:       { color: '#7a7a8c', fontSize: 13, textAlign: 'center', padding: '28px 0' },
    addBtn:      { background: `${color}18`, border: `0.5px solid ${color}44`, color, borderRadius: 9, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
    deleteConfirm: { background: 'rgba(248,113,113,0.06)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    mainGrid:    { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' },
  };

  if (loading) {
    return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a7a8c' }}>Loading dashboard…</div>;
  }

  const waiting = tokens.filter((t) => t.status === 'waiting');
  const serving = tokens.filter((t) => t.status === 'serving');
  const showAlertBanner = congestionAlerts.length > 0 && !alertDismissed;

  return (
    <div style={s.page}>
      {/* Modal */}
      {modalOpen && (
        <CounterModal counter={editCounter} domain={activeDomain} domainConfig={domainConfig} color={color} onSave={handleSaveCounter} onClose={() => { setModalOpen(false); setEditCounter(null); }} />
      )}

      {/* Top Bar */}
      <div style={s.topBar}>
        <div style={s.titleBlock}>
          <span style={{ fontSize: 26 }}>{meta?.icon}</span>
          <div>
            <div style={s.title}>Admin Dashboard — {meta?.label}</div>
            <div style={s.subtitle}>Real-time queue management · Phase 4 AI</div>
          </div>
        </div>
        <div style={s.adminBadge}>
          <span style={s.adminName}>👤 {admin?.name}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      {/* Phase 4: Congestion Alert Banner */}
      {showAlertBanner && (
        <CongestionBanner alerts={congestionAlerts} color={color} onDismiss={() => setAlertDismissed(true)} />
      )}

      {/* Stats */}
      {stats && (
        <div style={s.statsRow}>
          <StatBox num={stats.waiting}              label="Waiting"        color="#ffc832" />
          <StatBox num={stats.serving}              label="Being Served"   color={color} />
          <StatBox num={stats.servedToday}          label="Served Today"   color="#22c9a5" />
          <StatBox num={stats.openCounters}         label="Open Counters"  color="#4ea8e8" />
          <StatBox num={`${stats.avgWaitMinutes}m`} label="Avg Wait"       color="#a78bfa" />
          {stats.highRiskCount > 0 && (
            <StatBox num={stats.highRiskCount} label="High Risk" color="#f87171" icon="🔴" />
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={s.tab(activeTab === 'queue')}    onClick={() => setActiveTab('queue')}>📋 Live Queue ({waiting.length})</button>
        <button style={s.tab(activeTab === 'counters')} onClick={() => setActiveTab('counters')}>🪟 Counters ({counters.length})</button>
        <button style={s.tab(activeTab === 'ai')}       onClick={() => setActiveTab('ai')}>🤖 AI Insights</button>
      </div>

      {/* ── QUEUE TAB ─────────────────────────────────── */}
      {activeTab === 'queue' && (
        <div style={s.mainGrid}>
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}><div style={s.dot} />Live Queue</div>
              <div style={{ fontSize: 11, color: '#7a7a8c' }}>
                🤖 AI wait predictions active
              </div>
            </div>
            <div style={s.panelBody}>
              {/* Currently Serving */}
              {serving.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: '#7a7a8c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Currently Serving</div>
                  {serving.map((t) => (
                    <div key={t._id} style={{ ...s.tokenRow, borderColor: `${color}44` }}>
                      <div style={s.tokenNum}>{t.tokenNumber}</div>
                      <div style={s.tokenInfo}>
                        <div style={s.tokenName}>{t.customerName}</div>
                        <div style={s.tokenSvc}>
                          {t.serviceType} · {t.assignedCounter}
                          {t.assignmentReason === 'optimised' && <span style={{ color: '#a78bfa', marginLeft: 4 }}>🤖 smart-assigned</span>}
                        </div>
                      </div>
                      <span style={s.badge('serving')}>serving</span>
                      <button style={s.btnSmall('#22c9a5')} onClick={() => handleServe(t._id)}>✓ Done</button>
                    </div>
                  ))}
                  <div style={{ height: 14, borderBottom: '0.5px solid rgba(255,255,255,0.05)', marginBottom: 14 }} />
                </>
              )}

              {/* Waiting */}
              {waiting.length === 0 && serving.length === 0 ? (
                <div style={s.empty}>No tokens in queue</div>
              ) : (
                <>
                  {waiting.length > 0 && (
                    <div style={{ fontSize: 11, color: '#7a7a8c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      Waiting ({waiting.length})
                    </div>
                  )}
                  {waiting.map((t, i) => (
                    <div key={t._id} style={{
                      ...s.tokenRow,
                      borderColor: t.riskLevel === 'high' ? 'rgba(248,113,113,0.3)' : t.riskLevel === 'medium' ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, color: '#7a7a8c', minWidth: 20 }}>#{i + 1}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color, minWidth: 56 }}>{t.tokenNumber}</div>
                      <div style={s.tokenInfo}>
                        <div style={s.tokenName}>
                          {t.customerName}
                          {/* Phase 4: No-show risk badge */}
                          <RiskBadge riskLevel={t.riskLevel} noShowRisk={t.noShowRisk} />
                        </div>
                        <div style={s.tokenSvc}>
                          {t.serviceType} ·{' '}
                          {/* Phase 4: AI wait */}
                          {t.aiWaitMinutes != null
                            ? <span style={{ color: '#a78bfa' }}>~{t.aiWaitMinutes}m <span style={{ color: '#7a7a8c', fontSize: 10 }}>(AI)</span></span>
                            : <span>~{t.estimatedWaitMinutes || 0}m wait</span>
                          }
                        </div>
                      </div>
                      {t.priority > 0 && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#ec489918', color: '#ec4899', border: '0.5px solid #ec489944' }}>
                          {t.priorityCategory === 'emergency' ? '🚨 emergency' : '⚡ priority'}
                        </span>
                      )}
                      <button style={s.btnSmall('#f87171')} onClick={() => handleSkip(t._id)}>Skip</button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right sidebar: mini AI panel */}
          <AIInsightsPanel tokens={tokens} stats={stats} color={color} />
        </div>
      )}

      {/* ── COUNTERS TAB ──────────────────────────────── */}
      {activeTab === 'counters' && (
        <div style={s.panel}>
          <div style={s.panelHead}>
            <div style={s.panelTitle}><div style={s.dot} />Counters / Staff</div>
            <button style={s.addBtn} onClick={() => { setEditCounter(null); setModalOpen(true); }}>+ Add Counter</button>
          </div>
          <div style={s.panelBody}>
            {counters.length === 0 ? (
              <div style={s.empty}>
                No counters yet.{' '}
                <span style={{ color, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setEditCounter(null); setModalOpen(true); }}>Add one</span>
              </div>
            ) : (
              counters.map((c) => (
                <div key={c._id}>
                  {deletingId === c._id ? (
                    <div style={s.deleteConfirm}>
                      <span style={{ fontSize: 13, color: '#f87171' }}>Delete <strong>{c.name}</strong>? Cannot be undone.</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={s.btnSmall('#f87171')} onClick={() => handleDelete(c._id)}>Yes, delete</button>
                        <button style={s.btnSmall('#7a7a8c')} onClick={() => setDeletingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={s.counterCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <div style={s.counterName}>{c.name}</div>
                          <div style={s.counterInfo}>
                            {c.staffName ? `👤 ${c.staffName}` : 'No staff assigned'}
                            {' · '}Served today: <strong style={{ color: '#f0f0f5' }}>{c.tokensServedToday}</strong>
                            {' · '}~{c.avgServiceTime}m/token
                            {c.currentToken && <span style={{ color }}> · Serving: <strong>{c.currentToken}</strong></span>}
                          </div>
                          {/* Phase 4: smart assignment handles these service types */}
                          {c.serviceTypes?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                              {c.serviceTypes.map((svc) => (
                                <span key={svc} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${color}10`, color: `${color}cc`, border: `0.5px solid ${color}30` }}>
                                  {svc}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span style={s.openBadge(c.isOpen)}>{c.isOpen ? 'Open' : 'Closed'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        <button style={s.btnSmall(color)}      onClick={() => handleCallNext(c._id)}>🤖 Smart Call Next</button>
                        <button style={s.btnSmall('#7a7a8c')} onClick={() => handleToggle(c._id)}>{c.isOpen ? 'Close' : 'Open'}</button>
                        <button style={s.btnSmall('#a78bfa')} onClick={() => { setEditCounter(c); setModalOpen(true); }}>Edit</button>
                        <button style={s.btnSmall('#f87171')} onClick={() => setDeletingId(c._id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── AI INSIGHTS TAB ───────────────────────────── */}
      {activeTab === 'ai' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Module 1 */}
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}><div style={s.dot} />🔮 Module 1 — Wait Time Predictor</div>
            </div>
            <div style={s.panelBody}>
              <div style={{ fontSize: 13, color: '#7a7a8c', lineHeight: 1.8, marginBottom: 12 }}>
                Linear regression trained nightly on historical served tokens. Features: hour of day (sine/cosine encoded), peak-hour flag, weekend flag, queue length, open counters, service base time, and priority score.
              </div>
              <div style={{ fontSize: 12, color: '#7a7a8c' }}>
                <span style={{ color: '#a78bfa' }}>→</span> Replaces the flat position × avgTime formula with per-token ML predictions.
              </div>
              <div style={{ marginTop: 12, fontSize: 12 }}>
                <span style={{ color: '#22c9a5' }}>Source flag:</span> <span style={{ color: '#7a7a8c' }}>tokens show <strong style={{color:'#a78bfa'}}>(AI)</strong> label when model is trained, <em>(fallback)</em> otherwise.</span>
              </div>
            </div>
          </div>

          {/* Module 2 */}
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}><div style={s.dot} />🔴 Module 2 — No-Show Predictor</div>
            </div>
            <div style={s.panelBody}>
              <div style={{ fontSize: 13, color: '#7a7a8c', lineHeight: 1.8, marginBottom: 12 }}>
                Logistic regression classifies waiting customers as high / medium / low no-show risk. Trained on skipped vs. served tokens from the past 30 days.
              </div>
              <div style={{ marginBottom: 8 }}>
                {[{l:'🔴 High risk (≥60%)', c:'#f87171'},{l:'🟡 Medium risk (35–60%)', c:'#fbbf24'},{l:'🟢 Low risk (&lt;35%)', c:'#22c9a5'}].map((r,i)=>(
                  <div key={i} style={{ fontSize: 12, color: r.c, marginBottom: 4 }}>{r.l}</div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#7a7a8c' }}>Falls back to rule-based scoring (wait time + position + hour of day) when insufficient training data.</div>
            </div>
          </div>

          {/* Module 3 */}
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}><div style={s.dot} />🎯 Module 3 — Smart Counter Assignment</div>
            </div>
            <div style={s.panelBody}>
              <div style={{ fontSize: 13, color: '#7a7a8c', lineHeight: 1.8, marginBottom: 12 }}>
                Scores every open counter when a token is called. Picks the optimal one based on:
              </div>
              {[
                ['Service type match', '+40 pts'],
                ['Counter is free (no current token)', '+30 pts'],
                ['Lower tokens served today (fresher)', 'up to +15 pts'],
                ['Lower avg service time (faster)', 'up to +15 pts'],
              ].map(([k,v],i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize: 12, padding:'6px 0', borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#f0f0f5' }}>{k}</span>
                  <span style={{ color: '#a78bfa' }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#7a7a8c', marginTop: 10 }}>Reassigns only when best counter scores 15+ points higher than the requesting counter.</div>
            </div>
          </div>

          {/* Module 4 */}
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}><div style={s.dot} />⚠️ Module 4 — Congestion Monitor</div>
            </div>
            <div style={s.panelBody}>
              <div style={{ fontSize: 13, color: '#7a7a8c', lineHeight: 1.8, marginBottom: 12 }}>
                Background cron runs every 60 seconds. Checks three conditions per domain:
              </div>
              {[
                ['Queue overflow', 'Waiting count > domain threshold'],
                ['Long average wait', 'Avg estimated wait > limit'],
                ['Priority neglected', 'High-priority waited > time limit'],
              ].map(([k,v],i) => (
                <div key={i} style={{ display:'flex', gap: 10, fontSize: 12, padding:'6px 0', borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#fbbf24', minWidth: 130 }}>{k}</span>
                  <span style={{ color: '#7a7a8c' }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#7a7a8c', marginTop: 10 }}>
                Emits <code style={{color:'#a78bfa'}}>congestion_alert</code> via Socket.io → triggers the alert banner above.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

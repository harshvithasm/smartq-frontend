// src/pages/DisplayBoard.js
import React, { useEffect, useState, useCallback } from 'react';
import { getQueue } from '../api';
import { useDomain } from '../context/DomainContext';
import { useSocket } from '../context/SocketContext';


const PRIORITY_BADGE = {
  emergency: '🚨', senior: '👴', pregnant: '🤰', disabled: '♿',
  vip: '⭐', faculty: '👨‍🏫', preorder: '📱', express: '⚡',
  staff: '🏷️', normal: '',
};

export default function DisplayBoard() {
  const { activeDomain, meta } = useDomain();
  const { joinDomain, onEvent, offEvent } = useSocket();
  const [tokens, setTokens] = useState([]);
  const [time, setTime] = useState(new Date());

  const color = meta?.color || '#7c6af7';

  const fetchQueue = useCallback(async () => {
    try {
      const r = await getQueue(activeDomain);
      setTokens(r.tokens || []);
    } catch (err) { console.error(err); }
  }, [activeDomain]);

  useEffect(() => {
    joinDomain(activeDomain);
    fetchQueue();
    onEvent('queue_updated', fetchQueue);
    onEvent('token_called',  fetchQueue);
    return () => {
      offEvent('queue_updated', fetchQueue);
      offEvent('token_called',  fetchQueue);
    };
  }, [activeDomain, fetchQueue]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const serving = tokens.filter(t => t.status === 'serving');
  const waiting = tokens.filter(t => t.status === 'waiting').slice(0, 8);

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0f', padding: '32px', fontFamily: "'DM Sans', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    brand: { display: 'flex', alignItems: 'center', gap: 12 },
    logo: { fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: '#f0f0f5' },
    logoSub: { fontSize: 14, color: '#7a7a8c' },
    clock: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 300, color: '#7a7a8c', textAlign: 'right' },
    date: { fontSize: 13, color: '#555', textAlign: 'right' },
    servingSection: { marginBottom: 32 },
    sectionLabel: { fontSize: 11, color: '#7a7a8c', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 },
    servingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
    servingCard: { background: `${color}12`, border: `1px solid ${color}55`, borderRadius: 20, padding: '24px', textAlign: 'center' },
    bigToken: { fontFamily: "'Syne', sans-serif", fontSize: 56, fontWeight: 800, color, lineHeight: 1 },
    counterLabel: { fontSize: 14, color: '#7a7a8c', marginTop: 8 },
    counterName: { fontSize: 18, fontWeight: 600, color: '#f0f0f5' },
    customerName: { fontSize: 13, color: '#7a7a8c', marginTop: 4 },
    waitingTable: { width: '100%', borderCollapse: 'collapse' },
    th: { fontSize: 11, color: '#7a7a8c', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', paddingBottom: 10, borderBottom: '0.5px solid rgba(255,255,255,0.06)' },
    tr: { borderBottom: '0.5px solid rgba(255,255,255,0.04)' },
    td: { padding: '12px 0', fontSize: 14, color: '#f0f0f5', verticalAlign: 'middle' },
    pos: { fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#7a7a8c', fontSize: 13 },
    waitBadge: { background: '#ffc83218', border: '0.5px solid #ffc83244', color: '#ffc832', borderRadius: 8, padding: '3px 10px', fontSize: 12 },
    noQueue: { textAlign: 'center', color: '#555', fontSize: 24, padding: '80px 0', fontFamily: "'Syne', sans-serif" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.brand}>
          <span style={{ fontSize: 36 }}>{meta?.icon}</span>
          <div>
            <div style={s.logo}>SmartQ</div>
            <div style={s.logoSub}>{meta?.label} Queue System</div>
          </div>
        </div>
        <div>
          <div style={s.clock}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
          <div style={s.date}>{time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* NOW SERVING */}
      <div style={s.servingSection}>
        <div style={s.sectionLabel}>Now Serving</div>
        {serving.length === 0
          ? <div style={{ color: '#555', fontSize: 18, padding: '24px 0' }}>No active tokens</div>
          : (
            <div style={s.servingGrid}>
              {serving.map((t) => (
                <div key={t._id} style={s.servingCard}>
                  <div style={s.bigToken}>{PRIORITY_BADGE[t.priorityCategory] || ''} {t.tokenNumber}</div>
                  <div style={s.counterLabel}>at</div>
                  <div style={s.counterName}>{t.assignedCounter || 'Counter'}</div>
                  <div style={s.customerName}>{t.customerName} · {t.serviceType}</div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* WAITING LIST */}
      <div>
        <div style={s.sectionLabel}>Waiting ({waiting.length})</div>
        {waiting.length === 0
          ? <div style={s.noQueue}>Queue is clear ✓</div>
          : (
            <table style={s.waitingTable}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Token</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Service</th>
                  <th style={s.th}>Est. Wait</th>
                </tr>
              </thead>
              <tbody>
                {waiting.map((t, i) => (
                  <tr key={t._id} style={s.tr}>
                    <td style={{ ...s.td, ...s.pos }}>{i + 1}</td>
                    <td style={{ ...s.td, fontFamily: "'Syne', sans-serif", fontWeight: 700, color, fontSize: 18 }}>{PRIORITY_BADGE[t.priorityCategory] || ''} {t.tokenNumber}</td>
                    <td style={s.td}>{t.customerName}</td>
                    <td style={{ ...s.td, color: '#7a7a8c' }}>{t.serviceType}</td>
                    <td style={s.td}><span style={s.waitBadge}>~{(i + 1) * 5} min</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}

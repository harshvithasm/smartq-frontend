// src/pages/DomainSelectPage.js — Phase 3: Domain Selection Landing Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDomain, DOMAIN_META } from '../context/DomainContext';

const DOMAIN_DETAILS = {
  hospital: {
    services: ['OPD – General', 'OPD – Cardiology', 'Radiology', 'Pharmacy', 'Lab / Blood Test'],
    priorities: ['Emergency 🚨', 'Senior Citizen 👴', 'Pregnant 🤰', 'General 👤'],
    counterLabel: 'Counters',
    highlight: 'Emergency auto-prioritised',
  },
  bank: {
    services: ['Cash Deposit', 'Cash Withdrawal', 'Account Opening', 'Loan Inquiry', 'FD / RD'],
    priorities: ['VIP / Premium ⭐', 'Senior Citizen 👴', 'Regular Customer 👤'],
    counterLabel: 'Tellers',
    highlight: 'VIP priority queue',
  },
  college: {
    services: ['Fee Payment', 'Bonafide Certificate', 'TC / Migration', 'Scholarship', 'Exam Form'],
    priorities: ['Faculty / Staff 👨‍🏫', 'Differently Abled ♿', 'PG Student 🎓', 'UG Student 📚'],
    counterLabel: 'Windows',
    highlight: 'Faculty fast-track lane',
  },
  foodcourt: {
    services: ['North Indian', 'South Indian', 'Chinese', 'Beverages', 'Snacks'],
    priorities: ['Pre-Order 📱', 'Walk-in 🚶'],
    counterLabel: 'Stalls',
    highlight: 'App pre-orders served first',
  },
  retail: {
    services: ['Express Checkout (≤5 items)', 'Regular Checkout', 'Electronics Billing', 'Returns / Exchange'],
    priorities: ['Staff 🏷️', 'Senior Citizen 👴', 'Express ⚡', 'Regular 🛒'],
    counterLabel: 'Billing Counters',
    highlight: 'Express lane for ≤5 items',
  },
};

export default function DomainSelectPage() {
  const { activeDomain, setActiveDomain, meta } = useDomain();
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const navigate = useNavigate();

  const domains = Object.entries(DOMAIN_META);
  const displayDomain = hoveredDomain || activeDomain;
  const displayMeta   = DOMAIN_META[displayDomain];
  const displayDetail = DOMAIN_DETAILS[displayDomain];

  const handleSelect = (domainId) => {
    setActiveDomain(domainId);
    navigate('/queue');
  };

  const color = displayMeta?.color || '#7c6af7';

  const s = {
    page: { minHeight: '100vh', background: '#07070d', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" },
    hero: { padding: '60px 32px 40px', textAlign: 'center' },
    heroTag: { display: 'inline-block', background: 'rgba(124,106,247,0.12)', border: '0.5px solid rgba(124,106,247,0.3)', color: '#a78bfa', borderRadius: 30, padding: '5px 14px', fontSize: 12, marginBottom: 20, letterSpacing: '0.08em' },
    heroTitle: { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#f0f0f5', lineHeight: 1.15, marginBottom: 14 },
    heroSub: { fontSize: 16, color: '#7a7a8c', maxWidth: 500, margin: '0 auto' },
    body: { display: 'flex', flex: 1, gap: 0, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 20px 60px' },
    left: { flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 28 },
    right: { flex: 1, background: '#111118', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px', display: 'flex', flexDirection: 'column', gap: 20, alignSelf: 'flex-start', position: 'sticky', top: 80 },
    domainCard: (id, active) => ({
      background: active ? `${DOMAIN_META[id].color}12` : '#0e0e17',
      border: active ? `1px solid ${DOMAIN_META[id].color}55` : '0.5px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '16px 18px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }),
    domainIcon: (id) => ({
      width: 44, height: 44, borderRadius: 12,
      background: `${DOMAIN_META[id].color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
    }),
    domainLabel: (active, id) => ({ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: active ? DOMAIN_META[id].color : '#f0f0f5' }),
    domainDesc: { fontSize: 12, color: '#7a7a8c', marginTop: 2 },
    activeBadge: (id) => ({ marginLeft: 'auto', background: `${DOMAIN_META[id].color}20`, color: DOMAIN_META[id].color, fontSize: 10, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' }),
    // right panel
    previewTag: { display: 'inline-flex', alignItems: 'center', gap: 8, background: `${color}12`, border: `0.5px solid ${color}44`, color, borderRadius: 30, padding: '5px 12px', fontSize: 12, width: 'fit-content' },
    previewTitle: { fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: '#f0f0f5' },
    previewSub: { fontSize: 13, color: '#7a7a8c' },
    sectionLabel: { fontSize: 11, color: '#7a7a8c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
    serviceChip: { display: 'inline-flex', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#c0c0cc', marginRight: 6, marginBottom: 6 },
    priorityItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c0c0cc', marginBottom: 6 },
    bullet: { width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 },
    highlightBox: { background: `${color}10`, border: `0.5px solid ${color}33`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color },
    selectBtn: { width: '100%', background: color, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'opacity 0.2s' },
  };

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.heroTag}>PHASE 3 · MULTI-DOMAIN</div>
        <div style={s.heroTitle}>Choose Your Domain</div>
        <div style={s.heroSub}>SmartQ adapts its services, priority rules, and workflows to fit each environment.</div>
      </div>

      <div style={s.body}>
        {/* Left: domain list */}
        <div style={s.left}>
          {domains.map(([id, m]) => (
            <div
              key={id}
              style={s.domainCard(id, activeDomain === id || hoveredDomain === id)}
              onClick={() => handleSelect(id)}
              onMouseEnter={() => setHoveredDomain(id)}
              onMouseLeave={() => setHoveredDomain(null)}
            >
              <div style={s.domainIcon(id)}>{m.icon}</div>
              <div>
                <div style={s.domainLabel(activeDomain === id, id)}>{m.label}</div>
                <div style={s.domainDesc}>{m.desc}</div>
              </div>
              {activeDomain === id && <div style={s.activeBadge(id)}>Active</div>}
            </div>
          ))}
        </div>

        {/* Right: preview panel */}
        <div style={s.right}>
          <div style={s.previewTag}>{displayMeta.icon} {displayMeta.label}</div>
          <div>
            <div style={s.previewTitle}>{displayMeta.label} Queue System</div>
            <div style={s.previewSub}>Hover a domain to preview • Click to activate</div>
          </div>

          <div>
            <div style={s.sectionLabel}>Available Services</div>
            <div>
              {displayDetail.services.map((svc) => (
                <span key={svc} style={s.serviceChip}>{svc}</span>
              ))}
              <span style={{ ...s.serviceChip, background: 'transparent', border: 'none', color: '#7a7a8c' }}>+more</span>
            </div>
          </div>

          <div>
            <div style={s.sectionLabel}>Priority Categories</div>
            {displayDetail.priorities.map((p) => (
              <div key={p} style={s.priorityItem}>
                <div style={s.bullet} />
                {p}
              </div>
            ))}
          </div>

          <div>
            <div style={s.sectionLabel}>Domain Highlight</div>
            <div style={s.highlightBox}>✦ {displayDetail.highlight}</div>
          </div>

          <button
            style={s.selectBtn}
            onClick={() => handleSelect(displayDomain)}
            onMouseEnter={(e) => (e.target.style.opacity = 0.85)}
            onMouseLeave={(e) => (e.target.style.opacity = 1)}
          >
            Enter {displayMeta.label} Queue →
          </button>
        </div>
      </div>
    </div>
  );
}

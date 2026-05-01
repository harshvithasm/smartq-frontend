// src/components/Navbar.js — Phase 3: updated nav links
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';
import { useSocket } from '../context/SocketContext';
import { useAuth }   from '../context/AuthContext';

const DOMAINS = [
  { id: 'hospital',  icon: '🏥', label: 'Hospital'   },
  { id: 'bank',      icon: '🏦', label: 'Bank'       },
  { id: 'college',   icon: '🎓', label: 'College'    },
  { id: 'foodcourt', icon: '🍽️', label: 'Food Court' },
  { id: 'retail',    icon: '🛒', label: 'Retail'     },
];

const DOMAIN_COLORS = {
  hospital: '#22c9a5', bank: '#4ea8e8', college: '#f59e0b',
  foodcourt: '#f97316', retail: '#ec4899',
};

export default function Navbar() {
  const { activeDomain, setActiveDomain, meta } = useDomain();
  const { connected }  = useSocket();
  const { isLoggedIn, logout } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();

  const color = meta?.color || '#7c6af7';

  const handleDomainSwitch = (id) => {
    setActiveDomain(id);
    // If already on queue page, stay; otherwise go to domain selector
    if (location.pathname === '/queue') {
      // stay — domain will update in CustomerPage
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const s = {
    nav:       { background: '#111118', borderBottom: '0.5px solid rgba(255,255,255,0.07)', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 0, fontFamily: "'DM Sans', sans-serif", position: 'sticky', top: 0, zIndex: 100 },
    logo:      { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: '#f0f0f5', padding: '16px 16px 16px 0', borderRight: '0.5px solid rgba(255,255,255,0.07)', marginRight: 16, whiteSpace: 'nowrap', cursor: 'pointer' },
    logoSpan:  { color },
    domains:   { display: 'flex', gap: 4, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' },
    domainBtn: (active, c) => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 12px', background: 'transparent', border: 'none', borderBottom: active ? `2px solid ${c}` : '2px solid transparent', color: active ? c : '#7a7a8c', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }),
    pages:     { display: 'flex', gap: 4, alignItems: 'center', marginLeft: 16, borderLeft: '0.5px solid rgba(255,255,255,0.07)', paddingLeft: 16 },
    pageLink:  (active) => ({ color: active ? '#f0f0f5' : '#7a7a8c', textDecoration: 'none', fontSize: 12, padding: '6px 12px', borderRadius: 8, background: active ? 'rgba(255,255,255,0.06)' : 'transparent' }),
    badge:     { width: 7, height: 7, borderRadius: '50%', background: connected ? '#22c9a5' : '#f87171', boxShadow: connected ? '0 0 6px #22c9a5' : 'none', marginLeft: 4 },
    logoutBtn: { background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', color: '#7a7a8c', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' },
  };

  return (
    <nav style={s.nav}>
      <div style={s.logo} onClick={() => navigate('/')}>Smart<span style={s.logoSpan}>Q</span></div>

      <div style={s.domains}>
        {DOMAINS.map((d) => (
          <button key={d.id} style={s.domainBtn(activeDomain === d.id, DOMAIN_COLORS[d.id])}
            onClick={() => handleDomainSwitch(d.id)}>
            <span>{d.icon}</span> {d.label}
          </button>
        ))}
      </div>

      <div style={s.pages}>
        <Link to="/"        style={s.pageLink(location.pathname === '/')}>Domains</Link>
        <Link to="/queue"   style={s.pageLink(location.pathname === '/queue')}>Check-in</Link>
        {isLoggedIn
          ? <Link to="/admin" style={s.pageLink(location.pathname === '/admin')}>Admin</Link>
          : <Link to="/login" style={s.pageLink(location.pathname === '/login')}>Admin</Link>
        }
        <Link to="/display" style={s.pageLink(location.pathname === '/display')}>Display</Link>
        {isLoggedIn && <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>}
        <div style={s.badge} title={connected ? 'Live' : 'Offline'} />
      </div>
    </nav>
  );
}

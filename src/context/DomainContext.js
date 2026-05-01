// src/context/DomainContext.js — Phase 3: persists domain + loads config from API
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDomainConfig } from '../api';

export const DOMAIN_META = {
  hospital:  { label: 'Hospital',   icon: '🏥', color: '#22c9a5', prefix: 'H', desc: 'Hospitals & clinics' },
  bank:      { label: 'Bank',       icon: '🏦', color: '#4ea8e8', prefix: 'B', desc: 'Banks & financial services' },
  college:   { label: 'College',    icon: '🎓', color: '#f59e0b', prefix: 'C', desc: 'College & university offices' },
  foodcourt: { label: 'Food Court', icon: '🍽️', color: '#f97316', prefix: 'F', desc: 'Food stalls & cafeterias' },
  retail:    { label: 'Retail',     icon: '🛒', color: '#ec4899', prefix: 'R', desc: 'Retail stores & supermarkets' },
};

const DomainContext = createContext(null);

export function DomainProvider({ children }) {
  const [activeDomain, setActiveDomainState] = useState(
    () => localStorage.getItem('smartq_domain') || 'hospital'
  );
  const [domainConfig, setDomainConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);

  const meta = DOMAIN_META[activeDomain];

  // Fetch domain config from backend whenever domain changes
  useEffect(() => {
    setConfigLoading(true);
    getDomainConfig(activeDomain)
      .then((r) => setDomainConfig(r.config))
      .catch(() => setDomainConfig(null))
      .finally(() => setConfigLoading(false));
  }, [activeDomain]);

  const setActiveDomain = (d) => {
    localStorage.setItem('smartq_domain', d);
    setActiveDomainState(d);
  };

  return (
    <DomainContext.Provider value={{ activeDomain, setActiveDomain, meta, DOMAIN_META, domainConfig, configLoading }}>
      {children}
    </DomainContext.Provider>
  );
}

export const useDomain = () => useContext(DomainContext);

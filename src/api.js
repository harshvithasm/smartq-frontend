// src/api.js — Phase 3: added getDomainRules
import axios from 'axios';
const BASE = 'https://smartq-backend-1.onrender.com/api';
const authHeader = () => {
  const token = localStorage.getItem('smartq_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Auth ──────────────────────────────────────────────────────────
export const loginAdmin     = (email, password) => axios.post(`${BASE}/auth/login`, { email, password }).then((r) => r.data);
export const getMe          = (token) => axios.get(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data);
export const changePassword = (currentPassword, newPassword) => axios.patch(`${BASE}/auth/change-password`, { currentPassword, newPassword }, { headers: authHeader() }).then((r) => r.data);

// ── Queue ──────────────────────────────────────────────────────────
export const joinQueue      = (data) => axios.post(`${BASE}/queue/join`, data).then((r) => r.data);
export const getQueue       = (domain) => axios.get(`${BASE}/queue/${domain}`).then((r) => r.data);
export const getQueueStats  = (domain) => axios.get(`${BASE}/queue/${domain}/stats/summary`).then((r) => r.data);
export const getTokenStatus = (id) => axios.get(`${BASE}/queue/token/${id}`).then((r) => r.data);
export const markServed     = (id) => axios.patch(`${BASE}/queue/token/${id}/serve`, {}, { headers: authHeader() }).then((r) => r.data);
export const skipToken      = (id) => axios.patch(`${BASE}/queue/token/${id}/skip`, {}, { headers: authHeader() }).then((r) => r.data);
export const submitRating   = (id, rating) => axios.patch(`${BASE}/queue/token/${id}/rate`, { rating }).then((r) => r.data);

// Phase 3: domain priority rules
export const getDomainRules = (domain) => axios.get(`${BASE}/queue/${domain}/priority-rules`).then((r) => r.data);

// ── Counters ──────────────────────────────────────────────────────
export const getCounters        = (domain) => axios.get(`${BASE}/counters/${domain}`).then((r) => r.data);
export const createCounter      = (data) => axios.post(`${BASE}/counters`, data, { headers: authHeader() }).then((r) => r.data);
export const updateCounter      = (id, data) => axios.patch(`${BASE}/counters/${id}`, data, { headers: authHeader() }).then((r) => r.data);
export const deleteCounter      = (id) => axios.delete(`${BASE}/counters/${id}`, { headers: authHeader() }).then((r) => r.data);
export const callNextFromCounter = (counterId) => axios.post(`${BASE}/counters/${counterId}/call-next`, {}, { headers: authHeader() }).then((r) => r.data);
export const toggleCounter      = (id) => axios.patch(`${BASE}/counters/${id}/toggle`, {}, { headers: authHeader() }).then((r) => r.data);

// ── Domains ───────────────────────────────────────────────────────
export const getDomainConfig = (domain) => axios.get(`${BASE}/domains/${domain}`).then((r) => r.data);
export const getAllDomains   = () => axios.get(`${BASE}/domains`).then((r) => r.data);
export const seedDomains     = () => axios.post(`${BASE}/domains/seed`).then((r) => r.data);

// ── Phase 4: AI endpoints ─────────────────────────────────────────
export const getAIModelStatus   = () => axios.get(`${BASE}/ai/models`, { headers: authHeader() }).then((r) => r.data);
export const predictWaitTime    = (data) => axios.post(`${BASE}/ai/predict-wait`, data).then((r) => r.data);
export const getAssignmentInsights = (domain) => axios.get(`${BASE}/ai/assignment/${domain}`, { headers: authHeader() }).then((r) => r.data);
export const getDomainHealth    = (domain) => axios.get(`${BASE}/ai/health/${domain}`, { headers: authHeader() }).then((r) => r.data);

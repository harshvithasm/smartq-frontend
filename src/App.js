// src/App.js — Phase 3: added DomainSelectPage + /queue route
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider }    from './context/SocketContext';
import { DomainProvider }    from './context/DomainContext';
import { AuthProvider }      from './context/AuthContext';
import Navbar                from './components/Navbar';
import ProtectedRoute        from './components/ProtectedRoute';
import DomainSelectPage      from './pages/DomainSelectPage';
import CustomerPage          from './pages/CustomerPage';
import AdminPage             from './pages/AdminPage';
import DisplayBoard          from './pages/DisplayBoard';
import LoginPage             from './pages/LoginPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <DomainProvider>
          <BrowserRouter>
            <Routes>
              {/* Login — no navbar */}
              <Route path="/login" element={<LoginPage />} />

              {/* Pages with Navbar */}
              <Route path="/*" element={
                <>
                  <Navbar />
                  <Routes>
                    {/* Phase 3: domain selection is now the root */}
                    <Route path="/"        element={<DomainSelectPage />} />
                    <Route path="/queue"   element={<CustomerPage />} />
                    <Route path="/display" element={<DisplayBoard />} />
                    <Route path="/admin"   element={
                      <ProtectedRoute>
                        <AdminPage />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </>
              } />
            </Routes>
          </BrowserRouter>
        </DomainProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

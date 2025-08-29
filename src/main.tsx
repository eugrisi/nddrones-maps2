import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Index from './pages/Index';
import Login from './pages/Login';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  </StrictMode>
);

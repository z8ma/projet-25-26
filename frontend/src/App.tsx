import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatorProfile from './pages/CreatorProfile';
import ProfessionalProfile from './pages/ProfessionalProfile';
import Brainstorming from './pages/Brainstorming';

function App() {
  const { loadUser, token } = useAuthStore();

  useEffect(() => {
    // Load user on app start if token exists
    if (token) {
      loadUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/creator" element={<CreatorProfile />} />
        <Route path="/profile/professional" element={<ProfessionalProfile />} />
        <Route path="/brainstorming" element={<Brainstorming />} />
        <Route path="/brainstorming/:conversationId" element={<Brainstorming />} />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

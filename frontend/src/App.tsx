import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import ProfessionalLanding from './pages/ProfessionalLanding';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatorProfile from './pages/CreatorProfile';
import ProfessionalProfile from './pages/ProfessionalProfile';
import ProfessionalProjects from './pages/ProfessionalProjects';
import Brainstorming from './pages/Brainstorming';

function App() {
  const { loadUser, token, user } = useAuthStore();

  useEffect(() => {
    // Load user on app start if token exists
    // This ensures we have fresh user data from the server
    if (token) {
      loadUser();
    }
  }, [token, loadUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={(token && user) ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/professionnels" element={<ProfessionalLanding />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/creator" element={<CreatorProfile />} />
        <Route path="/profile/professional" element={<ProfessionalProfile />} />
        <Route path="/professional/projects" element={<ProfessionalProjects />} />
        <Route path="/brainstorming" element={<Brainstorming />} />
        <Route path="/brainstorming/:conversationId" element={<Brainstorming />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

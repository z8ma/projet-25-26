import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { SidebarProvider } from './contexts/SidebarContext';
import LandingPage from './pages/LandingPage';
import ProfessionalLanding from './pages/ProfessionalLanding';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatorProfile from './pages/CreatorProfile';
import ProfessionalProfile from './pages/ProfessionalProfile';
import CreatorProjects from './pages/CreatorProjects';
import Messages from './pages/Messages';
import Brainstorming from './pages/Brainstorming';
import Settings from './pages/Settings';
import ProfessionalSettings from './pages/ProfessionalSettings';
import SavedProfessionals from './pages/SavedProfessionals';
import ExploreProfessionals from './pages/ExploreProfessionals';
import PublicProfessionalProfile from './pages/PublicProfessionalProfile';

// Settings Router Component
function SettingsRouter() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'PROFESSIONAL' ? <ProfessionalSettings /> : <Settings />;
}

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
    <SidebarProvider>
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
        <Route path="/projects" element={<CreatorProjects />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/brainstorming" element={<Brainstorming />} />
        <Route path="/brainstorming/:conversationId" element={<Brainstorming />} />
        <Route path="/settings" element={<SettingsRouter />} />
        <Route path="/favorites" element={<SavedProfessionals />} />
        <Route path="/explore" element={<ExploreProfessionals />} />
        <Route path="/pro/:id" element={<PublicProfessionalProfile />} />
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}

export default App;

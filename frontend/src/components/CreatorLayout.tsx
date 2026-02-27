import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSidebar } from '../contexts/SidebarContext';
import { subscriptionApi } from '../services/api';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearch from './GlobalSearch';

interface CreatorLayoutProps {
  children: React.ReactNode;
}

export default function CreatorLayout({ children }: CreatorLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planName, setPlanName] = useState<string>('Gratuit');
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    subscriptionApi.getCurrent().then((res) => {
      if (res.success) {
        const name = res.data.plan?.name;
        setPlanName(name === 'Free' ? 'Gratuit' : (name || 'Gratuit'));
      }
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'JUNY AI',
      path: '/brainstorming',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      name: 'Mes Projets',
      path: '/projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Explorer',
      path: '/explore',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: 'Mes listes',
      path: '/favorites',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      name: 'Mon Profil',
      path: '/profile/creator',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Paramètres',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
          } ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-gray-100 ${isCollapsed ? 'lg:justify-center lg:px-0 px-4' : 'px-4'}`}>
          <Link to="/" className={`flex items-center gap-2 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="JUNY Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`text-2xl font-bold logo-gradient whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
              }`}>
              JUNY
            </span>
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Badges - Hidden when collapsed on desktop */}
        <div className={`px-4 py-3 border-b border-gray-100 transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:h-0 lg:py-0 lg:opacity-0' : 'h-auto opacity-100'
          }`}>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
              Créateur
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              planName === 'Gratuit'
                ? 'bg-green-100 text-green-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {planName}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'lg:p-0 lg:py-2' : 'p-2'}`}>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path === '/brainstorming' && location.pathname.startsWith('/brainstorming'));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    title={isCollapsed ? item.name : undefined}
                    className={`group relative flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200
                      ${isCollapsed
                        ? 'lg:w-11 lg:h-11 lg:!p-0 lg:!gap-0 lg:!rounded-full lg:mx-auto'
                        : ''
                      } ${isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {item.icon}
                    </span>
                    <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:hidden' : 'w-auto opacity-100'
                      }`}>
                      {item.name}
                    </span>
                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] hidden lg:block shadow-lg">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle Button - Desktop only */}
        <div className="hidden lg:block p-2 border-t border-gray-100">
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-xl font-medium transition-all duration-200 ${isCollapsed ? 'justify-center' : ''
              }`}
            title={isCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}>
              Réduire
            </span>
          </button>
        </div>

        {/* Sidebar Footer - Logout */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Déconnexion' : undefined}
            className={`group relative flex items-center gap-3 w-full px-3 py-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-all duration-200 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''
              }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
              }`}>
              Déconnexion
            </span>
            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] hidden lg:block shadow-lg">
                Déconnexion
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title - visible on mobile */}
            <h1 className="lg:hidden text-lg font-semibold text-gray-900">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl">
              <GlobalSearch />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <NotificationDropdown />

              {/* Profile Quick Access - Desktop */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.creator?.companyName || 'Mon Entreprise'}
                  </p>
                  <p className="text-xs text-gray-500">Créateur</p>
                </div>
                {user?.creator?.profilePictureUrl ? (
                  <img
                    src={user.creator.profilePictureUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">${user?.creator?.companyName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}</div>`;
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.creator?.companyName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

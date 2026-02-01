import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PublicNavbarProps {
  variant?: 'primary' | 'purple';
}

export default function PublicNavbar({ variant = 'primary' }: PublicNavbarProps) {
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [ressourcesOpen, setRessourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const location = useLocation();

  const isProfessionalPage = location.pathname === '/professionnels';

  // Color classes based on variant
  const colors = {
    primary: {
      hover: 'hover:text-primary-600 hover:bg-orange-50',
      active: 'text-primary-600 bg-orange-50',
      dropdownHover: 'hover:bg-orange-50',
      button: 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
      iconGradient1: 'from-primary-500 to-primary-600',
      iconGradient2: 'from-purple-500 to-purple-600',
      iconGradient3: 'from-blue-500 to-blue-600',
    },
    purple: {
      hover: 'hover:text-purple-600 hover:bg-purple-50',
      active: 'text-purple-600 bg-purple-50',
      dropdownHover: 'hover:bg-purple-50',
      button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      iconGradient1: 'from-purple-500 to-purple-600',
      iconGradient2: 'from-pink-500 to-pink-600',
      iconGradient3: 'from-orange-500 to-orange-600',
    },
  };

  const theme = colors[variant];

  return (
    <>
      {/* Navigation - Détachée et arrondie */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <nav className="bg-white/95 backdrop-blur-lg rounded-full shadow-2xl border border-gray-100">
          <div className="px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo et menu gauche */}
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center group">
                  <h1 className="text-3xl font-bold logo-gradient transition-transform duration-300 hover:scale-110">
                    JUNY
                  </h1>
                </Link>

                <div className="hidden md:flex items-center gap-2">
                  {/* Solutions Dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setSolutionsOpen(true)}
                    onMouseLeave={() => setSolutionsOpen(false)}
                  >
                    <button className={`px-4 py-2.5 text-base text-gray-700 font-medium transition-all duration-200 rounded-full flex items-center gap-1.5 ${theme.hover}`}>
                      Solutions
                      <svg className={`w-4 h-4 transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {solutionsOpen && (
                      <div className="absolute top-full left-0 pt-2 w-72">
                        <div className="bg-white rounded-2xl shadow-2xl py-3 border border-gray-100">
                          <a
                            href="/#solutions"
                            className={`flex items-start gap-3 px-5 py-3 text-base text-gray-700 transition-colors rounded-xl mx-2 ${theme.dropdownHover}`}
                          >
                            <div className={`w-10 h-10 bg-gradient-to-br ${theme.iconGradient1} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">Matching IA</div>
                              <div className="text-sm text-gray-500">Trouvez le professionnel parfait</div>
                            </div>
                          </a>
                          <a
                            href="/#how-it-works"
                            className={`flex items-start gap-3 px-5 py-3 text-base text-gray-700 transition-colors rounded-xl mx-2 ${theme.dropdownHover}`}
                          >
                            <div className={`w-10 h-10 bg-gradient-to-br ${theme.iconGradient2} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">Brainstorming IA</div>
                              <div className="text-sm text-gray-500">Affinez votre projet avec l'IA</div>
                            </div>
                          </a>
                          <a
                            href="/#solutions"
                            className={`flex items-start gap-3 px-5 py-3 text-base text-gray-700 transition-colors rounded-xl mx-2 ${theme.dropdownHover}`}
                          >
                            <div className={`w-10 h-10 bg-gradient-to-br ${theme.iconGradient3} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">Gestion de projet</div>
                              <div className="text-sm text-gray-500">Suivez vos collaborations</div>
                            </div>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Professionnels */}
                  <Link
                    to="/professionnels"
                    className={`px-4 py-2.5 text-base font-medium transition-all duration-200 rounded-full ${
                      isProfessionalPage
                        ? theme.active + ' font-semibold'
                        : 'text-gray-700 ' + theme.hover
                    }`}
                  >
                    Professionnels
                  </Link>

                  {/* Tarifs */}
                  <a
                    href="/#pricing"
                    className={`px-4 py-2.5 text-base text-gray-700 font-medium transition-all duration-200 rounded-full ${theme.hover}`}
                  >
                    Tarifs
                  </a>

                  {/* Ressources Dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setRessourcesOpen(true)}
                    onMouseLeave={() => setRessourcesOpen(false)}
                  >
                    <button className={`px-4 py-2.5 text-base text-gray-700 font-medium transition-all duration-200 rounded-full flex items-center gap-1.5 ${theme.hover}`}>
                      Ressources
                      <svg className={`w-4 h-4 transition-transform duration-200 ${ressourcesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {ressourcesOpen && (
                      <div className="absolute top-full left-0 pt-2 w-60">
                        <div className="bg-white rounded-2xl shadow-2xl py-3 border border-gray-100">
                          <a
                            href="/#about"
                            className={`flex items-center gap-3 px-5 py-3 text-base text-gray-700 transition-colors rounded-xl mx-2 ${theme.dropdownHover}`}
                          >
                            <svg className={`w-5 h-5 ${variant === 'primary' ? 'text-primary-500' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            À propos
                          </a>
                          <a
                            href="/#contact"
                            className={`flex items-center gap-3 px-5 py-3 text-base text-gray-700 transition-colors rounded-xl mx-2 ${theme.dropdownHover}`}
                          >
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact
                          </a>
                          <a
                            href="#"
                            className={`flex items-center gap-3 px-5 py-3 text-base text-gray-700 transition-colors rounded-xl mx-2 ${theme.dropdownHover}`}
                          >
                            <svg className={`w-5 h-5 ${variant === 'primary' ? 'text-purple-500' : 'text-pink-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            Blog
                          </a>
                          <a
                            href="#"
                            className={`flex items-center gap-3 px-5 py-3 text-base text-gray-700 transition-colors rounded-xl mx-2 ${theme.dropdownHover}`}
                          >
                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Centre d'aide
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons connexion/inscription ou profil utilisateur */}
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`hidden md:flex px-5 py-2.5 text-base text-gray-700 font-medium transition-all duration-200 rounded-full ${theme.hover}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard"
                      className="hidden md:flex items-center gap-2"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${theme.button} rounded-full flex items-center justify-center text-white font-bold`}>
                        {user?.creator?.companyName?.[0] || user?.professional?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`hidden md:block px-5 py-2.5 text-base text-gray-700 font-medium transition-all duration-200 rounded-full ${theme.hover}`}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className={`hidden md:block px-6 py-2.5 bg-gradient-to-r ${theme.button} text-white rounded-full text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105`}
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 space-y-2">
              <a href="/#solutions" className={`block px-4 py-3 text-gray-700 rounded-xl ${theme.dropdownHover}`}>
                Solutions
              </a>
              <Link
                to="/professionnels"
                className={`block px-4 py-3 rounded-xl ${isProfessionalPage ? theme.active : 'text-gray-700 ' + theme.dropdownHover}`}
              >
                Professionnels
              </Link>
              <a href="/#pricing" className={`block px-4 py-3 text-gray-700 rounded-xl ${theme.dropdownHover}`}>
                Tarifs
              </a>
              <a href="/#about" className={`block px-4 py-3 text-gray-700 rounded-xl ${theme.dropdownHover}`}>
                À propos
              </a>
              <a href="/#contact" className={`block px-4 py-3 text-gray-700 rounded-xl ${theme.dropdownHover}`}>
                Contact
              </a>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className={`block w-full text-center px-4 py-3 bg-gradient-to-r ${theme.button} text-white rounded-xl font-semibold`}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`block w-full text-center px-4 py-3 text-gray-700 rounded-xl ${theme.dropdownHover}`}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className={`block w-full text-center px-4 py-3 bg-gradient-to-r ${theme.button} text-white rounded-xl font-semibold`}
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer pour compenser la nav fixe */}
      <div className="h-24"></div>
    </>
  );
}

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [ressourcesOpen, setRessourcesOpen] = useState(false);

  // Intersection Observer pour les animations au scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const pricing = {
    monthly: {
      gratuit: 0,
      starter: 19,
      pro: 39,
      premium: 79
    },
    yearly: {
      gratuit: 0,
      starter: 190,
      pro: 390,
      premium: 790
    }
  };

  const features = {
    gratuit: [
      { text: '1 projet actif', included: true },
      { text: '3 matchs IA par mois', included: true },
      { text: 'Messagerie intégrée', included: true },
      { text: 'Support email', included: true },
      { text: 'Brainstorming IA limité', included: true },
      { text: 'Projets illimités', included: false },
      { text: 'Matching IA avancé', included: false },
      { text: 'Statistiques', included: false }
    ],
    starter: [
      { text: 'Tout l\'offre Gratuit', included: true },
      { text: '5 projets actifs', included: true },
      { text: 'Matchs IA illimités', included: true },
      { text: 'Brainstorming IA illimité', included: true },
      { text: 'Statistiques de base', included: true },
      { text: 'Templates de briefs', included: true },
      { text: 'Support prioritaire', included: false },
      { text: 'Badge "Vérifié"', included: false }
    ],
    pro: [
      { text: 'Tout l\'offre Starter', included: true },
      { text: 'Projets illimités', included: true },
      { text: 'Matching IA avancé', included: true },
      { text: 'Statistiques détaillées', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Badge "Vérifié"', included: true },
      { text: 'Visibilité augmentée', included: true },
      { text: 'Accès API', included: false }
    ],
    premium: [
      { text: 'Tout l\'offre Pro', included: true },
      { text: 'Support dédié 24/7', included: true },
      { text: 'Badge "Premium"', included: true },
      { text: 'Visibilité maximale', included: true },
      { text: 'Statistiques avancées', included: true },
      { text: 'Accès API complet', included: true },
      { text: 'Gestionnaire de compte', included: true },
      { text: 'Matching prioritaire', included: true }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 animate-gradient">
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
                    <button className="px-4 py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-full hover:bg-orange-50 flex items-center gap-1.5">
                      Solutions
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {solutionsOpen && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl py-3 border border-gray-100">
                        <a
                          href="/#solutions"
                          className="block px-5 py-3 text-base text-gray-700 hover:bg-orange-50 transition-colors rounded-xl mx-2"
                        >
                          <div className="font-semibold text-gray-900">Matching IA</div>
                          <div className="text-sm text-gray-500">Trouvez le professionnel parfait</div>
                        </a>
                        <a
                          href="/#how-it-works"
                          className="block px-5 py-3 text-base text-gray-700 hover:bg-orange-50 transition-colors rounded-xl mx-2"
                        >
                          <div className="font-semibold text-gray-900">Brainstorming IA</div>
                          <div className="text-sm text-gray-500">Affinez votre projet avec l'IA</div>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Professionnels */}
                  <Link
                    to="/professionnels"
                    className="px-4 py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-full hover:bg-orange-50"
                  >
                    Professionnels
                  </Link>

                  {/* Tarifs */}
                  <Link
                    to="/pricing"
                    className="px-4 py-2.5 text-base text-primary-600 font-semibold transition-all duration-200 rounded-full bg-orange-50"
                  >
                    Tarifs
                  </Link>

                  {/* Ressources Dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setRessourcesOpen(true)}
                    onMouseLeave={() => setRessourcesOpen(false)}
                  >
                    <button className="px-4 py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-full hover:bg-orange-50 flex items-center gap-1.5">
                      Ressources
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {ressourcesOpen && (
                      <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl py-3 border border-gray-100">
                        <a
                          href="/#about"
                          className="block px-5 py-3 text-base text-gray-700 hover:bg-orange-50 transition-colors rounded-xl mx-2"
                        >
                          À propos
                        </a>
                        <a
                          href="/#contact"
                          className="block px-5 py-3 text-base text-gray-700 hover:bg-orange-50 transition-colors rounded-xl mx-2"
                        >
                          Contact
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons connexion/inscription */}
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-full hover:bg-orange-50"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Spacer pour compenser la nav fixe */}
      <div className="h-24"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Des tarifs <span className="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">simples et transparents</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choisissez l'offre qui correspond à vos besoins.<br className="hidden sm:block" />
            Pas de frais cachés, pas de surprises. Juste ce dont vous avez besoin.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg border border-gray-200 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Annuel
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-16 px-2 sm:px-0">
          {/* Gratuit Plan */}
          <div className="animate-on-scroll bg-white rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border-2 border-gray-200 relative order-1 sm:order-1">
            <div className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full blur-xl opacity-50 animate-float"></div>

            <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">GRATUIT</h3>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">{pricing[billingCycle].gratuit}€</span>
                <span className="text-gray-600 text-xs sm:text-sm">/ {billingCycle === 'monthly' ? 'mois' : 'an'}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Pour découvrir la plateforme</p>
            </div>

            <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
              {features.gratuit.map((feature, index) => (
                <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                  {feature.included ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`text-xs sm:text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>{feature.text}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Starter Plan */}
          <div className="animate-on-scroll bg-white rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border-2 border-blue-200 relative order-2 sm:order-2">
            <div className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full blur-xl opacity-50 animate-float"></div>

            <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">STARTER</h3>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">{pricing[billingCycle].starter}€</span>
                <span className="text-gray-600 text-xs sm:text-sm">/ {billingCycle === 'monthly' ? 'mois' : 'an'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs sm:text-sm text-green-600 font-semibold mt-1 sm:mt-2">Économisez 38€ par an</p>
              )}
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Pour les créateurs débutants</p>
            </div>

            <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
              {features.starter.map((feature, index) => (
                <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                  {feature.included ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`text-xs sm:text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>{feature.text}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              Choisir Starter
            </Link>
          </div>

          {/* Pro Plan - Featured */}
          <div className="animate-on-scroll bg-gradient-to-br from-orange-50 to-white rounded-2xl p-4 sm:p-6 pt-8 sm:pt-10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-3 border-2 border-primary-500 relative sm:scale-105 opacity-0 order-first sm:order-3">
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-20">
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse-glow">
                RECOMMANDÉ
              </span>
            </div>

            <div className="absolute top-4 right-4 w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full blur-xl opacity-60 animate-float"></div>

            <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-1 sm:mt-2 relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">PRO</h3>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">{pricing[billingCycle].pro}€</span>
                <span className="text-gray-600 text-xs sm:text-sm">/ {billingCycle === 'monthly' ? 'mois' : 'an'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs sm:text-sm text-green-600 font-semibold mt-1 sm:mt-2">Économisez 78€ par an</p>
              )}
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Pour les créateurs actifs</p>
            </div>

            <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                  {feature.included ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`text-xs sm:text-sm ${feature.included ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{feature.text}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Choisir Pro →
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="animate-on-scroll bg-white rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border-2 border-purple-200 relative order-3 sm:order-4">
            <div className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full blur-xl opacity-50 animate-float"></div>

            <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">PREMIUM</h3>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">{pricing[billingCycle].premium}€</span>
                <span className="text-gray-600 text-xs sm:text-sm">/ {billingCycle === 'monthly' ? 'mois' : 'an'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs sm:text-sm text-green-600 font-semibold mt-1 sm:mt-2">Économisez 158€ par an</p>
              )}
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Pour les professionnels exigeants</p>
            </div>

            <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs sm:text-sm text-gray-700">{feature.text}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              Passer au Premium
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Puis-je changer d'abonnement à tout moment ?
              </summary>
              <p className="mt-4 text-gray-600">
                Oui, vous pouvez passer à un abonnement supérieur ou inférieur à tout moment. Les changements prennent effet immédiatement et nous ajustons la facturation au prorata.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Comment fonctionne la période d'essai de 14 jours ?
              </summary>
              <p className="mt-4 text-gray-600">
                L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités de base sans engagement. Aucune carte bancaire n'est requise pour commencer. Vous pourrez ensuite choisir l'offre qui vous convient.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Quels sont les moyens de paiement acceptés ?
              </summary>
              <p className="mt-4 text-gray-600">
                Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), les virements SEPA, et PayPal. Tous les paiements sont sécurisés et cryptés.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Y a-t-il des frais cachés ?
              </summary>
              <p className="mt-4 text-gray-600">
                Non, absolument aucun frais caché. Le prix affiché est le prix que vous payez. Aucune commission sur les projets, aucun frais de transaction supplémentaire.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Puis-je annuler mon abonnement ?
              </summary>
              <p className="mt-4 text-gray-600">
                Oui, vous pouvez annuler votre abonnement à tout moment en un clic depuis votre tableau de bord. Aucune pénalité, aucune question posée. Vous gardez l'accès jusqu'à la fin de votre période de facturation.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Offrez-vous des réductions pour les étudiants ou les associations ?
              </summary>
              <p className="mt-4 text-gray-600">
                Oui ! Nous proposons des réductions de 50% pour les étudiants et les associations à but non lucratif. Contactez-nous avec vos justificatifs pour en bénéficier.
              </p>
            </details>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary-600 via-pink-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez plus de 500 créateurs et professionnels qui utilisent JUNY pour collaborer efficacement.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
          >
            <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
              Commencer gratuitement →
            </span>
          </Link>
          <p className="text-sm text-white/80 mt-4">
            Sans carte bancaire · Annulation en 1 clic
          </p>
        </section>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-stone-900 text-gray-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4 logo-gradient">JUNY</h3>
              <p className="text-sm">La plateforme qui connecte créateurs et professionnels créatifs.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#solutions" className="hover:text-primary-400 transition-colors">Matching IA</a></li>
                <li><a href="/#how-it-works" className="hover:text-primary-400 transition-colors">Brainstorming</a></li>
                <li><Link to="/professionnels" className="hover:text-primary-400 transition-colors">Pour les pros</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#about" className="hover:text-primary-400 transition-colors">À propos</a></li>
                <li><a href="/#contact" className="hover:text-primary-400 transition-colors">Contact</a></li>
                <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Tarifs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Suivez-nous</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 JUNY. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

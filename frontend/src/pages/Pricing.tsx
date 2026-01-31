import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { subscriptionApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Plan {
  id: string;
  name: string;
  priceMonthly: string;
  priceYearly: string | null;
  maxProjectsMonth: number;
  aiCreditsMonth: number;
  features: { list: string[]; highlighted?: boolean } | null;
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [ressourcesOpen, setRessourcesOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load plans from API
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await subscriptionApi.getPlans();
        if (response.success) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error('Error loading plans:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  // Show message if subscription was cancelled
  useEffect(() => {
    if (searchParams.get('subscription') === 'cancelled') {
      // Could show a toast here
    }
  }, [searchParams]);

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
  }, [plans]);

  const handleSubscribe = async (planId: string) => {
    if (!token || !user) {
      navigate('/register');
      return;
    }

    setCheckoutLoading(planId);
    try {
      const response = await subscriptionApi.createCheckout({
        planId,
        billingCycle,
      });

      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert(response.message || 'Erreur lors de la création du paiement');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création du paiement');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getPrice = (plan: Plan) => {
    if (billingCycle === 'yearly' && plan.priceYearly) {
      return parseFloat(plan.priceYearly);
    }
    return parseFloat(plan.priceMonthly);
  };

  const getSavings = (plan: Plan) => {
    if (!plan.priceYearly) return 0;
    const monthlyTotal = parseFloat(plan.priceMonthly) * 12;
    const yearlyTotal = parseFloat(plan.priceYearly);
    return Math.round(monthlyTotal - yearlyTotal);
  };

  const getPlanColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'starter':
        return { bg: 'from-blue-400 to-blue-600', border: 'border-blue-200', button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' };
      case 'pro':
        return { bg: 'from-primary-500 to-primary-600', border: 'border-primary-500', button: 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700' };
      case 'premium':
        return { bg: 'from-purple-500 to-purple-600', border: 'border-purple-200', button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' };
      default:
        return { bg: 'from-gray-400 to-gray-600', border: 'border-gray-200', button: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700' };
    }
  };

  const getPlanIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'starter':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />;
      case 'pro':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />;
      case 'premium':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />;
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
    }
  };

  // Default features for free tier
  const freeFeatures = [
    '3 projets par mois',
    '50 crédits IA',
    'Matching intelligent',
    'Messagerie intégrée',
    'Support email',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 animate-gradient">
      {/* Navigation */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <nav className="bg-white/95 backdrop-blur-lg rounded-full shadow-2xl border border-gray-100">
          <div className="px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center group">
                  <h1 className="text-3xl font-bold logo-gradient transition-transform duration-300 hover:scale-110">
                    JUNY
                  </h1>
                </Link>

                <div className="hidden md:flex items-center gap-2">
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
                        <a href="/#solutions" className="block px-5 py-3 text-base text-gray-700 hover:bg-orange-50 transition-colors rounded-xl mx-2">
                          <div className="font-semibold text-gray-900">Matching IA</div>
                          <div className="text-sm text-gray-500">Trouvez le professionnel parfait</div>
                        </a>
                        <a href="/#how-it-works" className="block px-5 py-3 text-base text-gray-700 hover:bg-orange-50 transition-colors rounded-xl mx-2">
                          <div className="font-semibold text-gray-900">Brainstorming IA</div>
                          <div className="text-sm text-gray-500">Affinez votre projet avec l'IA</div>
                        </a>
                      </div>
                    )}
                  </div>

                  <Link to="/professionnels" className="px-4 py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-full hover:bg-orange-50">
                    Professionnels
                  </Link>

                  <Link to="/pricing" className="px-4 py-2.5 text-base text-primary-600 font-semibold transition-all duration-200 rounded-full bg-orange-50">
                    Tarifs
                  </Link>

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
                        <a href="/#about" className="block px-5 py-3 text-base text-gray-700 hover:bg-orange-50 transition-colors rounded-xl mx-2">À propos</a>
                        <a href="/#contact" className="block px-5 py-3 text-base text-gray-700 hover:bg-orange-50 transition-colors rounded-xl mx-2">Contact</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <Link to="/dashboard" className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="px-5 py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-full hover:bg-orange-50">
                      Connexion
                    </Link>
                    <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="h-24"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Des tarifs <span className="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">simples et transparents</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choisissez l'offre qui correspond à vos besoins.<br className="hidden sm:block" />
            Pas de frais cachés, pas de surprises.
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-16 px-2 sm:px-0">
            {/* Free Plan */}
            <div className="animate-on-scroll bg-white rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border-2 border-gray-200 relative">
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
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">0€</span>
                  <span className="text-gray-600 text-xs sm:text-sm">/ mois</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Pour découvrir la plateforme</p>
              </div>

              <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
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

            {/* Dynamic Plans */}
            {plans.map((plan, index) => {
              const colors = getPlanColor(plan.name);
              const isPro = plan.name.toLowerCase() === 'pro';
              const features = plan.features?.list || [];

              return (
                <div
                  key={plan.id}
                  className={`animate-on-scroll bg-white rounded-2xl p-4 sm:p-6 ${isPro ? 'pt-8 sm:pt-10' : ''} shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${isPro ? 'sm:scale-105' : ''} opacity-0 border-2 ${colors.border} relative`}
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  {isPro && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        RECOMMANDE
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {getPlanIcon(plan.name)}
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{plan.name.toUpperCase()}</h3>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">{getPrice(plan)}€</span>
                      <span className="text-gray-600 text-xs sm:text-sm">/ {billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                    </div>
                    {billingCycle === 'yearly' && getSavings(plan) > 0 && (
                      <p className="text-xs sm:text-sm text-green-600 font-semibold mt-1 sm:mt-2">
                        Economisez {getSavings(plan)}€ par an
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                      {plan.maxProjectsMonth} projets · {plan.aiCreditsMonth} credits IA
                    </p>
                  </div>

                  <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 sm:gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkoutLoading === plan.id}
                    className={`block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r ${colors.button} text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {checkoutLoading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Chargement...
                      </span>
                    ) : (
                      `Choisir ${plan.name}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            Questions frequentes
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Puis-je changer d'abonnement a tout moment ?
              </summary>
              <p className="mt-4 text-gray-600">
                Oui, vous pouvez passer a un abonnement superieur ou inferieur a tout moment. Les changements prennent effet immediatement et nous ajustons la facturation au prorata.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Quels sont les moyens de paiement acceptes ?
              </summary>
              <p className="mt-4 text-gray-600">
                Nous acceptons les cartes bancaires (Visa, Mastercard, American Express). Tous les paiements sont securises via Stripe.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Puis-je annuler mon abonnement ?
              </summary>
              <p className="mt-4 text-gray-600">
                Oui, vous pouvez annuler votre abonnement a tout moment depuis votre tableau de bord. Vous gardez l'acces jusqu'a la fin de votre periode de facturation.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer">
                Y a-t-il des frais caches ?
              </summary>
              <p className="mt-4 text-gray-600">
                Non, absolument aucun frais cache. Le prix affiche est le prix que vous payez.
              </p>
            </details>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary-600 via-pink-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pret a commencer ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de createurs et professionnels qui utilisent JUNY pour collaborer efficacement.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
          >
            <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
              Commencer gratuitement
            </span>
          </Link>
        </section>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-stone-900 text-gray-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4 logo-gradient">JUNY</h3>
              <p className="text-sm">La plateforme qui connecte createurs et professionnels creatifs.</p>
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
                <li><a href="/#about" className="hover:text-primary-400 transition-colors">A propos</a></li>
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 JUNY. Tous droits reserves.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

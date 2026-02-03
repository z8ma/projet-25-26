import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// Placeholder images - replace with actual image paths when available
const creativeWork = 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop';
const teamCollaboration = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop';
const teamWorking = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop';
const overheadTeam = 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop';
const digitalAnimation = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop';

export default function LandingPage() {
  useDocumentTitle('JUNY - Trouvez le créatif parfait');

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

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll<HTMLElement>('.parallax-image');

      parallaxElements.forEach((element) => {
        const speed = element.getAttribute('data-speed') || '0.5';
        const yPos = -(scrolled * parseFloat(speed));
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 animate-gradient">
      <PublicNavbar variant="primary" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative overflow-hidden">
        {/* Particules animées */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="particles-container"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="inline-block mb-4 fade-in-up-blur">
            <span className="px-4 py-2 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 rounded-full text-sm font-semibold border border-primary-200 flex items-center gap-2 w-fit mx-auto">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Déjà 500+ créateurs nous font confiance
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight fade-in-up-blur animate-delay-100">
            Le créatif parfait pour votre projet.<br />
            <span className="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">En 5 minutes.</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed fade-in-up-blur animate-delay-200">
            Arrêtez de perdre des jours à comparer des portfolios.<br className="hidden sm:block" />
            Notre IA trouve <span className="font-semibold text-gray-900">votre match créatif idéal</span> pendant que vous prenez un café ☕
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up-blur animate-delay-300">
            <Link
              to="/register"
              className="shimmer-button px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 animate-pulse-glow relative overflow-hidden"
            >
              Trouver mon créatif →
            </Link>
            <a
              href="#how-it-works"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-primary-600 border-2 border-primary-500 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Voir comment ça marche
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4 fade-in-up-blur animate-delay-400">
            Gratuit pendant 14 jours · Sans carte bancaire · Annulation en 1 clic
          </p>
        </div>
      </section>

      {/* Image Section 1: Creative Inspiration */}
      <section className="relative bg-white py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="parallax-container order-2 md:order-1">
              <img
                src={creativeWork}
                alt="Créatif travaillant sur une tablette"
                className="parallax-image rounded-2xl shadow-2xl w-full h-auto animate-on-scroll opacity-0 scale-in"
                data-speed="0.15"
              />
            </div>
            <div className="order-1 md:order-2 animate-on-scroll opacity-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Votre idée mérite <span className="text-gradient-primary">le meilleur talent</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                Chaque projet est unique. Chaque créatif a son style. L'IA analyse des milliers de portfolios pour vous proposer exactement le professionnel qui donnera vie à votre vision.
              </p>
              <p className="text-base sm:text-lg text-gray-500">
                Plus de hasard. Plus de compromis. Juste le match parfait.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="solutions" className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 animate-on-scroll opacity-0">
              Fini les prises de tête
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 animate-on-scroll opacity-0">
              Le bon créatif, au bon moment, pour le bon projet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Carte IA - Orange */}
            <div className="animate-on-scroll group p-6 md:p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 hover:border-primary-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg animate-float">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-primary-600 transition-colors">5 min au lieu de 3 semaines</h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Plus besoin de passer des heures à comparer des dizaines de portfolios. L'IA fait le tri et vous propose uniquement les profils qui matchent avec votre vision.
              </p>
            </div>

            {/* Carte Temps - Bleu */}
            <div className="animate-on-scroll group p-6 md:p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors">Le style ET le budget</h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Vous aimez son travail mais il est trop cher? Oubliez ça. On trouve uniquement des créatifs qui ont le bon style ET qui rentrent dans votre budget.
              </p>
            </div>

            {/* Carte Matching - Violet */}
            <div className="animate-on-scroll group p-6 md:p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-purple-600 transition-colors">Disponible maintenant</h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Besoin d'un graphiste pour la semaine prochaine? On vous propose uniquement des créatifs dispos quand vous en avez besoin. Plus d'attente de 3 mois.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section 2: Collaboration */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-br from-orange-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-on-scroll opacity-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                La collaboration <span className="text-gradient-primary">qui fait la différence</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                Travailler avec le bon créatif, c'est bien plus qu'une prestation. C'est un échange, une synergie, une collaboration qui fait grandir votre projet.
              </p>
              <p className="text-base sm:text-lg text-gray-500">
                JUNY trouve les professionnels qui partagent votre énergie et comprennent votre univers. Pas juste un prestataire, un vrai partenaire créatif.
              </p>
            </div>
            <div className="parallax-container">
              <img
                src={teamCollaboration}
                alt="Équipe collaborant sur un projet"
                className="parallax-image rounded-2xl shadow-2xl w-full h-auto animate-on-scroll opacity-0 reveal-right"
                data-speed="0.2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 animate-on-scroll opacity-0">
              Vraiment simple
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 animate-on-scroll opacity-0">
              3 étapes · 5 minutes · 0 prise de tête
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            <div className="text-center animate-on-scroll opacity-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Racontez votre vision
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                "J'ai besoin d'un logo minimaliste pour ma marque de cosmétiques, budget 1500€, deadline dans 2 semaines." L'IA comprend tout, même en langage humain.
              </p>
            </div>

            <div className="text-center animate-on-scroll opacity-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Découvrez vos 3 matchs
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                En 30 secondes, vous avez 3 profils parfaits: leurs portfolios, leurs tarifs, leur disponibilité. Plus de tri, plus de comparaison. Juste les bons.
              </p>
            </div>

            <div className="text-center animate-on-scroll opacity-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Lancez votre projet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Un clic pour contacter. Pas de formulaire à rallonge. Vous discutez directement avec le créatif, validez le brief, et hop, c'est parti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section 3: Teamwork */}
      <section className="relative bg-white py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="parallax-container order-2 md:order-1">
              <img
                src={overheadTeam}
                alt="Vue aérienne d'une équipe créative au travail"
                className="parallax-image rounded-2xl shadow-2xl w-full h-auto animate-on-scroll opacity-0 reveal-left"
                data-speed="0.18"
              />
            </div>
            <div className="order-1 md:order-2 animate-on-scroll opacity-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Des créatifs <span className="text-gradient-primary">vérifiés et talentueux</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                Graphistes, vidéastes, photographes, motion designers... Tous les créatifs sur JUNY sont sélectionnés pour leur talent et leur professionnalisme.
              </p>
              <p className="text-base sm:text-lg text-gray-500">
                Portfolio vérifié. Disponibilité réelle. Tarifs transparents. Vous travaillez avec des pros, pas des promesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 animate-on-scroll opacity-0">
              Des tarifs adaptés à vos besoins
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 animate-on-scroll opacity-0">
              Commencez gratuitement, évoluez selon vos projets
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-7xl mx-auto mb-8 mt-8 px-2 sm:px-0">
            {/* Pro Plan - Featured - Premier sur mobile */}
            <div className="animate-on-scroll group featured-card bg-gradient-to-br from-orange-50 to-white rounded-2xl p-4 sm:p-5 pt-7 sm:pt-8 border-2 border-primary-500 hover:border-primary-600 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 relative sm:scale-105 opacity-0 overflow-visible order-first sm:order-3">
              <div className="absolute top-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-full blur-xl opacity-60 animate-float" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse-glow whitespace-nowrap">
                  RECOMMANDÉ
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3 mt-1 relative z-10">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center animate-float" style={{ animationDelay: '0.3s' }}>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">PRO</h3>
              </div>
              <div className="mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">49€</span>
                <span className="text-gray-500 text-xs ml-1">/ mois</span>
              </div>
              <ul className="text-left space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                <li className="flex items-start text-xs sm:text-sm text-gray-800 font-medium">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Projets illimités</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-800 font-medium">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Matching IA avancé</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-800 font-medium">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Badge "Vérifié"</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Choisir Pro →
              </Link>
            </div>

            {/* Gratuit Plan */}
            <div className="animate-on-scroll group premium-card bg-white rounded-2xl p-4 sm:p-5 border-2 border-gray-200 hover:border-gray-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 opacity-0 relative overflow-visible order-2 sm:order-1">
              <div className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full blur-xl opacity-50 animate-float"></div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3 relative z-10">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center animate-float">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">GRATUIT</h3>
              </div>
              <div className="mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">0€</span>
                <span className="text-gray-500 text-xs ml-1">/ mois</span>
              </div>
              <ul className="text-left space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>1 projet actif</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>3 matchs IA / mois</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Messagerie intégrée</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                Commencer
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="animate-on-scroll group premium-card bg-white rounded-2xl p-4 sm:p-5 border-2 border-blue-200 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 opacity-0 relative overflow-visible order-3 sm:order-2">
              <div className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full blur-xl opacity-50 animate-float"></div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3 relative z-10">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center animate-float">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">STARTER</h3>
              </div>
              <div className="mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">19€</span>
                <span className="text-gray-500 text-xs ml-1">/ mois</span>
              </div>
              <ul className="text-left space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>5 projets actifs</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Matchs IA illimités</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Statistiques de base</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                Choisir Starter
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="animate-on-scroll group premium-card bg-white rounded-2xl p-4 sm:p-5 border-2 border-purple-200 hover:border-purple-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 opacity-0 relative overflow-visible order-4">
              <div className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full blur-xl opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3 relative z-10">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center animate-float" style={{ animationDelay: '0.7s' }}>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">PREMIUM</h3>
              </div>
              <div className="mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">99€</span>
                <span className="text-gray-500 text-xs ml-1">/ mois</span>
              </div>
              <ul className="text-left space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Support dédié 24/7</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Accès API complet</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gestionnaire dédié</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                Passer Premium
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link to="/pricing" className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
              Voir tous les détails
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Image Section 4: Digital Animation */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-on-scroll opacity-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Du concept <span className="text-gradient-primary">à la création finale</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                Animation 3D, design graphique, vidéo, photo... Quelle que soit votre vision créative, l'IA trouve le spécialiste qui transformera votre concept en réalité.
              </p>
              <p className="text-base sm:text-lg text-gray-500 mb-6">
                Des outils de suivi intégrés pour suivre l'avancement, valider les étapes et garantir que le résultat soit exactement ce que vous aviez en tête.
              </p>
              <Link
                to="/register"
                className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Démarrer mon projet →
              </Link>
            </div>
            <div className="parallax-container">
              <img
                src={digitalAnimation}
                alt="Écran montrant une animation 3D en cours de création"
                className="parallax-image rounded-2xl shadow-2xl w-full h-auto animate-on-scroll opacity-0 reveal-right"
                data-speed="0.12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="animate-on-scroll opacity-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Conçu par des créatifs, <span className="text-gradient-primary">pour des créatifs</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-3 sm:mb-4">
                JUNY est née d'un constat simple : trouver le bon professionnel créatif pour son
                projet peut être long, fastidieux et incertain.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-3 sm:mb-4">
                Nous avons développé une plateforme intelligente qui utilise l'IA pour comprendre
                précisément vos besoins et vous mettre en relation avec les professionnels les plus
                adaptés à votre projet.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Transparence totale</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Matching IA précis</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Profils vérifiés</span>
                </div>
              </div>
            </div>
            <div className="parallax-container animate-on-scroll opacity-0">
              <img
                src={teamWorking}
                alt="Équipe travaillant ensemble sur des projets créatifs"
                className="parallax-image rounded-2xl shadow-2xl w-full h-auto scale-in"
                data-speed="0.1"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 animate-on-scroll opacity-0">Contactez-nous</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 animate-on-scroll opacity-0">
              Une question? Une suggestion? Nous sommes là pour vous aider
            </p>
          </div>

          <div className="animate-on-scroll bg-white rounded-2xl shadow-2xl p-6 sm:p-10 opacity-0 border border-gray-100">
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="modern-input-group">
                  <input
                    type="text"
                    id="contact-name"
                    className="modern-input peer"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="contact-name" className="modern-label">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Nom complet
                  </label>
                </div>
                <div className="modern-input-group">
                  <input
                    type="email"
                    id="contact-email"
                    className="modern-input peer"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="contact-email" className="modern-label">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Adresse email
                  </label>
                </div>
              </div>

              <div className="modern-input-group">
                <input
                  type="text"
                  id="contact-subject"
                  className="modern-input peer"
                  placeholder=" "
                  required
                />
                <label htmlFor="contact-subject" className="modern-label">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Sujet de votre message
                </label>
              </div>

              <div className="modern-input-group">
                <textarea
                  id="contact-message"
                  rows={6}
                  className="modern-input peer resize-none"
                  placeholder=" "
                  required
                />
                <label htmlFor="contact-message" className="modern-label">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Votre message
                </label>
              </div>

              <button
                type="submit"
                className="modern-submit-button group"
              >
                <span className="flex items-center justify-center gap-2">
                  Envoyer le message
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-blue-600 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">contact@juny.fr</p>
                </div>

                <div>
                  <div className="text-blue-600 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Téléphone</p>
                  <p className="text-sm text-gray-600">+33 1 23 45 67 89</p>
                </div>

                <div>
                  <div className="text-blue-600 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Adresse</p>
                  <p className="text-sm text-gray-600">Paris, France</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-primary-600 py-12 sm:py-16 md:py-20 relative overflow-hidden">
        {/* Éléments flottants en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-10 left-1/4 w-36 h-36 bg-orange-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 animate-on-scroll opacity-0 animate-breathing">
            Votre meilleur projet commence maintenant
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-6 sm:mb-8 animate-on-scroll opacity-0">
            500+ créateurs trouvent leur match en 5 minutes sur JUNY.<br className="hidden sm:block" />
            À vous de jouer
          </p>
          <Link
            to="/register"
            className="animate-on-scroll shimmer-button inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-white/20 opacity-0"
          >
            <span className="relative z-10 bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">Trouver mon créatif maintenant →</span>
          </Link>
          <p className="text-sm text-white/80 mt-4 animate-on-scroll opacity-0">
            14 jours gratuits · Aucune carte requise · Annulation instantanée
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-stone-900 text-gray-300 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-white text-lg sm:text-xl font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">JUNY</h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                La plateforme qui connecte créateurs de contenu et professionnels créatifs grâce à l'IA.
              </p>
            </div>

            <div>
              <h4 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4">Produit</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">Comment ça marche</a></li>
                <li><a href="#pricing" className="hover:text-primary-400 transition-colors">Tarifs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4">Entreprise</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#about" className="hover:text-primary-400 transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4">Légal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2026 Creative Match. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import PublicNavbar from '../components/PublicNavbar';

const creativeProfessional = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop';

export default function ProfessionalLanding() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 animate-gradient">
      <PublicNavbar variant="purple" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative overflow-hidden">
        {/* Particules animées */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="particles-container"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="inline-block mb-4 fade-in-up-blur">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200">
              💼 Rejoignez 500+ professionnels créatifs
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight fade-in-up-blur animate-delay-100">
            Développez votre activité.<br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-600 bg-clip-text text-transparent">Trouvez vos clients idéaux.</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed fade-in-up-blur animate-delay-200">
            Graphistes, vidéastes, photographes, motion designers...<br className="hidden sm:block" />
            JUNY connecte votre talent avec les <span className="font-semibold text-gray-900">projets qui vous correspondent</span> vraiment 🎯
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up-blur animate-delay-300">
            <Link
              to="/register"
              className="shimmer-button px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 animate-pulse-glow relative overflow-hidden"
            >
              Créer mon profil gratuitement →
            </Link>
            <a
              href="#avantages"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-500 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Découvrir les avantages
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4 fade-in-up-blur animate-delay-400">
            Inscription gratuite · Aucun frais caché · Paiement sécurisé
          </p>
        </div>
      </section>

      {/* Avantages Section */}
      <section id="avantages" className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 animate-on-scroll opacity-0">
              Pourquoi rejoindre JUNY ?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 animate-on-scroll opacity-0">
              Des opportunités qualifiées, directement dans votre boîte mail
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Avantage 1 */}
            <div className="animate-on-scroll bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border border-purple-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 animate-float">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Projets qualifiés
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Notre IA analyse chaque demande et ne vous propose que les projets qui correspondent à votre expertise, votre style et vos disponibilités. Fini les briefs hors-sujet.
              </p>
            </div>

            {/* Avantage 2 */}
            <div className="animate-on-scroll bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border border-orange-100">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 animate-float" style={{animationDelay: '0.3s'}}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Tarifs transparents
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Vous fixez vos tarifs, vos conditions. Pas de négociations interminables. Les clients savent ce qu'ils paient, vous savez ce que vous gagnez. Simple et transparent.
              </p>
            </div>

            {/* Avantage 3 */}
            <div className="animate-on-scroll bg-gradient-to-br from-pink-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border border-pink-100">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 animate-float" style={{animationDelay: '0.6s'}}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Gagnez du temps
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Moins de temps perdu en prospection, plus de temps pour créer. Les clients viennent à vous avec des briefs clairs et des budgets définis. Concentrez-vous sur ce que vous faites de mieux.
              </p>
            </div>

            {/* Avantage 4 */}
            <div className="animate-on-scroll bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border border-blue-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 animate-float" style={{animationDelay: '0.2s'}}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Portfolio valorisé
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Votre travail mérite d'être vu. JUNY met en avant votre portfolio auprès de clients qui cherchent exactement votre style. Votre créativité devient votre meilleur commercial.
              </p>
            </div>

            {/* Avantage 5 */}
            <div className="animate-on-scroll bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border border-yellow-100">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 animate-float" style={{animationDelay: '0.5s'}}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Réseau professionnel
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Rejoignez une communauté de créatifs talentueux. Partagez vos expériences, collaborez sur des projets d'envergure, et construisez des relations professionnelles durables.
              </p>
            </div>

            {/* Avantage 6 */}
            <div className="animate-on-scroll bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 border border-green-100">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 animate-float" style={{animationDelay: '0.8s'}}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Paiement sécurisé
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Vos revenus sont protégés. Le paiement est bloqué avant le début du projet et libéré dès validation. Plus de factures impayées, plus de relances. Travaillez sereinement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section: Professional at Work */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-br from-purple-50 to-orange-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-on-scroll opacity-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Votre talent mérite <span className="text-gradient-primary">d'être reconnu</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                Chaque créatif a son style unique, sa vision, son expertise. JUNY met en lumière ce qui vous rend exceptionnel et vous connecte avec des clients qui apprécient vraiment votre travail.
              </p>
              <p className="text-base sm:text-lg text-gray-500">
                Plus de sous-évaluation. Plus de compromis. Juste des collaborations où votre talent est reconnu à sa juste valeur.
              </p>
            </div>
            <div className="parallax-container">
              <img
                src={creativeProfessional}
                alt="Professionnel créatif au travail"
                className="rounded-2xl shadow-2xl w-full h-auto animate-on-scroll opacity-0 reveal-right"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 animate-on-scroll opacity-0">
              Comment ça marche ?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 animate-on-scroll opacity-0">
              En 3 étapes simples, commencez à recevoir des projets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
            {/* Étape 1 */}
            <div className="animate-on-scroll text-center opacity-0">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Créez votre profil
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Présentez votre expertise, vos compétences, votre portfolio. Plus votre profil est complet, meilleures sont vos opportunités. L'IA analyse votre style pour vous matcher parfaitement.
              </p>
            </div>

            {/* Étape 2 */}
            <div className="animate-on-scroll text-center opacity-0">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Recevez des offres
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                L'IA vous envoie uniquement les projets qui matchent avec votre profil. Brief clair, budget défini, deadline réaliste. Vous choisissez les projets qui vous inspirent vraiment.
              </p>
            </div>

            {/* Étape 3 */}
            <div className="animate-on-scroll text-center opacity-0">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Créez et facturez
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Collaborez directement avec le client, livrez votre travail, et recevez votre paiement sécurisé. JUNY gère l'administratif, vous vous concentrez sur la création.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages fictifs */}
      <section className="bg-gradient-to-br from-purple-50 to-orange-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 animate-on-scroll opacity-0">
              Ils nous font confiance
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 animate-on-scroll opacity-0">
              Des professionnels créatifs partagent leur expérience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Témoignage 1 */}
            <div className="animate-on-scroll bg-white rounded-2xl p-6 sm:p-8 shadow-lg opacity-0">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  SL
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Sophie Laurent</h4>
                  <p className="text-sm text-gray-600">Motion Designer</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "JUNY m'a permis de trouver des clients qui comprennent vraiment la valeur de mon travail. Plus de négociations épuisantes, juste des projets stimulants avec des budgets corrects."
              </p>
            </div>

            {/* Témoignage 2 */}
            <div className="animate-on-scroll bg-white rounded-2xl p-6 sm:p-8 shadow-lg opacity-0">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  MD
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Marc Dubois</h4>
                  <p className="text-sm text-gray-600">Graphiste freelance</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "En 3 mois, j'ai doublé mon chiffre d'affaires grâce à JUNY. Les projets sont qualifiés, les clients sont sérieux, et je passe moins de temps en prospection. Un vrai game changer !"
              </p>
            </div>

            {/* Témoignage 3 */}
            <div className="animate-on-scroll bg-white rounded-2xl p-6 sm:p-8 shadow-lg opacity-0">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  EM
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Emma Martin</h4>
                  <p className="text-sm text-gray-600">Photographe professionnelle</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "La plateforme est intuitive, le matching est précis, et je ne reçois que des offres qui correspondent à mon style. JUNY comprend vraiment les besoins des créatifs freelance."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-600 to-orange-600 py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-20 right-20 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-10 left-1/4 w-36 h-36 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 animate-on-scroll opacity-0 animate-breathing">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-6 sm:mb-8 animate-on-scroll opacity-0">
            Rejoignez JUNY gratuitement et commencez à recevoir des projets dès aujourd'hui.<br className="hidden sm:block" />
            Votre prochain client vous attend 🚀
          </p>
          <Link
            to="/register"
            className="animate-on-scroll shimmer-button inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-white/20 opacity-0"
          >
            <span className="relative z-10 bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">Créer mon profil maintenant →</span>
          </Link>
          <p className="text-sm text-white/80 mt-4 animate-on-scroll opacity-0">
            Gratuit · Sans engagement · 2 minutes pour s'inscrire
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-stone-900 text-gray-300 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4 logo-gradient">JUNY</h3>
              <p className="text-sm">La plateforme qui connecte créateurs et professionnels créatifs.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#solutions" className="hover:text-purple-400 transition-colors">Matching IA</a></li>
                <li><a href="/#how-it-works" className="hover:text-purple-400 transition-colors">Brainstorming</a></li>
                <li><a href="/professionnels" className="hover:text-purple-400 transition-colors">Pour les pros</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#about" className="hover:text-purple-400 transition-colors">À propos</a></li>
                <li><a href="/#contact" className="hover:text-purple-400 transition-colors">Contact</a></li>
                <li><a href="/#pricing" className="hover:text-purple-400 transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Suivez-nous</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2026 JUNY. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

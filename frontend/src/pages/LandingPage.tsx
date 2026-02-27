import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { subscriptionApi } from '../services/api';
import PublicNavbar from '../components/PublicNavbar';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

type Plan = { id: string; name: string; priceMonthly: string; priceYearly: string | null; maxProjectsMonth: number; aiCreditsMonth: number; features: { list: string[] } | null };

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-7 py-5 text-left gap-4"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-7 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  useDocumentMeta({
    title: 'Trouvez le créatif parfait pour votre projet',
    description: 'JUNY connecte les créateurs d\'entreprise avec les meilleurs professionnels créatifs grâce à l\'IA. Brainstorming, matching intelligent, collaboration.',
    url: '/',
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [statsPct, setStatsPct] = useState(0);
  const [statsMatchs, setStatsMatchs] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsStartedRef = useRef(false);

  useEffect(() => {
    subscriptionApi.getPlans().then(r => { if (r.success) setPlans(r.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsStartedRef.current) {
        statsStartedRef.current = true;
        let pct = 0;
        const iv = setInterval(() => {
          pct = Math.min(pct + 3, 97);
          setStatsPct(pct);
          if (pct >= 97) clearInterval(iv);
        }, 18);
        setTimeout(() => setStatsMatchs(1), 300);
        setTimeout(() => setStatsMatchs(2), 700);
        setTimeout(() => setStatsMatchs(3), 1000);
      }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('fade-in-up');
        } else {
          entry.target.classList.add('opacity-0');
          entry.target.classList.remove('fade-in-up');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar variant="primary" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 -mt-24 pt-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-end">

            {/* Left – copy */}
            <div className="pb-16 lg:pb-24">
              <div className="inline-block mb-5 fade-in-up-blur">
                <span className="px-4 py-2 bg-white text-primary-700 rounded-full text-sm font-semibold border border-primary-200 flex items-center gap-2 shadow-sm w-fit">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Matching IA · Résultats en 30 secondes
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight fade-in-up-blur animate-delay-100">
                Le créatif parfait<br />
                <span className="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  pour votre projet.
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed fade-in-up-blur animate-delay-200">
                Décrivez votre projet, notre IA analyse des milliers de profils et vous propose{' '}
                <strong className="text-gray-900">vos 3 matchs idéaux</strong> en 5 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 fade-in-up-blur animate-delay-300">
                <Link
                  to="/register"
                  className="shimmer-button px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden text-center"
                >
                  Trouver mon créatif →
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg transition-all duration-200 hover:border-gray-300 text-center"
                >
                  Comment ça marche
                </a>
              </div>

              <p className="text-sm text-gray-400 mt-4 fade-in-up-blur animate-delay-400">
                Gratuit · Sans carte bancaire · Annulation à tout moment
              </p>
            </div>

            {/* Right – App mockup */}
            <div className="relative fade-in-up-blur animate-delay-200 self-end">
              {/* Browser chrome */}
              <div className="bg-white rounded-t-2xl shadow-2xl overflow-hidden border border-gray-200 border-b-0">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-100">
                    app.juny.fr/brainstorming
                  </div>
                </div>

                {/* Chat + matches */}
                <div className="p-5 bg-gray-50/40">
                  {/* User message */}
                  <div className="flex justify-end mb-4">
                    <div className="max-w-xs bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm">
                      J'ai besoin d'un logo minimaliste pour ma marque de cosmétiques. Budget 1&nbsp;500€, deadline dans 3 semaines.
                    </div>
                  </div>

                  {/* IA message */}
                  <div className="flex gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm">
                      IA
                    </div>
                    <div className="max-w-xs bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 shadow-sm border border-gray-100">
                      Parfait&nbsp;! J'ai analysé votre brief. Voici vos <strong>3 matchs idéaux</strong> parmi nos créatifs vérifiés 🎯
                    </div>
                  </div>

                  {/* Match cards */}
                  <div className="space-y-2.5">
                    {[
                      { initials: 'MD', name: 'Marie D.', role: 'Direction artistique · 8 ans', score: 94, color: 'from-pink-400 to-pink-600', active: true },
                      { initials: 'LM', name: 'Lucas M.', role: 'Branding · Illustration · 5 ans', score: 88, color: 'from-blue-400 to-blue-600', active: false },
                      { initials: 'SC', name: 'Sophie C.', role: 'Design graphique · 6 ans', score: 82, color: 'from-purple-400 to-purple-600', active: false },
                    ].map((match) => (
                      <div
                        key={match.initials}
                        className={`bg-white rounded-xl p-3.5 border shadow-sm flex items-center gap-3 transition-colors ${
                          match.active ? 'border-primary-200 ring-1 ring-primary-100' : 'border-gray-100'
                        } ${!match.active ? 'opacity-70' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${match.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {match.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{match.name}</p>
                          <p className="text-xs text-gray-500">{match.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={`text-sm font-bold ${match.active ? 'text-primary-600' : 'text-gray-500'}`}>{match.score}%</div>
                            <div className="text-xs text-gray-400">match</div>
                          </div>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${match.active ? 'bg-primary-50' : 'bg-gray-50'}`}>
                            <svg className={`w-4 h-4 ${match.active ? 'text-primary-500' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification badge */}
              <div className="absolute -right-3 top-28 bg-white rounded-xl shadow-xl p-3 border border-gray-100 hidden lg:flex items-center gap-2.5">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 whitespace-nowrap">Marie accepte votre projet</p>
                  <p className="text-xs text-gray-400">Il y a 2 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature pills ──────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-5 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start md:justify-center gap-3 flex-nowrap md:flex-wrap min-w-max md:min-w-0">
            {[
              { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'Matching IA', color: 'text-primary-600 bg-primary-50 border-primary-200' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Créatifs vérifiés', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Messagerie intégrée', color: 'text-blue-600 bg-blue-50 border-blue-200' },
              { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', label: 'Suivi de mission', color: 'text-purple-600 bg-purple-50 border-purple-200' },
              { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', label: 'Sans commission', color: 'text-amber-600 bg-amber-50 border-amber-200' },
            ].map((pill) => (
              <span
                key={pill.label}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border ${pill.color} whitespace-nowrap flex-shrink-0`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pill.icon} />
                </svg>
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="solutions" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-on-scroll opacity-0">
              Fini les prises de tête
            </h2>
            <p className="text-xl text-gray-500 animate-on-scroll opacity-0">
              Le bon créatif, au bon moment, pour le bon projet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                bg: 'from-orange-50 to-orange-100',
                border: 'border-orange-200 hover:border-primary-400',
                icon: 'from-primary-500 to-primary-600',
                iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                hoverText: 'hover:text-primary-600',
                title: '5 min au lieu de 3 semaines',
                body: 'Plus besoin de passer des heures à comparer des portfolios. L\'IA fait le tri et vous propose uniquement les profils qui matchent avec votre vision.',
              },
              {
                bg: 'from-blue-50 to-blue-100',
                border: 'border-blue-200 hover:border-blue-500',
                icon: 'from-blue-500 to-blue-600',
                iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                hoverText: 'hover:text-blue-600',
                title: 'Le style ET le budget',
                body: 'Vous aimez son travail mais il est trop cher ? Oubliez ça. On trouve uniquement des créatifs qui ont le bon style ET qui rentrent dans votre budget.',
              },
              {
                bg: 'from-purple-50 to-purple-100',
                border: 'border-purple-200 hover:border-purple-500',
                icon: 'from-purple-500 to-purple-600',
                iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                hoverText: 'hover:text-purple-600',
                title: 'Disponible maintenant',
                body: 'Besoin d\'un graphiste pour la semaine prochaine ? On vous propose uniquement des créatifs disponibles quand vous en avez besoin.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`animate-on-scroll group p-8 bg-gradient-to-br ${card.bg} rounded-2xl border-2 ${card.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-2 opacity-0`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${card.icon} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.iconPath} />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold text-gray-900 mb-3 ${card.hoverText} transition-colors`}>{card.title}</h3>
                <p className="text-gray-700 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Creative carousel ─────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white overflow-hidden">
        <style>{`
          @keyframes scrollRight {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @keyframes scrollLeft {
            from { transform: translateX(-50%); }
            to   { transform: translateX(0); }
          }
          .carousel-scroll-right { animation: scrollRight 45s linear infinite; }
          .carousel-scroll-left  { animation: scrollLeft  38s linear infinite; }
          .carousel-scroll-right:hover,
          .carousel-scroll-left:hover { animation-play-state: paused; }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 animate-on-scroll opacity-0">
            Tous vos projets créatifs
          </h2>
          <p className="text-lg text-gray-500 animate-on-scroll opacity-0">
            Branding, photo, 3D, motion, illustration… trouvez le spécialiste idéal.
          </p>
        </div>

        {/* Row 1 – scroll → */}
        <div className="overflow-hidden mb-4">
          <div className="flex gap-4 w-max carousel-scroll-right">
            {([
              { label: 'Branding & Identité', color: 'from-orange-400 to-pink-500', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
              { label: 'Photographie', color: 'from-blue-400 to-cyan-500', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
              { label: 'UI/UX Design', color: 'from-violet-400 to-purple-500', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { label: 'Illustration', color: 'from-emerald-400 to-teal-500', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
              { label: '3D & CGI', color: 'from-indigo-400 to-blue-600', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { label: 'Motion Design', color: 'from-rose-400 to-red-500', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
              { label: 'Design graphique', color: 'from-amber-400 to-orange-500', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
              { label: 'Packaging', color: 'from-pink-400 to-rose-500', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
              // duplicate for seamless loop
              { label: 'Branding & Identité', color: 'from-orange-400 to-pink-500', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
              { label: 'Photographie', color: 'from-blue-400 to-cyan-500', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
              { label: 'UI/UX Design', color: 'from-violet-400 to-purple-500', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { label: 'Illustration', color: 'from-emerald-400 to-teal-500', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
              { label: '3D & CGI', color: 'from-indigo-400 to-blue-600', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { label: 'Motion Design', color: 'from-rose-400 to-red-500', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
              { label: 'Design graphique', color: 'from-amber-400 to-orange-500', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
              { label: 'Packaging', color: 'from-pink-400 to-rose-500', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
            ] as { label: string; color: string; icon: string }[]).map((item, i) => (
              <div key={i} className={`w-52 h-40 rounded-2xl flex-shrink-0 group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${item.color} flex flex-col items-center justify-center gap-3 p-4 cursor-default relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <span className="text-white font-bold text-sm text-center leading-tight relative">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 – scroll ← */}
        <div className="overflow-hidden">
          <div className="flex gap-4 w-max carousel-scroll-left">
            {([
              { label: 'Social Media', color: 'from-sky-400 to-blue-500', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
              { label: 'Direction artistique', color: 'from-purple-400 to-violet-500', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
              { label: 'Web Design', color: 'from-teal-400 to-emerald-500', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
              { label: 'Vidéo & Film', color: 'from-red-400 to-rose-500', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
              { label: 'Typographie', color: 'from-slate-500 to-gray-600', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { label: "Architecture d'intérieur", color: 'from-stone-400 to-neutral-600', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { label: 'Mode & Fashion', color: 'from-fuchsia-400 to-pink-500', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
              { label: 'Retouche photo', color: 'from-cyan-400 to-sky-500', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
              // duplicate for seamless loop
              { label: 'Social Media', color: 'from-sky-400 to-blue-500', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
              { label: 'Direction artistique', color: 'from-purple-400 to-violet-500', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
              { label: 'Web Design', color: 'from-teal-400 to-emerald-500', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
              { label: 'Vidéo & Film', color: 'from-red-400 to-rose-500', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
              { label: 'Typographie', color: 'from-slate-500 to-gray-600', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { label: "Architecture d'intérieur", color: 'from-stone-400 to-neutral-600', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { label: 'Mode & Fashion', color: 'from-fuchsia-400 to-pink-500', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
              { label: 'Retouche photo', color: 'from-cyan-400 to-sky-500', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
            ] as { label: string; color: string; icon: string }[]).map((item, i) => (
              <div key={i} className={`w-52 h-40 rounded-2xl flex-shrink-0 group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${item.color} flex flex-col items-center justify-center gap-3 p-4 cursor-default relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <span className="text-white font-bold text-sm text-center leading-tight relative">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section id="how-it-works" className="bg-gray-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-on-scroll opacity-0">
              Vraiment simple
            </h2>
            <p className="text-xl text-gray-500 animate-on-scroll opacity-0">
              3 étapes · 5 minutes · 0 prise de tête
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                n: '1',
                color: 'from-blue-500 to-blue-600',
                title: 'Racontez votre vision',
                body: '"J\'ai besoin d\'un logo minimaliste pour ma marque de cosmétiques, budget 1500€, deadline dans 2 semaines." L\'IA comprend tout, même en langage naturel.',
              },
              {
                n: '2',
                color: 'from-primary-500 to-primary-600',
                title: 'Découvrez vos 3 matchs',
                body: 'En 30 secondes, vous avez 3 profils parfaits : portfolios, tarifs, disponibilité. Plus de tri, plus de comparaison. Juste les bons.',
              },
              {
                n: '3',
                color: 'from-purple-500 to-purple-600',
                title: 'Lancez votre projet',
                body: 'Un clic pour contacter. Vous discutez directement avec le créatif, validez le brief, et c\'est parti.',
              },
            ].map((step) => (
              <div key={step.n} className="text-center animate-on-scroll opacity-0">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300`}>
                  {step.n}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-on-scroll opacity-0">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Essayer gratuitement
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comparatif avant/après ─────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-on-scroll opacity-0">
              La différence JUNY
            </h2>
            <p className="text-xl text-gray-500 animate-on-scroll opacity-0">
              Ce que ça change concrètement pour votre prochain projet
            </p>
          </div>

          <div className="relative grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl animate-on-scroll opacity-0">
            {/* Colonne gauche — Sans JUNY */}
            <div className="bg-slate-900 p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">Sans JUNY</span>
              </div>
              <ul className="space-y-5">
                {[
                  { stat: '2–3 semaines', label: 'pour trouver un prestataire' },
                  { stat: '68%', label: 'des freelances ne répondent pas' },
                  { stat: '1 sur 3', label: 'des devis dépasse le budget initial' },
                  { stat: '4,2 h', label: 'passées à comparer des portfolios' },
                  { stat: '0 filtre', label: 'sur la disponibilité réelle' },
                ].map(({ stat, label }) => (
                  <li key={stat} className="flex items-start gap-4">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-slate-300">
                      <strong className="text-white">{stat}</strong> {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Badge VS centré */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex w-12 h-12 rounded-full bg-white shadow-xl items-center justify-center">
              <span className="text-xs font-black text-gray-500">VS</span>
            </div>

            {/* Colonne droite — Avec JUNY */}
            <div className="bg-gradient-to-br from-primary-500 to-orange-500 p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">Avec JUNY</span>
              </div>
              <ul className="space-y-5">
                {[
                  { stat: '5 minutes', label: 'pour obtenir 3 matchs qualifiés' },
                  { stat: '100%', label: 'des profils ont répondu dans les 24h' },
                  { stat: 'Budget fixé', label: 'avant le premier contact' },
                  { stat: 'Brief IA', label: 'votre projet structuré automatiquement' },
                  { stat: 'Disponibilité', label: 'vérifiée en temps réel' },
                ].map(({ stat, label }) => (
                  <li key={stat} className="flex items-start gap-4">
                    <svg className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-orange-50">
                      <strong className="text-white">{stat}</strong> — {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Barre de chiffres */}
          <div ref={statsRef} className="mt-12 grid grid-cols-3 gap-4 animate-on-scroll opacity-0">
            {[
              { value: `−${statsPct}%`, label: 'de temps de recherche' },
              { value: `${statsMatchs} match${statsMatchs !== 1 ? 's' : ''}`, label: 'en moins de 5 minutes' },
              { value: '0€', label: 'de commission sur vos projets' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-3xl font-black text-gray-900 mb-1 tabular-nums">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dual CTA ───────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll opacity-0">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">JUNY, c'est pour vous</h2>
            <p className="text-xl text-gray-500">Que vous cherchiez un créatif ou que vous soyez créatif</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="animate-on-scroll opacity-0 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8 border-2 border-orange-100 hover:border-primary-300 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-pink-500 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vous êtes une entreprise</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Décrivez votre projet, l'IA trouve les créatifs parfaits. Gagnez des semaines de recherche et concentrez-vous sur ce qui compte vraiment.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Trouver un créatif
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            <div className="animate-on-scroll opacity-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-100 hover:border-purple-400 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vous êtes un créatif</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Créez votre profil, les missions viennent à vous. Accédez à des clients sérieux avec un brief clair et un budget défini. Zéro démarchage.
              </p>
              <Link
                to="/professionnels"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Rejoindre en tant que pro
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-24 bg-gray-50">
        <style>{`
          @keyframes pricingFloat {
            0%, 100% { transform: translateY(0px);   box-shadow: 0 10px 25px -5px rgba(0,0,0,.10), 0 4px 10px -5px rgba(0,0,0,.06); }
            50%       { transform: translateY(-10px); box-shadow: 0 22px 40px -5px rgba(0,0,0,.14), 0 8px 18px -5px rgba(0,0,0,.08); }
          }
          @keyframes pricingFloatPro {
            0%, 100% { transform: translateY(0px);   box-shadow: 0 10px 30px -5px rgba(249,115,22,.25), 0 4px 12px -5px rgba(249,115,22,.15); }
            50%       { transform: translateY(-14px); box-shadow: 0 26px 50px -5px rgba(249,115,22,.35), 0 10px 20px -5px rgba(249,115,22,.20); }
          }
          .price-float     { animation: pricingFloat    4s ease-in-out infinite; }
          .price-float-pro { animation: pricingFloatPro 4s ease-in-out infinite; }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Tarifs</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4 animate-on-scroll opacity-0">
              Des tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-500 animate-on-scroll opacity-0">
              Démarrez gratuitement · Pas de frais cachés · Annulation à tout moment
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow border border-gray-200 mt-6">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' : 'text-gray-600 hover:text-primary-600'}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' : 'text-gray-600 hover:text-primary-600'}`}
              >
                Annuel
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Plan gratuit */}
            <div className="price-float bg-white rounded-3xl p-10 border-2 border-gray-200 flex flex-col" style={{ animationDelay: '0s' }}>
              <div className="mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Gratuit</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-6xl font-bold text-gray-900">0€</span>
                  <span className="text-gray-400">/mois</span>
                </div>
                <p className="text-gray-500 mt-3">Pour découvrir la plateforme</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['3 projets par mois', '50 crédits IA', 'Matching intelligent', 'Messagerie intégrée', 'Support email'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-gray-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-colors">
                Commencer gratuitement
              </Link>
            </div>

            {/* Plans dynamiques */}
            {plans.map((plan, idx) => {
              const isPro = plan.name.toLowerCase() === 'pro';
              const price = billingCycle === 'yearly' && plan.priceYearly
                ? parseFloat(plan.priceYearly)
                : parseFloat(plan.priceMonthly);
              const colorMap: Record<string, { border: string; btn: string; label: string }> = {
                starter: { border: 'border-blue-200', btn: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700', label: 'text-blue-600' },
                pro:     { border: 'border-primary-400', btn: 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700', label: 'text-primary-600' },
                premium: { border: 'border-purple-200', btn: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700', label: 'text-purple-600' },
              };
              const c = colorMap[plan.name.toLowerCase()] ?? { border: 'border-gray-200', btn: 'from-gray-500 to-gray-600', label: 'text-gray-600' };

              return (
                <div
                  key={plan.id}
                  className={`${isPro ? 'price-float-pro' : 'price-float'} bg-white rounded-3xl p-10 border-2 ${c.border} flex flex-col relative ${isPro ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                  style={{ animationDelay: `${(idx + 1) * 0.4}s` }}
                >
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow whitespace-nowrap">
                        RECOMMANDÉ
                      </span>
                    </div>
                  )}
                  <div className="mb-8">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${c.label}`}>{plan.name}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-6xl font-bold text-gray-900">{price}€</span>
                      <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                    </div>
                    <p className="text-gray-500 mt-3">{plan.maxProjectsMonth} projets · {plan.aiCreditsMonth} crédits IA</p>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {(plan.features?.list ?? []).slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-600">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/pricing"
                    className={`block text-center px-4 py-4 bg-gradient-to-r ${c.btn} text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg`}
                  >
                    Choisir {plan.name}
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-8">
            <Link to="/pricing" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
              Voir le détail complet des offres →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-on-scroll opacity-0">Questions fréquentes</h2>
            <p className="text-xl text-gray-500 animate-on-scroll opacity-0">Tout ce que vous voulez savoir avant de commencer</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Est-ce vraiment gratuit pour commencer ?",
                a: "Oui. Le plan gratuit vous donne accès à 3 projets par mois, 50 crédits IA et le matching intelligent — sans carte bancaire requise. Vous passez à un plan payant uniquement si vous avez besoin de plus.",
              },
              {
                q: "Comment l'IA sélectionne-t-elle les créatifs ?",
                a: "L'IA analyse votre brief (style, budget, deadline, secteur) et le compare aux profils de notre réseau selon leurs portfolios, tarifs et disponibilités. Elle ne propose que des profils compatibles sur ces 3 critères simultanément.",
              },
              {
                q: "Les créatifs sont-ils vérifiés ?",
                a: "Chaque professionnel passe par une validation manuelle : portfolio, identité et expérience sont vérifiés avant l'accès à la plateforme. Vous ne verrez jamais un profil incomplet ou sans références.",
              },
              {
                q: "JUNY prend-il une commission sur les projets ?",
                a: "Non. JUNY fonctionne sur abonnement mensuel ou annuel. Une fois en contact avec un créatif, vous négociez directement avec lui — zéro commission, zéro intermédiaire sur le paiement.",
              },
              {
                q: "Puis-je annuler mon abonnement à tout moment ?",
                a: "Oui, sans frais ni engagement. Vous pouvez annuler depuis votre espace personnel en un clic. Votre accès reste actif jusqu'à la fin de la période déjà payée.",
              },
              {
                q: "Et si aucun des 3 matchs ne me convient ?",
                a: "Vous pouvez relancer une session de matching en affinant votre brief avec l'IA. Les crédits utilisés pour un matching non concluant sont remboursés sur votre compte.",
              },
            ].map(({ q, a }, i) => (
              <FaqItem key={i} question={q} answer={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-primary-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 left-1/4 w-36 h-36 bg-orange-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-on-scroll opacity-0">
            Votre meilleur projet commence maintenant
          </h2>
          <p className="text-xl text-white/90 mb-8 animate-on-scroll opacity-0">
            Décrivez votre projet, l'IA fait le reste.<br className="hidden sm:block" />
            Vos 3 matchs parfaits en 5 minutes.
          </p>
          <Link
            to="/register"
            className="animate-on-scroll shimmer-button inline-block px-10 py-4 bg-white hover:bg-gray-50 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-2xl opacity-0"
          >
            <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
              Trouver mon créatif →
            </span>
          </Link>
          <p className="text-sm text-white/70 mt-4 animate-on-scroll opacity-0">
            Gratuit · Aucune carte requise · Annulation instantanée
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gradient-to-br from-gray-900 to-stone-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="JUNY" style={{ height: '28px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                <span className="text-xl font-bold text-white">JUNY</span>
              </Link>
              <p className="text-sm leading-relaxed mb-5">
                La plateforme qui connecte les entreprises avec les meilleurs créatifs grâce à l'IA.
              </p>
              {/* Réseaux sociaux */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/juny.ia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#solutions" className="hover:text-primary-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">Comment ça marche</a></li>
                <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Tarifs</Link></li>
                <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Rejoindre</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">Créer un compte</Link></li>
                <li><Link to="/professionnels" className="hover:text-primary-400 transition-colors">Espace créatifs</Link></li>
                <li><Link to="/login" className="hover:text-primary-400 transition-colors">Se connecter</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-primary-400 transition-colors">À propos</Link></li>
                <li><Link to="/help" className="hover:text-primary-400 transition-colors">Aide</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; 2026 JUNY. Tous droits réservés.</p>
            <p>Made with ♥ in Paris</p>
          </div>
        </div>
      </footer>

      {/* ── Sticky CTA mobile ──────────────────────────────────── */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${showStickyCTA ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-2xl">
          <Link
            to="/register"
            className="block text-center px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-base"
          >
            Commencer gratuitement →
          </Link>
        </div>
      </div>
    </div>
  );
}

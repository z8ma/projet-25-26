import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const FAQS = [
  {
    q: 'Comment fonctionne le matching IA ?',
    a: 'Vous décrivez votre projet en langage naturel (budget, style, deadline, type de mission). Notre IA analyse votre brief et le compare aux profils de nos créatifs vérifiés pour vous proposer les 3 meilleures correspondances en moins de 30 secondes.',
  },
  {
    q: 'Est-ce gratuit ?',
    a: 'Oui, le plan Gratuit vous donne accès à 1 projet actif et 3 matchs IA par mois. Des plans payants sont disponibles pour aller plus loin (projets illimités, matchs illimités, statistiques avancées).',
  },
  {
    q: 'Comment les créatifs sont-ils vérifiés ?',
    a: 'Chaque créatif soumet un portfolio et passe par une vérification manuelle de notre équipe avant d\'être visible sur la plateforme. Nous vérifions la cohérence du portfolio, les tarifs affichés et les disponibilités.',
  },
  {
    q: 'Puis-je contacter un créatif directement ?',
    a: 'Oui. Dès qu\'un match est généré, vous pouvez contacter le créatif via la messagerie intégrée JUNY. Pas d\'intermédiaire, pas de commission sur la transaction.',
  },
  {
    q: 'Je suis un créatif, comment rejoindre JUNY ?',
    a: 'Rendez-vous sur la page Professionnels et créez votre compte. Vous complétez votre profil (portfolio, tarifs, disponibilités, compétences) et notre équipe valide votre inscription sous 48h.',
  },
  {
    q: 'Comment annuler mon abonnement ?',
    a: 'Depuis vos paramètres de compte, section Abonnement. L\'annulation prend effet à la fin de la période en cours. Aucun engagement, aucune pénalité.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-primary-600 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-base">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-5 text-gray-600 leading-relaxed text-sm sm:text-base">{a}</p>
      )}
    </div>
  );
}

export default function Help() {
  useDocumentTitle('Centre d\'aide | JUNY');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar variant="primary" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-10">
          <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Centre d'aide</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Questions fréquentes</h1>
          <p className="text-xl text-gray-500">Tout ce que vous devez savoir sur JUNY.</p>
        </div>

        <div className="bg-white divide-y divide-gray-100">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border border-orange-100 text-center">
          <p className="font-semibold text-gray-900 mb-1">Vous n'avez pas trouvé votre réponse ?</p>
          <p className="text-sm text-gray-500 mb-4">Notre équipe répond sous 24h les jours ouvrés.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
          >
            Contacter le support
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

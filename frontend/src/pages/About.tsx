import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function About() {
  useDocumentTitle('À propos | JUNY');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar variant="primary" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Header */}
        <div className="mb-12">
          <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">À propos</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Connecter les talents,<br />
            <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">libérer la créativité</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            JUNY est né d'un constat simple : trouver le bon professionnel créatif pour son projet est trop long, trop incertain, trop épuisant.
          </p>
        </div>

        {/* Mission */}
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6 mb-12">
          <p>
            Nous avons développé une plateforme qui utilise l'intelligence artificielle pour comprendre précisément vos besoins — pas juste des mots-clés, mais votre vision, votre budget, vos contraintes — et vous mettre en relation avec les professionnels créatifs les plus adaptés.
          </p>
          <p>
            Du côté des créatifs, JUNY leur permet de recevoir des missions qualifiées, avec des briefs clairs et des clients qui savent ce qu'ils veulent. Fini le démarchage à froid et les prospects sans suite.
          </p>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {[
            { title: 'Transparence', desc: 'Tarifs affichés, disponibilité réelle, profils vérifiés. Pas de mauvaise surprise.', color: 'bg-orange-50 border-orange-100', text: 'text-primary-600' },
            { title: 'Précision', desc: "L'IA analyse des dizaines de critères pour un matching vraiment pertinent, pas un simple filtre.", color: 'bg-purple-50 border-purple-100', text: 'text-purple-600' },
            { title: 'Simplicité', desc: '5 minutes pour trouver votre match. Pas de formulaires interminables.', color: 'bg-blue-50 border-blue-100', text: 'text-blue-600' },
          ].map((v) => (
            <div key={v.title} className={`p-5 rounded-2xl border ${v.color}`}>
              <h3 className={`font-bold text-lg mb-2 ${v.text}`}>{v.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 text-gray-500 text-sm mb-10 p-4 bg-gray-50 rounded-xl">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Basé à <strong className="text-gray-700">Paris, France</strong> · Made with ♥</span>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
          >
            Commencer gratuitement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}

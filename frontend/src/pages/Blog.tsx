import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Blog() {
  useDocumentTitle('Blog | JUNY');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar variant="primary" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>

        <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Blog</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Bientôt disponible</h1>
        <p className="text-xl text-gray-500 mb-8 max-w-lg mx-auto">
          Des articles sur le monde créatif, l'IA appliquée au recrutement, et les bonnes pratiques pour vos projets.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
          >
            Retour à l'accueil
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}

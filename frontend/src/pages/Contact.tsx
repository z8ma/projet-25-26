import PublicNavbar from '../components/PublicNavbar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Contact() {
  useDocumentTitle('Contact | JUNY');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar variant="primary" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-10">
          <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Contact</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-4">On est là</h1>
          <p className="text-xl text-gray-500">Une question, un partenariat, un retour ? Écrivez-nous.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
              label: 'Email général',
              value: 'contact@juny.fr',
              href: 'mailto:contact@juny.fr',
              color: 'text-primary-600 bg-primary-50',
            },
            {
              icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
              label: 'Support',
              value: 'support@juny.fr',
              href: 'mailto:support@juny.fr',
              color: 'text-blue-600 bg-blue-50',
            },
            {
              icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
              label: 'Partenariats',
              value: 'partners@juny.fr',
              href: 'mailto:partners@juny.fr',
              color: 'text-purple-600 bg-purple-50',
            },
            {
              icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
              label: 'Adresse',
              value: 'Paris, France',
              href: null,
              color: 'text-emerald-600 bg-emerald-50',
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-gray-900 font-semibold hover:text-primary-600 transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-gray-900 font-semibold">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-400 mt-8 text-center">
          Réponse généralement sous 24h les jours ouvrés.
        </p>
      </div>
    </div>
  );
}

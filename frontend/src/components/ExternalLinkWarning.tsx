import { useState } from 'react';
import { createPortal } from 'react-dom';

interface ExternalLinkWarningProps {
  url: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that shows a warning before navigating to external links
 */
export default function ExternalLinkWarning({
  url,
  children,
  className = '',
}: ExternalLinkWarningProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleConfirm = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  // Extract domain for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <>
      <a
        href={url}
        onClick={handleClick}
        className={className}
        rel="noopener noreferrer"
      >
        {children}
      </a>

      {/* Warning Modal - rendered via portal to avoid transform parent issues */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Vous quittez JUNY
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-4">
              Vous allez visiter un site externe. JUNY n'est pas responsable du
              contenu de ce site.
            </p>

            {/* URL Display */}
            <div className="bg-gray-100 rounded-xl p-3 mb-6">
              <p className="text-xs text-gray-500 mb-1">Destination :</p>
              <p className="text-sm font-medium text-gray-800 break-all">
                {getDomain(url)}
              </p>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Conseils de sécurité
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Vérifiez que l'URL est correcte</li>
                <li>• Ne saisissez pas vos identifiants JUNY sur des sites externes</li>
                <li>• En cas de doute, fermez la fenêtre</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Continuer</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

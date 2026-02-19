import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [message, setMessage] = useState('');

  // Don't show if user is verified, is a Google user, or banner is dismissed
  if (!user || user.emailVerified || user.googleId || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage('');

    try {
      const response = await api.post('/api/auth/resend-verification', { email: user.email });

      if (response.data.success) {
        setMessage('Email de vérification renvoyé ! Veuillez vérifier votre boîte de réception.');
      } else {
        setMessage(response.data.message || 'Erreur lors du renvoi de l\'email');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur lors du renvoi de l\'email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-1">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Vérifiez votre email</span> - Un email de vérification a été envoyé à{' '}
                <span className="font-medium">{user.email}</span>
              </p>
              {message && (
                <p className="text-xs text-yellow-700 mt-1">{message}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="px-4 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Envoi...' : 'Renvoyer l\'email'}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-yellow-600 hover:text-yellow-800 transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

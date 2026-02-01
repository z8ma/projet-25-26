import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CreatorLayout from '../components/CreatorLayout';
import { api, subscriptionApi } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface Subscription {
  id?: string;
  plan: {
    id?: string;
    name: string;
    aiCreditsMonth: number;
    maxProjectsMonth: number;
    priceMonthly?: string;
  };
  aiCreditsUsed: number;
  aiCreditsRemaining: number;
  projectsUsed: number;
  projectsRemaining: number;
  resetDate?: string;
  expiresAt?: string;
  billingCycle?: string;
  cancelAtPeriodEnd?: boolean;
  isFreeTier: boolean;
}

export default function Settings() {
  useDocumentTitle('Paramètres | JUNY');

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subSuccess, setSubSuccess] = useState('');

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load subscription
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await subscriptionApi.getCurrent();
        if (response.success) {
          setSubscription(response.data);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setSubLoading(false);
      }
    };
    loadSubscription();
  }, []);

  // Check for success message
  useEffect(() => {
    if (searchParams.get('subscription') === 'success') {
      setSubSuccess('Votre abonnement a ete active avec succes !');
      // Reload subscription data
      subscriptionApi.getCurrent().then((response) => {
        if (response.success) {
          setSubscription(response.data);
        }
      });
    }
  }, [searchParams]);

  const handleManageBilling = async () => {
    setActionLoading('portal');
    try {
      const response = await subscriptionApi.createPortal();
      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'acces au portail');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Etes-vous sur de vouloir annuler votre abonnement ?')) return;

    setActionLoading('cancel');
    try {
      const response = await subscriptionApi.cancel();
      if (response.success) {
        setSubscription((prev) =>
          prev ? { ...prev, cancelAtPeriodEnd: true } : null
        );
        setSubSuccess('Votre abonnement sera annule a la fin de la periode');
      }
    } catch (error: any) {
      console.error('Cancel error:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'annulation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate');
    try {
      const response = await subscriptionApi.reactivate();
      if (response.success) {
        setSubscription((prev) =>
          prev ? { ...prev, cancelAtPeriodEnd: false } : null
        );
        setSubSuccess('Votre abonnement a ete reactive !');
      }
    } catch (error: any) {
      console.error('Reactivate error:', error);
      alert(error.response?.data?.message || 'Erreur lors de la reactivation');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.put('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') return;

    try {
      setDeleteLoading(true);
      await api.delete('/api/auth/account');
      logout();
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getUsagePercentage = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  return (
    <CreatorLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Parametres du compte
          </h1>
          <p className="text-gray-600">
            Gerez votre compte, votre abonnement et vos preferences
          </p>
        </div>

        {/* Success message */}
        {subSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{subSuccess}</span>
            <button onClick={() => setSubSuccess('')} className="ml-auto">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Subscription Section */}
        {user?.role === 'CREATOR' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Abonnement
            </h2>

            {subLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : subscription ? (
              <div className="space-y-6">
                {/* Plan Info */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        subscription.isFreeTier
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {subscription.plan.name}
                      </span>
                      {subscription.cancelAtPeriodEnd && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Annulation prevue
                        </span>
                      )}
                    </div>
                    {!subscription.isFreeTier && subscription.expiresAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        {subscription.cancelAtPeriodEnd ? 'Se termine le' : 'Renouvellement le'}{' '}
                        {new Date(subscription.expiresAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  {!subscription.isFreeTier && subscription.plan.priceMonthly && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {subscription.plan.priceMonthly}€
                      </p>
                      <p className="text-sm text-gray-500">
                        /{subscription.billingCycle === 'yearly' ? 'an' : 'mois'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {/* AI Credits */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Credits IA</span>
                      <span className="text-sm text-gray-500">
                        {subscription.aiCreditsUsed} / {subscription.plan.aiCreditsMonth}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${getUsagePercentage(subscription.aiCreditsUsed, subscription.plan.aiCreditsMonth)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {subscription.aiCreditsRemaining} restants
                    </p>
                  </div>

                  {/* Projects */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Projets</span>
                      <span className="text-sm text-gray-500">
                        {subscription.projectsUsed} / {subscription.plan.maxProjectsMonth}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${getUsagePercentage(subscription.projectsUsed, subscription.plan.maxProjectsMonth)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {subscription.projectsRemaining} restants
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  {subscription.isFreeTier ? (
                    <Link
                      to="/pricing"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all text-center"
                    >
                      Passer a Pro
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={handleManageBilling}
                        disabled={actionLoading === 'portal'}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading === 'portal' ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        Gerer la facturation
                      </button>

                      {subscription.cancelAtPeriodEnd ? (
                        <button
                          onClick={handleReactivateSubscription}
                          disabled={actionLoading === 'reactivate'}
                          className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {actionLoading === 'reactivate' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : null}
                          Reactiver
                        </button>
                      ) : (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={actionLoading === 'cancel'}
                          className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors disabled:opacity-50"
                        >
                          {actionLoading === 'cancel' ? 'Annulation...' : 'Annuler'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informations du compte
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Verifie
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Type de compte</p>
                <p className="font-medium text-gray-900">
                  {user?.role === 'CREATOR' ? 'Createur' : 'Professionnel'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-gray-500">Membre depuis</p>
                <p className="font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }) : 'Date inconnue'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Changer le mot de passe
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mot de passe modifie avec succes !
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Modification...
                </>
              ) : (
                'Modifier le mot de passe'
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200 mb-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Zone de danger
          </h2>

          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">Supprimer mon compte</p>
              <p className="text-sm text-gray-500 mt-1">
                Cette action est irreversible. Toutes vos donnees seront supprimees.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium transition-colors flex-shrink-0"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Supprimer votre compte ?</h3>
                <p className="text-sm text-gray-500">Cette action est definitive</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700 mb-3">
                En supprimant votre compte, vous perdrez :
              </p>
              <ul className="text-sm text-red-600 space-y-1 ml-4 list-disc">
                <li>Tous vos projets et conversations</li>
                <li>Votre historique de matchs</li>
                <li>Vos credits IA restants</li>
                <li>Toutes vos donnees personnelles</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tapez <span className="font-bold text-red-600">SUPPRIMER</span> pour confirmer
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="SUPPRIMER"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'SUPPRIMER'}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Suppression...
                  </>
                ) : (
                  'Supprimer definitivement'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </CreatorLayout>
  );
}

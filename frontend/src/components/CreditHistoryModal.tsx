import { useState, useEffect } from 'react';
import { aiApi, subscriptionApi } from '../services/api';

interface CreditUsage {
  projectId: string;
  projectTitle: string;
  creditsUsed: number;
  date: string;
}

interface CreditHistoryModalProps {
  onClose: () => void;
}

export default function CreditHistoryModal({ onClose }: CreditHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<CreditUsage[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [convRes, subRes] = await Promise.all([
          aiApi.getConversations(),
          subscriptionApi.getCurrent().catch(() => null),
        ]);

        // Build credit history from conversations
        const conversations = convRes.data || [];
        const creditHistory: CreditUsage[] = conversations
          .filter((c: any) => c.aiCreditsUsed > 0)
          .map((c: any) => ({
            projectId: c.id,
            projectTitle: c.projectTitle || 'Projet sans titre',
            creditsUsed: c.aiCreditsUsed || 0,
            date: c.updatedAt || c.createdAt,
          }))
          .sort((a: CreditUsage, b: CreditUsage) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(creditHistory);
        setSubscription(subRes?.data);
      } catch (error) {
        console.error('Error fetching credit history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalUsed = history.reduce((acc, h) => acc + h.creditsUsed, 0);
  const totalCredits = subscription?.plan?.aiCreditsPerMonth || 100;
  const remaining = Math.max(0, totalCredits - totalUsed);
  const usagePercent = Math.min(100, (totalUsed / totalCredits) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Crédits IA</h2>
              <p className="text-sm text-gray-500">Historique d'utilisation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Usage Summary */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Utilisation ce mois</span>
            <span className="text-sm font-bold text-gray-900">{totalUsed} / {totalCredits} crédits</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-orange-500' : 'bg-purple-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{remaining} crédits restants</span>
            <span className="text-xs text-gray-500">
              {subscription?.plan?.name || 'Plan Gratuit'}
            </span>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-gray-500">Aucun crédit utilisé</p>
              <p className="text-gray-400 text-sm mt-1">Commencez un brainstorming IA !</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((item) => (
                <div key={item.projectId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.projectTitle}</p>
                      <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        -{item.creditsUsed}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              1 crédit = 1 message IA
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface AdminStats {
  users: {
    total: number;
    creators: number;
    professionals: number;
    newThisWeek: number;
    newThisMonth: number;
    verifiedRate: number;
    unverified: number;
  };
  activity: {
    matches: { total: number; accepted: number; declined: number; inProgress: number };
    conversations: { total: number; completed: number; completionRate: number };
    messages: { total: number; unread: number };
    profileViews: { total: number; thisWeek: number };
  };
  subscriptions: {
    active: number;
    expired: number;
    byPlan: { plan: string; count: number; priceMonthly: number }[];
    estimatedMonthlyRevenue: number;
  };
  alerts: { type: 'warning' | 'info'; message: string }[];
  recentUsers: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    creator?: { companyName?: string };
    professional?: { firstName: string; lastName: string };
  }[];
  topProfessionals: {
    name: string;
    rating: number | null;
    totalRatings: number;
    projectsCompleted: number;
    completeness: number;
    profession: string;
  }[];
  topProfessions: { name: string; count: number }[];
  dailyRegistrations: Record<string, number>;
}

function StatCard({ title, value, subtitle, icon, color, bg }: {
  title: string; value: string | number; subtitle?: string;
  icon: string; color: string; bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-5 shadow-sm border border-white/60`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/'); return; }
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const filteredUsers = useMemo(() => {
    if (!stats) return [];
    if (!search.trim()) return stats.recentUsers;
    const q = search.toLowerCase();
    return stats.recentUsers.filter(u =>
      u.email.toLowerCase().includes(q) ||
      u.creator?.companyName?.toLowerCase().includes(q) ||
      (u.professional && `${u.professional.firstName} ${u.professional.lastName}`.toLowerCase().includes(q))
    );
  }, [stats, search]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Chargement des statistiques...</p>
      </div>
    </div>
  );

  if (error || !stats) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-gray-600">{error || 'Données indisponibles'}</p>
      </div>
    </div>
  );

  const { users, activity, subscriptions, alerts, topProfessionals, topProfessions, dailyRegistrations } = stats;

  // Graphique inscriptions (14 derniers jours)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });
  const maxReg = Math.max(...last14Days.map(d => dailyRegistrations[d] || 0), 1);

  // Graphique créateurs vs pros
  const total = users.creators + users.professionals;
  const creatorsPercent = total > 0 ? Math.round((users.creators / total) * 100) : 50;
  const prosPercent = 100 - creatorsPercent;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🛡️ Administration JUNY</h1>
            <p className="text-sm text-gray-400 mt-0.5">Vue d'ensemble de la plateforme</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            ← Retour
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Alertes ─────────────────────────────────────────── */}
        {alerts.length > 0 && (
          <section className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${
                alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <span className="text-xl">{alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            ))}
          </section>
        )}

        {/* ── KPIs Utilisateurs ────────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-gray-700 mb-4">👥 Utilisateurs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total inscrits" value={users.total} icon="👤" color="text-gray-900" bg="bg-white" />
            <StatCard title="Créateurs" value={users.creators} icon="🏢" color="text-orange-500" bg="bg-orange-50" />
            <StatCard title="Professionnels" value={users.professionals} icon="🎨" color="text-purple-500" bg="bg-purple-50" />
            <StatCard title="Cette semaine" value={`+${users.newThisWeek}`} subtitle="nouveaux" icon="📅" color="text-blue-500" bg="bg-blue-50" />
            <StatCard title="Ce mois" value={`+${users.newThisMonth}`} subtitle="nouveaux" icon="📆" color="text-green-500" bg="bg-green-50" />
            <StatCard title="Emails vérifiés" value={`${users.verifiedRate}%`} icon="✅" color="text-emerald-500" bg="bg-emerald-50" />
          </div>
        </section>

        {/* ── Graphiques ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Répartition créateurs vs pros */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-700 mb-5">📊 Répartition des utilisateurs</h2>
            {total === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Aucun utilisateur</p>
            ) : (
              <>
                {/* Barre de répartition */}
                <div className="flex h-8 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                    style={{ width: `${creatorsPercent}%` }}
                  >
                    {creatorsPercent >= 15 && `${creatorsPercent}%`}
                  </div>
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                    style={{ width: `${prosPercent}%` }}
                  >
                    {prosPercent >= 15 && `${prosPercent}%`}
                  </div>
                </div>
                {/* Légende */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    <span className="text-sm text-gray-600">Créateurs <strong>{users.creators}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-600">Professionnels <strong>{users.professionals}</strong></span>
                  </div>
                </div>
                {/* Cercles visuels */}
                <div className="flex items-center gap-4 mt-5">
                  <div className="flex-1 bg-orange-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-orange-500">{users.creators}</p>
                    <p className="text-xs text-gray-500 mt-1">🏢 Créateurs</p>
                  </div>
                  <div className="text-2xl text-gray-300">⟷</div>
                  <div className="flex-1 bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-purple-500">{users.professionals}</p>
                    <p className="text-xs text-gray-500 mt-1">🎨 Professionnels</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Inscriptions 14 jours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-700 mb-5">📈 Inscriptions (14 derniers jours)</h2>
            <div className="flex items-end gap-1 h-28">
              {last14Days.map((day) => {
                const count = dailyRegistrations[day] || 0;
                const height = Math.max((count / maxReg) * 100, 4);
                const label = day.slice(5);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                      {count} inscrit{count > 1 ? 's' : ''}
                    </span>
                    <div
                      className={`w-full rounded-t transition-colors ${count > 0 ? 'bg-purple-400 hover:bg-purple-600' : 'bg-gray-100'}`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-gray-400">{label.replace('-', '/')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Revenus & Abonnements ────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-gray-700 mb-4">💳 Revenus & Abonnements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Revenus mensuels estimés"
              value={`${subscriptions.estimatedMonthlyRevenue.toFixed(0)} €`}
              subtitle="basé sur les abonnements actifs"
              icon="💰"
              color="text-green-600"
              bg="bg-green-50"
            />
            <StatCard title="Abonnements actifs" value={subscriptions.active} icon="✅" color="text-blue-600" bg="bg-blue-50" />
            <StatCard title="Abonnements expirés" value={subscriptions.expired} subtitle="non renouvelés" icon="⏰" color="text-red-500" bg="bg-red-50" />
          </div>

          {subscriptions.byPlan.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-4">
              <p className="text-sm font-semibold text-gray-600 mb-4">Répartition par plan</p>
              <div className="space-y-3">
                {subscriptions.byPlan.map((s) => (
                  <div key={s.plan} className="flex items-center gap-4">
                    <span className="text-sm text-gray-700 font-medium w-24">{s.plan}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${subscriptions.active > 0 ? (s.count / subscriptions.active) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-6 text-right">{s.count}</span>
                    <span className="text-xs text-green-600 w-16 text-right font-medium">
                      {(s.count * s.priceMonthly).toFixed(0)} €/mois
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Activité ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-gray-700 mb-4">⚡ Activité plateforme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">🤝 Matches</p>
              <p className="text-3xl font-bold text-gray-900">{activity.matches.total}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-green-600">✅ Acceptés</span><span className="font-semibold">{activity.matches.accepted}</span></div>
                <div className="flex justify-between text-xs"><span className="text-red-500">❌ Déclinés</span><span className="font-semibold">{activity.matches.declined}</span></div>
                <div className="flex justify-between text-xs"><span className="text-blue-500">🔄 En cours</span><span className="font-semibold">{activity.matches.inProgress}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">🤖 Conversations IA</p>
              <p className="text-3xl font-bold text-gray-900">{activity.conversations.total}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-green-600">✅ Complétées</span><span className="font-semibold">{activity.conversations.completed}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">📊 Taux</span><span className="font-semibold">{activity.conversations.completionRate}%</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">💬 Messages</p>
              <p className="text-3xl font-bold text-gray-900">{activity.messages.total}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-orange-500">📬 Non lus</span><span className="font-semibold">{activity.messages.unread}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">👀 Vues de profil</p>
              <p className="text-3xl font-bold text-gray-900">{activity.profileViews.total}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-purple-500">📅 Cette semaine</span><span className="font-semibold">{activity.profileViews.thisWeek}</span></div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top métiers */}
          <section>
            <h2 className="text-base font-bold text-gray-700 mb-4">🎯 Top métiers</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              {topProfessions.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune donnée</p>
              ) : topProfessions.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-lg w-6">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                  <span className="flex-1 text-sm text-gray-700 font-medium">{p.name}</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(p.count / topProfessions[0].count) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-purple-600 w-12 text-right">{p.count} pro{p.count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top professionnels */}
          <section>
            <h2 className="text-base font-bold text-gray-700 mb-4">⭐ Top professionnels</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              {topProfessionals.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun professionnel</p>
              ) : topProfessionals.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.profession}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {p.rating ? (
                      <p className="text-sm font-bold text-yellow-500">⭐ {Number(p.rating).toFixed(1)}</p>
                    ) : (
                      <p className="text-xs text-gray-300">Pas de note</p>
                    )}
                    <p className="text-xs text-gray-400">{p.projectsCompleted} projets</p>
                  </div>
                  <div className="flex-shrink-0 w-10 text-right">
                    <span className={`text-xs font-bold ${p.completeness >= 80 ? 'text-green-500' : p.completeness >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                      {p.completeness}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Inscrits avec recherche ──────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-700">🆕 Inscrits ({stats.recentUsers.length} derniers)</h2>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 w-56"
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom / Entreprise</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email vérifié</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">Aucun résultat</td></tr>
                ) : filteredUsers.map((u) => {
                  const displayName = u.role === 'CREATOR'
                    ? u.creator?.companyName || '—'
                    : u.professional ? `${u.professional.firstName} ${u.professional.lastName}` : '—';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{displayName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'CREATOR' ? 'bg-orange-100 text-orange-700'
                          : u.role === 'PROFESSIONAL' ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role === 'CREATOR' ? '🏢 Créateur' : u.role === 'PROFESSIONAL' ? '🎨 Pro' : '🛡️ Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-lg">
                        {u.emailVerified ? '✅' : '❌'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

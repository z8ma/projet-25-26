import { useEffect, useState } from 'react';
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
  };
  activity: {
    matches: { total: number; accepted: number; declined: number; inProgress: number };
    conversations: { total: number; completed: number; completionRate: number };
    messages: { total: number; unread: number };
    profileViews: { total: number; thisWeek: number };
  };
  subscriptions: {
    active: number;
    byPlan: { plan: string; count: number }[];
  };
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

function StatCard({
  title, value, subtitle, icon, color
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-gray-600">{error || 'Données indisponibles'}</p>
        </div>
      </div>
    );
  }

  const { users, activity, subscriptions, recentUsers, topProfessionals, topProfessions, dailyRegistrations } = stats;

  // Données pour le graphique d'inscriptions
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });
  const maxReg = Math.max(...last14Days.map(d => dailyRegistrations[d] || 0), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🛡️ Administration JUNY</h1>
            <p className="text-sm text-gray-400 mt-0.5">Vue d'ensemble de la plateforme</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            ← Retour au dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ── KPIs Utilisateurs ─────────────────────────────── */}
        <section>
          <SectionTitle title="👥 Utilisateurs" subtitle="Données globales sur les inscrits" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total inscrits" value={users.total} icon="👤" color="text-gray-900" />
            <StatCard title="Créateurs" value={users.creators} icon="🏢" color="text-orange-500" />
            <StatCard title="Professionnels" value={users.professionals} icon="🎨" color="text-purple-500" />
            <StatCard title="Cette semaine" value={users.newThisWeek} subtitle="nouveaux" icon="📅" color="text-blue-500" />
            <StatCard title="Ce mois" value={users.newThisMonth} subtitle="nouveaux" icon="📆" color="text-green-500" />
            <StatCard title="Emails vérifiés" value={`${users.verifiedRate}%`} icon="✅" color="text-emerald-500" />
          </div>
        </section>

        {/* ── Graphique inscriptions ─────────────────────────── */}
        <section>
          <SectionTitle title="📈 Inscriptions (14 derniers jours)" />
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-end gap-1 h-32">
              {last14Days.map((day) => {
                const count = dailyRegistrations[day] || 0;
                const height = maxReg > 0 ? Math.max((count / maxReg) * 100, 4) : 4;
                const label = day.slice(5); // MM-DD
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-purple-100 hover:bg-purple-400 rounded-t transition-colors cursor-default"
                      style={{ height: `${height}%` }}
                    />
                    {/* Tooltip */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {count} inscrit{count > 1 ? 's' : ''}
                    </span>
                    <span className="text-[9px] text-gray-400 rotate-45 origin-left">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Activité ──────────────────────────────────────── */}
        <section>
          <SectionTitle title="⚡ Activité plateforme" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">🤝 Matches</p>
              <p className="text-3xl font-bold text-gray-900">{activity.matches.total}</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">✅ Acceptés</span>
                  <span className="font-semibold">{activity.matches.accepted}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-500">❌ Déclinés</span>
                  <span className="font-semibold">{activity.matches.declined}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-500">🔄 En cours</span>
                  <span className="font-semibold">{activity.matches.inProgress}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">🤖 Conversations IA</p>
              <p className="text-3xl font-bold text-gray-900">{activity.conversations.total}</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">✅ Complétées</span>
                  <span className="font-semibold">{activity.conversations.completed}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">📊 Taux de complétion</span>
                  <span className="font-semibold">{activity.conversations.completionRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">💬 Messages</p>
              <p className="text-3xl font-bold text-gray-900">{activity.messages.total}</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-orange-500">📬 Non lus</span>
                  <span className="font-semibold">{activity.messages.unread}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-3">👀 Vues de profil</p>
              <p className="text-3xl font-bold text-gray-900">{activity.profileViews.total}</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-500">📅 Cette semaine</span>
                  <span className="font-semibold">{activity.profileViews.thisWeek}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Abonnements ────────────────────────────────── */}
          <section>
            <SectionTitle title="💳 Abonnements" subtitle={`${subscriptions.active} abonnements actifs`} />
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              {subscriptions.byPlan.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun abonnement actif</p>
              ) : (
                subscriptions.byPlan.map((s) => (
                  <div key={s.plan} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">{s.plan}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400 rounded-full"
                          style={{ width: `${Math.min((s.count / subscriptions.active) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-6 text-right">{s.count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Top métiers ────────────────────────────────── */}
          <section>
            <SectionTitle title="🎯 Top métiers" subtitle="Les professions les plus représentées" />
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              {topProfessions.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-lg w-6">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                  <span className="flex-1 text-sm text-gray-700 font-medium">{p.name}</span>
                  <span className="text-sm font-bold text-purple-600">{p.count} pro{p.count > 1 ? 's' : ''}</span>
                </div>
              ))}
              {topProfessions.length === 0 && <p className="text-gray-400 text-sm">Aucune donnée</p>}
            </div>
          </section>
        </div>

        {/* ── Top professionnels ──────────────────────────── */}
        <section>
          <SectionTitle title="⭐ Top professionnels" subtitle="Les mieux notés sur la plateforme" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Métier</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Projets</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Profil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProfessionals.map((p) => (
                  <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.profession}</td>
                    <td className="px-6 py-4 text-center">
                      {p.rating ? (
                        <span className="text-sm font-semibold text-yellow-500">⭐ {Number(p.rating).toFixed(1)}</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{p.projectsCompleted}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: `${p.completeness}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{p.completeness}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {topProfessionals.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">Aucun professionnel</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Derniers inscrits ───────────────────────────── */}
        <section>
          <SectionTitle title="🆕 Derniers inscrits" subtitle="Les 10 derniers comptes créés" />
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
                {recentUsers.map((u) => {
                  const displayName = u.role === 'CREATOR'
                    ? u.creator?.companyName || '—'
                    : u.professional
                    ? `${u.professional.firstName} ${u.professional.lastName}`
                    : '—';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{displayName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'CREATOR'
                            ? 'bg-orange-100 text-orange-700'
                            : u.role === 'PROFESSIONAL'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role === 'CREATOR' ? '🏢 Créateur' : u.role === 'PROFESSIONAL' ? '🎨 Pro' : '🛡️ Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {u.emailVerified
                          ? <span className="text-green-500 text-lg">✅</span>
                          : <span className="text-red-400 text-lg">❌</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
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

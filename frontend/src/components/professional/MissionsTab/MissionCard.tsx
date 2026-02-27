import React from 'react';

// Parse projectSummary JSON — handles string, object, or null
function parseBrief(raw: any): {
  summary?: string;
  sections?: Record<string, string>;
  keywords?: string[];
  insights?: Record<string, { value: string }>;
} | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === 'object' && (parsed.summary || parsed.sections)) {
      return parsed;
    }
  } catch { /* not JSON */ }
  // Plain text fallback — treat as summary
  return typeof raw === 'string' ? { summary: raw } : null;
}

const SECTION_LABELS: Record<string, string> = {
  contextAndIntention: 'Contexte du projet',
  artisticDirection: 'Direction artistique',
  idealCreativeProfile: 'Profil créatif recherché',
  targetAndUsage: 'Cible & usage',
  budgetAndConstraints: 'Budget & contraintes',
  dnaAndValues: 'Identité & valeurs',
  keywordsAndVision: 'Vision',
};

// Priority order of sections to display for a professional
const SECTION_ORDER = [
  'idealCreativeProfile',
  'artisticDirection',
  'contextAndIntention',
  'targetAndUsage',
  'budgetAndConstraints',
  'dnaAndValues',
  'keywordsAndVision',
];

interface MissionCardProps {
  match: any;
  showActions?: boolean;
  expandedMission: string | null;
  setExpandedMission: (id: string | null) => void;
  handleRespondToMatch: (matchId: string, status: 'ACCEPTED' | 'DECLINED') => void;
  handleUpdateProjectStatus: (matchId: string, status: string) => void;
  setActiveTab: (tab: string) => void;
  conversations: any[];
  selectConversation: (conversation: any) => void;
}

export function MissionCard({
  match,
  showActions = false,
  expandedMission,
  setExpandedMission,
  handleRespondToMatch,
  handleUpdateProjectStatus,
  setActiveTab,
  conversations,
  selectConversation,
}: MissionCardProps) {
  const brief = parseBrief(match.conversation?.projectSummary);

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold text-gray-900 truncate">
                {match.conversation?.projectTitle || 'Projet sans titre'}
              </h3>
              {match.unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
                  {match.unreadCount} nouveau{match.unreadCount > 1 ? 'x' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span className="font-medium text-gray-700">
                {match.conversation?.creator?.companyName || 'Entreprise'}
              </span>
              {match.conversation?.creator?.industry && (
                <span className="text-gray-400">{match.conversation.creator.industry}</span>
              )}
              <span className="text-purple-600 font-semibold">{match.matchScore}%</span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">
              {brief?.summary || match.reasoning || 'Brief non encore généré'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setExpandedMission(expandedMission === match.id ? null : match.id)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Voir les détails"
            >
              <svg className={`w-5 h-5 transition-transform ${expandedMission === match.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showActions && (
              <>
                <button
                  onClick={() => handleRespondToMatch(match.id, 'ACCEPTED')}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleRespondToMatch(match.id, 'DECLINED')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Décliner
                </button>
              </>
            )}
            {match.status === 'ACCEPTED' && (
              <button
                onClick={() => {
                  setActiveTab('messages');
                  setTimeout(() => {
                    const conv = conversations.find((c: any) => c.id === match.id);
                    if (conv) selectConversation(conv);
                  }, 200);
                }}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Messagerie
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expandedMission === match.id && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Project status workflow - only for accepted missions */}
          {match.status === 'ACCEPTED' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Avancement du projet</p>
              <div className="flex items-center gap-1">
                {[
                  { key: 'NOT_STARTED', label: 'Non démarré', activeClass: 'bg-gray-200 text-gray-700 ring-2 ring-gray-300' },
                  { key: 'IN_PROGRESS', label: 'En cours', activeClass: 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' },
                  { key: 'REVIEW', label: 'En review', activeClass: 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' },
                  { key: 'COMPLETED', label: 'Terminé', activeClass: 'bg-green-100 text-green-700 ring-2 ring-green-300' },
                ].map((step, i) => {
                  const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
                  const currentIdx = statuses.indexOf(match.projectStatus);
                  const stepIdx = statuses.indexOf(step.key);
                  const isActive = step.key === match.projectStatus;
                  const isPast = stepIdx < currentIdx;
                  const isNext = stepIdx === currentIdx + 1;

                  return (
                    <div key={step.key} className="flex items-center gap-1 flex-1">
                      <button
                        onClick={() => isNext && handleUpdateProjectStatus(match.id, step.key)}
                        disabled={!isNext}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all text-center ${
                          isActive
                            ? step.activeClass
                            : isPast
                            ? 'bg-green-50 text-green-600'
                            : isNext
                            ? 'bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 cursor-pointer'
                            : 'bg-gray-50 text-gray-400'
                        }`}
                        title={isNext ? `Passer à "${step.label}"` : ''}
                      >
                        {isPast ? (
                          <svg className="w-3.5 h-3.5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.label
                        )}
                      </button>
                      {i < 3 && (
                        <svg className={`w-4 h-4 flex-shrink-0 ${isPast ? 'text-green-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick actions for accepted */}
          {match.status === 'ACCEPTED' && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('messages');
                  setTimeout(() => {
                    const conv = conversations.find((c: any) => c.id === match.id);
                    if (conv) selectConversation(conv);
                  }, 200);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Envoyer un message
              </button>
              {match.projectStatus === 'COMPLETED' && (
                <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Projet terminé
                </span>
              )}
            </div>
          )}

          {/* Review received (for completed projects) */}
          {match.projectStatus === 'COMPLETED' && (
            <div className={`p-4 rounded-xl ${match.rating ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
              {match.rating ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Avis du client</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < match.rating.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {match.rating.comment && (
                    <p className="text-sm text-gray-700 italic">"{match.rating.comment}"</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">En attente d'avis du client</p>
                </div>
              )}
            </div>
          )}

          {/* Match info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Score de compatibilité</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${match.matchScore}%` }} />
                </div>
                <span className="text-sm font-semibold text-purple-600">{match.matchScore}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Reçu le</p>
              <p className="text-sm text-gray-700">
                {new Date(match.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {match.reasoning && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pourquoi ce match</p>
              <p className="text-sm text-gray-700">{match.reasoning}</p>
            </div>
          )}

          {/* Project Brief */}
          {brief ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Brief du projet</p>

              {/* Executive summary */}
              {brief.summary && (
                <p className="text-sm text-gray-700 italic leading-relaxed border-l-2 border-purple-200 pl-3">
                  {brief.summary}
                </p>
              )}

              {/* Quick insight chips */}
              {brief.insights && (
                <div className="flex flex-wrap gap-2">
                  {brief.insights.budget?.value && brief.insights.budget.value !== 'Non précisé' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {brief.insights.budget.value}
                    </span>
                  )}
                  {brief.insights.deadline?.value && brief.insights.deadline.value !== 'Non précisé' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {brief.insights.deadline.value}
                    </span>
                  )}
                  {brief.insights.style?.value && brief.insights.style.value !== 'Non précisé' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                      {brief.insights.style.value}
                    </span>
                  )}
                  {brief.insights.target?.value && brief.insights.target.value !== 'Non précisé' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {brief.insights.target.value}
                    </span>
                  )}
                </div>
              )}

              {/* Narrative sections */}
              {brief.sections && (
                <div className="space-y-3">
                  {SECTION_ORDER.filter(key => brief.sections![key]).map(key => (
                    <div key={key}>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{SECTION_LABELS[key]}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{brief.sections![key]}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Keywords */}
              {brief.keywords && brief.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {brief.keywords.map((kw: string) => (
                    <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Brief du projet</p>
              <p className="text-sm text-gray-500 italic">
                Le créateur n'a pas encore généré de brief détaillé pour ce projet.
              </p>
              {match.conversation?.projectInsights && (() => {
                const ins = match.conversation.projectInsights as Record<string, string>;
                const hasAny = Object.values(ins).some(v => v !== 'none');
                if (!hasAny) return null;
                const insightLabels: Record<string, string> = {
                  projectType: 'Type de projet',
                  targetAudience: 'Audience cible',
                  visualStyle: 'Style visuel',
                  budget: 'Budget',
                  deadline: 'Délai',
                };
                const levelColors: Record<string, string> = {
                  acceptable: 'bg-yellow-50 text-yellow-700',
                  good: 'bg-blue-50 text-blue-700',
                  excellent: 'bg-green-50 text-green-700',
                };
                return (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Object.entries(ins)
                      .filter(([, v]) => v !== 'none')
                      .map(([k, v]) => (
                        <span key={k} className={`px-2 py-0.5 rounded-md text-xs font-medium ${levelColors[v] || 'bg-gray-100 text-gray-600'}`}>
                          {insightLabels[k] || k}
                        </span>
                      ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

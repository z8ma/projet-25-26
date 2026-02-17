import React from 'react';

interface DashboardTabProps {
  dashboardStats: any;
  firstName: string;
  profileCompleteness: number;
  setActiveTab: (tab: string) => void;
  heroAnimation: any;
  quickActionsAnimation: any;
  projectsAnimation: any;
}

export function DashboardTab({
  dashboardStats,
  firstName,
  profileCompleteness,
  setActiveTab,
  heroAnimation,
  quickActionsAnimation,
  projectsAnimation,
}: DashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* Welcome header with key metrics */}
      <div
        ref={heroAnimation.ref}
        className={`bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-500 rounded-2xl p-8 text-white relative overflow-hidden transition-all duration-700 ${
          heroAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">
            Bonjour{firstName ? ` ${firstName}` : ''}
          </h1>
          <p className="text-purple-200 mb-6">
            Voici votre activité sur JUNY
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Projets en cours */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold">{dashboardStats?.stats?.activeMissions || 0}</div>
              <div className="text-sm text-purple-200 mb-2">Projets en cours</div>
              <svg className="w-full h-8" viewBox="0 0 100 24" preserveAspectRatio="none">
                <polyline
                  points="0,20 14,18 28,15 42,17 57,12 71,14 85,10 100,8"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  className="group-hover:stroke-white transition-all"
                />
              </svg>
            </div>

            {/* En attente */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold">{dashboardStats?.stats?.pendingMissions || 0}</div>
              <div className="text-sm text-purple-200 mb-2">En attente</div>
              <svg className="w-full h-8" viewBox="0 0 100 24" preserveAspectRatio="none">
                <polyline
                  points="0,15 14,12 28,16 42,13 57,10 71,15 85,12 100,14"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  className="group-hover:stroke-white transition-all"
                />
              </svg>
            </div>

            {/* Followers */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold">{dashboardStats?.stats?.followersCount || 0}</div>
              <div className="text-sm text-purple-200 mb-2">Abonnés</div>
              <svg className="w-full h-8" viewBox="0 0 100 24" preserveAspectRatio="none">
                <polyline
                  points="0,22 14,20 28,18 42,14 57,16 71,10 85,8 100,6"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  className="group-hover:stroke-white transition-all"
                />
              </svg>
            </div>

            {/* Likes sur projets */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold">{dashboardStats?.stats?.totalPortfolioLikes || 0}</div>
              <div className="text-sm text-purple-200 mb-2">Likes projets</div>
              <svg className="w-full h-8" viewBox="0 0 100 24" preserveAspectRatio="none">
                <polyline
                  points="0,18 14,16 28,12 42,10 57,8 71,5 85,4 100,2"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  className="group-hover:stroke-white transition-all"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick action buttons */}
      <div
        ref={quickActionsAnimation.ref}
        className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-700 delay-200 ${
          quickActionsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <button
          onClick={() => setActiveTab('missions')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">Missions</div>
            <div className="text-xs text-gray-500">Voir mes missions</div>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">Messages</div>
            <div className="text-xs text-gray-500">Conversations</div>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">Portfolio</div>
            <div className="text-xs text-gray-500">Mes travaux</div>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">Profil</div>
            <div className="text-xs text-gray-500">Modifier</div>
          </div>
        </button>
      </div>

      {/* Three-column layout: Projects + Stats + Activity */}
      <div
        ref={projectsAnimation.ref}
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 delay-300 ${
          projectsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Column 1: Active projects (compact) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Projets actifs</h2>
            {(dashboardStats?.activeProjects?.length > 0) && (
              <button onClick={() => setActiveTab('missions')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Tout voir
              </button>
            )}
          </div>
          {dashboardStats?.activeProjects?.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.activeProjects.slice(0, 4).map((project: any) => {
                const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
                  NOT_STARTED: { label: 'À démarrer', color: 'text-gray-500', icon: '○' },
                  IN_PROGRESS: { label: 'En cours', color: 'text-blue-500', icon: '◐' },
                  REVIEW: { label: 'Review', color: 'text-amber-500', icon: '◑' },
                };
                const status = statusConfig[project.projectStatus] || statusConfig.NOT_STARTED;
                return (
                  <div key={project.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setActiveTab('missions')}>
                    <div className="flex items-start gap-2">
                      <span className={`text-lg ${status.color}`}>{status.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {project.projectTitle || 'Projet sans titre'}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{project.clientName}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium">Aucun projet actif</p>
            </div>
          )}
        </div>

        {/* Column 2: Performance stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Note moyenne</div>
                    <div className="text-lg font-bold text-gray-900">{dashboardStats?.stats?.averageRating?.toFixed(1) || '-'}<span className="text-sm font-normal text-gray-400"> / 5</span></div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{dashboardStats?.stats?.totalRatings || 0} avis</span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Projets finalisés</div>
                    <div className="text-lg font-bold text-gray-900">{dashboardStats?.stats?.projectsCompleted || 0}</div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ajouté en favoris</div>
                    <div className="text-lg font-bold text-gray-900">{dashboardStats?.stats?.favoritesCount || 0}</div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Vues profil</div>
                    <div className="text-lg font-bold text-gray-900">{dashboardStats?.stats?.totalViews || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile view sources - Pie chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sources de vues</h2>

            {(() => {
              // Calculate percentages from real data
              const totalViews = dashboardStats?.stats?.totalViews || 0;
              const viewSources = dashboardStats?.stats?.viewSources || {
                aiRecommendation: 0,
                directSearch: 0,
                fromFavorites: 0,
                linkSharing: 0,
              };

              const aiPercent = totalViews > 0 ? (viewSources.aiRecommendation / totalViews) * 100 : 0;
              const directPercent = totalViews > 0 ? (viewSources.directSearch / totalViews) * 100 : 0;
              const favoritesPercent = totalViews > 0 ? (viewSources.fromFavorites / totalViews) * 100 : 0;
              const linkPercent = totalViews > 0 ? (viewSources.linkSharing / totalViews) * 100 : 0;

              // SVG donut chart calculations (circumference = 2πr = 251 for r=40)
              const circumference = 251;
              const aiArc = (aiPercent / 100) * circumference;
              const directArc = (directPercent / 100) * circumference;
              const favoritesArc = (favoritesPercent / 100) * circumference;
              const linkArc = (linkPercent / 100) * circumference;

              return (
                <>
                  {/* Donut chart */}
                  <div className="flex items-center justify-center mb-4">
                    {totalViews > 0 ? (
                      <svg className="w-36 h-36" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="20" />

                        {/* IA recommendations (purple) */}
                        {aiArc > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#9333ea"
                            strokeWidth="20"
                            strokeDasharray={`${aiArc} ${circumference}`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-500 hover:stroke-purple-700"
                          />
                        )}

                        {/* Direct search (indigo) */}
                        {directArc > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="20"
                            strokeDasharray={`${directArc} ${circumference}`}
                            strokeDashoffset={`-${aiArc}`}
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-500 hover:stroke-indigo-700"
                          />
                        )}

                        {/* From favorites (blue) */}
                        {favoritesArc > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="20"
                            strokeDasharray={`${favoritesArc} ${circumference}`}
                            strokeDashoffset={`-${aiArc + directArc}`}
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-500 hover:stroke-blue-700"
                          />
                        )}

                        {/* Link sharing (violet) */}
                        {linkArc > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="20"
                            strokeDasharray={`${linkArc} ${circumference}`}
                            strokeDashoffset={`-${aiArc + directArc + favoritesArc}`}
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-500 hover:stroke-violet-700"
                          />
                        )}

                        {/* Center text */}
                        <text x="50" y="50" textAnchor="middle" dy=".3em" className="text-2xl font-bold" fill="#111827">
                          {totalViews}
                        </text>
                      </svg>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p className="text-sm">Aucune vue enregistrée</p>
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  {totalViews > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                          <span className="text-gray-700">IA recommandations</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {aiPercent.toFixed(0)}% <span className="text-xs text-gray-400">({viewSources.aiRecommendation})</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                          <span className="text-gray-700">Recherche directe</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {directPercent.toFixed(0)}% <span className="text-xs text-gray-400">({viewSources.directSearch})</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          <span className="text-gray-700">Depuis favoris</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {favoritesPercent.toFixed(0)}% <span className="text-xs text-gray-400">({viewSources.fromFavorites})</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-violet-600"></div>
                          <span className="text-gray-700">Partage de lien</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {linkPercent.toFixed(0)}% <span className="text-xs text-gray-400">({viewSources.linkSharing})</span>
                        </span>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Profile completeness */}
          {profileCompleteness < 100 && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-800">Profil</span>
                <span className="text-sm font-bold text-purple-600">{profileCompleteness}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
                <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${profileCompleteness}%` }} />
              </div>
              <p className="text-xs text-purple-600 mb-3">Un profil complet attire plus de créateurs</p>
              <button
                onClick={() => setActiveTab('profile')}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Compléter mon profil
              </button>
            </div>
          )}
        </div>

        {/* Column 3: Popular projects, Reviews and Collaborators */}
        <div className="space-y-6">
          {/* Top liked portfolio projects */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Projets populaires
              </h2>
              {dashboardStats?.topLikedProjects?.length > 0 && (
                <button onClick={() => setActiveTab('portfolio')} className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                  Tout voir
                </button>
              )}
            </div>
            {dashboardStats?.topLikedProjects?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {dashboardStats.topLikedProjects.slice(0, 4).map((project: any) => {
                  const getProjectImage = (project: any) => {
                    return (
                      project.imageUrl ||
                      project.media?.find((m: any) => m.type === 'IMAGE')?.url ||
                      project.media?.[0]?.thumbnailUrl ||
                      project.media?.[0]?.url ||
                      null
                    );
                  };
                  const imageUrl = getProjectImage(project);

                  return (
                    <div
                      key={project.id}
                      onClick={() => setActiveTab('portfolio')}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                          <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-xs font-medium truncate">{project.title}</p>
                      </div>
                      {project.likesCount > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-xs font-semibold text-gray-700">{project.likesCount}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Aucun projet</p>
              </div>
            )}
          </div>

          {/* Reviews received */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Avis reçus
            </h2>
            {dashboardStats?.ratings?.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.ratings.slice(0, 2).map((review: any) => (
                  <div key={review.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {review.projectTitle || 'Projet'}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {review.clientName}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 ml-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-gray-700 italic line-clamp-2">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <p className="text-xs font-medium">Aucun avis</p>
              </div>
            )}
          </div>

          {/* Recent collaborators */}
          {dashboardStats?.recentCollaborators?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Collaborateurs récents</h2>
              <div className="space-y-2">
                {dashboardStats.recentCollaborators.slice(0, 3).map((collab: any) => (
                  <div key={collab.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    {collab.profilePictureUrl ? (
                      <img
                        src={collab.profilePictureUrl}
                        alt={collab.companyName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
                        {(collab.companyName || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {collab.companyName || 'Entreprise'}
                      </p>
                      {collab.lastProject && (
                        <p className="text-xs text-purple-600 truncate">{collab.lastProject}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

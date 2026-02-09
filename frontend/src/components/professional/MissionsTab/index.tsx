import React from 'react';
import { MissionCard } from './MissionCard';

interface MissionsTabProps {
  matches: any[];
  expandedMission: string | null;
  setExpandedMission: (id: string | null) => void;
  handleRespondToMatch: (matchId: string, status: 'ACCEPTED' | 'DECLINED') => void;
  handleUpdateProjectStatus: (matchId: string, status: string) => void;
  matchesAnimation: any;
  setActiveTab: (tab: string) => void;
  conversations: any[];
  selectConversation: (conversation: any) => void;
}

export function MissionsTab({
  matches,
  expandedMission,
  setExpandedMission,
  handleRespondToMatch,
  handleUpdateProjectStatus,
  matchesAnimation,
  setActiveTab,
  conversations,
  selectConversation,
}: MissionsTabProps) {
  const pendingMatches = matches.filter((m: any) => m.status === 'CONTACTED');
  const acceptedMatches = matches.filter((m: any) => m.status === 'ACCEPTED');
  const declinedMatches = matches.filter((m: any) => m.status === 'DECLINED');
  const proposedMatches = matches.filter((m: any) => m.status === 'PROPOSED');

  return (
    <div
      ref={matchesAnimation.ref}
      className={`space-y-6 transition-all duration-700 ${
        matchesAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune mission</h3>
          <p className="text-gray-500">Complétez votre profil pour attirer plus de créateurs !</p>
        </div>
      ) : (
        <>
          {/* En attente */}
          {pendingMatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  En attente ({pendingMatches.length})
                </h2>
              </div>
              <div className="space-y-3">
                {pendingMatches.map((match: any) => (
                  <MissionCard
                    key={match.id}
                    match={match}
                    showActions
                    expandedMission={expandedMission}
                    setExpandedMission={setExpandedMission}
                    handleRespondToMatch={handleRespondToMatch}
                    handleUpdateProjectStatus={handleUpdateProjectStatus}
                    setActiveTab={setActiveTab}
                    conversations={conversations}
                    selectConversation={selectConversation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Acceptées */}
          {acceptedMatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Acceptées ({acceptedMatches.length})
                </h2>
              </div>
              <div className="space-y-3">
                {acceptedMatches.map((match: any) => (
                  <MissionCard
                    key={match.id}
                    match={match}
                    expandedMission={expandedMission}
                    setExpandedMission={setExpandedMission}
                    handleRespondToMatch={handleRespondToMatch}
                    handleUpdateProjectStatus={handleUpdateProjectStatus}
                    setActiveTab={setActiveTab}
                    conversations={conversations}
                    selectConversation={selectConversation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Proposées */}
          {proposedMatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Proposées ({proposedMatches.length})
                </h2>
              </div>
              <div className="space-y-3">
                {proposedMatches.map((match: any) => (
                  <MissionCard
                    key={match.id}
                    match={match}
                    expandedMission={expandedMission}
                    setExpandedMission={setExpandedMission}
                    handleRespondToMatch={handleRespondToMatch}
                    handleUpdateProjectStatus={handleUpdateProjectStatus}
                    setActiveTab={setActiveTab}
                    conversations={conversations}
                    selectConversation={selectConversation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Déclinées */}
          {declinedMatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Déclinées ({declinedMatches.length})
                </h2>
              </div>
              <div className="space-y-3 opacity-60">
                {declinedMatches.map((match: any) => (
                  <MissionCard
                    key={match.id}
                    match={match}
                    expandedMission={expandedMission}
                    setExpandedMission={setExpandedMission}
                    handleRespondToMatch={handleRespondToMatch}
                    handleUpdateProjectStatus={handleUpdateProjectStatus}
                    setActiveTab={setActiveTab}
                    conversations={conversations}
                    selectConversation={selectConversation}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

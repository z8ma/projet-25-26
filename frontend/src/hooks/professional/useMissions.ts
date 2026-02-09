import { useState } from 'react';
import { professionalApi, matchingApi } from '../../services/api';

export function useMissions() {
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleRespondToMatch = async (
    matchId: string,
    status: 'ACCEPTED' | 'DECLINED',
    onSuccess?: () => void
  ) => {
    try {
      const response = await professionalApi.respondToMatch(matchId, status);
      if (response.success) {
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réponse');
      console.error('Error responding to match:', err);
    }
  };

  const handleUpdateProjectStatus = async (
    matchId: string,
    projectStatus: string,
    onSuccess?: () => void
  ) => {
    try {
      const response = await matchingApi.updateProjectStatus(matchId, { projectStatus });
      if (response.success) {
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      console.error('Error updating project status:', err);
    }
  };

  return {
    expandedMission,
    setExpandedMission,
    error,
    setError,
    handleRespondToMatch,
    handleUpdateProjectStatus,
  };
}

import React from 'react';

interface ProfileStatsProps {
  experienceYears: string;
  hourlyRate: string;
  skillsCount: number;
  profileCompleteness: number;
  personalInfoAnimation: any;
}

export function ProfileStats({
  experienceYears,
  hourlyRate,
  skillsCount,
  profileCompleteness,
  personalInfoAnimation,
}: ProfileStatsProps) {
  return (
    <div
      ref={personalInfoAnimation.ref}
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${
        personalInfoAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">{experienceYears || '—'}</div>
        <div className="text-sm text-gray-500">Années d'exp.</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <div className="text-2xl font-bold text-gray-900">{hourlyRate ? `${hourlyRate}€` : '—'}</div>
        <div className="text-sm text-gray-500">Tarif horaire</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">{skillsCount}</div>
        <div className="text-sm text-gray-500">Compétences</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <div className={`text-2xl font-bold ${profileCompleteness >= 80 ? 'text-purple-600' : 'text-gray-900'}`}>{profileCompleteness}%</div>
        <div className="text-sm text-gray-500">Profil complété</div>
      </div>
    </div>
  );
}

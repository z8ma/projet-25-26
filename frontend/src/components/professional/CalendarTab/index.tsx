import React from 'react';
import { CalendarModal } from './CalendarModal';

interface CalendarTabProps {
  // Calendar state
  calendarMonth: number;
  setCalendarMonth: (month: number) => void;
  calendarYear: number;
  setCalendarYear: (year: number) => void;
  selectedCalendarDate: Date | null;
  setSelectedCalendarDate: (date: Date | null) => void;
  calendarView: 'month' | 'year';
  setCalendarView: (view: 'month' | 'year') => void;
  calendarEvents: any[];
  showEventModal: boolean;
  editingEvent: any;
  eventForm: any;
  setEventForm: (form: any) => void;
  loading: boolean;

  // Functions
  openEventModal: (date?: Date, event?: any) => void;
  handleCreateEvent: () => void;
  handleDeleteEvent: (eventId: string) => void;
  resetEventForm: () => void;

  // Data
  matches: any[];

  // Animation
  calendarAnimation: any;

  // Navigation
  setActiveTab: (tab: string) => void;
}

export function CalendarTab({
  calendarMonth,
  setCalendarMonth,
  calendarYear,
  setCalendarYear,
  selectedCalendarDate,
  setSelectedCalendarDate,
  calendarView,
  setCalendarView,
  calendarEvents,
  showEventModal,
  editingEvent,
  eventForm,
  setEventForm,
  loading,
  openEventModal,
  handleCreateEvent,
  handleDeleteEvent,
  resetEventForm,
  matches,
  calendarAnimation,
  setActiveTab,
}: CalendarTabProps) {
  const missionsWithDates = matches.filter((m: any) => m.status === 'ACCEPTED');
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthNamesFull = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };

  const getDayMissions = (day: number, month: number = calendarMonth, year: number = calendarYear) => {
    const date = new Date(year, month, day);
    return missionsWithDates.filter((m: any) => new Date(m.updatedAt).toDateString() === date.toDateString());
  };

  const getDayEvents = (day: number, month: number = calendarMonth, year: number = calendarYear) => {
    const date = new Date(year, month, day);
    return calendarEvents.filter((e: any) => {
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : start;
      return date >= new Date(start.toDateString()) && date <= new Date(end.toDateString());
    });
  };

  const isToday = (day: number, month: number = calendarMonth, year: number = calendarYear) => {
    const now = new Date();
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const selectedEvents = selectedCalendarDate
    ? getDayEvents(selectedCalendarDate.getDate(), selectedCalendarDate.getMonth(), selectedCalendarDate.getFullYear())
    : [];

  const eventTypeConfig: Record<string, { label: string; defaultColor: string }> = {
    TIME_OFF: { label: 'Période off', defaultColor: '#EF4444' },
    EXTERNAL_MISSION: { label: 'Mission externe', defaultColor: '#3B82F6' },
    REMINDER: { label: 'Rappel', defaultColor: '#F59E0B' },
  };

  const selectedMissions = selectedCalendarDate
    ? getDayMissions(selectedCalendarDate.getDate(), selectedCalendarDate.getMonth(), selectedCalendarDate.getFullYear())
    : [];

  // Get upcoming deadlines (missions with deadline dates sorted by closest first)
  const upcomingDeadlines = missionsWithDates
    .filter((m: any) => {
      // For now, use updatedAt as a proxy for deadline, or you can add a deadline field later
      const deadlineDate = new Date(m.updatedAt);
      return deadlineDate >= new Date() && m.projectStatus !== 'COMPLETED';
    })
    .sort((a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    .slice(0, 5);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    NOT_STARTED: { label: 'À démarrer', color: 'text-gray-600', bg: 'bg-gray-100' },
    IN_PROGRESS: { label: 'En cours', color: 'text-blue-600', bg: 'bg-blue-100' },
    REVIEW: { label: 'En revue', color: 'text-amber-600', bg: 'bg-amber-100' },
    COMPLETED: { label: 'Terminé', color: 'text-green-600', bg: 'bg-green-100' },
  };

  // Calculate monthly stats
  const monthEvents = calendarEvents.filter((e: any) => {
    const start = new Date(e.startDate);
    return start.getMonth() === calendarMonth && start.getFullYear() === calendarYear;
  });
  const timeOffDays = monthEvents.filter((e: any) => e.type === 'TIME_OFF').reduce((acc: number, e: any) => {
    const start = new Date(e.startDate);
    const end = e.endDate ? new Date(e.endDate) : start;
    return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);
  const externalMissions = monthEvents.filter((e: any) => e.type === 'EXTERNAL_MISSION');
  const externalRevenue = externalMissions.reduce((acc: number, e: any) => acc + (parseFloat(e.budget) || 0), 0);
  const junyMissions = missionsWithDates.filter((m: any) => {
    const date = new Date(m.updatedAt);
    return date.getMonth() === calendarMonth && date.getFullYear() === calendarYear;
  });
  const workingDays = getDaysInMonth(calendarMonth, calendarYear) - timeOffDays;

  return (
    <div
      ref={calendarAnimation.ref}
      className={`flex gap-4 transition-all duration-700 ${
        calendarAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Left column - Calendar + Monthly Overview */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Calendar section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (calendarView === 'month') {
                    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
                    else { setCalendarMonth(calendarMonth - 1); }
                  } else {
                    setCalendarYear(calendarYear - 1);
                  }
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCalendarView(calendarView === 'month' ? 'year' : 'month')}
                className="px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors font-semibold text-gray-900"
              >
                {calendarView === 'month' ? `${monthNamesFull[calendarMonth]} ${calendarYear}` : calendarYear}
              </button>
              <button
                onClick={() => {
                  if (calendarView === 'month') {
                    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
                    else { setCalendarMonth(calendarMonth + 1); }
                  } else {
                    setCalendarYear(calendarYear + 1);
                  }
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${calendarView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setCalendarView('year')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${calendarView === 'year' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Année
                </button>
              </div>
              <button
                onClick={() => openEventModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter
              </button>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="flex-1 p-4 overflow-auto">
            {calendarView === 'month' ? (
              <>
                {/* Day names */}
                <div className="grid grid-cols-7 mb-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => (
                    <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                    <div key={`e-${i}`} className="h-12"></div>
                  ))}
                  {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                    const day = i + 1;
                    const dayMissions = getDayMissions(day);
                    const hasMissions = dayMissions.length > 0;
                    const dayEvents = getDayEvents(day);
                    const hasEvents = dayEvents.length > 0;
                    const hasTimeOff = dayEvents.some((e: any) => e.type === 'TIME_OFF');
                    const hasExternalMission = dayEvents.some((e: any) => e.type === 'EXTERNAL_MISSION');
                    const isTodayDay = isToday(day);
                    const isSelected = selectedCalendarDate?.getDate() === day && selectedCalendarDate?.getMonth() === calendarMonth && selectedCalendarDate?.getFullYear() === calendarYear;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedCalendarDate(new Date(calendarYear, calendarMonth, day))}
                        className={`h-12 w-full rounded-lg text-sm font-medium transition-all relative flex flex-col items-center justify-start pt-1 ${
                          isSelected ? 'bg-purple-600 text-white shadow-md' :
                          hasTimeOff ? 'bg-red-50 text-red-600 border border-red-200' :
                          isTodayDay ? 'bg-purple-100 text-purple-700 font-bold border-2 border-purple-300' :
                          'hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
                        }`}
                      >
                        <span>{day}</span>
                        {(hasMissions || hasEvents) && (
                          <div className="flex gap-0.5 mt-0.5">
                            {hasMissions && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-purple-500'}`}></span>}
                            {hasExternalMission && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-blue-500'}`}></span>}
                            {hasTimeOff && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Year view - 12 mini months */
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, monthIdx) => {
                  const daysCount = getDaysInMonth(monthIdx, calendarYear);
                  const firstDay = getFirstDayOfMonth(monthIdx, calendarYear);
                  const isCurrentMonth = monthIdx === new Date().getMonth() && calendarYear === new Date().getFullYear();
                  return (
                    <button
                      key={monthIdx}
                      onClick={() => { setCalendarMonth(monthIdx); setCalendarView('month'); }}
                      className={`p-2 rounded-xl border transition-all hover:shadow-md ${isCurrentMonth ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}
                    >
                      <div className={`text-xs font-semibold mb-1.5 ${isCurrentMonth ? 'text-purple-700' : 'text-gray-700'}`}>
                        {monthNames[monthIdx]}
                      </div>
                      <div className="grid grid-cols-7 gap-px">
                        {Array.from({ length: firstDay }).map((_, i) => (
                          <div key={`e-${i}`} className="w-3 h-3"></div>
                        ))}
                        {Array.from({ length: daysCount }).map((_, i) => {
                          const day = i + 1;
                          const isTodayDay = isToday(day, monthIdx, calendarYear);
                          const hasMissions = getDayMissions(day, monthIdx, calendarYear).length > 0;
                          const dayEvts = getDayEvents(day, monthIdx, calendarYear);
                          const hasTimeOff = dayEvts.some((e: any) => e.type === 'TIME_OFF');
                          const hasEvents = dayEvts.length > 0;
                          return (
                            <div
                              key={day}
                              className={`w-3 h-3 rounded-sm text-[6px] flex items-center justify-center ${
                                isTodayDay ? 'bg-purple-600 text-white font-bold' :
                                hasTimeOff ? 'bg-red-200' :
                                hasMissions ? 'bg-purple-200 text-purple-700' :
                                hasEvents ? 'bg-blue-200' :
                                'text-gray-400'
                              }`}
                            >
                              {isTodayDay || hasMissions || hasEvents ? '' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick stats footer */}
          <div className="px-3 py-2 border-t border-gray-100 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="text-xs text-gray-500">{missionsWithDates.filter((m: any) => m.projectStatus === 'IN_PROGRESS').length} missions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-500">{calendarEvents.filter((e: any) => e.type === 'TIME_OFF').length} off</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-xs text-gray-500">{calendarEvents.filter((e: any) => e.type === 'EXTERNAL_MISSION').length} externes</span>
            </div>
          </div>
        </div>

        {/* Monthly Overview Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Aperçu de {monthNamesFull[calendarMonth]}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Working Days */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Jours dispo</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{workingDays}</p>
              <p className="text-[10px] text-gray-400">sur {getDaysInMonth(calendarMonth, calendarYear)} jours</p>
            </div>

            {/* Time Off */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Jours off</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{timeOffDays}</p>
              <p className="text-[10px] text-gray-400">{monthEvents.filter((e: any) => e.type === 'TIME_OFF').length} période(s)</p>
            </div>

            {/* JUNY Missions */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">JUNY</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{junyMissions.length}</p>
              <p className="text-[10px] text-gray-400">mission(s) active(s)</p>
            </div>

            {/* External Revenue */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Externe</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{externalRevenue > 0 ? `${externalRevenue.toLocaleString()}€` : '—'}</p>
              <p className="text-[10px] text-gray-400">{externalMissions.length} mission(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Deadlines + Selected day */}
      <div className="w-80 flex flex-col gap-3">
        {/* Upcoming Deadlines Section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-gray-900 text-sm">Prochaines échéances</h3>
          </div>
          <div className="p-3">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs">Aucune échéance à venir</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((mission: any) => {
                  const deadlineDate = new Date(mission.updatedAt);
                  const daysUntil = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntil <= 3;
                  const status = statusConfig[mission.projectStatus] || statusConfig.NOT_STARTED;
                  return (
                    <div
                      key={mission.id}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer hover:shadow-sm ${
                        isUrgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedCalendarDate(deadlineDate);
                        setCalendarMonth(deadlineDate.getMonth());
                        setCalendarYear(deadlineDate.getFullYear());
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {mission.conversation?.projectTitle || 'Mission'}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{mission.conversation?.creator?.companyName}</p>
                        </div>
                        <div className={`text-right flex-shrink-0 ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                          <p className="text-xs font-bold">{daysUntil === 0 ? "Aujourd'hui" : daysUntil === 1 ? 'Demain' : `${daysUntil}j`}</p>
                          <p className="text-[10px]">{deadlineDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${status.bg.replace('bg-', 'bg-').replace('100', '500')}`}></span>
                        <span className={`text-[10px] ${status.color}`}>{status.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Day Section */}
        <div className={`flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col transition-all ${selectedCalendarDate ? 'opacity-100' : 'opacity-50'}`}>
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">
                {selectedCalendarDate ? selectedCalendarDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sélectionnez un jour'}
              </h3>
              <div className="flex items-center gap-1">
                {selectedCalendarDate && (
                  <>
                    <button
                      onClick={() => openEventModal(selectedCalendarDate)}
                      className="p-1 hover:bg-purple-100 rounded transition-colors text-purple-600"
                      title="Ajouter un événement"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button onClick={() => setSelectedCalendarDate(null)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {!selectedCalendarDate ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">Cliquez sur un jour</p>
              </div>
            ) : (selectedMissions.length === 0 && selectedEvents.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-xs">Rien ce jour</p>
                <button
                  onClick={() => openEventModal(selectedCalendarDate)}
                  className="mt-2 text-[10px] text-purple-600 hover:text-purple-700 font-medium"
                >
                  + Ajouter un événement
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Events */}
                {selectedEvents.map((event: any) => {
                  const typeConf = eventTypeConfig[event.type] || eventTypeConfig.REMINDER;
                  return (
                    <div
                      key={event.id}
                      className="p-2.5 rounded-xl border transition-colors group"
                      style={{ backgroundColor: `${event.color || typeConf.defaultColor}15`, borderColor: `${event.color || typeConf.defaultColor}40` }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${event.color || typeConf.defaultColor}30` }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color || typeConf.defaultColor }}></div>
                          </div>
                          <h4 className="font-medium text-gray-900 text-xs leading-tight">{event.title}</h4>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEventModal(undefined, event)}
                            className="p-0.5 hover:bg-white/50 rounded text-gray-500 hover:text-gray-700"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-0.5 hover:bg-white/50 rounded text-gray-500 hover:text-red-600"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500">{typeConf.label}</p>
                      {event.type === 'EXTERNAL_MISSION' && event.clientName && (
                        <p className="text-[10px] text-gray-600 mt-0.5">Client: {event.clientName}</p>
                      )}
                      {event.description && (
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  );
                })}
                {/* Missions */}
                {selectedMissions.map((mission: any) => {
                  const status = statusConfig[mission.projectStatus] || statusConfig.NOT_STARTED;
                  return (
                    <div key={mission.id} className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                          </div>
                          <h4 className="font-medium text-gray-900 text-xs leading-tight">
                            {mission.conversation?.projectTitle || 'Mission'}
                          </h4>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium flex-shrink-0 ${status.color} ${status.bg}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-1.5">{mission.conversation?.creator?.companyName}</p>
                      <button
                        onClick={() => setActiveTab('missions')}
                        className="text-[10px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-0.5"
                      >
                        Voir les détails
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showEventModal && (
        <CalendarModal
          editingEvent={editingEvent}
          eventForm={eventForm}
          setEventForm={setEventForm}
          loading={loading}
          onSubmit={handleCreateEvent}
          onClose={resetEventForm}
        />
      )}
    </div>
  );
}

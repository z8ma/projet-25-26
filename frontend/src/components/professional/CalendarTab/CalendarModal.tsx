import React from 'react';
import { createPortal } from 'react-dom';

interface CalendarModalProps {
  editingEvent: any;
  eventForm: any;
  setEventForm: (form: any) => void;
  loading: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function CalendarModal({
  editingEvent,
  eventForm,
  setEventForm,
  loading,
  onSubmit,
  onClose,
}: CalendarModalProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 250);
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-400 ease-out ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        {/* Header with gradient */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white rounded-full" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h3>
              <p className="text-purple-200 text-sm mt-1">
                {editingEvent ? 'Mettez à jour les détails' : 'Planifiez votre disponibilité'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-8 space-y-6">

            {/* Event Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Type d'événement</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'TIME_OFF', label: 'Période off', color: '#EF4444', iconPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
                  { type: 'EXTERNAL_MISSION', label: 'Mission externe', color: '#3B82F6', iconPath: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { type: 'REMINDER', label: 'Rappel', color: '#F59E0B', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => setEventForm((prev: any) => ({ ...prev, type: opt.type as any, color: opt.color }))}
                    className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center ${
                      eventForm.type === opt.type
                        ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-500/10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5" style={{ backgroundColor: `${opt.color}15` }}>
                      <svg className="w-5 h-5" style={{ color: opt.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.iconPath} />
                      </svg>
                    </div>
                    <div className="text-xs font-medium text-gray-700">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Titre</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm((prev: any) => ({ ...prev, title: e.target.value }))}
                placeholder={
                  eventForm.type === 'TIME_OFF'
                    ? 'Ex: Vacances, Indisponible...'
                    : eventForm.type === 'EXTERNAL_MISSION'
                    ? 'Ex: Projet logo Nike'
                    : 'Ex: Relancer client'
                }
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Date début</label>
                <input
                  type="date"
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm((prev: any) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Date fin (optionnel)</label>
                <input
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm((prev: any) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900"
                />
              </div>
            </div>

            {/* External Mission specific fields */}
            {eventForm.type === 'EXTERNAL_MISSION' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Client</label>
                  <input
                    type="text"
                    value={eventForm.clientName}
                    onChange={(e) => setEventForm((prev: any) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Nom du client"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Budget (€)</label>
                  <input
                    type="number"
                    value={eventForm.budget}
                    onChange={(e) => setEventForm((prev: any) => ({ ...prev, budget: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Description (optionnel)</label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm((prev: any) => ({ ...prev, description: e.target.value }))}
                placeholder="Notes additionnelles..."
                rows={2}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Couleur</label>
              <div className="flex gap-2.5">
                {['#8B5CF6', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setEventForm((prev: any) => ({ ...prev, color }))}
                    className={`w-9 h-9 rounded-full transition-all ${
                      eventForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex gap-3 bg-gray-50/50">
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-white hover:border-gray-300 hover:text-gray-800 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={!eventForm.title || !eventForm.startDate || loading}
            className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {editingEvent ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

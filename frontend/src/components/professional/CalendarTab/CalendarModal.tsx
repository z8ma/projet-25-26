import React from 'react';

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
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'événement</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'TIME_OFF', label: 'Période off', icon: '🏖️', color: '#EF4444' },
                { type: 'EXTERNAL_MISSION', label: 'Mission externe', icon: '💼', color: '#3B82F6' },
                { type: 'REMINDER', label: 'Rappel', icon: '⏰', color: '#F59E0B' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setEventForm((prev: any) => ({ ...prev, type: opt.type as any, color: opt.color }))}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    eventForm.type === opt.type
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                type="date"
                value={eventForm.startDate}
                onChange={(e) => setEventForm((prev: any) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin (optionnel)</label>
              <input
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm((prev: any) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* External Mission specific fields */}
          {eventForm.type === 'EXTERNAL_MISSION' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <input
                  type="text"
                  value={eventForm.clientName}
                  onChange={(e) => setEventForm((prev: any) => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nom du client"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
                <input
                  type="number"
                  value={eventForm.budget}
                  onChange={(e) => setEventForm((prev: any) => ({ ...prev, budget: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm((prev: any) => ({ ...prev, description: e.target.value }))}
              placeholder="Notes additionnelles..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
            <div className="flex gap-2">
              {['#8B5CF6', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6'].map((color) => (
                <button
                  key={color}
                  onClick={() => setEventForm((prev: any) => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    eventForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={!eventForm.title || !eventForm.startDate || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {editingEvent ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

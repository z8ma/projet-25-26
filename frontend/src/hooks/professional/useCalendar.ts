import { useState } from 'react';
import { calendarApi } from '../../services/api';

interface EventForm {
  type: 'TIME_OFF' | 'EXTERNAL_MISSION' | 'REMINDER';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  color: string;
  clientName: string;
  budget: string;
}

const initialEventForm: EventForm = {
  type: 'TIME_OFF',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  isAllDay: true,
  color: '#8B5CF6',
  clientName: '',
  budget: '',
};

export function useCalendar() {
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month');
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState<EventForm>(initialEventForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCalendarEvents = async () => {
    try {
      const response = await calendarApi.getEvents();
      if (response.success) {
        setCalendarEvents(response.data || []);
      }
    } catch (err: any) {
      console.error('Error loading calendar events:', err);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      const data: any = {
        type: eventForm.type,
        title: eventForm.title,
        startDate: eventForm.startDate,
        isAllDay: eventForm.isAllDay,
        color: eventForm.color,
      };
      if (eventForm.description) data.description = eventForm.description;
      if (eventForm.endDate) data.endDate = eventForm.endDate;
      if (eventForm.type === 'EXTERNAL_MISSION') {
        if (eventForm.clientName) data.clientName = eventForm.clientName;
        if (eventForm.budget) data.budget = parseFloat(eventForm.budget);
      }

      if (editingEvent) {
        await calendarApi.updateEvent(editingEvent.id, data);
      } else {
        await calendarApi.createEvent(data);
      }
      await loadCalendarEvents();
      setShowEventModal(false);
      resetEventForm();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try {
      await calendarApi.deleteEvent(eventId);
      await loadCalendarEvents();
    } catch (err: any) {
      console.error('Error deleting event:', err);
    }
  };

  const resetEventForm = () => {
    setEventForm(initialEventForm);
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const openEventModal = (date?: Date, event?: any) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        type: event.type,
        title: event.title,
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        isAllDay: event.isAllDay ?? true,
        color: event.color || '#8B5CF6',
        clientName: event.clientName || '',
        budget: event.budget ? String(event.budget) : '',
      });
    } else {
      resetEventForm();
      if (date) {
        setEventForm(prev => ({
          ...prev,
          startDate: date.toISOString().split('T')[0],
        }));
      }
    }
    setShowEventModal(true);
  };

  return {
    // State
    calendarMonth,
    setCalendarMonth,
    calendarYear,
    setCalendarYear,
    selectedCalendarDate,
    setSelectedCalendarDate,
    calendarView,
    setCalendarView,
    calendarEvents,
    setCalendarEvents,
    showEventModal,
    setShowEventModal,
    editingEvent,
    eventForm,
    setEventForm,
    loading,
    error,
    setError,

    // Functions
    loadCalendarEvents,
    handleCreateEvent,
    handleDeleteEvent,
    resetEventForm,
    openEventModal,
  };
}

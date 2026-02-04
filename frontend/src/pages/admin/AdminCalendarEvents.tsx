import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import type { CalendarEvent, Mission } from '@/types';
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
  utcToLocalDateInput,
  utcToLocalTimeInput,
  localToUtcDateAndTime,
} from '@/lib/dateUtils';

const EVENT_TYPE_OPTIONS = [
  { value: 'rocketry-competition', label: 'Rocketry Competition' },
  { value: 'robotics-competition', label: 'Robotics Competition' },
  { value: 'summer-camp-stem', label: 'Summer Camp (STEM)' },
  { value: 'community-outreach', label: 'Community Outreach' },
  { value: 'other', label: 'Other' },
] as const;

const eventTypeLabels: Record<string, string> = Object.fromEntries(
  EVENT_TYPE_OPTIONS.map((o) => [o.value, o.label])
);
const eventTypeColors: Record<string, string> = {
  'rocketry-competition': 'bg-red-100 text-red-800 border-red-300',
  'robotics-competition': 'bg-blue-100 text-blue-800 border-blue-300',
  'summer-camp-stem': 'bg-amber-100 text-amber-800 border-amber-300',
  'community-outreach': 'bg-green-100 text-green-800 border-green-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300',
};
const getTypeColor = (type: string) => eventTypeColors[type] ?? eventTypeColors.other;
const getTypeLabel = (type: string) => eventTypeLabels[type] ?? type;

export default function AdminCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await api.get<Mission[]>('/admin/missions');
      if (response.success && response.data) setMissions(response.data);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    let filtered = events;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filterType, searchTerm]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<CalendarEvent[]>('/admin/calendar-events');
      if (response.success && response.data) {
        setEvents(response.data);
        setFilteredEvents(response.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await api.delete(`/admin/calendar-events/${eventId}`);
      if (response.success) {
        toast.success('Event deleted successfully');
        fetchEvents();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const eventStatusColors = {
    upcoming: 'bg-green-100 text-green-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Calendar Event Management
          </h1>
          <p className="text-gray-600 mt-2">Manage mission calendar events</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Event
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input pl-10"
            >
              <option value="all">All Types</option>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No events found</p>
          <p className="text-gray-500 mt-2">Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((event) => (
            <div key={event.eventId} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(event.type)}`}>
                      {getTypeLabel(event.type)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventStatusColors[event.status]}`}>
                      {event.status}
                    </span>
                    {event.missionId && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        Mission: {missions.find(m => m.missionId === event.missionId)?.title ?? event.missionId}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      📅 {formatUtcToLocalDate(event.date, event.startTime)}
                    </span>
                    {event.startTime && (
                      <span>⏰ {formatUtcToLocalTime(event.date, event.startTime)}{event.endTime ? ` – ${formatUtcToLocalTime(event.date, event.endTime)}` : ''}</span>
                    )}
                    {event.location && (
                      <span>📍 {event.location}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.eventId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={editingEvent}
          onClose={() => {
            setShowModal(false);
            setEditingEvent(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingEvent(null);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}

// Event Modal Component
interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: () => void;
}

function EventModal({ event, onClose, onSave }: EventModalProps) {
  const utcDate = event?.date?.split('T')[0] ?? '';
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event ? utcToLocalDateInput(utcDate, event.startTime) : '',
    startTime: event && event.startTime ? utcToLocalTimeInput(utcDate, event.startTime) : '',
    endTime: event && event.endTime ? utcToLocalTimeInput(utcDate, event.endTime) : '',
    type: event?.type || 'other',
    status: event?.status || 'upcoming',
    location: event?.location || '',
    missionId: event?.missionId || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const d = event?.date?.split('T')[0] ?? '';
    setFormData({
      title: event?.title || '',
      description: event?.description || '',
      date: event ? utcToLocalDateInput(d, event.startTime) : '',
      startTime: event?.startTime ? utcToLocalTimeInput(d, event.startTime) : '',
      endTime: event?.endTime ? utcToLocalTimeInput(d, event.endTime) : '',
      type: event?.type || 'other',
      status: event?.status || 'upcoming',
      location: event?.location || '',
      missionId: event?.missionId || '',
    });
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { date, startTime, endTime } = localToUtcDateAndTime(
      formData.date,
      formData.startTime,
      formData.endTime || undefined
    );
    const payload = {
      ...formData,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      missionId: formData.missionId || undefined,
    };

    try {
      const response = event
        ? await api.put(`/admin/calendar-events/${event.eventId}`, payload)
        : await api.post('/admin/calendar-events', payload);

      if (response.success) {
        toast.success(event ? 'Event updated successfully' : 'Event created successfully');
        onSave();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input"
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="input"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex-1"
            >
              {isSaving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

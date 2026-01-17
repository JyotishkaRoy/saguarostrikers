import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  eventId: string;
  title: string;
  description: string;
  date: string;
  type: 'launch' | 'meeting' | 'competition' | 'deadline' | 'workshop' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function MissionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Start from Feb 2026 (where events are)
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      // In production, this would fetch events for the current month
      const response = await api.get<CalendarEvent[]>(`/public/calendar-events?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Sample events for demonstration
      setEvents([
        {
          eventId: '1',
          title: 'Launch Day',
          description: 'Test flight for new rocket design',
          date: '2026-01-15',
          type: 'launch',
          status: 'upcoming',
        },
        {
          eventId: '2',
          title: 'Team Meeting',
          description: 'Monthly progress review and planning session',
          date: '2026-01-20',
          type: 'meeting',
          status: 'upcoming',
        },
      ]);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  const eventTypeColors = {
    launch: 'bg-red-100 text-red-800 border-red-300',
    meeting: 'bg-blue-100 text-blue-800 border-blue-300',
    competition: 'bg-purple-100 text-purple-800 border-purple-300',
    deadline: 'bg-orange-100 text-orange-800 border-orange-300',
    workshop: 'bg-green-100 text-green-800 border-green-300',
    other: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Mission Calendar
          </h1>
          <p className="text-xl text-gray-600">
            Stay updated with upcoming launches, meetings, and important deadlines
          </p>
        </div>

        {/* Calendar */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-primary-600 text-white p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <h2 className="text-2xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center font-semibold text-gray-700 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-white">
              {/* Empty cells for days before the first of the month */}
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square border border-gray-200 bg-gray-50" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayEvents = getEventsForDate(day);
                const isToday = isCurrentMonth && day === today.getDate();

                return (
                  <div
                    key={day}
                    className={cn(
                      'aspect-square border border-gray-200 p-2 hover:bg-gray-50 transition-colors',
                      isToday && 'bg-primary-50'
                    )}
                  >
                    <div className={cn(
                      'text-sm font-semibold mb-1',
                      isToday ? 'text-primary-600' : 'text-gray-700'
                    )}>
                      {day}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <button
                          key={event.eventId}
                          onClick={() => setSelectedEvent(event)}
                          className={cn(
                            'w-full text-left text-xs px-2 py-1 rounded border truncate hover:shadow-sm transition-shadow',
                            eventTypeColors[event.type]
                          )}
                        >
                          {event.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Event Types</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-sm text-gray-700">Launch</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span className="text-sm text-gray-700">Meeting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
                <span className="text-sm text-gray-700">Competition</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                <span className="text-sm text-gray-700">Deadline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-sm text-gray-700">Workshop</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span className="text-sm text-gray-700">Other</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <span className={cn(
                  'inline-block px-3 py-1 rounded-full text-sm font-medium border',
                  eventTypeColors[selectedEvent.type]
                )}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-gray-900 font-medium">
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setSelectedEvent(null)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

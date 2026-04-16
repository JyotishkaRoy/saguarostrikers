import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { CalendarEvent, Mission } from '@/types';
import { formatUtcToLocalDate } from '@/lib/dateUtils';

interface Outreach {
  outreachId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
}

type CalendarItem =
  | { kind: 'event'; data: CalendarEvent }
  | { kind: 'mission'; data: Mission }
  | { kind: 'outreach'; data: Outreach };

function datePart(isoOrDate: string): string {
  return isoOrDate?.slice(0, 10) ?? '';
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthMenuRef = useRef<HTMLDivElement | null>(null);
  const yearMenuRef = useRef<HTMLDivElement | null>(null);
  const monthListRef = useRef<HTMLDivElement | null>(null);
  const yearListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [missionsRes, outreachesRes] = await Promise.all([
          api.get<Mission[]>('/public/missions'),
          api.get<Outreach[]>('/public/outreaches'),
        ]);
        if (missionsRes.success && missionsRes.data) setMissions(missionsRes.data);
        if (outreachesRes.success && outreachesRes.data) setOutreaches(outreachesRes.data);
      } catch {
        // non-blocking
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (monthMenuRef.current && !monthMenuRef.current.contains(target)) {
        setIsMonthOpen(false);
      }
      if (yearMenuRef.current && !yearMenuRef.current.contains(target)) {
        setIsYearOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!isYearOpen || !yearListRef.current) return;
    const selectedYearEl = yearListRef.current.querySelector<HTMLButtonElement>(
      `button[data-year="${currentDate.getFullYear()}"]`
    );
    selectedYearEl?.scrollIntoView({ block: 'center' });
  }, [isYearOpen, currentDate]);

  useEffect(() => {
    if (!isMonthOpen || !monthListRef.current) return;
    const selectedMonthEl = monthListRef.current.querySelector<HTMLButtonElement>(
      `button[data-month="${currentDate.getMonth()}"]`
    );
    selectedMonthEl?.scrollIntoView({ block: 'center' });
  }, [isMonthOpen, currentDate]);

  const fetchEvents = async () => {
    try {
      const response = await api.get<CalendarEvent[]>(`/public/calendar-events?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getItemsForDate = (day: number): CalendarItem[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const items: CalendarItem[] = [];
    events.filter(ev => datePart(ev.date) === dateStr).forEach(ev => items.push({ kind: 'event', data: ev }));
    missions.filter(m => dateStr >= datePart(m.startDate) && dateStr <= datePart(m.endDate)).forEach(m => items.push({ kind: 'mission', data: m }));
    outreaches.filter(o => dateStr >= datePart(o.startDate) && dateStr <= datePart(o.endDate)).forEach(o => items.push({ kind: 'outreach', data: o }));
    return items;
  };

  const getMissionTitle = (missionId: string | undefined) =>
    missionId ? missions.find(m => m.missionId === missionId)?.title : null;

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectMonth = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setIsMonthOpen(false);
  };

  const selectYear = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setIsYearOpen(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const years = Array.from({ length: 1000 }, (_, i) => 2000 + i);

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  const eventTypeColors: Record<string, string> = {
    'rocketry-competition': 'bg-red-100 text-red-800 border-red-300',
    'robotics-competition': 'bg-blue-100 text-blue-800 border-blue-300',
    'summer-camp-stem': 'bg-amber-100 text-amber-800 border-amber-300',
    'community-outreach': 'bg-green-100 text-green-800 border-green-300',
    other: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  const eventTypeLabels: Record<string, string> = {
    'rocketry-competition': 'Rocketry Competition',
    'robotics-competition': 'Robotics Competition',
    'summer-camp-stem': 'Summer Camp (STEM)',
    'community-outreach': 'Community Outreach',
    other: 'Other',
  };
  const getTypeColor = (type: string) => eventTypeColors[type] ?? eventTypeColors.other;
  const getTypeLabel = (type: string) => eventTypeLabels[type] ?? type;

  const itemColor = (item: CalendarItem) => {
    if (item.kind === 'event') return getTypeColor(item.data.type);
    if (item.kind === 'mission') return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300'; // outreach
  };

  const itemTitle = (item: CalendarItem) => item.data.title;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <CalendarIcon className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Calendar</h1>
          </div>
          <p className="text-lg text-gray-600">
            Stay updated with upcoming events, meetings, and important deadlines
          </p>
        </div>

        {/* Calendar + Legend */}
        <div className="flex gap-6 items-start justify-center max-w-6xl mx-auto flex-wrap lg:flex-nowrap">
          <div className="flex-1 min-w-0 w-full">
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
                
                <div className="flex items-center gap-2">
                  <div className="relative" ref={monthMenuRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMonthOpen((v) => !v);
                        setIsYearOpen(false);
                      }}
                      className="rounded-md px-2 py-1 text-2xl font-bold text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    >
                      {monthNames[currentDate.getMonth()]}
                    </button>
                    {isMonthOpen && (
                      <div
                        ref={monthListRef}
                        className="absolute left-0 top-full z-20 mt-2 max-h-64 w-44 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xl"
                      >
                        {monthNames.map((month, index) => (
                          <button
                            key={month}
                            data-month={index}
                            type="button"
                            onClick={() => selectMonth(index)}
                            className={cn(
                              'block w-full px-3 py-2 text-left text-sm hover:bg-gray-100',
                              index === currentDate.getMonth() ? 'bg-primary-50 font-semibold text-primary-700' : 'text-gray-800'
                            )}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-2xl font-bold text-white">-</span>

                  <div className="relative" ref={yearMenuRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsYearOpen((v) => !v);
                        setIsMonthOpen(false);
                      }}
                      className="rounded-md px-2 py-1 text-2xl font-bold text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    >
                      {currentDate.getFullYear()}
                    </button>
                    {isYearOpen && (
                      <div
                        ref={yearListRef}
                        className="absolute right-0 top-full z-20 mt-2 max-h-64 w-36 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xl"
                      >
                        {years.map((year) => (
                          <button
                            key={year}
                            data-year={year}
                            type="button"
                            onClick={() => selectYear(year)}
                            className={cn(
                              'block w-full px-3 py-2 text-left text-sm hover:bg-gray-100',
                              year === currentDate.getFullYear() ? 'bg-primary-50 font-semibold text-primary-700' : 'text-gray-800'
                            )}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
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
                const dayItems = getItemsForDate(day);
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
                      {getItemsForDate(day).map((item) => (
                        <button
                          key={item.kind === 'event' ? item.data.eventId : item.kind === 'mission' ? item.data.missionId : item.data.outreachId}
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            'w-full text-left text-xs px-2 py-1 rounded border hover:shadow-sm transition-shadow',
                            itemColor(item)
                          )}
                        >
                          <span className="block truncate">{itemTitle(item)}</span>
                          {item.kind === 'event' && item.data.missionId && getMissionTitle(item.data.missionId) && (
                            <span className="block truncate text-[10px] opacity-90 mt-0.5">
                              {getMissionTitle(item.data.missionId)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>

          {/* Legend - vertical, right of calendar */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex-shrink-0 w-full lg:w-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Event Types</h3>
            <div className="flex flex-col gap-3">
              {(['rocketry-competition', 'robotics-competition', 'summer-camp-stem', 'community-outreach', 'other'] as const).map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={cn('w-4 h-4 flex-shrink-0 rounded border', getTypeColor(type))} />
                  <span className="text-sm text-gray-700">{eventTypeLabels[type]}</span>
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 mt-4">Missions & Outreach</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex-shrink-0 rounded border bg-purple-100 border-purple-300" />
                <span className="text-sm text-gray-700">Mission</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex-shrink-0 rounded border bg-emerald-100 border-emerald-300" />
                <span className="text-sm text-gray-700">Outreach Event</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal: Event, Mission, or Outreach */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedItem.data.title}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedItem.kind === 'event' && (
                <>
                  <div className="mb-4">
                    <span className={cn(
                      'inline-block px-3 py-1 rounded-full text-sm font-medium border',
                      getTypeColor(selectedItem.data.type)
                    )}>
                      {getTypeLabel(selectedItem.data.type)}
                    </span>
                  </div>
                  {selectedItem.data.missionId && getMissionTitle(selectedItem.data.missionId) && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Mission</p>
                      <Link
                        to={`/missions/${missions.find(m => m.missionId === selectedItem.data.missionId)?.slug}`}
                        className="text-primary-600 font-medium hover:underline"
                      >
                        {getMissionTitle(selectedItem.data.missionId)}
                      </Link>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="text-gray-900 font-medium">
                      {formatUtcToLocalDate(selectedItem.data.date, selectedItem.data.startTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900 leading-relaxed">
                      {selectedItem.data.description}
                    </p>
                  </div>
                </>
              )}

              {selectedItem.kind === 'mission' && (
                <>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium border bg-purple-100 text-purple-800 border-purple-300">
                      Mission
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Dates</p>
                    <p className="text-gray-900 font-medium">
                      {formatUtcToLocalDate(selectedItem.data.startDate)} – {formatUtcToLocalDate(selectedItem.data.endDate)}
                    </p>
                  </div>
                  {selectedItem.data.location && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="text-gray-900">{selectedItem.data.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900 leading-relaxed">
                      {selectedItem.data.description}
                    </p>
                  </div>
                </>
              )}

              {selectedItem.kind === 'outreach' && (
                <>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium border bg-emerald-100 text-emerald-800 border-emerald-300">
                      Outreach Event
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Dates</p>
                    <p className="text-gray-900 font-medium">
                      {formatUtcToLocalDate(selectedItem.data.startDate)} – {formatUtcToLocalDate(selectedItem.data.endDate)}
                    </p>
                  </div>
                  {selectedItem.data.location && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="text-gray-900">{selectedItem.data.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900 leading-relaxed">
                      {selectedItem.data.description}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 rounded-b-lg flex gap-2">
              {selectedItem.kind === 'mission' && (
                <Link
                  to={`/missions/${(selectedItem.data as Mission).slug}`}
                  className="btn-primary flex-1 text-center"
                >
                  View Mission
                </Link>
              )}
              {selectedItem.kind === 'outreach' && (
                <Link
                  to={`/outreach/${(selectedItem.data as Outreach).slug}`}
                  className="btn-primary flex-1 text-center"
                >
                  View Outreach
                </Link>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className={selectedItem.kind === 'event' ? 'btn-primary w-full' : 'btn-outline flex-1'}
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

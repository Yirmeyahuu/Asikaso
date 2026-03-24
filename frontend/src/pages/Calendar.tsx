import { useState, useEffect } from 'react';
import type { CalendarEvent, CalendarView, EventType, Task } from '../types';
import { api } from '../services/api';
import { CalendarSkeleton } from '../components/Skeleton';

const Calendar = () => {
  console.log('[Calendar] Component rendering');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasksWithDueDates, setTasksWithDueDates] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'task' | 'meeting' | 'event'>('event');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [eventError, setEventError] = useState<string | null>(null);
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [isWholeDay, setIsWholeDay] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentDate, view]);

  const fetchData = async () => {
    console.log('[Calendar] Fetching data...');
    try {
      setLoading(true);
      
      // Fetch all events without date filtering first (for debugging)
      // Then we'll filter on frontend
      const startDate = getStartDate();
      const endDate = getEndDate();
      console.log('[Calendar] Querying date range:', { startDate, endDate });
      
      // Fetch both events and tasks
      const [eventsRes, tasksRes] = await Promise.all([
        api.getEvents(), // Get all events
        api.getTasks()
      ]);
      
      console.log('[Calendar] Events response:', eventsRes);
      console.log('[Calendar] Events array:', eventsRes?.events);
      console.log('[Calendar] Tasks response:', tasksRes);
      console.log('[Calendar] Start date:', startDate);
      console.log('[Calendar] End date:', endDate);
      
      // Filter tasks that have due dates - handle Firestore Timestamps
      const tasksWithDates = (tasksRes?.tasks || []).filter(
        (task: Task) => {
          // Handle Firestore Timestamp or string
          if (!task.dueDate) return false;
          const parsed = parseDate(task.dueDate);
          return parsed !== null && !isNaN(parsed.getTime());
        }
      );
      
      setEvents(eventsRes?.events || []);
      setTasksWithDueDates(tasksWithDates);
    } catch (error) {
      console.error('[Calendar] Error fetching data:', error);
      setEvents([]);
      setTasksWithDueDates([]);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(currentDate);
    if (view === 'month') {
      date.setDate(1);
      date.setDate(date.getDate() - date.getDay());
    } else if (view === 'week') {
      date.setDate(date.getDate() - date.getDay());
    }
    return date.toISOString();
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    if (view === 'month') {
      date.setMonth(date.getMonth() + 1, 0);
      date.setDate(date.getDate() + (6 - date.getDay()));
    } else if (view === 'week') {
      date.setDate(date.getDate() + (6 - date.getDay()));
    }
    return date.toISOString();
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    // Add days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(d);
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getEventsForDay = (date: Date) => {
    if (!events || !Array.isArray(events)) return [];
    // Use local date string to avoid timezone issues
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    console.log('[Calendar] getEventsForDay:', dateStr, 'Total events:', events.length);
    
    const filtered = events.filter(event => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate).toLocaleDateString('en-CA');
      const matches = eventDate === dateStr;
      if (matches) {
        console.log('[Calendar] Event matches:', event.title, event.startDate, '->', eventDate);
      }
      return matches;
    });
    console.log('[Calendar] Filtered events for', dateStr, ':', filtered.length);
    return filtered;
  };

  // Helper to convert Firestore timestamp or string to Date
  const parseDate = (dateValue: unknown): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') return new Date(dateValue);
    // Handle Firestore Timestamp (has toDate method)
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
      return (dateValue as { toDate: () => Date }).toDate();
    }
    return null;
  };

  const getTasksForDay = (date: Date) => {
    if (!tasksWithDueDates || !Array.isArray(tasksWithDueDates)) return [];
    const dateStr = date.toLocaleDateString('en-CA');
    return tasksWithDueDates.filter(task => {
      const parsedDate = parseDate(task.dueDate);
      if (!parsedDate) return false;
      const taskDate = parsedDate.toLocaleDateString('en-CA');
      return taskDate === dateStr;
    });
  };

  const handleCreateEvent = async () => {
    console.log('[Calendar] Creating event with:', { newEventTitle, newEventType, newEventStartDate, newEventEndDate, newEventDescription, isWholeDay, startTime, endTime });
    
    // Check title
    if (!newEventTitle.trim()) {
      setEventError('Title is required');
      return;
    }
    
    // Check date (not datetime)
    if (!newEventStartDate) {
      setEventError('Start date is required');
      return;
    }
    
    // Build the full datetime
    let startDateTime: string;
    let endDateTime: string;
    
    if (isWholeDay) {
      // Whole day event - just use the date
      startDateTime = new Date(newEventStartDate).toISOString();
      // End date defaults to same day for whole day
      const endDate = newEventEndDate || newEventStartDate;
      endDateTime = new Date(endDate).toISOString();
    } else {
      // Specific time event
      if (!startTime) {
        setEventError('Start time is required when not whole day');
        return;
      }
      
      const startDateTimeObj = new Date(newEventStartDate);
      startDateTimeObj.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0, 0);
      startDateTime = startDateTimeObj.toISOString();
      
      if (endTime) {
        const endDateTimeObj = newEventEndDate ? new Date(newEventEndDate) : new Date(newEventStartDate);
        endDateTimeObj.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]), 0, 0);
        endDateTime = endDateTimeObj.toISOString();
      } else {
        // Default end time = start time + 1 hour
        const defaultEnd = new Date(startDateTimeObj);
        defaultEnd.setHours(defaultEnd.getHours() + 1);
        endDateTime = defaultEnd.toISOString();
      }
    }
    
    console.log('[Calendar] Final startDateTime:', startDateTime, 'endDateTime:', endDateTime);
    
    setIsEventSubmitting(true);
    setEventError(null);
    
    try {
      console.log('[Calendar] Calling api.createEvent...');
      const eventData = {
        title: newEventTitle,
        type: newEventType,
        startDate: startDateTime,
        endDate: endDateTime,
        description: newEventDescription,
        isWholeDay,
        status: 'pending' as const
      };
      console.log('[Calendar] Event data:', eventData);
      
      const response = await api.createEvent(eventData);
      console.log('[Calendar] API response:', response);
      
      // Reset form and close modal
      setNewEventTitle('');
      setNewEventType('event');
      setNewEventStartDate('');
      setNewEventEndDate('');
      setNewEventDescription('');
      setIsWholeDay(false);
      setStartTime('');
      setEndTime('');
      setShowModal(false);
      // Refresh events
      fetchData();
    } catch (error) {
      console.error('[Calendar] Error creating event:', error);
      setEventError(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'meeting':
        return 'bg-info/20 border-info text-info';
      case 'task':
        return 'bg-warning/20 border-warning text-warning';
      case 'event':
        return 'bg-success/20 border-success text-success';
      default:
        return 'bg-primary/20 border-primary text-primary';
    }
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-text-secondary p-2 bg-bg-tertiary">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const dayTasks = getTasksForDay(day);
          return (
            <div
              key={index}
              className={`min-h-[100px] p-1 border border-border cursor-pointer hover:bg-bg-tertiary transition-colors ${
                !isCurrentMonth(day) ? 'opacity-50' : ''
              } ${isToday(day) ? 'bg-primary-light' : ''}`}
              onClick={() => {
                setCurrentDate(day);
                setView('day');
              }}
            >
              <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-primary font-bold' : 'text-text-primary'}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded border-l-2 truncate bg-info/20 border-info text-info"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setShowModal(true);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayTasks.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded border-l-2 truncate bg-warning/20 border-warning text-warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could open task details modal in future
                    }}
                  >
                    📋 {task.title}
                  </div>
                ))}
                {(dayEvents.length + dayTasks.length) > 3 && (
                  <div className="text-xs text-text-muted">+{dayEvents.length + dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="grid grid-cols-8 gap-1">
        <div className="sticky top-0"></div>
        {days.map((day, index) => (
          <div key={index} className="text-center p-2 bg-bg-tertiary">
            <div className="text-xs text-text-secondary">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className={`text-lg font-bold ${isToday(day) ? 'text-primary' : 'text-text-primary'}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
        {hours.map(hour => (
          <div key={hour} className="contents">
            <div className="text-xs text-text-muted p-1 text-right border-r border-border">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            {days.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day).filter(event => {
                const eventDate = new Date(event.startDate);
                // Use local hours (toLocaleString gets local time)
                const eventHour = parseInt(eventDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit' }));
                return eventHour === hour;
              });
              return (
                <div
                  key={`${hour}-${dayIndex}`}
                  className="min-h-[50px] border border-border p-1"
                >
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded mb-1 ${getEventTypeColor(event.type)}`}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowModal(true);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDay(currentDate);
    
    return (
      <div className="space-y-2">
        <div className="text-center p-4 bg-bg-tertiary rounded-lg">
          <div className="text-lg font-bold text-text-primary">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className="text-3xl font-bold text-primary">{currentDate.getDate()}</div>
          <div className="text-text-secondary">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="space-y-1">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event => {
              const eventDate = new Date(event.startDate);
              // Use local hours
              const eventHour = parseInt(eventDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit' }));
              return eventHour === hour;
            });
            return (
              <div key={hour} className="flex gap-2">
                <div className="w-20 text-right text-sm text-text-muted py-2">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                <div className="flex-1 min-h-[50px] border border-border p-2 rounded">
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className={`p-2 rounded mb-2 ${getEventTypeColor(event.type)}`}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowModal(true);
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-sm opacity-80">{event.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">Calendar</h1>
          <p className="text-sm text-text-secondary hidden sm:block">Manage your schedule and events</p>
        </div>
        <button
          className="btn btn-primary text-sm"
          onClick={() => {
            setSelectedEvent(null);
            setShowModal(true);
          }}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Event</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={navigatePrev} className="btn btn-secondary p-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base sm:text-xl font-bold text-text-primary">{formatMonthYear()}</h2>
          <button onClick={navigateNext} className="btn btn-secondary p-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={goToToday} className="btn btn-secondary text-xs sm:text-sm">
            Today
          </button>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <button
            className={`btn text-xs sm:text-sm px-2 sm:px-3 ${view === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            className={`btn text-xs sm:text-sm px-2 sm:px-3 ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button
            className={`btn text-xs sm:text-sm px-2 sm:px-3 ${view === 'day' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('day')}
          >
            Day
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 rounded bg-info"></div>
          <span className="text-xs sm:text-sm text-text-secondary">Meeting</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 rounded bg-warning"></div>
          <span className="text-xs sm:text-sm text-text-secondary">Task</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 rounded bg-success"></div>
          <span className="text-xs sm:text-sm text-text-secondary">Event</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card p-2 sm:p-4 overflow-x-auto">
        {loading ? (
          <CalendarSkeleton view={view} />
        ) : (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </>
        )}
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-overlay">
          <div className="glass-modal-content p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary">
                {selectedEvent ? 'Event Details' : 'Create Event'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedEvent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                  <p className="text-text-primary font-medium">{selectedEvent.title}</p>
                </div>
                {selectedEvent.description && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <p className="text-text-primary">{selectedEvent.description}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                  <span className={`px-2 py-1 rounded text-xs ${getEventTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Date & Time</label>
                  <p className="text-text-primary">
                    {new Date(selectedEvent.startDate).toLocaleString()}
                    {selectedEvent.endDate && ` - ${new Date(selectedEvent.endDate).toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedEvent.status === 'completed' ? 'bg-success/20 text-success' :
                    selectedEvent.status === 'archived' ? 'bg-text-muted/20 text-text-muted' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>
                <div className="flex gap-2 pt-4">
                  {selectedEvent.status === 'pending' && (
                    <button className="glass-btn glass-btn-primary flex-1">
                      Mark Complete
                    </button>
                  )}
                  <button className="glass-btn flex-1">
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {eventError && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                    {eventError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Event Title</label>
                  <input 
                    type="text" 
                    className="glass-input w-full" 
                    placeholder="Enter event title" 
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Event Type</label>
                  <select 
                    className="glass-input w-full"
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as 'task' | 'meeting' | 'event')}
                  >
                    <option value="task">Task</option>
                    <option value="meeting">Meeting</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
                    <input 
                      type="date" 
                      className="glass-input w-full" 
                      value={newEventStartDate}
                      onChange={(e) => setNewEventStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
                    <input 
                      type="date" 
                      className="glass-input w-full"
                      value={newEventEndDate}
                      onChange={(e) => setNewEventEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Whole Day Toggle */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWholeDay}
                      onChange={(e) => setIsWholeDay(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary">All Day Event</span>
                  </label>
                </div>

                {/* Time Fields - only show when not whole day */}
                {!isWholeDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Start Time</label>
                      <input 
                        type="time" 
                        className="glass-input w-full" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">End Time</label>
                      <input 
                        type="time" 
                        className="glass-input w-full"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                  <textarea 
                    className="glass-input w-full h-24" 
                    placeholder="Enter description"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex gap-2 pt-4">
                  <button 
                    className="glass-btn glass-btn-primary flex-1"
                    onClick={handleCreateEvent}
                    disabled={isEventSubmitting}
                  >
                    {isEventSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Creating...
                      </span>
                    ) : 'Create Event'}
                  </button>
                  <button className="glass-btn flex-1" onClick={() => setShowModal(false)} disabled={isEventSubmitting}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;

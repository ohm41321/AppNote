'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CalendarEvent, ThaiHoliday } from '@/types';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Clock, X, Info, Lock } from 'lucide-react';

interface CalendarTabProps {
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void;
  searchQuery: string;
}

const EVENT_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Blue', value: '#3291ff' },
  { name: 'Green', value: '#50e3c2' },
  { name: 'Orange', value: '#f5a623' },
  { name: 'Red', value: '#e00' },
  { name: 'Purple', value: '#7928ca' }
];

interface CustomTimePickerProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  fallbackValue: string;
}

function CustomTimePicker({ value, onChange, label, fallbackValue }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract hour and minute from value (e.g. '09:00' -> hour '09', minute '00')
  const [hour, minute] = useMemo(() => {
    const timeToUse = value || fallbackValue;
    const parts = timeToUse.split(':');
    return [parts[0] || '09', parts[1] || '00'];
  }, [value, fallbackValue]);

  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const selectHour = (h: string) => {
    onChange(`${h}:${minute}`);
  };

  const selectMinute = (m: string) => {
    onChange(`${hour}:${m}`);
  };

  const quickTimes = [
    { label: 'Morning', value: '09:00' },
    { label: 'Noon', value: '12:00' },
    { label: 'Afternoon', value: '14:00' },
    { label: 'Evening', value: '18:00' }
  ];

  return (
    <div className="form-group" style={{ position: 'relative', width: '100%' }}>
      <label>{label}</label>
      <button
        type="button"
        className="form-input"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', cursor: 'pointer', width: '100%', justifyContent: 'space-between', height: '38px', marginBottom: isOpen ? '8px' : '0' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={13} style={{ color: 'var(--fg-secondary)' }} />
          <span style={{ fontWeight: 600 }}>{value || 'Not Set'}</span>
        </span>
      </button>

      {isOpen && (
        <div
          className="card animate-slide-up"
          style={{
            position: 'relative',
            width: '100%',
            padding: '12px',
            boxShadow: 'none',
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '8px'
          }}
        >
            {/* Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--fg-tertiary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-primary)', paddingBottom: '4px' }}>
              <span>Hour</span>
              <span>Minute</span>
            </div>

            {/* List containers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', height: '120px' }}>
              {/* Hours Column */}
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '2px' }}>
                {hoursList.map(h => (
                  <button
                    key={h}
                    type="button"
                    style={{
                      padding: '4px 6px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      backgroundColor: h === hour && value ? 'var(--fg-primary)' : 'transparent',
                      color: h === hour && value ? 'var(--bg-primary)' : 'var(--fg-primary)',
                      transition: 'all 0.1s'
                    }}
                    onClick={() => {
                      selectHour(h);
                      if (!value) onChange(`${h}:${minute}`);
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>

              {/* Minutes Column */}
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '2px' }}>
                {minutesList.map(m => (
                  <button
                    key={m}
                    type="button"
                    style={{
                      padding: '4px 6px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      backgroundColor: m === minute && value ? 'var(--fg-primary)' : 'transparent',
                      color: m === minute && value ? 'var(--bg-primary)' : 'var(--fg-primary)',
                      transition: 'all 0.1s'
                    }}
                    onClick={() => {
                      selectMinute(m);
                      if (!value) onChange(`${hour}:${m}`);
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Shortcuts */}
            <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '6px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
              {quickTimes.map(qt => (
                <button
                  key={qt.value}
                  type="button"
                  className="secondary-btn"
                  style={{ fontSize: '9px', padding: '3px 4px', justifyContent: 'center', height: '24px' }}
                  onClick={() => {
                    onChange(qt.value);
                    setIsOpen(false);
                  }}
                >
                  {qt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="primary-btn"
              style={{ fontSize: '10px', padding: '4px 8px', width: '100%', justifyContent: 'center', height: '26px' }}
              onClick={() => {
                if (!value) onChange(`${hour}:${minute}`);
                setIsOpen(false);
              }}
            >
              Confirm
            </button>
        </div>
      )}
    </div>
  );
}

export default function CalendarTab({ events, setEvents, searchQuery }: CalendarTabProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  
  // Thailand Holidays State
  const [holidays, setHolidays] = useState<ThaiHoliday[]>([]);
  const [showHolidays, setShowHolidays] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appnote-show-holidays');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [holidaysCache, setHolidaysCache] = useState<Record<number, ThaiHoliday[]>>({});

  const handleToggleHolidays = () => {
    const newVal = !showHolidays;
    setShowHolidays(newVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appnote-show-holidays', String(newVal));
    }
  };

  useEffect(() => {
    let active = true;
    const yearToFetch = currentMonth.getFullYear();
    
    if (holidaysCache[yearToFetch]) {
      setHolidays(holidaysCache[yearToFetch]);
      return;
    }

    const fetchHolidays = async () => {
      setIsLoadingHolidays(true);
      try {
        const response = await fetch(`https://thailandformats.com/api/v1/holidays/${yearToFetch}`);
        if (!response.ok) {
          throw new Error(`HTTP status: ${response.status}`);
        }
        const data = await response.json();
        if (active && data && Array.isArray(data.holidays)) {
          const list = data.holidays as ThaiHoliday[];
          setHolidaysCache(prev => ({ ...prev, [yearToFetch]: list }));
          setHolidays(list);
        }
      } catch (e) {
        console.error(`Failed to fetch Thai holidays for ${yearToFetch}:`, e);
      } finally {
        if (active) setIsLoadingHolidays(false);
      }
    };

    fetchHolidays();
    return () => {
      active = false;
    };
  }, [currentMonth.getFullYear()]);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('');

  // Months labels
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Convert Date object to YYYY-MM-DD string locally
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getShortHolidayTitle = (title: string) => {
    const t = title.trim();
    
    // Exact mapping for the cleanest, most premium look in calendar cells
    const mappings: Record<string, string> = {
      "New Year's Day": "New Year",
      "Special Public Holiday": "Special Holiday",
      "Makha Bucha Day": "Makha Bucha",
      "Chakri Memorial Day": "Chakri Day",
      "Songkran Festival": "Songkran",
      "National Labour Day": "Labour Day",
      "Coronation Day": "Coronation Day",
      "Visakha Bucha Day": "Visakha Bucha",
      "Substitution for Visakha Bucha Day": "Sub. Visakha Bucha",
      "H.M. Queen Suthida's Birthday": "Queen Suthida Bday",
      "Substitution for Buddhist Lent Day (Khao Phansa)": "Sub. Khao Phansa",
      "H.M. King Maha Vajiralongkorn's Birthday": "King Rama X Bday",
      "Asanha Bucha Day": "Asanha Bucha",
      "Buddhist Lent Day": "Khao Phansa",
      "H.M. Queen Sirikit The Queen Mother's Birthday / Mother's Day": "Mother's Day",
      "H.M. King Bhumibol Adulyadej The Great Memorial Day": "King Rama IX Memorial",
      "Chulalongkorn Memorial Day": "Chulalongkorn Day",
      "H.M. King Bhumibol Adulyadej's Birthday / National Day / Father's Day": "King Rama IX Bday",
      "Substitution for H.M. King Bhumibol Adulyadej's Birthday, National Day, and Father's Day": "Sub. King Rama IX Bday",
      "Constitution Day": "Constitution Day",
      "New Year's Eve": "New Year's Eve"
    };

    if (mappings[t]) return mappings[t];
    
    // Fallback heuristic shortening if not matched exactly
    let short = t;
    short = short.replace(/^Substitution for H\.M\. /i, 'Sub. ');
    short = short.replace(/^Substitution for /i, 'Sub. ');
    short = short.replace(/H\.M\. /g, '');
    short = short.replace(/Adulyadej's Birthday/g, 'Bday');
    short = short.replace(/'s Birthday/g, ' Bday');
    
    if (short.length > 20) {
      return short.substring(0, 18) + '...';
    }
    return short;
  };

  // Generate calendar days
  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of current month
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0: Sun, 1: Mon ...
    
    // Total days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Total days in previous month
    const totalDaysPrev = new Date(year, month, 0).getDate();
    
    const cells = [];
    
    // Trailing days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, totalDaysPrev - i);
      cells.push({
        date: d,
        isCurrentMonth: false,
        key: `prev-${totalDaysPrev - i}`
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      cells.push({
        date: d,
        isCurrentMonth: true,
        key: `curr-${i}`
      });
    }
    
    // Leading days from next month to make exactly 42 grid items (6 weeks)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        date: d,
        isCurrentMonth: false,
        key: `next-${i}`
      });
    }
    
    return cells;
  }, [currentMonth]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    const dateStr = formatDateString(selectedDate);
    return events
      .filter(event => event.date === dateStr)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [events, selectedDate]);

  // Selected date holidays
  const selectedDateHolidays = useMemo(() => {
    if (!showHolidays) return [];
    const dateStr = formatDateString(selectedDate);
    return holidays.filter(h => h.start_date <= dateStr && h.end_date >= dateStr);
  }, [holidays, selectedDate, showHolidays]);

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Add event handler
  const handleAddEvent = () => {
    if (!title.trim()) return;

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      date: formatDateString(selectedDate),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      color: color || undefined,
      createdAt: new Date().toISOString()
    };

    setEvents(prev => [...prev, newEvent]);
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setColor('');
  };

  // Delete event
  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to cancel this event?')) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  // Filter events for search
  const filteredEventsForSearch = useMemo(() => {
    if (!searchQuery) return events;
    return events.filter(e =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [events, searchQuery]);

  return (
    <div className="calendar-view animate-fade-in">
      <div className="calendar-header">
        <div className="calendar-title-nav">
          <h3 className="calendar-month-year">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="calendar-nav-buttons">
            <button className="calendar-nav-btn" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <button className="calendar-nav-btn" onClick={nextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button"
            className="secondary-btn calendar-header-btn"
            onClick={handleToggleHolidays}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 500,
              gap: '6px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: showHolidays ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
              borderColor: showHolidays ? '#f59e0b' : 'var(--border-primary)',
              color: showHolidays ? '#d97706' : 'var(--fg-secondary)',
              transition: 'all 0.2s ease',
              height: '36px'
            }}
          >
            <span style={{ fontSize: '14px' }}>🇹🇭</span>
            <span className="hide-mobile">Thai Holidays</span>
            <span className="show-mobile">Holidays</span>
            {isLoadingHolidays && (
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                border: '1.5px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginLeft: '4px'
              }} />
            )}
          </button>

          <button className="primary-btn calendar-header-btn" onClick={() => setIsModalOpen(true)} style={{ height: '36px' }}>
            <Plus size={16} /> 
            <span className="hide-mobile">Schedule Event</span>
            <span className="show-mobile">Schedule</span>
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        {/* Calendar Grid */}
        <div className="calendar-grid-container card" style={{ padding: 0 }}>
          <div className="calendar-days-header">
            {DAYS_SHORT.map(d => (
              <div key={d} className="calendar-day-label">
                {d}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarCells.map(({ date, isCurrentMonth, key }) => {
              const dateStr = formatDateString(date);
              const dayEvents = filteredEventsForSearch.filter(e => e.date === dateStr);
              const dayHolidays = showHolidays ? holidays.filter(h => h.start_date <= dateStr && h.end_date >= dateStr) : [];
              const totalItemsCount = dayHolidays.length + dayEvents.length;
              const cellIsSelected = formatDateString(selectedDate) === dateStr;

              return (
                <div
                  key={key}
                  className={`calendar-cell ${isCurrentMonth ? '' : 'other-month'} ${isToday(date) ? 'today' : ''}`}
                  style={cellIsSelected ? { border: '1.5px solid var(--fg-primary)' } : undefined}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="calendar-cell-date-num">{date.getDate()}</span>
                  
                  <div className="calendar-cell-events">
                    {/* Render Official Holidays */}
                    {dayHolidays.map(h => (
                      <div
                        key={h.slug}
                        className="calendar-mini-event"
                        style={{
                          borderLeftColor: '#d97706',
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          color: 'var(--fg-primary)',
                          fontWeight: 500,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          '--event-color': '#d97706'
                        } as React.CSSProperties}
                        title={`🇹🇭 ${h.title} (Official Holiday)`}
                      >
                        🇹🇭 {getShortHolidayTitle(h.title)}
                      </div>
                    ))}

                    {/* Render Personal Events */}
                    {dayEvents.slice(0, Math.max(0, 2 - dayHolidays.length)).map(e => (
                      <div
                        key={e.id}
                        className="calendar-mini-event"
                        style={{
                          borderLeftColor: e.color || undefined,
                          '--event-color': e.color || undefined
                        } as React.CSSProperties}
                        title={`${e.startTime || ''} ${e.title}`}
                      >
                        {e.startTime ? `${e.startTime} ` : ''}{e.title}
                      </div>
                    ))}

                    {totalItemsCount > 2 && (
                      <div className="calendar-mini-event" style={{ opacity: 0.6, fontSize: '8px', borderLeft: 'none', textAlign: 'center' }}>
                        +{totalItemsCount - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Day Details Panel */}
        <div className="calendar-sidebar">
          <div className="selected-day-header">
            <h4 className="selected-day-title">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </h4>
            <p className="selected-day-desc text-mono">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="sidebar-events-list">
            {selectedDateHolidays.length === 0 && selectedDateEvents.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', color: 'var(--fg-tertiary)', textAlign: 'center', gap: '8px' }}>
                <CalendarIcon size={28} strokeWidth={1.5} />
                <span style={{ fontSize: '12px' }}>No events scheduled</span>
              </div>
            ) : (
              <>
                {/* Render Official Thai Holidays */}
                {selectedDateHolidays.map(holiday => (
                  <div 
                    key={holiday.slug} 
                    className="sidebar-event-card"
                    style={{
                      borderLeft: '3px solid #d97706',
                      backgroundColor: 'rgba(245, 158, 11, 0.04)',
                      borderColor: 'rgba(245, 158, 11, 0.15)'
                    }}
                  >
                    <div className="sidebar-event-card-header">
                      <span className="sidebar-event-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        <span>🇹🇭</span>
                        <span>{holiday.title}</span>
                      </span>
                      <div 
                        style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Official Thai Holiday (Read Only)"
                      >
                        <Lock size={10} />
                        <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official</span>
                      </div>
                    </div>
                    
                    <div className="sidebar-event-time" style={{ color: '#b45309' }}>
                      <Info size={11} />
                      <span style={{ fontWeight: 600, fontSize: '10px' }}>
                        วันหยุดราชการไทย (Thai Public Holiday)
                      </span>
                    </div>

                    {holiday.details && (
                      <p className="sidebar-event-desc" style={{ fontSize: '11px', opacity: 0.95, lineHeight: 1.4 }}>
                        {holiday.details}
                      </p>
                    )}
                    
                    {holiday.alcohol_ban && (
                      <div style={{
                        marginTop: '4px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(220, 38, 38, 0.06)',
                        border: '1px dashed rgba(220, 38, 38, 0.2)',
                        color: '#dc2626',
                        fontSize: '9px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: 'fit-content'
                      }}>
                        🚫 ห้ามจำหน่ายเครื่องดื่มแอลกอฮอล์ (Alcohol sales banned)
                      </div>
                    )}
                  </div>
                ))}

                {/* Render Personal Events */}
                {selectedDateEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="sidebar-event-card"
                    style={event.color ? { borderLeft: `3px solid ${event.color}` } : undefined}
                  >
                    <div className="sidebar-event-card-header">
                      <span className="sidebar-event-title">{event.title}</span>
                      <button 
                        className="sidebar-event-delete"
                        onClick={() => handleDeleteEvent(event.id)}
                        title="Cancel Event"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    
                    {event.startTime && (
                      <div className="sidebar-event-time">
                        <Clock size={11} />
                        <span>
                          {event.startTime} {event.endTime ? ` - ${event.endTime}` : ''}
                        </span>
                      </div>
                    )}

                    {event.description && (
                      <p className="sidebar-event-desc">{event.description}</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          <button className="secondary-btn" onClick={() => setIsModalOpen(true)} style={{ width: '100%', justifyContent: 'center' }}>
            <Plus size={14} /> Add Event
          </button>
        </div>
      </div>

      {/* Schedule Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Event</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', marginBottom: '4px' }}>
                <Info size={14} style={{ color: 'var(--fg-secondary)' }} />
                <span className="text-mono" style={{ fontSize: '11px', color: 'var(--fg-secondary)' }}>
                  Scheduling for: {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="event-title">Title</label>
                <input
                  id="event-title"
                  type="text"
                  placeholder="Event name..."
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-desc">Description</label>
                <textarea
                  id="event-desc"
                  placeholder="Details, link, or notes..."
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <CustomTimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={setStartTime}
                  fallbackValue="09:00"
                />
                <CustomTimePicker
                  label="End Time"
                  value={endTime}
                  onChange={setEndTime}
                  fallbackValue="10:00"
                />
              </div>

              <div className="form-group">
                <label>Event Indicator Color</label>
                <div className="color-picker">
                  {EVENT_COLORS.map(c => (
                    <div
                      key={c.name}
                      className={`color-dot ${color === c.value ? 'selected' : ''}`}
                      style={{ backgroundColor: c.value || 'var(--border-secondary)', border: c.value ? 'none' : '1px solid var(--border-secondary)' }}
                      onClick={() => setColor(c.value)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleAddEvent}>
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Note, Task, CalendarEvent } from '@/types';
import NotesTab from '@/components/NotesTab';
import TasksTab from '@/components/TasksTab';
import CalendarTab from '@/components/CalendarTab';
import OnboardingGuide from '@/components/OnboardingGuide';
import {
  StickyNote,
  Calendar as CalendarIcon,
  CheckSquare,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Clock,
  Sparkles,
  ChevronRight,
  ClipboardList,
  Download,
  Upload
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'notes' | 'calendar' | 'tasks'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('appnote-theme', 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hasViewedGuide, setHasViewedGuide, isGuideViewedHydrated] = useLocalStorage<boolean>('appnote-guide-viewed', false);

  // Onboarding Guide Auto-open
  useEffect(() => {
    if (isGuideViewedHydrated && !hasViewedGuide) {
      setIsGuideOpen(true);
    }
  }, [isGuideViewedHydrated, hasViewedGuide]);

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    setHasViewedGuide(true);
  };
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Local Storage Data Hydration-Safe States
  const [notes, setNotes, isNotesHydrated] = useLocalStorage<Note[]>('appnote-notes', []);
  const [tasks, setTasks, isTasksHydrated] = useLocalStorage<Task[]>('appnote-tasks', []);
  const [events, setEvents, isEventsHydrated] = useLocalStorage<CalendarEvent[]>('appnote-events', []);

  // QoL Feature: Scratchpad LocalStorage persistence
  const [scratchpadText, setScratchpadText, isScratchpadHydrated] = useLocalStorage<string>('appnote-scratchpad', '');
  const [isScratchpadOpen, setIsScratchpadOpen] = useLocalStorage<boolean>('appnote-scratchpad-open', false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Synchronize CSS Theme Data-attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Dynamic Habit Routine Resetter Engine
  useEffect(() => {
    if (!isTasksHydrated) return;

    const checkAndResetHabits = () => {
      try {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-US'); // MM/DD/YYYY format
        const lastResetDate = window.localStorage.getItem('appnote-last-reset-date');

        if (lastResetDate !== todayStr) {
          setTasks(prev => {
            let wasUpdated = false;
            const updatedTasks = prev.map(task => {
              // Reset Daily Habits
              if (task.recurring === 'daily' && task.isCompleted) {
                wasUpdated = true;
                return { ...task, isCompleted: false };
              }

              // Reset Weekly Habits on Sundays
              const isSunday = now.getDay() === 0;
              if (task.recurring === 'weekly' && isSunday && task.isCompleted) {
                wasUpdated = true;
                return { ...task, isCompleted: false };
              }

              return task;
            });

            return wasUpdated ? updatedTasks : prev;
          });

          window.localStorage.setItem('appnote-last-reset-date', todayStr);
        }
      } catch (error) {
        console.warn('Error running habit reset engine:', error);
      }
    };

    checkAndResetHabits();
  }, [isTasksHydrated, setTasks]);

  // Designer Clock & Date effect
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Clock format (HH:MM:SS)
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));

      // Date format (Weekday, Mon DD, YYYY)
      setCurrentDateStr(now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard Shortcuts (Press '/' to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // QoL Convert Scratchpad drafts to notes
  const convertScratchpadToNote = () => {
    if (!scratchpadText.trim()) return;

    const lines = scratchpadText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const title = lines[0] || 'Draft Note';
    const content = scratchpadText;
    const now = new Date().toISOString();

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title.length > 50 ? `${title.slice(0, 50)}...` : title,
      content: content,
      tags: ['Drafts'],
      createdAt: now,
      updatedAt: now
    };

    setNotes(prev => [newNote, ...prev]);
    setScratchpadText('');
    setActiveTab('notes');
    setIsScratchpadOpen(false);
  };

  // QoL Convert Scratchpad lines to NLP parsed Tasks
  const convertScratchpadToTasks = () => {
    if (!scratchpadText.trim()) return;

    const lines = scratchpadText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const nowStr = new Date().toISOString();
    const newTasks: Task[] = lines.map(line => {
      // Create tasks using basic parsing, let the TasksTab NLP handle it or perform simple tag/priority extracts
      let taskTitle = line;
      let parsedPriority: 'low' | 'medium' | 'high' = 'medium';

      if (/#high|#ด่วน/i.test(line)) {
        parsedPriority = 'high';
        taskTitle = taskTitle.replace(/#high|#ด่วน/gi, '');
      } else if (/#low|#ชิลๆ/i.test(line)) {
        parsedPriority = 'low';
        taskTitle = taskTitle.replace(/#low|#ชิลๆ/gi, '');
      }

      return {
        id: crypto.randomUUID(),
        title: taskTitle.replace(/\s+/g, ' ').trim(),
        isCompleted: false,
        priority: parsedPriority,
        createdAt: nowStr
      };
    });

    setTasks(prev => [...newTasks, ...prev]);
    setScratchpadText('');
    setActiveTab('tasks');
    setIsScratchpadOpen(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    try {
      const keys = [
        'appnote-notes',
        'appnote-tasks',
        'appnote-events',
        'appnote-scratchpad',
        'appnote-scratchpad-open',
        'appnote-theme',
        'appnote-guide-viewed',
        'appnote-show-holidays',
        'appnote-last-reset-date'
      ];
      
      const backupData: Record<string, string | null> = {};
      keys.forEach(key => {
        backupData[key] = localStorage.getItem(key);
      });
      
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `lucianote-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        const expectedKeys = ['appnote-notes', 'appnote-tasks', 'appnote-events'];
        const hasValidKeys = expectedKeys.some(key => key in json);
        
        if (!hasValidKeys) {
          throw new Error('Invalid backup file structure.');
        }

        if (confirm('Importing data will overwrite your current notes, tasks, and calendar events. Do you want to proceed?')) {
          Object.keys(json).forEach(key => {
            if (key.startsWith('appnote-')) {
              const value = json[key];
              if (value !== null) {
                localStorage.setItem(key, value);
              }
            }
          });
          
          alert('Data imported successfully! The page will now reload.');
          window.location.reload();
        }
      } catch (error) {
        alert('Failed to import backup file. Make sure it is a valid LuciaNote JSON backup file.\nError: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  // Compute Active counts
  const activeTasksCount = tasks.filter(t => !t.isCompleted).length;
  const totalEventsCount = events.length;

  const isFullyHydrated = isNotesHydrated && isTasksHydrated && isEventsHydrated && isScratchpadHydrated;

  const renderContent = () => {
    if (!isFullyHydrated) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border-primary)', borderTopColor: 'var(--fg-primary)', animation: 'spin 0.8s linear infinite' }} />
          <span className="text-mono" style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>Hydrating dashboard data...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'notes':
        return <NotesTab notes={notes} setNotes={setNotes} searchQuery={searchQuery} />;
      case 'calendar':
        return <CalendarTab events={events} setEvents={setEvents} searchQuery={searchQuery} />;
      case 'tasks':
        return <TasksTab tasks={tasks} setTasks={setTasks} searchQuery={searchQuery} />;
      default:
        return null;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'notes':
        return 'Notes Board';
      case 'calendar':
        return 'Scheduler Calendar';
      case 'tasks':
        return 'Checklist Tasks';
      default:
        return 'AppNote';
    }
  };

  // Scratchpad word count helper
  const getScratchpadStats = () => {
    const text = scratchpadText.trim();
    if (!text) return { characters: 0, words: 0 };
    return {
      characters: text.length,
      words: text.split(/\s+/).filter(Boolean).length
    };
  };

  const scratchStats = getScratchpadStats();

  return (
    <div className="app-container">
      <OnboardingGuide isOpen={isGuideOpen} onClose={handleCloseGuide} />
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg
                viewBox="0 0 75 65"
                width="18"
                height="18"
                fill="currentColor"
              >
                <polygon points="37.5,0 75,65 0,65" />
              </svg>
              <span className="text-mono" style={{ fontWeight: 800 }}>LuciaNote</span>
            </div>
            <button className="menu-toggle-close" onClick={() => setIsSidebarOpen(false)} title="Close Menu">
              <X size={15} />
            </button>
          </div>

          {/* Cute Lucia Profile Mascot */}
          <div className="sidebar-profile" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0 8px 0',
            borderBottom: '1.5px solid var(--border-primary)',
            marginBottom: '16px',
            gap: '10px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '2px solid #50e3c2', // Gorgeous neon teal border
              padding: '2px',
              backgroundColor: 'var(--bg-secondary)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(80, 227, 194, 0.15)',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08) rotate(4deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              }}
            >
              <img
                src="/pic/lucia.png"
                alt="Lucia Mascot"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span className="text-mono" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--fg-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Lucia ✨
              </span>
              <span className="text-mono" style={{ fontSize: '9px', color: '#50e3c2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Note Assistant
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => { setActiveTab('notes'); setIsSidebarOpen(false); }}
            >
              <span className="nav-item-left">
                <StickyNote size={16} />
                <span>Notes</span>
              </span>
              <span className="nav-badge">{notes.length}</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => { setActiveTab('calendar'); setIsSidebarOpen(false); }}
            >
              <span className="nav-item-left">
                <CalendarIcon size={16} />
                <span>Calendar</span>
              </span>
              {totalEventsCount > 0 && <span className="nav-badge">{totalEventsCount}</span>}
            </button>

            <button
              className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tasks'); setIsSidebarOpen(false); }}
            >
              <span className="nav-item-left">
                <CheckSquare size={16} />
                <span>Tasks</span>
              </span>
              {activeTasksCount > 0 && (
                <span className="nav-badge" style={{ backgroundColor: 'var(--badge-high-bg)', color: 'var(--badge-high-fg)' }}>
                  {activeTasksCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="secondary-btn"
            style={{ width: '100%', fontSize: '11px', padding: '6px 0', justifyContent: 'center', height: '28px', gap: '6px', border: '1px solid var(--border-primary)' }}
            onClick={() => setIsGuideOpen(true)}
            title="Show Quick Onboarding Tour Guide"
          >
            <Sparkles size={11} style={{ color: '#50e3c2' }} />
            <span className="text-mono">Tour Guide</span>
          </button>

          {/* Backup & Restore Buttons */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
            <button
              type="button"
              className="secondary-btn"
              style={{ flex: 1, fontSize: '10px', padding: '6px 0', justifyContent: 'center', height: '28px', gap: '4px', border: '1px solid var(--border-primary)' }}
              onClick={handleExportData}
              title="Export all data as JSON backup"
            >
              <Download size={11} />
              <span className="text-mono">Export</span>
            </button>
            <button
              type="button"
              className="secondary-btn"
              style={{ flex: 1, fontSize: '10px', padding: '6px 0', justifyContent: 'center', height: '28px', gap: '4px', border: '1px solid var(--border-primary)' }}
              onClick={() => fileInputRef.current?.click()}
              title="Import data from JSON backup"
            >
              <Upload size={11} />
              <span className="text-mono">Import</span>
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportData}
            />
          </div>

          {/* Theme toggler */}
          <div className="theme-toggle-container">
            <button
              className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              title="Switch to Light Theme"
            >
              <Sun size={13} />
              <span>Light</span>
            </button>
            <button
              className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              title="Switch to Dark Theme"
            >
              <Moon size={13} />
              <span>Dark</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#50e3c2' }} />
            <span className="text-mono" style={{ fontSize: '10px', color: 'var(--fg-secondary)' }}>
              LOCALSTORAGE_MODE
            </span>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)', zIndex: 490 }}
        />
      )}

      {/* Backdrop overlay for Scratchpad drawer on mobile */}
      {isScratchpadOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsScratchpadOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)', zIndex: 400 }}
        />
      )}

      {/* Main Canvas Area */}
      <main className="canvas">
        <header className="header">
          <div className="header-title-container">
            <button
              className="menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle Menu"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1 className="header-title text-mono">
              <span>{getTabTitle()}</span>
            </h1>
          </div>

          <div className="header-meta">
            {/* Premium Designer Clock */}
            {currentTime && (
              <div
                className="text-mono card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: 'none'
                }}
              >
                <Clock size={11} style={{ color: 'var(--fg-secondary)' }} />
                <span style={{ color: 'var(--fg-secondary)', fontWeight: 600 }}>{currentDateStr.toUpperCase()}</span>
                <span style={{ width: '1px', height: '10px', backgroundColor: 'var(--border-primary)' }} />
                <span style={{ color: 'var(--fg-primary)', fontWeight: 700, letterSpacing: '0.05em' }}>{currentTime}</span>
              </div>
            )}

            {/* QoL Toggle Scratchpad Panel */}
            <button
              className={`secondary-btn ${isScratchpadOpen ? 'active' : ''}`}
              style={{ gap: '6px', height: '32px', padding: '0 12px', fontSize: '13px' }}
              onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
              title="Toggle Quick Scratchpad"
            >
              <Sparkles size={13} style={{ color: isScratchpadOpen ? '#50e3c2' : 'inherit' }} />
              <span className="text-mono">Scratchpad</span>
            </button>

            {/* Quick Search */}
            <div className="search-container">
              <Search size={14} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search everything..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="shortcut-badge">/</span>
            </div>
          </div>
        </header>

        {/* Workspace Split Layout with Collapsible Side Panel */}
        <div className="main-workspace-split">
          <div className="canvas-content-area">
            <div className="content-pane">
              {renderContent()}
            </div>
          </div>

          {/* Quick Scratchpad side drawer panel */}
          <aside className={`scratchpad-container ${isScratchpadOpen ? '' : 'collapsed'} ${isScratchpadOpen ? 'open-mobile' : ''}`}>
            <div className="scratchpad-header">
              <span className="scratchpad-header-title text-mono" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} style={{ color: '#50e3c2' }} />
                <span>Scratchpad Drafts</span>
              </span>
              <button
                className="modal-close"
                style={{ padding: '4px' }}
                onClick={() => setIsScratchpadOpen(false)}
                title="Collapse Panel"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="scratchpad-content">
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {scratchpadText.length === 0 && (
                  <div className="scratchpad-placeholder">
                    Scribble down your drafts here...
                    <br /><br />
                    E.g.
                    <br />
                    • Line 1: Idea A
                    <br />
                    • Line 2: Idea B
                    <br /><br />
                    Then convert them to notes or checklist tasks instantly!
                  </div>
                )}
                <textarea
                  className="scratchpad-textarea"
                  value={scratchpadText}
                  onChange={(e) => setScratchpadText(e.target.value)}
                />
              </div>
            </div>

            <div className="scratchpad-footer">
              <div className="scratchpad-stats text-mono">
                <span>{scratchStats.words} words</span>
                <span>{scratchStats.characters} chars</span>
              </div>
              <div className="scratchpad-actions">
                <button
                  className="secondary-btn"
                  style={{ width: '100%', fontSize: '11px', padding: '6px 0', justifyContent: 'center' }}
                  onClick={convertScratchpadToNote}
                  disabled={!scratchpadText.trim()}
                  title="Save this text block as a new Draft Note"
                >
                  <StickyNote size={12} /> Save to Note
                </button>
                <button
                  className="secondary-btn"
                  style={{ width: '100%', fontSize: '11px', padding: '6px 0', justifyContent: 'center' }}
                  onClick={convertScratchpadToTasks}
                  disabled={!scratchpadText.trim()}
                  title="Convert each line into a checklist Task"
                >
                  <ClipboardList size={12} /> Convert to Tasks
                </button>
              </div>
              <button
                className="secondary-btn"
                style={{ width: '100%', fontSize: '11px', padding: '6px 0', justifyContent: 'center', borderColor: 'transparent', color: 'var(--fg-tertiary)' }}
                onClick={() => setScratchpadText('')}
                disabled={!scratchpadText.trim()}
              >
                Clear Scratchpad
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

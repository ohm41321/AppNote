'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Note, Task, CalendarEvent, CustomSheet, SheetSection } from '@/types';
import NotesTab from '@/components/NotesTab';
import TasksTab from '@/components/TasksTab';
import CalendarTab from '@/components/CalendarTab';
import SheetsTab from '@/components/SheetsTab';
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
  BookOpen
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'notes' | 'calendar' | 'tasks' | 'sheets'>('notes');
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
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
  const [sheets, setSheets, isSheetsHydrated] = useLocalStorage<CustomSheet[]>('appnote-sheets', []);

  const [scratchpadText, setScratchpadText, isScratchpadHydrated] = useLocalStorage<string>('appnote-scratchpad', '');
  const [isScratchpadOpen, setIsScratchpadOpen] = useLocalStorage<boolean>('appnote-scratchpad-open', false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pre-load user's custom workout & diet plan if sheets is empty AND not yet initialized
  useEffect(() => {
    if (isSheetsHydrated) {
      const isInitialized = window.localStorage.getItem('appnote-sheets-initialized-v3');
      if (!isInitialized) {
        const now = new Date().toISOString();
        const defaultSheet: CustomSheet = {
          id: crypto.randomUUID(),
          title: 'ตารางออกกำลังกาย & ควบคุมอาหาร (3 เดือนแรก)',
          description: 'โปรแกรมและเป้าหมายการซ้อมเพื่อสุขภาพ คุมน้ำหนักจาก 85-87 กก. เหลือ 80-82 กก.',
          isPinned: true,
          sections: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              title: 'เป้าหมาย 3 เดือนแรก',
              content: 'น้ำหนักปัจจุบัน: 85-87 กก.\nส่วนสูง: 180 ซม.\nเป้าหมาย: 80-82 กก.\nลดประมาณ 0.5 กก./สัปดาห์\n\n* ไม่ต้องอดอาหาร ไม่ต้องวิ่งหนัก'
            },
            {
              id: crypto.randomUUID(),
              type: 'table',
              title: 'ตารางออกกำลังกายประจำสัปดาห์',
              headers: ['วัน', 'เวลา', 'โปรแกรม'],
              rows: [
                ['จันทร์', 'หลังเลิกงาน', 'ลู่วิ่ง 20-30 นาที'],
                ['อังคาร', 'พัก', 'เดินเล่นหลังอาหาร 10-15 นาที (ถ้าไหว)'],
                ['พุธ', 'หลังเลิกงาน', 'เวทดัมเบล 30-40 นาที'],
                ['พฤหัส', 'พัก', 'เดินเล่น 10-15 นาที'],
                ['ศุกร์', 'หลังเลิกงาน', 'ลู่วิ่ง 20-30 นาที'],
                ['เสาร์', 'เช้าหรือเย็น', 'เวทเต็มตัว 45-60 นาที'],
                ['อาทิตย์', 'เช้าหรือเย็น', 'ลู่วิ่ง 45-60 นาที']
              ]
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              title: 'โปรแกรมเวทวันพุธ (3 เซ็ตทุกท่า)',
              content: '• Goblet Squat — 12 ครั้ง\n• Dumbbell Row — 12 ครั้ง\n• Dumbbell Shoulder Press — 12 ครั้ง\n• Romanian Deadlift — 12 ครั้ง\n• Plank — 30-45 วินาที\n\n* พักระหว่างเซ็ต 60-90 วินาที'
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              title: 'โปรแกรมเวทวันเสาร์ (3-4 เซ็ตทุกท่า)',
              content: '• ขา: Goblet Squat × 12 / Lunge × 10 ต่อข้าง\n• หลัง: Dumbbell Row × 12\n• อก: Push-up × มากที่สุดที่ทำได้\n• ไหล่: Shoulder Press × 12\n• แขน: Bicep Curl × 12 / Tricep Extension × 12\n• ท้อง: Plank × 3 รอบ'
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              title: 'คู่มือลู่วิ่ง (วิ่ง/เดินเร็ว)',
              content: '• วันธรรมดา: เดินเร็ว/วิ่ง 20-30 นาที ความเร็ว 5-6 km/h, ความชัน 5-8%\n• วันอาทิตย์: เดินเร็ว/วิ่ง 45-60 นาที\n\n* ไม่จำเป็นต้องวิ่ง เดินเร็วพอก็ได้ผล'
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              title: 'แผนการรับประทานอาหาร',
              content: '**หลักการเลือกกินอาหารบ้าน (กินร่วมกับที่บ้านได้):**\n✅ เพิ่มโปรตีน\n✅ ลดข้าว\n❌ ลดน้ำหวาน\n\n**มื้อเช้า (เลือกอย่างใดอย่างหนึ่ง):**\n• ชุด A: ไข่ต้ม 2 ฟอง + กล้วย 1 ลูก + กาแฟดำ\n• ชุด B: ไข่ต้ม 2 ฟอง + ขนมปังโฮลวีต 2 แผ่น\n• ชุด C: นมโปรตีน 1 กล่อง (โปรตีน 25-30g) + กล้วย 1 ลูก\n\n**มื้อกลางวัน:**\n• กินตามปกติ: ข้าว 1-1.5 ทัพพี, เนื้อสัตว์ 2 ฝ่ามือ, ผักตามที่มี\n• หลีกเลี่ยง: การเติมข้าวเพิ่ม, น้ำหวานต่าง ๆ\n\n**มื้อเย็น:**\n• กินกับข้าวบ้านได้ปกติ เช่น แกงจืด, ต้ม, ผัดผัก, เมนูไก่ หรือปลา\n• หากเป็นของทอดหรือของมัน (หมูทอด, ไก่ทอด) ให้กินได้แต่ลดข้าวเหลือ 1 ทัพพี\n\n**ของว่างระหว่างวัน (กินเมื่อหิว):**\n• เลือกอย่างใดอย่างหนึ่ง: ไข่ต้ม 2 ฟอง, กล้วย 1 ลูก, นมโปรตีน 1 กล่อง, โยเกิร์ตน้ำตาลต่ำ\n\n**สิ่งที่ควรซื้อติดบ้าน:**\n• ไข่ (วันละ 2-4 ฟอง)\n• นมโปรตีน (เช่น Meiji High Protein, Dutch Mill หรือยี่ห้ออื่น)\n• กล้วย (กินง่ายก่อนทำงาน)'
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              title: 'เป้าหมายง่าย ๆ ที่ต้องทำทุกวัน',
              content: '✅ ได้รับโปรตีนอย่างน้อย 100 กรัม/วัน\n✅ ทานไข่ต้มให้ได้ 2-4 ฟอง/วัน\n✅ ดื่มน้ำ 2.5-3 ลิตร/วัน\n✅ เดินสะสมให้ได้ 7,000 - 10,000 ก้าว/วัน\n✅ เข้านอนก่อนเวลา 23:30 น.'
            }
          ],
          createdAt: now,
          updatedAt: now
        };
        setSheets([defaultSheet]);
        window.localStorage.setItem('appnote-sheets-initialized-v3', 'true');
      }
    }
  }, [isSheetsHydrated, sheets, setSheets]);
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

  // QoL Convert Scratchpad drafts to a Sheet (Tables + Text sections)
  const convertScratchpadToSheet = () => {
    if (!scratchpadText.trim()) return;

    const lines = scratchpadText.split('\n');
    const sections: SheetSection[] = [];
    let currentSectionTitle = 'รายละเอียด';
    let currentSectionLines: string[] = [];
    let title = 'ตารางจาก Scratchpad';
    let description = 'นำเข้าจากบันทึกร่างด่วน';

    // Helper to flush current text/table sections
    const flushSection = () => {
      if (currentSectionLines.length === 0) return;

      let isTable = false;
      let headers: string[] = [];
      let rows: string[][] = [];

      // Split by tab, | or double spaces
      const splitRow = (rowStr: string) => {
        if (rowStr.includes('\t')) {
          return rowStr.split('\t').map(s => s.trim());
        }
        if (rowStr.includes('|')) {
          return rowStr.split('|').map(s => s.trim()).filter(s => s !== '');
        }
        if (/\s{2,}/.test(rowStr)) {
          return rowStr.split(/\s{2,}/).map(s => s.trim());
        }
        return [];
      };

      const activeLines = currentSectionLines.filter(l => l.trim() !== '');

      if (activeLines.length >= 2) {
        const potentialHeaders = splitRow(activeLines[0]);
        if (potentialHeaders.length >= 2) {
          let validRows = 0;
          const tempRows: string[][] = [];
          for (let i = 1; i < activeLines.length; i++) {
            const split = splitRow(activeLines[i]);
            if (split.length > 0) {
              validRows++;
              while (split.length < potentialHeaders.length) {
                split.push('');
              }
              tempRows.push(split.slice(0, potentialHeaders.length));
            }
          }
          if (validRows > 0) {
            isTable = true;
            headers = potentialHeaders;
            rows = tempRows;
          }
        }
      }

      if (isTable) {
        sections.push({
          id: crypto.randomUUID(),
          type: 'table',
          title: currentSectionTitle,
          headers,
          rows
        });
      } else {
        sections.push({
          id: crypto.randomUUID(),
          type: 'text',
          title: currentSectionTitle,
          content: currentSectionLines.join('\n')
        });
      }

      currentSectionLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (i === 0 && (trimmed.startsWith('#') || trimmed.startsWith('**'))) {
        title = trimmed.replace(/[#*]/g, '').trim();
        continue;
      }
      if (i === 1 && !trimmed.startsWith('#') && !trimmed.startsWith('**') && trimmed !== '') {
        description = trimmed;
        continue;
      }

      const isNewSection = 
        trimmed.startsWith('##') || 
        (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) ||
        (/^[^\s:][^:]+:$/.test(trimmed) && trimmed.length < 50);

      if (isNewSection) {
        flushSection();
        currentSectionTitle = trimmed.replace(/[#*:]/g, '').trim();
      } else {
        currentSectionLines.push(line);
      }
    }

    flushSection();

    const now = new Date().toISOString();
    const newSheetId = crypto.randomUUID();
    const newSheet: CustomSheet = {
      id: newSheetId,
      title,
      description,
      isPinned: false,
      sections,
      createdAt: now,
      updatedAt: now
    };

    setSheets(prev => [newSheet, ...prev]);
    setScratchpadText('');
    setSelectedSheetId(newSheetId);
    setActiveTab('sheets');
    setIsScratchpadOpen(false);
  };

  // Compute Active counts
  const activeTasksCount = tasks.filter(t => !t.isCompleted).length;
  const totalEventsCount = events.length;

  const isFullyHydrated = isNotesHydrated && isTasksHydrated && isEventsHydrated && isScratchpadHydrated && isSheetsHydrated;

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
      case 'sheets':
        return (
          <SheetsTab 
            sheets={sheets} 
            setSheets={setSheets} 
            searchQuery={searchQuery} 
            selectedSheetId={selectedSheetId}
            setSelectedSheetId={setSelectedSheetId}
          />
        );
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
      case 'sheets':
        return 'Guides & Sheets';
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
              <span className="text-mono" style={{ fontWeight: 800 }}>AppNote</span>
            </div>
            <button className="menu-toggle-close" onClick={() => setIsSidebarOpen(false)} title="Close Menu">
              <X size={15} />
            </button>
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

            <button 
              className={`nav-item ${activeTab === 'sheets' ? 'active' : ''}`}
              onClick={() => { setActiveTab('sheets'); setIsSidebarOpen(false); }}
            >
              <span className="nav-item-left">
                <BookOpen size={16} />
                <span>Guides & Sheets</span>
              </span>
              <span className="nav-badge">{sheets.length}</span>
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
                <button 
                  className="secondary-btn" 
                  style={{ width: '100%', fontSize: '11px', padding: '6px 0', justifyContent: 'center' }}
                  onClick={convertScratchpadToSheet}
                  disabled={!scratchpadText.trim()}
                  title="Convert to custom tables and guides"
                >
                  <BookOpen size={12} /> Convert to Sheet
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

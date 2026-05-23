'use client';

import React, { useState, useMemo } from 'react';
import { Task, Priority } from '@/types';
import { Plus, Trash2, Calendar, ClipboardList, CheckCircle, Repeat, HelpCircle } from 'lucide-react';

interface TasksTabProps {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  searchQuery: string;
}

export default function TasksTab({ tasks, setTasks, searchQuery }: TasksTabProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');
  
  // Quick Add State
  const [titleInput, setTitleInput] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tag, setTag] = useState('');
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'none'>('none');
  const [showParserTip, setShowParserTip] = useState(false);

  // Natural Language Parser (NLP) Engine (Thai & English)
  const parseNaturalLanguage = (inputStr: string) => {
    let text = inputStr;
    
    // 1. Parse Recurring Flags
    let parsedRecurring: 'daily' | 'weekly' | 'none' = 'none';
    if (/@daily|@ทุกวัน/.test(text)) {
      parsedRecurring = 'daily';
      text = text.replace(/@daily|@ทุกวัน/g, '');
    } else if (/@weekly|@ทุกสัปดาห์/.test(text)) {
      parsedRecurring = 'weekly';
      text = text.replace(/@weekly|@ทุกสัปดาห์/g, '');
    }

    // 2. Parse Priority hashtags
    let parsedPriority: Priority = 'medium';
    const highRegex = /#(high|ด่วน|สำคัญมากๆ|วิกฤต)/i;
    const lowRegex = /#(low|ไม่ด่วน|ชิลๆ|เบาๆ)/i;
    const medRegex = /#(medium|ปกติ|ปานกลาง)/i;

    if (highRegex.test(text)) {
      parsedPriority = 'high';
      text = text.replace(highRegex, '');
    } else if (lowRegex.test(text)) {
      parsedPriority = 'low';
      text = text.replace(lowRegex, '');
    } else if (medRegex.test(text)) {
      parsedPriority = 'medium';
      text = text.replace(medRegex, '');
    }

    // 3. Parse Custom Tag Hashtags (any other #hashtag)
    let parsedTag = '';
    const hashtagRegex = /#(\w+|[\u0E00-\u0E7F]+)/g;
    const hashtags = text.match(hashtagRegex);
    if (hashtags && hashtags.length > 0) {
      // Pick the first remaining hashtag as the main tag
      const rawTag = hashtags[0].replace('#', '');
      // Avoid matching standard words
      if (rawTag && !['high', 'medium', 'low'].includes(rawTag.toLowerCase())) {
        parsedTag = rawTag;
      }
      // Remove all hashtags from the title text
      text = text.replace(hashtagRegex, '');
    }

    // 4. Parse Dates (today, tomorrow, weekday names)
    let parsedDueDate = '';
    const now = new Date();
    
    // Utility to format date string YYYY-MM-DD
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const getNextWeekday = (dayOfWeekIndex: number) => {
      const resultDate = new Date();
      // Calculate offset days
      const currentDay = resultDate.getDay();
      let distance = dayOfWeekIndex - currentDay;
      if (distance <= 0) {
        distance += 7; // Get next week's day
      }
      resultDate.setDate(resultDate.getDate() + distance);
      return formatDate(resultDate);
    };

    // Date keyword regexes
    const todayRegex = /\b(today|วันนี้)\b/i;
    const tomorrowRegex = /\b(tomorrow|พรุ่งนี้)\b/i;
    const dayAfterRegex = /\b(day after tomorrow|มะรืน|มะรืนนี้)\b/i;
    
    const weekdays: { regex: RegExp; index: number }[] = [
      { regex: /\b(sunday|อาทิตย์|วันอาทิตย์|sun)\b/i, index: 0 },
      { regex: /\b(monday|จันทร์|วันจันทร์|mon)\b/i, index: 1 },
      { regex: /\b(tuesday|อังคาร|วันอังคาร|tue)\b/i, index: 2 },
      { regex: /\b(wednesday|พุธ|วันพุธ|wed)\b/i, index: 3 },
      { regex: /\b(thursday|พฤหัส|พฤหัสบดี|วันพฤหัส|thu)\b/i, index: 4 },
      { regex: /\b(friday|ศุกร์|วันศุกร์|fri)\b/i, index: 5 },
      { regex: /\b(saturday|เสาร์|วันเสาร์|sat)\b/i, index: 6 }
    ];

    if (todayRegex.test(text)) {
      parsedDueDate = formatDate(now);
      text = text.replace(todayRegex, '');
    } else if (tomorrowRegex.test(text)) {
      const tom = new Date();
      tom.setDate(now.getDate() + 1);
      parsedDueDate = formatDate(tom);
      text = text.replace(tomorrowRegex, '');
    } else if (dayAfterRegex.test(text)) {
      const dayAfter = new Date();
      dayAfter.setDate(now.getDate() + 2);
      parsedDueDate = formatDate(dayAfter);
      text = text.replace(dayAfterRegex, '');
    } else {
      // Check weekday matches
      for (const day of weekdays) {
        if (day.regex.test(text)) {
          parsedDueDate = getNextWeekday(day.index);
          text = text.replace(day.regex, '');
          break;
        }
      }
    }

    // Clean double spaces or hanging marks
    const cleanedTitle = text.replace(/\s+/g, ' ').trim();

    return {
      title: cleanedTitle,
      priority: parsedPriority,
      dueDate: parsedDueDate || undefined,
      tag: parsedTag || undefined,
      recurring: parsedRecurring !== 'none' ? parsedRecurring : undefined
    };
  };

  // Handle Quick Add task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    // Use Natural Language Parsing first
    const nlpResults = parseNaturalLanguage(titleInput);
    
    // Fall back to manual picker fields if NLP did not capture them
    const finalPriority = nlpResults.priority || priority;
    const finalDueDate = nlpResults.dueDate || (dueDate || undefined);
    const finalTag = nlpResults.tag || (tag.trim() || undefined);
    const finalRecurring = nlpResults.recurring || (recurring !== 'none' ? recurring : undefined);

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: nlpResults.title || titleInput.trim(),
      isCompleted: false,
      priority: finalPriority,
      dueDate: finalDueDate,
      tag: finalTag,
      recurring: finalRecurring,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    
    // Reset Form
    setTitleInput('');
    setPriority('medium');
    setDueDate('');
    setTag('');
    setRecurring('none');
  };

  // Toggle completed status
  const toggleTask = (id: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  // Delete Task
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Tab filter
      if (filterTab === 'active' && task.isCompleted) return false;
      if (filterTab === 'completed' && !task.isCompleted) return false;

      // Search query filter
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.tag && task.tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSearch;
    }).sort((a, b) => {
      // Incomplete tasks first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // Sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filterTab, searchQuery]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="tasks-container animate-fade-in">
      <div className="tasks-tabs">
        <button 
          className={`tasks-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
          onClick={() => setFilterTab('all')}
        >
          All Tasks
        </button>
        <button 
          className={`tasks-tab-btn ${filterTab === 'active' ? 'active' : ''}`}
          onClick={() => setFilterTab('active')}
        >
          Active
        </button>
        <button 
          className={`tasks-tab-btn ${filterTab === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterTab('completed')}
        >
          Completed
        </button>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAddTask} className="card quick-add-task animate-slide-up" style={{ padding: '16px', flexDirection: 'column', gap: '12px' }}>
        <div className="quick-add-task-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
          <input
            type="text"
            placeholder="Add task... try 'จองคิวหมอ พรุ่งนี้ #high #สุขภาพ @daily'"
            className="quick-add-input"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
          <button 
            type="button" 
            className="secondary-btn" 
            style={{ padding: '8px' }} 
            onClick={() => setShowParserTip(!showParserTip)}
            title="Help / NLP shortcuts"
          >
            <HelpCircle size={16} />
          </button>
          <button type="submit" className="primary-btn">
            <Plus size={16} /> Add
          </button>
        </div>

        {/* NLP Helpful parser cheat sheet */}
        {showParserTip && (
          <div className="animate-slide-up" style={{ padding: '12px', border: '1px dashed var(--border-primary)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', fontSize: '12px', color: 'var(--fg-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <strong>💡 AI Smart Parsing (ไทย-อังกฤษ) Shortcuts:</strong>
            <p>• <strong>วัน (Due Date)</strong>: พิมพ์ "วันนี้", "พรุ่งนี้", "มะรืน", "จันทร์", "วันศุกร์" หรือ "tomorrow", "friday" จะจับคู่ให้ทันที</p>
            <p>• <strong>ความสำคัญ (Priority)</strong>: ใส่ `#high` (`#ด่วน`), `#medium` (`#ปกติ`), `#low` (`#ชิลๆ`)</p>
            <p>• <strong>หมวดหมู่ (Tags)</strong>: ติดแฮชแท็กหัวข้อได้เลย เช่น `#สุขภาพ`, `#งาน`, `#personal` (ระบบจะดึงเป็นหมวดหมู่ให้เอง)</p>
            <p>• <strong>ทำซ้ำ (Habits)</strong>: ติดคีย์เวิร์ด `@daily` (`@ทุกวัน`) หรือ `@weekly` (`@ทุกสัปดาห์`)</p>
          </div>
        )}
        
        <div className="quick-add-options">
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '10px' }}>Priority:</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="form-input"
              style={{ padding: '4px 8px', fontSize: '12px', height: 'auto' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '10px' }}>Due Date:</label>
            <input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)}
              onClick={(e) => {
                try {
                  (e.target as any).showPicker();
                } catch (err) {
                  console.warn("showPicker not supported:", err);
                }
              }}
              className="form-input"
              style={{ padding: '2px 8px', fontSize: '12px', height: 'auto', width: '130px' }}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '10px' }}>Tag:</label>
            <input 
              type="text" 
              placeholder="e.g. Work"
              value={tag} 
              onChange={(e) => setTag(e.target.value)}
              className="form-input"
              style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', width: '100px' }}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '10px' }}>Routine:</label>
            <select 
              value={recurring} 
              onChange={(e) => setRecurring(e.target.value as 'daily' | 'weekly' | 'none')}
              className="form-input"
              style={{ padding: '4px 8px', fontSize: '12px', height: 'auto' }}
            >
              <option value="none">None</option>
              <option value="daily">Daily Habit</option>
              <option value="weekly">Weekly Habit</option>
            </select>
          </div>
        </div>
      </form>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          {filterTab === 'completed' ? (
            <CheckCircle size={48} strokeWidth={1} />
          ) : (
            <ClipboardList size={48} strokeWidth={1} />
          )}
          <p className="empty-state-title">No tasks found</p>
          <p className="empty-state-desc">
            {searchQuery 
              ? "We couldn't find any tasks matching your search query."
              : filterTab === 'completed'
              ? "You haven't completed any tasks yet. Keep going!"
              : "All clear! Add a task using the input above to get started."}
          </p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`task-item animate-slide-up ${task.isCompleted ? 'completed' : ''}`}
            >
              <div className="task-item-left">
                <div className="task-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id={`checkbox-${task.id}`}
                    className="task-checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTask(task.id)}
                  />
                </div>
                <label 
                  htmlFor={`checkbox-${task.id}`}
                  className="task-label"
                >
                  {task.title}
                </label>
              </div>

              <div className="task-item-right">
                {task.recurring && task.recurring !== 'none' && (
                  <span className="task-due-date" style={{ color: '#0070f3', backgroundColor: 'rgba(0, 112, 243, 0.05)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Repeat size={10} />
                    <span style={{ fontSize: '9px' }} className="text-mono">{task.recurring}</span>
                  </span>
                )}

                {task.tag && (
                  <span className="note-tag text-mono" style={{ textTransform: 'lowercase', fontSize: '9px' }}>
                    #{task.tag}
                  </span>
                )}
                
                <span className={`task-priority-badge ${task.priority}`}>
                  {task.priority}
                </span>

                {task.dueDate && (
                  <span className="task-due-date">
                    <Calendar size={12} />
                    {formatDate(task.dueDate)}
                  </span>
                )}

                <button 
                  className="task-delete-btn"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

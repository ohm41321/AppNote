'use client';

import React, { useState, useMemo } from 'react';
import { Note } from '@/types';
import { Plus, X, Trash2, Edit2, FolderOpen, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';

interface NotesTabProps {
  notes: Note[];
  setNotes: (notes: Note[] | ((prev: Note[]) => Note[])) => void;
  searchQuery: string;
}

const NOTE_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Blue', value: '#3291ff' },
  { name: 'Green', value: '#50e3c2' },
  { name: 'Orange', value: '#f5a623' },
  { name: 'Red', value: '#e00' },
  { name: 'Purple', value: '#7928ca' }
];

export default function NotesTab({ notes, setNotes, searchQuery }: NotesTabProps) {
  const [activeTag, setActiveTag] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [color, setColor] = useState('');

  // QoL: Immersive Zen Mode Writing panel
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Synthesize real mechanical keyboard click using Web Audio API (Offline & lightweight!)
  const playTypewriterClick = () => {
    if (!isSoundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Select triangle wave for soft mechanical key tick
      osc.type = 'triangle';
      
      // Randomize slight frequency to sound like different keycaps (very high fidelity!)
      const pitch = 200 + Math.random() * 180;
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      
      // Quick pop envelope
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (err) {
      console.warn('Audio Context failed:', err);
    }
  };

  // Textarea keypress listener for Zen typewriter sound
  const handleZenTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    playTypewriterClick();
  };

  const handleZenTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    playTypewriterClick();
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => {
        if (tag.trim()) tagsSet.add(tag.trim());
      });
    });
    return ['All', ...Array.from(tagsSet)];
  }, [notes]);

  // Filter notes based on activeTag and searchQuery
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesTag = activeTag === 'All' || note.tags.includes(activeTag);
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, activeTag, searchQuery]);

  const openAddModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setTagsInput('');
    setColor('');
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.note-actions')) return;
    
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTagsInput(note.tags.join(', '));
    setColor(note.color || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const now = new Date().toISOString();

    if (editingNote) {
      setNotes(prev =>
        prev.map(note =>
          note.id === editingNote.id
            ? {
                ...note,
                title: title.trim() || 'Untitled Note',
                content: content,
                tags: parsedTags,
                color: color,
                updatedAt: now
              }
            : note
        )
      );
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: title.trim() || 'Untitled Note',
        content: content,
        tags: parsedTags,
        color: color,
        createdAt: now,
        updatedAt: now
      };
      setNotes(prev => [newNote, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== id));
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Word count stats helper
  const getStats = () => {
    const text = content.trim();
    if (!text) return { characters: 0, words: 0 };
    return {
      characters: text.length,
      words: text.split(/\s+/).filter(Boolean).length
    };
  };

  const stats = getStats();

  return (
    <div className="animate-fade-in">
      <div className="notes-controls">
        <div className="tags-filter">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-btn ${activeTag === tag ? 'active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <button className="primary-btn" onClick={openAddModal}>
          <Plus size={16} /> New Note
        </button>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} strokeWidth={1} />
          <p className="empty-state-title">No notes found</p>
          <p className="empty-state-desc">
            {searchQuery 
              ? "We couldn't find any notes matching your search query." 
              : "Create your first note by clicking 'New Note' above to organize your thoughts."}
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="note-card card animate-slide-up"
              onClick={(e) => openEditModal(note, e)}
              style={note.color ? { borderLeft: `4px solid ${note.color}` } : undefined}
            >
              <div>
                <div className="note-header">
                  <h4 className="note-title">{note.title}</h4>
                  <div className="note-actions">
                    <button 
                      className="note-action-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(note, e);
                      }}
                      title="Edit note"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="note-action-btn"
                      onClick={(e) => handleDelete(note.id, e)}
                      title="Delete note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="note-body">{note.content || <em style={{ opacity: 0.5 }}>No content</em>}</div>
              </div>

              <div className="note-footer">
                <span className="note-date">{formatDate(note.updatedAt)}</span>
                {note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="note-tag">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="note-tag" title={note.tags.slice(2).join(', ')}>
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Edit/Add Modal */}
      {isModalOpen && !isZenMode && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3>{editingNote ? 'Edit Note' : 'Create Note'}</h3>
                <button 
                  className="secondary-btn" 
                  style={{ display: 'inline-flex', padding: '4px 8px', fontSize: '11px', height: 'auto', gap: '4px' }}
                  onClick={() => setIsZenMode(true)}
                  title="Expand to Fullscreen Zen Writing Canvas"
                >
                  <Maximize2 size={11} />
                  <span>Zen Mode</span>
                </button>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="note-title">Title</label>
                <input
                  id="note-title"
                  type="text"
                  placeholder="Note title..."
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="note-content">Content</label>
                <textarea
                  id="note-content"
                  placeholder="Write your note contents here (supports multi-line)..."
                  className="form-input form-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="note-tags">Tags (Comma Separated)</label>
                <input
                  id="note-tags"
                  type="text"
                  placeholder="Personal, Ideas, Vercel..."
                  className="form-input"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Color Accent</label>
                <div className="color-picker">
                  {NOTE_COLORS.map(c => (
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
              <button className="primary-btn" onClick={handleSave}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QoL Fullscreen Distraction-Free Zen Writing Overlay */}
      {isZenMode && (
        <div className="zen-mode-overlay" onClick={() => setIsZenMode(false)}>
          <div className="zen-editor-container" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Untitled Draft..."
              className="zen-title-input"
              value={title}
              onChange={handleZenTitleChange}
              autoFocus
            />

            <textarea
              placeholder="Let your thoughts flow freely. Typewriter sounds will follow your lead..."
              className="zen-textarea"
              value={content}
              onChange={handleZenTextChange}
            />

            <div className="zen-controls">
              <div className="zen-stats">
                <span>{stats.words} words</span>
                <span>{stats.characters} characters</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Synthesized typewriter keyboard click sound toggle */}
                <button 
                  className="zen-sound-toggle"
                  onClick={() => setIsSoundOn(!isSoundOn)}
                  title="Toggle keyboard typing click sound"
                >
                  {isSoundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span className="text-mono" style={{ fontSize: '10px' }}>{isSoundOn ? 'Sound On' : 'Mute'}</span>
                </button>

                <button 
                  className="primary-btn" 
                  style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '12px', gap: '6px' }}
                  onClick={() => setIsZenMode(false)}
                >
                  <Minimize2 size={13} />
                  <span>Exit Zen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

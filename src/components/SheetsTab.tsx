'use client';

import React, { useState, useMemo, useRef } from 'react';
import { CustomSheet, SheetSection, SheetTableSection, SheetTextSection } from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  Pin, 
  FileText, 
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Layout,
  Table,
  AlignLeft,
  Save,
  BookOpen,
  Dumbbell,
  CheckCircle,
  Eye,
  Settings,
  HelpCircle,
  PlusCircle,
  X,
  Upload,
  Download
} from 'lucide-react';
interface SheetsTabProps {
  sheets: CustomSheet[];
  setSheets: (sheets: CustomSheet[] | ((prev: CustomSheet[]) => CustomSheet[])) => void;
  searchQuery: string;
  selectedSheetId: string | null;
  setSelectedSheetId: (id: string | null) => void;
}

export default function SheetsTab({ 
  sheets, 
  setSheets, 
  searchQuery, 
  selectedSheetId, 
  setSelectedSheetId 
}: SheetsTabProps) {
  // Navigation & UI state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export Sheet function
  const handleExportSheet = (sheet: CustomSheet) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sheet, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${sheet.title.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์');
    }
  };

  // Trigger file selection for import
  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  // Import JSON function
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && typeof importedData === 'object' && importedData.title && Array.isArray(importedData.sections)) {
          const newSheet: CustomSheet = {
            ...importedData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          e.target.value = ''; // Reset file input
          setSheets(prev => [newSheet, ...prev]);
          setSelectedSheetId(newSheet.id); // Open immediately
          alert('นำเข้าตารางสำเร็จ!');
        } else {
          alert('ไฟล์ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบไฟล์ JSON');
        }
      } catch (err) {
        alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  // Selected Sheet Object
  const activeSheet = useMemo(() => {
    return sheets.find(s => s.id === selectedSheetId) || null;
  }, [sheets, selectedSheetId]);

  // Open Sheet detail
  const handleOpenSheet = (sheet: CustomSheet) => {
    setSelectedSheetId(sheet.id);
    setIsEditing(false);
    setEditingTitle(sheet.title);
    setEditingDesc(sheet.description || '');
  };

  // Toggle Pinned
  const togglePinSheet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSheets(prev => prev.map(sheet => 
      sheet.id === id ? { ...sheet, isPinned: !sheet.isPinned } : sheet
    ));
  };

  // Delete Sheet
  const handleDeleteSheet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('คุณแน่ใจหรือไม่ว่าจะลบตาราง/คู่มือนี้?')) {
      setSheets(prev => prev.filter(sheet => sheet.id !== id));
      if (selectedSheetId === id) {
        setSelectedSheetId(null);
      }
    }
  };

  // Create New Custom Sheet (Blank)
  const handleCreateBlankSheet = () => {
    const now = new Date().toISOString();
    const newSheet: CustomSheet = {
      id: crypto.randomUUID(),
      title: 'ตารางใหม่ไม่ได้ตั้งชื่อ',
      description: 'คำอธิบายตารางสั้นๆ ของคุณ',
      isPinned: false,
      sections: [
        {
          id: crypto.randomUUID(),
          type: 'table',
          title: 'ตารางข้อมูลหลัก',
          headers: ['หัวข้อ 1', 'หัวข้อ 2', 'รายละเอียด'],
          rows: [['ข้อมูล A', 'ข้อมูล B', 'คำอธิบาย']]
        },
        {
          id: crypto.randomUUID(),
          type: 'text',
          title: 'บันทึกเพิ่มเติม',
          content: '• รายการข้อความที่ 1\n• รายการข้อความที่ 2'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    setSheets(prev => [newSheet, ...prev]);
    handleOpenSheet(newSheet);
    setIsEditing(true);
  };

  // Create Workout & Diet Plan template manually (Fallback if not hydrated)
  const handleCreateWorkoutTemplate = () => {
    const now = new Date().toISOString();
    const templateSheet: CustomSheet = {
      id: crypto.randomUUID(),
      title: 'ตารางออกกำลังกาย & ควบคุมอาหาร (ตัวอย่าง)',
      description: 'โปรแกรมและเป้าหมายการซ้อมเพื่อสุขภาพและคุมน้ำหนักประจำสัปดาห์',
      isPinned: true,
      sections: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          title: 'เป้าหมายแรกเริ่ม',
          content: 'น้ำหนักเป้าหมาย: ลด 3-5 กิโลกรัม ใน 3 เดือนแรก\n\n* เน้นการปรับพฤติกรรมการทานและขยับตัวในชีวิตประจำวัน'
        },
        {
          id: crypto.randomUUID(),
          type: 'table',
          title: 'ตารางการออกกำลังกายรายสัปดาห์',
          headers: ['วัน', 'เวลา', 'กิจกรรม/โปรแกรม'],
          rows: [
            ['จันทร์', 'เย็น', 'เดินเร็วบนลู่วิ่ง 30 นาที'],
            ['อังคาร', 'พัก', 'เดินเล่นยืดเหยียดร่างกาย'],
            ['พุธ', 'เย็น', 'เวทเทรนนิ่งเน้นส่วนบน 30 นาที'],
            ['พฤหัส', 'พัก', 'เดินเล่นหลังอาหาร 15 นาที'],
            ['ศุกร์', 'เย็น', 'เดินเร็วบนลู่วิ่ง 30 นาที'],
            ['เสาร์', 'เช้า', 'เวทเทรนนิ่งทั่วร่างกาย 45 นาที'],
            ['อาทิตย์', 'พัก', 'พักผ่อนเต็มที่']
          ]
        },
        {
          id: crypto.randomUUID(),
          type: 'text',
          title: 'ตัวอย่างโปรแกรมเวทเทรนนิ่ง (เน้นท่าพื้นฐาน)',
          content: '• Squat (ต้นขาและก้น) — 12 ครั้ง x 3 เซ็ต\n• Push-ups (อกและหลังแขน) — 10 ครั้ง x 3 เซ็ต\n• Dumbbell Row (แผ่นหลังและหน้าแขน) — 12 ครั้ง x 3 เซ็ต\n• Shoulder Press (หัวไหล่) — 12 ครั้ง x 3 เซ็ต\n• Plank (แกนกลางลำตัว) — 30 วินาที x 3 เซ็ต\n\n* พักระหว่างเซ็ต 60-90 วินาที'
        },
        {
          id: crypto.randomUUID(),
          type: 'text',
          title: 'แนวทางการควบคุมอาหารพื้นฐาน',
          content: '**หลักการทั่วไป:**\n✅ เพิ่มสัดส่วนอาหารโปรตีนสูง (เช่น เนื้อปลา, อกไก่, ไข่ต้ม)\n✅ ลดอาหารหวานและเครื่องดื่มที่มีน้ำตาลสูง\n✅ ปรับลดข้าวขาวหรือแป้งขัดสี\n\n**ข้อแนะนำเพิ่มเติม:**\n• มื้อเช้า: เน้นอาหารโปรตีนและคาร์โบไฮเดรตเชิงซ้อน\n• มื้อกลางวัน: ทานอาหารตามปกติแต่เลี่ยงของมันของทอด\n• มื้อเย็น: เน้นเมนูต้ม, ตุ๋น, หรือนึ่ง และเพิ่มสัดส่วนผัก'
        },
        {
          id: crypto.randomUUID(),
          type: 'text',
          title: 'เป้าหมายสุขภาพประจำวัน',
          content: '✅ ดื่มน้ำสะอาด 2-3 ลิตร/วัน\n✅ ขยับร่างกาย/เดินให้ได้ 8,000 ก้าว\n✅ พักผ่อนนอนหลับ 7-8 ชั่วโมง'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    setSheets(prev => [templateSheet, ...prev]);
    handleOpenSheet(templateSheet);
  };

  // Helper to format text lines (for nice bullets and status highlights in read mode)
  const formatTextContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      
      // Headers (e.g. **Title**)
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return (
          <h4 key={idx} style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 700, color: 'var(--fg-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {trimmed.replace(/\*\*/g, '')}
          </h4>
        );
      }

      // Checkboxes emojis check
      let style: React.CSSProperties = {};
      if (trimmed.startsWith('✅')) {
        style = { color: 'var(--fg-primary)', display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '4px 0' };
        return <div key={idx} style={style}><span>✅</span><span>{trimmed.slice(2).trim()}</span></div>;
      }
      if (trimmed.startsWith('❌')) {
        style = { color: 'var(--fg-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '4px 0', textDecoration: 'line-through', opacity: 0.6 };
        return <div key={idx} style={style}><span>❌</span><span>{trimmed.slice(2).trim()}</span></div>;
      }
      
      // Standard bullets
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        let content = trimmed.substring(1).trim();
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '6px 0 6px 16px', color: 'var(--fg-secondary)' }}>
            <span style={{ color: 'var(--fg-tertiary)', fontSize: '10px', marginTop: '4px' }}>■</span>
            <span>{content}</span>
          </div>
        );
      }

      return (
        <p key={idx} style={{ margin: '4px 0', minHeight: '1.4em', color: trimmed ? 'var(--fg-secondary)' : 'transparent' }}>
          {line}
        </p>
      );
    });
  };

  // Edit Handlers for active sheet
  const handleUpdateSheetMeta = (field: 'title' | 'description', value: string) => {
    if (field === 'title') setEditingTitle(value);
    if (field === 'description') setEditingDesc(value);

    setSheets(prev => prev.map(sheet => 
      sheet.id === selectedSheetId ? {
        ...sheet,
        [field]: value,
        updatedAt: new Date().toISOString()
      } : sheet
    ));
  };

  // Save edits and toggle editing state
  const toggleEditMode = () => {
    if (isEditing) {
      // Clean updates and save
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  // SECTION EDITING LOGICS
  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      return {
        ...sheet,
        sections: sheet.sections.map(sec => 
          sec.id === sectionId ? { ...sec, title } : sec
        ),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleUpdateTextContent = (sectionId: string, content: string) => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      return {
        ...sheet,
        sections: sheet.sections.map(sec => 
          sec.id === sectionId && sec.type === 'text' ? { ...sec, content } : sec
        ),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleUpdateTableCell = (sectionId: string, rowIndex: number, colIndex: number, val: string) => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      return {
        ...sheet,
        sections: sheet.sections.map(sec => {
          if (sec.id === sectionId && sec.type === 'table') {
            const updatedRows = [...sec.rows];
            updatedRows[rowIndex] = [...updatedRows[rowIndex]];
            updatedRows[rowIndex][colIndex] = val;
            return { ...sec, rows: updatedRows };
          }
          return sec;
        }),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleUpdateTableHeader = (sectionId: string, colIndex: number, val: string) => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      return {
        ...sheet,
        sections: sheet.sections.map(sec => {
          if (sec.id === sectionId && sec.type === 'table') {
            const updatedHeaders = [...sec.headers];
            updatedHeaders[colIndex] = val;
            return { ...sec, headers: updatedHeaders };
          }
          return sec;
        }),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleAddRow = (sectionId: string) => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      return {
        ...sheet,
        sections: sheet.sections.map(sec => {
          if (sec.id === sectionId && sec.type === 'table') {
            const blankRow = Array(sec.headers.length).fill('');
            return { ...sec, rows: [...sec.rows, blankRow] };
          }
          return sec;
        }),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleDeleteRow = (sectionId: string, rowIndex: number) => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      return {
        ...sheet,
        sections: sheet.sections.map(sec => {
          if (sec.id === sectionId && sec.type === 'table') {
            return { ...sec, rows: sec.rows.filter((_, idx) => idx !== rowIndex) };
          }
          return sec;
        }),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleAddColumn = (sectionId: string) => {
    const colName = prompt('ระบุชื่อคอลัมน์ใหม่:', 'คอลัมน์ใหม่');
    if (!colName) return;

    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      return {
        ...sheet,
        sections: sheet.sections.map(sec => {
          if (sec.id === sectionId && sec.type === 'table') {
            return {
              ...sec,
              headers: [...sec.headers, colName],
              rows: sec.rows.map(row => [...row, ''])
            };
          }
          return sec;
        }),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleDeleteColumn = (sectionId: string, colIndex: number) => {
    if (confirm('คุณแน่ใจว่าต้องการลบคอลัมน์นี้หรือไม่? ข้อมูลในคอลัมน์นี้จะสูญหาย')) {
      setSheets(prev => prev.map(sheet => {
        if (sheet.id !== selectedSheetId) return sheet;
        return {
          ...sheet,
          sections: sheet.sections.map(sec => {
            if (sec.id === sectionId && sec.type === 'table') {
              return {
                ...sec,
                headers: sec.headers.filter((_, idx) => idx !== colIndex),
                rows: sec.rows.map(row => row.filter((_, idx) => idx !== colIndex))
              };
            }
            return sec;
          }),
          updatedAt: new Date().toISOString()
        };
      }));
    }
  };

  const handleAddSection = (type: 'table' | 'text') => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      
      const newSec: SheetSection = type === 'table' 
        ? {
            id: crypto.randomUUID(),
            type: 'table',
            title: 'ตารางใหม่',
            headers: ['หัวข้อ 1', 'หัวข้อ 2'],
            rows: [['', '']]
          }
        : {
            id: crypto.randomUUID(),
            type: 'text',
            title: 'บล็อกข้อความใหม่',
            content: 'เขียนข้อมูลของคุณที่นี่...'
          };

      return {
        ...sheet,
        sections: [...sheet.sections, newSec],
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('ยืนยันที่จะลบส่วนนี้ออกหรือไม่?')) {
      setSheets(prev => prev.map(sheet => {
        if (sheet.id !== selectedSheetId) return sheet;
        return {
          ...sheet,
          sections: sheet.sections.filter(sec => sec.id !== sectionId),
          updatedAt: new Date().toISOString()
        };
      }));
    }
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id !== selectedSheetId) return sheet;
      
      const index = sheet.sections.findIndex(sec => sec.id === sectionId);
      if (index === -1) return sheet;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sheet.sections.length) return sheet;

      const newSections = [...sheet.sections];
      const temp = newSections[index];
      newSections[index] = newSections[newIndex];
      newSections[newIndex] = temp;

      return {
        ...sheet,
        sections: newSections,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  // Filter sheets by search
  const filteredSheets = useMemo(() => {
    return sheets.filter(sheet => {
      const searchLower = searchQuery.toLowerCase();
      const matchesMeta = 
        sheet.title.toLowerCase().includes(searchLower) ||
        (sheet.description && sheet.description.toLowerCase().includes(searchLower));

      const matchesSections = sheet.sections.some(sec => {
        if (sec.type === 'text') {
          return sec.title.toLowerCase().includes(searchLower) || sec.content.toLowerCase().includes(searchLower);
        } else {
          return sec.title.toLowerCase().includes(searchLower) || 
                 sec.headers.some(h => h.toLowerCase().includes(searchLower)) ||
                 sec.rows.some(row => row.some(cell => cell.toLowerCase().includes(searchLower)));
        }
      });

      return matchesMeta || matchesSections;
    }).sort((a, b) => {
      // Pinned first, then by update time
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [sheets, searchQuery]);

  return (
    <div className="sheets-tab-container animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. DASHBOARD VIEW (If no sheet is opened) */}
      {!activeSheet ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%', overflowY: 'auto' }}>
          
          {/* Quick templates and custom triggers */}
          <div className="sheets-dashboard-welcome">
            <h2 className="text-mono" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layout size={20} style={{ color: 'var(--fg-accent-light)' }} />
              <span>ตารางและคู่มือ (Sheets & Guides)</span>
            </h2>
            <p style={{ color: 'var(--fg-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              สร้างและบันทึกเอกสารสรุป ตารางฝึกซ้อมกีฬา หรือคู่มือการดูแลสุขภาพของคุณไว้เปิดอ่านและแก้ไขได้ในที่เดียว
            </p>

            {/* Template Card Quick-Actions */}
            <div className="sheets-templates-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div 
                className="card animate-slide-up template-card"
                onClick={handleCreateWorkoutTemplate}
                style={{ cursor: 'pointer', borderLeft: '4px solid #50e3c2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Dumbbell size={18} style={{ color: '#50e3c2' }} />
                    <strong style={{ fontSize: '14px' }}>ตารางออกกำลังกาย & คุมอาหาร</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--fg-secondary)', lineHeight: '1.4' }}>
                    ตารางซ้อมประจำวัน, โปรแกรมเวท และแผนคุมอาหารประจำสัปดาห์ (ข้อมูลจำลอง)
                  </p>
                </div>
                <span className="text-mono" style={{ fontSize: '10px', color: '#50e3c2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                  <Plus size={10} /> ใช้เทมเพลตนี้
                </span>
              </div>

              <div 
                className="card animate-slide-up template-card"
                onClick={handleCreateBlankSheet}
                style={{ cursor: 'pointer', borderLeft: '4px solid var(--fg-accent-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Table size={18} style={{ color: 'var(--fg-accent-light)' }} />
                    <strong style={{ fontSize: '14px' }}>สร้างตารางเปล่าแบบอิสระ</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--fg-secondary)', lineHeight: '1.4' }}>
                    สร้างเอกสารที่มีทั้งส่วนของตารางและกล่องจดบันทึกผสมกันได้อย่างอิสระ
                  </p>
                </div>
                <span className="text-mono" style={{ fontSize: '10px', color: 'var(--fg-accent-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                  <Plus size={10} /> สร้างใหม่
                </span>
              </div>

              <div 
                className="card animate-slide-up template-card"
                onClick={triggerImportFile}
                style={{ cursor: 'pointer', borderLeft: '4px solid #7928ca', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Upload size={18} style={{ color: '#7928ca' }} />
                    <strong style={{ fontSize: '14px' }}>นำเข้าตาราง (Import JSON)</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--fg-secondary)', lineHeight: '1.4' }}>
                    โหลดไฟล์ตารางหรือคู่มือที่เคยแบ็กอัปและส่งออกไว้กลับเข้าสู่ระบบ
                  </p>
                </div>
                <span className="text-mono" style={{ fontSize: '10px', color: '#7928ca', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                  <Upload size={10} /> เลือกไฟล์ JSON
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportFile} 
                  style={{ display: 'none' }} 
                  accept=".json" 
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 className="text-mono" style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)' }}>
                เอกสารที่คุณบันทึกไว้ ({filteredSheets.length})
              </h3>
            </div>

            {filteredSheets.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 0', border: '1px dashed var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
                <BookOpen size={40} strokeWidth={1} style={{ marginBottom: '12px', color: 'var(--fg-tertiary)' }} />
                <p className="empty-state-title" style={{ fontSize: '14px', fontWeight: 600 }}>ไม่พบตารางหรือคู่มือ</p>
                <p className="empty-state-desc" style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>
                  {searchQuery ? 'ไม่พบตารางที่สอดคล้องกับการค้นหาของคุณ' : 'ยังไม่มีตารางที่สร้างขึ้น คลิกเทมเพลตด้านบนเพื่อเริ่มต้น!'}
                </p>
              </div>
            ) : (
              <div className="sheets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredSheets.map(sheet => {
                  const tableCount = sheet.sections.filter(s => s.type === 'table').length;
                  const textCount = sheet.sections.filter(s => s.type === 'text').length;
                  
                  return (
                    <div 
                      key={sheet.id}
                      className="card animate-slide-up sheet-card"
                      onClick={() => handleOpenSheet(sheet)}
                      style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '160px', borderLeft: sheet.isPinned ? '3px solid #7928ca' : '1px solid var(--border-primary)' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, lineHeight: '1.4', wordBreak: 'break-word', color: 'var(--fg-primary)' }}>
                            {sheet.title}
                          </h4>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={(e) => togglePinSheet(sheet.id, e)}
                              className="note-action-btn"
                              style={{ color: sheet.isPinned ? '#7928ca' : 'var(--fg-tertiary)' }}
                              title={sheet.isPinned ? 'ยกเลิกการปักหมุด' : 'ปักหมุดเอกสารนี้'}
                            >
                              <Pin size={13} style={{ fill: sheet.isPinned ? '#7928ca' : 'none' }} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSheet(sheet.id, e)}
                              className="note-action-btn"
                              title="ลบเอกสาร"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        {sheet.description && (
                          <p style={{ fontSize: '12px', color: 'var(--fg-secondary)', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {sheet.description}
                          </p>
                        )}
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                        <span style={{ color: 'var(--fg-tertiary)' }} className="text-mono">
                          อัปเดต: {new Date(sheet.updatedAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {tableCount > 0 && (
                            <span className="badge text-mono" style={{ padding: '2px 6px', fontSize: '9px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--fg-secondary)' }}>
                              <Table size={9} style={{ marginRight: '3px' }} /> {tableCount} ตาราง
                            </span>
                          )}
                          {textCount > 0 && (
                            <span className="badge text-mono" style={{ padding: '2px 6px', fontSize: '9px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--fg-secondary)' }}>
                              <AlignLeft size={9} style={{ marginRight: '3px' }} /> {textCount} ข้อความ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        
        /* 2. DETAIL & READ/EDIT VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Header controls for Detail View */}
          <div className="sheet-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-primary)', paddingBottom: '16px', marginBottom: '20px', flexShrink: 0 }}>
            <button 
              className="secondary-btn text-mono" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '32px', padding: '0 10px' }}
              onClick={() => setSelectedSheetId(null)}
            >
              <ArrowLeft size={13} />
              <span>กลับหน้าแรก</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="secondary-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '32px', padding: '0 12px' }}
                onClick={() => handleExportSheet(activeSheet!)}
                title="ส่งออกตารางข้อมูลเป็นไฟล์ JSON เพื่อบันทึกเก็บไว้"
              >
                <Download size={13} />
                <span>ส่งออก (Export JSON)</span>
              </button>

              <button
                className={`secondary-btn ${isEditing ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '32px', padding: '0 12px' }}
                onClick={toggleEditMode}
              >
                {isEditing ? (
                  <>
                    <Eye size={13} />
                    <span>โหมดอ่านหนังสือ (Read)</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={13} />
                    <span>แก้ไขข้อมูล (Edit)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Core Content Area */}
          <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
            
            {/* Meta Editor (Show input in Edit mode, text in Read mode) */}
            <div className="sheet-meta-section animate-slide-up" style={{ marginBottom: '32px', borderBottom: '1px dashed var(--border-primary)', paddingBottom: '20px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    className="sheet-title-input"
                    value={editingTitle}
                    onChange={(e) => handleUpdateSheetMeta('title', e.target.value)}
                    placeholder="หัวข้อตาราง/คู่มือหลัก"
                    style={{ fontSize: '22px', fontWeight: 800, width: '100%', borderBottom: '2px solid var(--border-primary)', paddingBottom: '6px' }}
                  />
                  <input
                    type="text"
                    className="sheet-desc-input"
                    value={editingDesc}
                    onChange={(e) => handleUpdateSheetMeta('description', e.target.value)}
                    placeholder="คำอธิบายตารางสั้นๆ..."
                    style={{ fontSize: '14px', color: 'var(--fg-secondary)', width: '100%', borderBottom: '1.5px solid var(--border-primary)', paddingBottom: '4px' }}
                  />
                </div>
              ) : (
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--fg-primary)', marginBottom: '8px', lineHeight: '1.3' }}>
                    {activeSheet.title}
                  </h1>
                  {activeSheet.description && (
                    <p style={{ fontSize: '14px', color: 'var(--fg-secondary)', lineHeight: '1.6' }}>
                      {activeSheet.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* SECTIONS RENDER LOOP */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', marginBottom: '80px' }}>
              {activeSheet.sections.map((sec, index) => (
                <div 
                  key={sec.id} 
                  className={`sheet-section-block ${isEditing ? 'editing-block' : ''}`}
                  style={{ 
                    position: 'relative', 
                    padding: isEditing ? '20px' : '0px', 
                    borderRadius: 'var(--radius-lg)', 
                    border: isEditing ? '1.5px dashed var(--border-secondary)' : 'none',
                    backgroundColor: isEditing ? 'var(--bg-secondary)' : 'transparent'
                  }}
                >
                  
                  {/* Edit Section Controllers (Add at top of block if editing) */}
                  {isEditing && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="text-mono" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--fg-secondary)' }}>
                          บล็อกที่ {index + 1}: {sec.type === 'table' ? 'ตารางข้อมูล' : 'ข้อความเขียนสั้น'}
                        </span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button 
                            disabled={index === 0} 
                            onClick={() => handleMoveSection(sec.id, 'up')}
                            style={{ padding: '3px', borderRadius: '4px', opacity: index === 0 ? 0.3 : 1 }}
                            className="note-action-btn"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button 
                            disabled={index === activeSheet.sections.length - 1} 
                            onClick={() => handleMoveSection(sec.id, 'down')}
                            style={{ padding: '3px', borderRadius: '4px', opacity: index === activeSheet.sections.length - 1 ? 0.3 : 1 }}
                            className="note-action-btn"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteSection(sec.id)}
                        className="note-action-btn"
                        style={{ color: 'var(--badge-high-fg)' }}
                        title="ลบบล็อกนี้"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* Section Title */}
                  <div style={{ marginBottom: '12px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                        placeholder="ชื่อบล็อกข้อความ / ตาราง..."
                        style={{ 
                          fontSize: '15px', 
                          fontWeight: 700, 
                          color: 'var(--fg-primary)', 
                          width: '100%', 
                          borderBottom: '1.5px solid var(--border-primary)', 
                          paddingBottom: '2px' 
                        }}
                      />
                    ) : (
                      <h3 className="text-mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg-primary)', borderLeft: '3px solid var(--fg-accent-light)', paddingLeft: '10px' }}>
                        {sec.title}
                      </h3>
                    )}
                  </div>

                  {/* Section Content: TABLE type */}
                  {sec.type === 'table' && (
                    <div style={{ width: '100%', overflowX: 'auto', margin: '8px 0' }}>
                      <table className="custom-guide-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                            {sec.headers.map((h, colIdx) => (
                              <th 
                                key={colIdx} 
                                style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--fg-primary)', position: 'relative' }}
                              >
                                {isEditing ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input
                                      type="text"
                                      value={h}
                                      onChange={(e) => handleUpdateTableHeader(sec.id, colIdx, e.target.value)}
                                      style={{ fontWeight: 600, borderBottom: '1px solid var(--border-secondary)', width: '80%' }}
                                    />
                                    {sec.headers.length > 1 && (
                                      <button 
                                        onClick={() => handleDeleteColumn(sec.id, colIdx)}
                                        style={{ color: 'var(--badge-high-fg)', padding: '2px' }}
                                        title="ลบคอลัมน์"
                                      >
                                        <X size={10} />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span>{h}</span>
                                )}
                              </th>
                            ))}
                            {isEditing && <th style={{ width: '40px' }} />}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.rows.map((row, rowIdx) => (
                            <tr 
                              key={rowIdx} 
                              style={{ borderBottom: '1px solid var(--border-primary)' }}
                              className="table-row-hover"
                            >
                              {row.map((cell, colIdx) => (
                                <td key={colIdx} style={{ padding: '8px 12px', color: 'var(--fg-secondary)' }}>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) => handleUpdateTableCell(sec.id, rowIdx, colIdx, e.target.value)}
                                      style={{ width: '100%', padding: '4px 6px', fontSize: '13px' }}
                                    />
                                  ) : (
                                    <span>{cell}</span>
                                  )}
                                </td>
                              ))}
                              {isEditing && (
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    onClick={() => handleDeleteRow(sec.id, rowIdx)}
                                    className="note-action-btn"
                                    style={{ color: 'var(--badge-high-fg)', padding: '2px' }}
                                    title="ลบแถวนี้"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Edit Table Controllers (Add Row/Column) */}
                      {isEditing && (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                          <button 
                            className="secondary-btn text-mono" 
                            style={{ padding: '4px 8px', fontSize: '11px', height: '26px', gap: '4px' }}
                            onClick={() => handleAddRow(sec.id)}
                          >
                            <Plus size={10} /> แถวใหม่ (Row)
                          </button>
                          <button 
                            className="secondary-btn text-mono" 
                            style={{ padding: '4px 8px', fontSize: '11px', height: '26px', gap: '4px' }}
                            onClick={() => handleAddColumn(sec.id)}
                          >
                            <Plus size={10} /> คอลัมน์ใหม่ (Column)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section Content: TEXT type */}
                  {sec.type === 'text' && (
                    <div style={{ marginTop: '8px', minHeight: '30px' }}>
                      {isEditing ? (
                        <textarea
                          value={sec.content}
                          onChange={(e) => handleUpdateTextContent(sec.id, e.target.value)}
                          placeholder="รายละเอียดข้อความ หรือสร้างรายการหัวข้อแบบใส่ • ขีดแดช ก็ได้..."
                          className="form-input form-textarea"
                          style={{ width: '100%', minHeight: '160px', fontFamily: 'inherit', fontSize: '13px', lineHeight: '1.6' }}
                        />
                      ) : (
                        <div className="sheet-text-read" style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--fg-secondary)' }}>
                          {formatTextContent(sec.content)}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Block Adders (Show at bottom in Edit Mode) */}
            {isEditing && (
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px', 
                  padding: '30px', 
                  border: '1.5px dashed var(--border-primary)', 
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '100px'
                }}
              >
                <span className="text-mono" style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>เพิ่มเนื้อหาในตาราง/คู่มือแผ่นนี้</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="primary-btn text-mono" 
                    style={{ fontSize: '12px', height: '32px', padding: '0 16px', gap: '6px' }}
                    onClick={() => handleAddSection('table')}
                  >
                    <Table size={12} /> เพิ่มตาราง (Table Block)
                  </button>
                  <button 
                    className="primary-btn text-mono" 
                    style={{ fontSize: '12px', height: '32px', padding: '0 16px', gap: '6px' }}
                    onClick={() => handleAddSection('text')}
                  >
                    <AlignLeft size={12} /> เพิ่มบล็อกข้อความ (Text Block)
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Sticky footer for saving in Edit Mode */}
          {isEditing && (
            <div 
              style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                height: '64px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderTop: '1px solid var(--border-primary)', 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center', 
                padding: '0 32px', 
                gap: '12px',
                zIndex: 10
              }}
            >
              <span className="text-mono" style={{ fontSize: '11px', color: 'var(--fg-secondary)' }}>
                บันทึกการแก้ไขลงฐานข้อมูลอัตโนมัติ
              </span>
              <button 
                className="primary-btn text-mono" 
                style={{ height: '36px', fontSize: '12px', gap: '6px' }}
                onClick={toggleEditMode}
              >
                <Save size={13} />
                <span>เสร็จสิ้นและเปิดโหมดอ่าน</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

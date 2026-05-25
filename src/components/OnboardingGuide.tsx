'use client';

import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, StickyNote, Calendar, ClipboardList, Clock, ShieldCheck } from 'lucide-react';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--fg-primary)', marginBottom: '8px' }}>
              <svg viewBox="0 0 75 65" width="40" height="40" fill="currentColor">
                <polygon points="37.5,0 75,65 0,65" />
              </svg>
            </div>
            <h2 className="text-mono" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>Welcome to LuciaNote</h2>
            <p style={{ fontSize: '14px', color: 'var(--fg-secondary)', lineHeight: '1.6', maxWidth: '380px' }}>
              Your beautiful, ultra-minimalist, offline-first dashboard designed to organize notes, calendar schedules, and tasks with Vercel design aesthetics.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)', marginTop: '8px' }}>
              <ShieldCheck size={14} style={{ color: '#50e3c2' }} />
              <span className="text-mono" style={{ fontSize: '10px', color: 'var(--fg-secondary)' }}>100% OFFLINE LOCALSTORAGE SECURITY</span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '50%', backgroundColor: 'rgba(0, 112, 243, 0.05)', color: '#0070f3', marginBottom: '8px' }}>
              <StickyNote size={36} />
            </div>
            <h3 className="text-mono" style={{ fontSize: '18px', fontWeight: 700 }}>Notes & Immersive Zen Mode</h3>
            <p style={{ fontSize: '14px', color: 'var(--fg-secondary)', lineHeight: '1.6', maxWidth: '380px' }}>
              Keep thoughts organized on card boards. Need absolute focus? Toggle **Zen Mode** inside any note to experience a fullscreen distraction-free typewriter canvas.
            </p>
            <p style={{ fontSize: '12px', color: '#0070f3', fontStyle: 'italic', fontWeight: 500 }}>
              *Features real synthesized mechanical keyboard typewriter clicks!*
            </p>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '50%', backgroundColor: 'rgba(80, 227, 194, 0.05)', color: '#50e3c2', marginBottom: '8px' }}>
              <Calendar size={36} />
            </div>
            <h3 className="text-mono" style={{ fontSize: '18px', fontWeight: 700 }}>Dynamic Scheduler Calendar</h3>
            <p style={{ fontSize: '14px', color: 'var(--fg-secondary)', lineHeight: '1.6', maxWidth: '380px' }}>
              Tap any date on the 6-week month grid to inspect schedules or register events. On mobile viewports, crowded calendar cells automatically transform into neat colored status dots!
            </p>
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '50%', backgroundColor: 'rgba(245, 166, 35, 0.05)', color: '#f5a623', marginBottom: '8px' }}>
              <ClipboardList size={36} />
            </div>
            <h3 className="text-mono" style={{ fontSize: '18px', fontWeight: 700 }}>Tasks & Thai-English NLP Parser</h3>
            <p style={{ fontSize: '14px', color: 'var(--fg-secondary)', lineHeight: '1.6', maxWidth: '380px' }}>
              Eliminate complex form-filling! Type tasks naturally like:
              <br />
              <code style={{ display: 'block', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', padding: '6px', borderRadius: '4px', marginTop: '6px', fontSize: '11px', color: 'var(--fg-primary)', fontFamily: 'var(--font-mono)' }}>
                "จองคิวหมอ พรุ่งนี้ #ด่วน #สุขภาพ @daily"
              </code>
              <br />
              LuciaNote automatically extracts titles, hashtags as categories, priorities, due dates, and sets daily habit loops!
            </p>
          </div>
        );

      case 5:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '50%', backgroundColor: 'rgba(121, 40, 202, 0.05)', color: '#7928ca', marginBottom: '8px' }}>
              <Sparkles size={36} />
            </div>
            <h3 className="text-mono" style={{ fontSize: '18px', fontWeight: 700 }}>Quick Scratchpad Drawer</h3>
            <p style={{ fontSize: '14px', color: 'var(--fg-secondary)', lineHeight: '1.6', maxWidth: '380px' }}>
              Tap the Scratchpad button on the top right header to toggle a draft area. Copy-paste lists or raw transcripts, then turn lines into clean formatted Tasks or formal Notes with just one click!
            </p>
            <p style={{ fontSize: '13px', color: 'var(--fg-secondary)', fontWeight: 600, marginTop: '8px' }}>
              You are ready! Let's build your workspace.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div
        className="modal-content animate-slide-up"
        style={{
          maxWidth: '460px',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-primary)',
          overflow: 'hidden'
        }}
      >
        <div className="modal-header" style={{ borderBottom: 'none', padding: '16px 20px 0 20px', justifyContent: 'flex-end' }}>
          <button className="modal-close" onClick={onClose} title="Skip Guide" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '0 32px 32px 32px' }}>
          {renderStepContent()}
        </div>

        <div
          className="modal-footer"
          style={{
            borderTop: '1px solid var(--border-primary)',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >
          {/* Progress dots indicators */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: i + 1 === currentStep ? 'var(--fg-primary)' : 'var(--border-secondary)',
                  transition: 'background-color 0.2s'
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep > 1 && (
              <button
                className="secondary-btn"
                onClick={prevStep}
                style={{ height: '32px', padding: '0 12px', fontSize: '12px', gap: '4px' }}
              >
                <ArrowLeft size={12} />
                <span>Back</span>
              </button>
            )}

            <button
              className="primary-btn"
              onClick={nextStep}
              style={{ height: '32px', padding: '0 12px', fontSize: '12px', gap: '4px' }}
            >
              <span>{currentStep === totalSteps ? "Let's Go!" : "Next"}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

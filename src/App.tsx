import React, { useState, useEffect } from 'react';
import { MobileSurveyView } from './components/MobileSurveyView';
import { ProjectorDashboardView } from './components/ProjectorDashboardView';
import { StandaloneCodeGuideView } from './components/StandaloneCodeGuideView';
import { FirebaseSettingsModal } from './components/FirebaseSettingsModal';
import { Smartphone, MonitorPlay, FileCode, Sliders, Upload } from 'lucide-react';
import { UploadDataModal } from './components/UploadDataModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'survey' | 'guide'>('dashboard');
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Check URL query parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'survey') {
      setCurrentView('survey');
    } else if (viewParam === 'guide' || viewParam === 'code') {
      setCurrentView('guide');
    } else if (viewParam === 'dashboard') {
      setCurrentView('dashboard');
    }
  }, []);

  const changeView = (view: 'dashboard' | 'survey' | 'guide') => {
    setCurrentView(view);
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Application Mode Switcher Bar */}
      <nav className="w-full bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 px-3 py-2 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Brand & Live status */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="font-bold text-sm text-white tracking-tight">
              EventPulse <span className="font-normal text-xs text-slate-400">| ระบบประเมินการอบรม</span>
            </span>
          </div>

          {/* View Mode Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            
            <button
              onClick={() => changeView('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>จอ Dashboard โปรเจกเตอร์</span>
            </button>

            <button
              onClick={() => changeView('survey')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'survey'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>หน้าทำแบบสอบถาม (มือถือ)</span>
            </button>

            <button
              onClick={() => changeView('guide')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'guide'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">โค้ดแยก 2 ไฟล์ &</span>
              <span>วิธีตั้งค่า Firebase</span>
            </button>

          </div>

          {/* Quick Settings & Upload */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="อัปโหลดไฟล์ Excel หรือ CSV"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">อัปโหลด Excel/CSV</span>
            </button>

            <button
              onClick={() => setIsFirebaseModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              title="ตั้งค่า Firebase Realtime Database URL"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

        </div>
      </nav>

      {/* Main View Container */}
      <div className="flex-1">
        {currentView === 'dashboard' && (
          <ProjectorDashboardView
            onOpenMobileView={() => changeView('survey')}
            onOpenCodeGuide={() => changeView('guide')}
            onOpenFirebaseConfig={() => setIsFirebaseModalOpen(true)}
          />
        )}

        {currentView === 'survey' && (
          <MobileSurveyView onGoToDashboard={() => changeView('dashboard')} />
        )}

        {currentView === 'guide' && (
          <StandaloneCodeGuideView onBackToDashboard={() => changeView('dashboard')} />
        )}
      </div>

      {/* Firebase Cloud Connection Modal */}
      <FirebaseSettingsModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* Global Upload Data Modal */}
      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

    </div>
  );
}

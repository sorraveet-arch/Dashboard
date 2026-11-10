import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { X, Check, Flame, AlertCircle } from 'lucide-react';

interface FirebaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSettingsModal: React.FC<FirebaseSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [databaseURL, setDatabaseURL] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    const config = storage.getFirebaseConfig();
    if (config?.databaseURL) {
      setDatabaseURL(config.databaseURL);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (databaseURL.trim()) {
      storage.setFirebaseConfig({
        apiKey: 'custom',
        projectId: 'custom',
        databaseURL: databaseURL.trim(),
      });
    } else {
      storage.setFirebaseConfig(null);
    }
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    storage.setFirebaseConfig(null);
    setDatabaseURL('');
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">ตั้งค่า Firebase Cloud</h2>
            <p className="text-xs text-slate-400">สำหรับเชื่อมต่อฐานข้อมูลข้ามเครือข่ายจริง</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Firebase Realtime Database URL
            </label>
            <input
              type="url"
              placeholder="https://your-app-default-rtdb.asia-southeast1.firebasedatabase.app"
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 leading-normal">
              *หากเว้นว่างไว้ ระบบจะทำงานในโหมด Offline Real-time ซิงก์ข้ามแท็บในเครื่องเดียวกันทันที
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              อย่าลืมตั้งค่า Security Rules ใน Firebase Console ให้ <code>.read: true, .write: true</code> ในโหนด <code>evaluations</code>
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {savedStatus ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกแล้ว!</span>
                </>
              ) : (
                <span>บันทึกการตั้งค่า</span>
              )}
            </button>

            {databaseURL && (
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                ล้างค่า
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

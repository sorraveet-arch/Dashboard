import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { EVALUATION_QUESTIONS, RATING_OPTIONS } from '../constants/questions';
import { storage } from '../services/storage';
import { CheckCircle2, AlertCircle, RefreshCw, Sparkles, Send, ShieldCheck, Heart, Upload, FileSpreadsheet } from 'lucide-react';
import { UploadDataModal } from './UploadDataModal';

interface MobileSurveyViewProps {
  onGoToDashboard?: () => void;
}

export const MobileSurveyView: React.FC<MobileSurveyViewProps> = ({ onGoToDashboard }) => {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
  });
  const [suggestions, setSuggestions] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setHasSubmitted(storage.hasAlreadySubmitted());
  }, []);

  const handleScoreSelect = (questionId: string, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const answeredCount = Object.values(answers).filter((val) => val > 0).length;
  const progressPercentage = (answeredCount / 5) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check completeness
    const missing = Object.entries(answers).some(([, val]) => val === 0);
    if (missing) {
      setErrorMessage('กรุณาเลือกคะแนนให้ครบทั้ง 5 ข้อก่อนกดส่งแบบประเมิน');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      await storage.saveResponse({
        q1: answers.q1,
        q2: answers.q2,
        q3: answers.q3,
        q4: answers.q4,
        q5: answers.q5,
        suggestions: suggestions.trim(),
      });

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.65 },
        });
      } catch (err) {
        console.warn('Confetti error', err);
      }

      setHasSubmitted(true);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForTesting = () => {
    storage.resetDeviceSubmissionStatus();
    setHasSubmitted(false);
    setShowSuccessModal(false);
    setAnswers({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
    setSuggestions('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center pb-24">
      {/* Sticky Mobile Header */}
      <header className="w-full bg-slate-800/90 backdrop-blur border-b border-slate-700/60 sticky top-0 z-30 px-4 py-3 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>แบบประเมินนิรนาม ไม่ระบุตัวตน</span>
            </div>
            <h1 className="text-base font-bold text-white leading-tight">ความพึงพอใจการฝึกอบรม</h1>
          </div>
          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              className="text-xs text-slate-300 hover:text-white bg-slate-700/80 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-600 transition-colors"
            >
              ดู Dashboard จอ
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {!hasSubmitted && (
          <div className="max-w-md mx-auto mt-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>ความคืบหน้า</span>
              <span className="font-num font-semibold text-emerald-400">
                {answeredCount}/5 ข้อ ({Math.round(progressPercentage)}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="w-full max-w-md px-4 mt-5 space-y-5 flex-1">
        {/* Intro Guidance */}
        {!hasSubmitted && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed shadow-sm">
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>คำชี้แจงในการตอบแบบสอบถาม</span>
            </p>
            โปรดเลือกให้คะแนนตามความรู้สึกจริงของท่าน (1 = น้อยที่สุด จนถึง 5 = มากที่สุด)
            ข้อมูลทั้งหมดจะนำไปประมวลผลขึ้นจอ Dashboard ทันที
          </div>
        )}

        {/* Upload Raw Data Banner */}
        <div className="p-3 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/70 rounded-2xl flex items-center justify-between gap-2 transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">นำเข้าข้อมูลจากไฟล์</p>
              <p className="text-[11px] text-slate-400">อัปโหลดไฟล์ Excel (.xlsx) หรือ CSV</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>อัปโหลด</span>
          </button>
        </div>

        {/* Already Submitted Warning / Acknowledgement */}
        {hasSubmitted ? (
          <div className="bg-slate-800/80 border border-emerald-500/40 rounded-3xl p-6 text-center shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">บันทึกแบบประเมินเรียบร้อยแล้ว</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              ขอบคุณสำหรับความร่วมมือของท่าน คะแนนและข้อเสนอแนะถูกส่งขึ้นสู่จอ Dashboard
              เรียบร้อยแล้ว และระบบทำการป้องกันการส่งซ้ำในเครื่องนี้
            </p>

            <div className="pt-4 border-t border-slate-700/60 space-y-3">
              {onGoToDashboard && (
                <button
                  onClick={onGoToDashboard}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                >
                  เปิดดูผลสดบนหน้าจอ Dashboard
                </button>
              )}

              <button
                type="button"
                onClick={handleResetForTesting}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>[สำหรับทดสอบระบบ] ล้างค่าเพื่อตอบใหม่อีกครั้ง</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form for 5 Questions */
          <form onSubmit={handleSubmit} className="space-y-5">
            {EVALUATION_QUESTIONS.map((q, qIndex) => {
              const currentVal = answers[q.id];
              return (
                <div
                  key={q.id}
                  className={`bg-slate-800/80 border rounded-2xl p-4.5 shadow-sm space-y-3 transition-colors ${
                    currentVal > 0 ? 'border-emerald-500/30 bg-slate-800/90' : 'border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                        ข้อที่ {qIndex + 1}
                      </span>
                      <h2 className="text-sm font-semibold text-white mt-0.5 leading-snug">
                        {q.title.replace(/^\d+\.\s*/, '')}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">{q.subtitle}</p>
                    </div>
                    {currentVal > 0 && (
                      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-num font-bold">
                        {currentVal} ★
                      </span>
                    )}
                  </div>

                  {/* 1-5 Big Touch Buttons */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
                    {RATING_OPTIONS.map((opt) => {
                      const isSelected = currentVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleScoreSelect(q.id, opt.value)}
                          className={`min-h-[56px] py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-md shadow-emerald-500/20 scale-[1.02] ring-2 ring-emerald-400/30'
                              : 'border-slate-700 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="text-lg leading-none">{opt.emoji}</span>
                          <span className="font-num font-bold text-xs">{opt.value}</span>
                          <span className="text-[9px] leading-none opacity-80 truncate max-w-[48px]">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Optional Suggestions Box */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4.5 shadow-sm space-y-2">
              <label htmlFor="mobile-suggestions" className="block text-sm font-semibold text-white">
                ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุง{' '}
                <span className="text-xs font-normal text-slate-400">(ไม่บังคับ)</span>
              </label>
              <p className="text-xs text-slate-400">
                ความคิดเห็น สิ่งที่ชอบ หรือสิ่งที่ควรพัฒนาในหลักสูตรถัดไป
              </p>
              <textarea
                id="mobile-suggestions"
                rows={3}
                maxLength={400}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="พิมพ์ข้อคิดเห็นหรือข้อเสนอแนะที่นี่..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              />
              <div className="text-right text-[11px] text-slate-500 font-num">
                {suggestions.length}/400 ตัวอักษร
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>กำลังส่งข้อมูล...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>ส่งแบบประเมินความพึงพอใจ</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-rose-400/80 fill-rose-400/80 inline" />
              <span>ขอขอบพระคุณทุกความคิดเห็นเพื่อการพัฒนาอย่างต่อเนื่อง</span>
            </p>
          </form>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">บันทึกข้อมูลสำเร็จ!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              คะแนนของท่านได้ถูกรวบรวมและแสดงผลสดบนจอ Dashboard เรียบร้อยแล้ว
            </p>
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all"
              >
                เสร็จสิ้น
              </button>
              {onGoToDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    onGoToDashboard();
                  }}
                  className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-xl transition-all"
                >
                  ไปที่หน้าจอ Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Data Modal */}
      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

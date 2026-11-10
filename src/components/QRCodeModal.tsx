import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyUrl: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, surveyUrl }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (surveyUrl) {
      QRCode.toDataURL(surveyUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [surveyUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>สำหรับผู้เข้าอบรมสแกนบนมือถือ</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">สแกนเพื่อร่วมประเมิน</h2>
          <p className="text-xs text-slate-400 mt-1">
            ใช้กล้องมือถือสแกน ไม่ต้องติดตั้งแอปและไม่ต้องลงทะเบียน
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-3xl inline-block shadow-xl border-4 border-slate-800 mx-auto">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code สำหรับทำแบบประเมิน"
              className="w-56 h-56 md:w-64 md:h-64 object-contain rounded-xl"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
              กำลังสร้าง QR Code...
            </div>
          )}
        </div>

        {/* URL Link and Copy */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="truncate flex-1 text-left select-all font-mono text-[11px] text-slate-400">
              {surveyUrl}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 transition-all text-xs font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <a
              href={surveyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              <span>เปิดหน้าแบบประเมินในแท็บใหม่</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all cursor-pointer"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
};

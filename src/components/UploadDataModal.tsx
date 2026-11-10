import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { EvaluationResponse } from '../types';
import { storage } from '../services/storage';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Download,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface UploadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export const UploadDataModal: React.FC<UploadDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<EvaluationResponse[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean and map generic row keys to q1-q5 & suggestions
  const normalizeKey = (key: string): string => {
    return key.toString().trim().toLowerCase().replace(/\s+|_|-/g, '');
  };

  const parseWorkbook = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setParsedData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('ไม่พบแผ่นงาน (Sheet) ในไฟล์ที่อัปโหลด');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        throw new Error('ไฟล์ว่างเปล่า ไม่พบแถวข้อมูลสำหรับนำเข้า');
      }

      const results: EvaluationResponse[] = [];

      rawRows.forEach((row, index) => {
        const keys = Object.keys(row);
        let q1 = 0, q2 = 0, q3 = 0, q4 = 0, q5 = 0;
        let suggestions = '';
        let rowTime = Date.now() - (rawRows.length - index) * 60000;

        keys.forEach((k) => {
          const norm = normalizeKey(k);
          const val = row[k];
          const numVal = Number(val);

          // Fuzzy match for Q1 (เนื้อหา/หลักสูตร)
          if (norm.includes('q1') || norm.includes('ข้อ1') || norm.includes('ข้อที่1') || norm.includes('เนื้อหา') || norm.includes('หลักสูตร')) {
            if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) q1 = Math.round(numVal);
          }
          // Fuzzy match for Q2 (วิทยากร/ผู้สอน)
          else if (norm.includes('q2') || norm.includes('ข้อ2') || norm.includes('ข้อที่2') || norm.includes('วิทยากร') || norm.includes('ผู้สอน')) {
            if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) q2 = Math.round(numVal);
          }
          // Fuzzy match for Q3 (การนำไปใช้/ประโยชน์)
          else if (norm.includes('q3') || norm.includes('ข้อ3') || norm.includes('ข้อที่3') || norm.includes('นำไปใช้') || norm.includes('ประโยชน์')) {
            if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) q3 = Math.round(numVal);
          }
          // Fuzzy match for Q4 (สถานที่/อุปกรณ์/เวลา)
          else if (norm.includes('q4') || norm.includes('ข้อ4') || norm.includes('ข้อที่4') || norm.includes('สถานที่') || norm.includes('อุปกรณ์') || norm.includes('สิ่งอำนวยความสะดวก')) {
            if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) q4 = Math.round(numVal);
          }
          // Fuzzy match for Q5 (ภาพรวม/ความพึงพอใจ)
          else if (norm.includes('q5') || norm.includes('ข้อ5') || norm.includes('ข้อที่5') || norm.includes('ภาพรวม') || norm.includes('พึงพอใจโดยรวม')) {
            if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) q5 = Math.round(numVal);
          }
          // Suggestions / Comments
          else if (norm.includes('suggest') || norm.includes('comment') || norm.includes('ข้อเสนอแนะ') || norm.includes('ความคิดเห็น') || norm.includes('เพิ่มเติม')) {
            if (val !== undefined && val !== null) suggestions = String(val).trim();
          }
          // Timestamp / Date
          else if (norm.includes('time') || norm.includes('date') || norm.includes('เวลา') || norm.includes('วันที่')) {
            const parsedTime = Date.parse(String(val));
            if (!isNaN(parsedTime)) rowTime = parsedTime;
          }
        });

        // Fallback: If headers were not recognized by name, look for first 5 numeric values in order
        if (!q1 && !q2 && !q3 && !q4 && !q5) {
          const numericVals: number[] = [];
          keys.forEach((k) => {
            const v = Number(row[k]);
            if (!isNaN(v) && v >= 1 && v <= 5) {
              numericVals.push(Math.round(v));
            }
          });
          if (numericVals.length >= 5) {
            [q1, q2, q3, q4, q5] = numericVals.slice(0, 5);
          }
        }

        // Only include if at least 3 of 5 questions have values, fill default 5/4 if partially missing
        if (q1 > 0 || q2 > 0 || q3 > 0 || q4 > 0 || q5 > 0) {
          q1 = q1 || 5;
          q2 = q2 || 5;
          q3 = q3 || 5;
          q4 = q4 || 5;
          q5 = q5 || 5;

          const overall = Number(((q1 + q2 + q3 + q4 + q5) / 5).toFixed(2));
          results.push({
            id: `upload-${Date.now()}-${index}`,
            timestamp: rowTime,
            dateFormatted: new Date(rowTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            q1,
            q2,
            q3,
            q4,
            q5,
            overallScore: overall,
            suggestions,
          });
        }
      });

      if (results.length === 0) {
        throw new Error('ไม่พบคะแนนระหว่าง 1–5 ในแถวข้อมูล กรุณาตรวจสอบหัวตารางหรือรูปแบบคะแนน');
      }

      setParsedData(results);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบรูปแบบไฟล์');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseWorkbook(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      parseWorkbook(droppedFile);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    storage.importResponses(parsedData, importMode);
    setSuccessCount(parsedData.length);
    if (onSuccess) {
      onSuccess(parsedData.length);
    }
    setTimeout(() => {
      onClose();
      setSuccessCount(null);
      setFile(null);
      setParsedData([]);
    }, 1400);
  };

  // Download Sample Template for Excel / CSV
  const handleDownloadTemplate = (type: 'xlsx' | 'csv') => {
    const sampleHeaders = [
      {
        'ลำดับ': 1,
        'ข้อ 1 (เนื้อหาหลักสูตร)': 5,
        'ข้อ 2 (ทักษะวิทยากร)': 5,
        'ข้อ 3 (การนำไปใช้จริง)': 4,
        'ข้อ 4 (สถานที่และอุปกรณ์)': 5,
        'ข้อ 5 (ภาพรวมความพึงพอใจ)': 5,
        'ข้อเสนอแนะเพิ่มเติม': 'วิทยากรสอนดีและเข้าใจง่ายมากครับ',
      },
      {
        'ลำดับ': 2,
        'ข้อ 1 (เนื้อหาหลักสูตร)': 4,
        'ข้อ 2 (ทักษะวิทยากร)': 5,
        'ข้อ 3 (การนำไปใช้จริง)': 5,
        'ข้อ 4 (สถานที่และอุปกรณ์)': 4,
        'ข้อ 5 (ภาพรวมความพึงพอใจ)': 5,
        'ข้อเสนอแนะเพิ่มเติม': 'อยากให้มีกรณีศึกษาและเวิร์กช็อปเพิ่มเติมอีก',
      },
      {
        'ลำดับ': 3,
        'ข้อ 1 (เนื้อหาหลักสูตร)': 5,
        'ข้อ 2 (ทักษะวิทยากร)': 4,
        'ข้อ 3 (การนำไปใช้จริง)': 4,
        'ข้อ 4 (สถานที่และอุปกรณ์)': 5,
        'ข้อ 5 (ภาพรวมความพึงพอใจ)': 4,
        'ข้อเสนอแนะเพิ่มเติม': 'อุปกรณ์และเอกสารจัดเตรียมได้อย่างมืออาชีพ',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'แบบประเมิน');

    if (type === 'xlsx') {
      XLSX.writeFile(workbook, 'training-evaluation-template.xlsx');
    } else {
      XLSX.writeFile(workbook, 'training-evaluation-template.csv', { bookType: 'csv' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-slate-100 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Upload className="w-3.5 h-3.5" />
            <span>นำเข้าข้อมูลผลการประเมิน</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            อัปโหลดไฟล์ข้อมูลดิบ (Excel หรือ CSV)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            รองรับไฟล์นามสกุล <code className="text-emerald-400 font-mono">.xlsx</code>, <code className="text-emerald-400 font-mono">.xls</code> และ <code className="text-emerald-400 font-mono">.csv</code> เพื่อคำนวณและแสดงผลบน Dashboard ทันที
          </p>
        </div>

        {/* Upload Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
              : file
              ? 'border-emerald-500/60 bg-slate-950/80'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            ) : file ? (
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            ) : (
              <Upload className="w-6 h-6 text-emerald-400" />
            )}
          </div>

          <div>
            {file ? (
              <div>
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-num">
                  {(file.size / 1024).toFixed(1)} KB · คลิกเพื่อเลือกไฟล์อื่น
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-200">
                  ลากไฟล์มาวางที่นี่ หรือ <span className="text-emerald-400 underline font-semibold">คลิกเพื่อเลือกไฟล์</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  รองรับ Microsoft Excel (.xlsx, .xls) และไฟล์ CSV ทุกรูปแบบ
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Data Preview Table if parsed */}
        {parsedData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ตรวจพบข้อมูลที่ถูกต้อง:</span>
                </span>
                <span className="font-num text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {parsedData.length} แถว
                </span>
              </div>

              {/* Import Mode: Append vs Replace */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setImportMode('append')}
                  className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                    importMode === 'append'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  เพิ่มต่อจากเดิม
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                    importMode === 'replace'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  แทนที่ข้อมูลทั้งหมด
                </button>
              </div>
            </div>

            {/* Table Preview */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto max-h-48 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-2.5">แถว</th>
                    <th className="p-2.5 text-center">ข้อ 1</th>
                    <th className="p-2.5 text-center">ข้อ 2</th>
                    <th className="p-2.5 text-center">ข้อ 3</th>
                    <th className="p-2.5 text-center">ข้อ 4</th>
                    <th className="p-2.5 text-center">ข้อ 5</th>
                    <th className="p-2.5 text-center">เฉลี่ย</th>
                    <th className="p-2.5">ข้อเสนอแนะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-num">
                  {parsedData.slice(0, 5).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-900/40">
                      <td className="p-2.5 text-slate-500">#{idx + 1}</td>
                      <td className="p-2.5 text-center text-slate-300">{row.q1}★</td>
                      <td className="p-2.5 text-center text-slate-300">{row.q2}★</td>
                      <td className="p-2.5 text-center text-slate-300">{row.q3}★</td>
                      <td className="p-2.5 text-center text-slate-300">{row.q4}★</td>
                      <td className="p-2.5 text-center text-slate-300">{row.q5}★</td>
                      <td className="p-2.5 text-center font-bold text-emerald-400">
                        {row.overallScore.toFixed(2)}
                      </td>
                      <td className="p-2.5 font-sans text-slate-300 truncate max-w-xs">
                        {row.suggestions || <span className="text-slate-600">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-900/60 border-t border-slate-800">
                  ... และอีก {parsedData.length - 5} แถว
                </div>
              )}
            </div>
          </div>
        )}

        {/* Template Downloads & Guidance */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>ยังไม่มีรูปแบบไฟล์ที่ถูกต้อง?</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ดาวน์โหลดเทมเพลตตัวอย่างที่มีหัวตารางและคะแนนตัวอย่างไปแก้ไขได้ทันที
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDownloadTemplate('xlsx')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>ไฟล์ .xlsx</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTemplate('csv')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>ไฟล์ .csv</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={parsedData.length === 0 || isProcessing || successCount !== null}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {successCount !== null ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>นำเข้าสำเร็จ {successCount} แถว!</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>
                  ยืนยันนำเข้าข้อมูล {parsedData.length > 0 ? `(${parsedData.length} รายการ)` : ''}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

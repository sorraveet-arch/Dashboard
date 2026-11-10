import React, { useState } from 'react';
import { STANDALONE_SURVEY_HTML } from '../standalone/surveyHtml';
import { STANDALONE_DASHBOARD_HTML } from '../standalone/dashboardHtml';
import {
  FileCode2,
  BookOpen,
  Copy,
  Check,
  Download,
  Flame,
  Globe,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

interface StandaloneCodeGuideViewProps {
  onBackToDashboard: () => void;
}

export const StandaloneCodeGuideView: React.FC<StandaloneCodeGuideViewProps> = ({
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'survey' | 'dashboard'>('guide');
  const [copiedSurvey, setCopiedSurvey] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);

  const handleCopy = (text: string, type: 'survey' | 'dashboard') => {
    navigator.clipboard.writeText(text);
    if (type === 'survey') {
      setCopiedSurvey(true);
      setTimeout(() => setCopiedSurvey(false), 2000);
    } else {
      setCopiedDashboard(true);
      setTimeout(() => setCopiedDashboard(false), 2000);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBoth = () => {
    downloadFile(STANDALONE_SURVEY_HTML, 'survey.html');
    setTimeout(() => {
      downloadFile(STANDALONE_DASHBOARD_HTML, 'dashboard.html');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              <FileCode2 className="w-4 h-4" />
              <span>คู่มือการใช้งานและการติดตั้งระบบ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              โค้ดแยก 2 ไฟล์ & วิธีตั้งค่า Firebase เรียลไทม์
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              โครงสร้างไฟล์ HTML + JavaScript + Firebase Realtime Database สามารถนำไปโฮสต์ฟรีได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBoth}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดทั้ง 2 ไฟล์ (.html)</span>
            </button>

            <button
              onClick={onBackToDashboard}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs md:text-sm rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              กลับหน้า Dashboard
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. ขั้นตอนติดตั้ง Firebase & Deploy</span>
          </button>

          <button
            onClick={() => setActiveTab('survey')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'survey'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>2. โค้ด survey.html (หน้าตอบ)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. โค้ด dashboard.html (หน้าจอ)</span>
          </button>
        </div>

        {/* Tab 1: Deployment & Firebase Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-6">

            {/* Step 1 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  1
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span>สร้าง Firebase Project ฟรี (Spark Plan)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ใช้ Google Account ส่วนบุคคลหรือขององค์กร เปิดใช้งานได้ฟรี 100% ไม่มีค่าบริการ
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>เข้าไปที่เว็บไซต์ <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">https://console.firebase.google.com</a></li>
                  <li>คลิกปุ่ม <strong>"Add project"</strong> (สร้างโปรเจกต์)</li>
                  <li>ตั้งชื่อโปรเจกต์ เช่น <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">training-satisfaction-app</code></li>
                  <li>ขั้นตอน Google Analytics สามารถเลือกเปิดหรือปิดก็ได้ จากนั้นกด <strong>"Create project"</strong></li>
                </ol>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  2
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <span>เปิดใช้งาน Firebase Realtime Database</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ฐานข้อมูล NoSQL แบบเรียลไทม์ที่กระจายข้อมูลสู่ทุกเครื่องในเวลาเสี้ยววินาที
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>ในเมนูด้านซ้าย เลือก <strong>Build</strong> &gt; <strong>Realtime Database</strong></li>
                  <li>คลิกปุ่ม <strong>"Create Database"</strong></li>
                  <li>
                    เลือกตำแหน่ง Cloud Database: แนะนำเลือก <strong>Singapore (asia-southeast1)</strong> เพื่อความเร็วสูงสุดสำหรับผู้ใช้ในประเทศไทย (หรือเลือก United States ก็ได้)
                  </li>
                  <li>ในหน้า Security Rules เลือก <strong>"Start in test mode"</strong> แล้วกด Enable</li>
                </ol>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  3
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span>ตั้งค่า Security Rules เพื่อเปิดให้อ่าน/เขียนแบบนิรนาม</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ตามโจทย์: ผู้เข้าอบรมตอบแบบประเมินได้ทันทีโดยไม่ต้องล็อกอิน และ Dashboard ดึงข้อมูลมาแสดงผลได้แบบสาธารณะ
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                ไปที่แท็บ <strong>Rules</strong> ของ Realtime Database แล้ววางกฎ JSON นี้ จากนั้นกดปุ่ม <strong>"Publish"</strong>:
              </p>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
{`{
  "rules": {
    "evaluations": {
      ".read": true,
      ".write": true
    }
  }
}`}
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  4
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>นำค่า Firebase Config มาใส่ในทั้ง 2 ไฟล์</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    นำคีย์ที่ได้จาก Firebase Console ไปวางแทนที่ <code className="text-amber-300">firebaseConfig</code> ใน <code className="text-emerald-300">survey.html</code> และ <code className="text-emerald-300">dashboard.html</code>
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>ใน Firebase Console คลิกไอคอน ⚙️ <strong>Project Settings</strong></li>
                  <li>เลื่อนลงมาที่หัวข้อ "Your apps" แล้วกดไอคอนเว็บ <strong>&lt;/&gt;</strong> (Web App)</li>
                  <li>ตั้งชื่อแอป เช่น "Satisfaction Web" แล้วกด Register app</li>
                  <li>คัดลอกบล็อกโค้ด <code className="text-amber-300">const firebaseConfig = &#123; ... &#125;;</code> ไปวางแทนที่ในไฟล์ทั้ง 2 ไฟล์</li>
                </ol>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  5
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-teal-400" />
                    <span>วิธี Deploy ฟรีขึ้น Cloud (ทางเลือกยอดนิยม)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ไฟล์ทั้งสองเป็น Static HTML ธรรมดา นำไปโฮสต์ที่ไหนก็ได้ทันที
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method A: Firebase Hosting */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>ทางเลือก A: Firebase Hosting (แนะนำที่สุด)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ฟรี, มี HTTPS อัตโนมัติ, โดเมน <code className="text-emerald-300">.web.app</code> พร้อมเปิดใช้งาน
                  </p>
                  <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                    <p className="text-slate-500"># 1. ติดตั้ง CLI</p>
                    <p>npm install -g firebase-tools</p>
                    <p className="text-slate-500 mt-2"># 2. เข้าสู่ระบบ</p>
                    <p>firebase login</p>
                    <p className="text-slate-500 mt-2"># 3. เตรียมโฟลเดอร์</p>
                    <p>firebase init hosting</p>
                    <p className="text-slate-500 mt-2"># 4. สั่ง Deploy ขึ้น Cloud ทันที</p>
                    <p className="text-emerald-400">firebase deploy</p>
                  </div>
                </div>

                {/* Method B: GitHub Pages / Static */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>ทางเลือก B: GitHub Pages หรือ Netlify / Vercel</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    เพียงแค่อัปโหลดไฟล์ <code className="text-emerald-300">survey.html</code> และ <code className="text-emerald-300">dashboard.html</code> ขึ้น Repository บน GitHub
                  </p>
                  <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 space-y-2">
                    <p>1. สร้าง Repository บน GitHub</p>
                    <p>2. อัปโหลดทั้ง 2 ไฟล์ขึ้นไป</p>
                    <p>3. ไปที่ Settings &gt; Pages &gt; เลือก Branch: main แล้วกด Save</p>
                    <p className="text-emerald-400 font-medium">4. จะได้รับ URL สำหรับแชร์และขึ้นจอโปรเจกเตอร์ทันที!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  6
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <span>การอัปโหลดไฟล์ข้อมูลดิบ (Excel .xlsx, .xls หรือ CSV)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ระบบรองรับการนำเข้าคะแนนที่เก็บรวบรวมไว้ล่วงหน้าจากแบบฟอร์มภายนอก (Google Forms, กระดาษ ฯลฯ)
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3">
                <p>
                  ระบบมีอัลกอริทึม <strong>Fuzzy Header Matching</strong> ที่ตรวจจับชื่อคอลัมน์อัตโนมัติ ไม่ว่าหัวตารางจะเป็นภาษาไทยหรืออังกฤษ:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold block">ข้อ 1:</span>
                    <span className="text-slate-400">q1, ข้อ 1, เนื้อหา, หลักสูตร</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold block">ข้อ 2:</span>
                    <span className="text-slate-400">q2, ข้อ 2, วิทยากร, ผู้สอน</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold block">ข้อ 3:</span>
                    <span className="text-slate-400">q3, ข้อ 3, นำไปใช้, ประโยชน์</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold block">ข้อ 4:</span>
                    <span className="text-slate-400">q4, ข้อ 4, สถานที่, อุปกรณ์, เวลา</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold block">ข้อ 5:</span>
                    <span className="text-slate-400">q5, ข้อ 5, ภาพรวม, พึงพอใจ</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold block">ข้อเสนอแนะ:</span>
                    <span className="text-slate-400">suggestions, comment, ข้อเสนอแนะ</span>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px]">
                  * สามารถกดปุ่ม <strong>"ดาวน์โหลดเทมเพลตตัวอย่าง (.xlsx / .csv)"</strong> จากหน้าต่างอัปโหลดเพื่อนำไปใส่ข้อมูลได้ทันที
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: survey.html */}
        {activeTab === 'survey' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>ไฟล์ที่ 1: survey.html</span>
                  <span className="text-xs font-normal text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Mobile-first Form
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  หน้าประเมินสำหรับเปิดในสมาร์ตโฟน ปุ่มใหญ่ 1-5 สเกล ป้องกันการส่งซ้ำ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(STANDALONE_SURVEY_HTML, 'survey')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSurvey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกโค้ดแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => downloadFile(STANDALONE_SURVEY_HTML, 'survey.html')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด survey.html</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-[550px] overflow-auto select-all leading-relaxed">
              {STANDALONE_SURVEY_HTML}
            </pre>
          </div>
        )}

        {/* Tab 3: dashboard.html */}
        {activeTab === 'dashboard' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>ไฟล์ที่ 2: dashboard.html</span>
                  <span className="text-xs font-normal text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Projector Live Screen
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  หน้าแดชบอร์ดฉายโปรเจกเตอร์ กราฟแท่ง Chart.js อัปเดตสด พร้อม QR Code และปุ่มโหลด CSV
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(STANDALONE_DASHBOARD_HTML, 'dashboard')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedDashboard ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกโค้ดแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => downloadFile(STANDALONE_DASHBOARD_HTML, 'dashboard.html')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด dashboard.html</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-[550px] overflow-auto select-all leading-relaxed">
              {STANDALONE_DASHBOARD_HTML}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};

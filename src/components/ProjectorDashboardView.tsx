import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { EvaluationResponse } from '../types';
import { EVALUATION_QUESTIONS, interpretLikertScore } from '../constants/questions';
import { storage } from '../services/storage';
import {
  Download,
  Maximize2,
  Minimize2,
  QrCode,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  MessageSquare,
  PlusCircle,
  RotateCcw,
  Sliders,
  ExternalLink,
  PieChart,
  CircleDot,
  BarChart3,
} from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';

interface ProjectorDashboardViewProps {
  onOpenMobileView?: () => void;
  onOpenCodeGuide?: () => void;
  onOpenFirebaseConfig?: () => void;
}

export const ProjectorDashboardView: React.FC<ProjectorDashboardViewProps> = ({
  onOpenMobileView,
  onOpenCodeGuide,
  onOpenFirebaseConfig,
}) => {
  const [responses, setResponses] = useState<EvaluationResponse[]>([]);
  const [chartViewType, setChartViewType] = useState<'circular' | 'bar'>('circular');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [surveyUrl, setSurveyUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'with_comment'>('all');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Determine survey URL
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'survey');
    const fullSurveyUrl = url.toString();
    setSurveyUrl(fullSurveyUrl);

    // Generate small QR Code for the side panel
    QRCode.toDataURL(fullSurveyUrl, {
      width: 180,
      margin: 1,
      color: { dark: '#020617', light: '#ffffff' },
    })
      .then((data) => setQrCodeDataUrl(data))
      .catch((e) => console.error(e));

    // Subscribe to real-time updates
    const unsubscribe = storage.subscribe((updatedResponses) => {
      setResponses(updatedResponses);
      setLastUpdated(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Compute Statistics
  const totalCount = responses.length;

  const questionStats = EVALUATION_QUESTIONS.map((q) => {
    if (totalCount === 0) {
      return { ...q, avg: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }
    const sum = responses.reduce((acc, curr) => acc + (Number(curr[q.id]) || 0), 0);
    const avg = Number((sum / totalCount).toFixed(2));

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    responses.forEach((r) => {
      const score = Number(r[q.id]) as 1 | 2 | 3 | 4 | 5;
      if (counts[score] !== undefined) {
        counts[score]++;
      }
    });

    return {
      ...q,
      avg,
      counts,
    };
  });

  const overallAvg =
    totalCount === 0
      ? 0
      : Number(
          (
            questionStats.reduce((acc, curr) => acc + curr.avg, 0) /
            questionStats.length
          ).toFixed(2)
        );

  const interpretation = interpretLikertScore(overallAvg);

  // Filtered comments
  const comments = responses.filter(
    (r) => r.suggestions && r.suggestions.trim().length > 0
  );

  const displayedComments =
    activeFilter === 'with_comment'
      ? comments
      : comments.slice(0, 15);

  // Compute Total Star Ratings across all answers for the overall Donut Pie Chart
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  responses.forEach((r) => {
    (['q1', 'q2', 'q3', 'q4', 'q5'] as const).forEach((qKey) => {
      const score = Number(r[qKey]) as 1 | 2 | 3 | 4 | 5;
      if (starCounts[score] !== undefined) {
        starCounts[score]++;
      }
    });
  });

  const allRatingsTotal = totalCount * 5;
  const pieColors = {
    5: '#10b981', // Emerald (มากที่สุด)
    4: '#06b6d4', // Cyan (มาก)
    3: '#f59e0b', // Amber (ปานกลาง)
    2: '#f97316', // Orange (น้อย)
    1: '#ef4444', // Rose (น้อยที่สุด)
  };

  const pieLabels = {
    5: { label: 'มากที่สุด (5 ดาว)', emoji: '🤩' },
    4: { label: 'มาก (4 ดาว)', emoji: '😊' },
    3: { label: 'ปานกลาง (3 ดาว)', emoji: '😐' },
    2: { label: 'น้อย (2 ดาว)', emoji: '🙁' },
    1: { label: 'น้อยที่สุด (1 ดาว)', emoji: '😡' },
  };

  // Circumference for Donut Pie = 2 * PI * 60 = 376.99
  const pieCircumference = 376.99;
  let accumulatedOffset = 0;
  const ratingDistributionPie = ([5, 4, 3, 2, 1] as const).map((star) => {
    const count = starCounts[star];
    const fraction = allRatingsTotal > 0 ? count / allRatingsTotal : 0;
    const dash = fraction * pieCircumference;
    const offset = accumulatedOffset;
    accumulatedOffset += dash;
    return {
      star,
      count,
      percent: Math.round(fraction * 100),
      dash,
      offset,
      color: pieColors[star],
      ...pieLabels[star],
    };
  });

  const pieLegendItems = ratingDistributionPie;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSimulateOneResponse = () => {
    const randomScore = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const sampleComments = [
      'อธิบายได้กระชับ ชัดเจน มีตัวอย่างประกอบเข้าใจง่ายมากครับ',
      'สไลด์สวยงาม เอกสารแจกพร้อม นำไปประยุกต์ใช้ต่อยอดได้ทันที',
      'ชอบบรรยากาศในการอบรม เป็นกันเองมากครับ',
      'วิทยากรให้คำแนะนำดีมาก ตอบข้อสงสัยได้ตรงประเด็น',
      'อยากให้มีเวลาฝึกปฏิบัติ (Workshop) เพิ่มขึ้นอีกนิดครับ',
      'ประทับใจมากค่ะ จะบอกต่อให้เพื่อนร่วมงานมาเรียนแน่นอน',
    ];

    storage.saveResponse({
      q1: randomScore(4, 5),
      q2: randomScore(4, 5),
      q3: randomScore(4, 5),
      q4: randomScore(3, 5),
      q5: randomScore(4, 5),
      suggestions: Math.random() > 0.3 ? sampleComments[Math.floor(Math.random() * sampleComments.length)] : '',
    });
  };

  const handleExportCSV = () => {
    storage.exportToCSV(responses, `satisfaction-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto w-full space-y-6">

        {/* Top Control Bar / Projector Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                LIVE REALTIME DASHBOARD
              </span>
              {lastUpdated && (
                <span className="text-xs text-slate-500 hidden sm:inline">
                  (อัปเดตล่าสุด: {lastUpdated})
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1 tracking-tight">
              ผลการประเมินความพึงพอใจการฝึกอบรม
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              ระบบวิเคราะห์ข้อมูลคะแนนแบบสด เหมาะสำหรับฉายขึ้นจอโปรเจกเตอร์ในห้องอบรม
            </p>
          </div>

          {/* Quick Actions for Trainer / Organizer */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Demo Simulator */}
            <button
              onClick={handleSimulateOneResponse}
              className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="จำลองคนกดส่ง 1 คน เพื่อทดสอบการอัปเดตกราฟแบบสดทันที"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ จำลองคำตอบ</span>
            </button>

            {/* Stage QR Modal */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>ขยาย QR Code ขึ้นจอ</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={totalCount === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด CSV</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
              title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'แสดงผลเต็มจอโปรเจกเตอร์'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Optional Settings / Code guide */}
            {onOpenCodeGuide && (
              <button
                onClick={onOpenCodeGuide}
                className="px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium rounded-xl border border-indigo-500/40 transition-all"
              >
                ดูโค้ด & วิธีตั้งค่า
              </button>
            )}
          </div>
        </header>

        {/* Top KPI Cards (High Contrast & Big Readouts for Projectors) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Metric 1: Total Respondents */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>จำนวนผู้ตอบแบบประเมิน</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="font-num text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {totalCount}
              </span>
              <span className="text-sm font-medium text-slate-400">คน</span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>กำลังรับข้อมูลแบบเรียลไทม์</span>
            </div>
          </div>

          {/* Metric 2: Overall Mean Score */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>คะแนนเฉลี่ยรวม (Overall Mean)</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span
                className="font-num text-4xl md:text-5xl font-extrabold tracking-tight"
                style={{ color: interpretation.color }}
              >
                {overallAvg.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-slate-400">/ 5.00</span>
            </div>
            {/* Visual meter bar */}
            <div className="mt-3 space-y-1">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(overallAvg / 5) * 100}%`,
                    backgroundColor: interpretation.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-num">
                <span>0.00</span>
                <span>{Math.round((overallAvg / 5) * 100)}%</span>
                <span>5.00</span>
              </div>
            </div>
          </div>

          {/* Metric 3 & 4: Qualitative Evaluation Interpretation */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm sm:col-span-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>การแปลผลตามเกณฑ์มาตรฐาน (Likert Scale)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              <span className={`px-3.5 py-1.5 rounded-xl font-bold text-sm md:text-base ${interpretation.badgeClass}`}>
                {interpretation.label}
              </span>
              <p className="text-xs text-slate-300 flex-1 leading-relaxed">
                {interpretation.description}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2 text-[10px] text-slate-400">
              <span>เกณฑ์อ้างอิง:</span>
              <span className="text-emerald-400">4.51-5.00 มากที่สุด</span>
              <span>·</span>
              <span className="text-cyan-400">3.51-4.50 มาก</span>
              <span>·</span>
              <span className="text-amber-400">2.51-3.50 ปานกลาง</span>
              <span>·</span>
              <span className="text-orange-400">1.51-2.50 น้อย</span>
            </div>
          </div>

        </div>

        {/* Main Content: Question Average Bars & Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: 8 Columns - Circular / Bar Charts of Question Averages */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>ผลการประเมินความพึงพอใจรายข้อ</span>
                  <span className="text-xs font-normal text-slate-400">
                    (จากผู้ตอบ {totalCount} คน)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {chartViewType === 'circular'
                    ? 'กราฟวงกลม (Donut & Radial Gauges) แสดงสัดส่วนและคะแนนแต่ละหัวข้อ'
                    : 'กราฟแท่งเปรียบเทียบคะแนนแต่ละหัวข้อการประเมิน'}
                </p>
              </div>

              {/* View Switcher: Circular (Pie/Donut) vs Bar */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartViewType('circular')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    chartViewType === 'circular'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>กราฟวงกลม</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewType('bar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    chartViewType === 'bar'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>กราฟแท่ง</span>
                </button>
              </div>
            </div>

            {/* CIRCULAR VIEW: Pie Chart Breakdown & 5 Radial Gauges */}
            {chartViewType === 'circular' ? (
              <div className="space-y-6 pt-1">
                {/* 1. Overall Rating Distribution Donut Pie Chart */}
                <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5" />
                      <span>สัดส่วนระดับความพึงพอใจภาพรวมทั้งหมด (Distribution Pie Chart)</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      รวมทั้งหมด: <strong className="text-white font-num">{allRatingsTotal}</strong> คะแนน
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Donut SVG */}
                    <div className="md:col-span-5 flex justify-center py-2 relative">
                      <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
                        {ratingDistributionPie.length === 0 ? (
                          <circle
                            cx="80"
                            cy="80"
                            r="60"
                            fill="transparent"
                            stroke="#1e293b"
                            strokeWidth="24"
                          />
                        ) : (
                          ratingDistributionPie.map((slice, idx) => (
                            <circle
                              key={idx}
                              cx="80"
                              cy="80"
                              r="60"
                              fill="transparent"
                              stroke={slice.color}
                              strokeWidth="24"
                              strokeDasharray={`${slice.dash} 377`}
                              strokeDashoffset={-slice.offset}
                              className="transition-all duration-700 hover:opacity-90"
                            />
                          ))
                        )}
                      </svg>
                      {/* Center Score readout */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="font-num text-3xl font-extrabold text-white">
                          {overallAvg.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">คะแนนเฉลี่ย</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="md:col-span-7 space-y-2 text-xs">
                      {pieLegendItems.map((item) => (
                        <div
                          key={item.star}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-md shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-slate-200 font-medium">{item.label}</span>
                            <span className="text-slate-400 text-[11px]">({item.emoji})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-num font-bold text-white">{item.count} เสียง</span>
                            <span className="font-num text-slate-400 w-12 text-right">
                              {item.percent}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Radial Circular Donut Gauges for all 5 questions */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    กราฟวงกลมคะแนนเฉลี่ยรายข้อ (5 หัวข้อการประเมิน)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {questionStats.map((item, index) => {
                      const percentage = Math.round((item.avg / 5) * 100);
                      const itemInterp = interpretLikertScore(item.avg);
                      // SVG Circle calculation: r = 36, C = 2 * PI * 36 = 226.19
                      const circumference = 226.19;
                      const strokeDashoffset = circumference - (circumference * percentage) / 100;

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 hover:border-slate-700 transition-all shadow-sm"
                        >
                          {/* Radial Circle */}
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            <svg className="w-28 h-28 -rotate-90">
                              <circle
                                cx="56"
                                cy="56"
                                r="36"
                                stroke="#1e293b"
                                strokeWidth="8"
                                fill="transparent"
                              />
                              <circle
                                cx="56"
                                cy="56"
                                r="36"
                                stroke={itemInterp.color}
                                strokeWidth="8"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="font-num text-2xl font-extrabold text-white">
                                {item.avg.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-num">{percentage}%</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="font-num text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                0{index + 1}
                              </span>
                              <h4 className="text-xs font-bold text-white truncate max-w-[170px]" title={item.title}>
                                {item.title.replace(/^\d+\.\s*/, '')}
                              </h4>
                            </div>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-medium ${itemInterp.badgeClass}`}>
                              {itemInterp.label.split(' ')[0]}
                            </span>
                          </div>

                          {/* 5-star mini breakdown */}
                          <div className="w-full pt-2 border-t border-slate-800/70 grid grid-cols-5 text-[9px] text-slate-400">
                            <div>5★:{item.counts[5]}</div>
                            <div>4★:{item.counts[4]}</div>
                            <div>3★:{item.counts[3]}</div>
                            <div>2★:{item.counts[2]}</div>
                            <div>1★:{item.counts[1]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* BAR VIEW: Horizontal Bar Charts */
              <div className="space-y-4 pt-1">
                {questionStats.map((item, index) => {
                  const percentage = (item.avg / 5) * 100;
                  const itemInterp = interpretLikertScore(item.avg);

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2.5 transition-all hover:border-slate-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-start gap-2">
                          <span className="font-num text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md mt-0.5">
                            0{index + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-semibold text-white">
                              {item.title.replace(/^\d+\.\s*/, '')}
                            </h3>
                            <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium ${itemInterp.badgeClass}`}>
                            {itemInterp.label.split(' ')[0]}
                          </span>
                          <div className="text-right">
                            <span className="font-num text-xl font-extrabold text-white">
                              {item.avg.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400"> / 5.00</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {/* Micro breakdown: Star distribution */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
                          <div className="flex items-center gap-3">
                            <span title="ผู้ให้ 5 ดาว">5★: {item.counts[5]} คน</span>
                            <span title="ผู้ให้ 4 ดาว">4★: {item.counts[4]} คน</span>
                            <span title="ผู้ให้ 3 ดาว">3★: {item.counts[3]} คน</span>
                            <span title="ผู้ให้ 2 ดาว">2★: {item.counts[2]} คน</span>
                            <span title="ผู้ให้ 1 ดาว">1★: {item.counts[1]} คน</span>
                          </div>
                          <span className="font-num text-slate-400">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Reset / Restore controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => storage.restoreDemoData()}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>โหลดข้อมูลตัวอย่าง</span>
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลการตอบทั้งหมด?')) {
                      storage.clearAllResponses();
                    }
                  }}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  ล้างข้อมูลทั้งหมด
                </button>
              </div>

              {onOpenFirebaseConfig && (
                <button
                  onClick={onOpenFirebaseConfig}
                  className="hover:text-slate-200 flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  <span>ตั้งค่า Firebase Cloud URL</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: 4 Columns - QR Code Card & Live Feedback Stream */}
          <div className="lg:col-span-4 space-y-6">

            {/* Stage QR Code Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                สำหรับผู้เข้าอบรมในห้อง
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">สแกนเพื่อร่วมประเมิน</h3>
              <p className="text-xs text-slate-400 mt-1">
                เปิดกล้องมือถือแล้วสแกนตอบได้ทันที ไม่ต้องโหลดแอป
              </p>

              {/* QR Image */}
              <div className="mt-4 p-3 bg-white rounded-2xl inline-block shadow-md">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan Survey QR"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-500">
                    กำลังสร้าง QR...
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ขยายเต็มจอสำหรับฉายโปรเจกเตอร์</span>
                </button>

                {onOpenMobileView && (
                  <button
                    onClick={onOpenMobileView}
                    className="w-full py-2 px-3 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/40 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>ลองเปิดหน้าแบบสอบถามบนอุปกรณ์นี้</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Latest Feedback Stream */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-[380px]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">ข้อเสนอแนะล่าสุด</h3>
                </div>
                <span className="font-num text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {comments.length} ความคิดเห็น
                </span>
              </div>

              {/* Stream Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                    <MessageSquare className="w-8 h-8 stroke-1 text-slate-600 mb-2" />
                    <span>ยังไม่มีข้อเสนอแนะเพิ่มเติม</span>
                    <span className="text-[11px] text-slate-600 mt-0.5">
                      (ช่องข้อเสนอแนะไม่บังคับให้ตอบ)
                    </span>
                  </div>
                ) : (
                  displayedComments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-1.5 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-num font-semibold text-emerald-400">
                          เฉลี่ย {c.overallScore.toFixed(2)} ★
                        </span>
                        <span className="text-slate-500">{c.dateFormatted}</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed font-light">
                        {c.suggestions}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Giant QR Code Modal */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        surveyUrl={surveyUrl}
      />
    </div>
  );
};

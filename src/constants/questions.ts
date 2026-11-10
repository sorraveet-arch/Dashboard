import { QuestionDef, LikertCriteria, EvaluationResponse } from '../types';

export const EVALUATION_QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    title: '1. ความชัดเจนและเนื้อหาหลักสูตร',
    subtitle: 'เนื้อหามีประโยชน์ ครบถ้วน ตรงตามวัตถุประสงค์ และเข้าใจง่าย',
    category: 'เนื้อหาหลักสูตร',
  },
  {
    id: 'q2',
    title: '2. ทักษะและความเชี่ยวชาญของวิทยากร',
    subtitle: 'วิทยากรถ่ายทอดได้ชัดเจน เปิดโอกาสให้ซักถาม และดูแลผู้เรียนอย่างทั่วถึง',
    category: 'วิทยากร',
  },
  {
    id: 'q3',
    title: '3. การนำความรู้ไปประยุกต์ใช้ประโยชน์ได้จริง',
    subtitle: 'สามารถนำความรู้และทักษะที่ได้รับไปใช้ในการทำงานหรือชีวิตประจำวันได้',
    category: 'การประยุกต์ใช้',
  },
  {
    id: 'q4',
    title: '4. ความพร้อมของสถานที่ เวลา และอุปกรณ์',
    subtitle: 'ระยะเวลาเหมาะสม สัญญาณภาพและเสียงชัดเจน สื่อประกอบการสอนมีคุณภาพ',
    category: 'การอำนวยความสะดวก',
  },
  {
    id: 'q5',
    title: '5. ภาพรวมความพึงพอใจในการอบรมครั้งนี้',
    subtitle: 'ความรู้สึกประทับใจโดยรวมและยินดีที่จะแนะนำหลักสูตรนี้ให้ผู้อื่น',
    category: 'ความพึงพอใจโดยรวม',
  },
];

export const RATING_OPTIONS = [
  { value: 5, label: 'มากที่สุด', emoji: '🤩', color: 'emerald' },
  { value: 4, label: 'มาก', emoji: '😊', color: 'teal' },
  { value: 3, label: 'ปานกลาง', emoji: '😐', color: 'amber' },
  { value: 2, label: 'น้อย', emoji: '🙁', color: 'orange' },
  { value: 1, label: 'น้อยที่สุด', emoji: '😡', color: 'rose' },
];

export const LIKERT_CRITERIA: LikertCriteria[] = [
  {
    min: 4.51,
    max: 5.0,
    label: 'มากที่สุด (ดีเยี่ยม)',
    color: '#10b981',
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    bgDark: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    description: 'ผลการประเมินอยู่ในเกณฑ์ยอดเยี่ยม ผู้เข้าอบรมพึงพอใจในระดับสูงสุด',
  },
  {
    min: 3.51,
    max: 4.5,
    label: 'มาก (ดี)',
    color: '#06b6d4',
    bgLight: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    bgDark: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50',
    badgeClass: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
    description: 'ผลการประเมินอยู่ในเกณฑ์ดี ผู้เข้าอบรมได้รับประโยชน์คุ้มค่า',
  },
  {
    min: 2.51,
    max: 3.5,
    label: 'ปานกลาง (พอใช้)',
    color: '#f59e0b',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
    bgDark: 'bg-amber-950/60 text-amber-300 border-amber-700/50',
    badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    description: 'ผลการประเมินอยู่ในระดับปานกลาง มีจุดที่สามารถปรับปรุงพัฒนาเพิ่มได้',
  },
  {
    min: 1.51,
    max: 2.5,
    label: 'น้อย (ควรปรับปรุง)',
    color: '#f97316',
    bgLight: 'bg-orange-50 text-orange-800 border-orange-200',
    bgDark: 'bg-orange-950/60 text-orange-300 border-orange-700/50',
    badgeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    description: 'ผลการประเมินยังไม่เป็นไปตามเป้าหมาย จำเป็นต้องทบทวนเนื้อหาหรือรูปแบบ',
  },
  {
    min: 1.0,
    max: 1.5,
    label: 'น้อยที่สุด (ต้องแก้ไขเร่งด่วน)',
    color: '#ef4444',
    bgLight: 'bg-rose-50 text-rose-800 border-rose-200',
    bgDark: 'bg-rose-950/60 text-rose-300 border-rose-700/50',
    badgeClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    description: 'ผลการประเมินต่ำกว่าเกณฑ์ ต้องปรับปรุงแก้ไขอย่างเร่งด่วน',
  },
];

export function interpretLikertScore(score: number): LikertCriteria {
  if (score <= 0 || isNaN(score)) {
    return {
      min: 0,
      max: 0,
      label: 'ยังไม่มีข้อมูล',
      color: '#94a3b8',
      bgLight: 'bg-slate-50 text-slate-700 border-slate-200',
      bgDark: 'bg-slate-800 text-slate-300 border-slate-700',
      badgeClass: 'bg-slate-500/20 text-slate-400 border border-slate-500/40',
      description: 'รอผู้เข้าอบรมเริ่มส่งแบบประเมิน',
    };
  }

  for (const criteria of LIKERT_CRITERIA) {
    if (score >= criteria.min && score <= criteria.max) {
      return criteria;
    }
  }

  if (score > 5.0) return LIKERT_CRITERIA[0];
  return LIKERT_CRITERIA[LIKERT_CRITERIA.length - 1];
}

export const INITIAL_MOCK_RESPONSES: EvaluationResponse[] = [
  {
    id: 'mock-1',
    timestamp: Date.now() - 1000 * 60 * 18,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 18).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 4,
    q5: 5,
    overallScore: 4.8,
    suggestions: 'วิทยากรสอนสนุกมาก เนื้อหาเข้าใจง่ายและนำไปใช้กับงานจริงได้ทันทีครับ',
  },
  {
    id: 'mock-2',
    timestamp: Date.now() - 1000 * 60 * 12,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    q1: 4,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
    overallScore: 4.8,
    suggestions: 'ชอบช่วงถามตอบและกรณีศึกษามากค่ะ อยากให้มีคอร์สขั้นสูงต่อยอดอีก',
  },
  {
    id: 'mock-3',
    timestamp: Date.now() - 1000 * 60 * 7,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 7).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    q1: 5,
    q2: 4,
    q3: 4,
    q4: 5,
    q5: 5,
    overallScore: 4.6,
    suggestions: 'เอกสารและสื่อประกอบการสอนเตรียมมาดีมาก เสียงคมชัด สถานที่สะดวกสบาย',
  },
  {
    id: 'mock-4',
    timestamp: Date.now() - 1000 * 60 * 3,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 4,
    q5: 5,
    overallScore: 4.8,
    suggestions: 'ประทับใจความใส่ใจในการตอบคำถาม บรรยากาศเป็นกันเองมากครับ',
  },
];

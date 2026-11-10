export interface EvaluationResponse {
  id: string;
  timestamp: number;
  dateFormatted: string;
  q1: number; // ความชัดเจนและเนื้อหาหลักสูตร
  q2: number; // ทักษะและความเชี่ยวชาญของวิทยากร
  q3: number; // การนำไปประยุกต์ใช้ประโยชน์ได้จริง
  q4: number; // ความพร้อมของสถานที่ สื่อ และอุปกรณ์
  q5: number; // ภาพรวมความพึงพอใจในการอบรม
  overallScore: number;
  suggestions?: string;
  deviceHash?: string;
}

export interface QuestionDef {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  title: string;
  subtitle: string;
  category: string;
}

export interface LikertCriteria {
  min: number;
  max: number;
  label: string;
  color: string;
  bgLight: string;
  bgDark: string;
  badgeClass: string;
  description: string;
}

export interface FirebaseRealtimeConfig {
  apiKey: string;
  authDomain?: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

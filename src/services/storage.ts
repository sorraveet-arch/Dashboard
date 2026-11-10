import { EvaluationResponse, FirebaseRealtimeConfig } from '../types';
import { INITIAL_MOCK_RESPONSES } from '../constants/questions';

const STORAGE_KEY = 'training_eval_responses_v1';
const SUBMISSION_FLAG_KEY = 'training_eval_device_submitted';
const FIREBASE_CONFIG_KEY = 'training_eval_firebase_config';

class StorageService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(responses: EvaluationResponse[]) => void> = new Set();
  private firebaseConfig: FirebaseRealtimeConfig | null = null;
  private isFirebasePolling = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('training_survey_live_sync');
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_RESPONSE' || event.data?.type === 'SYNC_ALL') {
            const current = this.getLocalResponses();
            this.notifyListeners(current);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // Load saved firebase config if any
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem(FIREBASE_CONFIG_KEY);
      if (savedConfig) {
        try {
          this.firebaseConfig = JSON.parse(savedConfig);
        } catch {
          // ignore
        }
      }
    }
  }

  public getLocalResponses(): EvaluationResponse[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_RESPONSES;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // initialize with mock data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_RESPONSES));
        return INITIAL_MOCK_RESPONSES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading responses from storage', e);
      return INITIAL_MOCK_RESPONSES;
    }
  }

  public subscribe(callback: (responses: EvaluationResponse[]) => void): () => void {
    this.listeners.add(callback);
    // Initial call
    callback(this.getLocalResponses());

    // Start background sync if Firebase Realtime Database is configured
    if (this.firebaseConfig?.databaseURL && !this.isFirebasePolling) {
      this.pollFirebaseRealtime();
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(responses: EvaluationResponse[]): void {
    this.listeners.forEach((listener) => {
      try {
        listener(responses);
      } catch (err) {
        console.error(err);
      }
    });
  }

  public async saveResponse(response: Omit<EvaluationResponse, 'id' | 'timestamp' | 'dateFormatted' | 'overallScore'>): Promise<EvaluationResponse> {
    const timestamp = Date.now();
    const dateFormatted = new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const overallScore = Number(
      ((response.q1 + response.q2 + response.q3 + response.q4 + response.q5) / 5).toFixed(2)
    );

    const newEntry: EvaluationResponse = {
      ...response,
      id: 'resp-' + timestamp + '-' + Math.random().toString(36).substring(2, 7),
      timestamp,
      dateFormatted,
      overallScore,
    };

    // 1. Save locally
    const existing = this.getLocalResponses();
    const updated = [newEntry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Mark this device as submitted
    localStorage.setItem(SUBMISSION_FLAG_KEY, 'true');

    // 3. Broadcast to other open tabs instantly
    if (this.channel) {
      this.channel.postMessage({ type: 'NEW_RESPONSE', payload: newEntry });
    }

    this.notifyListeners(updated);

    // 4. If Firebase Realtime Database configured, send to Firebase via REST API
    if (this.firebaseConfig?.databaseURL) {
      try {
        await this.pushToFirebase(newEntry);
      } catch (e) {
        console.error('Failed pushing to Firebase Realtime DB:', e);
      }
    }

    return newEntry;
  }

  public hasAlreadySubmitted(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SUBMISSION_FLAG_KEY) === 'true';
  }

  public resetDeviceSubmissionStatus(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SUBMISSION_FLAG_KEY);
    }
  }

  public clearAllResponses(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    if (this.channel) {
      this.channel.postMessage({ type: 'SYNC_ALL', payload: [] });
    }
    this.notifyListeners([]);
  }

  public restoreDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_RESPONSES));
    if (this.channel) {
      this.channel.postMessage({ type: 'SYNC_ALL', payload: INITIAL_MOCK_RESPONSES });
    }
    this.notifyListeners(INITIAL_MOCK_RESPONSES);
  }

  public exportToCSV(responses: EvaluationResponse[], filename = 'training-evaluation-results.csv'): void {
    if (!responses || responses.length === 0) return;

    // Header row
    const headers = [
      'ลำดับที่',
      'รหัสการตอบ',
      'เวลาที่ตอบ',
      'ข้อ 1 (เนื้อหาหลักสูตร)',
      'ข้อ 2 (ทักษะวิทยากร)',
      'ข้อ 3 (การนำไปใช้จริง)',
      'ข้อ 4 (สถานที่และอุปกรณ์)',
      'ข้อ 5 (ภาพรวมความพึงพอใจ)',
      'คะแนนเฉลี่ยรวม',
      'ข้อเสนอแนะเพิ่มเติม',
    ];

    const rows = responses.map((r, index) => [
      index + 1,
      r.id,
      `"${new Date(r.timestamp).toLocaleString('th-TH')}"`,
      r.q1,
      r.q2,
      r.q3,
      r.q4,
      r.q5,
      r.overallScore.toFixed(2),
      `"${(r.suggestions || '').replace(/"/g, '""')}"`,
    ]);

    // Add BOM (\uFEFF) for Excel Thai language support
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Firebase Realtime DB Support
  public setFirebaseConfig(config: FirebaseRealtimeConfig | null): void {
    this.firebaseConfig = config;
    if (typeof window !== 'undefined') {
      if (config) {
        localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
        this.pollFirebaseRealtime();
      } else {
        localStorage.removeItem(FIREBASE_CONFIG_KEY);
      }
    }
  }

  public getFirebaseConfig(): FirebaseRealtimeConfig | null {
    return this.firebaseConfig;
  }

  private async pushToFirebase(entry: EvaluationResponse): Promise<void> {
    if (!this.firebaseConfig?.databaseURL) return;
    const cleanUrl = this.firebaseConfig.databaseURL.replace(/\/$/, '');
    const url = `${cleanUrl}/evaluations.json`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  }

  private async pollFirebaseRealtime(): Promise<void> {
    if (!this.firebaseConfig?.databaseURL || this.isFirebasePolling) return;
    this.isFirebasePolling = true;

    try {
      const cleanUrl = this.firebaseConfig.databaseURL.replace(/\/$/, '');
      const url = `${cleanUrl}/evaluations.json`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const list: EvaluationResponse[] = Object.values(data);
          list.sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          this.notifyListeners(list);
        }
      }
    } catch (e) {
      console.warn('Firebase sync note:', e);
    } finally {
      this.isFirebasePolling = false;
    }
  }
}

export const storage = new StorageService();

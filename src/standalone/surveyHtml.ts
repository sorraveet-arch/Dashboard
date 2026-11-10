export const STANDALONE_SURVEY_HTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>แบบประเมินความพึงพอใจการอบรม</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Prompt -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <!-- Canvas Confetti CDN -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>

  <!-- Firebase App & Realtime Database SDK (v10 Compat) -->
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"></script>

  <style>
    body {
      font-family: 'Prompt', sans-serif;
      -webkit-tap-highlight-color: transparent;
    }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen pb-16 flex flex-col items-center">

  <!-- Header Banner -->
  <header class="w-full bg-slate-800/80 backdrop-blur border-b border-slate-700/60 sticky top-0 z-30 px-4 py-3.5 shadow-md">
    <div class="max-w-md mx-auto flex items-center justify-between">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400">แบบประเมินผู้เข้าอบรม</span>
        <h1 class="text-lg font-bold text-white leading-tight">ความพึงพอใจการฝึกอบรม</h1>
      </div>
      <div class="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-700/50">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>นิรนาม (ไม่ต้องระบุชื่อ)</span>
      </div>
    </div>
  </header>

  <main class="w-full max-w-md px-4 mt-5 space-y-6 flex-1">

    <!-- Description Card -->
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed shadow-sm">
      <p class="font-medium text-slate-200 mb-1">คำชี้แจง:</p>
      โปรดประเมินความพึงพอใจตามความเป็นจริง เพื่อนำผลไปพัฒนาและปรับปรุงคุณภาพการจัดอบรมในครั้งต่อไป (สเกล 1 = น้อยที่สุด ถึง 5 = มากที่สุด)
    </div>

    <!-- Duplicate Alert Container (Shown if already submitted) -->
    <div id="already-submitted-box" class="hidden bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 text-center shadow-lg">
      <div class="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">✓</div>
      <h2 class="text-lg font-bold text-emerald-300">คุณได้ส่งแบบประเมินเรียบร้อยแล้ว</h2>
      <p class="text-xs text-slate-300 mt-2 leading-relaxed">
        ระบบบันทึกความคิดเห็นของท่านเรียบร้อยแล้ว และระบบล็อคการตอบซ้ำเพื่อความถูกต้องของสถิติ ขอขอบคุณสำหรับความร่วมมือครับ
      </p>
      <button onclick="resetSubmissionForTest()" class="mt-5 text-xs text-slate-400 underline hover:text-slate-200">
        [โหมดทดสอบ] ล้างสถานะเพื่อลองตอบใหม่อีกครั้ง
      </button>
    </div>

    <!-- Survey Form -->
    <form id="survey-form" class="space-y-6">

      <!-- Question 1 -->
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div>
          <span class="text-xs font-semibold text-emerald-400">ข้อที่ 1</span>
          <h2 class="text-base font-semibold text-white mt-0.5">ความชัดเจนและเนื้อหาหลักสูตร</h2>
          <p class="text-xs text-slate-400 mt-1">เนื้อหามีประโยชน์ ครบถ้วน ตรงตามวัตถุประสงค์ และเข้าใจง่าย</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-2" id="group-q1">
          <!-- Rating buttons 1 to 5 -->
        </div>
        <div class="flex justify-between text-[11px] text-slate-400 px-1 pt-0.5">
          <span>1: น้อยที่สุด 😡</span>
          <span>5: มากที่สุด 🤩</span>
        </div>
      </div>

      <!-- Question 2 -->
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div>
          <span class="text-xs font-semibold text-emerald-400">ข้อที่ 2</span>
          <h2 class="text-base font-semibold text-white mt-0.5">ทักษะและความเชี่ยวชาญของวิทยากร</h2>
          <p class="text-xs text-slate-400 mt-1">ถ่ายทอดได้น่าสนใจ ชัดเจน เปิดโอกาสให้ซักถาม และเอาใจใส่ผู้เรียน</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-2" id="group-q2">
          <!-- Rating buttons 1 to 5 -->
        </div>
        <div class="flex justify-between text-[11px] text-slate-400 px-1 pt-0.5">
          <span>1: น้อยที่สุด 😡</span>
          <span>5: มากที่สุด 🤩</span>
        </div>
      </div>

      <!-- Question 3 -->
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div>
          <span class="text-xs font-semibold text-emerald-400">ข้อที่ 3</span>
          <h2 class="text-base font-semibold text-white mt-0.5">การนำความรู้ไปประยุกต์ใช้ประโยชน์</h2>
          <p class="text-xs text-slate-400 mt-1">สามารถนำความรู้และเทคนิคที่ได้ไปปรับใช้ในการทำงานได้จริง</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-2" id="group-q3">
          <!-- Rating buttons 1 to 5 -->
        </div>
        <div class="flex justify-between text-[11px] text-slate-400 px-1 pt-0.5">
          <span>1: น้อยที่สุด 😡</span>
          <span>5: มากที่สุด 🤩</span>
        </div>
      </div>

      <!-- Question 4 -->
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div>
          <span class="text-xs font-semibold text-emerald-400">ข้อที่ 4</span>
          <h2 class="text-base font-semibold text-white mt-0.5">ความพร้อมของสถานที่ เวลา และอุปกรณ์</h2>
          <p class="text-xs text-slate-400 mt-1">เวลาเหมาะสม ภาพและเสียงคมชัด สื่อประกอบการสอนมีคุณภาพ</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-2" id="group-q4">
          <!-- Rating buttons 1 to 5 -->
        </div>
        <div class="flex justify-between text-[11px] text-slate-400 px-1 pt-0.5">
          <span>1: น้อยที่สุด 😡</span>
          <span>5: มากที่สุด 🤩</span>
        </div>
      </div>

      <!-- Question 5 -->
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div>
          <span class="text-xs font-semibold text-emerald-400">ข้อที่ 5</span>
          <h2 class="text-base font-semibold text-white mt-0.5">ภาพรวมความพึงพอใจในการอบรม</h2>
          <p class="text-xs text-slate-400 mt-1">ความประทับใจโดยรวมและพร้อมแนะนำหลักสูตรนี้ให้เพื่อนร่วมงาน</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-2" id="group-q5">
          <!-- Rating buttons 1 to 5 -->
        </div>
        <div class="flex justify-between text-[11px] text-slate-400 px-1 pt-0.5">
          <span>1: น้อยที่สุด 😡</span>
          <span>5: มากที่สุด 🤩</span>
        </div>
      </div>

      <!-- Suggestions Field (Optional) -->
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-2">
        <label for="suggestions" class="block text-sm font-semibold text-white">
          ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุง <span class="text-xs font-normal text-slate-400">(ไม่บังคับ)</span>
        </label>
        <p class="text-xs text-slate-400">สิ่งที่ท่านประทับใจ หรือสิ่งที่ต้องการให้เพิ่มเติมในครั้งถัดไป</p>
        <textarea
          id="suggestions"
          rows="3"
          maxlength="400"
          placeholder="พิมพ์ข้อคิดเห็นหรือข้อเสนอแนะที่นี่..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
        ></textarea>
        <div class="text-right text-[11px] text-slate-500" id="char-count">0/400 ตัวอักษร</div>
      </div>

      <!-- Validation Error Notice -->
      <div id="error-message" class="hidden text-rose-400 text-xs bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-center">
        ⚠️ กรุณาเลือกคะแนนให้ครบทั้ง 5 ข้อก่อนกดส่งแบบประเมิน
      </div>

      <!-- Submit Button (Large Touch Target) -->
      <button
        type="submit"
        id="submit-btn"
        class="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>ส่งแบบประเมิน</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </button>

      <p class="text-center text-[11px] text-slate-500">
        ข้อมูลของท่านจะถูกรวบรวมแบบนิรนามเพื่อสรุปผลคะแนนแบบเรียลไทม์
      </p>

    </form>

    <!-- Success Modal -->
    <div id="success-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
      <div class="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
        <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
          ✓
        </div>
        <h3 class="text-xl font-bold text-white">บันทึกข้อมูลสำเร็จ!</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          ขอบพระคุณสำหรับการสละเวลาทำแบบประเมิน คะแนนของท่านได้ถูกส่งขึ้นสู่จอ Dashboard เรียลไทม์เรียบร้อยแล้ว
        </p>
        <div class="pt-2">
          <button
            onclick="closeSuccessModal()"
            class="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>

  </main>

  <script>
    // ==========================================
    // 1. ตั้งค่า Firebase Configuration
    // (นำค่ามาจาก Firebase Console -> Project Settings)
    // ==========================================
    const firebaseConfig = {
      apiKey: "AIzaSy_YOUR_API_KEY",
      authDomain: "your-project-id.firebaseapp.com",
      databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef"
    };

    // ตรวจสอบและเริ่มต้น Firebase
    let database = null;
    try {
      if (firebaseConfig.apiKey !== "AIzaSy_YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log("Firebase Realtime Database เชื่อมต่อแล้ว");
      } else {
        console.warn("ยังไม่ได้ใส่ Firebase Config จริง -> จะทำงานแบบ LocalStorage เพื่อให้ทดสอบได้ทันที");
      }
    } catch (e) {
      console.warn("Firebase Init Error:", e);
    }

    // ==========================================
    // 2. ข้อมูลคำถามและสถานะ
    // ==========================================
    const scores = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
    const ratingEmojis = { 1: '😡', 2: '🙁', 3: '😐', 4: '😊', 5: '🤩' };
    const LOCAL_SUBMISSION_KEY = "has_submitted_training_survey";

    // สร้างปุ่มเรตติ้ง 1-5 แบบไดนามิก
    ['q1', 'q2', 'q3', 'q4', 'q5'].forEach(qKey => {
      const container = document.getElementById('group-' + qKey);
      for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rating-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer';
        btn.innerHTML = \`<span class="text-base">\${ratingEmojis[i]}</span><span>\${i}</span>\`;
        btn.onclick = () => selectScore(qKey, i, btn);
        container.appendChild(btn);
      }
    });

    function selectScore(questionKey, value, clickedBtn) {
      scores[questionKey] = value;
      // ปรับแต่งสีปุ่มที่ถูกเลือก
      const parent = document.getElementById('group-' + questionKey);
      const buttons = parent.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.className = 'rating-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer';
      });

      // ไฮไลต์ปุ่มที่เลือกด้วยสีเขียวมรกต
      clickedBtn.className = 'rating-btn py-3 rounded-xl border-2 border-emerald-400 bg-emerald-500/20 text-emerald-300 font-extrabold text-sm flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-500/20 scale-[1.03] transition-all cursor-pointer';
      
      // ซ่อนข้อความแจ้งเตือนถ้ามี
      document.getElementById('error-message').classList.add('hidden');
    }

    // ตัวนับจำนวนตัวอักษร
    const textarea = document.getElementById('suggestions');
    const charCount = document.getElementById('char-count');
    textarea.addEventListener('input', () => {
      charCount.textContent = \`\${textarea.value.length}/400 ตัวอักษร\`;
    });

    // ตรวจสอบว่าเคยส่งไปแล้วหรือไม่ (ป้องกันการตอบซ้ำ)
    function checkPreviousSubmission() {
      if (localStorage.getItem(LOCAL_SUBMISSION_KEY) === "true") {
        document.getElementById('survey-form').classList.add('hidden');
        document.getElementById('already-submitted-box').classList.remove('hidden');
      }
    }
    checkPreviousSubmission();

    // ล้างสถานะเพื่อทดสอบใหม่
    function resetSubmissionForTest() {
      localStorage.removeItem(LOCAL_SUBMISSION_KEY);
      location.reload();
    }

    // จัดการส่งฟอร์ม
    document.getElementById('survey-form').addEventListener('submit', async function(e) {
      e.preventDefault();

      // ตรวจสอบว่าเลือกครบทั้ง 5 ข้อหรือไม่
      const missing = Object.values(scores).some(val => val === 0);
      if (missing) {
        document.getElementById('error-message').classList.remove('hidden');
        window.scrollTo({ top: 100, behavior: 'smooth' });
        return;
      }

      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'กำลังบันทึกข้อมูล...';

      const timestamp = Date.now();
      const avg = Number(((scores.q1 + scores.q2 + scores.q3 + scores.q4 + scores.q5) / 5).toFixed(2));
      const payload = {
        timestamp: timestamp,
        dateFormatted: new Date(timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        q1: scores.q1,
        q2: scores.q2,
        q3: scores.q3,
        q4: scores.q4,
        q5: scores.q5,
        overallScore: avg,
        suggestions: textarea.value.trim()
      };

      try {
        // 1. ถ้ามี Firebase ให้ push ขึ้น Realtime Database node '/evaluations'
        if (database) {
          await database.ref('evaluations').push(payload);
        } else {
          // 2. สำรองลง LocalStorage และ BroadcastChannel สำหรับทดสอบแบบ Offline
          const current = JSON.parse(localStorage.getItem('training_eval_responses_v1') || '[]');
          current.unshift({ id: 'resp-' + timestamp, ...payload });
          localStorage.setItem('training_eval_responses_v1', JSON.stringify(current));
          
          if (window.BroadcastChannel) {
            const bc = new BroadcastChannel('training_survey_live_sync');
            bc.postMessage({ type: 'NEW_RESPONSE', payload });
          }
        }

        // ล็อคการตอบซ้ำในเครื่องนี้
        localStorage.setItem(LOCAL_SUBMISSION_KEY, "true");

        // จุดพลุเฉลิมฉลอง
        if (window.confetti) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
        }

        // แสดงผลความสำเร็จ
        document.getElementById('success-modal').classList.remove('hidden');

      } catch (err) {
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'ส่งแบบประเมิน';
      }
    });

    function closeSuccessModal() {
      document.getElementById('success-modal').classList.add('hidden');
      checkPreviousSubmission();
    }
  </script>
</body>
</html>`;

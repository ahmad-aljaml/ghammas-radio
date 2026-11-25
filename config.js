/* =========================================================
   إعدادات النظام — كل شي قابل للتغيير موجود هون بس
   System configuration — the only file you edit to add/rename branches
   ========================================================= */
window.RADIO_CONFIG = {
  // عنوان السيرفر (لو انتقلنا لسحابة ثانية بنغيّر هالسطر بس)
  base: "https://ghammas-radio.duckdns.org",
  station: "ghammas",
  defaultMount: "/radio.mp3",

  // الفروع (أسماء للعرض التجريبي فقط وقابلة للتعديل)
  // كل فرع إله Mount خاص، وكلهم من نفس مصدر البث => نفس الأغنية بنفس اللحظة
  branches: [
    { id: "abdoun",    name: "فرع عبدون",   mount: "/abdoun.mp3" },
    { id: "tabarbour", name: "فرع طبربور",  mount: "/tabarbour.mp3" },
    { id: "rabieh",    name: "فرع الرابية", mount: "/rabieh.mp3" }
  ],

  // أسماء الفترات كما بتظهر بالواجهة (المفتاح = اسم القائمة بـ AzuraCast)
  programs: {
    "Morning - Cafe": { ar: "الفترة الصباحية", en: "Morning Cafe", icon: "☕" },
    "Evening - Jazz": { ar: "الفترة المسائية", en: "Evening Jazz", icon: "🎷" }
  },
  // البث الاحتياطي (أي وقت ما في فترة مجدولة)
  fallbackProgram: { ar: "الفترة الليلية", en: "Night Lounge · خارج الدوام", icon: "🌙" },

  // جدول احتياطي إذا ما قدرنا نقرأ الجدول من السيرفر (بالدقائق من منتصف الليل، توقيت عمّان)
  fallbackSchedule: [
    { name: "Morning - Cafe", start: 8 * 60,  end: 17 * 60 },
    { name: "Evening - Jazz", start: 17 * 60, end: 24 * 60 }
  ],

  timezone: "Asia/Amman",
  pollMs: 10000
};

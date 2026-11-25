/* =========================================================
   أدوات مشتركة بين صفحة المشغّل ولوحة الإدارة
   Shared helpers: API access, Amman time, schedule building/rendering
   ========================================================= */
(function () {
  const C = window.RADIO_CONFIG;
  const TZ = C.timezone;

  const api = {
    nowPlayingStatic: `${C.base}/api/nowplaying_static/${C.station}.json`,
    nowPlaying:       `${C.base}/api/nowplaying/${C.station}`,
    schedule:         `${C.base}/api/station/${C.station}/schedule`
  };

  async function getJSON(url) {
    const r = await fetch(url + (url.includes("?") ? "&" : "?") + "_=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }

  // معلومات البث: النسخة الخفيفة أول، وإذا فشلت النسخة الكاملة (Fallback)
  async function fetchNowPlaying() {
    try { return await getJSON(api.nowPlayingStatic); }
    catch (_) { return await getJSON(api.nowPlaying); }
  }

  // ===== الوقت بتوقيت عمّان =====
  function ammanMinutes(date = new Date()) {
    const p = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "numeric", hour12: false, timeZone: TZ }).formatToParts(date);
    return (+p.find(x => x.type === "hour").value % 24) * 60 + (+p.find(x => x.type === "minute").value);
  }
  function hhmm(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    return String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  }
  // صيغة 12 ساعة: 8:00 AM / 5:00 PM / 12:00 AM
  function hhmm12(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    const h = Math.floor(mins / 60), m = mins % 60;
    const ap = h < 12 ? "AM" : "PM", h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + String(m).padStart(2, "0") + " " + ap;
  }
  function clock(ts) {
    return new Date(ts * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  }
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function duration(mins) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return (h ? h + " س " : "") + m + " د";
  }

  function programInfo(name) {
    return C.programs[name] || (name ? { ar: name, en: "", icon: "🎶" } : C.fallbackProgram);
  }
  function programLabel(name) {
    const p = C.programs[name];
    if (p) return `${p.icon} ${p.ar} · ${p.en}`;
    const f = C.fallbackProgram;
    return `${f.icon} ${f.ar} · ${f.en}`;
  }

  // ===== الجدول: من السيرفر إذا متاح، وإلا الجدول الاحتياطي =====
  async function fetchSchedule() {
    try {
      const items = await getJSON(api.schedule);
      const seen = {}, out = [];
      (items || []).forEach(it => {
        const name = it.name || it.title;
        if (!name || seen[name]) return;
        const st = it.start_timestamp || Date.parse(it.start) / 1000;
        const en = it.end_timestamp || Date.parse(it.end) / 1000;
        if (!st || !en) return;
        let s = ammanMinutes(new Date(st * 1000)), e = ammanMinutes(new Date(en * 1000));
        if (e <= s) e = e === 0 ? 1440 : e + 1440;
        seen[name] = true;
        out.push({ name, start: s, end: Math.min(e, 1440) });
      });
      if (out.length) return { periods: out, source: "server" };
    } catch (_) {}
    return { periods: C.fallbackSchedule.slice(), source: "fallback" };
  }

  // بيعبّي الفراغات بالبث الاحتياطي، فبيطلع يوم كامل من 00:00 لـ 24:00
  function buildDay(periods) {
    const sorted = periods.slice().sort((a, b) => a.start - b.start), day = [];
    let cur = 0;
    sorted.forEach(p => {
      if (p.start > cur) day.push({ name: null, start: cur, end: p.start, fallback: true });
      day.push(p); cur = Math.max(cur, p.end);
    });
    if (cur < 1440) day.push({ name: null, start: cur, end: 1440, fallback: true });
    return day;
  }

  function renderSchedule(el, periods, activePlaylist) {
    let day = buildDay(periods);
    const now = ammanMinutes();
    // ترتيب حسب يوم العمل: يبدأ من أول فترة مجدولة (الصباحي)، والفترة الليلية آخر شي
    const first = day.findIndex(p => !p.fallback);
    if (first > 0) day = day.slice(first).concat(day.slice(0, first));
    el.innerHTML = "";
    day.forEach(p => {
      const info = p.fallback ? C.fallbackProgram : programInfo(p.name);
      const isNow = now >= p.start && now < p.end;
      const li = document.createElement("li");
      li.className = "period" + (isNow ? " now" : "") + (p.fallback ? " fb" : "");
      const pct = isNow ? ((now - p.start) / (p.end - p.start)) * 100 : 0;
      li.innerHTML = `
        <span class="p-icon">${info.icon}</span>
        <span class="p-main">
          <span class="p-name"></span>
          <span class="p-en"></span>
          ${isNow ? `<span class="p-bar"><i style="width:${pct.toFixed(1)}%"></i></span>` : ""}
        </span>
        <span class="p-side">
          <span class="p-time">${hhmm12(p.start)} – ${hhmm12(p.end)}</span>
          ${isNow ? `<span class="p-now">● الآن · متبقي ${duration(p.end - now)}</span>` : ""}
        </span>`;
      li.querySelector(".p-name").textContent = info.ar;
      li.querySelector(".p-en").textContent = info.en;
      el.appendChild(li);
    });
  }

  window.RadioCommon = { C, api, getJSON, fetchNowPlaying, fetchSchedule, renderSchedule, programLabel, programInfo, ammanMinutes, hhmm, hhmm12, clock, fmt, duration };
})();

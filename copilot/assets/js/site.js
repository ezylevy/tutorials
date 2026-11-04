/* רישיון טיס ל-Copilot · עזי לוי
   הכול נשמר רק בדפדפן של הקורא (localStorage), ועובד גם כשהאחסון חסום. */
(function () {
  'use strict';

  var KEY = 'ezi-copilot-license-v1';
  var TOTAL = 10;
  var COLORS = { 1: '#b4232c', 2: '#b45309', 3: '#0f766e', 4: '#1d4ed8', 5: '#6d28d9', 6: '#be185d', 7: '#047857', 8: '#9a3412', 9: '#0e7490', 10: '#4d7c0f' };
  var GOALS = { daily: [1, 2, 3, 4, 5, 9], agents: [1, 2, 6, 7, 8, 9, 10], all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
  var LIC_NAMES = { free: 'Copilot Chat (חינמי)', paid: 'Microsoft 365 Copilot (בתשלום)', unsure: 'עוד בבדיקה' };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- מצב ---------- */
  var state = { name: '', lic: '', goal: '', wings: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      state.name = typeof saved.name === 'string' ? saved.name : '';
      state.lic = saved.lic || '';
      state.goal = saved.goal || '';
      state.wings = saved.wings && typeof saved.wings === 'object' ? saved.wings : {};
    }
  } catch (e) { /* אחסון חסום או פגום: מתחילים נקי */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* בסדר, פשוט לא נזכור */ } }

  /* ---------- רישיון ומטרה ---------- */
  var root = document.documentElement;
  function applyChoices() {
    root.classList.remove('lic-free', 'lic-paid', 'lic-unsure');
    if (state.lic) root.classList.add('lic-' + state.lic);
    $$('[data-set-lic]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lic') === state.lic)); });
    $$('[data-set-goal]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-goal') === state.goal)); });
    var rec = GOALS[state.goal];
    $$('#planList li').forEach(function (li) {
      var n = +li.getAttribute('data-st');
      li.classList.toggle('recommended', !!rec && state.goal !== 'all' && rec.indexOf(n) > -1);
      li.classList.toggle('dim', !!rec && rec.indexOf(n) === -1);
    });
    var ck = $('#ckLic');
    if (ck) ck.textContent = state.lic === 'paid' ? 'Microsoft 365 Copilot' : 'Copilot Chat · Upgrade';
    renderFoot();
    renderLicense();
  }
  document.addEventListener('click', function (e) {
    var l = e.target.closest('[data-set-lic]');
    if (l) { state.lic = l.getAttribute('data-set-lic'); save(); applyChoices(); return; }
    var g = e.target.closest('[data-set-goal]');
    if (g) { state.goal = g.getAttribute('data-set-goal'); save(); applyChoices(); }
  });
  var nameEl = $('#pName');
  if (nameEl) {
    nameEl.value = state.name;
    nameEl.addEventListener('input', function () { state.name = nameEl.value; save(); renderFoot(); renderLicense(); });
  }
  function renderFoot() {
    var f = $('#lbFoot'); if (!f) return;
    var n = (state.name || 'STUDENT').toUpperCase().replace(/[^A-Z0-9א-ת]/g, '<').slice(0, 14);
    var lic = state.lic === 'paid' ? 'M365' : state.lic === 'free' ? 'CHAT' : 'TBD';
    var s = 'CPLT<' + lic + '<<' + n + '<<WINGS<' + Object.keys(state.wings).length + '<OF<10';
    while (s.length < 44) s += '<';
    f.textContent = s;
  }

  /* ---------- העתקה ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (ok, no) {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? ok() : no(); } catch (e) { no(); }
      document.body.removeChild(t);
    });
  }
  function flash(btn, label, okLabel) {
    btn.textContent = okLabel || 'הועתק ✓'; btn.classList.add('done');
    setTimeout(function () { btn.textContent = label; btn.classList.remove('done'); }, 1800);
  }
  $$('.copy').forEach(function (block) {
    var pre = $('pre', block); if (!pre) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'cp'; btn.textContent = 'העתקה';
    btn.setAttribute('aria-label', 'העתקת הטקסט');
    btn.addEventListener('click', function () {
      copyText(pre.textContent).then(function () { flash(btn, 'העתקה'); }, function () { btn.textContent = 'סמנו והעתיקו'; });
    });
    var box = document.createElement('div');
    box.className = 'cbox';
    pre.parentNode.insertBefore(box, pre);
    box.appendChild(pre); box.appendChild(btn);
  });

  /* ---------- הדרכות עם צילומי מסך ---------- */
  $$('[data-walk]').forEach(function (w) {
    var steps = $$('.wstep', w), i = 0;
    var dots = $('.dots', w), count = $('.count', w), prev = $('[data-prev]', w), next = $('[data-next]', w);
    steps.forEach(function (s, k) {
      var d = document.createElement('button');
      d.type = 'button'; d.setAttribute('aria-label', 'צעד ' + (k + 1));
      d.addEventListener('click', function () { go(k); });
      dots.appendChild(d);
    });
    function go(k) {
      i = Math.max(0, Math.min(steps.length - 1, k));
      steps.forEach(function (s, n) { s.classList.toggle('on', n === i); });
      $$('button', dots).forEach(function (d, n) { d.setAttribute('aria-current', String(n === i)); });
      count.textContent = 'צעד ' + (i + 1) + ' מתוך ' + steps.length;
      prev.disabled = i === 0; next.disabled = i === steps.length - 1;
    }
    prev.addEventListener('click', function () { go(i - 1); });
    next.addEventListener('click', function () { go(i + 1); });
    w.addEventListener('keydown', function (e) {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'ArrowLeft') { go(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(i - 1); e.preventDefault(); }
    });
    go(0);
  });

  /* ---------- יוטיוב קל: נטען רק בלחיצה ---------- */
  $$('.yt').forEach(function (box) {
    var btn = $('button', box);
    var cap = $('.cap', box);
    btn.setAttribute('aria-label', 'הפעלת הסרטון: ' + cap.textContent);
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-id') + '?autoplay=1&rel=0&start=' + (box.getAttribute('data-t') || 0);
      f.title = cap.textContent;
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      box.innerHTML = ''; box.appendChild(f);
    });
  });

  /* ---------- סימולטור תא הטייס ---------- */
  var HS = {
    1: ['New chat · צ׳אט חדש', 'פותח שיחה נקייה. כלל אצבע: נושא חדש, צ׳אט חדש. שיחה ארוכה מדי על כמה נושאים מבלבלת אותו.', ''],
    2: ['Search · חיפוש', 'מחפש בשיחות הקודמות שלכם, ובארגון גם קבצים ואנשים, מתוך מה שמותר לכם לראות.', ''],
    3: ['Library · ספרייה', 'כל מה שיצרתם עם Copilot במקום אחד: תמונות, מסמכים ודפים.', ''],
    4: ['Create · יצירה', 'יוצר תמונות, סרטונים קצרים, סטוריז לאינסטגרם ואינפוגרפיקות. אייל מרקוס משווה אותו לקנבה, ומודה שהוא עוד פחות טוב ממנה. עברית בתוך תמונות עדיין מאתגרת.', ''],
    5: ['Agents · סוכנים', 'הסוכנים של מיקרוסופט, של הארגון, ואלה שתבנו בעצמכם. גם ברישיון החינמי אפשר לבנות סוכן. נעמיק בשיעור 6.', 'st6'],
    6: ['Notebooks · מחברות', 'מרכזים קבצים ושיחות של פרויקט אחד במקום אחד, ממש כמו NotebookLM של גוגל. יש גם Generate audio, שהופך את החומר לפודקאסט קצר.', ''],
    7: ['+ ו-/ · מקורות לשיחה', 'מעלים קובץ מהמחשב, או מתייגים קבצים, מיילים, פגישות ואנשים. בתיבת הכתיבה מספיק להקליד / ולבחור. תיוג של מיילים ופגישות דורש את הרישיון בתשלום.', ''],
    8: ['Work | Web', 'מופיע רק ברישיון בתשלום. Work עונה מתוך המידע של העבודה שלכם (מיילים, קבצים, פגישות), ו-Web מתוך האינטרנט.', 'st1'],
    9: ['··· ואז Settings ואז Personalization', 'כאן כותבים הוראות קבועות (למשל ״ענה בעברית ובקצרה״), ורואים ומוחקים את מה ש-Copilot זוכר עליכם. ההגדרה הכי משתלמת ביום הראשון.', ''],
    10: ['שם הרישיון', 'Copilot Chat עם כפתור שדרוג פירושו שאתם בחינמי. Microsoft 365 Copilot פירושו שיש לכם את הרישיון בתשלום.', 'st1'],
    11: ['Schedule this prompt', 'מתחת לתשובה. קובעים שהפרומפט ירוץ שוב לבד, למשל כל בוקר: ״סכם את המיילים שדורשים ממני תגובה״. ככה תשובה חד-פעמית הופכת לשגרה.', '']
  };
  var seen = {};
  var ckOut = $('#ckExplain'), ckProg = $('#ckProgress');
  $$('.hs').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = b.getAttribute('data-hs'), d = HS[n];
      $$('.hs').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true'); b.classList.add('seen');
      seen[n] = 1;
      var more = d[2] ? ' <a href="#' + d[2] + '">לשיעור הרלוונטי ←</a>' : '';
      ckOut.innerHTML = '<b dir="auto">' + esc(d[0]) + '</b><p>' + esc(d[1]) + more + '</p>';
      var k = Object.keys(seen).length;
      ckProg.textContent = k === 11 ? 'גיליתם את כל 11 הכפתורים. אתם מכירים את תא הטייס.' : 'גיליתם ' + k + ' מתוך 11';
    });
  });

  /* ---------- מחולל הוראות ---------- */
  var iIds = ['iRole', 'iMission', 'iSources', 'iTone', 'iFormat', 'iFallback', 'iSensitive'];
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function buildInstr() {
    var lines = [];
    lines.push('# תפקיד');
    lines.push('אתה ' + (val('iRole') || '[מי הסוכן]') + '. ' + (val('iMission') || ''));
    lines.push('');
    lines.push('# מקורות');
    lines.push('ענה רק מתוך ' + (val('iSources') || '[המקורות]') + '. אל תשתמש בידע כללי או בניחושים.');
    lines.push('בכל תשובה, ציין מאיזה מסמך או עמוד הגיע המידע.');
    lines.push('');
    lines.push('# סגנון');
    lines.push('ענה בעברית. הטון: ' + val('iTone') + '.');
    lines.push(val('iFormat'));
    lines.push('');
    lines.push('# כללים');
    lines.push('אם התשובה לא מופיעה במקורות, ' + (val('iFallback') || 'אמור שאין לך מידע') + '.');
    if (val('iSensitive')) lines.push('אם שואלים על ' + val('iSensitive') + '.');
    lines.push('אם השאלה לא ברורה, שאל שאלת הבהרה אחת לפני שאתה עונה.');
    lines.push('אל תמציא שמות, מספרים, תאריכים או קישורים.');
    return lines.join('\n');
  }
  var iOut = $('#iOut');
  if (iOut) {
    var renderInstr = function () { iOut.textContent = buildInstr(); };
    iIds.forEach(function (id) { var el = document.getElementById(id); if (el) el.addEventListener('input', renderInstr); });
    renderInstr();
    $('#iCopy').addEventListener('click', function () {
      var b = this; copyText(iOut.textContent).then(function () { flash(b, 'העתקת ההוראות'); });
    });
  }

  /* ---------- בודק כתובות ---------- */
  var urlIn = $('#urlIn'), urlOut = $('#urlOut');
  function checkUrl() {
    var raw = urlIn.value.trim();
    urlOut.className = 'verdict';
    if (!raw) { urlOut.className = 'verdict info'; urlOut.textContent = 'הדביקו כתובת, ואז לחצו בדיקה.'; return; }
    var u;
    try { u = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw); } catch (e) {
      urlOut.className = 'verdict bad'; urlOut.textContent = 'זו לא נראית כמו כתובת אינטרנט תקינה. בדקו שאין רווחים.'; return;
    }
    var segs = u.pathname.split('/').filter(Boolean);
    var depth = segs.length;
    var host = u.hostname;
    if (/sharepoint\.com$/i.test(host)) {
      urlOut.className = 'verdict info';
      urlOut.textContent = 'זו כתובת של SharePoint. ברישיון בתשלום מוסיפים אותה דרך אזור הקבצים והאתרים (Knowledge), ולא כאתר אינטרנט. ברישיון החינמי, קבצים מ-SharePoint לא נשמרים כמקור.';
      return;
    }
    if (depth <= 2) {
      urlOut.className = 'verdict ok';
      urlOut.textContent = 'עובר. עומק ' + depth + ' (המקסימום הוא 2). הסוכן יקרא את ' + host + (depth ? '/' + segs.join('/') : '') + ' ואת מה שמתחת. ודאו שהתוכן הוא טקסט רגיל שמנוע חיפוש יכול למצוא.';
    } else {
      var fix = host + '/' + segs.slice(0, 2).join('/');
      urlOut.className = 'verdict bad';
      urlOut.textContent = 'ייכשל: עומק ' + depth + ', והמקסימום הוא 2. נסו במקום זה את ' + fix + '. הסוכן יקרא גם את כל מה שמתחת, כולל העמוד שרציתם.';
    }
  }
  if (urlIn) {
    $('#urlGo').addEventListener('click', checkUrl);
    urlIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkUrl(); } });
    $$('[data-url]').forEach(function (b) { b.addEventListener('click', function () { urlIn.value = b.getAttribute('data-url'); checkUrl(); }); });
  }

  /* ---------- מחולל SKILL.md ---------- */
  var sBox = $('#sOutBox');
  function slug(s) { return (s || 'my-skill').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'my-skill'; }
  function buildSkill() {
    var steps = val('sSteps').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
    var desc = val('sDesc').replace(/\s+/g, ' ');
    var out = [
      '---',
      'name: ' + slug(val('sName')),
      'description: ' + desc,
      '---',
      '',
      '# ' + slug(val('sName')),
      '',
      '## הוראות'
    ];
    steps.forEach(function (s, k) { out.push((k + 1) + '. ' + s); });
    out.push('', '## פורמט הפלט', val('sOut'));
    return out.join('\n');
  }
  if (sBox) {
    var renderSkill = function () { sBox.textContent = buildSkill(); };
    ['sName', 'sDesc', 'sSteps', 'sOut'].forEach(function (id) { document.getElementById(id).addEventListener('input', renderSkill); });
    renderSkill();
    $('#sCopy').addEventListener('click', function () { var b = this; copyText(sBox.textContent).then(function () { flash(b, 'העתקה'); }); });
    $('#sDown').addEventListener('click', function () {
      var blob = new Blob([sBox.textContent], { type: 'text/markdown;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'SKILL.md';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      flash(this, 'הורדת SKILL.md', 'ירד ✓');
    });
  }

  /* ---------- סטודיו או בונה ---------- */
  var answers = {};
  var decideOut = $('#decideOut');
  $$('#decideTool .yn').forEach(function (g) {
    $$('button', g).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', g).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        answers[g.getAttribute('data-q')] = +b.getAttribute('data-v');
        var n = Object.keys(answers).length, yes = 0;
        Object.keys(answers).forEach(function (k) { yes += answers[k]; });
        if (yes > 0) {
          var why = [];
          if (answers[1]) why.push('קהל רחב');
          if (answers[2]) why.push('תהליך רב-שלבי');
          if (answers[3]) why.push('חיבור למערכת');
          if (answers[4]) why.push('הפעלה אוטומטית');
          decideOut.className = 'verdict info';
          decideOut.textContent = 'כנראה Copilot Studio (' + why.join(', ') + '). טיפ: אפשר להתחיל ב-Agent Builder, לבדוק את ההוראות, ואז להעתיק לסטודיו.';
        } else if (n === 4) {
          decideOut.className = 'verdict ok';
          decideOut.textContent = 'Agent Builder מספיק לגמרי. בונים בתוך Copilot, בלי עלות נוספת ובלי לחכות ל-IT. אם תגדלו, תמיד אפשר להעתיק לסטודיו.';
        } else {
          decideOut.className = 'verdict';
        }
      });
    });
  });

  /* ---------- מחשבון קרדיטים ---------- */
  var cIds = ['cClassic', 'cGen', 'cAction', 'cGraph'];
  var cRates = [1, 2, 5, 10];
  function num(id) { var v = parseFloat(document.getElementById(id).value); return isFinite(v) && v > 0 ? v : 0; }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function calc() {
    var credits = 0;
    cIds.forEach(function (id, k) { credits += num(id) * cRates[k]; });
    var packs = Math.max(credits > 0 ? 1 : 0, Math.ceil(credits / 25000));
    $('#rCredits').textContent = fmt(credits);
    $('#rPayg').textContent = '$' + fmt(credits * 0.01);
    $('#rPacks').textContent = '$' + fmt(packs * 200);
    var meter = $('#rMeter'), note = $('#rNote');
    var cap = packs * 25000, pct = cap ? credits / cap : 0;
    meter.style.width = Math.min(100, pct * 100) + '%';
    meter.style.background = pct > .85 ? '#c2410c' : '#136c3a';
    if (!credits) { note.textContent = 'מלאו כמה מספרים כדי לראות הערכה.'; return; }
    var cheaper = credits * 0.01 < packs * 200 ? 'תשלום לפי שימוש זול יותר בהיקף הזה.' : 'חבילות משתלמות יותר בהיקף הזה.';
    note.textContent = 'בחבילות: ' + packs + ' ' + (packs === 1 ? 'חבילה' : 'חבילות') + ', ניצול של ' + Math.round(pct * 100) + '% מהקיבולת. ' + cheaper + ' זכרו: משתמשים עם רישיון Microsoft 365 Copilot שמפעילים סוכן פנימי לא נספרים כאן.';
  }
  if ($('#calcTool')) {
    cIds.forEach(function (id) { document.getElementById(id).addEventListener('input', calc); });
    calc();
  }

  /* ---------- כנפיים ---------- */
  function today() {
    var d = new Date(), p = function (x) { return (x < 10 ? '0' : '') + x; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
  }
  function wingsSVG(n, date) {
    var c = COLORS[n] || '#b4232c';
    var feathers = '';
    for (var k = 0; k < 5; k++) {
      var y = 52 + k * 7, len = 40 - k * 6;
      feathers += '<path d="M48 ' + y + ' q-' + (len * .55) + ' -6 -' + len + ' -' + (12 - k * 2) + '" fill="none" stroke="' + c + '" stroke-width="3.2" stroke-linecap="round"/>';
      feathers += '<path d="M72 ' + y + ' q' + (len * .55) + ' -6 ' + len + ' -' + (12 - k * 2) + '" fill="none" stroke="' + c + '" stroke-width="3.2" stroke-linecap="round"/>';
    }
    return '<svg viewBox="0 0 120 120" role="img" aria-label="כנפיים של שיעור ' + n + '">' +
      '<g transform="rotate(-6 60 60)">' +
      '<circle cx="60" cy="60" r="56" fill="#fffdf6" stroke="' + c + '" stroke-width="2.5"/>' +
      '<circle cx="60" cy="60" r="50" fill="none" stroke="' + c + '" stroke-width="1" stroke-dasharray="2 3"/>' +
      feathers +
      '<circle cx="60" cy="58" r="13" fill="' + c + '"/>' +
      '<text x="60" y="63" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#fff">' + n + '</text>' +
      '<text x="60" y="32" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" letter-spacing="2" fill="' + c + '">COPILOT</text>' +
      '<text x="60" y="96" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="7.5" fill="' + c + '">' + esc(date || '') + '</text>' +
      '</g></svg>';
  }
  function paintWing(n, animate) {
    var slot = $('[data-slot="' + n + '"]');
    if (slot) {
      slot.classList.add('has'); slot.innerHTML = wingsSVG(n, state.wings[n]);
      if (animate) { slot.classList.remove('stamp-in'); void slot.offsetWidth; slot.classList.add('stamp-in'); }
    }
    var li = $('#planList li[data-st="' + n + '"]');
    if (li) {
      li.classList.add('done'); $('.status', li).textContent = 'הושלם';
      if (animate) { li.classList.remove('flip'); void li.offsetWidth; li.classList.add('flip'); }
    }
    var d = $('.dock a[data-d="' + n + '"]'); if (d) d.classList.add('got');
    updateCount();
  }
  function updateCount() {
    var k = Object.keys(state.wings).length;
    var c = $('#dockCount'); if (c) c.textContent = k + ' מתוך ' + TOTAL + ' כנפיים';
  }
  function solveQuiz(q) {
    $$('.opts button', q).forEach(function (b) {
      b.classList.toggle('right', b.hasAttribute('data-ok'));
      b.classList.remove('wrong');
    });
  }
  $$('.quiz').forEach(function (q) {
    var n = q.getAttribute('data-st'), fb = $('.fb', q);
    if (state.wings[n]) { solveQuiz(q); paintWing(n, false); }
    $$('.opts button', q).forEach(function (b) {
      b.addEventListener('click', function () {
        fb.textContent = b.getAttribute('data-why');
        if (b.hasAttribute('data-ok')) {
          fb.className = 'fb ok'; solveQuiz(q);
          if (!state.wings[n]) { state.wings[n] = today(); save(); paintWing(n, true); renderFoot(); renderLicense(); }
        } else {
          fb.className = 'fb no'; b.classList.add('wrong');
        }
      });
    });
  });

  /* ---------- הרישיון ---------- */
  function sealSVG(done) {
    var c = done ? '#b4232c' : '#b9a77d';
    var label = done ? 'LICENSED' : 'IN TRAINING';
    return '<circle cx="75" cy="75" r="72" fill="none" stroke="' + c + '" stroke-width="3"/>' +
      '<circle cx="75" cy="75" r="64" fill="none" stroke="' + c + '" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<circle cx="75" cy="75" r="48" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
      '<text x="75" y="22" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="2" fill="' + c + '">COPILOT</text>' +
      '<text x="75" y="136" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="1.5" font-weight="700" fill="' + c + '">' + label + '</text>' +
      '<path d="M40 82 q16 -4 28 -16 M110 82 q-16 -4 -28 -16 M44 92 q14 -2 26 -12 M106 92 q-14 -2 -26 -12" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="75" cy="70" r="11" fill="' + c + '"/>' +
      '<text x="75" y="112" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="' + c + '">' + Object.keys(state.wings).length + '/10</text>';
  }
  function renderLicense() {
    var k = Object.keys(state.wings).length, done = k === TOTAL;
    var set = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };
    set('licTitle', done ? 'רישיון טיס: מוסמך' : 'רישיון טיס: בהכשרה');
    set('licName', state.name.trim() || 'עוד לא מילאתם');
    set('licType', LIC_NAMES[state.lic] || 'לא נבחר');
    set('licCount', k + ' מתוך ' + TOTAL);
    var dates = Object.keys(state.wings).map(function (x) { return state.wings[x]; });
    set('licDate', done ? dates[dates.length - 1] : (k ? 'בדרך' : '-'));
    set('licIntro', done ? 'אספתם את כל עשרת זוגות הכנפיים. מזל טוב, אתם טייסים מוסמכים של Copilot.' : 'כל זוג כנפיים שאספתם מופיע כאן. אספו את כל עשרת הזוגות, והרישיון מוכן.');
    var row = $('#wingRow');
    if (row) {
      var h = '';
      for (var i = 1; i <= TOTAL; i++) h += '<span class="' + (state.wings[i] ? 'on' : '') + '">' + i + '</span>';
      row.innerHTML = h;
    }
    var seal = $('#licSeal'); if (seal) seal.innerHTML = sealSVG(done);
    var share = $('#licShare');
    if (share) {
      var msg = 'היי עזי, ' + (done ? 'סיימתי את רישיון הטיס ל-Copilot! ' : 'אני באמצע רישיון הטיס ל-Copilot (' + k + '/10). ') + 'הסוכן שבניתי: ';
      share.href = 'https://wa.me/972544266802?text=' + encodeURIComponent(msg);
    }
  }
  var reset = $('#resetBtn');
  if (reset) reset.addEventListener('click', function () {
    if (!window.confirm('לאפס את יומן הטיסה? כל הכנפיים והבחירות יימחקו מהדפדפן.')) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* אין מה למחוק */ }
    location.reload();
  });

  /* ---------- מעגן: איפה אני ---------- */
  var dockLinks = $$('.dock ol a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id.replace('st', '');
          dockLinks.forEach(function (a) { a.classList.toggle('here', a.getAttribute('data-d') === id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('.spread').forEach(function (s) { io.observe(s); });
  }

  /* ---------- מגדל הפיקוח ---------- */
  var ERRORS = [
    { k: 'לא רואה agents סוכנים אין כפתור new agent חסר', t: 'לא רואים את Agents או את New agent', a: 'כמעט תמיד זו הגדרה של הארגון: מנהל ה-IT יכול לחסום בניית סוכנים. בדקו גם שאתם מחוברים עם חשבון עבודה ולא עם חשבון פרטי.', l: 'st1' },
    { k: 'sharepoint onedrive קובץ לא נשמר מקור ידע add content אזהרה can\'t add', t: 'הוספתי קובץ מ-SharePoint לסוכן, והוא לא נשמר', a: 'ברישיון החינמי, ידע של סוכן הוא אתרי אינטרנט בלבד. העלו את הקובץ בתוך השיחה עם הסוכן, או בקשו מהארגון את הרישיון בתשלום.', l: 'st7' },
    { k: 'two levels deep שתי רמות עומק url כתובת שגיאה website', t: 'The website can\'t be more than two levels deep', a: 'הכתובת עמוקה מדי. קצרו אותה לשתי רמות מתחת לדומיין. הסוכן עדיין יקרא את כל מה שמתחת. אפשר לבדוק בכלי שבשיעור 7.', l: 'st7' },
    { k: 'לא מוצא תוכן אתר לא עונה מהאתר javascript טבלה', t: 'הסוכן לא מוצא מידע שנמצא באתר', a: 'הסוכן קורא אתרים כמו מנוע חיפוש. תוכן שנבנה ב-JavaScript, קורא ספרים מוטמע או עמוד שדורש התחברות לא יימצא. אם מנוע חיפוש לא מוצא את זה, גם הסוכן לא.', l: 'st7' },
    { k: 'עונה מהאינטרנט לא מהמסמכים ממציא הזיות', t: 'הסוכן עונה מהידע הכללי ולא מהמקורות שלי', a: 'הדליקו את Only use specified sources, כבו חיפוש ברשת, והוסיפו להוראות: ״ענה רק מתוך המקורות. אם אין תשובה, אמור זאת.״', l: 'st7' },
    { k: 'עמית לא רואה שיתוף הרשאה לא עונה לו', t: 'שיתפתי סוכן, והעמית לא מקבל תשובות מהמסמכים', a: 'לעמית צריכה להיות הרשאה למסמכים עצמם. הסוכן מכבד הרשאות, ושיתוף שלו לא פותח גישה לקבצים.', l: 'st9' },
    { k: 'researcher analyst אין לי חוקר אנליסט', t: 'אין לי Researcher או Analyst', a: 'שני הסוכנים האלה זמינים רק עם הרישיון בתשלום, ויש להם מגבלת שימוש חודשית. בחינמי נסו את Prompt Coach ואת Writing Coach.', l: 'st9' },
    { k: 'פרומפטים מוצעים נעלמו suggested prompts עברית', t: 'הפרומפטים המוצעים לא מופיעים בסוכן מהסטודיו', a: 'בסוכן ששפתו הראשית אינה אנגלית, הם לא מופיעים בערוץ של Microsoft 365 Copilot. ב-Teams וב-Web Chat הם כן מופיעים.', l: 'st10' },
    { k: 'outlook לא מופיע copilot במייל טיוטה', t: 'אין Copilot ב-Outlook, או שהוא לא כותב בסגנון שלי', a: 'בהגדרות של Outlook בוחרים Copilot ומדליקים Turn on Copilot. לסגנון: Draft ואז Custom Instructions, ובסוף Apply changes.', l: 'st4' },
    { k: 'share אפור שיתוף מסך לא עובד כפתור', t: 'הכפתור Share אפור בשיתוף מסך', a: 'קודם בוחרים חלון (Window) או מסך שלם (Entire Screen), ורק אז הכפתור נדלק.', l: 'st3' },
    { k: 'סיכום פגישה teams אין ai summary תמלול', t: 'אין סיכום AI לפגישה ב-Teams', a: 'בדרך כלל הסיכום נבנה מהתמלול, אז ודאו שהפגישה תומללה או הוקלטה. אם עדיין אין, בדקו מול ה-IT איזה רישיון ומדיניות פגישות מוגדרים לכם.', l: 'st5' },
    { k: 'סטודיו הפסיק לענות הושבת קרדיטים 125', t: 'סוכן בסטודיו הפסיק לענות באמצע החודש', a: 'כנראה השימוש עבר 125% מהקיבולת, והסוכנים המותאמים הושבתו. בדקו את צריכת הקרדיטים מול מנהל ה-Power Platform.', l: 'st10' },
    { k: 'לא יכול לפרסם סטודיו ניסיון trial publish', t: 'בסטודיו אי אפשר לפרסם את הסוכן', a: 'רישיון הניסיון מאפשר לבנות ולבדוק, אבל לא לפרסם. צריך רישיון מלא.', l: 'st10' },
    { k: 'שפה ראשית לשנות שפה אנגלית עברית סטודיו', t: 'בחרתי שפה ראשית לא נכונה לסוכן בסטודיו', a: 'אחרי היצירה אי אפשר לשנות אותה. יוצרים סוכן חדש עם השפה הנכונה ומעתיקים אליו את ההוראות.', l: 'st10' },
    { k: 'עברית תמונה create משובש הפוך', t: 'העברית בתמונות שיצרתי משובשת', a: 'יצירת טקסט עברי בתוך תמונות עדיין חלשה. בקשו תמונה בלי טקסט, והוסיפו את הכותרת אחר כך ב-PowerPoint או ב-Designer.', l: 'st2' },
    { k: 'זוכר דברים לא נכונים זיכרון memory', t: 'Copilot זוכר עליי דברים לא נכונים', a: 'ב-Settings ואז Personalization יש את רשימת הזיכרונות. מוחקים שם כל מה שלא נכון.', l: 'st2' }
  ];
  var errIn = $('#errIn'), errList = $('#errList');
  function renderErrors() {
    var q = (errIn.value || '').toLowerCase().trim();
    var words = q.split(/\s+/).filter(function (w) { return w.length > 1; });
    var list = ERRORS.map(function (e) {
      var hay = (e.k + ' ' + e.t + ' ' + e.a).toLowerCase(), s = 0;
      words.forEach(function (w) { if (hay.indexOf(w) > -1) s += e.k.toLowerCase().indexOf(w) > -1 ? 3 : 1; });
      return { e: e, s: s };
    });
    if (words.length) list = list.filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; });
    else list = list.slice(0, 6);
    if (!list.length) {
      errList.innerHTML = '<li><b>לא מצאתי התאמה</b><p>נסו מילים אחרות, או <a href="https://wa.me/972544266802" target="_blank" rel="noopener">כתבו לעזי בוואטסאפ</a>.</p></li>';
      return;
    }
    errList.innerHTML = list.map(function (x) {
      return '<li><b dir="auto">' + esc(x.e.t) + '</b><p>' + esc(x.e.a) + ' <a href="#' + x.e.l + '">לשיעור ←</a></p></li>';
    }).join('');
  }
  if (errIn) { errIn.addEventListener('input', renderErrors); renderErrors(); }

  applyChoices();
  updateCount();
})();

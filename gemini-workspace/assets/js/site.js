/* קווי Gemini · Google Workspace עם Gemini · עזי לוי
   הכול נשמר רק בדפדפן של הקורא (localStorage), ועובד גם כשהאחסון חסום. */
(function () {
  'use strict';

  var KEY = 'ezi-gws-v1';
  var TOTAL = 10;
  var COLORS = { 1: '#1a73e8', 2: '#7c3aed', 3: '#c5221f', 4: '#b06000', 5: '#0b57d0', 6: '#137333', 7: '#9a3412', 8: '#0e7490', 9: '#be185d', 10: '#0f766e' };
  var GOALS = { apps: [1, 2, 4, 5, 6, 7, 8], agents: [1, 2, 3, 9, 10], all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
  var ACC_NAMES = { personal: 'אישי', work: 'עבודה (Workspace)', edu: 'חינוך', unsure: 'עוד לא בטוח/ה' };
  var GOAL_NAMES = { apps: 'להספיק יותר באפליקציות', agents: 'משימות וסוכנים', all: 'כל הקווים' };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  /* ---------- מצב ---------- */
  var state = { name: '', acc: '', goal: '', badges: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      state.name = typeof saved.name === 'string' ? saved.name : '';
      state.acc = saved.acc || '';
      state.goal = saved.goal || '';
      state.badges = saved.badges && typeof saved.badges === 'object' ? saved.badges : {};
    }
  } catch (e) { /* אחסון חסום או פגום: מתחילים נקי */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* בסדר, פשוט לא נזכור */ } }

  /* ---------- חשבון ויעד ---------- */
  var root = document.documentElement;
  function applyChoices() {
    root.classList.remove('acc-personal', 'acc-work', 'acc-edu', 'acc-unsure');
    if (state.acc) root.classList.add('acc-' + state.acc);
    $$('[data-set-acc]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-acc') === state.acc)); });
    $$('[data-set-goal]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-goal') === state.goal)); });
    var rec = GOALS[state.goal];
    $$('#planList li').forEach(function (li) {
      var n = +li.getAttribute('data-st');
      li.classList.toggle('recommended', !!rec && state.goal !== 'all' && rec.indexOf(n) > -1);
      li.classList.toggle('dim', !!rec && rec.indexOf(n) === -1);
    });
    renderTicket();
    renderCard();
    if (typeof renderTask === 'function') renderTask();
    if (typeof renderStudio === 'function') renderStudio();
  }
  document.addEventListener('click', function (e) {
    var r = e.target.closest('[data-set-acc]');
    if (r) { state.acc = r.getAttribute('data-set-acc'); save(); applyChoices(); return; }
    var g = e.target.closest('[data-set-goal]');
    if (g) { state.goal = g.getAttribute('data-set-goal'); save(); applyChoices(); }
  });
  var nameEl = $('#pName');
  if (nameEl) {
    nameEl.value = state.name;
    nameEl.addEventListener('input', function () { state.name = nameEl.value; save(); renderTicket(); renderCard(); });
  }
  function renderTicket() {
    var h = $('#holes');
    if (h) {
      var s = '';
      for (var i = 1; i <= TOTAL; i++) s += '<i class="' + (state.badges[i] ? 'on' : '') + '">' + i + '</i>';
      h.innerHTML = s;
    }
    var f = $('#tkFoot');
    if (f) {
      var acc = { personal: 'PERSONAL', work: 'WORK', edu: 'EDU' }[state.acc] || 'PASSENGER';
      f.textContent = acc + ' · ' + Object.keys(state.badges).length + '/' + TOTAL;
    }
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

  /* ---------- בונה המשימה (מצב Task) ---------- */
  var WHEN = {
    time: ['פרטי התזמון', 'כל יום ב-7:00 בבוקר'],
    gmail: ['איזה מייל מפעיל את המשימה', 'מייל מהמנהלת שלי שיש בו משימה בשבילי'],
    topic: ['באיזה נושא לעקוב', 'הכרזה על סדנה או כנס AI בחינוך בישראל'],
    now: ['עד מתי', 'עד סוף היום']
  };
  var tkOut = $('#tkOut');
  var renderTask = null;
  if (tkOut) {
    var lastWhen = val('tkWhen');
    renderTask = function () {
      var w = val('tkWhen');
      if (w !== lastWhen) { $('#tkDetailLbl').textContent = WHEN[w][0]; $('#tkDetail').value = WHEN[w][1]; lastWhen = w; }
      var d = val('tkDetail');
      var what = val('tkWhat') || '[מה המטרה]';
      var lead = { time: d + ', ', gmail: 'בכל פעם שמגיע ' + d + ', ', topic: 'בכל פעם שיש חדש בנושא: ' + d + ', ', now: '' }[w];
      var lines = [];
      if (val('tkSkill')) lines.push('@' + val('tkSkill').replace(/^[\/@]/, ''));
      lines.push(lead + what);
      if (w === 'now' && d) lines.push('לוח זמנים: ' + d + '.');
      if (val('tkLimit')) lines.push(val('tkLimit'));
      lines.push('כשאתה צריך החלטה שלי, עצור ושאל.');
      tkOut.textContent = lines.join('\n');
      var v = $('#tkVerdict');
      if (state.acc === 'work' || state.acc === 'edu') {
        v.className = 'verdict bad';
        v.innerHTML = 'בחשבון ' + (state.acc === 'work' ? 'עבודה' : 'חינוך') + ' מצב Task עדיין לא זמין. את אותה משימה בונים ב-<a href="#st9">Workspace Studio</a>: ה״מתי״ הוא ה-starter, וה״מה״ הם הצעדים.';
      } else {
        v.className = 'verdict info';
        v.textContent = 'לוחצים Task מתחת לתיבת הכתיבה, מדביקים ושולחים. ' + (w === 'now' ? 'המשימה תרוץ ברקע ותופיע ברשימת השיחות.' : 'לוח הזמנים יופיע בעמוד Scheduled. לבדיקה: More ואז Run now.');
      }
    };
    $$('#tkTool input, #tkTool textarea, #tkTool select').forEach(function (el) { el.addEventListener('input', renderTask); el.addEventListener('change', renderTask); });
    $('#tkCopy').addEventListener('click', function () { var b = this; copyText(tkOut.textContent).then(function () { flash(b, 'העתקה'); }); });
  }

  /* ---------- בונה הסוכן של Workspace Studio ---------- */
  var STARTS = {
    email: ['כשמגיע מייל', 'התנאי (באנגלית)', 'the subject contains "quote" or "partnership"', 'When I get an email'],
    schedule: ['לפי לוח זמנים', 'מתי (באנגלית)', 'every Sunday at 8:00 AM', 'On a schedule'],
    form: ['כשטופס מקבל תשובה', 'איזה טופס (באנגלית)', 'my "Contact us" Google Form', 'When a form response comes in'],
    chat: ['כשמזכירים אותי ב-Chat', 'באיזה מרחב (באנגלית)', 'the "Customer service" space', 'When I\'m mentioned'],
    meeting: ['לפני פגישה', 'אילו פגישות, וכמה זמן לפני (באנגלית)', '10 minutes before every client meeting', 'Based on a meeting']
  };
  var STEPS = {
    extract: ['Extract', 'לחלץ פרטים', true, function (w) { return 'extract ' + (w || 'the key details'); }],
    decide: ['Decide + Check if', 'להחליט, ולהמשיך רק אם כן', true, function (w) { return 'decide whether ' + (w || 'the request is relevant') + ' and continue only if yes'; }],
    summarize: ['Summarize', 'לסכם', true, function () { return 'summarize it briefly'; }],
    ask: ['Ask Gemini', 'שאלה חופשית', true, function (w) { return 'ask Gemini: ' + (w || '[your question]'); }],
    label: ['Add or remove labels', 'תווית במייל', false, function () { return 'add a label to the email'; }],
    sheet: ['Add a row', 'שורה בגיליון', false, function () { return 'add a row with the details to my tracking sheet'; }],
    draft: ['Draft an email', 'טיוטת תשובה', false, function () { return 'draft a personal reply using the extracted details'; }],
    chat: ['Notify me in Chat', 'הודעה אליכם', false, function () { return 'notify me in Google Chat with the summary'; }],
    send: ['Send an email', 'שליחת מייל', false, function () { return 'send an email'; }]
  };
  var stFlow = $('#stFlow');
  var renderStudio = null;
  if (stFlow) {
    var lastStart = val('stStart');
    renderStudio = function () {
      var s = val('stStart');
      if (s !== lastStart) { $('#stDetailLbl').textContent = STARTS[s][1]; $('#stDetail').value = STARTS[s][2]; lastStart = s; }
      var st = STARTS[s], d = val('stDetail'), w = val('stWhat');
      var chosen = $$('#stSteps input:checked').map(function (c) { return c.value; });
      var h = '<li class="start"><span class="k" dir="ltr">STARTER · ' + esc(st[3]) + '</span><b>' + esc(st[0]) + '</b><small>' + esc(d || '[התנאי]') + '</small></li>';
      chosen.forEach(function (k, i) {
        var x = STEPS[k];
        h += '<li class="' + (x[2] ? 'ai' : '') + '"><span class="k" dir="ltr">STEP ' + (i + 2) + ' · ' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b>' + (x[2] ? '<small>צעד AI</small>' : '') + '</li>';
      });
      if (!chosen.length) h += '<li><b>בחרו לפחות צעד אחד</b></li>';
      stFlow.innerHTML = h;
      var lead = { email: 'When I get an email where ' + (d || '...'), schedule: (d ? d.charAt(0).toUpperCase() + d.slice(1) : 'On a schedule'), form: 'When a response comes in to ' + (d || 'my Google Form'), chat: 'When I\'m mentioned in ' + (d || 'Google Chat'), meeting: (d ? d.charAt(0).toUpperCase() + d.slice(1) : 'Before a meeting') }[s];
      var parts = chosen.map(function (k) { return STEPS[k][3](w); });
      $('#stOut').textContent = lead + (parts.length ? ', ' + parts.join(', then ') + '.' : '.');
      var v = $('#stVerdict');
      if (state.acc === 'personal') {
        v.className = 'verdict bad';
        v.innerHTML = 'בחשבון אישי Studio זמין רק דרך Google Workspace Experiments. בדרך כלל קל יותר לבנות את אותו רעיון כמשימה עם לוח זמנים או מעקב Gmail ב<a href="#st3">מצב Task</a>.';
      } else if (chosen.indexOf('send') > -1) {
        v.className = 'verdict bad';
        v.textContent = 'שליחה אוטומטית יוצאת בלי שאף אחד קרא. בהתחלה העדיפו ״טיוטת תשובה״, ותנו לאדם ללחוץ ״שלח״.';
      } else if (chosen.indexOf('decide') > -1 && chosen.indexOf('decide') !== 0 && chosen.indexOf('extract') !== 0) {
        v.className = 'verdict info';
        v.textContent = 'שימו לב לסדר: צעד שמשתמש בתוצאה של צעד אחר חייב לבוא אחריו. ב-Studio אפשר להזיז צעדים למעלה ולמטה.';
      } else {
        v.className = 'verdict ok';
        v.innerHTML = 'מדביקים בתיבה <span class="ui">Describe it with AI</span>, בודקים כל צעד ש-Gemini בנה, מריצים <span class="ui">Test run</span> על דוגמה, ורק אז <span class="ui">Turn on</span>.';
      }
    };
    $$('#stTool input, #stTool select').forEach(function (el) { el.addEventListener('input', renderStudio); el.addEventListener('change', renderStudio); });
    $('#stCopy').addEventListener('click', function () { var b = this; copyText($('#stOut').textContent).then(function () { flash(b, 'העתקה'); }); });
  }

  /* ---------- בוחר הקו ---------- */
  var LINES = {
    1: ['צ׳אט באפליקציית Gemini', 'st2'],
    2: ['החלונית בצד של האפליקציה', 'st4'],
    3: ['Gemini Notebook', 'st8'],
    4: ['', ''],
    5: ['Workspace Studio', 'st9']
  };
  var pick = {};
  var pickOut = $('#pickOut');
  $$('#pickTool .yn').forEach(function (g) {
    $$('button', g).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', g).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        pick[g.getAttribute('data-q')] = +b.getAttribute('data-v');
        var yes = Object.keys(pick).filter(function (k) { return pick[k]; });
        var names = [];
        yes.forEach(function (k) {
          if (k === '4') {
            if (state.acc === 'personal') names.push(['מצב Task', 'st3']);
            else if (state.acc === 'work' || state.acc === 'edu') names.push(['Workspace Studio', 'st9']);
            else names.push(['מצב Task (חשבון אישי) או Workspace Studio (חשבון עבודה)', 'st3']);
          } else names.push(LINES[k]);
        });
        var seen = {};
        names = names.filter(function (n) { if (seen[n[0]]) return false; seen[n[0]] = 1; return true; });
        if (names.length) {
          pickOut.className = 'verdict info';
          pickOut.innerHTML = (names.length > 1 ? 'שילוב של קווים: ' : 'הקו שלכם: ') +
            names.map(function (n) { return '<a href="#' + n[1] + '">' + esc(n[0]) + '</a>'; }).join(' + ') +
            '. מתחילים מהפשוט, ומוסיפים אוטומציה רק כשהידני כבר עובד טוב.';
        } else if (Object.keys(pick).length === 5) {
          pickOut.className = 'verdict ok';
          pickOut.textContent = 'נשמע שהעבודה הזאת לא צריכה AI בכלל, או שעוד לא הגדרתם אותה עד הסוף. התחילו משיחה אחת בצ׳אט: ״עזור לי לפרק את התהליך הזה לשלבים״.';
        } else {
          pickOut.className = 'verdict';
        }
      });
    });
  });

  /* ---------- ניקובים ---------- */
  function today() {
    var d = new Date(), p = function (x) { return (x < 10 ? '0' : '') + x; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
  }
  function badgeSVG(n, date) {
    var c = COLORS[n] || '#1a73e8';
    return '<svg viewBox="0 0 120 120" role="img" aria-label="ניקוב בעצירה ' + n + '">' +
      '<g transform="rotate(-6 60 60)">' +
      '<circle cx="60" cy="60" r="54" fill="#fffdf6" stroke="' + c + '" stroke-width="10"/>' +
      '<rect x="4" y="47" width="112" height="26" rx="3" fill="' + c + '"/>' +
      '<text x="60" y="65" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" letter-spacing="1.5" fill="#fff">STOP ' + (n < 10 ? '0' : '') + n + '</text>' +
      '<text x="60" y="38" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.5" fill="' + c + '">GEMINI LINES</text>' +
      '<text x="60" y="90" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="7" fill="' + c + '">' + esc(date || '') + '</text>' +
      '<circle cx="60" cy="100" r="4" fill="' + c + '"/>' +
      '</g></svg>';
  }
  function paintBadge(n, animate) {
    var slot = $('[data-slot="' + n + '"]');
    if (slot) {
      slot.classList.add('has'); slot.innerHTML = badgeSVG(+n, state.badges[n]);
      if (animate) { slot.classList.remove('stamp-in'); void slot.offsetWidth; slot.classList.add('stamp-in'); }
    }
    var li = $('#planList li[data-st="' + n + '"]');
    if (li) {
      li.classList.add('done'); $('.status', li).textContent = 'נוקב';
      if (animate) { li.classList.remove('flip'); void li.offsetWidth; li.classList.add('flip'); }
    }
    var d = $('.dock a[data-d="' + n + '"]'); if (d) d.classList.add('got');
    updateCount();
  }
  function updateCount() {
    var k = Object.keys(state.badges).length;
    var c = $('#dockCount'); if (c) c.textContent = k + ' מתוך ' + TOTAL + ' ניקובים';
  }
  function solveQuiz(q) {
    $$('.opts button', q).forEach(function (b) {
      b.classList.toggle('right', b.hasAttribute('data-ok'));
      b.classList.remove('wrong');
    });
  }
  $$('.quiz').forEach(function (q) {
    var n = q.getAttribute('data-st'), fb = $('.fb', q);
    if (state.badges[n]) { solveQuiz(q); paintBadge(n, false); }
    $$('.opts button', q).forEach(function (b) {
      b.addEventListener('click', function () {
        fb.textContent = b.getAttribute('data-why');
        if (b.hasAttribute('data-ok')) {
          fb.className = 'fb ok'; solveQuiz(q);
          if (!state.badges[n]) { state.badges[n] = today(); save(); paintBadge(n, true); renderTicket(); renderCard(); }
        } else {
          fb.className = 'fb no'; b.classList.add('wrong');
        }
      });
    });
  });

  /* ---------- חופשי-חודשי ---------- */
  function sealSVG(done) {
    var c = done ? '#1a73e8' : '#b9a77d';
    var label = done ? 'ALL LINES' : 'IN TRANSIT';
    return '<circle cx="75" cy="75" r="72" fill="none" stroke="' + c + '" stroke-width="3"/>' +
      '<circle cx="75" cy="75" r="64" fill="none" stroke="' + c + '" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<circle cx="75" cy="75" r="40" fill="none" stroke="' + c + '" stroke-width="8"/>' +
      '<rect x="27" y="66" width="96" height="18" rx="2" fill="' + c + '"/>' +
      '<text x="75" y="79" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#fff">' + Object.keys(state.badges).length + '/' + TOTAL + '</text>' +
      '<text x="75" y="24" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="2" fill="' + c + '">GEMINI LINES</text>' +
      '<text x="75" y="134" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="1.5" font-weight="700" fill="' + c + '">' + label + '</text>';
  }
  function renderCard() {
    var k = Object.keys(state.badges).length, done = k === TOTAL;
    var set = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };
    set('licTitle', done ? 'חופשי-חודשי, כל הקווים' : 'כרטיס בדרך');
    set('licName', state.name.trim() || 'עוד לא נבחר');
    set('licType', ACC_NAMES[state.acc] || 'לא נבחר');
    set('licGoal', GOAL_NAMES[state.goal] || 'לא נבחר');
    set('licCount', k + ' מתוך ' + TOTAL);
    var dates = Object.keys(state.badges).map(function (x) { return state.badges[x]; });
    set('licDate', done ? dates[dates.length - 1] : (k ? 'בנסיעה' : '-'));
    set('licIntro', done ? 'ניקבתם את כל העשרה. מזל טוב: אתם יודעים לעבוד עם Gemini בכל אפליקציה, לתת לו משימות, ולבנות סוכנים שעובדים בשבילכם.' : 'כל ניקוב שצברתם מופיע כאן. נקבו את כל העשרה, והכרטיס מוכן.');
    var row = $('#wingRow');
    if (row) {
      var h = '';
      for (var i = 1; i <= TOTAL; i++) h += '<span class="' + (state.badges[i] ? 'on' : '') + '" style="' + (state.badges[i] ? 'background:' + COLORS[i] : '') + '">' + i + '</span>';
      row.innerHTML = h;
    }
    var seal = $('#licSeal'); if (seal) seal.innerHTML = sealSVG(done);
    var share = $('#licShare');
    if (share) {
      var msg = 'היי עזי, ' + (done ? 'סיימתי את קווי Gemini! ' : 'אני באמצע קווי Gemini (' + k + '/' + TOTAL + '). ') + 'הסוכן או המשימה שבניתי: ';
      share.href = 'https://wa.me/972544266802?text=' + encodeURIComponent(msg);
    }
  }
  var reset = $('#resetBtn');
  if (reset) reset.addEventListener('click', function () {
    if (!window.confirm('לאפס את הכרטיס? כל הניקובים והבחירות יימחקו מהדפדפן.')) return;
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

  /* ---------- מודיעין הנוסעים: תקלות נפוצות ---------- */
  var ERRORS = [
    { k: 'אין task משימה לא מופיע spark מתג windows', t: 'אין לי את מצב Task', a: 'בודקים: חשבון Google אישי (לא עבודה או בית ספר), מנוי Google AI Pro או Ultra, גיל 18+, Keep Activity מופעל והצטרפות ל-Personal Intelligence. ו-Task עובד באתר, בנייד ובאפליקציה ל-Mac, לא באפליקציה ל-Windows.', l: 'st3' },
    { k: 'spark נעלם איפה', t: 'Gemini Spark נעלם מהתפריט', a: 'הוא לא נעלם, הוא עבר. Spark נקרא היום tasks in Gemini: מתחילים משימה באותו מקום שבו מתחילים צ׳אט, עם Task מתחת לתיבת הכתיבה.', l: 'st1' },
    { k: 'notebooklm לא מוצא notebook מחברת', t: 'לא מוצא את NotebookLM', a: 'מאז 16.7.2026 הוא נקרא Gemini Notebook. אותו מוצר, אותן מחברות. המחברות מסתנכרנות גם לאפליקציית Gemini.', l: 'st8' },
    { k: 'studio לא מופיע flows אין גישה', t: 'Workspace Studio לא מופיע אצלי', a: 'בחשבון של ארגון: צריך מהדורה מתאימה (Business, Enterprise או Education) ושה-אדמין הפעיל את Gemini. בחשבון אישי: Studio זמין רק למי שהצטרף ל-Google Workspace Experiments. אחרת, השתמשו במצב Task.', l: 'st9' },
    { k: 'studio עברית לא מבין hebrew שפה', t: 'Studio לא מבין את התיאור שכתבתי בעברית', a: 'נכון ל-5.11.2026, ה-AI של Workspace Studio לא תומך בעברית. כתבו את התיאור באנגלית. בונה ה-flow בעצירה 9 מכין אותו באנגלית בשבילכם.', l: 'st9' },
    { k: 'studio 25 מגבלה flows ריצות נעצר', t: 'ה-flows ב-Studio הפסיקו לרוץ', a: 'כנראה הגעתם למכסת הריצות היומית, שמתאפסת כל 24 שעות. כבו flows שלא צריך, או הוסיפו תנאים ל-starter כדי שירוץ פחות. ועוד מגבלות: עד 25 flows ועד 100 צעדים בכל flow.', l: 'st9' },
    { k: 'gems skills נעלם / סלאש @', t: 'מה קרה ל-Gems?', a: 'Google מחליפה את Gems ב-skills, שמפעילים עם / (בקרוב @). בחשבון אישי: מ-17.11.2026 ה-Gems לקריאה בלבד, וב-17.12.2026 הם נמחקים. בחשבון עבודה: מרץ 2027. בחינוך: יוני 2027. הורידו לפני כן את קובצי הידע שלהם.', l: 'st2' },
    { k: 'אין גישה מיילים gmail לא רואה מחובר', t: 'Gemini אומר שאין לו גישה למיילים או ליומן', a: 'בתפריט השמאלי של אפליקציית Gemini, ב-Customize, חברו את Google Workspace. ודאו גם ש-Keep Activity מופעל. בחשבון עבודה, ייתכן שה-אדמין חסם.', l: 'st2' },
    { k: 'סמל gemini לא מופיע ב gmail docs חלונית ask', t: 'אין Ask Gemini ב-Gmail או ב-Docs', a: 'בחשבון עבודה: ה-אדמין צריך להפעיל, והזמינות תלויה במהדורה. בחשבון אישי: צריך מנוי Google AI בתשלום. בלי מנוי, רוב התכונות זמינות כרגע רק בארה״ב.', l: 'st4' },
    { k: 'meet סיכום עברית הערות take notes', t: 'הסיכום של Meet לא עובד בעברית', a: 'נכון ל-5.11.2026, ״סיכום שיחה חכם״ תומך באנגלית, ובבטא בכמה שפות אירופיות ואסייתיות. עברית עוד לא ברשימה.', l: 'st7' },
    { k: 'לוח זמנים לא רץ schedule run', t: 'המשימה המתוזמנת לא רצה בזמן', a: 'זמני הריצה משוערים. וגם: אם נגמרה מכסת השימוש, אם יש כבר 15 משימות שרצות, או בעומס גבוה, היא יכולה להתעכב או לא לרוץ. לבדיקה: בעמוד Scheduled, More ואז Run now.', l: 'st3' },
    { k: 'לא יכול ליצור עוד לוח זמנים 50', t: 'לא מצליח ליצור לוח זמנים חדש', a: 'יש מגבלה של 50 לוחות זמנים פעילים. השהו או מחקו אחד. לוח זמנים שהושלם אי אפשר לערוך, רק למחוק.', l: 'st3' },
    { k: 'test run שלח באמת בדיקה פעולה', t: 'הבדיקה ב-Studio שלחה הודעות אמיתיות', a: 'נכון, Test run מבצע את הפעולות באמת. בודקים על מייל או טופס לדוגמה שלכם, ומעדיפים טיוטות על פני שליחה.', l: 'st9' },
    { k: 'studio gemini בנה לא נכון פרומפט', t: 'ה-flow ש-Gemini בנה ב-Studio לא מה שרציתי', a: 'זה קורה. ערכו את הצעדים ידנית, או התחילו מתבנית או מאפס. Gemini בונה רק ממה ש-Studio יודע לעשות.', l: 'st9' },
    { k: 'מתחת 18 תלמידים צעדי ai', t: 'תלמידים לא יכולים להשתמש בצעדי AI', a: 'ב-Studio, מי שמתחת לגיל 18 בחשבון בית ספר לא יכול להשתמש בתכונות AI, וצעדי AI נמחקים מ-flows שמשתפים איתו. גם מצב Task דורש גיל 18.', l: 'st9' },
    { k: 'טעות מספרים ניתוח sheets לא נכון', t: 'הניתוח ב-Sheets יצא עם מספרים לא נכונים', a: 'תמיד בודקים סכומים ואחוזים מול הגיליון. בקשו מ-Gemini להראות את הנוסחה או את הטווח שעליו הוא חישב.', l: 'st6' },
    { k: 'פרטיות מידע אימון בטוח', t: 'האם Google מאמנת מודלים על המידע שלי?', a: 'לפי Google, בחשבונות Workspace הנתונים שאתם שולחים ל-Gemini לא משמשים לאימון מודלים ולא נבדקים על ידי בודקים אנושיים. בחשבון אישי, בדקו את הגדרות הפעילות של Gemini.', l: 'st1' }
  ];
  var errIn = $('#errIn'), errList = $('#errList');
  function renderErrors() {
    var q = (errIn.value || '').toLowerCase().trim();
    var words = q.split(/\s+/).filter(function (w) { return w.length > 1; });
    var list = ERRORS.filter(function (e) {
      if (!words.length) return true;
      var hay = (e.k + ' ' + e.t + ' ' + e.a).toLowerCase();
      return words.some(function (w) { return hay.indexOf(w) > -1; });
    });
    if (!words.length) list = list.slice(0, 5);
    errList.innerHTML = list.length ? list.map(function (e) {
      return '<li><b>' + esc(e.t) + '</b><p>' + esc(e.a) + ' <a href="#' + e.l + '">לעצירה ←</a></p></li>';
    }).join('') : '<li><b>לא מצאתי</b><p>נסו מילה אחרת, או שאלו בקבוצת העדכונים של עזי.</p></li>';
  }
  if (errIn) { errIn.addEventListener('input', renderErrors); renderErrors(); }

  applyChoices();
})();

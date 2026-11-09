/* בית הספר לסוכנים · Claude Code למתקדמים · עזי לוי
   הכול נשמר רק בדפדפן של הקורא (localStorage), ועובד גם כשהאחסון חסום. */
(function () {
  'use strict';

  var KEY = 'ezi-cc-agents-v1';
  var TOTAL = 11;
  var COLORS = { 1: '#0f766e', 2: '#b45309', 3: '#1d4ed8', 4: '#b4232c', 5: '#6d28d9', 6: '#047857', 7: '#9a3412', 8: '#be185d', 9: '#0e7490', 10: '#15803d', 11: '#4d7c0f' };
  var GOALS = { agents: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], app: [1, 2, 9, 11], all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] };
  var WS_NAMES = { desktop: 'אפליקציית Claude', vscode: 'VS Code', terminal: 'טרמינל', unsure: 'עוד לא החלטתי' };
  var GOAL_NAMES = { agents: 'בניית סוכנים', app: 'בניית אפליקציה', all: 'סוכנים ואפליקציה' };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- מצב ---------- */
  var state = { name: '', ws: '', goal: '', badges: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      state.name = typeof saved.name === 'string' ? saved.name : '';
      state.ws = saved.ws || '';
      state.goal = saved.goal || '';
      state.badges = saved.badges && typeof saved.badges === 'object' ? saved.badges : {};
    }
  } catch (e) { /* אחסון חסום או פגום: מתחילים נקי */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* בסדר, פשוט לא נזכור */ } }

  /* ---------- סביבת עבודה ומשימה ---------- */
  var root = document.documentElement;
  function applyChoices() {
    root.classList.remove('ws-desktop', 'ws-vscode', 'ws-terminal', 'ws-unsure');
    if (state.ws) root.classList.add('ws-' + state.ws);
    $$('[data-set-route]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-route') === state.ws)); });
    $$('[data-set-goal]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-goal') === state.goal)); });
    var rec = GOALS[state.goal];
    $$('#planList li').forEach(function (li) {
      var n = +li.getAttribute('data-st');
      li.classList.toggle('recommended', !!rec && state.goal !== 'all' && rec.indexOf(n) > -1);
      li.classList.toggle('dim', !!rec && rec.indexOf(n) === -1);
    });
    renderFoot();
    renderCard();
  }
  document.addEventListener('click', function (e) {
    var r = e.target.closest('[data-set-route]');
    if (r) { state.ws = r.getAttribute('data-set-route'); save(); applyChoices(); return; }
    var g = e.target.closest('[data-set-goal]');
    if (g) { state.goal = g.getAttribute('data-set-goal'); save(); applyChoices(); }
  });
  var nameEl = $('#pName');
  if (nameEl) {
    nameEl.value = state.name;
    nameEl.addEventListener('input', function () { state.name = nameEl.value; save(); renderFoot(); renderCard(); });
  }
  function renderFoot() {
    var f = $('#lbFoot'); if (!f) return;
    var n = (state.name || 'RECRUIT').toUpperCase().replace(/[^A-Z0-9א-ת]/g, '<').slice(0, 14);
    var ws = { desktop: 'APP', vscode: 'VSC', terminal: 'CLI' }[state.ws] || 'TBD';
    var s = 'AGT<' + ws + '<<' + n + '<<BADGES<' + Object.keys(state.badges).length + '<OF<' + TOTAL;
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
  function download(text, filename, btn, label) {
    var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    flash(btn, label, 'ירד ✓');
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

  /* ---------- סימולטור הלולאה (לפי המדריך הרשמי של Anthropic, טבעות 3 ו-4) ---------- */
  var LOOPS = {
    ok: [
      { c: 'user', who: 'אתם', t: '״תבדוק מה יש לי ביום שני, 30 במרץ 2026, ותקבע באותו יום פגישת תכנון של שעה שלא מתנגשת בכלום.״' },
      { c: 'claude', who: 'Claude מחליט להשתמש בכלי', tag: 'stop_reason: tool_use', tc: 'stop', t: 'לפני שקובעים, צריך לראות את היומן. Claude לא עונה לכם עדיין. הוא מבקש להפעיל כלי:', code: 'list_calendar_events\n{"date": "2026-03-30"}' },
      { c: 'tools', who: 'הכלי רץ ומחזיר תוצאה', tag: 'tool_result', t: 'הקוד (או Claude Code) מפעיל את הכלי באמת, ומחזיר ל-Claude את מה שמצא:', code: '{"events": [{"title": "Existing meeting", "start": "14:00", "end": "15:00"}]}' },
      { c: 'claude', who: 'Claude מחליט על הצעד הבא', tag: 'stop_reason: tool_use', tc: 'stop', t: 'יש פגישה ב-14:00. אז 10:00 עד 11:00 פנוי. עכשיו הוא מבקש את הכלי השני:', code: 'create_calendar_event\n{"title": "Planning session", "start": "2026-03-30T10:00", "end": "2026-03-30T11:00"}' },
      { c: 'tools', who: 'הכלי רץ ומחזיר תוצאה', tag: 'tool_result', t: 'האירוע נוצר:', code: '{"event_id": "evt_123", "status": "created"}' },
      { c: 'done', who: 'Claude עונה לכם, והלולאה נעצרת', tag: 'stop_reason: end_turn', tc: 'end', t: '״בדקתי את היומן שלך ליום שני, 30 במרץ, ומצאתי פגישה קיימת מ-14:00 עד 15:00. קבעתי את פגישת התכנון ל-10:00 עד 11:00 כדי למנוע התנגשות.״' }
    ],
    err: [
      { c: 'user', who: 'אתם', t: '״קבע ישיבת צוות של שעה ביום שני, 30 במרץ 2026 ב-10:00, עם כולם.״ (ברשימה 15 אנשים)' },
      { c: 'claude', who: 'Claude מחליט להשתמש בכלי', tag: 'stop_reason: tool_use', tc: 'stop', t: 'הוא מנסה ליצור את האירוע עם כל 15 המשתתפים:', code: 'create_calendar_event\n{"title": "All-hands", "attendees": [15 כתובות]}' },
      { c: 'tools', who: 'הכלי נכשל', tag: 'is_error: true', tc: 'err', t: 'היומן לא מקבל יותר מ-10 משתתפים. במקום לקרוס, מחזירים ל-Claude את השגיאה, מסומנת כשגיאה:', code: 'Too many attendees (max 10)' },
      { c: 'done', who: 'Claude קורא את השגיאה ומחליט בעצמו', tag: 'stop_reason: end_turn', tc: 'end', t: '״ניסיתי לקבוע, אבל היומן מאפשר רק 10 משתתפים לאירוע. אפשר לפצל לשתי ישיבות, או שתגידו לי אילו 10 אנשים לתעדף.״' }
    ]
  };
  var lsFeed = $('#lsFeed');
  if (lsFeed) {
    var lsMode = 'ok', lsI = 0;
    var lsNext = $('#lsNext'), lsReset = $('#lsReset'), lsTurns = $('#lsTurns'), lsNote = $('#lsNote');
    var renderLoop = function () {
      var steps = LOOPS[lsMode];
      if (!lsI) lsFeed.innerHTML = '<li class="ls-empty">לחצו ״הצעד הבא״ כדי לשלוח את הבקשה ולראות את הלולאה רצה.</li>';
      else {
        lsFeed.innerHTML = steps.slice(0, lsI).map(function (s) {
          return '<li class="' + s.c + '"><div class="who">' + esc(s.who) + (s.tag ? ' <i class="' + (s.tc || '') + '">' + esc(s.tag) + '</i>' : '') + '</div>' +
            '<p>' + esc(s.t) + '</p>' + (s.code ? '<code class="blk" dir="ltr">' + esc(s.code) + '</code>' : '') + '</li>';
        }).join('');
      }
      var calls = steps.slice(0, lsI).filter(function (s) { return s.c === 'claude'; }).length;
      lsTurns.textContent = 'סיבובים בלולאה: ' + calls;
      var finished = lsI >= steps.length;
      lsNext.disabled = finished;
      lsNote.textContent = finished
        ? (lsMode === 'ok' ? 'זהו. שני כלים, שני סיבובים, ואף אחד לא תכנת מראש את הסדר. Claude החליט לבד, לפי מה שחזר מהכלים.' : 'השגיאה לא הפילה את הסוכן. הוא קרא אותה, הבין את המגבלה, ושאל אתכם במקום לנחש.')
        : 'הלולאה ממשיכה כל עוד stop_reason הוא tool_use.';
    };
    lsNext.addEventListener('click', function () { lsI++; renderLoop(); });
    lsReset.addEventListener('click', function () { lsI = 0; renderLoop(); lsNext.focus(); });
    $$('[data-ls]').forEach(function (b) {
      b.addEventListener('click', function () {
        lsMode = b.getAttribute('data-ls'); lsI = 0;
        $$('[data-ls]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderLoop();
      });
    });
    renderLoop();
  }

  /* ---------- איזה סוכן אתם צריכים ---------- */
  var PATTERNS = {
    1: ['שרשרת', 'st4', 'המשימה מתפרקת לשלבים קבועים'],
    2: ['ניתוב', 'st5', 'יש סוגים שונים של בקשות'],
    3: ['מקביליות', 'st6', 'יש חלקים עצמאיים או צורך בכמה דעות'],
    4: ['מנצח ועובדים', 'st7', 'אי אפשר לדעת מראש מה יידרש'],
    5: ['כותב ומבקר', 'st8', 'יש קריטריונים ברורים, ומשוב משפר']
  };
  var pick = {};
  var pickOut = $('#pickOut');
  $$('#pickTool .yn').forEach(function (g) {
    $$('button', g).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', g).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        pick[g.getAttribute('data-q')] = +b.getAttribute('data-v');
        var yes = Object.keys(pick).filter(function (k) { return pick[k]; });
        var answered = Object.keys(pick).length;
        if (yes.length) {
          pickOut.className = 'verdict info';
          pickOut.innerHTML = (yes.length > 1 ? 'אתם צריכים שילוב. התבניות האלה מתחברות זו לזו: ' : 'התבנית שלכם: ') +
            yes.map(function (k) { var p = PATTERNS[k]; return '<a href="#' + p[1] + '">' + esc(p[0]) + '</a> (' + esc(p[2]) + ')'; }).join(', ') +
            '. זכרו את הכלל של Anthropic: מוסיפים מורכבות רק כשהיא משפרת את התוצאה בפועל.';
        } else if (answered === 5) {
          pickOut.className = 'verdict ok';
          pickOut.textContent = 'אולי אתם בכלל לא צריכים סוכן. לפי Anthropic, להרבה משימות מספיקה פנייה אחת טובה עם הקשר ודוגמאות. התחילו מפרומפט טוב ו-CLAUDE.md, ובנו סוכן רק כשזה לא מספיק.';
        } else {
          pickOut.className = 'verdict';
        }
      });
    });
  });

  /* ---------- מחולל CLAUDE.md ---------- */
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  var mdOut = $('#mdOut');
  function buildMd() {
    var rules = $$('#mdRules input:checked').map(function (c) { return '- ' + c.value; });
    if (val('mdExtra')) val('mdExtra').split(/\n+/).forEach(function (x) { if (x.trim()) rules.push('- ' + x.trim()); });
    return [
      '# הקשר הפרויקט',
      val('mdProject') || '[בשביל מה מרחב העבודה הזה]',
      '',
      '# עליי',
      val('mdMe') || '[מי אתם, מה אתם עושים]',
      'הקהל שלי: ' + (val('mdAudience') || '[למי התוצרים מיועדים]') + '.',
      'הטון שאני אוהב: ' + val('mdTone') + '.',
      '',
      '# כללים',
      rules.length ? rules.join('\n') : '- [הוסיפו לפחות כלל אחד]',
      '',
      '# מבנה התיקיות',
      '- workflows/ : קובצי תהליך (מתכונים) בעברית פשוטה',
      '- input/ : חומרים שאני נותן לעבד',
      '- output/ : התוצרים הגמורים',
      '- resources/ : חומרי עזר ותבניות'
    ].join('\n');
  }
  if (mdOut) {
    var renderMd = function () { mdOut.textContent = buildMd(); };
    $$('#mdTool input, #mdTool textarea, #mdTool select').forEach(function (el) { el.addEventListener('input', renderMd); el.addEventListener('change', renderMd); });
    renderMd();
    $('#mdCopy').addEventListener('click', function () { var b = this; copyText(mdOut.textContent).then(function () { flash(b, 'העתקה'); }); });
    $('#mdDown').addEventListener('click', function () { download(mdOut.textContent, 'CLAUDE.md', this, 'הורדת CLAUDE.md'); });
  }

  /* ---------- מחולל סוכן משנה ---------- */
  var agOut = $('#agOut');
  function slug(s) { return (s || 'my-agent').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'my-agent'; }
  function buildAgent() {
    var tools = $$('#agTools input:checked').map(function (c) { return c.value; });
    var lines = ['---', 'name: ' + slug(val('agName')), 'description: ' + (val('agDesc').replace(/\s+/g, ' ') || '[מתי להפעיל את הסוכן הזה]')];
    if (tools.length) lines.push('tools: ' + tools.join(', '));
    if (val('agModel') && val('agModel') !== 'inherit') lines.push('model: ' + val('agModel'));
    if (val('agMcp')) lines.push('mcpServers:', '  - ' + slug(val('agMcp')));
    lines.push('---', '', val('agPrompt') || '[ההוראות לסוכן: מי הוא, מה הוא עושה, ומה הוא מחזיר]');
    return lines.join('\n');
  }
  if (agOut) {
    var renderAgent = function () {
      agOut.textContent = buildAgent();
      var p = $('#agPath'); if (p) p.textContent = '.claude/agents/' + slug(val('agName')) + '.md';
    };
    $$('#agTool input, #agTool textarea, #agTool select').forEach(function (el) { el.addEventListener('input', renderAgent); el.addEventListener('change', renderAgent); });
    renderAgent();
    $('#agCopy').addEventListener('click', function () { var b = this; copyText(agOut.textContent).then(function () { flash(b, 'העתקה'); }); });
    $('#agDown').addEventListener('click', function () { download(agOut.textContent, slug(val('agName')) + '.md', this, 'הורדת הקובץ'); });
  }

  /* ---------- בונה פקודת חיבור ---------- */
  var SERVICES = {
    notion: ['notion', 'https://mcp.notion.com/mcp', 'http'],
    sentry: ['sentry', 'https://mcp.sentry.dev/mcp', 'http'],
    stripe: ['stripe', 'https://mcp.stripe.com', 'http'],
    hubspot: ['hubspot', 'https://mcp.hubspot.com/anthropic', 'http'],
    asana: ['asana', 'https://mcp.asana.com/sse', 'sse'],
    custom: ['', '', 'http']
  };
  var mcOut = $('#mcOut');
  function buildMcp() {
    var name = slug(val('mcName')) || 'my-server';
    var url = val('mcUrl') || 'https://...';
    var t = $('#mcSvc') && SERVICES[val('mcSvc')] ? SERVICES[val('mcSvc')][2] : 'http';
    var scope = val('mcScope') || 'local';
    return 'claude mcp add --transport ' + t + ' --scope ' + scope + ' ' + name + ' ' + url;
  }
  if (mcOut) {
    var mcVerdict = $('#mcVerdict');
    var renderMcp = function () {
      mcOut.textContent = buildMcp();
      var url = val('mcUrl'), scope = val('mcScope');
      var msgs = { local: 'local: רק בתיקייה הזאת, ורק אצלכם. ברירת המחדל.', project: 'project: נשמר בקובץ .mcp.json בתיקייה, ומשותף עם מי שמקבל את התיקייה. לא שמים שם סיסמאות.', user: 'user: זמין לכם בכל הפרויקטים.' };
      if (url && !/^https:\/\//i.test(url)) { mcVerdict.className = 'verdict bad'; mcVerdict.textContent = 'כתובת של שרת מרוחק מתחילה ב-https://. בדקו שהעתקתם את הכתובת המלאה מהוראות השירות.'; }
      else { mcVerdict.className = 'verdict info'; mcVerdict.textContent = msgs[scope] + ' אחרי ההוספה: נכנסים ל-Claude Code, מקלידים /mcp, ומתחברים בדפדפן.'; }
    };
    $('#mcSvc').addEventListener('change', function () {
      var s = SERVICES[this.value];
      if (this.value !== 'custom') { $('#mcName').value = s[0]; $('#mcUrl').value = s[1]; }
      else { $('#mcName').value = ''; $('#mcUrl').value = ''; $('#mcName').focus(); }
      renderMcp();
    });
    ['mcName', 'mcUrl', 'mcScope'].forEach(function (id) { var el = document.getElementById(id); el.addEventListener('input', renderMcp); el.addEventListener('change', renderMcp); });
    renderMcp();
    $('#mcCopy').addEventListener('click', function () { var b = this; copyText(mcOut.textContent).then(function () { flash(b, 'העתקת הפקודה'); }); });
  }

  /* ---------- סמלי סוכן ---------- */
  function today() {
    var d = new Date(), p = function (x) { return (x < 10 ? '0' : '') + x; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
  }
  function badgeSVG(n, date) {
    var c = COLORS[n] || '#0f766e';
    var star = '';
    for (var k = 0; k < 10; k++) {
      var r = k % 2 ? 7 : 16, a = Math.PI / 5 * k - Math.PI / 2;
      star += (k ? 'L' : 'M') + (60 + r * Math.cos(a)).toFixed(1) + ' ' + (57 + r * Math.sin(a)).toFixed(1);
    }
    return '<svg viewBox="0 0 120 120" role="img" aria-label="סמל המשימה ה-' + n + '">' +
      '<g transform="rotate(-6 60 60)">' +
      '<path d="M60 6 L104 22 V58 C104 84 86 102 60 114 C34 102 16 84 16 58 V22 Z" fill="#fffdf6" stroke="' + c + '" stroke-width="3"/>' +
      '<path d="M60 14 L97 27 V58 C97 80 82 95 60 105 C38 95 23 80 23 58 V27 Z" fill="none" stroke="' + c + '" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<path d="' + star + 'Z" fill="' + c + '"/>' +
      '<text x="60" y="35" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.5" fill="' + c + '">MISSION</text>' +
      '<text x="60" y="82" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="' + c + '">' + (n < 10 ? '0' : '') + n + '</text>' +
      '<text x="60" y="95" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6.5" fill="' + c + '">' + esc(date || '') + '</text>' +
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
      li.classList.add('done'); $('.status', li).textContent = 'בוצע';
      if (animate) { li.classList.remove('flip'); void li.offsetWidth; li.classList.add('flip'); }
    }
    var d = $('.dock a[data-d="' + n + '"]'); if (d) d.classList.add('got');
    updateCount();
  }
  function updateCount() {
    var k = Object.keys(state.badges).length;
    var c = $('#dockCount'); if (c) c.textContent = k + ' מתוך ' + TOTAL + ' סמלים';
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
          if (!state.badges[n]) { state.badges[n] = today(); save(); paintBadge(n, true); renderFoot(); renderCard(); }
        } else {
          fb.className = 'fb no'; b.classList.add('wrong');
        }
      });
    });
  });

  /* ---------- תעודת סוכן ---------- */
  function sealSVG(done) {
    var c = done ? '#0f766e' : '#b9a77d';
    var label = done ? 'FIELD AGENT' : 'IN TRAINING';
    return '<circle cx="75" cy="75" r="72" fill="none" stroke="' + c + '" stroke-width="3"/>' +
      '<circle cx="75" cy="75" r="64" fill="none" stroke="' + c + '" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<circle cx="75" cy="75" r="48" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
      '<text x="75" y="22" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="2" fill="' + c + '">CLAUDE CODE</text>' +
      '<text x="75" y="136" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="1.5" font-weight="700" fill="' + c + '">' + label + '</text>' +
      '<path d="M75 46 L96 54 V72 C96 86 87 95 75 101 C63 95 54 86 54 72 V54 Z" fill="none" stroke="' + c + '" stroke-width="3"/>' +
      '<text x="75" y="81" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="' + c + '">' + Object.keys(state.badges).length + '/' + TOTAL + '</text>';
  }
  function renderCard() {
    var k = Object.keys(state.badges).length, done = k === TOTAL;
    var set = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };
    set('licTitle', done ? 'סוכן שטח מוסמך' : 'סוכן בהכשרה');
    set('licName', state.name.trim() || 'עוד לא נבחר');
    set('licType', WS_NAMES[state.ws] || 'לא נבחרה');
    set('licGoal', GOAL_NAMES[state.goal] || 'לא נבחרה');
    set('licCount', k + ' מתוך ' + TOTAL);
    var dates = Object.keys(state.badges).map(function (x) { return state.badges[x]; });
    set('licDate', done ? dates[dates.length - 1] : (k ? 'בדרך' : '-'));
    set('licPhoto', (state.name.trim() || '?').charAt(0));
    set('licIntro', done ? 'אספתם את כל 11 הסמלים. מזל טוב, אתם סוכני שטח מוסמכים: יודעים לבנות סוכן, לחבר אותו לעולם ולוואטסאפ, ולבנות אפליקציה.' : 'כל סמל שאספתם מופיע כאן. אספו את כולם, והתעודה מוכנה.');
    var row = $('#wingRow');
    if (row) {
      var h = '';
      for (var i = 1; i <= TOTAL; i++) h += '<span class="' + (state.badges[i] ? 'on' : '') + '">' + i + '</span>';
      row.innerHTML = h;
    }
    var seal = $('#licSeal'); if (seal) seal.innerHTML = sealSVG(done);
    var share = $('#licShare');
    if (share) {
      var msg = 'היי עזי, ' + (done ? 'סיימתי את בית הספר לסוכנים של Claude Code! ' : 'אני באמצע בית הספר לסוכנים של Claude Code (' + k + '/' + TOTAL + '). ') + 'הסוכן שבניתי: ';
      share.href = 'https://wa.me/972544266802?text=' + encodeURIComponent(msg);
    }
  }
  var reset = $('#resetBtn');
  if (reset) reset.addEventListener('click', function () {
    if (!window.confirm('לאפס את תיק הסוכן? כל הסמלים והבחירות יימחקו מהדפדפן.')) return;
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

  /* ---------- חדר המצב: תקלות נפוצות ---------- */
  var ERRORS = [
    { k: 'לא קורא claude.md מתעלם כללים לא זוכר', t: 'Claude מתעלם מה-CLAUDE.md שלי', a: 'ודאו שהקובץ נקרא בדיוק CLAUDE.md (באותיות גדולות), שהוא יושב בתיקייה הראשית של הפרויקט, ושפתחתם את Claude Code מתוך התיקייה הזאת. אחרי שינוי, פתחו שיחה חדשה.', l: 'st2' },
    { k: 'plan mode מצב תכנון shift tab לא מוצא', t: 'לא מוצא את מצב התכנון (Plan mode)', a: 'ב-VS Code ובטרמינל: Shift+Tab פעמיים (פעם אחת עובר למצב עריכה אוטומטית, פעם שנייה לתכנון). אפשר גם להוסיף ל-CLAUDE.md את הכלל ״הצג תוכנית כתובה וחכה לאישור לפני כל משימה מרובת שלבים״.', l: 'st2' },
    { k: 'גנרי כללי חלש לא טוב תוצאה', t: 'התוצאה גנרית ושטוחה', a: 'כמעט תמיד זו מטרה עמומה. במקום ״תחקור על AI״ כתבו נושא, קהל, טווח זמן, עומק ופורמט. ובדקו שבתהליך כתוב לשאול שאלות הבהרה לפני שמתחילים.', l: 'st8' },
    { k: 'לא שואל שאלות מתחיל לבד מניח', t: 'הסוכן לא שואל שאלות, פשוט מתחיל', a: 'הוסיפו לקובץ התהליך שלב ראשון מפורש: ״לפני שמתחילים, שאל אותי לפחות שלוש שאלות הבהרה על היקף, קהל ועומק, וחכה לתשובות.״', l: 'st6' },
    { k: 'workflow תהליך לא מוצא לא מכיר קובץ', t: 'Claude לא מכיר את קובץ התהליך שלי', a: 'שאלו אותו ״אילו תהליכים יש לך?״. אם הוא לא מוצא, ודאו שהקובץ בתיקיית workflows ושהוא מוזכר ב-CLAUDE.md, או פשוט כתבו: ״הרץ את התהליך שב-workflows/research-report.md על הנושא...״.', l: 'st6' },
    { k: 'סוכן משנה subagent לא מופיע agents לא מוצא', t: 'סוכן המשנה שיצרתי לא נמצא', a: 'ודאו שהקובץ ב-.claude/agents/ ושיש בו name ו-description. אם התיקייה agents לא הייתה קיימת כשפתחתם את השיחה, צריך להפעיל מחדש את Claude Code.', l: 'st7' },
    { k: 'יקר טוקנים עולה הרבה מגבלה נגמר', t: 'הסוכן צורך המון שימוש', a: 'כל סוכן משנה צורך טוקנים משלו. הריצו פחות עובדים במקביל, תנו לסוכני משנה פשוטים model: haiku, והגבילו סבבים (בכותב-מבקר: עד 3).', l: 'st5' },
    { k: 'לולאה אינסופית לא נעצר ממשיך עוד ועוד', t: 'הסוכן לא מפסיק לשפר', a: 'חסר תנאי עצירה. כתבו בתהליך: ״עד 3 סבבים, או עד שהמבקר נותן ציון 8 ומעלה בכל קריטריון״. בסוכן משנה אפשר להוסיף maxTurns.', l: 'st8' },
    { k: 'mcp connector מחבר לא מתחבר needs authentication auth', t: 'מחבר (MCP) לא מתחבר או מבקש התחברות', a: 'בתוך Claude Code הקלידו /mcp, בחרו את השרת והתחברו בדפדפן. אם הדפדפן לא נפתח, העתיקו את הקישור שמופיע ופתחו ידנית.', l: 'st9' },
    { k: 'connector claude.ai לא מופיע ב claude code מחברים', t: 'הוספתי מחבר ב-claude.ai והוא לא מופיע ב-Claude Code', a: 'מחברים מ-claude.ai מגיעים רק אם התחברתם ל-Claude Code עם חשבון claude.ai. בדקו ב-/mcp. בתוכניות Team ו-Enterprise רק מנהל יכול להוסיף מחברים.', l: 'st9' },
    { k: 'already exists כבר קיים mcp add', t: 'MCP server ... already exists', a: 'כבר הוספתם שרת בשם הזה, באותו היקף. אין צורך להוסיף שוב. לבדיקה: claude mcp list. למחיקה: claude mcp remove ואז השם.', l: 'st9' },
    { k: 'האפליקציה לא עולה לא רצה שגיאה won\'t start', t: 'האפליקציה לא עולה', a: 'כתבו ל-Claude: ״האפליקציה לא רצה. תראה לי את השגיאה ובוא נתקן אותה.״ אל תנסו לפענח לבד.', l: 'st11' },
    { k: 'נתונים נמחקים רענון refresh נעלם', t: 'הנתונים נעלמים כשמרעננים את הדף', a: 'האפליקציה עוד לא שומרת. בקשו: ״שמור הכול ב-localStorage כך שאחרי סגירת הדפדפן ההרגלים וההתקדמות יישארו.״ צריכים סנכרון בין מכשירים או כמה משתמשים? זה כבר מסד נתונים, כמו Supabase או Firebase.', l: 'st11' },
    { k: 'vercel פריסה deploy להעלות לאינטרנט טלפון', t: 'איך מעלים את האפליקציה לאינטרנט', a: 'קודם בונים גרסת ייצור ובודקים מקומית, ואז מבקשים מ-Claude להדריך אתכם בפריסה ל-Vercel: אילו חשבונות צריך, אילו פקודות, ואיך מקבלים כתובת ציבורית. שומרים ב-Git, מעלים ל-GitHub, ומחברים שירות כמו Vercel, Netlify או GitHub Pages.', l: 'st11' },
    { k: 'מפתח api key סוד חשוף github env', t: 'איפה שמים מפתחות API', a: 'בקובץ .env בתיקיית הפרויקט, שלא עולה ל-GitHub, ובהגדרות של שירות האחסון. אף פעם לא בקוד שרץ בדפדפן. בקשו מ-Claude לבדוק את זה לפני כל פרסום.', l: 'st11' },
    { k: 'וואטסאפ whatsapp בוט bot לא עונה webhook', t: 'בוט הוואטסאפ לא עונה', a: 'בוט שעונה צריך שרת שזמין תמיד, וכתובת webhook מוגדרת אצל ספק הוואטסאפ. כתבו ל-Claude: ״הבוט לא עונה להודעות. בדוק איתי שלב אחר שלב את ה-webhook, את המפתחות ב-.env ואת היומן של השרת.״', l: 'st10' },
    { k: 'וואטסאפ whatsapp חסימה נחסם ban מספר', t: 'חוששים שהמספר ייחסם בוואטסאפ', a: 'השתמשו במספר נפרד ולא באישי, התחילו מהמספר שלכם בלבד, ובלי הודעות המוניות. לבוט שעונה ללקוחות, עדיף ה-API הרשמי של Meta (WhatsApp Cloud API) על פני שירות מתווך לא רשמי (Gateway).', l: 'st10' },
    { k: 'הלך לכיוון לא נכון לבטל undo rollback חזרה', t: 'הסוכן הלך לכיוון לא נכון ושינה קבצים', a: 'ב-VS Code: מרחפים מעל נקודה קודמת בשיחה ובוחרים לחזור אליה. זה מבטל גם את שינויי הקבצים. ובפעם הבאה: מצב תכנון לפני ביצוע.', l: 'st2' },
    { k: 'managed agents ענן api בטא', t: 'איך מריצים סוכן בענן, בלי המחשב שלי', a: 'זה Claude Managed Agents: סביבה מנוהלת שמריצה את הסוכן בענן, כולל ריצות מתוזמנות. נכון ל-4.11.2026 הוא בבטא ודורש מפתח API, כלומר צעד למפתחים.', l: 'st9' }
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
      return '<li><b dir="auto">' + esc(x.e.t) + '</b><p>' + esc(x.e.a) + ' <a href="#' + x.e.l + '">למשימה ←</a></p></li>';
    }).join('');
  }
  if (errIn) { errIn.addEventListener('input', renderErrors); renderErrors(); }

  applyChoices();
  updateCount();
})();

/* הדרכון ל-Claude Code: התאמה אישית, חותמות, סימולטור ומפענח שגיאות. בלי ספריות ובלי שרת. */
(function () {
  'use strict';

  var KEY = 'cc-passport-v1';
  var STATIONS = {
    1: { name: 'ביקורת דרכונים', ink: '#b5125f', r: -9, shape: 'circle' },
    2: { name: 'הפיל שבחדר', ink: '#b4480c', r: 7, shape: 'rect' },
    3: { name: 'התקנה', ink: '#0a6a72', r: -5, shape: 'octagon' },
    4: { name: 'שיחה ראשונה', ink: '#5b2bb0', r: 10, shape: 'circle' },
    5: { name: 'הרשאות', ink: '#b3202c', r: -11, shape: 'rect' },
    6: { name: 'יומן מסע', ink: '#1f6f2a', r: 6, shape: 'octagon' },
    7: { name: 'ספר נהלים', ink: '#174ea6', r: -7, shape: 'circle' },
    8: { name: 'מתאם לחו״ל', ink: '#8a5a00', r: 8, shape: 'rect' },
    9: { name: 'משימות', ink: '#a01590', r: -6, shape: 'octagon' }
  };
  var TOTAL = 9;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- מצב ---------- */
  function detectOS() {
    var ua = navigator.userAgent || '';
    if (/Mac|iPhone|iPad/.test(ua)) return 'mac';
    if (/Linux|X11/.test(ua) && !/Android/.test(ua)) return 'linux';
    return 'win';
  }
  var state = { name: '', os: detectOS(), route: 'app', stamps: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      if (typeof saved.name === 'string') state.name = saved.name;
      if (saved.os === 'win' || saved.os === 'mac' || saved.os === 'linux') state.os = saved.os;
      if (saved.route === 'app' || saved.route === 'terminal' || saved.route === 'cloud') state.route = saved.route;
      if (saved.stamps && typeof saved.stamps === 'object') state.stamps = saved.stamps;
    }
  } catch (e) { /* מצב פרטי או אחסון חסום: ממשיכים בלי לשמור */ }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ראו למעלה */ }
  }

  /* ---------- התאמה למחשב ולמסלול ---------- */
  function applyChoices() {
    $$('[data-os]').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-os').split(' ').indexOf(state.os) > -1);
    });
    $$('[data-route]').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-route').split(' ').indexOf(state.route) > -1);
    });
    $$('[data-set-os]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-os') === state.os));
    });
    $$('[data-set-route]').forEach(function (b) {
      if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(b.getAttribute('data-set-route') === state.route));
    });
    renderMRZ();
    setSimPrompt();
  }
  function renderMRZ() {
    var el = $('#mrz');
    if (!el) return;
    var latin = state.name.toUpperCase().replace(/[^A-Z ]/g, '').trim().replace(/\s+/g, '<');
    var pad = function (s, n) { s = s.slice(0, n); while (s.length < n) s += '<'; return s; };
    var a = pad('CC<CLAUDE<CODE<<' + (latin || 'TRAVELER'), 44);
    var osName = { win: 'WINDOWS', mac: 'MACOS', linux: 'LINUX' }[state.os];
    var rt = { app: 'DESKTOP', terminal: 'TERMINAL', cloud: 'CLOUD' }[state.route];
    var b = pad('EZY<LEVY<GUIDE<<' + osName + '<' + rt, 44);
    el.textContent = '';
    el.appendChild(document.createTextNode(a));
    el.appendChild(document.createElement('br'));
    el.appendChild(document.createTextNode(b));
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-set-os],[data-set-route]') : null;
    if (!t) return;
    if (t.hasAttribute('data-set-os')) state.os = t.getAttribute('data-set-os');
    else state.route = t.getAttribute('data-set-route');
    save(); applyChoices();
  });
  var nameEl = $('#pName');
  if (nameEl) {
    nameEl.value = state.name;
    nameEl.addEventListener('input', function () { state.name = nameEl.value; save(); renderMRZ(); renderVisa(); });
  }

  /* ---------- כפתורי העתקה ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (ok, no) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? ok() : no(); } catch (err) { no(err); }
      document.body.removeChild(ta);
    });
  }
  $$('.cmd').forEach(function (block) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'copy'; btn.textContent = 'העתקה';
    btn.addEventListener('click', function () {
      copyText($('code', block).textContent).then(function () {
        btn.textContent = 'הועתק ✓'; btn.classList.add('done');
      }, function () { btn.textContent = 'סמנו והעתיקו'; });
      setTimeout(function () { btn.textContent = 'העתקה'; btn.classList.remove('done'); }, 1800);
    });
    block.appendChild(btn);
  });

  /* ---------- לשוניות קהל ---------- */
  var tabs = $$('[role=tab]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(tabs[(i + 1) % tabs.length], true); }
      if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true); }
    });
  });

  /* ---------- ציור חותמת ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function stampSVG(n, date, uid) {
    var s = STATIONS[n], c = s.ink, inner = '';
    var num = '<text x="70" y="86" text-anchor="middle" font-family="Karantina,Assistant,sans-serif" font-weight="700" font-size="52" fill="' + c + '">' + n + '</text>';
    var dateT = '<text x="70" y="100" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="9" font-weight="700" fill="' + c + '" direction="ltr">' + esc(date) + '</text>';
    var head = '<text x="70" y="46" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8" letter-spacing="1.5" fill="' + c + '" direction="ltr">CLAUDE CODE</text>';
    if (s.shape === 'circle') {
      inner = '<circle cx="70" cy="70" r="64" fill="none" stroke="' + c + '" stroke-width="4"/><circle cx="70" cy="70" r="46" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
        '<defs><path id="' + uid + '" d="M 21 70 A 49 49 0 1 1 119 70"/></defs>' +
        '<text font-family="Assistant,sans-serif" font-weight="800" font-size="13" fill="' + c + '" text-anchor="middle"><textPath href="#' + uid + '" startOffset="50%">' + esc(s.name) + '</textPath></text>' +
        num + '<text x="70" y="106" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8.5" font-weight="700" fill="' + c + '" direction="ltr">' + esc(date) + '</text>';
    } else if (s.shape === 'rect') {
      inner = '<rect x="8" y="24" width="124" height="92" rx="7" fill="none" stroke="' + c + '" stroke-width="4"/><rect x="15" y="31" width="110" height="78" rx="3" fill="none" stroke="' + c + '" stroke-width="1.4"/>' +
        '<text x="70" y="52" text-anchor="middle" font-family="Assistant,sans-serif" font-weight="800" font-size="16" fill="' + c + '">' + esc(s.name) + '</text>' +
        '<text x="70" y="88" text-anchor="middle" font-family="Karantina,Assistant,sans-serif" font-weight="700" font-size="38" fill="' + c + '">' + n + '</text>' +
        '<text x="70" y="103" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8.5" font-weight="700" fill="' + c + '" direction="ltr">' + esc(date) + '</text>';
    } else {
      inner = '<polygon points="46,6 94,6 134,46 134,94 94,134 46,134 6,94 6,46" fill="none" stroke="' + c + '" stroke-width="4"/><polygon points="49,14 91,14 126,49 126,91 91,126 49,126 14,91 14,49" fill="none" stroke="' + c + '" stroke-width="1.4"/>' +
        '<text x="70" y="42" text-anchor="middle" font-family="Assistant,sans-serif" font-weight="800" font-size="15" fill="' + c + '">' + esc(s.name) + '</text>' +
        num + dateT;
    }
    return '<svg viewBox="0 0 140 140" role="img" aria-label="חותמת תחנה ' + n + ': ' + esc(s.name) + '" style="--r:' + s.r + 'deg"><g filter="url(#rough)">' + inner + '</g></svg>';
  }
  function today() {
    var d = new Date();
    var p = function (x) { return (x < 10 ? '0' : '') + x; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2);
  }

  /* ---------- חידות וחותמות ---------- */
  function stampCount() { return Object.keys(state.stamps).length; }
  function paintStamp(n, animate) {
    var slot = $('[data-slot="' + n + '"]');
    if (slot) {
      slot.innerHTML = stampSVG(n, state.stamps[n], 'p' + n);
      slot.style.setProperty('--r', STATIONS[n].r + 'deg');
      slot.classList.add('stamped');
      if (animate) { slot.classList.remove('thud'); void slot.offsetWidth; slot.classList.add('thud'); }
    }
    var li = $('#boardList [data-st="' + n + '"]');
    if (li) {
      li.classList.add('done');
      $('.status', li).textContent = 'נחתם ✓';
      if (animate) { li.classList.remove('flip'); void li.offsetWidth; li.classList.add('flip'); }
    }
    var d = $('#dockList [data-d="' + n + '"]');
    if (d) {
      d.classList.add('got');
      d.style.setProperty('--d', STATIONS[n].ink);
      d.setAttribute('aria-label', 'תחנה ' + n + ', נחתמה');
    }
  }
  function solveQuiz(q) {
    $$('.opts button', q).forEach(function (b) {
      b.disabled = true;
      if (b.hasAttribute('data-ok')) b.classList.add('right');
    });
    var fb = $('.fb', q), right = $('[data-ok]', q);
    if (fb && right && !fb.textContent) fb.textContent = right.getAttribute('data-why');
  }
  $$('.quiz').forEach(function (q) {
    var n = q.getAttribute('data-st');
    var fb = $('.fb', q);
    $$('.opts button', q).forEach(function (b) {
      b.addEventListener('click', function () {
        fb.textContent = b.getAttribute('data-why');
        fb.style.color = b.hasAttribute('data-ok') ? 'var(--ok)' : 'var(--bad)';
        if (b.hasAttribute('data-ok')) {
          state.stamps[n] = state.stamps[n] || today();
          save(); solveQuiz(q); paintStamp(n, true); renderVisa();
        } else {
          b.classList.add('wrong');
        }
      });
    });
    if (state.stamps[n]) { paintStamp(n, false); solveQuiz(q); }
  });

  function renderVisa() {
    var c = stampCount();
    var dock = $('#dockCount');
    if (dock) dock.textContent = c + ' מתוך ' + TOTAL + ' חותמות';
    var title = $('#visaTitle');
    if (title) title.textContent = state.name.trim() ? 'הדרכון של ' + state.name.trim() : 'הדרכון שלכם';
    var count = $('#visaCount');
    if (count) {
      count.textContent = c === 0 ? 'עדיין אין חותמות. התחנה הראשונה מחכה.' :
        c === TOTAL ? 'תשע מתוך תשע. המסע הושלם.' :
        c + ' מתוך ' + TOTAL + ' חותמות. ממשיכים?';
    }
    var sheet = $('#sheet');
    if (sheet) {
      sheet.innerHTML = '';
      for (var i = 1; i <= TOTAL; i++) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        if (state.stamps[i]) cell.innerHTML = stampSVG(i, state.stamps[i], 'v' + i);
        else { cell.textContent = i; cell.setAttribute('aria-label', 'תחנה ' + i + ', עדיין בלי חותמת'); }
        sheet.appendChild(cell);
      }
    }
    var card = $('#visaCard');
    if (card) card.classList.toggle('full', c === TOTAL);
    var share = $('#visaShare');
    if (share) share.href = 'https://wa.me/972544266802?text=' + encodeURIComponent('היי עזי, סיימתי את הדרכון ל-Claude Code! הנה מה שבניתי: ');
  }
  var reset = $('#resetBtn');
  if (reset) reset.addEventListener('click', function () {
    if (!window.confirm('למחוק את כל החותמות והפרטים מהדפדפן הזה?')) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* אין מה למחוק */ }
    location.reload();
  });

  /* ---------- מיקום נוכחי ברצועה ---------- */
  if ('IntersectionObserver' in window) {
    var dockLinks = $$('#dockList a');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) {
          dockLinks.forEach(function (a) {
            if (a.getAttribute('href') === '#' + en.target.id) { a.classList.remove('now'); a.removeAttribute('aria-current'); }
          });
          return;
        }
        dockLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('now', on);
          if (on) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('.spread').forEach(function (s) { io.observe(s); });
  }

  /* ---------- סימולטור טרמינל ---------- */
  var simOut = $('#simOut'), simIn = $('#simIn'), simForm = $('#simForm'), simP = $('#simPrompt');
  var inClaude = false;
  function shellPrompt() {
    return { win: 'PS C:\\Users\\you>', mac: 'you@mac ~ %', linux: 'you@pc:~$' }[state.os];
  }
  function setSimPrompt() { if (simP) simP.textContent = inClaude ? '>' : shellPrompt(); }
  function line(text, cls) {
    var s = document.createElement(cls === 'he' ? 'span' : 'div');
    if (cls) s.className = cls;
    if (cls === 'he') s.setAttribute('dir', 'rtl');
    s.textContent = text;
    simOut.appendChild(s);
    simOut.scrollTop = simOut.scrollHeight;
  }
  function he(t) { line(t.replace(/(\/[a-z]+)/g, '⁦$1⁩'), 'he'); }
  function runSim(raw) {
    var cmd = raw.trim();
    line((inClaude ? '> ' : shellPrompt() + ' ') + cmd, 'ps');
    if (!cmd) return;
    var low = cmd.toLowerCase();
    if (low === 'clear' || low === 'cls' || low === '/clear') { simOut.textContent = ''; return; }
    if (inClaude) {
      if (low === 'exit' || low === '/exit') { inClaude = false; he('יצאתם מ-Claude Code וחזרתם לטרמינל. שום דבר לא נמחק.'); setSimPrompt(); return; }
      if (low === '/help') { line('/init      create CLAUDE.md\n/clear     start a new conversation\n/rewind    go back to an earlier point\n/usage     plan usage\n/exit      leave Claude Code'); he('בקטע הזה מוצגת רק דוגמה. /help האמיתי מציג הרבה יותר.'); return; }
      if (low === '/init') { line('Scanning project...\nCreated CLAUDE.md'); he('כך נוצר יומן המסע. נדבר עליו בתחנה 6.'); return; }
      if (low.charAt(0) === '/') { he('בסימולטור יש רק חלק קטן מהפקודות. נסו /help או exit.'); return; }
      he('כאן Claude האמיתי היה מתחיל לעבוד על הבקשה שלכם. הסימולטור רק מדגים, אז כתבו exit כדי לצאת.');
      return;
    }
    if (low === 'claude --version' || low === 'claude -v') { line('2.1.211 (Claude Code)'); he('מספר גרסה כזה (המספר אצלכם יהיה אחר) אומר שההתקנה הצליחה.'); return; }
    if (low === 'claude doctor') { line('Install health: OK\nSettings: valid\nNo warnings'); he('דוגמה לבדיקת תקינות שלא משנה כלום. אצלכם התוצאה תהיה מפורטת יותר.'); return; }
    if (low === 'claude') { inClaude = true; line('Claude Code\nmodel · working directory shown here\n'); he('נכנסתם. עכשיו כותבים בקשה בעברית רגילה, או מנסים /help. בפעם הראשונה ייפתח גם דפדפן לכניסה לחשבון.'); setSimPrompt(); return; }
    if (low === 'exit') { he('אתם כבר בטרמינל. במחשב אמיתי הפקודה הזאת הייתה סוגרת את החלון.'); return; }
    if (low === 'ls' || low === 'dir') { line('Desktop   Documents   Downloads'); he('כך רואים מה יש בתיקייה הנוכחית.'); return; }
    if (low === 'pwd') { line(state.os === 'win' ? 'C:\\Users\\you' : '/Users/you'); he('כך רואים באיזו תיקייה אתם נמצאים.'); return; }
    if (/^cd(\s|$)/.test(low)) { he('cd זו הפקודה שעוברת לתיקייה אחרת. בסימולטור אין לנו לאן לזוז, אבל במחשב האמיתי זה יעבוד.'); return; }
    if (/^(irm |curl )/.test(low)) { he('זו בדיוק פקודת ההתקנה. בסימולטור היא לא מריצה כלום, את האמיתית מריצים בתחנה 3.'); return; }
    he('הטרמינל האמיתי היה עונה כאן שהוא לא מכיר את הפקודה. זה לא הורס כלום, רק מבקש לנסות שוב. נסו claude --version');
  }
  if (simOut) {
    he('שלום! נסו להקליד claude --version ולהקיש Enter.');
    simForm.addEventListener('submit', function (e) {
      e.preventDefault();
      runSim(simIn.value);
      simIn.value = '';
    });
    $$('#simChips button').forEach(function (b) {
      b.addEventListener('click', function () { runSim(b.textContent); });
    });
  }

  /* ---------- מפענח שגיאות ---------- */
  var PS_INSTALL = 'irm https://claude.ai/install.ps1 | iex';
  var CMD_INSTALL = 'curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd';
  var ERRORS = [
    { title: "command not found: claude / 'claude' is not recognized", keys: 'not found recognized path native installation exists is not in your path',
      fix: '<p><b>במילים פשוטות:</b> ההתקנה כנראה הצליחה, אבל המחשב לא יודע איפה הפקודה נמצאת.</p><p><b>קודם כול</b> פתחו חלון טרמינל חדש ונסו שוב. לא עזר? הוסיפו את התיקייה לרשימה (PATH), לפי המחשב שלכם:</p>',
      code: { win: "$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')\n[Environment]::SetEnvironmentVariable('PATH', \"$currentPath;$env:USERPROFILE\\.local\\bin\", 'User')",
              mac: "echo 'export PATH=\"$HOME/.local/bin:$PATH\"' >> ~/.zshrc\nsource ~/.zshrc",
              linux: "echo 'export PATH=\"$HOME/.local/bin:$PATH\"' >> ~/.bashrc\nsource ~/.bashrc" },
      after: '<p>פתחו חלון חדש ובדקו שוב עם <code>claude --version</code>.</p>' },
    { title: "'irm' is not recognized", keys: 'irm cmd',
      fix: '<p><b>במילים פשוטות:</b> אתם ב-CMD, והדבקתם פקודה של PowerShell. פתחו PowerShell מתפריט ההתחלה והריצו אותה שם, או הישארו ב-CMD עם הפקודה הזאת:</p>', code: { all: CMD_INSTALL } },
    { title: "The token '&&' is not a valid statement separator", keys: 'token && statement separator',
      fix: '<p><b>במילים פשוטות:</b> אתם ב-PowerShell, והדבקתם פקודה של CMD. השתמשו בזאת:</p>', code: { all: PS_INSTALL } },
    { title: "'bash' is not recognized / parameter name 'fsSL'", keys: 'bash fssl parameter cannot be found',
      fix: '<p><b>במילים פשוטות:</b> הדבקתם ב-Windows את הפקודה של Mac ו-Linux. הפקודה הנכונה ל-PowerShell:</p>', code: { all: PS_INSTALL } },
    { title: 'The command prints script text and nothing installs', keys: 'prints script text nothing installs',
      fix: '<p><b>במילים פשוטות:</b> הרצתם רק חצי מהפקודה, אז הקובץ הודפס במקום לרוץ. הדביקו את השורה המלאה:</p>', code: { win: PS_INSTALL, mac: 'curl -fsSL https://claude.ai/install.sh | bash', linux: 'curl -fsSL https://claude.ai/install.sh | bash' } },
    { title: "syntax error near unexpected token '<' / System.Xml.XmlDocument / < was unexpected", keys: 'syntax unexpected token html xmldocument doctype parsererror parseexception invoke-expression iex',
      fix: '<p><b>במילים פשוטות:</b> במקום קובץ ההתקנה הגיע דף אינטרנט. זה קורה לרוב באופן זמני, או ברשת חסומה.</p><p>חכו כמה דקות ונסו שוב. אם זה לא עוזר, נסו מרשת אחרת, כמו נקודה חמה מהטלפון, או התקינו בדרך חלופית:</p>',
      code: { win: 'winget install Anthropic.ClaudeCode', mac: 'brew install --cask claude-code' } },
    { title: 'curl: (22) The requested URL returned error: 403', keys: '403 curl forbidden returned error',
      fix: '<p><b>במילים פשוטות:</b> משהו חוסם את ההורדה. ברוב המקרים זו רשת ארגונית, כמו פרוקסי או חומת אש. נסו מרשת אחרת, או בקשו מאיש ה-IT לפתוח את הגישה ל-<code>claude.ai</code> ול-<code>downloads.claude.ai</code>.</p>' },
    { title: 'App unavailable in region', keys: 'region unavailable country',
      fix: '<p><b>במילים פשוטות:</b> השירות לא זמין במדינה שממנה אתם מחוברים. אם אתם ב-VPN, כבו אותו. <a href="https://www.anthropic.com/supported-countries" target="_blank" rel="noopener">רשימת המדינות הנתמכות</a>.</p>' },
    { title: 'Failed to fetch version / TLS connect error / SSL/TLS secure channel / unable to get local issuer certificate', keys: 'fetch version tls ssl secure channel certificate issuer proxy crypt_e revocation downloads.claude.ai',
      fix: '<p><b>במילים פשוטות:</b> המחשב לא מצליח לדבר עם השרת, ולרוב זו רשת ארגונית. נסו מרשת אחרת. אם זה מחשב של עבודה, ייתכן שאיש ה-IT יצטרך להגדיר פרוקסי או תעודה. <a href="https://code.claude.com/docs/en/troubleshoot-install#tls-or-ssl-connection-errors" target="_blank" rel="noopener">הפתרון המלא</a>.</p>' },
    { title: 'running scripts is disabled on this system', keys: 'running scripts disabled psecurityexception pssecurityexception execution policy npm.ps1',
      fix: '<p><b>במילים פשוטות:</b> זה קורה אם התקנתם דרך npm. הדרך הקלה היא להתקין עם המתקין הרשמי, שלא צריך את זה:</p>', code: { all: PS_INSTALL } },
    { title: 'The process cannot access the file … being used by another process', keys: 'process cannot access used by another',
      fix: '<p><b>במילים פשוטות:</b> התקנה קודמת או אנטי-וירוס עדיין מחזיקים את הקובץ. סגרו חלונות PowerShell אחרים, חכו דקה, והריצו:</p>', code: { all: 'Remove-Item -Recurse -Force "$env:USERPROFILE\\.claude\\downloads"\n' + PS_INSTALL } },
    { title: 'Claude Code does not support 32-bit Windows', keys: '32-bit 32 bit x86',
      fix: '<p><b>במילים פשוטות:</b> כמעט תמיד פתחתם בטעות את <b>Windows PowerShell (x86)</b>. סגרו, פתחו <b>Windows PowerShell</b> בלי התוספת הזאת, והתקינו שוב.</p>' },
    { title: 'OAuth error / Invalid code', keys: 'oauth invalid code login',
      fix: '<p><b>במילים פשוטות:</b> קוד הכניסה פג או הועתק חלקית. לחצו Enter ונסו שוב, והפעם סיימו את הכניסה מהר. אם הדפדפן לא נפתח, לחצו <code>c</code> כדי להעתיק את הקישור.</p>' },
    { title: 'API Error: 403 Request not allowed / 403 Forbidden after login', keys: '403 forbidden not allowed api error subscription',
      fix: '<p><b>במילים פשוטות:</b> בדרך כלל אין כרגע מנוי פעיל על החשבון שאיתו נכנסתם. בדקו ב-<a href="https://claude.ai/settings" target="_blank" rel="noopener">הגדרות החשבון</a>. אם המנוי פעיל, נסו להתנתק עם <code>/logout</code> ולהיכנס שוב. ברשת ארגונית, גם פרוקסי יכול לגרום לזה.</p>' },
    { title: 'Not logged in / token expired', keys: 'not logged token expired relogin',
      fix: '<p><b>במילים פשוטות:</b> פג תוקף הכניסה. הקלידו <code>/login</code>. אם זה חוזר על עצמו, בדקו ששעון המחשב מדויק.</p>' },
    { title: 'Auto-update failed · Run claude doctor', keys: 'auto-update failed doctor update',
      fix: '<p><b>במילים פשוטות:</b> העדכון ברקע לא הצליח, אבל אפשר להמשיך לעבוד. כדי לעדכן, הריצו בטרמינל:</p>', code: { all: 'claude update' } },
    { title: 'Claude Code access has not been granted for this account', keys: 'access not granted administrator authorization failed enterprise',
      fix: '<p><b>במילים פשוטות:</b> זה חשבון ארגוני, והארגון עדיין לא נתן לכם גישה ל-Claude Code. רק מנהל החשבון אצלכם יכול לפתור את זה.</p>' },
    { title: 'Prompt to upgrade when opening the Code tab', keys: 'upgrade code tab free plan שדרוג מנוי',
      fix: '<p><b>במילים פשוטות:</b> החשבון חינמי. Claude Code דורש מנוי בתשלום, החל מ-Pro.</p>' }
  ];
  var errList = $('#errList'), errQ = $('#errQ'), errNone = $('#errNone');
  function renderErrors() {
    if (!errList) return;
    var q = (errQ.value || '').toLowerCase().trim();
    var words = q.split(/\s+/).filter(function (w) { return w.length > 1; });
    var scored = ERRORS.map(function (e) {
      var hay = (e.title + ' ' + e.keys).toLowerCase(), score = 0;
      if (q && hay.indexOf(q) > -1) score += 10;
      words.forEach(function (w) { if (hay.indexOf(w) > -1) score++; });
      return { e: e, score: score };
    });
    var shown = q ? scored.filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; }).map(function (x) { return x.e; }) : ERRORS.slice(0, 5);
    errList.innerHTML = '';
    shown.forEach(function (e, idx) {
      var li = document.createElement('li');
      var d = document.createElement('details');
      if (q && idx === 0) d.open = true;
      var sum = document.createElement('summary');
      sum.textContent = e.title;
      d.appendChild(sum);
      var box = document.createElement('div');
      box.innerHTML = e.fix;
      if (e.code) {
        var c = e.code.all || e.code[state.os];
        if (c) {
          var block = document.createElement('div');
          block.className = 'cmd';
          var pre = document.createElement('pre'), code = document.createElement('code');
          code.textContent = c; pre.appendChild(code); block.appendChild(pre);
          var btn = document.createElement('button');
          btn.type = 'button'; btn.className = 'copy'; btn.textContent = 'העתקה';
          btn.addEventListener('click', function () {
            copyText(c).then(function () { btn.textContent = 'הועתק ✓'; btn.classList.add('done'); });
            setTimeout(function () { btn.textContent = 'העתקה'; btn.classList.remove('done'); }, 1800);
          });
          block.appendChild(btn);
          box.appendChild(block);
        }
      }
      if (e.after) { var a = document.createElement('div'); a.innerHTML = e.after; box.appendChild(a); }
      d.appendChild(box);
      li.appendChild(d);
      errList.appendChild(li);
    });
    errNone.hidden = shown.length > 0;
  }
  if (errQ) errQ.addEventListener('input', renderErrors);

  /* ---------- שינויים שמשפיעים גם על המפענח ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-set-os]')) renderErrors();
  });

  /* ---------- התחלה ---------- */
  applyChoices();
  renderVisa();
  renderErrors();
}());

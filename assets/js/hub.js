/* טרמינל המדריכים · עזי לוי
   קורא את ההתקדמות שכל מדריך שומר בדפדפן (אותו דומיין), ומציג אותה בלוח ובשערים.
   מדריך חדש: נותנים לשורה בלוח ולכרטיס data-key (מפתח ה-localStorage של המדריך),
   data-field (השדה עם החותמות) ו-data-total (מספר התחנות). זה הכול. */
(function () {
  'use strict';
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  var cache = {};
  function read(key) {
    if (key in cache) return cache[key];
    var v = null;
    try { v = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { v = null; }
    return (cache[key] = v && typeof v === 'object' ? v : null);
  }
  function progress(el) {
    var key = el.getAttribute('data-key');
    var total = +el.getAttribute('data-total') || 0;
    var data = key ? read(key) : null;
    var f = data && data[el.getAttribute('data-field')];
    var done = f && typeof f === 'object' ? Math.min(total, Object.keys(f).length) : 0;
    return { done: done, total: total, name: data && typeof data.name === 'string' ? data.name.trim() : '' };
  }

  var totalDone = 0, name = '', nextGate = null;
  $$('#boardList li[data-key]').forEach(function (li, i) {
    var p = progress(li);
    totalDone += p.done;
    if (p.name && !name) name = p.name;
    var prog = li.querySelector('.prog'), st = li.querySelector('.status');
    prog.textContent = p.done + '/' + p.total;
    if (p.done >= p.total && p.total) { st.textContent = 'הגעתם ליעד'; st.className = 'status done'; }
    else if (p.done > 0) { st.textContent = 'בדרך'; st.className = 'status boarding'; if (!nextGate) nextGate = li; }
    st.classList.add('flap'); st.style.animationDelay = (i * 0.15) + 's';
  });

  $$('.gate-card[data-key]').forEach(function (card) {
    var p = progress(card);
    var pc = card.querySelector('.pcount'), bar = card.querySelector('.bar i'), cta = card.querySelector('.cta');
    pc.textContent = p.done + ' מתוך ' + p.total;
    requestAnimationFrame(function () { bar.style.width = (p.total ? p.done / p.total * 100 : 0) + '%'; });
    if (p.done >= p.total && p.total) cta.textContent = 'סיימתם! לחזור לתעודה ←';
    else if (p.done > 0) cta.textContent = 'ממשיכים מאיפה שעצרתם ←';
  });

  var set = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };
  set('passName', name || 'אורח/ת');
  set('passDone', String(totalDone));
  set('passCount', String($$('#boardList li[data-key]').length));
  if (nextGate) set('passGate', nextGate.querySelector('.gate').textContent);
})();

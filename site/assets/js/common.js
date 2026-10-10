/* ==========================================================================
   Gemeinsame Funktionen für alle Seiten:
   Menü, Einblend-Animation, Anmelde-Leiste, Datumsformat, Vereinsangaben.
   ========================================================================== */
(function (window, document) {
  'use strict';
  var EKB = window.EKB = window.EKB || {};

  /* ---------- Datum ---------- */
  var MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  var MONATE_LANG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August',
    'September', 'Oktober', 'November', 'Dezember'];
  var WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  /** Heutiges Datum als JJJJ-MM-TT in Ortszeit (nicht UTC – sonst stimmt es nachts nicht). */
  function heute() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function teile(iso) {
    var p = String(iso || '').split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) return null;
    var wt = WOCHENTAGE[new Date(p[0], p[1] - 1, p[2]).getDay()];
    return { jahr: p[0], monat: p[1], tag: p[2], wt: wt };
  }

  /** „Mo, 28. Sep 2026 · 19:00–21:00 Uhr“ bzw. „17.–22. Mai 2027“ */
  function formatTermin(t, opts) {
    opts = opts || {};
    var s = teile(t.datum);
    if (!s) return '';
    var text;
    var e = t.enddatum && t.enddatum !== t.datum ? teile(t.enddatum) : null;
    if (e) {
      if (s.monat === e.monat && s.jahr === e.jahr) {
        text = s.tag + '.–' + e.tag + '. ' + MONATE[s.monat - 1] + ' ' + s.jahr;
      } else if (s.jahr === e.jahr) {
        text = s.tag + '. ' + MONATE[s.monat - 1] + ' – ' + e.tag + '. ' + MONATE[e.monat - 1] + ' ' + e.jahr;
      } else {
        text = s.tag + '. ' + MONATE[s.monat - 1] + ' ' + s.jahr + ' – ' + e.tag + '. ' + MONATE[e.monat - 1] + ' ' + e.jahr;
      }
    } else {
      text = (opts.wochentag === false ? '' : s.wt + ', ') + s.tag + '. ' + MONATE[s.monat - 1] + ' ' + s.jahr;
    }
    if (t.zeitVon && opts.zeit !== false) {
      text += ' · ' + t.zeitVon + (t.zeitBis ? '–' + t.zeitBis : '') + ' Uhr';
    }
    return text;
  }

  /** Kurzform für Listen: „28. Sep 2026“ */
  function formatKurz(iso) {
    var s = teile(iso);
    return s ? s.tag + '. ' + MONATE[s.monat - 1] + ' ' + s.jahr : '';
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 }) : null;

  function reveal(el) {
    if (!el) return;
    if (io) io.observe(el); else el.classList.add('in');
  }

  /* ---------- Hinweis-/Fehlerbox ---------- */
  function notice(text, type) {
    return '<p class="notice' + (type ? ' notice--' + type : '') + '" role="status">' + EKB.esc(text) + '</p>';
  }

  /* ---------- Vereinsangaben aus dem CMS (Bankverbindung, E-Mail) ---------- */
  function applyVerein() {
    var targets = document.querySelectorAll('[data-verein]');
    if (!targets.length || !EKB.query) return;
    EKB.query('*[_id=="verein"][0]{kontaktEmail, bank, iban}').then(function (v) {
      if (!v) return;
      targets.forEach(function (el) {
        var key = el.getAttribute('data-verein');
        var val = v[key];
        if (!val) return;
        el.textContent = val;
        if (key === 'kontaktEmail' && el.tagName === 'A') el.setAttribute('href', 'mailto:' + val);
        var wrap = el.closest('[data-verein-wrap]');
        if (wrap) wrap.hidden = false;
      });
    }).catch(function () { /* statischer Text bleibt stehen */ });
  }

  /* ---------- Akademie-Eckdaten aus dem CMS in [data-akademie]-Stellen eintragen ---------- */
  var akademiePromise = null;
  function loadAkademie() {
    if (!akademiePromise) {
      akademiePromise = EKB.query('*[_id=="akademie"][0]').catch(function () { return null; });
    }
    return akademiePromise;
  }
  function applyAkademie() {
    var targets = document.querySelectorAll('[data-akademie]');
    if (!targets.length || !EKB.query) return;
    loadAkademie().then(function (a) {
      if (!a) return;
      targets.forEach(function (el) {
        var val = a[el.getAttribute('data-akademie')];
        if (val !== undefined && val !== null && String(val).trim() !== '') el.textContent = val;
      });
    });
  }
  EKB.loadAkademie = loadAkademie;

  /* ---------- Menü (Handy) ---------- */
  function initNav() {
    var header = document.querySelector('header');
    var btn = document.querySelector('.nav-toggle');
    if (!header || !btn) return;
    function setOpen(open) {
      header.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    }
    btn.addEventListener('click', function () { setOpen(!header.classList.contains('nav-open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) { setOpen(false); btn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('nav-open') && !header.contains(e.target)) setOpen(false);
    });
    var mq = window.matchMedia('(min-width: 901px)');
    if (mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  /* ---------- Anmelde-Leiste ---------- */
  function initSticky() {
    var sticky = document.getElementById('stickyCta');
    if (!sticky) return;
    function update() { sticky.classList.toggle('visible', window.scrollY > 500); }
    document.addEventListener('scroll', update, { passive: true });
    update();
  }

  function init() {
    initNav();
    initSticky();
    document.querySelectorAll('.reveal').forEach(reveal);
    var y = document.getElementById('jahr');
    if (y) y.textContent = new Date().getFullYear();
    applyVerein();
    applyAkademie();
  }

  EKB.MONATE = MONATE;
  EKB.MONATE_LANG = MONATE_LANG;
  EKB.heute = heute;
  EKB.formatTermin = formatTermin;
  EKB.formatKurz = formatKurz;
  EKB.reveal = reveal;
  EKB.notice = notice;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);

/* Mobiles Hauptmenü: öffnen/schließen per Button, Escape oder Klick daneben */
(function () {
  var header = document.querySelector('header');
  var btn = document.querySelector('.nav-toggle');
  if (!header || !btn) return;

  function setOpen(open) {
    header.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  }

  btn.addEventListener('click', function () {
    setOpen(!header.classList.contains('nav-open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      setOpen(false);
      btn.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) setOpen(false);
  });
  // Beim Wechsel auf Desktop-Breite Menüzustand zurücksetzen
  var mq = window.matchMedia('(min-width: 901px)');
  if (mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
})();

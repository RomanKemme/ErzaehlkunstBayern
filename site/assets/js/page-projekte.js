/* Projekte-Übersicht: laufende und abgeschlossene Projekte */
(function (EKB, document) {
  'use strict';
  var laufend = document.getElementById('projekteLaufend');
  var abgeschlossen = document.getElementById('projekteAbgeschlossen');

  EKB.query('*[_type=="projekt" && bereich in ["projekte-laufend","projekte-abgeschlossen"] && defined(slug.current)]' +
    ' | order(reihenfolge asc, title asc){title, kurzbeschreibung, bereich, "slug": slug.current, "heroBild": heroBild.asset->url}')
    .then(function (projekte) {
      projekte = projekte || [];
      var l = projekte.filter(function (p) { return p.bereich === 'projekte-laufend'; });
      var a = projekte.filter(function (p) { return p.bereich === 'projekte-abgeschlossen'; });
      laufend.innerHTML = l.length
        ? l.map(EKB.projektKarte).join('')
        : '<p class="notice">Neue Projekte sind in Vorbereitung.</p>';
      if (a.length) {
        abgeschlossen.innerHTML = a.map(EKB.projektKarte).join('');
        document.getElementById('abgeschlossenWrap').hidden = false;
      }
      document.querySelectorAll('#projekte .reveal').forEach(EKB.reveal);
    })
    .catch(function () {
      laufend.innerHTML = EKB.notice('Die Projekte konnten gerade nicht geladen werden. Bitte lade die Seite in einem Moment neu.', 'error');
    });
})(window.EKB, document);

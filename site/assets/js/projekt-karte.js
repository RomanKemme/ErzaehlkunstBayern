/* Gemeinsame Projektkarte (Projekte-Seite und Akademie-Seite) */
(function (EKB) {
  'use strict';
  var esc = EKB.esc;
  EKB.projektKarte = function (p) {
    var href = 'projekt.html?slug=' + encodeURIComponent(p.slug || '');
    var bild = p.heroBild
      ? '<div class="proj__img"><img src="' + esc(EKB.imgUrl(p.heroBild, { w: 720, h: 300 })) + '" alt="" width="720" height="300" loading="lazy"></div>'
      : '';
    return '<article class="proj reveal">' + bild +
      '<h3><a class="proj__title-link" href="' + href + '">' + esc(p.title) + '</a></h3>' +
      (p.kurzbeschreibung ? '<p>' + esc(p.kurzbeschreibung) + '</p>' : '') +
      '<a class="proj__more" href="' + href + '" aria-hidden="true" tabindex="-1">Mehr erfahren →</a>' +
      '</article>';
  };
})(window.EKB);

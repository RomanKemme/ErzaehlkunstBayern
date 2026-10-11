/* Akademie-Seite: Module aus dem CMS, Schnupper-Termine, Vertiefungsangebote */
(function (EKB, document) {
  'use strict';
  var esc = EKB.esc;

  function modulHtml(m, i) {
    var name = (m.dozentin || '').split(',')[0];
    return '<details class="mod">' +
      '<summary class="mod__head"><span class="mod__dot" aria-hidden="true">' + (i + 1) + '</span>' +
      '<span class="mod__title">Modul ' + (i + 1) + ': ' + esc(m.titel) + '</span>' +
      '<span class="date">' + esc([m.zeitraum, name].filter(Boolean).join(' · ')) + '</span></summary>' +
      '<div class="mod__body-inner"><dl>' +
      (m.inhalt ? '<dt>Inhalt</dt><dd>' + esc(m.inhalt) + '</dd>' : '') +
      (m.dozentin ? '<dt>Dozentin</dt><dd>' + esc(m.dozentin) + '</dd>' : '') +
      (m.hinweis ? '<dt>Kosten</dt><dd>' + esc(m.hinweis) + '</dd>' : '') +
      '</dl><a class="mod__cta" href="anmeldung.html">Für die Ausbildung anmelden <span aria-hidden="true">→</span></a></div>' +
      '</details>';
  }

  // Module: Wenn im CMS gepflegt, ersetzen sie die vorinstallierte Liste.
  EKB.loadAkademie().then(function (a) {
    if (!a || !Array.isArray(a.module) || !a.module.length) return;
    var gueltig = a.module.filter(function (m) { return m && m.titel; });
    if (!gueltig.length) return;
    var tl = document.getElementById('timeline');
    // Bereits aufgeklappte Module bleiben nach dem Austausch aufgeklappt
    var offen = Array.prototype.map.call(tl.querySelectorAll('.mod'), function (d) { return d.open; });
    tl.innerHTML = gueltig.map(modulHtml).join('');
    tl.querySelectorAll('.mod').forEach(function (d, i) { if (offen[i]) d.open = true; });
  });

  // Schnupper-Termine aus der Terminliste
  var liste = document.getElementById('schnupperTermine');
  EKB.query('*[_type=="termin" && (schnupper == true || title match "Schnupper*") && coalesce(enddatum, datum) >= $heute] | order(datum asc)[0...3]{_id, datum, enddatum, zeitVon, zeitBis, full}',
    { heute: EKB.heute() })
    .then(function (t) {
      if (!t || !t.length) {
        liste.innerHTML = '<li>Der nächste Termin wird gerade geplant – schreib uns, wir informieren dich.</li>';
        return;
      }
      liste.innerHTML = t.map(function (x) {
        return '<li>' + esc(EKB.formatTermin(x)) + (x.full ? ' <span class="badge-full badge-full--klein">Ausgebucht</span>' : '') + '</li>';
      }).join('');
      var frei = t.filter(function (x) { return !x.full; })[0];
      if (frei) document.getElementById('schnupperBtn').href = 'anmeldung.html?termin=' + encodeURIComponent(frei._id);
    })
    .catch(function () {
      liste.innerHTML = '<li><a href="termine.html?filter=akademie">Alle Termine ansehen</a></li>';
    });

  // Vertiefungsangebote (Projekte mit Bereich „Akademie“)
  EKB.query('*[_type=="projekt" && bereich=="akademie" && defined(slug.current)] | order(reihenfolge asc, title asc){title, kurzbeschreibung, "slug": slug.current, "heroBild": heroBild.asset->url}')
    .then(function (p) {
      if (!p || !p.length) return;
      var grid = document.getElementById('akademieProjektGrid');
      grid.innerHTML = p.map(EKB.projektKarte).join('');
      document.getElementById('akademieProjekte').hidden = false;
      grid.querySelectorAll('.reveal').forEach(EKB.reveal);
    })
    .catch(function () { /* Abschnitt bleibt ausgeblendet */ });
})(window.EKB, document);

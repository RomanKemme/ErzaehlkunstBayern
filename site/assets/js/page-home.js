/* Startseite: Titelbild, nächste Termine, Impressionen-Galerie */
(function (EKB, document) {
  'use strict';
  var esc = EKB.esc;

  // Titelbild + Impressionen (Sanity-Dokument „Seitenbilder“)
  EKB.query('*[_type=="seiten"][0]{"hero": homeHero.asset->url, "fokus": homeHeroFokus,' +
    ' "impressionen": impressionen[]{ "bild": bild.asset->url, "alt": bild.alt, unterschrift }}')
    .then(function (s) {
      s = s || {};
      if (s.hero) {
        var hero = document.getElementById('homeHero');
        hero.style.backgroundImage = 'linear-gradient(rgba(33,46,41,.72),rgba(33,46,41,.84)), url("' +
          EKB.imgUrl(s.hero, { w: 2000 }) + '")';
        hero.style.backgroundPosition = s.fokus || 'center';
        hero.classList.add('hero--img');
      }
      // Einträge mit Foto zuerst; Einträge ohne Foto erscheinen als gestaltete Textkachel
      var eintraege = (s.impressionen || []).filter(function (im) { return im && (im.bild || im.unterschrift); });
      if (!eintraege.length) return; // Abschnitt bleibt ausgeblendet
      eintraege.sort(function (a, b) { return (b.bild ? 1 : 0) - (a.bild ? 1 : 0); });
      var grid = document.getElementById('impressGrid');
      grid.innerHTML = eintraege.map(function (im) {
        var media = im.bild
          ? '<img src="' + esc(EKB.imgUrl(im.bild, { w: 640, h: 420, name: im.unterschrift || im.alt })) + '" alt="' + esc(im.alt || im.unterschrift || '') + '" width="640" height="420" loading="lazy">'
          : '<div class="impress__ph" aria-hidden="true"><span>“</span></div>';
        return '<figure class="impress reveal">' + media +
          (im.unterschrift ? '<figcaption>' + esc(im.unterschrift) + '</figcaption>' : '') + '</figure>';
      }).join('');
      document.getElementById('impressionen').hidden = false;
      grid.querySelectorAll('.reveal').forEach(EKB.reveal);
    })
    .catch(function () { /* Seite funktioniert auch ohne Bilder */ });

  // Die nächsten 3 Termine (inkl. laufender mehrtägiger)
  var box = document.getElementById('naechsteTermine');
  EKB.query('*[_type=="termin" && coalesce(enddatum, datum) >= $heute] | order(datum asc, zeitVon asc)[0...3]{_id, datum, enddatum, title, full}',
    { heute: EKB.heute() })
    .then(function (termine) {
      if (!termine || !termine.length) {
        box.innerHTML = '<p>Neue Termine werden gerade geplant – schau bald wieder vorbei.</p>';
        return;
      }
      box.innerHTML = '<ul class="mini-termine__list">' + termine.map(function (t) {
        return '<li><strong>' + esc(EKB.formatTermin(t, { zeit: false, wochentag: false })) + '</strong> ' +
          esc(t.title) + (t.full ? ' <span class="mini-badge">ausgebucht</span>' : '') + '</li>';
      }).join('') + '</ul>';
    })
    .catch(function () {
      box.innerHTML = '<p>Die Termine konnten gerade nicht geladen werden.</p>';
    });
})(window.EKB, document);

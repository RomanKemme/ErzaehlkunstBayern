/* Termine-Seite: kommende Termine als Karten, Filter nach Kategorie */
(function (EKB, document) {
  'use strict';
  var esc = EKB.esc;
  var KAT = {
    akademie: { label: 'Akademie / Ausbildung', cls: 'tag--akademie' },
    offen: { label: 'Offener Treff', cls: 'tag--offen' },
  };
  var tc = document.getElementById('tcards');
  var status = document.getElementById('filterStatus');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var aktuell = 'alle';

  function karte(t) {
    var kat = KAT[t.cat] || KAT.offen;
    var bild = t.img
      ? '<div class="tcard__img"><img src="' + esc(EKB.imgUrl(t.img, { w: 720, h: 300, name: t.title })) + '" alt="" width="720" height="300" loading="lazy"></div>'
      : '';
    var aktion = t.full
      ? '<span class="btn btn--disabled" aria-disabled="true">Ausgebucht</span>'
      : '<a class="btn btn--dark" href="anmeldung.html?termin=' + encodeURIComponent(t._id) + '">Anmelden<span class="sr-only"> für ' + esc(t.title) + ' am ' + esc(EKB.formatKurz(t.datum)) + '</span></a>';
    var sticker = t.full ? '<span class="badge-full">Ausgebucht</span>' : '';
    return '<article class="tcard reveal' + (t.full ? ' is-full' : '') + (bild ? '' : ' tcard--ohne-bild') + '" data-cat="' + esc(t.cat || 'offen') + '">' +
      bild + sticker +
      '<div class="tcard__tags"><span class="tcard__tag ' + kat.cls + '">' + kat.label + '</span></div>' +
      '<p class="tcard__date">' + esc(EKB.formatTermin(t)) + '</p>' +
      '<h3>' + esc(t.title) + '</h3>' +
      (t.desc ? '<p class="tcard__desc">' + esc(t.desc) + '</p>' : '<p class="tcard__desc"></p>') +
      (t.meta ? '<p class="tcard__meta">' + esc(t.meta) + '</p>' : '') +
      aktion +
      '</article>';
  }

  // Strukturierte Daten (schema.org/Event), damit Suchmaschinen Termine als Veranstaltungen erkennen
  function strukturDaten(termine) {
    var org = { '@type': 'Organization', name: 'Erzählkunst Bayern e.V.', url: window.location.origin + '/' };
    var events = termine.map(function (t) {
      var start = t.datum + (t.zeitVon ? 'T' + t.zeitVon : '');
      var ende = (t.enddatum || t.datum) + (t.zeitBis ? 'T' + t.zeitBis : '');
      var ort = (t.meta || '').split('·')[0].trim() || 'München';
      return {
        '@context': 'https://schema.org', '@type': 'Event', name: t.title,
        startDate: start, endDate: ende,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: { '@type': 'Place', name: ort, address: ort },
        description: t.desc || undefined,
        image: t.img ? EKB.imgUrl(t.img, { w: 1200, name: t.title }) : undefined,
        organizer: org,
        offers: { '@type': 'Offer', url: window.location.origin + '/anmeldung.html?termin=' + encodeURIComponent(t._id),
          availability: t.full ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
      };
    });
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(events);
    document.head.appendChild(s);
  }

  function applyFilter(f) {
    aktuell = f;
    chips.forEach(function (c) {
      var on = c.getAttribute('data-filter') === f;
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var sichtbar = 0;
    tc.querySelectorAll('.tcard').forEach(function (card) {
      var zeigen = f === 'alle' || card.getAttribute('data-cat') === f;
      card.classList.toggle('hide', !zeigen);
      if (zeigen) sichtbar++;
    });
    var leer = document.getElementById('filterLeer');
    if (leer) leer.remove();
    if (!sichtbar && tc.querySelector('.tcard')) {
      tc.insertAdjacentHTML('beforeend', '<p class="notice" id="filterLeer">In dieser Kategorie sind gerade keine Termine geplant. <button type="button" class="linkbtn" data-reset>Alle Termine anzeigen</button></p>');
    }
    if (status) status.textContent = sichtbar + (sichtbar === 1 ? ' Termin' : ' Termine') + ' angezeigt';
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      applyFilter(c.getAttribute('data-filter'));
      var url = new URL(window.location.href);
      if (aktuell === 'alle') url.searchParams.delete('filter'); else url.searchParams.set('filter', aktuell);
      window.history.replaceState(null, '', url);
    });
  });
  tc.addEventListener('click', function (e) {
    if (e.target.closest('[data-reset]')) applyFilter('alle');
  });

  EKB.query('*[_type=="termin" && coalesce(enddatum, datum) >= $heute] | order(datum asc, zeitVon asc)' +
    '{_id, cat, datum, enddatum, zeitVon, zeitBis, title, desc, meta, full, "img": img.asset->url}',
    { heute: EKB.heute() })
    .then(function (termine) {
      if (!termine || !termine.length) {
        tc.innerHTML = '<p class="notice">Gerade sind keine Termine veröffentlicht. Neue Termine folgen bald – oder schreib uns über das <a href="anmeldung.html">Anmeldeformular</a>.</p>';
        if (status) status.textContent = '';
        return;
      }
      tc.innerHTML = termine.map(karte).join('');
      strukturDaten(termine);
      tc.querySelectorAll('.reveal').forEach(EKB.reveal);
      var f = new URLSearchParams(window.location.search).get('filter');
      applyFilter(f === 'akademie' || f === 'offen' ? f : 'alle');
    })
    .catch(function () {
      tc.innerHTML = EKB.notice('Die Termine konnten gerade nicht geladen werden. Bitte lade die Seite in einem Moment neu.', 'error');
    });
})(window.EKB, document);

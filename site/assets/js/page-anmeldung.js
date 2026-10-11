/* Anmeldeseite: Termine ins Auswahlfeld laden, Formular prüfen und absenden.
   Versand über Netlify Forms (funktioniert erst auf der veröffentlichten Website). */
(function (EKB, document, window) {
  'use strict';
  var form = document.getElementById('anmeldeForm');
  var select = document.getElementById('f-angebot');
  var hint = document.getElementById('f-angebot-hint');
  var sonstiges = select.querySelector('option[value="Einzelcoaching / Sonstiges"]');
  var okBox = document.getElementById('formOk');
  var errBox = document.getElementById('formErr');
  var submit = document.getElementById('f-submit');
  var params = new URLSearchParams(window.location.search);
  var kontaktEmail = '';
  EKB.query('*[_id=="verein"][0].kontaktEmail').then(function (m) { kontaktEmail = m || ''; }).catch(function () {});

  // Rückkehr nach klassischem Absenden (ohne JavaScript)
  if (params.get('gesendet') === '1') { okBox.hidden = false; }

  /* ---------- Termine laden ---------- */
  EKB.query('*[_type=="termin" && coalesce(enddatum, datum) >= $heute] | order(datum asc, zeitVon asc){_id, title, datum, enddatum, zeitVon, zeitBis, full, ticketLink}',
    { heute: EKB.heute() })
    .then(function (termine) {
      termine = termine || [];
      // Ausgebuchte Termine und Termine mit eigenem Ticketverkauf (z. B. Eventfrog) stehen nicht im Formular
      var frei = termine.filter(function (t) { return !t.full && !t.ticketLink; });
      frei.forEach(function (t) {
        var label = t.title + ' – ' + EKB.formatTermin(t);
        var opt = document.createElement('option');
        opt.value = label;
        opt.textContent = label;
        opt.setAttribute('data-id', t._id);
        select.insertBefore(opt, sonstiges);
      });
      hint.textContent = frei.length
        ? 'Alle kommenden Termine mit freien Plätzen stehen in der Liste.'
        : 'Gerade sind keine Termine mit freien Plätzen ausgeschrieben – wähle „Einzelcoaching / Sonstiges“ und schreib uns deinen Wunsch.';

      // Vorauswahl, wenn man von einer Terminkarte kommt (?termin=ID)
      var id = params.get('termin');
      if (id) {
        var match = select.querySelector('option[data-id="' + CSS.escape(id) + '"]');
        if (match) {
          select.value = match.value;
          hint.textContent = 'Wir haben den gewählten Termin schon für dich eingetragen.';
        } else {
          var t = termine.filter(function (x) { return x._id === id; })[0];
          hint.textContent = t && t.ticketLink && !t.full
            ? 'Für diesen Termin gibt es Tickets direkt beim Veranstalter – den Link findest du auf der Termine-Seite.'
            : t && t.full
            ? 'Der gewählte Termin ist leider ausgebucht. Wähle einen anderen Termin oder schreib uns – wir setzen dich gern auf die Warteliste.'
            : 'Der gewählte Termin ist nicht mehr verfügbar. Bitte wähle einen anderen aus.';
        }
      }
    })
    .catch(function () {
      hint.textContent = 'Die Termine konnten gerade nicht geladen werden. Wähle „Einzelcoaching / Sonstiges“ und nenne deinen Wunschtermin in der Nachricht.';
    });

  /* ---------- Prüfen ---------- */
  var felder = [
    { el: select, err: 'f-angebot-err', ok: function (v) { return !!v; } },
    { el: document.getElementById('f-name'), err: 'f-name-err', ok: function (v) { return v.trim().length > 1; } },
    { el: document.getElementById('f-mail'), err: 'f-mail-err', ok: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } },
  ];
  function pruefe(f) {
    var gut = f.ok(f.el.value);
    var err = document.getElementById(f.err);
    err.hidden = gut;
    f.el.setAttribute('aria-invalid', gut ? 'false' : 'true');
    if (gut) f.el.removeAttribute('aria-errormessage'); else f.el.setAttribute('aria-errormessage', f.err);
    return gut;
  }
  // Fehler verschwinden schon beim Tippen (nicht erst beim Verlassen des Feldes) –
  // so verschiebt sich das Layout nicht, während man auf „Absenden“ klickt.
  felder.forEach(function (f) {
    function neuPruefen() { if (f.el.getAttribute('aria-invalid') === 'true') pruefe(f); }
    f.el.addEventListener('input', neuPruefen);
    f.el.addEventListener('change', neuPruefen);
  });

  /* ---------- Absenden ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    okBox.hidden = true;
    errBox.hidden = true;
    var fehler = felder.filter(function (f) { return !pruefe(f); });
    if (fehler.length) { fehler[0].el.focus(); return; }

    var lokal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
    submit.disabled = true;
    submit.textContent = 'Wird gesendet …';

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      okBox.hidden = false;
      okBox.focus();
      form.reset();
      submit.textContent = 'Gesendet ✓';
    }).catch(function () {
      errBox.innerHTML = lokal
        ? '<strong>Lokale Vorschau:</strong> Das Formular wird erst auf der veröffentlichten Website verschickt. Alle Eingaben waren korrekt ausgefüllt.'
        : '<strong>Das hat leider nicht geklappt.</strong> Bitte versuch es in einem Moment noch einmal' +
          (kontaktEmail ? ' oder schreib uns direkt an <a href="mailto:' + EKB.esc(kontaktEmail) + '">' + EKB.esc(kontaktEmail) + '</a>.' : '.');
      errBox.hidden = false;
      errBox.focus();
      submit.disabled = false;
      submit.textContent = 'Anmeldung absenden';
    });
  });
})(window.EKB, document, window);

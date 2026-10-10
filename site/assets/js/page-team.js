/* Team-Seite: Dozentinnen mit Foto/Initialen und kurzer Hör-Vorstellung.
   Hör-Vorstellung: eigene Audiodatei aus dem CMS, sonst Sprachausgabe des Geräts. */
(function (EKB, document, window) {
  'use strict';
  var esc = EKB.esc;
  var grid = document.getElementById('teamGrid');
  var hint = document.getElementById('audioHint');
  var team = [];
  var player = null;     // aktuell laufendes Audio-Element
  var aktiv = null;      // aktiver Button

  function initialen(name) {
    return String(name || '?').split(/\s+/).filter(Boolean).map(function (w) { return w[0]; })
      .slice(0, 2).join('').toUpperCase();
  }

  // Titelbild „Über uns“
  EKB.query('*[_type=="seiten"][0]{"hero": ueberunsHero.asset->url, "fokus": ueberunsHeroFokus}')
    .then(function (s) {
      if (!s || !s.hero) return;
      var hero = document.getElementById('teamHero');
      hero.style.backgroundImage = 'linear-gradient(rgba(33,46,41,.72),rgba(33,46,41,.84)), url("' + EKB.imgUrl(s.hero, { w: 2000 }) + '")';
      hero.style.backgroundPosition = s.fokus || 'center';
      hero.classList.add('pagehero--img');
    }).catch(function () {});

  var tts = 'speechSynthesis' in window;

  EKB.query('*[_type=="teamMitglied"] | order(reihenfolge asc, name asc){name, ort, fach, ini, intro, "foto": foto.asset->url, "fotoAlt": foto.alt, "audio": audio.asset->url}')
    .then(function (data) {
      team = (data || []).filter(function (p) { return p && p.name; });
      if (!team.length) { grid.innerHTML = '<p class="notice">Die Teamvorstellung folgt in Kürze.</p>'; return; }
      var hatTts = false, hatAudio = false;
      grid.innerHTML = team.map(function (p, i) {
        var avatar = p.foto
          ? '<div class="avatar avatar--foto"><img src="' + esc(EKB.imgUrl(p.foto, { w: 240, h: 240 })) + '" alt="' + esc(p.fotoAlt || ('Porträt von ' + p.name)) + '" width="240" height="240" loading="lazy"></div>'
          : '<div class="avatar" aria-hidden="true">' + esc(p.ini || initialen(p.name)) + '</div>';
        var kannHoeren = p.audio || (p.intro && tts);
        if (p.audio) hatAudio = true; else if (p.intro && tts) hatTts = true;
        return '<article class="dozentin reveal">' + avatar +
          '<h3>' + esc(p.name) + '</h3>' +
          (p.ort ? '<p class="ort">' + esc(p.ort) + '</p>' : '') +
          (p.fach ? '<p class="fach">' + esc(p.fach) + '</p>' : '') +
          (kannHoeren
            ? '<div class="audio-row"><button type="button" class="audio-btn" data-i="' + i + '" aria-pressed="false" aria-label="Vorstellung von ' + esc(p.name) + ' anhören">' +
              '<span class="audio-btn__icon" aria-hidden="true">▶</span></button>' +
              '<div class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>'
            : '') +
          '</article>';
      }).join('');
      grid.querySelectorAll('.reveal').forEach(EKB.reveal);
      if (hatTts) {
        hint.textContent = hatAudio
          ? 'Einige Vorstellungen werden von der Sprachausgabe deines Geräts vorgelesen.'
          : 'Die Vorstellungen werden von der Sprachausgabe deines Geräts vorgelesen.';
        hint.hidden = false;
      }
    })
    .catch(function () {
      grid.innerHTML = EKB.notice('Das Team konnte gerade nicht geladen werden. Bitte lade die Seite in einem Moment neu.', 'error');
    });

  function stopAll() {
    if (tts) window.speechSynthesis.cancel();
    if (player) { player.pause(); player = null; }
    grid.querySelectorAll('.dozentin').forEach(function (d) { d.classList.remove('speaking'); });
    grid.querySelectorAll('.audio-btn').forEach(function (b) {
      b.classList.remove('playing');
      b.setAttribute('aria-pressed', 'false');
      b.querySelector('.audio-btn__icon').textContent = '▶';
      var p = team[b.getAttribute('data-i')];
      b.setAttribute('aria-label', 'Vorstellung von ' + (p ? p.name : '') + ' anhören');
    });
    aktiv = null;
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.audio-btn');
    if (!btn) return;
    if (aktiv === btn) { stopAll(); return; }
    stopAll();
    var p = team[btn.getAttribute('data-i')];
    if (!p) return;
    aktiv = btn;
    btn.classList.add('playing');
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Vorstellung von ' + p.name + ' stoppen');
    btn.querySelector('.audio-btn__icon').textContent = '❚❚';
    btn.closest('.dozentin').classList.add('speaking');
    if (p.audio) {
      player = new Audio(p.audio);
      player.addEventListener('ended', stopAll);
      player.addEventListener('error', stopAll);
      player.play().catch(stopAll);
    } else if (tts && p.intro) {
      var u = new SpeechSynthesisUtterance(p.intro);
      u.lang = 'de-DE';
      u.rate = 0.95;
      u.onend = stopAll;
      u.onerror = stopAll;
      window.speechSynthesis.speak(u);
    } else {
      stopAll();
    }
  });
})(window.EKB, document, window);

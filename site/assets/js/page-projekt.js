/* Projekt-Detailseite: lädt das Projekt anhand von ?slug=… */
(function (EKB, document, window) {
  'use strict';
  var esc = EKB.esc;
  var inhalt = document.getElementById('projektInhalt');
  var titel = document.getElementById('projektTitel');
  var crumb = document.getElementById('crumbTitle');

  function nichtGefunden() {
    titel.textContent = 'Projekt nicht gefunden';
    crumb.textContent = 'Nicht gefunden';
    document.title = 'Projekt nicht gefunden | Erzählkunst Bayern e.V.';
    setMeta('robots', 'noindex');
    inhalt.innerHTML = '<p class="notice">Dieses Projekt gibt es nicht (mehr). Vielleicht wurde es umbenannt. ' +
      '<a href="projekte.html">Hier findest du alle aktuellen Projekte.</a></p>';
    document.getElementById('projektCta').hidden = true;
  }

  function setMeta(name, content) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', name); document.head.appendChild(m); }
    m.setAttribute('content', content);
  }

  // Slug aus ?slug=… (oder aus einer älteren Adresse wie /unsere-projekte/xyz/)
  var slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    var parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length > 1 && !/\.html$/.test(parts[parts.length - 1])) slug = parts[parts.length - 1];
  }
  if (!slug) { nichtGefunden(); return; }

  EKB.query('*[_type=="projekt" && slug.current == $slug][0]{title, bereich, zitat, zitatAutor, kurzbeschreibung, ctaText, ctaLink,' +
    ' "heroBild": heroBild.asset->url, inhalt[]{..., _type == "image" => {"asset": asset->{url}}}}', { slug: slug })
    .then(function (p) {
      if (!p) { nichtGefunden(); return; }
      document.title = p.title + ' | Erzählkunst Bayern e.V.';
      var desc = document.querySelector('meta[name="description"]');
      if (desc && p.kurzbeschreibung) desc.setAttribute('content', p.kurzbeschreibung);
      // Eine feste Adresse pro Projekt für Suchmaschinen
      var canon = document.createElement('link');
      canon.rel = 'canonical';
      canon.href = window.location.origin + '/projekt.html?slug=' + encodeURIComponent(slug);
      document.head.appendChild(canon);
      titel.textContent = p.title;
      crumb.textContent = p.title;
      if (p.bereich === 'akademie') {
        var cb = document.getElementById('crumbBereich');
        cb.textContent = 'Akademie';
        cb.href = 'akademie.html';
        var back = document.getElementById('backLink');
        back.textContent = '← Zur Akademie';
        back.href = 'akademie.html';
      }
      if (p.heroBild) {
        var hero = document.getElementById('projektHero');
        hero.style.backgroundImage = 'linear-gradient(rgba(33,46,41,.72),rgba(33,46,41,.84)), url("' + EKB.imgUrl(p.heroBild, { w: 2000 }) + '")';
        hero.classList.add('pagehero--img');
      }
      if (p.zitat) {
        var z = document.getElementById('projektZitat');
        z.innerHTML = '„' + esc(p.zitat) + '“' + (p.zitatAutor ? '<span>' + esc(p.zitatAutor) + '</span>' : '');
        z.hidden = false;
      }
      var html = EKB.portableText(p.inhalt);
      inhalt.innerHTML = html || (p.kurzbeschreibung ? '<p>' + esc(p.kurzbeschreibung) + '</p>' : '<p>Mehr Informationen folgen in Kürze.</p>');
      if (p.ctaText) document.getElementById('ctaHeading').textContent = p.ctaText;
      var link = EKB.safeHref(p.ctaLink);
      if (link) document.getElementById('ctaButton').setAttribute('href', link);
    })
    .catch(function () {
      titel.textContent = 'Projekt';
      inhalt.innerHTML = EKB.notice('Das Projekt konnte gerade nicht geladen werden. Bitte lade die Seite in einem Moment neu.', 'error');
    });
})(window.EKB, document, window);

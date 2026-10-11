/* ==========================================================================
   Sanity-Anbindung für Erzählkunst Bayern e.V.
   - Liest Inhalte (Termine, Projekte, Team, Akademie …) aus Sanity.
   - Nur lesender Zugriff auf öffentliche Inhalte, kein Schlüssel nötig.
   - Alle Texte aus dem CMS werden vor der Ausgabe maskiert (esc), damit
     Sonderzeichen wie < oder & das Layout nicht zerstören.
   ========================================================================== */
(function (window) {
  'use strict';

  var SANITY = {
    projectId: 'o1wd66uu',
    dataset: 'production',
    apiVersion: '2024-01-01',
  };

  /* apicdn = schnelle, gecachte Auslieferung. Sanity leert diesen Cache
     automatisch, sobald im Studio etwas veröffentlicht wird. */
  var BASE = 'https://' + SANITY.projectId + '.apicdn.sanity.io/v' + SANITY.apiVersion +
    '/data/query/' + SANITY.dataset;

  /** GROQ-Abfrage ausführen. params werden sicher als $name übergeben. */
  function sanityQuery(groq, params) {
    var url = BASE + '?query=' + encodeURIComponent(groq);
    if (params) {
      Object.keys(params).forEach(function (k) {
        url += '&' + encodeURIComponent('$' + k) + '=' + encodeURIComponent(JSON.stringify(params[k]));
      });
    }
    return fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('Sanity-Anfrage fehlgeschlagen (' + r.status + ')');
        return r.json();
      })
      .then(function (data) { return data.result; });
  }

  /** Text für die Ausgabe in HTML maskieren. Leere Werte → ''. */
  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Nur sichere Linkziele zulassen (http, https, mailto, tel, relative Pfade). */
  function safeHref(href) {
    if (!href) return '';
    var h = String(href).trim();
    if (/^(https?:|mailto:|tel:)/i.test(h)) return h;
    if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return ''; // z. B. javascript: → verwerfen
    return h; // relativer Link wie anmeldung.html oder #anker
  }

  /** Bild-URL von Sanity verkleinern und in modernem Format ausliefern. */
  function imgUrl(url, opts) {
    if (!url) return '';
    opts = opts || {};
    var p = ['auto=format'];
    if (opts.w) p.push('w=' + opts.w);
    if (opts.h) p.push('h=' + opts.h);
    if (opts.w && opts.h) p.push('fit=crop');
    if (opts.q) p.push('q=' + opts.q);
    // Sprechender Dateiname für Suchmaschinen („Vanity Filename“ von Sanity):
    // …/abc123-800x600.jpg/erzaehlerin-carola.jpg – wird aus Titel/Bildunterschrift erzeugt,
    // die Redaktion muss Dateien vor dem Hochladen also nicht umbenennen.
    var name = slugify(opts.name);
    if (name && url.indexOf('?') === -1) {
      var ext = (url.match(/\.(jpe?g|png|webp|gif|svg|avif)$/i) || [])[1];
      if (ext) url += '/' + name + '.' + ext.toLowerCase();
    }
    return url + (url.indexOf('?') === -1 ? '?' : '&') + p.join('&');
  }

  function slugify(t) {
    if (!t) return '';
    return String(t).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
  }

  /** Sanity „Portable Text“ (Rich-Text) in HTML umwandeln.
      Unterstützt: Absätze, Überschriften (h3), Aufzählungen, Fett/Kursiv, Links, Bilder. */
  function renderPortableText(blocks) {
    if (!Array.isArray(blocks) || !blocks.length) return '';
    var html = '';
    var inList = false;

    function closeList() { if (inList) { html += '</ul>'; inList = false; } }

    function renderChildren(block) {
      var defs = block.markDefs || [];
      return (block.children || []).map(function (span) {
        var text = esc(span.text || '').replace(/\n/g, '<br>');
        (span.marks || []).forEach(function (mark) {
          if (mark === 'strong') text = '<strong>' + text + '</strong>';
          else if (mark === 'em') text = '<em>' + text + '</em>';
          else {
            var def = defs.filter(function (d) { return d._key === mark; })[0];
            if (def && def._type === 'link') {
              var href = safeHref(def.href);
              if (href) {
                var ext = /^https?:/i.test(href);
                text = '<a href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + text + '</a>';
              }
            }
          }
        });
        return text;
      }).join('');
    }

    blocks.forEach(function (block) {
      if (!block) return;
      if (block._type === 'image') {
        closeList();
        var url = block.asset && block.asset.url;
        if (url) {
          html += '<figure class="rt-figure"><img src="' + esc(imgUrl(url, { w: 1200, name: block.alt || block.caption })) + '" alt="' +
            esc(block.alt || '') + '" loading="lazy">' +
            (block.caption ? '<figcaption>' + esc(block.caption) + '</figcaption>' : '') + '</figure>';
        }
        return;
      }
      if (block._type !== 'block') return;
      var text = renderChildren(block);
      if (!text.trim()) { closeList(); return; }
      if (block.listItem) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + text + '</li>';
        return;
      }
      closeList();
      if (block.style === 'h3' || block.style === 'h2') html += '<h3>' + text + '</h3>';
      else html += '<p>' + text + '</p>';
    });
    closeList();
    return html;
  }

  window.EKB = window.EKB || {};
  window.EKB.SANITY = SANITY;
  window.EKB.query = sanityQuery;
  window.EKB.esc = esc;
  window.EKB.safeHref = safeHref;
  window.EKB.imgUrl = imgUrl;
  window.EKB.portableText = renderPortableText;
})(window);

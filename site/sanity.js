/* Sanity-Anbindung für Erzählkunst Bayern
   >>> HIER die eigene Projekt-ID eintragen (steht nach dem Setup in studio/sanity.config.js
   oder unter manage.sanity.io beim Projekt): <<< */
const SANITY_PROJECT_ID = 'o1wd66uu';
const SANITY_DATASET = 'production';

/* Führt eine GROQ-Abfrage gegen Sanitys CDN-API aus und gibt das result zurück.
   apicdn = gecachte, schnelle Auslieferung – ideal für öffentliche Inhalte. */
/* Wandelt Sanitys "Portable Text"-Array (aus dem Inhalt-Feld) in HTML um.
   Unterstützt: Absätze, Überschriften (h3), Aufzählungen, Fett/Kursiv, Links, Bilder. */
function renderPortableText(blocks) {
  if (!blocks || !blocks.length) return '';
  let html = '';
  let inList = false;

  function renderSpan(span) {
    let text = span.text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    (span.marks || []).forEach((mark) => {
      if (mark === 'strong') text = `<strong>${text}</strong>`;
      if (mark === 'em') text = `<em>${text}</em>`;
    });
    return text;
  }

  function renderBlockText(block, markDefs) {
    return (block.children || []).map((span) => {
      let out = renderSpan(span);
      (span.marks || []).forEach((markKey) => {
        const def = (markDefs || []).find((d) => d._key === markKey && d._type === 'link');
        if (def) out = `<a href="${def.href}" target="_blank" rel="noopener">${out}</a>`;
      });
      return out;
    }).join('');
  }

  blocks.forEach((block) => {
    if (block._type === 'image' && block.asset) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<img src="${block.asset.url}" alt="" loading="lazy" style="width:100%;border-radius:12px;margin:20px 0">`;
      return;
    }
    if (block._type !== 'block') return;
    const text = renderBlockText(block, block.markDefs);
    if (block.listItem === 'bullet') {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${text}</li>`;
      return;
    }
    if (inList) { html += '</ul>'; inList = false; }
    if (block.style === 'h3') html += `<h3>${text}</h3>`;
    else html += `<p>${text}</p>`;
  });
  if (inList) html += '</ul>';
  return html;
}

/* Führt eine GROQ-Abfrage gegen Sanitys API aus und gibt das result zurück.
   Bewusst NICHT die apicdn (Cache)-Adresse, sondern die normale API –
   dadurch immer aktuell, auch direkt nach einer CMS-Änderung. */
function sanityQuery(groq) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(groq)}`;
  return fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error('Sanity-Anfrage fehlgeschlagen: ' + r.status);
      return r.json();
    })
    .then((data) => data.result);
}

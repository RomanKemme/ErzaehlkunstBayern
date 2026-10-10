// Termin – erscheint auf der Termine-Seite, auf der Startseite (nächste 3) und im Anmeldeformular.
// Vergangene Termine werden auf der Website automatisch ausgeblendet.
const zeitOptionen = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 10) {
    zeitOptionen.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
function datumText(iso) {
  if (!iso) return 'ohne Datum'
  const [j, m, t] = iso.split('-').map(Number)
  return `${WT[new Date(j, m - 1, t).getDay()]}, ${t}.${m}.${j}`
}

export default {
  name: 'termin',
  title: 'Termin',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      description: 'So erscheint der Termin auf der Website, z. B. „Der Montagsclub“ oder „Schnupper-Workshop Erzählen“.',
      validation: (Rule) => [
        Rule.required().error('Bitte einen Titel eingeben.'),
        Rule.max(80).warning('Kürzere Titel (unter 80 Zeichen) lesen sich auf dem Handy besser.'),
      ],
    },
    {
      name: 'cat',
      title: 'Kategorie',
      type: 'string',
      description: 'Bestimmt die Farbe und den Filter auf der Termine-Seite.',
      options: {
        list: [
          { title: 'Akademie / Ausbildung (Grundausbildung, Workshops, Erzählreise …)', value: 'akademie' },
          { title: 'Offener Treff (Montagsclub, offene Formate …)', value: 'offen' },
        ],
        layout: 'radio',
      },
      initialValue: 'offen',
      validation: (Rule) => Rule.required().error('Bitte eine Kategorie wählen.'),
    },
    {
      name: 'datum',
      title: 'Datum',
      type: 'date',
      description: 'Startdatum – über den Kalender auswählen.',
      options: { dateFormat: 'DD.MM.YYYY' },
      validation: (Rule) => Rule.required().error('Bitte ein Datum wählen.'),
    },
    {
      name: 'enddatum',
      title: 'Enddatum (nur bei mehrtägigen Terminen)',
      type: 'date',
      description: 'Leer lassen bei eintägigen Terminen. Mehrtägige Termine bleiben sichtbar, bis das Enddatum vorbei ist.',
      options: { dateFormat: 'DD.MM.YYYY' },
      validation: (Rule) =>
        Rule.custom((ende, ctx) => {
          if (!ende || !ctx.document?.datum) return true
          return ende >= ctx.document.datum ? true : 'Das Enddatum liegt vor dem Startdatum.'
        }),
    },
    {
      name: 'zeitVon',
      title: 'Uhrzeit von',
      type: 'string',
      description: 'Leer lassen, falls der Termin keine feste Uhrzeit hat (z. B. mehrtägige Reise).',
      options: { list: zeitOptionen },
    },
    {
      name: 'zeitBis',
      title: 'Uhrzeit bis',
      type: 'string',
      options: { list: zeitOptionen },
      validation: (Rule) =>
        Rule.custom((bis, ctx) => {
          const von = ctx.document?.zeitVon
          if (!bis) return true
          if (!von) return 'Bitte auch „Uhrzeit von“ angeben.'
          return bis > von ? true : '„Uhrzeit bis“ muss nach „Uhrzeit von“ liegen.'
        }),
    },
    {
      name: 'desc',
      title: 'Beschreibung',
      type: 'text',
      rows: 3,
      description: 'Ein bis zwei Sätze, worum es geht. Erscheint auf der Terminkarte.',
      validation: (Rule) => Rule.max(300).warning('Die Karte wird bei über 300 Zeichen sehr lang.'),
    },
    {
      name: 'meta',
      title: 'Ort und Kosten',
      type: 'string',
      description: 'Kurz und knapp, z. B. „Kulturzentrum LUISE, München · 1–5 €“.',
    },
    {
      name: 'schnupper',
      title: 'Ist das ein Schnupper-Workshop?',
      type: 'boolean',
      description: 'Wenn ja, wird der Termin auf der Akademie-Seite unter „Noch unsicher?“ angezeigt.',
      initialValue: false,
    },
    {
      name: 'full',
      title: 'Ausgebucht?',
      type: 'boolean',
      description: 'Wenn ja, steht „Ausgebucht“ auf der Karte und der Termin verschwindet aus dem Anmeldeformular.',
      initialValue: false,
    },
    {
      name: 'img',
      title: 'Bild (optional)',
      type: 'image',
      description: 'Optional. Querformat wirkt am besten. Ohne Bild bleibt die Karte schlicht.',
      options: { hotspot: true },
    },
  ],
  orderings: [
    { title: 'Datum (früheste zuerst)', name: 'datumAsc', by: [{ field: 'datum', direction: 'asc' }] },
    { title: 'Datum (neueste zuerst)', name: 'datumDesc', by: [{ field: 'datum', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', datum: 'datum', enddatum: 'enddatum', full: 'full', cat: 'cat', media: 'img' },
    prepare({ title, datum, enddatum, full, cat, media }) {
      const zeitraum = enddatum && enddatum !== datum ? `${datumText(datum)} – ${datumText(enddatum)}` : datumText(datum)
      const teile = [zeitraum, cat === 'akademie' ? 'Akademie' : 'Offener Treff']
      if (full) teile.push('AUSGEBUCHT')
      return { title: title || 'Ohne Titel', subtitle: teile.join(' · '), media }
    },
  },
}

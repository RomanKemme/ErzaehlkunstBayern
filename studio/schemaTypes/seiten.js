// Seitenbilder – Titelbilder und Impressionen-Galerie (es gibt genau ein Dokument davon).
const fokusOptionen = {
  list: [
    { title: 'Oben (z. B. für Gesichter/Köpfe)', value: 'top' },
    { title: 'Mitte (Standard)', value: 'center' },
    { title: 'Unten', value: 'bottom' },
  ],
  layout: 'radio',
}

export default {
  name: 'seiten',
  title: 'Seitenbilder',
  type: 'document',
  fields: [
    {
      name: 'homeHero',
      title: 'Titelbild Startseite',
      type: 'image',
      description: 'Sehr breites Querformat (ca. 2000 × 750 px). Leer = grüner Farbverlauf. Das Bild wird abgedunkelt, damit die Schrift lesbar bleibt.',
      options: { hotspot: true },
    },
    { name: 'homeHeroFokus', title: 'Bildausschnitt Startseite', type: 'string', options: fokusOptionen, initialValue: 'center' },
    {
      name: 'ueberunsHero',
      title: 'Titelbild „Über uns“',
      type: 'image',
      description: 'Sehr breites Querformat. Leer = grüner Farbverlauf.',
      options: { hotspot: true },
    },
    { name: 'ueberunsHeroFokus', title: 'Bildausschnitt „Über uns“', type: 'string', options: fokusOptionen, initialValue: 'center' },
    {
      name: 'impressionen',
      title: 'Impressionen (Galerie auf der Startseite)',
      type: 'array',
      description: 'Fotos mit kurzer Bildunterschrift. Einträge mit Foto stehen vorne; ein Eintrag ohne Foto erscheint als grüne Kachel mit seiner Bildunterschrift.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'bild',
              title: 'Bild',
              type: 'image',
              options: { hotspot: true },
              fields: [{ name: 'alt', title: 'Bildbeschreibung (optional)', type: 'string' }],
            },
            { name: 'unterschrift', title: 'Bildunterschrift', type: 'string' },
          ],
          preview: {
            select: { title: 'unterschrift', media: 'bild' },
            prepare: ({ title, media }) => ({ title: title || 'Ohne Unterschrift', media }),
          },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: 'Titelbilder & Impressionen' }) },
}

const fokusOptionen = {
  list: [
    { title: 'Oben (z. B. für Gesichter/Köpfe)', value: 'top' },
    { title: 'Mitte (Standard)', value: 'center' },
    { title: 'Unten', value: 'bottom' },
  ],
  layout: 'radio',
};

export default {
  name: 'seiten',
  title: 'Seitenbilder',
  type: 'document',
  fields: [
    {
      name: 'homeHero',
      title: 'Titelbild Startseite',
      type: 'image',
      description: 'Empfohlen: sehr breites Querformat (ca. 16:6, z. B. 2000×750 px). Leer = grüner Farbverlauf.',
    },
    { name: 'homeHeroFokus', title: 'Bildausschnitt Startseite', type: 'string', options: fokusOptionen, initialValue: 'center' },
    {
      name: 'ueberunsHero',
      title: 'Titelbild „Über uns“',
      type: 'image',
      description: 'Empfohlen: sehr breites Querformat (ca. 16:6). Leer = grüner Farbverlauf.',
    },
    { name: 'ueberunsHeroFokus', title: 'Bildausschnitt „Über uns“', type: 'string', options: fokusOptionen, initialValue: 'center' },
    {
      name: 'impressionen',
      title: 'Impressionen (Galerie auf der Startseite)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'bild', title: 'Bild', type: 'image', description: 'Leer lassen = dekorativer Platzhalter' },
            { name: 'unterschrift', title: 'Bildunterschrift', type: 'string' },
          ],
          preview: { select: { title: 'unterschrift', media: 'bild' } },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: 'Titelbilder & Impressionen' }) },
};

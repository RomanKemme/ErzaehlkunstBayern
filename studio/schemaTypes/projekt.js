export default {
  name: 'projekt',
  title: 'Projekte',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL-Kurzname',
      type: 'slug',
      description: 'Wird automatisch aus dem Titel erzeugt – ergibt die Adresse der Projektseite (z. B. der-montagsclub).',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'bereich',
      title: 'Wo erscheint dieses Projekt?',
      type: 'string',
      options: {
        list: [
          { title: 'Unsere Projekte (laufend)', value: 'projekte-laufend' },
          { title: 'Unsere Projekte (abgeschlossen)', value: 'projekte-abgeschlossen' },
          { title: 'Akademie (z. B. Erzählreise)', value: 'akademie' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'heroBild',
      title: 'Titelbild',
      type: 'image',
      description: 'Großes Bild oben auf der Projektseite.',
    },
    {
      name: 'zitat',
      title: 'Zitat (optional)',
      type: 'text',
      rows: 2,
      description: 'Erscheint unter dem Titel, z. B. „Erzählen heißt, jemandem die Hand reichen.“',
    },
    {
      name: 'zitatAutor',
      title: 'Autor des Zitats (optional)',
      type: 'string',
    },
    {
      name: 'kurzbeschreibung',
      title: 'Kurzbeschreibung (für die Übersichtskarte)',
      type: 'text',
      rows: 2,
      description: 'Kurzer Anrisstext, erscheint auf der Projekte-Übersichtsseite.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'inhalt',
      title: 'Seiteninhalt',
      type: 'array',
      description: 'Der komplette Text der Projektseite. Über die Werkzeugleiste: Überschriften, Aufzählungen, Fett, Links.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Überschrift', value: 'h3' },
          ],
          lists: [{ title: 'Aufzählung', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Fett', value: 'strong' },
              { title: 'Kursiv', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [{ name: 'href', title: 'URL', type: 'url' }],
              },
            ],
          },
        },
        { type: 'image', title: 'Bild im Text' },
      ],
    },
    {
      name: 'ctaText',
      title: 'Button-Text am Seitenende (optional)',
      type: 'string',
      description: 'z. B. „Fragen? Anmelden? Dann geht’s hier lang!“',
    },
    {
      name: 'ctaLink',
      title: 'Button-Ziel (optional)',
      type: 'string',
      description: 'z. B. anmeldung.html oder eine externe E-Mail-Adresse (mailto:...)',
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge auf der Übersichtsseite',
      type: 'number',
      initialValue: 10,
    },
  ],
  orderings: [
    { title: 'Reihenfolge', name: 'reihenfolgeAsc', by: [{ field: 'reihenfolge', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'bereich', media: 'heroBild' },
  },
};

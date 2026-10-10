// Projekt – erscheint als Karte auf „Projekte“ (oder „Akademie“) und hat eine eigene Detailseite.
const BEREICHE = [
  { title: 'Projekte-Seite: laufendes Projekt', value: 'projekte-laufend' },
  { title: 'Projekte-Seite: abgeschlossenes Projekt', value: 'projekte-abgeschlossen' },
  { title: 'Akademie-Seite: Vertiefungsangebot (z. B. Erzählreise)', value: 'akademie' },
]
const BEREICH_KURZ = {
  'projekte-laufend': 'Laufend',
  'projekte-abgeschlossen': 'Abgeschlossen',
  akademie: 'Akademie',
}

const bildMitAlt = (title, description) => ({
  type: 'image',
  title,
  description,
  options: { hotspot: true },
  fields: [
    {
      name: 'alt',
      title: 'Bildbeschreibung (für Blinde und Suchmaschinen)',
      type: 'string',
      description: 'Was ist auf dem Bild zu sehen? z. B. „Erzählerin vor Publikum im Kulturzentrum“.',
    },
  ],
})

export default {
  name: 'projekt',
  title: 'Projekte',
  type: 'document',
  groups: [
    { name: 'karte', title: 'Übersichtskarte', default: true },
    { name: 'seite', title: 'Projektseite' },
  ],
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      group: 'karte',
      validation: (Rule) => [
        Rule.required().error('Bitte einen Titel eingeben.'),
        Rule.max(90).warning('Kürzere Titel lesen sich auf dem Handy besser.'),
      ],
    },
    {
      name: 'slug',
      title: 'Internetadresse (Kurzname)',
      type: 'slug',
      group: 'karte',
      description:
        'Einmal auf „Generieren“ klicken – wird aus dem Titel erzeugt. Später möglichst nicht mehr ändern, sonst funktionieren geteilte Links nicht mehr.',
      options: { source: 'title', maxLength: 80 },
      validation: (Rule) => Rule.required().error('Bitte auf „Generieren“ klicken, um die Adresse zu erzeugen.'),
    },
    {
      name: 'bereich',
      title: 'Wo soll das Projekt erscheinen?',
      type: 'string',
      group: 'karte',
      options: { list: BEREICHE, layout: 'radio' },
      initialValue: 'projekte-laufend',
      validation: (Rule) => Rule.required().error('Bitte auswählen, wo das Projekt erscheinen soll.'),
    },
    {
      name: 'kurzbeschreibung',
      title: 'Kurzbeschreibung (für die Karte)',
      type: 'text',
      rows: 3,
      group: 'karte',
      description: 'Ein bis zwei Sätze. Erscheint auf der Übersichtskarte.',
      validation: (Rule) => [
        Rule.required().error('Bitte eine Kurzbeschreibung eingeben.'),
        Rule.max(240).warning('Über 240 Zeichen wird die Karte sehr lang.'),
      ],
    },
    {
      ...bildMitAlt('Titelbild (optional)', 'Erscheint auf der Karte und groß oben auf der Projektseite. Querformat wirkt am besten.'),
      name: 'heroBild',
      group: 'karte',
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      group: 'karte',
      description: 'Kleinere Zahl = weiter vorne. Gleiche Zahlen werden alphabetisch sortiert.',
      initialValue: 10,
    },
    {
      name: 'zitat',
      title: 'Zitat (optional)',
      type: 'text',
      rows: 2,
      group: 'seite',
      description: 'Erscheint unter dem Titel der Projektseite, ohne Anführungszeichen eingeben.',
    },
    { name: 'zitatAutor', title: 'Von wem ist das Zitat? (optional)', type: 'string', group: 'seite' },
    {
      name: 'inhalt',
      title: 'Text der Projektseite',
      type: 'array',
      group: 'seite',
      description: 'Über die Werkzeugleiste: Zwischenüberschrift, Aufzählung, Fett, Kursiv, Link und Bilder. Leer = es wird die Kurzbeschreibung gezeigt.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normaler Text', value: 'normal' },
            { title: 'Zwischenüberschrift', value: 'h3' },
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
                fields: [
                  {
                    name: 'href',
                    title: 'Adresse',
                    type: 'url',
                    description: 'z. B. https://… oder mailto:name@beispiel.de',
                    validation: (Rule) =>
                      Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
                  },
                ],
              },
            ],
          },
        },
        {
          // _type bleibt "image" (kompatibel mit bereits vorhandenen Inhalten)
          ...bildMitAlt('Bild im Text'),
          fields: [
            ...bildMitAlt('').fields,
            { name: 'caption', title: 'Bildunterschrift (optional)', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'ctaText',
      title: 'Überschrift der Abschluss-Box (optional)',
      type: 'string',
      group: 'seite',
      description: 'Standard: „Interesse geweckt?“',
    },
    {
      name: 'ctaLink',
      title: 'Ziel des Buttons in der Abschluss-Box (optional)',
      type: 'string',
      group: 'seite',
      description: 'Standard: Anmeldeformular. Möglich: anmeldung.html, termine.html, https://… oder mailto:name@beispiel.de',
    },
  ],
  orderings: [
    { title: 'Reihenfolge', name: 'reihenfolgeAsc', by: [{ field: 'reihenfolge', direction: 'asc' }, { field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', bereich: 'bereich', media: 'heroBild', slug: 'slug.current' },
    prepare({ title, bereich, media, slug }) {
      return {
        title: title || 'Ohne Titel',
        subtitle: `${BEREICH_KURZ[bereich] || 'Bereich fehlt'}${slug ? '' : ' · Adresse fehlt!'}`,
        media,
      }
    },
  },
}

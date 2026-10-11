// Teammitglied – erscheint auf der Seite „Über uns“.
export default {
  name: 'teamMitglied',
  title: 'Teammitglied',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('Bitte den Namen eingeben.'),
    },
    { name: 'ort', title: 'Ort', type: 'string', description: 'z. B. „München“' },
    { name: 'fach', title: 'Schwerpunkt', type: 'string', description: 'z. B. „Stimme, Präsenz & Bühne“' },
    {
      name: 'foto',
      title: 'Foto',
      type: 'image',
      description: 'Porträtfoto, am besten quadratisch. Ohne Foto erscheinen die Initialen.',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Bildbeschreibung (optional)',
          type: 'string',
          description: 'Standard: „Porträt von [Name]“.',
        },
      ],
    },
    {
      name: 'audio',
      title: 'Hör-Vorstellung als Audiodatei (optional)',
      type: 'file',
      description:
        'So geht’s: mit der Sprachmemo-App am Handy in einem ruhigen Raum 10–20 Sekunden aufnehmen (Handy ca. 20 cm vor dem Mund), Datei hier hochladen. MP3 oder M4A, möglichst unter 2 MB. Wenn leer, liest die Sprachausgabe des Geräts den Vorstellungstext vor.',
      options: { accept: 'audio/*' },
    },
    {
      name: 'intro',
      title: 'Vorstellungstext',
      type: 'text',
      rows: 3,
      description: 'Ein bis zwei Sätze in der Ich-Form. Wird vorgelesen, solange keine Audiodatei hochgeladen ist.',
    },
    {
      name: 'ini',
      title: 'Initialen (optional)',
      type: 'string',
      description: 'Erscheinen, solange kein Foto da ist. Leer = automatisch aus dem Namen.',
      validation: (Rule) => Rule.max(3),
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      description: 'Kleinere Zahl = weiter vorne.',
      initialValue: 10,
    },
  ],
  orderings: [
    { title: 'Reihenfolge', name: 'reihenfolgeAsc', by: [{ field: 'reihenfolge', direction: 'asc' }] },
  ],
  preview: { select: { title: 'name', subtitle: 'ort', media: 'foto' } },
}

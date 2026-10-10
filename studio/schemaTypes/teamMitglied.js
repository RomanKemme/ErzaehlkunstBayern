export default {
  name: 'teamMitglied',
  title: 'Team (Über uns)',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'ort', title: 'Ort', type: 'string' },
    { name: 'fach', title: 'Schwerpunkt', type: 'string', description: 'z. B. „Stimme, Präsenz & Bühne“' },
    { name: 'ini', title: 'Initialen (Platzhalter ohne Foto)', type: 'string', description: 'z. B. „GA“' },
    { name: 'intro', title: 'Audio-Intro-Text', type: 'text', rows: 2, description: 'Kurzer Vorstellungssatz (wird als Demo-Audio vorgelesen)' },
    { name: 'foto', title: 'Foto', type: 'image', description: 'Porträtfoto – am besten quadratisch. Ohne Foto erscheinen die Initialen.' },
    { name: 'reihenfolge', title: 'Reihenfolge', type: 'number', description: 'Kleinere Zahl = weiter vorne', initialValue: 10 },
  ],
  orderings: [
    { title: 'Reihenfolge', name: 'reihenfolgeAsc', by: [{ field: 'reihenfolge', direction: 'asc' }] },
  ],
  preview: { select: { title: 'name', subtitle: 'ort', media: 'foto' } },
};

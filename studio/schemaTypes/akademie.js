// Akademie – Eckdaten der Grundausbildung und die 10 Module (es gibt genau ein Dokument davon).
// Alle Felder sind mit dem aktuellen Stand der Website vorausgefüllt.
// Solange dieses Dokument nicht veröffentlicht ist, zeigt die Website die eingebaute Vorbelegung.
import { MODULE_DEFAULTS } from './akademieDefaults'

const kurz = (name, title, initialValue, description) => ({
  name,
  title,
  type: 'string',
  initialValue,
  description,
})

export default {
  name: 'akademie',
  title: 'Akademie',
  type: 'document',
  groups: [
    { name: 'eckdaten', title: 'Eckdaten', default: true },
    { name: 'module', title: 'Module' },
    { name: 'konditionen', title: 'Konditionen' },
  ],
  fields: [
    { ...kurz('jahrgang', 'Jahrgang', '2027/28', 'z. B. „2027/28“ – erscheint auf Startseite und Akademie-Seite.'), group: 'eckdaten' },
    { ...kurz('startText', 'Ausbildungsstart (ausgeschrieben)', 'Februar 2027', 'z. B. „Februar 2027“ – erscheint im Hinweis oben auf der Startseite.'), group: 'eckdaten' },
    { ...kurz('startKurz', 'Ausbildungsstart (kurz)', 'Feb 2027', 'z. B. „Feb 2027“ – für die Info-Kacheln.'), group: 'eckdaten' },
    { ...kurz('modulUmfang', 'Umfang der Module', 'Module à 16 UE'), group: 'eckdaten' },
    { ...kurz('kurstageKurz', 'Kurstage (kurz)', 'Sa + So'), group: 'eckdaten' },
    { ...kurz('kurszeiten', 'Kurszeiten', '11–18 / 10–17 Uhr', 'Samstag / Sonntag'), group: 'eckdaten' },
    { ...kurz('teilnehmende', 'Teilnehmerzahl', '6–12'), group: 'eckdaten' },
    { ...kurz('kosten', 'Gesamtkosten', '2200 €'), group: 'eckdaten' },
    { ...kurz('kursort', 'Kursort', 'München'), group: 'eckdaten' },
    { ...kurz('schnupperPreis', 'Preis Schnupper-Workshop', '54 €'), group: 'eckdaten' },
    {
      name: 'module',
      title: 'Module der Grundausbildung',
      type: 'array',
      group: 'module',
      description: 'Reihenfolge per Ziehen ändern. Die Nummer (Modul 1, 2, …) ergibt sich automatisch aus der Position.',
      initialValue: MODULE_DEFAULTS,
      of: [
        {
          type: 'object',
          name: 'modul',
          title: 'Modul',
          fields: [
            { name: 'titel', title: 'Titel', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'zeitraum', title: 'Zeitraum', type: 'string', description: 'z. B. „Feb 2027“' },
            { name: 'dozentin', title: 'Dozentin(nen)', type: 'string', description: 'z. B. „Gabi Altenbach, München“' },
            { name: 'inhalt', title: 'Inhalt', type: 'text', rows: 3 },
            { name: 'hinweis', title: 'Kosten / Hinweis', type: 'string', description: 'z. B. „im Ausbildungspreis enthalten“' },
          ],
          preview: {
            select: { title: 'titel', zeitraum: 'zeitraum', dozentin: 'dozentin' },
            prepare: ({ title, zeitraum, dozentin }) => ({
              title: title || 'Ohne Titel',
              subtitle: [zeitraum, dozentin].filter(Boolean).join(' · '),
            }),
          },
        },
      ],
    },
    {
      name: 'nachholerText',
      title: 'Module nachholen',
      type: 'text',
      rows: 3,
      group: 'konditionen',
      initialValue: 'Ehemalige, die noch Module nachholen müssen, zahlen 240 € pro Modul. Für das 10. Modul gewähren wir 50 % Nachlass.',
    },
    {
      name: 'coachingText',
      title: 'Einzelcoaching',
      type: 'text',
      rows: 3,
      group: 'konditionen',
      initialValue: 'Auf Anfrage bieten wir Einzelcoachings an: 150 € / 90 Minuten, jede weitere halbe Stunde 50 €.',
    },
  ],
  preview: { prepare: () => ({ title: 'Akademie – Eckdaten & Module' }) },
}

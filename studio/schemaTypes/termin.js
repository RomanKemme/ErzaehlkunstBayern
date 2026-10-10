// Termin-Schema – entspricht der bisherigen Decap-Struktur
const zeitOptionen = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 10) {
    zeitOptionen.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

export default {
  name: 'termin',
  title: 'Termine',
  type: 'document',
  fields: [
    {
      name: 'cat',
      title: 'Kategorie',
      type: 'string',
      options: {
        list: [
          { title: 'Akademie / Ausbildung', value: 'akademie' },
          { title: 'Offener Treff', value: 'offen' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'datum',
      title: 'Datum',
      type: 'date',
      description: 'Startdatum des Termins – über den Kalender auswählen.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'enddatum',
      title: 'Enddatum (nur bei mehrtägigen Terminen)',
      type: 'date',
      description: 'Leer lassen bei eintägigen Terminen.',
    },
    {
      name: 'zeitVon',
      title: 'Uhrzeit von',
      type: 'string',
      description: 'Leer lassen, falls der Termin keine feste Uhrzeit hat.',
      options: { list: zeitOptionen },
    },
    {
      name: 'zeitBis',
      title: 'Uhrzeit bis',
      type: 'string',
      options: { list: zeitOptionen },
    },
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'desc',
      title: 'Beschreibung',
      type: 'text',
      rows: 3,
    },
    {
      name: 'meta',
      title: 'Ort / Kosten (Anzeigetext)',
      type: 'string',
      description: 'z. B. „Kulturzentrum LUISE, München · 1–5 €“',
    },
    {
      name: 'img',
      title: 'Bild',
      type: 'image',
      description: 'Optional: Eigenes Foto hochladen.',
    },
    {
      name: 'full',
      title: 'Ausgebucht?',
      type: 'boolean',
      initialValue: false,
    },
  ],
  orderings: [
    {
      title: 'Datum aufsteigend',
      name: 'datumAsc',
      by: [{ field: 'datum', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'datum' },
  },
};

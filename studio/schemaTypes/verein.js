// Verein & Rechtliches – Kontakt, Bankverbindung, Impressum und Datenschutz (genau ein Dokument).
const richtext = {
  type: 'array',
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
                validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
              },
            ],
          },
        ],
      },
    },
  ],
}

export default {
  name: 'verein',
  title: 'Verein & Rechtliches',
  type: 'document',
  groups: [
    { name: 'kontakt', title: 'Kontakt & Spenden', default: true },
    { name: 'recht', title: 'Impressum & Datenschutz' },
  ],
  fields: [
    {
      name: 'kontaktEmail',
      title: 'Kontakt-E-Mail',
      type: 'string',
      group: 'kontakt',
      description: 'Erscheint in der Fußzeile und als Ausweichadresse, falls das Formular nicht funktioniert.',
      validation: (Rule) =>
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, { name: 'E-Mail' }).error('Bitte eine gültige E-Mail-Adresse eingeben.'),
    },
    { name: 'bank', title: 'Bank (Spendenkonto)', type: 'string', group: 'kontakt', initialValue: 'Stadtsparkasse München' },
    {
      name: 'iban',
      title: 'IBAN (Spendenkonto)',
      type: 'string',
      group: 'kontakt',
      initialValue: 'DE03 7015 0000 1006 4878 29',
      validation: (Rule) =>
        Rule.custom((v) => (!v || /^[A-Z]{2}\d{2}[ A-Z0-9]{10,40}$/.test(v.trim()) ? true : 'Das sieht nicht wie eine IBAN aus.')),
    },
    {
      ...richtext,
      name: 'impressum',
      title: 'Impressum',
      group: 'recht',
      description: 'Pflichtangaben: Name und Anschrift des Vereins, vertretungsberechtigter Vorstand, Registergericht und -nummer, Kontakt. Leer = Vorlage mit Platzhaltern wird angezeigt.',
    },
    {
      ...richtext,
      name: 'datenschutz',
      title: 'Datenschutzerklärung',
      group: 'recht',
      description: 'Leer = die technische Vorlage von der Website wird angezeigt (vor Veröffentlichung prüfen lassen).',
    },
  ],
  preview: { prepare: () => ({ title: 'Verein & Rechtliches' }) },
}

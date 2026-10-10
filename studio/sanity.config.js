import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { deDELocale } from '@sanity/locale-de-de'
import { schemaTypes, SINGLETONS } from './schemaTypes'
import { structure } from './structure'

const singletonTypes = new Set(Object.keys(SINGLETONS))
// Bei Einzeldokumenten nur Veröffentlichen/Verwerfen erlauben – kein Löschen oder Duplizieren
const singletonActions = new Set(['publish', 'discardChanges', 'restore', 'unpublish'])

export default defineConfig({
  name: 'default',
  title: 'Erzählkunst Bayern – Redaktion',

  projectId: 'o1wd66uu',
  dataset: 'production',

  plugins: [structureTool({ structure, title: 'Inhalte' }), deDELocale()],

  schema: {
    types: schemaTypes,
    // Vorlagen der Einzeldokumente bleiben erhalten (sie liefern die Vorbelegung),
    // sie werden nur im „Erstellen“-Menü ausgeblendet (newDocumentOptions unten).
    templates: (templates) => [
      ...templates,
      {
        id: 'projekt-bereich',
        title: 'Projekt in diesem Bereich',
        schemaType: 'projekt',
        parameters: [{ name: 'bereich', type: 'string' }],
        value: ({ bereich }) => ({ bereich, reihenfolge: 10 }),
      },
    ],
  },

  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      prev.filter((item) => !singletonTypes.has(item.templateId) && item.templateId !== 'projekt-bereich'),
    actions: (prev, { schemaType }) =>
      singletonTypes.has(schemaType) ? prev.filter(({ action }) => action && singletonActions.has(action)) : prev,
  },
})

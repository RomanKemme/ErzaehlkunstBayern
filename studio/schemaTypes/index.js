import termin from './termin'
import projekt from './projekt'
import teamMitglied from './teamMitglied'
import akademie from './akademie'
import seiten from './seiten'
import verein from './verein'

export const schemaTypes = [termin, projekt, teamMitglied, akademie, seiten, verein]

// Dokumente, die es genau einmal gibt (feste ID, kein „Neu anlegen“, kein Löschen)
export const SINGLETONS = {
  akademie: 'akademie',
  seiten: 'seiten',
  verein: 'verein',
}

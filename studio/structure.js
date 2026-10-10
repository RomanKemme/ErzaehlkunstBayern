// Menüstruktur des Redaktionssystems (linke Spalte im Studio)
import { CalendarIcon } from '@sanity/icons/Calendar'
import { ProjectsIcon } from '@sanity/icons/Projects'
import { UsersIcon } from '@sanity/icons/Users'
import { BookIcon } from '@sanity/icons/Book'
import { ImagesIcon } from '@sanity/icons/Images'
import { HomeIcon } from '@sanity/icons/Home'

const API = '2024-01-01'

function heute() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const einzelDokument = (S, { id, type, title, icon }) =>
  S.listItem().id(id).title(title).icon(icon).child(S.document().schemaType(type).documentId(id).title(title))

export const structure = (S) =>
  S.list()
    .title('Inhalte')
    .items([
      S.listItem()
        .id('termine')
        .title('Termine')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Termine')
            .items([
              S.listItem()
                .id('termine-kommend')
                .title('Kommende Termine')
                .icon(CalendarIcon)
                .child(
                  S.documentList()
                    .id('termine-kommend-liste')
                    .apiVersion(API)
                    .title('Kommende Termine')
                    .schemaType('termin')
                    .filter('_type == "termin" && coalesce(enddatum, datum) >= $heute')
                    .params({ heute: heute() })
                    .defaultOrdering([{ field: 'datum', direction: 'asc' }])
                    .initialValueTemplates([S.initialValueTemplateItem('termin')]),
                ),
              S.listItem()
                .id('termine-vergangen')
                .title('Vergangene Termine (nicht mehr sichtbar)')
                .icon(CalendarIcon)
                .child(
                  S.documentList()
                    .id('termine-vergangen-liste')
                    .apiVersion(API)
                    .title('Vergangene Termine')
                    .schemaType('termin')
                    .filter('_type == "termin" && coalesce(enddatum, datum) < $heute')
                    .params({ heute: heute() })
                    .defaultOrdering([{ field: 'datum', direction: 'desc' }]),
                ),
              S.listItem()
                .id('termine-ohne-datum')
                .title('Termine ohne Datum (Entwürfe)')
                .icon(CalendarIcon)
                .child(
                  S.documentList()
                    .id('termine-ohne-datum-liste')
                    .apiVersion(API)
                    .title('Termine ohne Datum')
                    .schemaType('termin')
                    .filter('_type == "termin" && !defined(datum)'),
                ),
            ]),
        ),
      S.listItem()
        .id('projekte')
        .title('Projekte')
        .icon(ProjectsIcon)
        .child(
          S.list()
            .title('Projekte')
            .items(
              [
                ['projekte-laufend', 'Laufende Projekte'],
                ['projekte-abgeschlossen', 'Abgeschlossene Projekte'],
                ['akademie', 'Vertiefungsangebote der Akademie'],
              ].map(([wert, titel]) =>
                S.listItem()
                  .id(`projekte-${wert}`)
                  .title(titel)
                  .icon(ProjectsIcon)
                  .child(
                    S.documentList()
                      .id(`projekte-${wert}-liste`)
                      .apiVersion(API)
                      .title(titel)
                      .schemaType('projekt')
                      .filter('_type == "projekt" && bereich == $bereich')
                      .params({ bereich: wert })
                      .defaultOrdering([{ field: 'reihenfolge', direction: 'asc' }])
                      .initialValueTemplates([S.initialValueTemplateItem('projekt-bereich', { bereich: wert })]),
                  ),
              ),
            ),
        ),
      S.listItem()
        .id('team')
        .title('Team (Über uns)')
        .icon(UsersIcon)
        .child(
          S.documentTypeList('teamMitglied')
            .title('Team')
            .defaultOrdering([{ field: 'reihenfolge', direction: 'asc' }]),
        ),
      S.divider(),
      einzelDokument(S, { id: 'akademie', type: 'akademie', title: 'Akademie (Eckdaten & Module)', icon: BookIcon }),
      einzelDokument(S, { id: 'seiten', type: 'seiten', title: 'Seitenbilder & Impressionen', icon: ImagesIcon }),
      einzelDokument(S, { id: 'verein', type: 'verein', title: 'Verein & Rechtliches', icon: HomeIcon }),
    ])

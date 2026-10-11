# Inhaltsmodell in Sanity

Sechs Inhaltstypen, alle mit deutschen Feldnamen, Hilfetexten und Prüfregeln (Sanity-Projekt `o1wd66uu`, Dataset `production`). Bestehende Inhalte bleiben kompatibel: Feldnamen wurden nicht umbenannt, nur ergänzt.

| Typ | Anzahl | Wichtige Felder | Prüfregeln | Erscheint auf |
| --- | --- | --- | --- | --- |
| `termin` | beliebig | Titel, Kategorie, Datum, Enddatum, Uhrzeit von/bis, Beschreibung, Ort & Kosten, Schnupper?, Ausgebucht?, Bild | Titel/Kategorie/Datum Pflicht; Enddatum ≥ Datum; „bis“ > „von“; Titel ≤ 80, Beschreibung ≤ 300 Zeichen (Warnung) | Termine, Startseite (nächste 3), Formular, Akademie (Schnupper) |
| `projekt` | beliebig | Titel, Internetadresse (Slug), Bereich, Kurzbeschreibung, Titelbild + Bildbeschreibung, Reihenfolge, Zitat, Seitentext (Rich-Text mit Bildern; Links per Auswahlliste auf eigene Seiten oder freie Adresse), Abschluss-Button (Ziel per Auswahlliste, „Andere Adresse“ optional) | Titel, Adresse, Bereich, Kurzbeschreibung Pflicht; Links nur http(s)/mailto/tel | Projekte (laufend/abgeschlossen), Akademie (Vertiefung), Detailseite |
| `teamMitglied` | beliebig | Name, Ort, Schwerpunkt, Foto + Beschreibung, Audiodatei, Vorstellungstext, Initialen, Reihenfolge | Name Pflicht; Initialen ≤ 3 | Über uns |
| `akademie` | genau 1 | Jahrgang, Start (lang/kurz), Umfang, Kurstage/-zeiten, Teilnehmende, Kosten, Kursort, Schnupper-Preis, Module (Liste), Nachholer-/Coaching-Text | Modul-Titel Pflicht; vorausgefüllt mit aktuellem Stand | Startseite, Akademie |
| `seiten` | genau 1 | Titelbild Startseite/„Über uns“ + Ausschnitt, Impressionen (Bild, Unterschrift) | – (Einträge ohne Foto erscheinen als Textkachel) | Startseite, Über uns |
| `verein` | genau 1 | Kontakt-E-Mail, Bank, IBAN, Impressum, Datenschutz (Rich-Text) | E-Mail- und IBAN-Format | Fußzeile, Anmeldung, Impressum, Datenschutz |

**Studio-Struktur (linke Spalte):** Termine (Kommende · Vergangene · ohne Datum) → Projekte (Laufend · Abgeschlossen · Akademie) → Team → Akademie → Seitenbilder & Impressionen → Verein & Rechtliches. Neue Projekte erhalten den Bereich der Liste, aus der sie angelegt werden. Einzeldokumente lassen sich nicht löschen oder doppelt anlegen. Oberfläche auf Deutsch (`@sanity/locale-de-de`), das Entwickler-Werkzeug „Vision“ ist ausgeblendet.

---
Teil der [technischen Dokumentation](README.md) · Stand: 11.10.2026

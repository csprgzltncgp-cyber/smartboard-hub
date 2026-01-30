# Memory: features/companies/company-group-name
Updated: 2026-01-30

Ha a cég több országban jelen van és az 'Országonként különböző' alapadatok mód (`basic_data = true`) aktív, megjelenik egy **"Cégcsoport neve"** mező az Alapadatok fülön. Ez a mező határozza meg, milyen névvel jelenik meg a cég a Cégek listában.

## Működés
- A mező CSAK akkor látható, ha `countryDifferentiates.basic_data = true`
- Ha nincs kitöltve, a rendszer más logikát alkalmaz a megjelenítésre
- Az adatbázisban a `companies.group_name` oszlopban tárolódik

## Technikai részletek
- `Company` interfész tartalmazza a `group_name: string | null` mezőt
- `MultiCountryBasicDataPanel` komponens megjeleníti a mezőt
- Az adatok az `useCompaniesDb` hook-on keresztül kerülnek mentésre

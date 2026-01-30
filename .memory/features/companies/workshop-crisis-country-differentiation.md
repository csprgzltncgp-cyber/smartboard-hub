# Memory: features/companies/workshop-crisis-country-differentiation
Updated: 2026-01-30

A "Workshop és Krízisintervenció beállítások" szekció támogatja az országonkénti eltérést. 

## Működés

### Több ország esetén
- A MultiCountryBasicDataPanel-en megjelenik egy "Országonként különböző" toggle a Workshop/Krízis szekcióban
- Ha **kikapcsolva**: a workshop/krízis adatok globálisan az Alapadatok panelen szerkeszthetők
- Ha **bekapcsolva**: 
  - Az Alapadatok panelen csak egy infó üzenet jelenik meg, hogy az adatok az Országok fülön szerkeszthetők
  - Az Országok fülön minden ország-kártyán belül megjelenik a teljes Workshop/Krízis szekció

### Technikai részletek
- `CountryDifferentiate` interfész tartalmazza: `workshop_crisis: boolean`
- Ha `basic_data = true`, a workshop szekció automatikusan az országos szinten jelenik meg (nincs külön toggle szükséges)
- `CompanyCountrySettingsPanel` - Workshop szekció feltételes megjelenítése: `(workshop_crisis || basic_data)`
- `MultiCountryBasicDataPanel` - `WorkshopCrisisSection` belső komponens kezeli a toggle-t és a szekciókat

## Komponensek
- `MultiCountryBasicDataPanel.tsx` - `WorkshopCrisisSection` komponens
- `CompanyCountrySettingsPanel.tsx` - Országos workshop szekció feltételes megjelenítése
- `SingleCountryBasicDataPanel.tsx` - Egy országos cégeknél mindig a panelen belül jelenik meg

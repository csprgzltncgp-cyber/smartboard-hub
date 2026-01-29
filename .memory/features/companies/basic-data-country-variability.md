# Memory: features/companies/basic-data-country-variability
Updated: 2026-01-29

Több országos cégek esetén az Alapadatok (Basic Data) támogatják az országonkénti eltérést. Az **Alapadatok panelen** található egy 'Alapadatok országonként különbözőek' checkbox, amely:

1. **Csak több ország esetén jelenik meg** (countryIds.length > 1)
2. **Ha bekapcsolják és van meglévő adat** → MigrateBasicDataDialog dialog jelenik meg:
   - Megkérdezi, melyik ország alá kerüljön a meglévő adat (egy közös ország választó)
   - **FONTOS**: A számlázási adatok is ugyanabba az országba kerülnek, mint az alapadatok
3. **Ha aktív** → A számlázás is automatikusan "Országonként különböző" lesz (invoicing: true)

## Szabály
Ha `basic_data = true`, akkor `invoicing = true` is kötelező. Az alapadatok és a számlázás mindig együtt mozog országonként.

## Komponensek
- `MultiCountryBasicDataPanel.tsx` - Tartalmazza a checkbox-ot és a dialog kezelést
- `MigrateBasicDataDialog.tsx` - Egyszerűsített dialog: egy ország választó mindkét adattípushoz

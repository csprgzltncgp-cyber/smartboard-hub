# Memory: features/companies/basic-data-country-variability
Updated: 2026-01-29

Több országos cégek esetén az Alapadatok (Basic Data) támogatják az országonkénti eltérést. Az **Alapadatok panelen** (nem az Országok fülön!) található egy 'Alapadatok országonként különbözőek' toggle, amely:

1. **Csak több ország esetén jelenik meg** (countryIds.length > 1)
2. **Ha bekapcsolják és van meglévő adat** → MigrateBasicDataDialog dialog jelenik meg:
   - Megkérdezi, melyik ország alá kerüljön a meglévő Alapadatok
   - Megkérdezi, melyik ország alá kerüljön a meglévő Számlázás (ha van)
3. **Ha aktív** → Az Alapadatok panelen egy tájékoztató szöveg jelenik meg, és az Országok fülön belül minden ország-csíkon megjelenik a teljes szerződési adatok szekció

Ez a funkció azt a helyzetet kezeli, amikor pl. egy cég (Henkel Hungary) bővül egy másik országba (Csehország), de az ottani szerződést már egy másik jogi entitás (Henkel Czech Ltd.) köti meg.

## Komponensek
- `MultiCountryBasicDataPanel.tsx` - Tartalmazza a toggle-t és a dialog kezelést
- `MigrateBasicDataDialog.tsx` - Dialog a meglévő adatok ország alá rendeléséhez
- `CompanyCountrySettingsPanel.tsx` - Az Országok fülön jeleníti meg az ország-specifikus adatokat

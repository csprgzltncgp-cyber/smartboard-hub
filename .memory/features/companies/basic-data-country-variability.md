# Memory: features/companies/basic-data-country-variability
Updated: 2026-01-29

Több országos cégek esetén az Alapadatok (Basic Data) támogatják az országonkénti eltérést. Az Országok fülön található egy 'Alapadatok országonként különbözőek' toggle, amely ha aktív:

1. Minden országhoz egyedi szerződési adatok adhatók meg:
   - Szerződéshordozó
   - Szerződéses ár, típus (PEPM/Csomagár), devizanem
   - Pillér és Alkalom számok
   - Iparág
   - Szerződés dátumok (CGP esetén)
   - ORG ID (Lifeworks esetén)

2. Az ország-csíkokon (CountrySettingsCard) belül egy teljes "Szerződés adatai" szekció jelenik meg

Ez a funkció azt a helyzetet kezeli, amikor pl. egy cég (Henkel Hungary) bővül egy másik országba (Csehország), de az ottani szerződést már egy másik jogi entitás (Henkel Czech Ltd.) köti meg.

A `CountryDifferentiate` interfész új `basic_data` mezővel bővült (`src/types/company.ts`).
A `CompanyCountrySettings` interfész tartalmazza az összes szerződési mezőt országonként.

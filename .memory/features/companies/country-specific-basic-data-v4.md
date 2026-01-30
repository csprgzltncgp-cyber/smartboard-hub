# Memory: features/companies/country-specific-basic-data-v4
Updated: 2026-01-30

Több országos cégek esetén az Alapadatok (Basic Data) panelen az 'Országonkénti alapadatok' (Globe ikonnal jelölt) kapcsoló teszi lehetővé az országonkénti eltérést. 

## Működés

### Bekapcsoláskor
1. **Ha van kitöltött adat** (Cégnév, Dispatch name, szerződési adatok, stb.) az Alapadatok panelen:
   - Megjelenik a **MigrateBasicDataDialog** → „Melyik országba kerüljenek az adatok?"
   - A felhasználó kiválasztja a célországot
   - **MINDEN** meglévő adat (name, dispatch_name, active, contract adatok, stb.) átmásolódik a kiválasztott ország CompanyCountrySettings-ébe
   
2. **Ha nincs kitöltött adat** (új cég, üres mezők):
   - Nincs dialógus, egyszerűen bekapcsol az opció

### Kritikus üzleti szabály
Ha az alapadatok országonként különböznek (`basic_data = true`), a számlázás is kötelezően országonkénti lesz (`invoicing = true`).

### Aktív állapotban (`basic_data = true`)
- Az **Alapadatok fülön**:
  - Minden mező el van rejtve (Cégnév, Dispatch name, Aktív, Szerződés panel, stb.)
  - Csak az „Országonként különböző" toggle és egy infószöveg látható
  - A Mentés gomb is el van rejtve
  
- Az **Országok fülön** (minden ország-kártyán belül):
  - Megjelenik a **„Több entitás" toggle** (Building2 ikon)
  - Megjelenik a **teljes Alapadatok form**:
    - Cégnév
    - Cég elnevezése kiközvetítéshez (Dispatch name)
    - Aktív státusz
    - Szerződéshordozó
    - Szerződés (PDF) feltöltés
    - Szerződéses ár + Ár típusa + Devizanem
    - Árváltozás rögzítése / előzmények
    - Pillér, Alkalom, Iparág
    - Tanácsadás beállítások (ConsultationRows)
    - Szerződés kezdete és lejárta (CGP esetén)
    - Emlékeztető e-mail (CGP esetén)
    - ORG ID (Lifeworks esetén)
  - Minden ország saját, független adatokat kezelhet

### Toggle-k elrejtése
Ha a `basic_data` opció aktív, az alábbi mezőknél **NEM jelenik meg** az "Országonként különböző" kapcsoló (mert már eleve különbözőek):
- Szerződéshordozó
- Szerződés kezdete/lejárta
- Emlékeztető e-mail

## Technikai részletek
- `CompanyCountrySettings` interfész tartalmazza: `name`, `dispatch_name`, `is_active`, `contract_file_url`, `contract_price`, `contract_price_type`, `contract_currency`, `pillar_count`, `session_count`, `consultation_rows`, `industry`, `price_history` mezőket
- `hasBasicData` ellenőrzés tartalmazza a `name` és `dispatchName` mezőket is
- Migráció során minden mező (beleértve name, dispatch_name, is_active) átkerül a kiválasztott országba
- `CountryContractDataSection` komponens kezeli a teljes szerződési form-ot az ország panelen belül

## Komponensek
- `MultiCountryBasicDataPanel.tsx` - Tartalmazza a toggle-t és a migrációs dialógust
- `MigrateBasicDataDialog.tsx` - Országválasztó dialógus
- `CompanyCountrySettingsPanel.tsx` / `CountrySettingsCard` - Ország-specifikus mezők megjelenítése
- `CountryContractDataSection` - Teljes szerződési adatok form az ország panelen belül

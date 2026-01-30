# Memory: features/companies/contracted-entities-v3
Updated: 2026-01-30

## Szerződött Entitások (Contracted Entities) - v3

A rendszer támogatja a Szerződött entitások kezelését a Company -> Country -> Entity hierarchiában, lehetővé téve több önálló jogi egység rögzítését egy országon belül.

### Toggle állapot számítása (KRITIKUS)

A "Több entitás" toggle állapota NEM külön tárolt, hanem az **entitások számából van származtatva**:
- `hasMultipleEntities = entities.filter(e => e.country_id === countryId).length > 1`
- Ez biztosítja, hogy a toggle mindig szinkronban legyen az adatokkal, még fülváltás után is

### Logika többországos módban

1. **"Több entitás" opció előfeltétele**: A "Több entitás" funkció CSAK akkor érhető el, ha az **"Alapadatok országonként különbözőek"** opció be van kapcsolva.
2. **Ország-szintű beállítás**: A "Több entitás" toggle az egyes országok beállítási paneljén (Országok fül -> ország csík kinyitása) jelenik meg.
3. **entity_country_ids**: Nyilvántartja, mely országokban volt aktiválva (de a toggle állapot az entitásokból jön).
4. **Automatikus migráció**: Bekapcsoláskor 2 entitás jön létre - az első örökli az ország beállításainak minden adatát (név, ár, dátumok, stb.)

### Egyországos mód (SingleCountryBasicDataPanel)
- Ország kiválasztó kiemelt panelben (teal színű keret)
- Alatta "Több entitás" toggle a szerződött entitások aktiválásához
- A toggle állapota a `singleCountryHasMultipleEntities` useMemo-ból jön (entitások száma > 1)
- Aktiváláskor 2 entitás jön létre automatikusan (első örökli a meglévő adatokat)
- Füles navigáció az entitások között
- Minden entitás teljes értékű adatokkal (név, dispatch_name, ár, dátumok, stb.)

### Többországos mód (MultiCountryBasicDataPanel + CompanyCountrySettingsPanel)
- Országok kiválasztó kiemelt panelben (Globe ikon, teal keret)
- "Alapadatok országonként különbözőek" toggle (Globe ikon) - ez a feltétele a több entitás funkciónak
- Ha basic_data aktív: az Országok fülön, az egyes ország csíkokon belül megjelenik a "Több entitás" toggle
- Az `isEntityModeEnabled(countryId)` az entitások számából számolja az állapotot
- CountrySettingsCard komponens tartalmazza az EntitySection-t

### Komponensek
- `CompanyCountrySettingsPanel` - Ország-specifikus beállítások a Countries fülön
- `CountrySettingsCard` - Egyetlen ország összecsukható kártyája, tartalmazza a Több entitás toggle-t és az EntitySection-t
- `EntitySection` - Entitás kezelő (fülek, hozzáadás) egy adott országon belül
- `EntityDataForm` - **TELJES** entitás űrlap (Cégnév, Dispatch name, Aktív, Szerződéshordozó, Ár, Pillér, Alkalom, Consultation rows, Price history, Szerződés dátumok, ORG ID, Létszám, Client Dashboard felhasználók)
- `SingleCountryBasicDataPanel.renderEntityContent()` - Egyországos entitás megjelenítés

### Entity adatok
Minden entitás tartalmazza:
- `name` - Entitás neve (cégnév)
- `dispatch_name` - Kiközvetítéshez használt név
- `is_active` - Aktív státusz
- `contract_holder_type` - Szerződéshordozó
- `contract_price`, `price_type`, `contract_currency` - Ár adatok
- `contract_date`, `contract_end_date`, `contract_reminder_email` - Szerződés dátumok
- `org_id`, `headcount`, `industry` - Egyéb adatok
- `pillars`, `occasions` - Pillér és alkalom számok
- `consultation_rows`, `price_history` - JSON struktúrák
- `client_dashboard_users` - CD felhasználók listája

### Automatikus entitás létrehozás
Amikor a "Több entitás" toggle bekapcsol egy országnál:
1. Ha még nincs entitás, 2 entitás jön létre automatikusan
2. Az első entitás örökli az ország CompanyCountrySettings adatait (név, ár, dátumok, stb.)
3. A második entitás üres, alapértelmezett értékekkel

### Kikapcsolás korlátozása
- **Több entitás toggle**: A "Több entitás" toggle kikapcsolása csak akkor lehetséges, ha az adott országban legfeljebb 1 entitás maradt. Ha több entitás van, a toggle disabled állapotban van és egy figyelmeztetés jelenik meg: "Entitások törlése szükséges a kikapcsoláshoz".
- **Országonkénti alapadatok toggle**: Az "Országonként különböző" toggle (basic_data) kikapcsolása szintén nem engedélyezett, ha bármelyik országban több mint 1 entitás van. Ez azért fontos, mert a basic_data mód a feltétele a több entitás funkciónak többországos cégeknél.

Ez biztosítja, hogy a felhasználó ne veszítse el az entitás-adatokat véletlenül.

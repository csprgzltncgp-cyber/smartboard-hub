# Memory: features/companies/contracted-entities-v3
Updated: 2026-01-30

## Szerződött Entitások (Contracted Entities) - v3

A rendszer támogatja a Szerződött entitások kezelését a Company -> Country -> Entity hierarchiában, lehetővé téve több önálló jogi egység rögzítését egy országon belül.

### Egyországos mód (SingleCountryBasicDataPanel)
- Ország kiválasztó kiemelt panelben (teal színű keret)
- Alatta "Több entitás" toggle a szerződött entitások aktiválásához
- Aktiváláskor 2 entitás jön létre automatikusan (első örökli a meglévő adatokat)
- Füles navigáció az entitások között
- Minden entitás teljes értékű adatokkal (név, dispatch_name, ár, dátumok, stb.)

### Többországos mód (MultiCountryBasicDataPanel + CompanyCountrySettingsPanel)
- Országok kiválasztó kiemelt panelben (Globe ikon, teal keret)
- Alatta "Több entitás" toggle (Building2 ikon)
- Ha aktív: az Országok fülön, az egyes ország csíkokon belül entitás fülek jelennek meg
- CountrySettingsCard komponens tartalmazza az EntitySection-t
- Minden ország saját entitás listával rendelkezik

### Komponensek
- `EntitySection` - Ország-specifikus entitás kezelő az CompanyCountrySettingsPanel-ben
- `EntityDataForm` - Entitás űrlap a többországos módban
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
- `consultation_rows`, `price_history` - JSON struktúrák
- `client_dashboard_users` - CD felhasználók listája

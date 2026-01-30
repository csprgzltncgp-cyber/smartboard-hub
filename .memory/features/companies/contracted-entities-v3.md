# Memory: features/companies/contracted-entities-v3
Updated: 2026-01-30

## Szerződött Entitások (Contracted Entities) - v3

A rendszer támogatja a Szerződött entitások kezelését a Company -> Country -> Entity hierarchiában, lehetővé téve több önálló jogi egység rögzítését egy országon belül.

### Logika többországos módban

1. **"Több entitás" opció előfeltétele**: A "Több entitás" funkció CSAK akkor érhető el, ha az **"Alapadatok országonként különbözőek"** opció be van kapcsolva.
2. **Ország-szintű beállítás**: A "Több entitás" toggle az egyes országok beállítási paneljén (Országok fül -> ország csík kinyitása) jelenik meg.
3. **entity_country_ids**: Nyilvántartja, mely országokban van több entitás mód aktiválva.

### Egyországos mód (SingleCountryBasicDataPanel)
- Ország kiválasztó kiemelt panelben (teal színű keret)
- Alatta "Több entitás" toggle a szerződött entitások aktiválásához
- Aktiváláskor 2 entitás jön létre automatikusan (első örökli a meglévő adatokat)
- Füles navigáció az entitások között
- Minden entitás teljes értékű adatokkal (név, dispatch_name, ár, dátumok, stb.)

### Többországos mód (MultiCountryBasicDataPanel + CompanyCountrySettingsPanel)
- Országok kiválasztó kiemelt panelben (Globe ikon, teal keret)
- "Alapadatok országonként különbözőek" toggle (Globe ikon) - ez a feltétele a több entitás funkciónak
- Ha basic_data aktív: az Országok fülön, az egyes ország csíkokon belül megjelenik a "Több entitás" toggle
- Ha egy országnál a "Több entitás" be van kapcsolva, entitás fülek jelennek meg
- CountrySettingsCard komponens tartalmazza az EntitySection-t

### Komponensek
- `CompanyCountrySettingsPanel` - Ország-specifikus beállítások a Countries fülön
- `CountrySettingsCard` - Egyetlen ország összecsukható kártyája, tartalmazza a Több entitás toggle-t és az EntitySection-t
- `EntitySection` - Entitás kezelő (fülek, hozzáadás) egy adott országon belül
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

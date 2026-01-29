# Memory: features/companies/contracted-entities-v1
Updated: 2026-01-29

## Szerződött Entitások (Contracted Entities)

A cégek (Companies) modulban új hierarchia szint került bevezetésre: **Szerződött Entitások**. Ez lehetővé teszi, hogy egy cégen belül, egy országon belül több jogi személlyel is szerződést kössenek, mindegyikhez külön alapadatokkal és számlázással.

### Hierarchia

```
Company (Cég)
└── Country (Ország)
    └── Contracted Entity (Szerződött Entitás)
        ├── Alapadatok (ORG ID, szerződés dátumok, ár, stb.)
        ├── Számlázási adatok
        └── Számla sablonok
```

### Adatbázis struktúra

Új tábla: `company_contracted_entities`
- Tartalmazza az összes szerződéses és országspecifikus adatot
- Kapcsolódik: `company_id`, `country_id`
- JSON mezők: `consultation_rows`, `price_history`, `workshop_data`, `crisis_data`, `reporting_data`

Módosított táblák:
- `company_billing_data` - új `contracted_entity_id` FK
- `company_invoice_templates` - új `contracted_entity_id` FK
- `company_invoice_items` - új `contracted_entity_id` FK
- `company_invoice_comments` - új `contracted_entity_id` FK
- `company_country_differentiates` - új `has_multiple_entities` boolean

### UI megjelenés

1. **Egy ország, egy entitás**: Egyszerű nézet (mai állapot) - entitás panel rejtett
2. **Egy ország, több entitás bekapcsolva**: EntityListPanel látható, entitások listázhatók
3. **Több ország, vegyes**: Minden országnál saját EntityListPanel

Az entitás funkció OPCIONÁLIS minden cég esetében. A "Több entitás" toggle-val aktiválható bármely cégprofil esetén (akár 1, akár több országos).

### Komponensek

- `EntityListPanel` - Fő panel az entitások listázásához, toggle-val
- `EntityFormDialog` - Entitás hozzáadás/szerkesztés dialógus
- Hook: `useContractedEntities(companyId?)` - CRUD műveletek, auto-fetch

### Típusok

- `ContractedEntity` - fő entitás interfész (`src/types/contracted-entity.ts`)
- `CountryEntities` - országonkénti csoportosítás UI-hoz

### Fontos szabályok

1. Az entitás funkció opcionális, minden cég esetében elérhető
2. Minden entitáshoz saját számlázási adatok tartozhatnak
3. Az entitás neve szabadon megadható (pl. "Henkel Hungary Kft.")
4. Migráció: meglévő `company_country_settings` adatok átvihetők entitásba

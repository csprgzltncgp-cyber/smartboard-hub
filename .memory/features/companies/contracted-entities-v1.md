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

1. **Egy ország, egy entitás**: Marad az egyszerű nézet (mai állapot)
2. **Egy ország, több entitás**: Alapadatok panelen belül entitás lista
3. **Több ország, vegyes**: Országok fülön, minden országnál entitás lista

### Típusok

- `ContractedEntity` - fő entitás interfész (`src/types/contracted-entity.ts`)
- `CountryEntities` - országonkénti csoportosítás UI-hoz
- Hook: `useContractedEntities` - CRUD műveletek

### Fontos szabályok

1. Ha egy országban nincs entitás, a rendszer automatikusan létrehoz egyet
2. Minden entitáshoz saját számlázási adatok tartoznak
3. Az entitás neve szabadon megadható (pl. "Henkel Hungary Kft.")
4. Migráció: meglévő `company_country_settings` adatok átvihetők entitásba

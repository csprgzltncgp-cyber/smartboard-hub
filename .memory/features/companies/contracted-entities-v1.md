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
        ├── Szerződés adatai (ContractDataPanel - teljes)
        ├── Workshop és Krízis adatok
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

Az entitás funkció OPCIONÁLIS minden cég esetében. A "Több entitás" toggle-val aktiválható.

**Aktiválás után:**
- Füles (Tabs) navigáció jelenik meg az entitások között
- Minden entitás fül egy teljes értékű Alapadatok panelt tartalmaz
- "+ Új entitás" gomb a fülek mellett
- Entitás törölhető (ha több mint 1 van)

**Komponensek:**
- `EntityTabsPanel` - Fő panel füles navigációval
- `EntityDataPanel` - Teljes értékű alapadat panel minden entitáshoz
- `EntityFormDialog` - Legacy, már nem használt
- Hook: `useContractedEntities(companyId?)` - CRUD műveletek, auto-fetch

### Típusok

- `ContractedEntity` - fő entitás interfész (`src/types/contracted-entity.ts`)
- `CountryEntities` - országonkénti csoportosítás UI-hoz
- `WorkshopData`, `CrisisData` - JSON struktúrák

### Fontos szabályok

1. Az entitás funkció opcionális, minden cég esetében elérhető
2. Minden entitáshoz teljes szerződési adatok tartoznak (ContractDataPanel)
3. Minden entitáshoz saját számlázási adatok tartozhatnak
4. Az entitás neve szabadon megadható (pl. "Henkel Hungary Kft.")
5. Migráció: meglévő `company_country_settings` adatok átvihetők entitásba

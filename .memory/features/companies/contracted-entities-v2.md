# Memory: features/companies/contracted-entities-v2
Updated: 2026-01-30

## Szerződött Entitások (Contracted Entities) - v2

A cégek (Companies) modulban a **Szerződött Entitások** funkció lehetővé teszi, hogy egy cégen belül, egy országon belül több jogi személlyel is szerződést kössenek, mindegyikhez **TELJES** saját adatokkal.

### Hierarchia

```
Company (Cég)
└── Country (Ország) - KIEMELT, nem módosítható entity módban
    └── Contracted Entity (Szerződött Entitás) - ÖNÁLLÓ jogi személy
        ├── Entitás neve
        ├── Cég elnevezése kiközvetítéshez (dispatch_name)
        ├── Aktív státusz (is_active)
        ├── Szerződés adatai (ContractDataPanel - teljes)
        ├── ORG ID, Szerződés dátumok
        ├── Emlékeztető e-mail (contract_reminder_email)
        ├── Létszám
        ├── Workshop és Krízis adatok
        ├── Client Dashboard felhasználók (client_dashboard_users JSON)
        ├── Számlázási adatok
        └── Számla sablonok
```

### Adatbázis struktúra

**Tábla: `company_contracted_entities`**
- Tartalmazza AZ ÖSSZES szerződéses és entitás-specifikus adatot
- Új mezők (v2):
  - `dispatch_name` TEXT - Cég elnevezése kiközvetítéshez
  - `is_active` BOOLEAN DEFAULT true - Az entitás aktív-e
  - `contract_reminder_email` TEXT - Emlékeztető e-mail
  - `client_dashboard_users` JSONB DEFAULT '[]' - CD felhasználók

### UI struktúra

**1. Ország panel (KIEMELT)**
- Mindig a panel tetején
- Entity módban **readonly** (nem szerkeszthető)
- Jelzi, hogy az ország választás előfeltétel

**2. Több entitás toggle**
- Bekapcsoláskor létrejön 2 entitás:
  - Entitás 1: megkapja a meglévő összes adatot
  - Entitás 2: üres alapértelmezett

**3. Entitás fülek**
- Minden fül TELJES ÉRTÉKŰ Alapadatok panelt tartalmaz
- MINDEN mező entitás-specifikus:
  - Név, dispatch_name, aktív státusz
  - Szerződés, ár, dátumok, emlékeztető email
  - Létszám, workshop, krízis
  - Client Dashboard felhasználók

### Üzleti logika

Az entitások önálló jogi személyek:
- Saját jogukon kapnak számlát
- Saját jogukon kapnak tanácsadás kiközvetítéseket
- Egy országban vannak, de külön cégenként kezelendők
- Cégcsoportként regisztrálva a könnyebb átstruktúrálhatóság miatt

### Típusok

```typescript
interface ContractedEntity {
  // ... alap mezők
  dispatch_name: string | null;
  is_active: boolean;
  contract_reminder_email: string | null;
  client_dashboard_users: EntityClientDashboardUser[];
}

interface EntityClientDashboardUser {
  id: string;
  username: string;
  password?: string;
  language_id: string | null;
}
```

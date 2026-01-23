# SmartBoard 2.0 - Backend Változások és Migrációs Útmutató

Ez a dokumentum tartalmazza a React frontend fejlesztése során bevezetett változtatásokat, amelyeket a Laravel backend és MySQL adatbázis oldalon is implementálni kell.

**Utolsó frissítés:** 2025-01-23

---

## 📋 Tartalomjegyzék

1. [Felhasználói jogosultságok](#1-felhasználói-jogosultságok)
2. [Menüstruktúra változások](#2-menüstruktúra-változások)
3. [CRM Modul](#3-crm-modul)
4. [TODO Rendszer](#4-todo-rendszer)
5. [Lokalizáció](#5-lokalizáció)

---

## 1. Felhasználói jogosultságok

### Új struktúra: SmartBoard-alapú jogosultságkezelés

A felhasználók jogosultságait a SmartBoard hozzárendelések határozzák meg. Minden felhasználóhoz több SmartBoard is tartozhat.

#### Szükséges új tábla: `user_smartboard_permissions`

```sql
CREATE TABLE user_smartboard_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    smartboard_id VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_smartboard (user_id, smartboard_id)
);
```

#### SmartBoard ID-k (smartboard_id értékek):

| ID | Név | Leírás |
|----|-----|--------|
| `sales` | Sales SmartBoard | Értékesítés (CRM, szerződések) |
| `operating` | Operating SmartBoard | Operatív működés |
| `account` | Account SmartBoard | Ügyfélkezelés |
| `digital` | Digital SmartBoard | Digitális tartalmak |
| `finance` | Finance SmartBoard | Pénzügyek |
| `operator` | Operator SmartBoard | Operátor interfész |
| `expert` | Expert SmartBoard | Szakértői interfész |
| `admin` | Admin SmartBoard | Adminisztráció |

#### API Endpoint szükséges:

```
GET /api/user/smartboard-permissions
Response: { smartboardPermissions: [{ smartboardId, isDefault }] }
```

---

## 2. Menüstruktúra változások

### Átnevezett menüpontok

| Régi név (Laravel) | Új név (React) | Megjegyzés |
|--------------------|----------------|------------|
| `TO DO LIST` | `TEENDŐK` | CRM tab |
| `REPORTS` | `RIPORTOK` | CRM tab |
| `LEADS` | `LEADEK` | CRM tab |
| `OFFERS` | `AJÁNLATOK` | CRM tab |
| `DEALS` | `TÁRGYALÁSOK` | CRM tab |
| `SIGNED` | `ALÁÍRT` | CRM tab |

### Új menüpontok

| Menüpont | Útvonal | SmartBoard |
|----------|---------|------------|
| Sales SmartBoard | `/dashboard/smartboard/sales` | sales |
| CRM | `/dashboard/crm` | sales |

---

## 3. CRM Modul

### Lead státuszok

A CRM lead entitásokhoz új státusz mező szükséges.

#### Módosítás a `leads` táblában (vagy új tábla):

```sql
-- Ha van meglévő leads tábla:
ALTER TABLE leads ADD COLUMN status ENUM('lead', 'offer', 'deal', 'signed', 'incoming_company', 'cancelled') DEFAULT 'lead';

-- Ha új tábla kell:
CREATE TABLE crm_leads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    assigned_to_id BIGINT UNSIGNED,
    status ENUM('lead', 'offer', 'deal', 'signed', 'incoming_company', 'cancelled') DEFAULT 'lead',
    progress TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id)
);
```

### Lead státusz színkódok (frontend referencia):

| Státusz | Szín | CSS token |
|---------|------|-----------|
| lead | Teal (#59c6c6) | `bg-cgp-teal-light` |
| offer | Zöld (#91b752) | `bg-cgp-badge-new` |
| deal | Narancs (#eb7e30) | `bg-cgp-badge-lastday` |
| signed | Lila (#7f4074) | `bg-cgp-task-completed-purple` |
| incoming_company | Sötét teal (#00575f) | `bg-cgp-teal` |

### Lead részletek (details) struktúra:

```sql
CREATE TABLE crm_lead_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT UNSIGNED NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Hungary',
    industry VARCHAR(100),
    headcount INT UNSIGNED,
    pillars TINYINT UNSIGNED,
    sessions TINYINT UNSIGNED,
    FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE
);
```

### Lead találkozók:

```sql
CREATE TABLE crm_meetings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    time TIME,
    contact_name VARCHAR(255),
    contact_title VARCHAR(255),
    address VARCHAR(500),
    contact_type ENUM('email', 'video', 'phone', 'in_person') DEFAULT 'email',
    pillars TINYINT UNSIGNED DEFAULT 3,
    sessions TINYINT UNSIGNED DEFAULT 4,
    mood ENUM('happy', 'neutral', 'confused', 'negative'),
    has_notification BOOLEAN DEFAULT FALSE,
    note TEXT,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE
);
```

### Lead kapcsolattartók:

```sql
CREATE TABLE crm_contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    gender ENUM('male', 'female'),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE
);
```

### Lead feljegyzések:

```sql
CREATE TABLE crm_notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 4. TODO Rendszer

### Feladat kategóriák

A TODO feladatok kategóriákba sorolódnak a határidő alapján:

| Kategória | Logika | Szín |
|-----------|--------|------|
| Határidőn túl | `due_date < TODAY` | Magenta (#a33095) |
| Mai | `due_date = TODAY` | Teal (#59c6c6) |
| Következő hét | `due_date BETWEEN TODAY+1 AND TODAY+7` | Teal 40% |
| Jövőbeli | `due_date > TODAY+7` | Teal 20% |
| Befejezett | `status = 'completed'` | Teal 10% |

### Badge-ek:

| Badge | Feltétel | Szín |
|-------|----------|------|
| Új | `created_at > TODAY - 1 DAY` | Zöld (#91b752) |
| Utolsó nap | `due_date = TODAY` | Narancs (#eb7e30) |
| Határidőn túl | `due_date < TODAY AND status != 'completed'` | Piros (#db0b20) |

---

## 5. Lokalizáció

### CRM modul - Magyar fordítások

Az alábbi szövegek magyarul jelennek meg a frontenden:

| Angol | Magyar |
|-------|--------|
| Lead | Lead |
| Offer | Ajánlat |
| Deal | Tárgyalás |
| Signed | Aláírt |
| Incoming company | Bevitelre vár |
| Add meeting | Találkozó |
| Add contact | Kapcsolattartó |
| Add details | Részletek |
| Add note | Feljegyzés |
| Save | Mentés |
| Cancel | Mégse |
| Delete | Törlés |
| Contact type | Kapcsolat típus |
| Email | Email |
| Video | Videó |
| Phone | Telefon |
| In Person | Személyes |
| Mood | Hangulat |
| Happy | Pozitív |
| Neutral | Semleges |
| Confused | Bizonytalan |
| Negative | Negatív |
| City | Város |
| Country | Ország |
| Industry | Iparág |
| Headcount | Létszám |
| Pillars | Pillér |
| Sessions | Alkalom |
| Service | Szolgáltatás |
| Female | Nő |
| Male | Férfi |

---

## 6. Avatar Rendszer

### Felhasználói avatar mező

A felhasználókhoz avatar kép társítható, amely megjelenik a menüben és a chat-ben.

```sql
-- Meglévő users táblához:
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL;
```

### Avatar tárolás

- **Ajánlott**: Külső storage (S3, DigitalOcean Spaces, stb.)
- **Max méret**: 5MB
- **Formátumok**: JPG, PNG, GIF
- **Resize**: Backend oldalon 200x200px-re méretezés ajánlott

---

## 7. CGPchat (Belső Chat) Modul

### Chat üzenetek struktúra

```sql
CREATE TABLE chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);

CREATE TABLE chat_conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE chat_participants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    last_read_at TIMESTAMP NULL,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (conversation_id, user_id)
);
```

### Chat API Endpoints

```
GET  /api/chat/conversations                    - Beszélgetések listája
GET  /api/chat/conversations/{id}/messages      - Üzenetek lekérése
POST /api/chat/conversations/{id}/messages      - Új üzenet küldése
PUT  /api/chat/messages/{id}/read               - Üzenet olvasottnak jelölése
GET  /api/chat/unread-count                     - Olvasatlan üzenetek száma
```

---

## 🔄 Változásnapló

| Dátum | Változás | Érintett terület |
|-------|----------|------------------|
| 2025-01-23 | Activity Plan modul - új táblák (activity_plans, activity_plan_events) | Ügyfeleim |
| 2025-01-23 | Ügyfél-hozzárendelés tábla (user_client_assignments) | Felhasználók |
| 2025-01-23 | Client Director szerepkör logika | Jogosultságok |
| 2025-01-22 | Avatar rendszer hozzáadása (users.avatar_url mező) | Felhasználók |
| 2025-01-22 | CGPchat adatbázis struktúra (messages, conversations, participants) | Chat |
| 2025-01-22 | Belső Chat modul létrehozása (Slack-szerű) | Chat, Kommunikáció |
| 2025-01-22 | Keresés/Szűrés univerzális panel létrehozása | Keresés, Szűrés |
| 2025-01-22 | CRM modul teljes magyar lokalizáció | CRM, Lokalizáció |
| 2025-01-22 | CRM státusz színek szinkronizálása SmartBoard panellel | CRM |
| 2025-01-22 | SmartBoard alapú jogosultságkezelés bevezetése | Jogosultságok |
| 2025-01-22 | Sales SmartBoard nyitóoldal létrehozása | Menüstruktúra |
| 2025-01-21 | TODO Dashboard újraépítése React-ben | TODO |
| 2025-01-21 | Login oldal újraépítése | Autentikáció |
| 2025-01-21 | Felhasználók menüpont újraépítése | Admin |

---

## 8. Activity Plan Modul (Ügyfeleim)

### Ügyfél-hozzárendelés tábla

Az Account munkatársakhoz cégek rendelhetők hozzá:

```sql
CREATE TABLE user_client_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    company_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_company (user_id, company_id)
);
```

### Activity Plan tábla

Időszakos tervek a cégekhez:

```sql
CREATE TABLE activity_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    company_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    period_type ENUM('yearly', 'half_yearly', 'custom') DEFAULT 'yearly',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

### Activity Plan Események tábla

```sql
CREATE TABLE activity_plan_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_plan_id BIGINT UNSIGNED NOT NULL,
    event_type ENUM('workshop', 'webinar', 'meeting', 'health_day', 'orientation', 'communication_refresh', 'other') NOT NULL,
    custom_type_name VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(10,2),
    status ENUM('planned', 'approved', 'in_progress', 'completed', 'archived') DEFAULT 'planned',
    notes TEXT,
    -- Meeting specifikus mezők
    meeting_location VARCHAR(500),
    meeting_type ENUM('personal', 'online'),
    meeting_mood ENUM('very_positive', 'positive', 'neutral', 'negative', 'very_negative'),
    meeting_summary TEXT,
    -- Metaadatok
    completed_at TIMESTAMP NULL,
    archived_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_plan_id) REFERENCES activity_plans(id) ON DELETE CASCADE
);
```

### Activity Plan ENUM értékek (frontend referencia)

#### Esemény típusok:
| Érték | Magyar | Ikon |
|-------|--------|------|
| workshop | Workshop | BookOpen |
| webinar | Élő Webinár | Video |
| meeting | Meeting | Users |
| health_day | Egészségnap | Heart |
| orientation | Extra Orientáció | Target |
| communication_refresh | Kommunikáció frissítés | MessageSquare |
| other | Egyéb | Pin |

#### Esemény státuszok:
| Érték | Magyar | Szín |
|-------|--------|------|
| planned | Tervezett | `bg-muted` |
| approved | Jóváhagyott | `bg-primary/10` |
| in_progress | Folyamatban | `bg-cgp-teal-light/20` |
| completed | Lezajlott | `bg-cgp-badge-new/20` |
| archived | Archivált | `bg-cgp-task-completed-purple/20` |

#### Meeting hangulatok:
| Érték | Magyar | Ikon |
|-------|--------|------|
| very_positive | Nagyon pozitív | SmilePlus |
| positive | Pozitív | Smile |
| neutral | Semleges | Meh |
| negative | Negatív | Frown |
| very_negative | Nagyon negatív | Angry |

### API Endpoints - Activity Plan

```
GET  /api/my-clients                           - Hozzárendelt cégek listája
GET  /api/my-clients/{company_id}/plans        - Cég Activity Plan-jei
POST /api/activity-plans                       - Új Activity Plan létrehozása
PUT  /api/activity-plans/{id}                  - Activity Plan módosítása
DELETE /api/activity-plans/{id}                - Activity Plan törlése

GET  /api/activity-plans/{plan_id}/events      - Plan eseményei
POST /api/activity-plans/{plan_id}/events      - Új esemény hozzáadása
PUT  /api/activity-plan-events/{id}            - Esemény módosítása
DELETE /api/activity-plan-events/{id}          - Esemény törlése
PUT  /api/activity-plan-events/{id}/archive    - Esemény archiválása
```

### Client Director jogosultság

A `is_client_director` mező a `users` táblában jelzi, hogy a felhasználó láthatja-e más kollégák ügyfeleit:

```sql
ALTER TABLE users ADD COLUMN is_client_director BOOLEAN DEFAULT FALSE;
```

A Client Director nézetben megjelenik a "Csapat ügyfelei" tab, ahol szűrhet kollégára.

---

## 📝 Megjegyzések a fejlesztőknek

1. **Adatmigráció**: A meglévő lead/ügyfél adatokat a `crm_leads` táblába kell migrálni a megfelelő státusz meghatározásával.

2. **Jogosultságok**: A jelenlegi role-alapú jogosultságokat ki kell egészíteni a SmartBoard hozzárendelésekkel.

3. **API válaszok**: A frontend JSON formátumban várja az adatokat, camelCase mezőnevekkel.

4. **Perzisztencia**: A React frontend jelenleg localStorage-t használ demo célokra - éles környezetben ezt API hívásokra kell cserélni.

5. **Avatar tárolás**: Ne adatbázisban tároljuk a képeket, hanem blob storage-ban (S3, stb.), és csak az URL-t mentsük.

6. **Chat real-time**: Valós idejű chat-hez WebSocket vagy Pusher integráció szükséges.

7. **Activity Plan**: Az eseményeknél az `is_free` mező jelzi, hogy fizetős-e. A `price` mező csak akkor releváns, ha `is_free = FALSE`.

8. **Client Director**: Az `is_client_director` mezőt csak Account SmartBoard-hoz rendelt felhasználóknál kell figyelembe venni.

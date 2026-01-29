# Memory: features/companies/contract-data-panel
Updated: 2026-01-29

A cégprofil Alapadatok paneljén belül új "Szerződés adatai" panel került kialakításra. Ebben a panelben lehet feltölteni a szerződést PDF formátumban. Ide került át a "Szerződéshordozó" mező az "Országonként változó" kapcsolóval együtt. Új "Szerződéses ár devizanem" mező került bevezetésre, és a meglévő devizanem mező "Számlázási devizanem"-re lett átnevezve. Ezen kívül "Pillér" és "Alkalom" mezők állnak rendelkezésre a cég szerződéses jogosultságainak beállítására, valamint egy "Iparág" legördülő mező.

## Tanácsadás beállítások (Consultation Rows)
A tanácsadási jogosultságok sor-alapú struktúrában vannak implementálva. Minden sor tartalmazza:
- **Típus**: Pszichológia, Jog, Pénzügy, Health Coaching, Egyéb (single select, egyedi típus soronként)
- **Időtartam**: 30 perc, 50 perc (multi-select)
- **Forma**: Személyes, Videó, Telefonos, Szöveges üzenet/Chat (multi-select)

Az "Új sor" gombbal új tanácsadás típus adható hozzá. Minden típushoz önálló időtartam és forma beállítások tartoznak. A sorok törölhetők a piros kuka ikonnal.

## Ár beállítások
- **Szerződéses ár**: Numerikus mező az ár megadására
- **Ár típusa**: PEPM vagy Csomagár választó
- **Szerződéses ár devizanem**: Devizanem választó

## Adatstruktúra
A `ConsultationRow` interfész (`src/types/company.ts`):
```typescript
interface ConsultationRow {
  id: string;
  type: string | null;
  durations: string[];
  formats: string[];
}
```

A Company interfész `consultation_rows: ConsultationRow[]` mezőt használ a régi `consultation_types`, `consultation_durations`, `consultation_formats` tömbök helyett.

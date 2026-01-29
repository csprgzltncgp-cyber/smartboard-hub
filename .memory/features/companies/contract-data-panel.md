# Memory: features/companies/contract-data-panel
Updated: 2026-01-29

A cégprofil Alapadatok paneljén belül új "Szerződés adatai" panel került kialakításra. Ebben a panelben lehet feltölteni a szerződést PDF formátumban. Ide került át a "Szerződéshordozó" mező az "Országonként változó" kapcsolóval együtt. Új "Szerződéses ár devizanem" mező került bevezetésre, és a meglévő devizanem mező "Számlázási devizanem"-re lett átnevezve. Ezen kívül "Pillér" és "Alkalom" mezők állnak rendelkezésre a cég szerződéses jogosultságainak beállítására, valamint egy "Iparág" legördülő mező.

## Ár beállítások
- **Szerződéses ár**: Numerikus mező az ár megadására
- **Ár típusa**: PEPM vagy Csomagár választó
- **Szerződéses ár devizanem**: Devizanem választó

## Árváltozás előzmények
Új funkció: lehetőség az árváltozások időbeli nyomonkövetésére. Az "Árváltozás rögzítése" gombbal új bejegyzés adható hozzá az alábbi mezőkkel:
- **Érvényesség kezdete**: Dátum választó
- **Ár**: Numerikus érték
- **Ár típusa**: PEPM / Csomagár
- **Devizanem**: Devizanem választó
- **Megjegyzés**: Opcionális szöveges mező

Az árváltozás előzmények táblázatban jelennek meg, dátum szerinti csökkenő sorrendben (legújabb elöl). Minden bejegyzés törölhető a piros kuka ikonnal.

## Tanácsadás beállítások (Consultation Rows)
A tanácsadási jogosultságok sor-alapú struktúrában vannak implementálva. Minden sor tartalmazza:
- **Típus**: Pszichológia, Jog, Pénzügy, Health Coaching, Egyéb (single select, egyedi típus soronként)
- **Időtartam**: 30 perc, 50 perc (multi-select)
- **Forma**: Személyes, Videó, Telefonos, Szöveges üzenet/Chat (multi-select)

Az "Új sor" gombbal új tanácsadás típus adható hozzá. Minden típushoz önálló időtartam és forma beállítások tartoznak. A sorok törölhetők a piros kuka ikonnal.

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

A `PriceHistoryEntry` interfész (`src/types/company.ts`):
```typescript
interface PriceHistoryEntry {
  id: string;
  effective_date: string;
  price: number;
  price_type: string | null;
  currency: string | null;
  notes: string | null;
}
```

A Company interfész `consultation_rows: ConsultationRow[]` és `price_history: PriceHistoryEntry[]` mezőket használ.

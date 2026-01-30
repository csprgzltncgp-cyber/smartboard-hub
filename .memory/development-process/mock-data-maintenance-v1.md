# Memory: development-process/mock-data-maintenance-v1
Updated: 2026-01-30

## Mock/Seed adatok karbantartása

**FONTOS SZABÁLY:** Minden új funkció bevezetésekor a meglévő mock/seed adatokat is frissíteni kell, hogy az új funkcionalitás azonnal tesztelhető legyen a demo cégeknél.

### Érintett fájlok
- `src/hooks/useSeedActivityPlanData.ts` - Fő seed hook

### Checklist új funkciókhoz
1. ✅ Új adatbázis mezők hozzáadása (migráció)
2. ✅ TypeScript típusok frissítése
3. ✅ UI komponensek implementálása
4. ⚠️ **SEED ADATOK FRISSÍTÉSE** - Ne felejtsük el!
   - Meglévő seed rekordok bővítése az új mezőkkel
   - Példa adatok hozzáadása a demo funkciókhoz

### Miért fontos?
Ha a seed adatok nincsenek frissítve:
- A tesztelés során úgy tűnhet, hogy a funkció nem működik
- A felhasználó nem tudja kipróbálni az új funkciókat a meglévő demo cégeknél
- Félreértések és felesleges hibakeresés

### Contracted Entities példa
Amikor a "Több entitás" funkciót hozzáadjuk:
- A `company_country_differentiates` táblában a `has_multiple_entities` mezőt false-ra kell állítani
- VAGY példa entitásokat kell létrehozni a `company_contracted_entities` táblában

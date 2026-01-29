# Memory: features/companies/onboarding-system-v2
Updated: now

A CRM modulból érkező 'Új érkező' (incoming_company) státuszú cégeknél megjelenik a 'Bevezetés' (Onboarding) szekció. Ez mindig az első helyen szerepel a profilban (panelként vagy fülként), és vizuálisan kiemelt (variant="highlight") zöld kerettel és fejléccel (#91b752). Ha a cég nem 'Új érkező', a szekció teljesen rejtett.

## Tartalom
A Bevezetés panel két fő részből áll:
1. **CRM-ből átvett adatok** (összecsukható):
   - Kapcsolattartók (név, cím, telefon, email, cím)
   - Részletek (cégnév, város, ország, iparág, létszám, pillérek, alkalmak + egyedi adatok)
   - Feljegyzések (CRM jegyzetei)

2. **Bevezetési lépések** (Activity Plan stílus):
   - Szabadon hozzáadható/eltávolítható lépések
   - Alapértelmezett lépések: Kommunikációs anyagok jóváhagyása, Print gyártás, Print szállítás, Egyeztető meeting, Adatfeltöltés, Orientáció meeting, Orientáció onsite 1-3, Véglegesítés
   - Státuszok: pending, in_progress, completed (kattintással válthatók)
   - Progressbar a fejlécben

## Mock adat
A MediaGroup Hungary mock cég (incoming_company státusz) Magyarország alatt szolgál demo adatként.

## Bevezetés kész funkció
A "Bevezetés kész" gomb (csak 100% progress esetén aktív) lezárja a bevezetést:
- Az isNewcomer státusz false-ra vált → a Bevezetés panel eltűnik
- Az összes adat átkerül az Alapadatok panelba egy zárt, de megnyitható archív belső panelbe (ArchivedOnboardingPanel)
- A lila színű archív panel tartalmazza az összes CRM adatot és lépést read-only formában

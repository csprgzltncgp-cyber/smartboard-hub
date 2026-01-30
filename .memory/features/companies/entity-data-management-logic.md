# Memory: features/companies/entity-data-management-logic
Updated: 2026-01-30

A rendszer minden szerződött entitást (Contracted Entity) teljes értékű, önálló ügyfélként kezel, függetlenül attól, hogy egy nagyobb cégcsoport részeként van regisztrálva. Ennek megfelelően az Inputok, Feljegyzések (Notes) és Statisztikák (Statistics) modulok **hierarchikusan** alkalmazkodnak a struktúrához: ha több ország van, először ország fülek jelennek meg, majd az egyes országokon belül, ha több entitás létezik, entitás alfülek is megjelennek. Ez biztosítja, hogy minden entitáshoz saját, elkülönített bemeneti mezőket, jegyzeteket és statisztikai riportokat lehessen kezelni. A navigációt a generikus `CountryEntityContentTabs` komponens vezérli, amely Ország → Entitás hierarchiát valósít meg.

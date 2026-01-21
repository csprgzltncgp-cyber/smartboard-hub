# SmartBoard 2.0 Frontend Szabályok

Ez a dokumentum tartalmazza a Dashboard újrafejlesztése során kialakított frontend szabályokat. Minden új menüpont fejlesztésekor ezeket a szabályokat kell követni.

---

## 1. Design Tokens (index.css)

### Brand Színek
| Token | HSL Érték | Hex | Használat |
|-------|-----------|-----|-----------|
| `--cgp-teal` | `185 100% 19%` | `#00575f` | Elsődleges brand szín, gombok, címek |
| `--cgp-teal-foreground` | `0 0% 100%` | `#ffffff` | Szöveg teal háttéren |
| `--cgp-teal-light` | `176 47% 50%` | `#59c6c6` | Másodlagos teal (gombok, kiemelések) |
| `--cgp-teal-hover` | `185 100% 19%` | `#00575f` | Aktív gomb állapot |
| `--cgp-form-bg` | `0 0% 95%` | `#f2f2f2` | Form és kártya háttér |
| `--cgp-input-placeholder` | `0 0% 75%` | `#c0bfbf` | Input placeholder szín |
| `--cgp-error` | `355 91% 45%` | `#db0b20` | Hibaüzenetek háttere |

### Task Szekció Színek
| Token | HSL Érték | Hex | Használat |
|-------|-----------|-----|-----------|
| `--cgp-task-overdue` | `306 50% 39%` | `#a33095` | Határidőn túli feladatok szekció (magenta) |
| `--cgp-task-today` | `176 47% 50%` | `#59c6c6` | Mai napi feladatok szekció (teal) |
| `--cgp-task-week` | `176 47% 50% / 0.4` | - | Következő heti feladatok szekció |
| `--cgp-task-upcoming` | `176 47% 50% / 0.2` | - | Jövőbeli feladatok szekció |
| `--cgp-task-completed` | `176 47% 50% / 0.1` | - | Befejezett feladatok szekció |
| `--cgp-task-completed-purple` | `306 33% 36%` | `#7f4074` | Befejezett task sor háttere |

### Badge Színek (Laravel eredeti)
| Token | HSL Érték | Hex | Használat |
|-------|-----------|-----|-----------|
| `--cgp-badge-new` | `90 38% 52%` | `#91b752` | "Új" badge (zöld) |
| `--cgp-badge-lastday` | `21 82% 55%` | `#eb7e30` | "Utolsó nap" badge (narancs) |
| `--cgp-badge-overdue` | `355 91% 45%` | `#db0b20` | "Határidőn túl" badge (piros) |

### Szemantikus Tokenek
- `--primary`: CGP teal (gombok, linkek, kiemelt elemek)
- `--destructive`: Hibaüzenetek
- `--background`: Oldal háttér (fehér)
- `--foreground`: Alapértelmezett szövegszín
- `--muted`: Halvány háttér (táblázat fejléc, deaktivált elemek)

---

## 2. Tipográfia

### Betűtípusok
- **Calibri Bold** (`font-calibri-bold`): Gombok, címek, kiemelt szövegek, táblázat fejléc
- **Calibri Light** (`font-calibri-light`): Input mezők, placeholder, leíró szövegek
- **Calibri (default)** (`font-calibri`): Normál törzsszöveg

### Font Fájlok
```
public/fonts/CALIBRIB.TTF  → font-weight: 700
public/fonts/CALIBRIL.TTF  → font-weight: 300
```

### Tailwind Osztályok
```tsx
className="font-calibri-bold"  // Calibri Bold
className="font-calibri-light" // Calibri Light
className="font-calibri"       // Calibri (default)
```

---

## 3. Grafikai Alapszabályok

### Gombok
- **Mindig rádiuszos** (rounded-xl vagy rounded-[10px])
- **Mindig van ikon** a gomb szövege előtt
- Példa: `<Plus /> Új felhasználó`

### Értesítések / Badge-ek
- **Soha nincs rádiusz** (rounded-none vagy nincs rounded class)
- **Mindig van ikon** az értesítés szövege előtt
- Példa: `<AlertTriangle /> Határidőn túl : 3 nap!`

### Almenüpontok
- **Soha nincs rádiusz**
- **Soha nincs ikon**
- Csak szöveges linkek

---

## 4. Oldalszintű Layout

### Oldalcím (H1)
```tsx
<h1 className="text-3xl font-calibri-bold mb-6">Felhasználók</h1>
```

### Oldalcím + Akciógomb (Header)
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-calibri-bold">Felhasználók</h1>
  <Button className="bg-primary hover:bg-primary/90">
    <Plus className="w-4 h-4 mr-2" />
    Új felhasználó
  </Button>
</div>
```

### Vissza gomb + Oldalcím
```tsx
<div className="flex items-center gap-4 mb-6">
  <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
    <ArrowLeft className="w-5 h-5" />
  </Button>
  <div>
    <h1 className="text-3xl font-calibri-bold">Felhasználó jogosultságok</h1>
    <p className="text-muted-foreground">{user.name} ({user.email})</p>
  </div>
</div>
```

---

## 5. Komponens Stílusok

### Keresőmező
```tsx
<div className="relative mb-6">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
  <Input
    placeholder="Keresés..."
    className="pl-10"
  />
</div>
```

### Táblázat
```tsx
<div className="bg-white rounded-xl border overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>Oszlopnév</TableHead>
        <TableHead className="text-center">Középre igazított</TableHead>
        <TableHead className="text-right">Műveletek</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="font-medium">Tartalom</TableCell>
        <TableCell className="text-center">Középen</TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            {/* Ikon gombok */}
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### Üres állapot táblázatban
```tsx
<TableRow>
  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
    Nincs találat
  </TableCell>
</TableRow>
```

### Űrlap (Form)
```tsx
<form className="bg-white rounded-xl border p-6 space-y-4 max-w-md">
  <div>
    <Label>Mezőnév</Label>
    <Input placeholder="..." />
  </div>
  
  <div className="flex items-center gap-4 pt-4">
    <Button type="submit" className="bg-primary hover:bg-primary/90">
      <Save className="w-4 h-4 mr-2" />
      Mentés
    </Button>
    <Button type="button" variant="outline">
      Mégse
    </Button>
  </div>
</form>
```

### Információs doboz
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
  <p className="text-sm text-blue-800">
    <strong>Útmutató:</strong> Leírás szöveg...
  </p>
</div>
```

### Accordion (Összecsukható szekciók)
```tsx
<Accordion type="multiple" className="space-y-2">
  <AccordionItem 
    value="item-id"
    className="bg-white border rounded-xl overflow-hidden"
  >
    <div className="flex items-center gap-4 px-4 py-2">
      <Checkbox id="checkbox-id" />
      <AccordionTrigger className="flex-1 hover:no-underline py-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Címsor</span>
          <Badge variant="secondary">Info badge</Badge>
        </div>
      </AccordionTrigger>
    </div>
    <AccordionContent className="px-4 pb-4">
      <div className="pt-2 border-t">
        {/* Tartalom */}
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Badge-ek

#### Státusz badge (aktív/inaktív)
```tsx
<Badge variant={active ? "default" : "secondary"} className={active ? "bg-green-500" : "bg-gray-400"}>
  {active ? "Aktív" : "Inaktív"}
</Badge>
```

#### Info badge (táblázatban)
```tsx
<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
  Címke
</Badge>
```

#### Számláló badge
```tsx
<Badge variant="secondary">{count}</Badge>
```

### Összegzés panel
```tsx
<div className="bg-white rounded-xl border p-4 mb-6">
  <h3 className="font-semibold mb-2">Összegzés</h3>
  <div className="flex flex-wrap gap-2">
    {/* Badge-ek */}
  </div>
</div>
```

### Törlés megerősítés (AlertDialog)
```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Biztosan törölni szeretnéd?</AlertDialogTitle>
      <AlertDialogDescription>
        Ez a művelet nem vonható vissza.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Mégse</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Törlés
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### TODO Szekció Gombok
```tsx
// Alap gomb stílus
className="bg-cgp-teal-light text-white px-5 py-3 rounded-xl flex items-center gap-2"

// Aktív gomb
className="bg-primary text-white"

// Szűrés gomb (jobb oldalt)
className="bg-cgp-teal-light text-white px-5 py-3 rounded-xl"
```

### Task Kártyák
```tsx
// Szekció headline
className="text-white uppercase text-3xl px-8 py-5 rounded-t-[25px]"
// Háttér dinamikus: bg-cgp-task-overdue, bg-cgp-task-today, etc.

// Task sor
className="flex items-center gap-4 bg-white/70 rounded-xl p-4 mb-3"

// Kiválaszt gomb
className="bg-cgp-teal-light text-white px-4 py-2 rounded-xl flex items-center gap-2"

// Határidő badge (szögletes, ikonnal!)
className="bg-cgp-badge-overdue text-white px-3 py-2 flex items-center gap-1 text-sm font-calibri-bold"
```

---

## 6. Méretek és Spacing

### Gombok
| Tulajdonság | Érték |
|-------------|-------|
| Magasság | `44px` (`h-11`) vagy automatikus |
| Border radius | `10px` (`rounded-[10px]`) vagy `rounded-xl` |
| Padding | `px-4` – `px-8` (kontextustól függ) |

### Input Mezők
| Tulajdonság | Érték |
|-------------|-------|
| Magasság | `44px` (`h-11`) |
| Padding | `px-4` (16px horizontális) |
| Margin bottom | `12px` (`mb-3`) |

### Táblázat cella padding
- Normál: alapértelmezett Table komponens
- Műveletek: `justify-end gap-2`

### Szekció spacing
- Szekcióközi: `mb-6` vagy `mb-8`
- Card belső padding: `p-4` vagy `p-6`

---

## 7. Ikonok

**Lucide React** használata az ikonokhoz:
```tsx
import { Plus, Settings, Trash2, Power, Search, ArrowLeft, Save, Check, Star, StarOff } from "lucide-react";

<Plus className="w-4 h-4 mr-2" />
```

### Gyakori ikonok
| Ikon | Használat |
|------|-----------|
| `Plus` | Új elem hozzáadása |
| `Settings` | Beállítások, jogosultságok |
| `Trash2` | Törlés |
| `Power` | Aktiválás/Deaktiválás |
| `Search` | Keresés |
| `ArrowLeft` | Vissza navigáció |
| `Save` | Mentés |
| `Check` | Befejezés, kiválasztás |
| `Star` / `StarOff` | Default jelölés |

Méret: általában `w-4 h-4` gombokban, `w-5 h-5` nagyobb ikonok

---

## 8. Logók és Asszetek

### Elérhető Logók
| Fájl | Használat |
|------|-----------|
| `src/assets/cgp_logo_green.svg` | Header logó (80x80px) |
| `src/assets/white_logo.svg` | Footer környezetbarát ikon |

### Import Példa
```tsx
import cgpLogo from "@/assets/cgp_logo_green.svg";
import whiteLogo from "@/assets/white_logo.svg";
```

---

## 9. Responsive Design

### Breakpoints
- Form konténer: `max-w-md` vagy `max-w-[458px]`
- Táblázat: `overflow-x-auto` wrapper szükség esetén
- Gombok: `flex-wrap` használata több gomb esetén

---

## 10. Lokalizáció

### Nyelvek
A Dashboard magyar és angol nyelvű. Szövegek jelenleg hardcode-olva, később i18n implementálandó.

### Aktuális szövegek
- Gombok: "Új felhasználó", "Mentés", "Mégse", "Törlés"
- Üzenetek: "Nincs találat", "Betöltés..."
- Megerősítés: "Biztosan törölni szeretnéd?"

---

## Changelog

| Dátum | Menüpont | Hozzáadott szabályok |
|-------|----------|---------------------|
| 2025-01-21 | Login oldal | Brand színek, tipográfia, form stílusok, logók |
| 2025-01-21 | TODO Dashboard | Task szekció színek, headline stílusok, task kártya layout, gombok, badge-ek |
| 2025-01-21 | Felhasználók | Táblázat stílusok, form layout, accordion, keresőmező, oldalcím + akciógomb header, törlés megerősítés dialog, badge variánsok, összegzés panel |

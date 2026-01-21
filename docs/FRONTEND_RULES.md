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

---

## 2. Tipográfia

### Betűtípusok
- **Calibri Bold** (`font-calibri-bold`): Gombok, címek, kiemelt szövegek
- **Calibri Light** (`font-calibri-light`): Input mezők, placeholder, leíró szövegek

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
- Példa: `<MousePointer2 /> KIVÁLASZT`

### Értesítések / Badge-ek
- **Soha nincs rádiusz** (rounded-none vagy nincs rounded class)
- **Mindig van ikon** az értesítés szövege előtt
- Példa: `<AlertTriangle /> Határidőn túl : 3 nap!`

### Almenüpontok
- **Soha nincs rádiusz**
- **Soha nincs ikon**
- Csak szöveges linkek

---

## 4. Komponens Stílusok

### Login Form
```tsx
// Form konténer
className="bg-[hsl(var(--cgp-form-bg))] px-10 pt-20 pb-16 w-full max-w-[458px]"

// Input mezők
className="w-full h-11 px-4 mb-3 border-0 outline-none font-calibri-light text-sm placeholder:text-[hsl(var(--cgp-input-placeholder))]"

// Elsődleges gomb
className="bg-primary text-primary-foreground font-calibri-bold text-base uppercase px-8 h-11 rounded-[10px]"
```

### Hibaüzenet
```tsx
className="bg-destructive text-destructive-foreground px-5 py-5 flex items-center gap-2 font-calibri-bold"
```

### Header (Login)
```tsx
// Logo container
className="flex items-start gap-2"

// Dashboard cím
className="text-primary uppercase text-lg font-calibri-light -mt-1"
```

### Dashboard Header (Bejelentkezés után)
```tsx
// Container
className="w-full bg-background pt-2"

// Logo + cím
className="flex items-center gap-2"
<img src={cgpLogo} className="w-20 h-20" />
<span className="text-primary uppercase text-lg font-calibri-bold">Admin Dashboard</span>
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

// Határidő badge
className="bg-cgp-task-badge-overdue text-white px-3 py-1 rounded-xl flex items-center gap-1 text-sm"
```

---

## 4. Méretek és Spacing

### Gombok
| Tulajdonság | Érték |
|-------------|-------|
| Magasság | `44px` (`h-11`) |
| Border radius | `10px` (`rounded-[10px]`) |
| Padding | `px-8` (32px horizontális) |

### Input Mezők
| Tulajdonság | Érték |
|-------------|-------|
| Magasság | `44px` (`h-11`) |
| Padding | `px-4` (16px horizontális) |
| Margin bottom | `12px` (`mb-3`) |

### Form Konténer
| Tulajdonság | Érték |
|-------------|-------|
| Max szélesség | `458px` |
| Padding top | `85px` (`pt-20` ≈) |
| Padding bottom | `73px` (`pb-16` ≈) |
| Padding horizontal | `41px` (`px-10` ≈) |

---

## 5. Logók és Asszetek

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

## 6. Ikonok

**Lucide React** használata az ikonokhoz:
```tsx
import { LogIn, AlertTriangle } from "lucide-react";

<LogIn className="w-5 h-5" />
```

Méret: általában `20x20px` (`w-5 h-5`)

---

## 7. Responsive Design

### Breakpoints
- Form konténer: `max-w-[458px]` → mobil nézeten `w-full`
- Horizontális padding mobilon: `px-4`

---

## 8. Lokalizáció

### Nyelvek
A Dashboard magyar és angol nyelvű. Szövegek jelenleg hardcode-olva, később i18n implementálandó.

### Jelenlegi szövegek
```
Login gomb: "LOGIN"
Placeholder: "Username", "Password"
Footer: "Az Ön programszolgáltatója..."
```

---

## Changelog

| Dátum | Menüpont | Hozzáadott szabályok |
|-------|----------|---------------------|
| 2025-01-21 | Login oldal | Brand színek, tipográfia, form stílusok, logók |
| 2025-01-21 | TODO Dashboard | Task szekció színek, headline stílusok, task kártya layout, gombok, badge-ek |

# SmartBoard 2.0 Frontend Szabályok

Ez a dokumentum tartalmazza a Dashboard újrafejlesztése során kialakított frontend szabályokat. Minden új menüpont fejlesztésekor ezeket a szabályokat kell követni.

---

## 1. Design Tokens (index.css)

### Brand Színek
| Token | HSL Érték | Hex | Használat |
|-------|-----------|-----|-----------|
| `--cgp-teal` | `185 100% 19%` | `#00575f` | Elsődleges brand szín, gombok, címek |
| `--cgp-teal-foreground` | `0 0% 100%` | `#ffffff` | Szöveg teal háttéren |
| `--cgp-form-bg` | `0 0% 95%` | `#f2f2f2` | Form és kártya háttér |
| `--cgp-input-placeholder` | `0 0% 75%` | `#c0bfbf` | Input placeholder szín |
| `--cgp-error` | `355 91% 45%` | `#db0b20` | Hibaüzenetek háttere |

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

## 3. Komponens Stílusok

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

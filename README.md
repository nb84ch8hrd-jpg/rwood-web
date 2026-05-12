# RWOOD — Poctivé stolárstvo

Webová stránka pre stolárstvo **RWOOD s.r.o.** Statická HTML + CSS + JS stránka, postavená podľa Figma dizajnu.

## Štruktúra

```
rwood-web/
├── index.html              # Hlavná stránka
├── css/style.css           # Štýly (pixel-perfect Figma)
├── js/app.js               # Form, cookies, accordion, gallery
├── assets/                 # Logo, ikony, fotografie
└── legal/                  # Obchodné podmienky, GDPR, cookies, reklamácie, odstúpenie
    ├── obchodne-podmienky.html
    ├── ochrana-osobnych-udajov.html
    ├── cookies.html
    ├── reklamacny-poriadok.html
    └── odstupenie-od-zmluvy.html
```

## Funkcie

- **Hero** so sticky frost-glass headerom
- **Apple-style akordeón ponuky** s krížovou animáciou obrázkov (cross-fade pri prepnutí kategórie)
- **Galéria** s 3 statickými dlaždicami a klikateľným `+` overlayom
- **Image grid** s rotujúcim slideshow (3 vrstvy × 18s cyklus, stagger)
- **Auto-scroll marquee recenzií** sprava doľava s nekonečným loopom + pause-on-hover
- **Formulár** s validáciou, honeypot anti-spamom a `mailto:` odosielaním (subject obsahuje kategóriu)
- **GDPR cookie banner** so 4 kategóriami (necessary, preferences, statistics, marketing)
- **Plne responzívne** (3 breakpointy: 1024 / 720 / 420)
- **A11y**: tap targets ≥ 44 px, `prefers-reduced-motion`, focus styles, ARIA

## Legal

Všetky legal stránky v súlade so SK / EU legislatívou:
- Zákon č. 250/2007 Z. z. (ochrana spotrebiteľa)
- Zákon č. 102/2014 Z. z. (predaj na diaľku)
- Nariadenie EÚ 2016/679 (GDPR) + zákon č. 18/2018 Z. z.
- Smernica ePrivacy 2002/58/ES

## Spustenie lokálne

```bash
python3 -m http.server 8000
# Otvor http://localhost:8000
```

## TODO pred produkciou

- [ ] Doplniť reálne IČO, DIČ, IČ DPH, IBAN
- [ ] Nahradiť Unsplash placeholdere reálnymi fotkami realizácií
- [ ] Pripojiť formulár na backend (Formspree alebo vlastný endpoint) — viď komentáre v `js/app.js`
- [ ] Doplniť tracking IDs do `cookies.html` (Google Analytics, Meta Pixel)
- [ ] Nasadiť na hosting (Netlify / Vercel / vlastný server)

---

© RWOOD s.r.o. — Všetky práva vyhradené.

/* ==========================================================================
   RWOOD — app.js
   - Cookie consent (GDPR/ePrivacy compliant: deny-by-default, granular)
   - Form validation + accessible UX
   - Mobile menu toggle
   - Accordion offer items
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- Year in footer ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Mobile menu ---------- */
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const open = mainNav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(open));
        });
        mainNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mainNav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- Offer accordion + per-item image crossfade ---------- */
    const offerItems   = document.querySelectorAll('.offer-item');
    const imageLayers  = document.querySelectorAll('.offer-image-layer');

    function showImageFor(key) {
        if (!imageLayers.length || !key) return;
        imageLayers.forEach(layer => {
            layer.classList.toggle('is-active', layer.dataset.key === key);
        });
    }

    offerItems.forEach(item => {
        const head = item.querySelector('.offer-head');
        if (!head) return;

        head.addEventListener('click', () => {
            const wasOpen = item.classList.contains('is-open');
            const key = item.dataset.key;

            offerItems.forEach(i => {
                i.classList.remove('is-open');
                const h = i.querySelector('.offer-head');
                if (h) h.setAttribute('aria-expanded', 'false');
            });

            if (!wasOpen) {
                item.classList.add('is-open');
                head.setAttribute('aria-expanded', 'true');
                showImageFor(key);                       // swap right-side image
            }
            // when closing, leave the image as is (last shown) so it never goes blank
        });
    });

    /* ---------- Gallery tile toggle (+/-) ---------- */
    document.querySelectorAll('.gallery-tile').forEach(tile => {
        const btn = tile.querySelector('.gallery-toggle');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const open = tile.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'Skryť popis' : 'Rozbaliť popis');
        });
    });

    /* ---------- Sticky header: add .is-scrolled after hero ---------- */
    const header = document.querySelector('.site-header');
    if (header) {
        const onScroll = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 100);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ==========================================================================
       COOKIE CONSENT
       Categories: necessary (always on), preferences, statistics, marketing
       Storage:    localStorage key 'rwood_cookie_consent_v1'
       Banner shows if no decision yet.
       Re-open via footer "Nastavenia cookies".
       ========================================================================== */
    const CONSENT_KEY = 'rwood_cookie_consent_v1';
    const banner    = document.getElementById('cookieBanner');
    const options   = document.getElementById('cookieOptions');
    const btnAccept = document.getElementById('cookieAccept');
    const btnReject = document.getElementById('cookieReject');
    const btnCustom = document.getElementById('cookieCustomize');
    const btnSave   = document.getElementById('cookieSave');
    const ckPref    = document.getElementById('ckPref');
    const ckStat    = document.getElementById('ckStat');
    const ckMark    = document.getElementById('ckMark');
    const openSettings = document.getElementById('openCookieSettings');

    function readConsent() {
        try {
            const raw = localStorage.getItem(CONSENT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function writeConsent(obj) {
        const payload = Object.assign({
            necessary: true,
            preferences: false,
            statistics: false,
            marketing: false,
            timestamp: new Date().toISOString(),
            version: 1
        }, obj);
        try { localStorage.setItem(CONSENT_KEY, JSON.stringify(payload)); } catch (e) {}
        applyConsent(payload);
        return payload;
    }

    function applyConsent(consent) {
        // Hook for analytics/marketing scripts. Real integrations would load
        // scripts conditionally here, e.g.:
        // if (consent.statistics) loadAnalytics();
        // if (consent.marketing)  loadAds();
        window.dispatchEvent(new CustomEvent('rwood:consent', { detail: consent }));
    }

    function showBanner(prefill) {
        if (!banner) return;
        if (prefill) {
            if (ckPref) ckPref.checked = !!prefill.preferences;
            if (ckStat) ckStat.checked = !!prefill.statistics;
            if (ckMark) ckMark.checked = !!prefill.marketing;
            if (options) options.hidden = false;
            if (btnSave) btnSave.hidden = false;
        }
        banner.hidden = false;
    }
    function hideBanner() { if (banner) banner.hidden = true; }

    const existing = readConsent();
    if (!existing) {
        showBanner();
    } else {
        applyConsent(existing);
    }

    btnAccept && btnAccept.addEventListener('click', () => {
        writeConsent({ preferences: true, statistics: true, marketing: true });
        hideBanner();
    });
    btnReject && btnReject.addEventListener('click', () => {
        writeConsent({ preferences: false, statistics: false, marketing: false });
        hideBanner();
    });
    btnCustom && btnCustom.addEventListener('click', () => {
        if (options) options.hidden = false;
        if (btnSave) btnSave.hidden = false;
        // Pre-fill from existing decision
        const c = readConsent();
        if (c) {
            if (ckPref) ckPref.checked = c.preferences;
            if (ckStat) ckStat.checked = c.statistics;
            if (ckMark) ckMark.checked = c.marketing;
        }
    });
    btnSave && btnSave.addEventListener('click', () => {
        writeConsent({
            preferences: !!(ckPref && ckPref.checked),
            statistics:  !!(ckStat && ckStat.checked),
            marketing:   !!(ckMark && ckMark.checked)
        });
        hideBanner();
    });
    openSettings && openSettings.addEventListener('click', (e) => {
        e.preventDefault();
        const c = readConsent();
        showBanner(c || { preferences: false, statistics: false, marketing: false });
    });

    /* ==========================================================================
       CONTACT FORM
       Client-side validation. Submits via fetch when configured.
       Honeypot + simple time-based check against bots.
       ========================================================================== */
    const form = document.getElementById('contactForm');
    if (form) {
        const status = document.getElementById('formStatus');
        const formLoadedAt = Date.now();

        const fields = {
            meno:    { el: form.meno,    err: document.getElementById('err-meno'),    test: v => v.trim().length >= 2,             msg: 'Zadajte meno (min. 2 znaky).' },
            telefon: { el: form.telefon, err: document.getElementById('err-telefon'), test: v => /^[+0-9 ()\-]{9,20}$/.test(v.trim()), msg: 'Zadajte platné telefónne číslo.' },
            email:   { el: form.email,   err: document.getElementById('err-email'),   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Zadajte platný e-mail.' },
            suhlas:  { el: form.suhlas,  err: document.getElementById('err-suhlas'),  test: () => form.suhlas.checked,             msg: 'Pre odoslanie potrebujeme váš súhlas.' }
        };

        function validateField(key) {
            const f = fields[key];
            if (!f || !f.el) return true;
            const value = f.el.type === 'checkbox' ? f.el.checked : f.el.value;
            const valid = f.test(value);
            if (f.err) f.err.textContent = valid ? '' : f.msg;
            if (f.el.setAttribute) f.el.setAttribute('aria-invalid', valid ? 'false' : 'true');
            return valid;
        }

        Object.keys(fields).forEach(key => {
            const f = fields[key];
            if (!f.el) return;
            const ev = f.el.type === 'checkbox' ? 'change' : 'blur';
            f.el.addEventListener(ev, () => validateField(key));
            f.el.addEventListener('input', () => {
                if (f.err && f.err.textContent) validateField(key);
            });
        });

        function setStatus(msg, kind) {
            if (!status) return;
            status.textContent = msg;
            status.className = 'form-status ' + (kind || '');
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Honeypot — bots fill hidden field
            if (form.website && form.website.value.trim() !== '') return;
            // Too-fast submit guard (under 1.5s = likely bot)
            if (Date.now() - formLoadedAt < 1500) return;

            const allValid = Object.keys(fields).map(validateField).every(Boolean);
            if (!allValid) {
                setStatus('Skontrolujte prosím vyplnené polia.', 'err');
                const firstErr = form.querySelector('[aria-invalid="true"]');
                if (firstErr) firstErr.focus();
                return;
            }

            const data = {
                kategoria: form.kategoria.value,
                meno: form.meno.value.trim(),
                telefon: form.telefon.value.trim(),
                email: form.email.value.trim(),
                poznamka: (form.poznamka ? form.poznamka.value.trim() : ''),
                suhlas: form.suhlas.checked,
                page: location.href,
                referer: document.referrer || null,
                submittedAt: new Date().toISOString()
            };

            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Odosielam…'; }
            setStatus('Otváram váš e-mail klient…', '');

            /* ==========================================================================
               EMAIL DELIVERY
               Default mode: opens user's email client via mailto: with:
                   - subject containing the work type (kategoria)
                   - body listing all fields
               Production mode: uncomment the FORMSPREE/BACKEND block and replace
               RECIPIENT/ENDPOINT. The mailto: fallback below still works if fetch fails.
               ========================================================================== */
            const RECIPIENT = 'info@rwood.sk';     // ← Replace with real inbox
            // const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';

            try {
                /* --- PRODUCTION: fetch to Formspree/Web3Forms/your backend ---
                const res = await fetch(FORMSPREE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: `Nezáväzná ponuka — ${data.kategoria}`,
                        ...data
                    })
                });
                if (!res.ok) throw new Error('Server error');
                setStatus('Ďakujeme! Vašu žiadosť sme prijali, ozveme sa do 24 hodín.', 'ok');
                form.reset();
                if (form.kategoria && form.kategoria[0]) form.kategoria[0].checked = true;
                return;
                */

                // --- DEFAULT (no backend): build mailto URL with all fields ---
                const subject = `Nezáväzná ponuka — ${data.kategoria}`;
                const body = [
                    `Druh zákazky:    ${data.kategoria}`,
                    ``,
                    `Meno a priezvisko: ${data.meno}`,
                    `Telefón:           ${data.telefon}`,
                    `E-mail:            ${data.email}`,
                    ``,
                    `Poznámka:`,
                    data.poznamka || '(neuvedené)',
                    ``,
                    `— — —`,
                    `Súhlas s VOP a GDPR: ${data.suhlas ? 'áno' : 'nie'}`,
                    `Odoslané z:          ${data.page}`,
                    `Čas odoslania:       ${new Date(data.submittedAt).toLocaleString('sk-SK')}`
                ].join('\n');

                const mailto = `mailto:${encodeURIComponent(RECIPIENT)}`
                    + `?subject=${encodeURIComponent(subject)}`
                    + `&body=${encodeURIComponent(body)}`;

                // Open in a hidden iframe to avoid losing the page state
                const f = document.createElement('iframe');
                f.style.display = 'none';
                f.src = mailto;
                document.body.appendChild(f);
                // Some browsers (esp. mobile Safari) prefer location.href
                setTimeout(() => { window.location.href = mailto; }, 80);

                setStatus('Ďakujeme! Otvorili sme váš e-mail klient — stačí už len odoslať pripravenú správu.', 'ok');
            } catch (err) {
                setStatus(`Niečo sa pokazilo. Napíšte nám prosím priamo na ${RECIPIENT}.`, 'err');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Odoslať nezáväznú ponuku'; }
            }
        });

        /* Live counter for poznamka */
        const pozn = form.poznamka;
        const cnt  = document.getElementById('cnt-poznamka');
        if (pozn && cnt) {
            const update = () => { cnt.textContent = `${pozn.value.length} / ${pozn.maxLength}`; };
            pozn.addEventListener('input', update);
            update();
        }
    }

})();

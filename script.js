/**
 * GENERAL DIESEL - PROFESSIONAL THEME SYSTEM
 * Enterprise-grade, Accessible, Production-ready
 * Theme management + existing functionality (mobile menu, smooth scroll)
 */

'use strict';

    const doc = document;
    const mobileMenuToggle = doc.getElementById('mobileMenuToggle');
    const navbarMenu = doc.querySelector('.navbar__menu');
    const navbar = doc.querySelector('.navbar');
    const languageSwitcher = doc.getElementById('languageSwitcher');
    const translatableNodes = Array.from(doc.querySelectorAll('[data-i18n]'));
    const pageTitleElement = doc.querySelector('title');
    const metaDescription = doc.querySelector('meta[name="description"]');
    const ogTitleMeta = doc.querySelector('meta[property="og:title"]');
    const ogDescriptionMeta = doc.querySelector('meta[property="og:description"]');
    const translations = window.GD_TRANSLATIONS || {};
    const LANGUAGE_STORAGE_KEY = 'gd-preferred-language';
    const DEFAULT_LANGUAGE = 'en';

    function getStoredLanguage() {
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return savedLanguage && translations[savedLanguage] ? savedLanguage : DEFAULT_LANGUAGE;
    }

    function persistLanguage(language) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }

    function setDocumentDirection(language) {
        const direction = language === 'ar' ? 'rtl' : 'ltr';
        doc.documentElement.lang = language;
        doc.documentElement.dir = direction;
        doc.body.classList.toggle('rtl', language === 'ar');
    }

    function translateKey(key, language) {
        const dictionary = translations[language] || translations[DEFAULT_LANGUAGE] || {};
        return key.split('.').reduce((current, part) => {
            return current && current[part] !== undefined ? current[part] : undefined;
        }, dictionary);
    }

    function applyTranslations(language) {
        translatableNodes.forEach((node) => {
            const key = node.dataset.i18n;
            if (!key) return;

            const value = translateKey(key, language);
            if (value === undefined) return;

            if (node.dataset.i18nHtml === 'true') {
                node.innerHTML = value;
            } else {
                node.textContent = value;
            }
        });

        if (languageSwitcher) {
            languageSwitcher.value = language;
            languageSwitcher.setAttribute('aria-label', translateKey('nav.languageLabel', language) || 'Select language');
        }

        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-label', translateKey('nav.toggleMenu', language) || 'Toggle navigation menu');
        }

        if (pageTitleElement && translations[language] && translations[language].page && translations[language].page.title) {
            pageTitleElement.textContent = translations[language].page.title;
        }

        if (metaDescription && translations[language] && translations[language].page) {
            metaDescription.setAttribute('content', translations[language].page.description || '');
        }

        if (ogTitleMeta && translations[language] && translations[language].page) {
            ogTitleMeta.setAttribute('content', translations[language].page.ogTitle || translations[language].page.title || '');
        }

        if (ogDescriptionMeta && translations[language] && translations[language].page) {
            ogDescriptionMeta.setAttribute('content', translations[language].page.ogDescription || translations[language].page.description || '');
        }
    }

    function handleLanguageChange(event) {
        const selectedLanguage = event.target.value;
        persistLanguage(selectedLanguage);
        setDocumentDirection(selectedLanguage);
        applyTranslations(selectedLanguage);
    }

    function initLanguage() {
        const language = getStoredLanguage();
        setDocumentDirection(language);
        applyTranslations(language);

        if (languageSwitcher) {
            languageSwitcher.addEventListener('change', handleLanguageChange);
        }
    }

    function toggleMobileMenu() {
        if (!navbarMenu || !mobileMenuToggle) return;
        navbarMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded',
            mobileMenuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    }

    function closeMobileMenu() {
        if (!navbarMenu || !mobileMenuToggle) return;
        navbarMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenuToggle && navbarMenu) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    function handleAnchorClick(event) {
        const anchor = event.target.closest('a[href]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href) return;

        if (href.startsWith('#') && href !== '#') {
            const target = doc.querySelector(href);
            if (!target) return;

            event.preventDefault();
            const headerOffset = 70;
            const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            if (navbarMenu && navbarMenu.classList.contains('active')) {
                closeMobileMenu();
            }
            return;
        }

        if (href.startsWith('mailto:')) {
            if (window.gtag) {
                gtag('event', 'contact_click');
            }
            return;
        }

        if (/^https?:\/\//.test(href) && anchor.hostname !== window.location.hostname) {
            if (window.gtag) {
                gtag('event', 'external_link', { link_url: anchor.href });
            }
        }
    }

    doc.body.addEventListener('click', handleAnchorClick, false);

    initLanguage();

    if (navbar) {
        let ticking = false;
        let lastScrollPosition = 0;

        function updateNavbarShadow() {
            navbar.style.boxShadow = lastScrollPosition > 50 ? 'var(--shadow-md)' : 'var(--shadow-xs)';
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            lastScrollPosition = window.pageYOffset;
            if (!ticking) {
                window.requestAnimationFrame(updateNavbarShadow);
                ticking = true;
            }
        }, { passive: true });
    }

    // Performance logging removed for production optimization.

    /* ============================================================
       SCROLL REVEAL ANIMATION
       Adds .reveal, .reveal-left, .reveal-right classes to
       elements as they enter the viewport.
       ============================================================ */
    function initScrollReveal() {
        // Assign reveal classes to sections / cards automatically
        const revealSelectors = [
            { sel: '.section-title',          cls: 'reveal' },
            { sel: '.feature-card',           cls: 'reveal' },
            { sel: '.highlight-card',         cls: 'reveal' },
            { sel: '.testimonial-card',       cls: 'reveal' },
            { sel: '.stat-card',              cls: 'reveal' },
            { sel: '.process__step',          cls: 'reveal' },
            { sel: '.footer__brand-item',     cls: 'reveal' },
            { sel: '.about__text',            cls: 'reveal-left' },
            { sel: '.about__founder',         cls: 'reveal-right' },
            { sel: '.cta-final__badge',       cls: 'reveal' },
            { sel: '.cta-final__title',       cls: 'reveal' },
            { sel: '.cta-final__subtitle',    cls: 'reveal' },
            { sel: '.cta-final__action',      cls: 'reveal' },
            { sel: '.contact-location__card', cls: 'reveal-left' },
            { sel: '.contact-location__map',  cls: 'reveal-right' },
        ];

        revealSelectors.forEach(({ sel, cls }) => {
            doc.querySelectorAll(sel).forEach((el, i) => {
                // Stagger siblings with delay classes
                if (!el.classList.contains('reveal') &&
                    !el.classList.contains('reveal-left') &&
                    !el.classList.contains('reveal-right')) {
                    el.classList.add(cls);
                    const delay = Math.min(i, 3);
                    if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
                }
            });
        });

        const revealAll = doc.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        if (!revealAll.length) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            revealAll.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealAll.forEach(el => observer.observe(el));
    }

    /* ============================================================
       COUNT-UP ANIMATION for stat numbers
       ============================================================ */
    function initCountUp() {
        const statNumbers = doc.querySelectorAll('.stat-card__number');
        if (!statNumbers.length) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const parseNumber = (text) => {
            // Extract numeric part and suffix (e.g. "25+" → {num: 25, suffix: "+"})
            const match = text.trim().match(/^(\d+)(.*)$/);
            if (!match) return null;
            return { num: parseInt(match[1], 10), suffix: match[2] || '' };
        };

        const animateCount = (el, target, suffix, duration = 1800) => {
            const start = performance.now();
            const step = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target) + suffix;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        if (prefersReduced) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const parsed = parseNumber(el.textContent);
                    if (parsed) animateCount(el, parsed.num, parsed.suffix);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => observer.observe(el));
    }

    /* ============================================================
       ACTIVE NAV LINK on scroll
       ============================================================ */
    function initActiveNav() {
        const sections = doc.querySelectorAll('section[id]');
        const navLinks = doc.querySelectorAll('.navbar__menu a[href^="#"]');
        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle(
                            'nav-active',
                            link.getAttribute('href') === `#${id}`
                        );
                    });
                }
            });
        }, { rootMargin: '-40% 0px -50% 0px' });

        sections.forEach(s => observer.observe(s));
    }

    // Initialise all enhancements after DOM is ready
    if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', () => {
            initScrollReveal();
            initCountUp();
            initActiveNav();
        });
    } else {
        initScrollReveal();
        initCountUp();
        initActiveNav();
    }



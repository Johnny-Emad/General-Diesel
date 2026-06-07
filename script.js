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

    function logPerformanceMetrics() {
        if (!window.performance || !window.performance.getEntriesByType) return;
        const [nav] = window.performance.getEntriesByType('navigation');
        if (!nav) return;

        window.addEventListener('load', () => {
            const pageLoadTime = Math.round(nav.loadEventEnd - nav.startTime);
            const connectTime = Math.round(nav.responseEnd - nav.requestStart);
            const renderTime = Math.round(nav.domComplete - nav.domLoading);

            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('=== Performance Metrics ===');
                console.log('Page Load Time:', pageLoadTime + 'ms');
                console.log('Connect Time:', connectTime + 'ms');
                console.log('Render Time:', renderTime + 'ms');
            }
        });
    }

    logPerformanceMetrics();



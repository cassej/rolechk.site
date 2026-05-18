/* ── THEME ── */
(function() {
    if (!('theme' in localStorage)) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches)
            document.documentElement.classList.add('dark');
    } else if (localStorage.theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    updateThemeIcons();
})();

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    const sun = document.getElementById('sun-icon');
    const moon = document.getElementById('moon-icon');
    if (sun) sun.classList.toggle('hidden', !isDark);
    if (moon) moon.classList.toggle('hidden', isDark);
    if (typeof lucide !== 'undefined') setTimeout(() => lucide.createIcons(), 0);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!('theme' in localStorage)) {
        document.documentElement.classList.toggle('dark', e.matches);
        updateThemeIcons();
    }
});

/* ── COOKIE BANNER ── */

function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    if (localStorage.getItem('cookieConsent')) { banner.remove(); return; }
    banner.classList.remove('hidden');
    document.getElementById('cookie-accept-btn')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.remove();
    });
    document.getElementById('cookie-reject-btn')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        banner.remove();
    });
}

/* ── LANGUAGE SWITCHER ── */

function switchLang(newLang) {
    const path = window.location.pathname;
    const newPath = path.replace(/^\/(en|es|zh)\/?/, '/' + newLang + '/');
    window.location.href = newPath;
}

function initLangSelect() {
    const sel = document.getElementById('lang-select');
    if (!sel) return;
    sel.addEventListener('change', e => switchLang(e.target.value));
}

document.addEventListener('DOMContentLoaded', () => {
    initCookieBanner();
    initLangSelect();
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
});

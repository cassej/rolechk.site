const translationsCache = {};
const testDataCache = {};
let currentLang = localStorage.getItem('lang') || 'en';

function getT() {
    return translationsCache[currentLang];
}

function initTheme() {
    if (!('theme' in localStorage)) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
    } else if (localStorage.theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    updateThemeIcons();
}

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
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!('theme' in localStorage)) {
        document.documentElement.classList.toggle('dark', e.matches);
        updateThemeIcons();
    }
});

async function loadTranslations(lang) {
    if (translationsCache[lang]) return translationsCache[lang];
    const res = await fetch(`/${lang}.json`);
    if (!res.ok) throw new Error(`Failed to load ${lang}`);
    const data = await res.json();
    translationsCache[lang] = data;
    return data;
}

async function loadTestData(lang, testId) {
    const key = `${lang}_${testId}`;
    if (testDataCache[key]) return testDataCache[key];
    const res = await fetch(`/${testId}/${lang}.json`);
    if (!res.ok) throw new Error(`Failed to load ${testId}/${lang}`);
    const data = await res.json();
    testDataCache[key] = data;
    return data;
}

function detectTestId() {
    const m = window.location.pathname.match(/\/(visioner|integrator)(\/|$)/);
    return m ? m[1] : null;
}

async function ensureTestData(lang, testId) {
    if (!testId) return;
    const t = getT();
    if (!t) return;
    if (t.tests && t.tests[testId] && t.tests[testId].questions) return;
    const testData = await loadTestData(lang, testId);
    t.tests = t.tests || {};
    t.tests[testId] = testData;
}

async function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    await loadTranslations(lang);

    const page = document.body.dataset.page;
    let testId = null;
    if (page === 'quiz') testId = detectTestId();
    else if (page === 'result') testId = sessionStorage.getItem('quizTestId');
    await ensureTestData(lang, testId);

    if (page === 'home') { renderTestGrid(); renderBlogList(); }
    else if (page === 'quiz') renderQuestion();
    else if (page === 'result') renderResult();
    else if (page === 'blog') renderBlogList();
    else if (page === 'article') renderArticle();
    else if (page === 'cookie') renderCookieContent();
    updateStaticTexts();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateStaticTexts() {
    const t = getT();
    if (!t) return;
    const el = id => document.getElementById(id);
    if (el('home-title')) el('home-title').textContent = t.home.title;
    if (el('home-subtitle')) el('home-subtitle').textContent = t.home.subtitle;
    if (el('blog-title')) el('blog-title').textContent = t.blog.title;
    if (el('cookie-title')) el('cookie-title').textContent = t.cookie.title;
    if (el('cookie-banner-text')) el('cookie-banner-text').textContent = t.cookie.banner;
    if (el('disclaimer-text')) el('disclaimer-text').textContent = t.disclaimer;
    if (el('meta-res-title')) el('meta-res-title').textContent = t.quiz.resTitle;
    setCookieBtnText(t.cookie.accept);
    setCookieRejectBtnText(t.cookie.reject);
}

/* ── HOME ── */

function renderTestGrid() {
    const t = getT();
    if (!t) return;
    const grid = document.getElementById('test-grid');
    if (!grid) return;
    grid.innerHTML = '';
    t.home.tests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card bg-white dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 rounded-2xl sm:rounded-3xl p-8 sm:p-10 flex flex-col cursor-pointer hover:border-brand/40 dark:hover:border-brand-light/40 card-hover';
        card.innerHTML = `
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-subtle dark:bg-stone-800 mb-5">
                <i data-lucide="clipboard-list" class="w-7 h-7 text-brand dark:text-brand-light"></i>
            </div>
            <h3 class="font-semibold text-stone-900 dark:text-stone-50 text-xl">${test.title}</h3>
            <p class="text-base text-stone-500 dark:text-stone-400 mt-3 leading-relaxed flex-grow">${test.desc}</p>
            <div class="flex items-center justify-between mt-8 pt-6 border-t border-stone-200/60 dark:border-stone-700/60">
                <span class="text-sm text-stone-400 dark:text-stone-500">${test.info}</span>
                <button class="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover dark:bg-brand-light dark:hover:bg-brand text-white dark:text-stone-900 text-sm font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer">
                    ${test.cta}
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        card.querySelector('button').addEventListener('click', e => {
            e.stopPropagation();
            startTest(test.id);
        });
        card.addEventListener('click', () => startTest(test.id));
        grid.appendChild(card);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function startTest(id) {
    window.location.href = `/${id}/`;
}

function setCookieBtnText(label) {
    const btn = document.getElementById('cookie-accept-btn');
    if (!btn) return;
    btn.replaceChildren();
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'check');
    icon.className = 'w-3.5 h-3.5';
    btn.append(icon, ' ' + label);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setCookieRejectBtnText(label) {
    const btn = document.getElementById('cookie-reject-btn');
    if (!btn) return;
    btn.replaceChildren();
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'x');
    icon.className = 'w-3.5 h-3.5';
    btn.append(icon, ' ' + label);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initCookieBanner() {
    if (localStorage.getItem('cookieConsent')) {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.add('hidden');
        return;
    }
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.classList.remove('hidden');

    const accept = document.getElementById('cookie-accept-btn');
    const reject = document.getElementById('cookie-reject-btn');
    if (accept) {
        accept.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.classList.add('hidden');
        });
    }
    if (reject) {
        reject.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'rejected');
            banner.classList.add('hidden');
        });
    }
}

/* ── QUIZ ── */

let currentQuestionIndex = 0;
let totalScore = 0;
let currentTestId = null;

function getCurrentTest() {
    const t = getT();
    if (!t || !t.tests || !currentTestId) return null;
    return t.tests[currentTestId];
}

function startQuiz(testId) {
    currentTestId = testId;
    currentQuestionIndex = 0;
    totalScore = 0;
    const test = getCurrentTest();
    if (!test || !test.questions || !test.questions.length) return;
    renderQuestion();
}

function renderQuestion() {
    const t = getT();
    const test = getCurrentTest();
    if (!t || !test || !test.questions) return;
    if (currentQuestionIndex >= test.questions.length) {
        finishQuiz();
        return;
    }

    const q = test.questions[currentQuestionIndex];
    document.getElementById('question-text').textContent = q.text;

    const progress = Math.round(((currentQuestionIndex + 1) / test.questions.length) * 100);
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = `${progress}%`;
    const pt = document.getElementById('progress-text');
    if (pt) pt.textContent = t.quiz.qOf.replace('{n}', currentQuestionIndex + 1).replace('{max}', test.questions.length);
    const pp = document.getElementById('progress-percent');
    if (pp) pp.textContent = `${progress}%`;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    const labels = ['A', 'B', 'C', 'D', 'E'];
    q.options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn w-full flex items-center gap-4 bg-white/15 hover:bg-white/25 dark:bg-white/5 dark:hover:bg-white/15 border border-white/20 hover:border-white/40 rounded-2xl p-4 sm:p-5 text-left cursor-pointer transition-all';
        btn.innerHTML = `
            <span class="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold text-white/70 bg-white/10 border border-white/20">${labels[i]}</span>
            <span class="text-base sm:text-lg font-medium text-white/90 leading-snug">${option.text}</span>
        `;
        btn.onclick = () => handleAnswer(option.score);
        container.appendChild(btn);
    });
}

function handleAnswer(score) {
    totalScore += score;
    currentQuestionIndex++;
    const test = getCurrentTest();
    if (!test || !test.questions) return;
    if (currentQuestionIndex < test.questions.length) {
        renderQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    const test = getCurrentTest();
    if (!test || !test.questions) return;
    const max = test.questions.length * 5;
    const finalScore = Math.min(100, Math.round((totalScore / max) * 100));
    sessionStorage.setItem('quizScore', finalScore);
    sessionStorage.setItem('quizTestId', currentTestId);
    window.location.href = '/result.html';
}

/* ── RESULT ── */

function renderResult() {
    const t = getT();
    if (!t || !t.tests) return;
    const score = parseInt(sessionStorage.getItem('quizScore')) || 0;
    const testId = sessionStorage.getItem('quizTestId') || 'visioner';
    const test = t.tests[testId];
    if (!test || !test.results) return;

    if (document.getElementById('score-value')) {
        document.getElementById('score-value').textContent = score;
    }

    const result = test.results.find(r => score >= r.min);
    if (result) {
        if (document.getElementById('status-title')) {
            document.getElementById('status-title').textContent = result.title;
        }
        if (document.getElementById('status-desc')) {
            document.getElementById('status-desc').textContent = result.desc;
        }
    }

    renderSocialButtons(score);
}

function renderSocialButtons(score) {
    const t = getT();
    if (!t) return;
    const container = document.getElementById('social-share-buttons');
    if (!container) return;
    container.innerHTML = '';

    const shareUrl = encodeURIComponent(window.location.origin);
    const shareText = encodeURIComponent(t.result.shareText.replace('{score}', score));

    const platforms = [
        { icon: 'facebook', label: t.result.facebook, color: 'bg-[#1877F2] hover:bg-[#166fe5]', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
        { icon: 'twitter', label: t.result.x, color: 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900', url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` },
        { icon: 'linkedin', label: t.result.linkedin, color: 'bg-[#0A66C2] hover:bg-[#0958a8]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
        { icon: 'message-circle', label: t.result.reddit, color: 'bg-[#FF4500] hover:bg-[#e03d00]', url: `https://reddit.com/submit?url=${shareUrl}&title=${shareText}` }
    ];

    platforms.forEach(p => {
        const btn = document.createElement('a');
        btn.href = p.url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.className = `social-btn ${p.color} text-white text-xs font-semibold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5`;
        btn.innerHTML = `<i data-lucide="${p.icon}" class="w-3.5 h-3.5"></i> ${p.label}`;
        container.appendChild(btn);
    });

    const copyBtn = document.createElement('button');
    copyBtn.className = 'social-btn bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 text-xs font-semibold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer';
    copyBtn.innerHTML = `<i data-lucide="copy" class="w-3.5 h-3.5"></i> ${t.result.copyLink}`;
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(window.location.origin).then(() => {
            copyBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> ${t.result.copied}`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(() => {
                copyBtn.innerHTML = `<i data-lucide="copy" class="w-3.5 h-3.5"></i> ${t.result.copyLink}`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 2000);
        });
    };
    container.appendChild(copyBtn);

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ── BLOG ── */

function renderBlogList() {
    const t = getT();
    if (!t || !t.blog || !t.blog.articles) return;
    const list = document.getElementById('blog-list');
    if (!list) return;
    list.innerHTML = '';

    t.blog.articles.forEach((article, index) => {
        const card = document.createElement('div');
        card.className = 'blog-card bg-white dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 rounded-2xl sm:rounded-3xl p-8 sm:p-10 cursor-pointer hover:border-brand/40 dark:hover:border-brand-light/40 card-hover';
        card.innerHTML = `
            <div class="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500 mb-4">
                <i data-lucide="calendar" class="w-4 h-4"></i>
                <span>${article.date}</span>
            </div>
            <h3 class="font-semibold text-stone-900 dark:text-stone-50 text-xl">${article.title}</h3>
            <p class="text-base text-stone-500 dark:text-stone-400 mt-3 leading-relaxed">${article.excerpt}</p>
            <span class="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-brand dark:text-brand-light">
                ${t.blog.readMore} <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </span>
        `;
        card.addEventListener('click', () => {
            window.location.href = `/article.html?id=${index}`;
        });
        list.appendChild(card);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ── ARTICLE ── */

function renderArticle() {
    const t = getT();
    if (!t || !t.blog || !t.blog.articles) return;
    const params = new URLSearchParams(window.location.search);
    const index = parseInt(params.get('id')) || 0;
    const article = t.blog.articles[index];
    if (!article) return;

    const container = document.getElementById('article-content');
    if (!container) return;
    container.innerHTML = `
        <div class="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 mb-4">
            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
            <span>${article.date}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-50 mb-8 tracking-tight">${article.title}</h1>
        ${article.content}
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ── COOKIE ── */

function renderCookieContent() {
    const t = getT();
    if (!t) return;
    const container = document.getElementById('cookie-content');
    if (!container) return;
    container.innerHTML = t.cookie.content;
}

/* ── INIT ── */

function initLangSelect() {
    const sel = document.getElementById('lang-select');
    if (!sel) return;
    sel.value = currentLang;
    sel.addEventListener('change', e => changeLanguage(e.target.value));
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
}

(async () => {
    initTheme();
    initLangSelect();
    initThemeToggle();

    const page = document.body.dataset.page;
    let testId = null;
    if (page === 'quiz') testId = detectTestId();
    else if (page === 'result') testId = sessionStorage.getItem('quizTestId');

    try {
        await loadTranslations(currentLang);
        if (testId) await ensureTestData(currentLang, testId);
    } catch (e) {
        currentLang = 'en';
        localStorage.setItem('lang', 'en');
        await loadTranslations('en');
        if (testId) await ensureTestData('en', testId);
    }

    const t = getT();
    if (!t) return;

    updateStaticTexts();

    if (page === 'home') {
        initCookieBanner();
        renderTestGrid();
        renderBlogList();
    } else if (page === 'quiz') {
        if (testId) startQuiz(testId);
    } else if (page === 'result') {
        renderResult();
    } else if (page === 'blog') {
        renderBlogList();
    } else if (page === 'article') {
        renderArticle();
    } else if (page === 'cookie') {
        renderCookieContent();
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
})();

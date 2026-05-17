const translationsCache = {};
let currentLang = 'en';
let currentQuestionIndex = 0;
let totalScore = 0;
let currentTestId = null;
let currentArticleId = null;

function initTheme() {
    if (!('theme' in localStorage)) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } else {
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    updateThemeIcons();
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('sun-icon').classList.toggle('hidden', !isDark);
    document.getElementById('moon-icon').classList.toggle('hidden', isDark);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (!('theme' in localStorage)) {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateThemeIcons();
    }
});

async function loadTranslations(lang) {
    if (translationsCache[lang]) return translationsCache[lang];
    const res = await fetch(`integrator/${lang}.json`);
    if (!res.ok) throw new Error(`Failed to load ${lang}`);
    const data = await res.json();
    translationsCache[lang] = data;
    return data;
}

function getT() {
    return translationsCache[currentLang];
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${id}`);
    if (screen) screen.classList.add('active');

    document.querySelectorAll('.nav-link[data-screen]').forEach(link => {
        link.classList.toggle('active', link.dataset.screen === id);
    });
}

function initNav() {
    document.querySelectorAll('.nav-link[data-screen]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const screen = link.dataset.screen;
            if (screen === 'home') showHome();
            else if (screen === 'blog') showBlog();
            else if (screen === 'cookie') showCookie();
        });
    });

    document.getElementById('logo-link').addEventListener('click', e => {
        e.preventDefault();
        showHome();
    });

    document.getElementById('back-to-tests-btn').addEventListener('click', () => {
        showHome();
    });

    document.getElementById('back-to-blog-btn').addEventListener('click', () => {
        showBlog();
    });

    document.querySelectorAll('a[data-screen="cookie"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            showCookie();
        });
    });
}

async function changeLanguage(lang) {
    currentLang = lang;
    await loadTranslations(lang);
    const t = getT();
    if (!t) return;

    const activeScreen = document.querySelector('.screen.active');
    const id = activeScreen ? activeScreen.id.replace('screen-', '') : 'home';

    document.getElementById('home-title').textContent = t.home.title;
    document.getElementById('home-subtitle').textContent = t.home.subtitle;
    document.getElementById('blog-title').textContent = t.blog.title;
    document.getElementById('cookie-title').textContent = t.cookie.title;
    document.getElementById('cookie-banner-text').textContent = t.cookie.banner;
    document.getElementById('cookie-accept-btn').textContent = t.cookie.accept;
    document.getElementById('disclaimer-text').textContent = t.disclaimer;
    document.getElementById('meta-res-title').textContent = t.quiz.resTitle;
    document.getElementById('back-to-tests-btn').textContent = 'Back to Tests';

    if (id === 'home') renderTestGrid();
    else if (id === 'blog') renderBlogList();
    else if (id === 'article' && currentArticleId) renderArticle(currentArticleId);
    else if (id === 'cookie') renderCookieContent();
    else if (id === 'quiz') {
        if (!document.getElementById('result-view').classList.contains('hidden')) {
            showResults();
        } else if (getT().questions) {
            renderQuestion();
        }
    }
}

function showHome() {
    showScreen('home');
    renderTestGrid();
}

function renderTestGrid() {
    const t = getT();
    if (!t) return;
    const grid = document.getElementById('test-grid');
    grid.innerHTML = '';
    t.home.tests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 rounded-xl p-5 sm:p-6 flex flex-col cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500';
        card.innerHTML = `
            <h3 class="font-bold text-slate-900 dark:text-white text-base sm:text-lg">${test.title}</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed flex-grow">${test.desc}</p>
            <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <span class="text-[11px] text-slate-400 dark:text-slate-500">${test.info}</span>
                <button class="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer">${test.cta}</button>
            </div>
        `;
        card.querySelector('button').addEventListener('click', e => {
            e.stopPropagation();
            startTest(test.id);
        });
        card.addEventListener('click', () => startTest(test.id));
        grid.appendChild(card);
    });
}

function startTest(id) {
    const t = getT();
    if (!t || !t.questions) return;
    currentTestId = id;
    currentQuestionIndex = 0;
    totalScore = 0;

    document.getElementById('result-view').classList.add('hidden');
    document.getElementById('quiz-view').classList.remove('hidden');

    showScreen('quiz');
    renderQuestion();
}

function renderQuestion() {
    const t = getT();
    if (!t || !t.questions) return;

    const currentQuestion = t.questions[currentQuestionIndex];
    document.getElementById('question-text').innerText = currentQuestion.text;

    const progress = Math.round(((currentQuestionIndex + 1) / t.questions.length) * 100);
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-text').innerText = t.quiz.qOf.replace('{n}', currentQuestionIndex + 1).replace('{max}', t.questions.length);
    document.getElementById('progress-percent').innerText = `${progress}%`;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.className = "choice-btn w-full text-left bg-slate-50 dark:bg-slate-700/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-3 sm:p-4 font-medium text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 cursor-pointer transition-all shadow-xs";
        button.innerText = option.text;
        button.onclick = () => handleAnswer(option.score);
        container.appendChild(button);
    });
}

function handleAnswer(score) {
    totalScore += score;
    currentQuestionIndex++;

    const t = getT();
    if (!t || !t.questions) return;
    if (currentQuestionIndex < t.questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-view').classList.add('hidden');
    document.getElementById('result-view').classList.remove('hidden');

    const t = getT();
    if (!t || !t.questions) return;
    const maxPossibleScore = t.questions.length * 5;
    const finalScore = Math.min(100, Math.round((totalScore / maxPossibleScore) * 100));

    document.getElementById('score-display').innerText = `${finalScore} / 100`;

    const result = t.results.find(r => finalScore >= r.min);
    document.getElementById('status-title').innerText = result.title;
    document.getElementById('status-desc').innerText = result.desc;

    renderSocialButtons(finalScore);
}

function renderSocialButtons(score) {
    const t = getT();
    if (!t) return;
    const container = document.getElementById('social-share-buttons');
    container.innerHTML = '';

    const shareUrl = encodeURIComponent(window.location.origin);
    const shareText = encodeURIComponent(t.result.shareText.replace('{score}', score));

    const platforms = [
        { id: 'facebook', label: t.result.facebook, color: 'bg-[#1877F2] hover:bg-[#166fe5]', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
        { id: 'x', label: t.result.x, color: 'bg-[#000000] dark:bg-[#e8e8e8] hover:bg-[#333] dark:hover:bg-[#ccc]', url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` },
        { id: 'linkedin', label: t.result.linkedin, color: 'bg-[#0A66C2] hover:bg-[#0958a8]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
        { id: 'reddit', label: t.result.reddit, color: 'bg-[#FF4500] hover:bg-[#e03d00]', url: `https://reddit.com/submit?url=${shareUrl}&title=${shareText}` }
    ];

    platforms.forEach(p => {
        const btn = document.createElement('a');
        btn.href = p.url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.className = `social-btn ${p.color} text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5`;
        btn.innerHTML = `${p.label}`;
        container.appendChild(btn);
    });

    const copyBtn = document.createElement('button');
    copyBtn.className = 'social-btn bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5';
    copyBtn.textContent = t.result.copyLink;
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(window.location.origin).then(() => {
            copyBtn.textContent = t.result.copied;
            setTimeout(() => { copyBtn.textContent = t.result.copyLink; }, 2000);
        });
    };
    container.appendChild(copyBtn);
}

function showBlog() {
    showScreen('blog');
    renderBlogList();
}

function renderBlogList() {
    const t = getT();
    if (!t || !t.blog || !t.blog.articles) return;
    const list = document.getElementById('blog-list');
    list.innerHTML = '';

    t.blog.articles.forEach((article, index) => {
        const card = document.createElement('div');
        card.className = 'blog-card bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 rounded-xl p-5 sm:p-6 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500';
        card.innerHTML = `
            <p class="text-[11px] text-slate-400 dark:text-slate-500 mb-1">${article.date}</p>
            <h3 class="font-bold text-slate-900 dark:text-white text-base sm:text-lg">${article.title}</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">${article.excerpt}</p>
            <span class="inline-block mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">${t.blog.readMore} &rarr;</span>
        `;
        card.addEventListener('click', () => showArticle(index));
        list.appendChild(card);
    });
}

function showArticle(index) {
    currentArticleId = index;
    showScreen('article');
    renderArticle(index);
}

function renderArticle(index) {
    const t = getT();
    if (!t || !t.blog || !t.blog.articles) return;
    const article = t.blog.articles[index];
    if (!article) return;

    const container = document.getElementById('article-content');
    container.innerHTML = `
        <p class="text-xs text-slate-400 dark:text-slate-500 mb-1">${article.date}</p>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">${article.title}</h1>
        ${article.content}
    `;
}

function showCookie() {
    showScreen('cookie');
    renderCookieContent();
}

function renderCookieContent() {
    const t = getT();
    if (!t) return;
    document.getElementById('cookie-title').textContent = t.cookie.title;
    document.getElementById('cookie-content').innerHTML = t.cookie.content;
}

function initCookieBanner() {
    if (localStorage.getItem('cookieConsent')) {
        document.getElementById('cookie-banner').classList.add('hidden');
        return;
    }
    document.getElementById('cookie-banner').classList.remove('hidden');
    document.getElementById('cookie-accept-btn').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        document.getElementById('cookie-banner').classList.add('hidden');
    });
}

document.getElementById('lang-select').addEventListener('change', e => changeLanguage(e.target.value));
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

initTheme();
initNav();
initCookieBanner();

(async () => {
    await loadTranslations('en');
    const t = getT();
    if (!t) return;

    document.getElementById('home-title').textContent = t.home.title;
    document.getElementById('home-subtitle').textContent = t.home.subtitle;
    document.getElementById('blog-title').textContent = t.blog.title;
    document.getElementById('disclaimer-text').textContent = t.disclaimer;
    document.getElementById('cookie-banner-text').textContent = t.cookie.banner;
    document.getElementById('cookie-accept-btn').textContent = t.cookie.accept;
    document.getElementById('meta-res-title').textContent = t.quiz.resTitle;
    document.getElementById('back-to-tests-btn').textContent = 'Back to Tests';

    renderTestGrid();
})();

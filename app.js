const translationsCache = {};
let currentLang = 'en';
let currentQuestionIndex = 0;
let totalScore = 0;

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

async function changeLanguage(lang) {
    currentLang = lang;
    await loadTranslations(lang);
    updateMetaTexts();
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        renderQuestion();
    } else if (!document.getElementById('result-screen').classList.contains('hidden')) {
        calculateAndShowResults();
    }
}

function updateMetaTexts() {
    const t = translationsCache[currentLang];
    if (!t) return;
    document.getElementById('meta-title').innerHTML = t.title;
    document.getElementById('meta-desc').innerHTML = t.desc;
    document.getElementById('meta-info').innerHTML = t.info;
    document.getElementById('start-btn').innerHTML = t.startBtn;
    document.getElementById('disclaimer-text').innerHTML = t.disclaimer;
    document.getElementById('meta-res-title').innerHTML = t.resTitle;
    document.getElementById('share-btn').innerHTML = t.shareBtn;
}

function startQuiz() {
    const t = translationsCache[currentLang];
    if (!t) return;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    currentQuestionIndex = 0;
    totalScore = 0;
    renderQuestion();
}

function renderQuestion() {
    const t = translationsCache[currentLang];
    if (!t) return;

    const currentQuestion = t.questions[currentQuestionIndex];
    document.getElementById('question-text').innerText = currentQuestion.text;

    const progress = Math.round(((currentQuestionIndex + 1) / t.questions.length) * 100);
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-text').innerText = t.qOf.replace('{n}', currentQuestionIndex + 1).replace('{max}', t.questions.length);
    document.getElementById('progress-percent').innerText = `${progress}%`;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.className = "choice-btn w-full text-left bg-slate-50 dark:bg-slate-700/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-4 font-medium text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 cursor-pointer transition-all shadow-xs";
        button.innerText = option.text;
        button.onclick = () => handleAnswer(option.score);
        container.appendChild(button);
    });
}

function handleAnswer(score) {
    totalScore += score;
    currentQuestionIndex++;

    const t = translationsCache[currentLang];
    if (!t) return;
    if (currentQuestionIndex < t.questions.length) {
        renderQuestion();
    } else {
        calculateAndShowResults();
    }
}

function calculateAndShowResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    const t = translationsCache[currentLang];
    if (!t) return;
    const maxPossibleScore = t.questions.length * 5;
    const finalScore = Math.min(100, Math.round((totalScore / maxPossibleScore) * 100));

    document.getElementById('score-display').innerText = `${finalScore} / 100`;

    const result = t.results.find(r => finalScore >= r.min);
    document.getElementById('status-title').innerText = result.title;
    document.getElementById('status-desc').innerText = result.desc;
}

function copyShareLink() {
    const t = translationsCache[currentLang];
    if (!t) return;
    const rawString = `paei-${totalScore}`;
    const encodedHash = btoa(rawString).replace(/=/g, '');
    const shareUrl = `${window.location.origin}/share/${encodedHash}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        const shareBtn = document.getElementById('share-btn');
        shareBtn.innerText = t.copied;
        shareBtn.className = "w-full bg-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl transition text-sm sm:text-base shadow-md";

        setTimeout(() => {
            shareBtn.innerText = t.shareBtn;
            shareBtn.className = "w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-sm sm:text-base shadow-md";
        }, 2500);
    });
}

document.getElementById('lang-select').addEventListener('change', e => changeLanguage(e.target.value));
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('start-btn').addEventListener('click', startQuiz);
document.getElementById('share-btn').addEventListener('click', copyShareLink);

initTheme();

(async () => {
    await loadTranslations('en');
    updateMetaTexts();
})();

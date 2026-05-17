const translations = {
    en: {
        title: "What is Your Management Style?",
        desc: "Discover your dominant professional archetype. Find out how you handle challenges and lead projects.",
        info: "⏱️ 20 questions • Takes 2 minutes",
        startBtn: "Start Free Test",
        qOf: "Question {n} of {max}",
        resTitle: "Your Dominant Profile",
        shareBtn: "Share Verification Link",
        copied: "✓ Link Copied!",
        disclaimer: "Disclaimer: This tool is inspired by Dr. Ichak Adizes' PAEI framework but is unofficial and for educational use only. No official Adizes test items are used. All responses stay on your device and are not stored or shared.",
        questions: [
            {
                text: "When resources are limited, you:",
                options: [
                    { text: "Make sure everyone feels supported.", score: 1 },
                    { text: "Find ways to make things more efficient.", score: 2 },
                    { text: "Get creative about how to do more with less.", score: 3 },
                    { text: "Focus on the most important tasks.", score: 4 }
                ]
            },
            {
                text: "Your team prefers you because you:",
                options: [
                    { text: "Keep operations fully organized and clear.", score: 2 },
                    { text: "Bring visionary ideas and open new horizons.", score: 3 },
                    { text: "Deliver exact results under any pressure.", score: 1 }
                ]
            }
        ],
        results: {
            high: { title: "High Entrepreneurial Drive 🚀", desc: "You focus on long-term growth, vision, and changes." },
            low: { title: "Structured Operator Profile ⚙️", desc: "Your strength lies in building stable, solid systems and clean processes." }
        }
    },
    es: {
        title: "¿Cuál es tu Estilo de Gestión?",
        desc: "Descubre tu arquetipo profesional dominante. Conoce cómo manejas los desafíos y lideras proyectos.",
        info: "⏱️ 20 preguntas • Demora 2 minutos",
        startBtn: "Iniciar Prueba Gratis",
        qOf: "Pregunta {n} de {max}",
        resTitle: "Tu Perfil Dominante",
        shareBtn: "Compartir Enlace de Verificación",
        copied: "✓ ¡Enlace Copiado!",
        disclaimer: "Descargo de responsabilidad: Esta herramienta está inspirada en el marco PAEI del Dr. Ichak Adizes, pero es no oficial y solo para uso educativo. No se utilizan elementos oficiales de la prueba de Adizes. Todas las respuestas permanecen en su dispositivo y no se almacenan ni se comparten.",
        questions: [
            {
                text: "Cuando los recursos son limitados, tú:",
                options: [
                    { text: "Te aseguras de que todos se sientan apoyados.", score: 1 },
                    { text: "Buscas formas de hacer las cosas más eficientes.", score: 2 },
                    { text: "Te vuelves creativo para hacer más con menos.", score: 3 },
                    { text: "Te enfocas estrictamente en las tareas más importantes.", score: 4 }
                ]
            },
            {
                text: "Tu equipo te prefiere porque tú:",
                options: [
                    { text: "Mantienes las operaciones totalmente organizadas.", score: 2 },
                    { text: "Traes ideas visionarias y abres nuevos horizontes.", score: 3 },
                    { text: "Entregas resultados exactos bajo cualquier presión.", score: 1 }
                ]
            }
        ],
        results: {
            high: { title: "Alto Impulso Emprendedor 🚀", desc: "Te enfocas en el crecimiento a largo plazo, la visión y los cambios estructurales." },
            low: { title: "Perfil de Operador Estructurado ⚙️", desc: "Tu fuerza radica en construir sistemas estables, sólidos y procesos limpios." }
        }
    },
    zh: {
        title: "你的管理风格是什么？",
        desc: "探索你的主导职业原型。了解你如何应对挑战并领导项目。",
        info: "⏱️ 20 道题 • 仅需 2 分钟",
        startBtn: "开始免费测试",
        qOf: "第 {n} 题，共 {max} 题",
        resTitle: "你的主导特质",
        shareBtn: "分享验证链接",
        copied: "✓ 链接已复制！",
        disclaimer: "免责声明：本工具受 Ichak Adizes 博士的 PAEI 框架启发，但为非官方工具，仅供教育使用。未使用官方 Adizes 测试题。所有回答均保存在您的设备上，不会被存储或分享。",
        questions: [
            {
                text: "当资源有限时，你会：",
                options: [
                    { text: "确保每个人都感受到支持。", score: 1 },
                    { text: "寻找提高效率的方法。", score: 2 },
                    { text: "发挥创造力，用更少的资源做更多的事。", score: 3 },
                    { text: "专注于最重要的任务。", score: 4 }
                ]
            },
            {
                text: "你的团队更喜欢你，因为你：",
                options: [
                    { text: "让业务保持完全井井有条和清晰。", score: 2 },
                    { text: "带来远见卓识的想法并开拓新 horizons。", score: 3 },
                    { text: "在任何压力下都能交付确切的结果。", score: 1 }
                ]
            }
        ],
        results: {
            high: { title: "高创业驱动型 🚀", desc: "你专注于长期增长、愿景和变革。" },
            low: { title: "结构化执行者特质 ⚙️", desc: "你的优势在于建立稳定、扎实的系统和干净的流程。" }
        }
    }
};

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

function changeLanguage(lang) {
    currentLang = lang;
    updateMetaTexts();
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        renderQuestion();
    } else if (!document.getElementById('result-screen').classList.contains('hidden')) {
        calculateAndShowResults();
    }
}

function updateMetaTexts() {
    const t = translations[currentLang];
    document.getElementById('meta-title').innerHTML = t.title;
    document.getElementById('meta-desc').innerHTML = t.desc;
    document.getElementById('meta-info').innerHTML = t.info;
    document.getElementById('start-btn').innerHTML = t.startBtn;
    document.getElementById('disclaimer-text').innerHTML = t.disclaimer;
    document.getElementById('meta-res-title').innerHTML = t.resTitle;
    document.getElementById('share-btn').innerHTML = t.shareBtn;
}

function startQuiz() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    currentQuestionIndex = 0;
    totalScore = 0;
    renderQuestion();
}

function renderQuestion() {
    const t = translations[currentLang];
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

    const t = translations[currentLang];
    if (currentQuestionIndex < t.questions.length) {
        renderQuestion();
    } else {
        calculateAndShowResults();
    }
}

function calculateAndShowResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    const t = translations[currentLang];
    const maxPossibleScore = t.questions.length * 4;
    const finalScore = Math.min(100, Math.round((totalScore / maxPossibleScore) * 100));

    document.getElementById('score-display').innerText = `${finalScore} / 100`;

    if (finalScore >= 65) {
        document.getElementById('status-title').innerText = t.results.high.title;
        document.getElementById('status-desc').innerText = t.results.high.desc;
    } else {
        document.getElementById('status-title').innerText = t.results.low.title;
        document.getElementById('status-desc').innerText = t.results.low.desc;
    }
}

function copyShareLink() {
    const t = translations[currentLang];
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
updateMetaTexts();

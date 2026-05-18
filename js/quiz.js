/* ── QUIZ LOGIC ── */

(function() {
    const KEY_PREFIX = window.QUIZ_TEST_ID || 'quiz';
    const questions = window.QUIZ_DATA || [];
    const results = window.RESULT_DATA || [];
    let current = 0;
    let scores = new Array(questions.length).fill(0);

    function renderQuestion() {
        const q = questions[current];
        const total = questions.length;
        document.getElementById('progress-text').textContent =
            (window.QUIZ_Q_OF || 'Question {n} of {max}').replace('{n}', current + 1).replace('{max}', total);
        document.getElementById('progress-percent').textContent =
            Math.round(((current) / total) * 100) + '%';
        document.getElementById('progress-bar').style.width =
            ((current + 1) / total) * 100 + '%';
        document.getElementById('question-text').textContent = q.text;

        const container = document.getElementById('options-container');
        container.innerHTML = '';
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn w-full flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-left transition-all cursor-pointer group';
            const isSelected = scores[current] === opt.score;
            if (isSelected) {
                btn.className = 'option-btn w-full flex items-center justify-between bg-white/20 border border-white/60 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-left transition-all cursor-pointer group';
            }
            btn.innerHTML = `
                <span class="text-sm sm:text-base font-medium text-white/90 group-hover:text-white">${opt.text}</span>
                <span class="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/30 shrink-0 ml-4 ${isSelected ? 'bg-white border-white' : ''}">
                    <span class="w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-teal-700' : ''}"></span>
                </span>
            `;
            btn.addEventListener('click', () => selectOption(i));
            container.appendChild(btn);
        });

        renderNavButtons();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function selectOption(index) {
        scores[current] = questions[current].options[index].score;
        if (current < questions.length - 1) {
            current++;
            renderQuestion();
        } else {
            finishQuiz();
        }
    }

    function renderNavButtons() {
        const container = document.getElementById('options-container');
        const nav = document.createElement('div');
        nav.className = 'flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10';
        if (current > 0) {
            const prev = document.createElement('button');
            prev.className = 'inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-0';
            prev.innerHTML = `<i data-lucide="arrow-left" class="w-4 h-4"></i> ${window.QUIZ_BACK || 'Back'}`;
            prev.addEventListener('click', () => { current--; renderQuestion(); });
            nav.appendChild(prev);
        } else {
            nav.appendChild(document.createElement('div'));
        }
        container.appendChild(nav);
    }

    function finishQuiz() {
        const total = scores.reduce((a, b) => a + b, 0);
        sessionStorage.setItem('quizScore', total);
        sessionStorage.setItem('quizMax', questions.length * 5);
        const resultPath = window.location.pathname.replace(/\/$/, '') + '/result.html';
        window.location.href = resultPath;
    }

    document.addEventListener('DOMContentLoaded', renderQuestion);
})();

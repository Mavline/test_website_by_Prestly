// Archetype mapping - maps internal profile types to display names
const ARCHETYPE_MAPPING = {
    'strategist': 'Визионер',
    'optimizer': 'Оптимизатор',
    'pioneer': 'Предприниматель',
    'analyst': 'Аналитик',
    'pragmatist': 'Прагматик',
    'enthusiast': 'Энтузиаст',
    'skeptic': 'Скептик',
    'observer': 'Наблюдатель',
    'generalist': 'Универсал',
    'seeker': 'Искатель'
};

// All 10 archetypes for the wheel
const ALL_ARCHETYPES = [
    'Оптимизатор',
    'Визионер',
    'Прагматик',
    'Предприниматель',
    'Энтузиаст',
    'Скептик',
    'Наблюдатель',
    'Универсал',
    'Аналитик',
    'Искатель'
];

// Synonyms to map 4-tier labels or close Russian names into wheel archetypes
const ARCHETYPE_SYNONYMS = {
    'Практик': 'Прагматик',
    'Эксперт': 'Оптимизатор',
    'Исследователь': 'Искатель',
    'Наблюдатель': 'Наблюдатель',
    'Стратег': 'Визионер',
    'Координатор': 'Универсал'
};

function resolveArchetypeName(name) {
    if (!name) return 'Оптимизатор';
    // exact
    if (ALL_ARCHETYPES.includes(name)) return name;
    // synonyms
    if (ARCHETYPE_SYNONYMS[name]) return ARCHETYPE_SYNONYMS[name];
    // fuzzy: try by lowercase includes
    const n = String(name).toLowerCase();
    const hit = ALL_ARCHETYPES.find(a => a.toLowerCase().includes(n) || n.includes(a.toLowerCase()));
    return hit || 'Оптимизатор';
}

// Wheel colors - gradient colors for each sector
const WHEEL_COLORS = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#a8dadc',
    '#f1c40f',
    '#e74c3c',
    '#3498db',
    '#9b59b6',
    '#2ecc71',
    '#e67e22'
];

// Global wheel state
let wheelRotation = 0;
let isSpinning = false;
let spinInterval = null;

// Results page functionality
document.addEventListener('DOMContentLoaded', function() {
    const results = JSON.parse(localStorage.getItem('testResults') || '{}');

    if (!results.readinessScore) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: white;">Результаты теста не найдены. <a href="index.html" style="color: #4ecdc4;">Вернуться на главную</a></div>';
        return;
    }

    // Создаём колесо фортуны и запускаем вращение с последующей остановкой на архетипе
    createSpinningWheel();

    // Получаем название архетипа и приводим к валидному элементу колеса
    const archetypeNameRaw = results.archetype || results.profileName || ARCHETYPE_MAPPING[results.profileType] || 'Оптимизатор';
    const archetypeName = resolveArchetypeName(archetypeNameRaw);
    let fullText = (results.personalizedMessage || results.aiGeneratedStrategy || results.message || '').trim();

    // Стартуем быстрое вращение и размытие подписей, затем плавно останавливаемся на выбранном архетипе
    startSpinning();
    setTimeout(() => {
        // Плавно останавливаем колесо на выбранном архетипе
        stopOnArchetype(archetypeName, async () => {
            const profileElement = document.getElementById('profile-type');
            if (profileElement) profileElement.textContent = archetypeName;

            // Если текста нет, пробуем дожать генерацию здесь (ретрай)
            if (!fullText) {
                try {
                    const pending = JSON.parse(localStorage.getItem('pendingAIRequest') || 'null');
                    if (pending && pending.testData) {
                        const resp = await fetch('/api/generate-results', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(pending)
                        });
                        if (resp.ok) {
                            const data = await resp.json();
                            fullText = (data.message || data.aiGeneratedStrategy || '').trim();
                            // Обновляем сохранённые результаты
                            const saved = JSON.parse(localStorage.getItem('testResults') || '{}');
                            saved.personalizedMessage = fullText;
                            saved.aiGeneratedStrategy = fullText;
                            localStorage.setItem('testResults', JSON.stringify(saved));
                            // Убираем метку ретрая
                            localStorage.removeItem('pendingAIRequest');
                        }
                    }
                } catch (e) {
                    console.error('Retry generate-results on results page failed:', e);
                }
            }

            setTimeout(() => revealDescription(fullText), 1000);
        });
    }, 1000);

    // Update score display
    const scoreElement = document.getElementById('scoreNumber');
    if (scoreElement) {
        scoreElement.textContent = results.readinessScore;
    }

    // Текст и заголовок покажем после остановки колеса (см. выше)

    // Generate full personal strategy consultation
    const strategyElement = document.getElementById('personalStrategy');
    if (strategyElement && results.profileType) {
        strategyElement.innerHTML = generatePersonalStrategy(results);
    }

    // Display vector scores for debugging (optional)
    if (results.vectors) {
        console.log('Векторы архетипов:', results.vectors);
        console.log('Доминантный архетип:', results.profileType);
    }

    // Спидометр отключён: запускаем анимацию только если элементы есть в DOM
    if (typeof results.readinessScore === 'number' && document.getElementById('needle')) {
        animateSpeedometer(results.readinessScore);
    }
});

/**
 * Creates the spinning wheel SVG and inserts it into the DOM
 */
function createSpinningWheel() {
    const container = document.getElementById('spinningWheel');
    if (!container) return;

    const isMobile = window.innerWidth <= 768;
    const size = isMobile ? 250 : 300;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    const numSectors = ALL_ARCHETYPES.length;
    const anglePerSector = 360 / numSectors;
    const angleRad = (Math.PI * 2) / numSectors;
    const fontSize = Math.max(10, Math.round(size * 0.045));

    // Build clipPaths for each sector
    let clipDefs = '';
    for (let i = 0; i < numSectors; i++) {
        const startAngle = i * anglePerSector - 90;
        const endAngle = (i + 1) * anglePerSector - 90;
        const sr = (startAngle * Math.PI) / 180;
        const er = (endAngle * Math.PI) / 180;
        const x1 = centerX + radius * Math.cos(sr);
        const y1 = centerY + radius * Math.sin(sr);
        const x2 = centerX + radius * Math.cos(er);
        const y2 = centerY + radius * Math.sin(er);
        const largeArc = anglePerSector > 180 ? 1 : 0;
        const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        clipDefs += `<clipPath id="wheelClip-${i}"><path d="${pathData}"></path></clipPath>`;
    }

    // Create SVG
    let svgHTML = `
        <div class="wheel-container spinning">
            <div class="wheel-pointer"></div>
            <svg id="fortuneWheel" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="spinning-wheel">
                <defs>
                    <filter id="wheelShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                        <feOffset dx="0" dy="2" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5"/>
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    ${clipDefs}
                </defs>
                <g id="fortuneWheelGroup" filter="url(#wheelShadow)" style="transform-box: fill-box; transform-origin: 50% 50%;">
    `;

    // Draw sectors + svg labels clipped to sectors
    for (let i = 0; i < numSectors; i++) {
        const startAngle = i * anglePerSector - 90; // Start from top
        const endAngle = (i + 1) * anglePerSector - 90;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        const largeArc = anglePerSector > 180 ? 1 : 0;
        const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        svgHTML += `<g class="sector" data-index="${i}">`;
        svgHTML += `<path d="${pathData}" fill="${WHEEL_COLORS[i]}" stroke="#ffffff" stroke-width="2" data-index="${i}"/>`;

        const angleMid = (startAngle + endAngle) / 2;
        const textRadius = radius * 0.62;
        const tx = centerX + textRadius * Math.cos((angleMid * Math.PI) / 180);
        const ty = centerY + textRadius * Math.sin((angleMid * Math.PI) / 180);
        const textLen = Math.max(40, Math.round(textRadius * angleRad * 0.85));
        const textRotation = angleMid + 90;

        svgHTML += `<text class="label-text" data-index="${i}" x="${tx}" y="${ty}" fill="#fff" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle" transform="rotate(${textRotation}, ${tx}, ${ty})" clip-path="url(#wheelClip-${i})" lengthAdjust="spacingAndGlyphs" textLength="${textLen}">${ALL_ARCHETYPES[i]}</text>`;
        svgHTML += `</g>`;
    }

    // Add center circle
    svgHTML += `
        <circle cx="${centerX}" cy="${centerY}" r="25" fill="#1a1a2e" stroke="#ffffff" stroke-width="3"/>
        <circle cx="${centerX}" cy="${centerY}" r="15" fill="#4ecdc4" stroke="#ffffff" stroke-width="2"/>
    `;

    svgHTML += `</g></svg></div>`;

    container.innerHTML = svgHTML;
}

/**
 * Starts the wheel spinning continuously
 */
function startSpinning() {
    if (isSpinning) return;

    isSpinning = true;
    const group = document.getElementById('fortuneWheelGroup');
    if (!group) return;

    const wc = document.querySelector('.wheel-container');
    if (wc) wc.classList.add('spinning');

    // Fast continuous rotation
    spinInterval = setInterval(() => {
        wheelRotation += 5; // 5 degrees per frame
        group.style.transform = `rotate(${wheelRotation}deg)`;
    }, 16); // ~60fps
}

/**
 * Stops the wheel on a specific archetype with smooth deceleration
 * @param {string} archetypeName - Name of the archetype to land on
 */
function stopOnArchetype(archetypeName, onStop) {
    if (!isSpinning) return;

    const group = document.getElementById('fortuneWheelGroup');
    if (!group) return;

    // Stop the fast spinning
    clearInterval(spinInterval);
    isSpinning = false;

    // Find the index of the target archetype
    const targetIndex = ALL_ARCHETYPES.indexOf(archetypeName);
    if (targetIndex === -1) {
        console.warn('Archetype not found, using fallback:', archetypeName);
        return stopOnArchetype('Оптимизатор', onStop);
    }

    // Calculate target angle
    const numSectors = ALL_ARCHETYPES.length;
    const anglePerSector = 360 / numSectors;

    // The pointer is at the top (12 o'clock position)
    // We want the target sector to be under the pointer
    // Add extra spins for dramatic effect (3-5 full rotations)
    const extraSpins = 3 + Math.floor(Math.random() * 3);
    const targetAngle = targetIndex * anglePerSector + anglePerSector / 2;

    // Calculate final rotation (normalize current rotation and add target)
    const normalizedCurrent = wheelRotation % 360;
    let targetRotation = extraSpins * 360 + (360 - targetAngle);

    // Adjust to ensure we rotate forward
    if (targetRotation - normalizedCurrent < 360) {
        targetRotation += 360;
    }

    const finalRotation = wheelRotation + (targetRotation - normalizedCurrent);

    // Smooth deceleration animation
    group.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    group.style.transform = `rotate(${finalRotation}deg)`;

    wheelRotation = finalRotation;

    // Optional: highlight the winning sector after animation completes
    setTimeout(() => {
        console.log('Wheel stopped on:', archetypeName);
        highlightWinningSector(archetypeName);
        const wc = document.querySelector('.wheel-container');
        if (wc) wc.classList.remove('spinning');
        if (typeof onStop === 'function') onStop();
    }, 4000);
}

function highlightWinningSector(archetypeName) {
    const idx = ALL_ARCHETYPES.indexOf(archetypeName);
    if (idx === -1) return;
    const path = document.querySelector(`.sector path[data-index="${idx}"]`);
    const text = document.querySelector(`text.label-text[data-index="${idx}"]`);
    if (path) path.classList.add('winning-sector');
    if (text) text.classList.add('winning-label');
}

function revealDescription(fullText) {
    const messageElement = document.getElementById('personalized-message');
    if (!messageElement) return;
    const text = (fullText || '').trim();
    if (!text) return;
    const paragraphs = text.split(/\n{2,}/);
    messageElement.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
}

function displayResults(results, userData) {
    // Display score interpretation
    const interpretation = document.getElementById('scoreInterpretation');
    interpretation.innerHTML = `
        <h3>${getScoreTitle(results.readinessScore)}</h3>
        <p>${results.personalizedMessage}</p>
    `;
    
    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    if (results.recommendations && results.recommendations.length > 0) {
        recommendationsList.innerHTML = results.recommendations.map(rec => 
            `<div class="recommendation-item">💡 ${rec}</div>`
        ).join('');
    } else {
        recommendationsList.innerHTML = '<div class="recommendation-item">💡 Продолжайте изучать новые AI-инструменты</div>';
    }
    
    // Display next steps
    const stepsList = document.getElementById('stepsList');
    const steps = generateNextSteps(results);
    stepsList.innerHTML = steps.map((step, index) => 
        `<div class="step-item">
            <span class="step-number">${index + 1}</span>
            <span class="step-text">${step}</span>
        </div>`
    ).join('');
    
    // Display gift description
    const giftDescription = document.getElementById('giftDescription');
    giftDescription.textContent = getGiftDescription(results.clientType);
}

function getScoreTitle(score) {
    if (score >= 80) return 'Высокий уровень готовности';
    if (score >= 60) return 'Средний уровень готовности';
    if (score >= 40) return 'Базовый уровень готовности';
    return 'Начальный уровень';
}

function generatePersonalStrategy(results) {
    const profileType = results.profileType;
    const score = results.readinessScore;
    const format = results.keyAnswers?.format || 'A';
    
    switch (profileType) {
        case 'strategist':
            return `
                <h2>Ваш персональный план: как стать уверенным и востребованным специалистом в новой реальности</h2>
                
                <div class="strategy-intro">
                    <p>Ваш результат <strong>${score} из 100</strong> говорит о том, что вы смотрите в будущее и понимаете: игнорировать технологии — значит рисковать. Ваша цель — не погоня за модой, а желание прочно стоять на ногах, делать свою работу качественно и быть уверенным в завтрашнем дне. Вот три шага, чтобы этого достичь.</p>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 1</span>
                        <h3>Обретение базовой уверенности</h3>
                        <span class="step-timeline">Ваш фокус: 1 месяц</span>
                    </div>
                    
                    <p>Сейчас главное — убрать ощущение "темного леса". Вам нужно не хвататься за все подряд, а освоить один-два ключевых AI-инструмента, которые напрямую связаны с вашей основной деятельностью.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Возьмите одну из ваших регулярных рабочих задач (например, подготовка отчетов, создание учебных материалов, поиск информации). Целенаправленно изучите, как именно AI может облегчить и ускорить эту конкретную задачу.</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Превратить абстрактный "искусственный интеллект" в понятный и полезный рабочий инструмент. Получить первый реальный результат и почувствовать: "Я тоже так могу".
                    </div>
                    
                    <div class="step-product">
                        <strong>Как это сделать:</strong> Лучший путь здесь — системное обучение, где вам спокойно и по шагам объяснят основы. Важно, чтобы была возможность задать вопрос и получить понятный ответ, а не искать решения на десятках сайтов.
                    </div>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 2</span>
                        <h3>Повышение профессионального веса</h3>
                        <span class="step-timeline">Ваш фокус: 2-3 месяца</span>
                    </div>
                    
                    <p>Когда основы освоены, пора углубляться. Ваша сила — в вашей экспертизе. Теперь задача — умножить эту экспертизу на возможности AI, чтобы делать то, чего не могут другие.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Найдите узкое место в своей работе. Например, учитель может создавать интерактивные задания, которые AI адаптирует под каждого ученика. Специалист по закупкам — анализировать предложения поставщиков в разы быстрее.</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Стать человеком, к которому обращаются за советом. Неформально повысить свой статус в коллективе за счет уникального и полезного навыка, который реально помогает в общей работе.
                    </div>
                    
                    <div class="step-product">
                        <strong>Как это сделать:</strong> На этом этапе эффективнее всего практические занятия. Когда вы не просто слушаете теорию, а вместе с наставником создаете свой собственный рабочий проект. Это дает самый быстрый и прочный результат.
                    </div>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 3</span>
                        <h3>Превращение навыка в стабильность</h3>
                        <span class="step-timeline">Ваш фокус: постоянно</span>
                    </div>
                    
                    <p>Новые инструменты будут появляться постоянно. Ваша задача — не бояться этого, а выработать навык быстрой адаптации.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Выделите 1-2 часа в неделю на "игру" с новыми сервисами. Делитесь интересными находками с коллегами. Помогайте им осваивать то, что уже умеете сами.</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Стать специалистом, который не просто владеет технологиями, а постоянно развивается. Это залог вашей востребованности и профессионального спокойствия на годы вперед.
                    </div>
                </div>
            `;
            
        case 'optimizer':
            return `
                <h2>Ваш персональный план: как победить рутину и вернуть себе время и силы</h2>
                
                <div class="strategy-intro">
                    <p>Ваш результат <strong>${score} из 100</strong> показывает, что вы — человек дела. Вы прекрасно видите, сколько времени и энергии уходит на повторяющиеся, механические задачи. Ваша цель — не абстрактные инновации, а наведение порядка в делах и высвобождение ресурсов для того, что действительно важно. Вот 3 шага к этой цели.</p>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 1</span>
                        <h3>Первая победа над «хронофагом»</h3>
                        <span class="step-timeline">Ваш фокус: 1 неделя</span>
                    </div>
                    
                    <p>Чтобы почувствовать вкус свободы от рутины, нужна одна быстрая и яркая победа. Не нужно сразу строить сложных систем, начните с самого раздражающего.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Определите одну задачу, которую вы делаете каждый день и которая отнимает у вас от 20 до 60 минут (разбор почты, составление сводки, перенос данных из одного места в другое). Найдите способ автоматизировать именно ее.</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Мгновенно получить 2-5 свободных часов в неделю. Увидеть, что это реально, и получить мощный заряд мотивации двигаться дальше.
                    </div>
                    
                    <div class="step-product">
                        <strong>Как это сделать:</strong> Самый быстрый способ — короткое, интенсивное занятие, сфокусированное на одной конкретной задаче. Чтобы вы пришли, увидели, повторили и сразу получили готовый, работающий результат.
                    </div>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 2</span>
                        <h3>Создание «умного помощника»</h3>
                        <span class="step-timeline">Ваш фокус: 1 месяц</span>
                    </div>
                    
                    <p>Когда вы научились автоматизировать отдельные действия, пора их связывать в единую цепочку. Ваша задача — построить систему, которая работает по вашим правилам, но без вашего ежеминутного участия.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Создайте свой первый автоматический воркфлоу. Например: новая заявка с сайта -> автоматически создается папка на диске -> вам в мессенджер приходит уведомление с основными данными.</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Перестать быть "передатчиком информации" между разными программами. Построить надежную систему, которая снимает с вас огромный пласт микроменеджмента и снижает количество ошибок.
                    </div>
                    
                    <div class="step-product">
                        <strong>Как это сделать:</strong> Здесь важно, чтобы вам показали саму логику построения таких связок. Эффективнее всего это делать на практических воркшопах, где вы "своими руками" собираете несколько таких цепочек от начала и до конца.
                    </div>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 3</span>
                        <h3>Достижение «цифрового порядка»</h3>
                        <span class="step-timeline">Ваш фокус: постоянно</span>
                    </div>
                    
                    <p>Высший уровень оптимизации — когда большинство рутинных процессов работают автономно, а вы лишь контролируете ключевые точки.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Настройте свои системы так, чтобы они сами реагировали на события (например, пришел отчет за месяц -> он автоматически обработался -> основные цифры легли в презентацию).</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Обрести спокойствие. Знать, что рутина под контролем, и высвободить свой мозг для задач, где действительно нужен ваш опыт, интуиция и человеческий подход.
                    </div>
                </div>
            `;
            
        case 'pioneer':
            return `
                <h2>Ваш персональный план: как делать свою работу с новым драйвом и находить нестандартные решения</h2>
                
                <div class="strategy-intro">
                    <p>Ваш результат <strong>${score} из 100</strong> говорит о том, что вам тесно в рамках стандартных подходов. Вы чувствуете, что новые технологии могут не просто ускорить, а сделать вашу работу интереснее, глубже и креативнее. Ваша цель — не просто идти в ногу со временем, а получать удовольствие от процесса. Вот 3 шага для вас.</p>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 1</span>
                        <h3>Обустройство «творческой песочницы»</h3>
                        <span class="step-timeline">Ваш фокус: 1 месяц</span>
                    </div>
                    
                    <p>Прежде чем создавать шедевры, нужно освоить краски и кисти. Ваша задача — уверенно овладеть несколькими гибкими AI-инструментами, чтобы перестать думать о кнопках и сосредоточиться на идеях.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Выберите 2-3 сервиса, которые вам интуитивно интересны (для работы с текстом, изображениями, идеями). Поставьте себе цель не просто "изучить", а создать с их помощью 5-10 небольших, забавных или полезных вещей "для себя".</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Убрать барьер "я не умею". Начать легко и свободно пользоваться AI для быстрого тестирования своих гипотез и творческих замыслов.
                    </div>
                    
                    <div class="step-product">
                        <strong>Как это сделать:</strong> Вам подойдет среда, где поощряют эксперименты. Важно, чтобы была возможность учиться в своем темпе и получать поддержку от наставника, который поможет направить вашу энергию и подскажет неочевидные ходы.
                    </div>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 2</span>
                        <h3>Создание «проекта для души»</h3>
                        <span class="step-timeline">Ваш фокус: 2-3 месяца</span>
                    </div>
                    
                    <p>Теперь, когда вы освоили инструменты, пора создать что-то, чем вы будете по-настоящему гордиться. Проект, который решает вашу реальную задачу, но делает это красиво и нестандартно.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Возьмите часть своей работы, которая вам нравится больше всего, и придумайте, как AI может сделать ее еще лучше. Учитель может создать уникальный квест для урока. Дизайнер — новый визуальный стиль. Копирайтер — интерактивный рассказ.</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Получить мощный заряд вдохновения от создания чего-то нового. Сделать проект, который можно с восторгом показать коллегам и друзьям, и который сделает вашу работу ярче.
                    </div>
                    
                    <div class="step-product">
                        <strong>Как это сделать:</strong> Часто для такого проекта не хватает лишь небольшого толчка или взгляда со стороны. Здесь неоценимую помощь окажет сообщество единомышленников или работа в группе на практическом курсе, где вы сможете обмениваться идеями.
                    </div>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Шаг 3</span>
                        <h3>Превращение увлечения в мастерство</h3>
                        <span class="step-timeline">Ваш фокус: постоянно</span>
                    </div>
                    
                    <p>Ваше любопытство — это ваш главный актив. Ваша задача — сделать его своим постоянным рабочим инструментом.</p>
                    
                    <div class="step-actions">
                        <h4>Что делать:</h4>
                        <ul>
                            <li>Продолжайте экспериментировать. Найдите то, что зажигает вас больше всего, и развивайтесь в этом направлении. Делитесь своими открытиями — напишите статью, покажите на встрече с коллегами.</li>
                        </ul>
                    </div>
                    
                    <div class="step-goal">
                        <strong>Цель шага:</strong> Стать человеком, который не просто выполняет задачи, а привносит в работу новые идеи и вдохновляет других. Делать свою работу так, чтобы она приносила не только деньги, но и радость.
                    </div>
                </div>
            `;
            
        default:
            return `
                <h2>Ваш персональный план развития</h2>

                <div class="strategy-intro">
                    <p>Ваш результат <strong>${score} из 100</strong> показывает ваш текущий уровень готовности к работе с AI-технологиями.</p>
                    <p>На основе ваших ответов мы подготовили рекомендации, которые помогут вам эффективно развиваться в этом направлении.</p>
                </div>

                <div class="strategy-step">
                    <div class="step-header">
                        <span class="step-badge">Рекомендация</span>
                        <h3>Начните с основ</h3>
                    </div>

                    <p>Изучите базовые AI-инструменты, которые могут помочь в вашей повседневной работе. Это позволит вам понять возможности технологии и найти наиболее подходящие решения для ваших задач.</p>

                    <div class="step-goal">
                        <strong>Цель:</strong> Получить практический опыт работы с AI и понять, как эти инструменты могут улучшить вашу продуктивность.
                    </div>
                </div>
            `;
    }
}

function getGiftDescription(clientType) {
    switch (clientType) {
        case 'hot':
            return 'Эксклюзивный гайд "AI-стратегия для профессионалов" + персональная консультация на 30 минут';
        case 'warm':
            return 'Подробный чек-лист "50 AI-инструментов для повышения продуктивности" + доступ к закрытому сообществу';
        case 'cold':
        default:
            return 'Стартовый набор "Первые шаги в AI" с пошаговым планом изучения';
    }
}

function animateSpeedometer(targetScore) {
    const needle = document.getElementById('needle');
    const scoreNumber = document.getElementById('scoreNumber');
    if (!needle || !scoreNumber) return; // guard when speedometer is commented out
    
    let currentScore = 0;
    const animationDuration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetScore / steps;
    const stepDuration = animationDuration / steps;
    
    const animation = setInterval(() => {
        currentScore += increment;
        
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(animation);
        }
        
        // Update needle rotation (0-180 degrees) - fix rotation calculation
        const rotation = (currentScore / 100) * 180;
        needle.style.transform = `translateX(-50%) rotate(${-90 + rotation}deg)`;
        
        // Update score number
        scoreNumber.textContent = Math.round(currentScore);
        
        // Add color based on score
        if (currentScore >= 80) {
            scoreNumber.style.color = '#4CAF50';
        } else if (currentScore >= 60) {
            scoreNumber.style.color = '#FF9800';
        } else if (currentScore >= 40) {
            scoreNumber.style.color = '#2196F3';
        } else {
            scoreNumber.style.color = '#F44336';
        }
    }, stepDuration);
}

// Inject minimal CSS tweaks for blur effect while spinning
(function injectWheelStyles(){
    const style = document.createElement('style');
    style.textContent = `
    .wheel-container { overflow: hidden; }
    .wheel-container.spinning text.label-text { filter: blur(2px); opacity: 0.7; transition: filter .2s linear, opacity .2s linear; }
    .wheel-container:not(.spinning) text.label-text { filter: none; opacity: 1; }
    .sector path.winning-sector { filter: drop-shadow(0 0 8px rgba(255,255,255,0.6)); stroke:#fff; stroke-width:3; transform: scale(1.04); transform-box: fill-box; transform-origin: 50% 50%; }
    text.winning-label { font-size: 1.2em; font-weight: 800; }
    `;
    document.head.appendChild(style);
})();

function downloadGift() {
    const results = JSON.parse(localStorage.getItem('testResults') || '{}');
    const userData = JSON.parse(localStorage.getItem('fullUserData') || '{}');

    const button = document.getElementById('giftButton');
    const originalText = button.textContent;

    button.textContent = 'Отправляем...';
    button.disabled = true;

    // Send gift via email API
    fetch('/api/send-gift', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: userData.email,
            name: userData.name,
            profileType: results.profileType,
            readinessScore: results.readinessScore
        })
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка отправки подарка');
        }
        return response.json();
    })
    .then(data => {
        console.log('Gift sent successfully:', data);
        button.textContent = 'Подарок отправлен на email!';
        button.style.background = '#4CAF50';

        // Show success message
        showSuccessMessage();

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.background = '';
        }, 3000);
    })
    .catch(error => {
        console.error('Error sending gift:', error);
        button.textContent = 'Ошибка! Попробуйте снова';
        button.style.background = '#F44336';

        alert(`Ошибка при отправке подарка: ${error.message}\n\nПожалуйста, попробуйте еще раз или свяжитесь с нами напрямую.`);

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.background = '';
        }, 3000);
    });
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="success-content">
            <h3>🎉 Успешно!</h3>
            <p>Ваш персональный подарок отправлен на email. Проверьте почту в течение 5 минут.</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

function goToHome() {
    // Clear stored data and redirect to home
    localStorage.removeItem('testData');
    localStorage.removeItem('testResults');
    localStorage.removeItem('fullUserData');
    window.location.href = 'index.html';
}

// Add CSS for results page
const style = document.createElement('style');
style.textContent = `
    .results-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
        padding: 20px 0;
    }
    
    .results-header {
        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
        padding: 40px 0;
        text-align: center;
        margin-bottom: 40px;
        position: relative;
    }
    
    .results-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
    }
    
    .results-header > * {
        position: relative;
        z-index: 2;
    }
    
    .results-header h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: #ffffff;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        font-weight: 700;
    }
    
    .results-subtitle {
        font-size: 1.2rem;
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }
    
    .results-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .results-grid {
        display: flex;
        flex-direction: column;
        gap: 40px;
        margin-bottom: 50px;
    }
    
    .speedometer-section,
    .recommendations-section {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 40px;
        backdrop-filter: blur(10px);
    }
    
    .speedometer-section h2,
    .recommendations-section h2 {
        font-size: 1.8rem;
        margin-bottom: 2rem;
        text-align: center;
        color: #4ecdc4;
    }
    
    .speedometer-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .speedometer {
        position: relative;
        width: 200px;
        height: 100px;
        margin-bottom: 35px;
        padding-bottom: 5px;
    }
    
    .speedometer-arc {
        width: 200px;
        height: 100px;
        border: 8px solid #333;
        border-bottom: none;
        border-radius: 100px 100px 0 0;
        position: relative;
        background: linear-gradient(90deg, #F44336 0%, #FF9800 25%, #2196F3 50%, #4CAF50 100%);
        -webkit-background-clip: padding-box;
        background-clip: padding-box;
    }
    
    .speedometer-needle {
        position: absolute;
        bottom: -4px;
        left: 50%;
        width: 4px;
        height: 80px;
        background: #ffffff;
        transform-origin: bottom center;
        transform: translateX(-50%) rotate(0deg);
        transition: transform 0.1s ease;
        border-radius: 2px;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        z-index: 10;
    }
    
    .speedometer-center {
        position: absolute;
        bottom: -8px;
        left: 50%;
        width: 16px;
        height: 16px;
        background: #ffffff;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }
    
    .speedometer-labels {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .label-start {
        position: absolute;
        bottom: -25px;
        left: 0;
        color: #b0b0b0;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .label-middle {
        position: absolute;
        top: -5px;
        left: 50%;
        transform: translateX(-50%);
        color: #b0b0b0;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .label-end {
        position: absolute;
        bottom: -25px;
        right: 0;
        color: #b0b0b0;
        font-size: 0.85rem;
        font-weight: 500;
    }
    
    .score-display {
        text-align: center;
    }
    
    .score-number {
        font-size: 3rem;
        font-weight: 700;
        color: #4ecdc4;
        display: block;
        line-height: 1;
    }
    
    .score-text {
        font-size: 1.2rem;
        color: #b0b0b0;
    }
    
    .score-interpretation h3 {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        color: #4ecdc4;
        text-align: center;
    }
    
    .score-interpretation p {
        color: #e0e0e0;
        text-align: center;
        line-height: 1.6;
    }
    
    .recommendation-item {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 15px 20px;
        margin-bottom: 15px;
        color: #e0e0e0;
        font-size: 1rem;
        line-height: 1.5;
    }
    
    .profile-display {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
        background: rgba(78, 205, 196, 0.1);
        border: 1px solid rgba(78, 205, 196, 0.3);
        border-radius: 12px;
    }
    
    .profile-display h3 {
        font-size: 1.8rem;
        margin: 0;
        color: #4ecdc4;
        font-weight: 600;
    }
    
    .profile-display .profile-subtitle {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 10px 0 0 0;
        font-weight: 400;
    }
    
    .personalized-message {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 30px;
        margin: 30px 0;
        line-height: 1.6;
    }
    
    .personalized-message p {
        color: #e0e0e0;
        margin-bottom: 20px;
        font-size: 1.1rem;
    }
    
    .personalized-message p:last-child {
        margin-bottom: 0;
    }
    
    .personal-strategy-section {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 0;
        overflow: hidden;
    }
    
    .personal-strategy-section h2 {
        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
        margin: 0;
        padding: 25px 30px;
        color: #ffffff;
        font-size: 1.6rem;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    .strategy-intro {
        padding: 30px;
        background: rgba(78, 205, 196, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .strategy-intro p {
        color: #e0e0e0;
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 15px;
    }
    
    .strategy-intro p:last-child {
        margin-bottom: 0;
    }
    
    .strategy-step {
        padding: 30px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .strategy-step:last-child {
        border-bottom: none;
    }
    
    .step-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .step-badge {
        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.9rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .step-header h3 {
        color: #4ecdc4;
        margin: 0;
        font-size: 1.4rem;
        font-weight: 600;
        flex: 1;
    }
    
    .step-timeline {
        background: rgba(255, 255, 255, 0.1);
        color: #b0b0b0;
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
    }
    
    .strategy-step p {
        color: #e0e0e0;
        line-height: 1.6;
        margin-bottom: 20px;
        font-size: 1rem;
    }
    
    .step-actions {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
    }
    
    .step-actions h4 {
        color: #4ecdc4;
        margin: 0 0 15px 0;
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .step-actions ul {
        margin: 0;
        padding-left: 20px;
    }
    
    .step-actions li {
        color: #e0e0e0;
        margin-bottom: 12px;
        line-height: 1.5;
    }
    
    .step-actions li:last-child {
        margin-bottom: 0;
    }
    
    .step-goal, .step-product {
        background: rgba(78, 205, 196, 0.08);
        border-left: 4px solid #4ecdc4;
        padding: 15px 20px;
        margin: 15px 0;
        border-radius: 0 8px 8px 0;
    }
    
    .step-goal strong, .step-product strong {
        color: #4ecdc4;
        font-weight: 600;
    }
    
    .step-goal, .step-product {
        color: #e0e0e0;
        line-height: 1.5;
    }
    
    .step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
        border-radius: 50%;
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        margin-right: 15px;
        flex-shrink: 0;
    }
    
    .step-text {
        line-height: 1.5;
    }
    
    .gift-section {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        margin-bottom: 40px;
        backdrop-filter: blur(10px);
    }
    
    .gift-content h2 {
        font-size: 2rem;
        margin-bottom: 1.5rem;
        color: #4ecdc4;
    }
    
    .gift-description {
        font-size: 1.2rem;
        color: #e0e0e0;
        margin-bottom: 2rem;
        line-height: 1.6;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }
    
    .gift-button {
        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
        border: none;
        color: white;
        padding: 18px 40px;
        font-size: 1.2rem;
        font-weight: 600;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .gift-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(78, 205, 196, 0.4);
    }
    
    .gift-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
    
    .thank-you-section {
        text-align: center;
        padding: 40px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .thank-you-section h2 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
        color: #4ecdc4;
    }
    
    .thank-you-section p {
        font-size: 1.1rem;
        color: #b0b0b0;
        margin-bottom: 2rem;
        line-height: 1.6;
    }
    
    .action-buttons {
        margin-bottom: 2rem;
    }
    
    .back-to-home-btn {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        border: none;
        color: white;
        padding: 15px 30px;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .back-to-home-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(78, 205, 196, 0.4);
    }
    
    .social-links {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
    }
    
    .social-link {
        color: #4ecdc4;
        text-decoration: none;
        font-weight: 500;
        padding: 10px 20px;
        border: 1px solid rgba(78, 205, 196, 0.3);
        border-radius: 25px;
        transition: all 0.3s ease;
    }
    
    .social-link:hover {
        background: rgba(78, 205, 196, 0.1);
        transform: translateY(-2px);
    }
    
    .success-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid rgba(76, 175, 80, 0.5);
        border-radius: 16px;
        padding: 30px;
        text-align: center;
        z-index: 1000;
        backdrop-filter: blur(10px);
        animation: fadeIn 0.3s ease;
    }
    
    .success-content h3 {
        color: #4CAF50;
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .success-content p {
        color: #e0e0e0;
        line-height: 1.5;
    }
    
    @media (max-width: 768px) {
        .results-header h1 {
            font-size: 2rem;
        }

        .results-grid {
            gap: 30px;
        }

        .speedometer-section,
        .recommendations-section,
        .gift-section {
            padding: 30px 20px;
        }

        .speedometer {
            width: 150px;
            height: 75px;
            margin-bottom: 30px;
        }

        .speedometer-arc {
            width: 150px;
            height: 75px;
        }

        .speedometer-needle {
            height: 60px;
        }

        .label-start {
            bottom: -20px;
            font-size: 0.75rem;
        }

        .label-middle {
            top: -8px;
            font-size: 0.75rem;
        }

        .label-end {
            bottom: -20px;
            font-size: 0.75rem;
        }

        .score-number {
            font-size: 2.5rem;
        }

        .social-links {
            flex-direction: column;
            align-items: center;
        }

        .wheel-container {
            transform: scale(0.9);
        }

        .wheel-label {
            font-size: 0.7rem !important;
        }
    }

    /* Spinning Wheel Styles */
    .wheel-container {
        position: relative;
        display: inline-block;
        margin: 20px auto;
    }

    .spinning-wheel {
        display: block;
        transition: none;
        will-change: transform;
    }

    .wheel-pointer {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-top: 30px solid #ff6b6b;
        z-index: 100;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .wheel-pointer::after {
        content: '';
        position: absolute;
        top: -30px;
        left: -15px;
        width: 30px;
        height: 30px;
        background: #ff6b6b;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .wheel-labels {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .wheel-label {
        position: absolute;
        color: #ffffff;
        font-weight: 700;
        font-size: 0.8rem;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        white-space: nowrap;
        text-align: center;
        pointer-events: none;
        user-select: none;
    }

    #spinningWheel {
        min-height: 350px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);

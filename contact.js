// Contact form functionality

// Normalize test data to ensure letter format (A, B, C, D)
function normalizeTestData(data) {
    // If data is already in correct format or empty, return as is
    if (!data || typeof data !== 'object') return {};

    // Return data as is - test.js now saves in correct format
    return data;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validateForm()) {
            submitContactForm();
        }
    });
});

function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const consent = document.getElementById('consent').checked;
    
    // Remove existing error messages
    clearErrorMessages();
    
    let isValid = true;
    
    // Validate name
    if (!name) {
        showFieldError('name', 'Пожалуйста, введите ваше имя');
        isValid = false;
    }
    
    // Validate email
    if (!email) {
        showFieldError('email', 'Пожалуйста, введите email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Пожалуйста, введите корректный email');
        isValid = false;
    }
    
    // Validate consent
    if (!consent) {
        showFieldError('consent', 'Необходимо согласие на обработку данных');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const formGroup = field.closest('.form-group');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    formGroup.appendChild(errorElement);
    field.classList.add('error');
}

function clearErrorMessages() {
    const errors = document.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

function submitContactForm() {
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        consent: document.getElementById('consent').checked
    };
    
    // Get test data from localStorage
    const rawTestData = JSON.parse(localStorage.getItem('testData') || '{}');
    const testData = normalizeTestData(rawTestData);

    // Validate testData before proceeding
    if (!testData || Object.keys(testData).length === 0) {
        alert('Ошибка: данные теста не найдены. Пожалуйста, пройдите тест заново.');
        window.location.href = 'test.html';
        return;
    }

    console.log('Test data being sent:', testData);

    // Combine contact and test data
    const fullData = {
        ...testData,
        ...formData,
        timestamp: new Date().toISOString()
    };

    // Store complete data
    localStorage.setItem('fullUserData', JSON.stringify(fullData));

    // Show loading state
    const submitButton = document.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Генерируем результаты...';
    submitButton.disabled = true;

    // Calculate initial profile locally
    const localResults = calculateTestResults(testData);
    console.log('Local results:', localResults);

    // Real API call to generate AI-powered results
    fetch('/api/generate-results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            testData: testData,
            profileType: localResults.profileType,
            readinessScore: localResults.readinessScore
        })
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || 'Ошибка генерации результатов');
        }
        return response.json();
    })
    .then(data => {
        console.log('AI Generated Results:', data);

        // Save AI-generated results along with local calculation
        localStorage.setItem('testResults', JSON.stringify({
            profile: localResults.profileName,
            readinessScore: localResults.readinessScore,
            aiGeneratedStrategy: data.message || data.aiGeneratedStrategy,
            profileType: localResults.profileType,
            personalizedMessage: data.message || localResults.personalizedMessage
        }));

        window.location.href = 'results.html';
    })
    .catch(error => {
        console.error('Error:', error);
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        // Show detailed error message
        const errorMsg = `Произошла ошибка при генерации результатов: ${error.message}\n\nПожалуйста, попробуйте еще раз.`;
        alert(errorMsg);
    });
}

function calculateTestResults(testData) {
    // Safety: normalize inside as well (на случай старого формата в LS)
    testData = normalizeTestData(testData || {});
    // Векторная система оценки по 3 архетипам
    let optimizerScore = 0;    // О - Системный Оптимизатор
    let strategistScore = 0;   // С - Дальновидный Практик  
    let pioneerScore = 0;      // П - Энтузиаст-Экспериментатор
    
    // Сохраняем ключевые ответы для персонализации
    let keyAnswers = {
        role: testData.q1 || '',
        routine: testData.q2 || '',
        barrier: testData.q5 || '',
        fear: testData.q6 || '',
        problem: testData.q8 || '',
        superpower: testData.q9 || '',
        format: testData.q10 || ''
    };
    
    // Блок 1: Текущая реальность
    
    // Вопрос 1 (Роль)
    if (testData.q1 === 'A') { optimizerScore += 2; }
    else if (testData.q1 === 'B') { optimizerScore += 1; strategistScore += 1; }
    else if (testData.q1 === 'C') { strategistScore += 2; pioneerScore += 1; }
    else if (testData.q1 === 'D') { optimizerScore += 1; strategistScore += 1; }
    
    // Вопрос 2 (Рутина)
    if (testData.q2 === 'A') { optimizerScore += 2; }
    else if (testData.q2 === 'B') { optimizerScore += 1; pioneerScore += 1; }
    else if (testData.q2 === 'C') { optimizerScore += 3; } // сильный сигнал
    else if (testData.q2 === 'D') { optimizerScore += 1; strategistScore += 2; }
    
    // Вопрос 3 (Уровень)
    if (testData.q3 === 'A') { optimizerScore += 1; strategistScore += 1; }
    else if (testData.q3 === 'B') { strategistScore += 1; pioneerScore += 2; }
    else if (testData.q3 === 'C') { optimizerScore += 1; strategistScore += 1; pioneerScore += 1; }
    // D - нейтрально
    
    // Вопрос 4 (Влияние AI)
    if (testData.q4 === 'A') { strategistScore += 2; pioneerScore += 1; }
    else if (testData.q4 === 'B') { optimizerScore += 1; strategistScore += 1; }
    // C, D - нейтрально
    
    // Блок 2: Препятствия
    
    // Вопрос 5 (Барьер)
    if (testData.q5 === 'A') { optimizerScore += 3; } // ключевая боль
    else if (testData.q5 === 'B') { optimizerScore += 1; strategistScore += 1; pioneerScore += 1; }
    // C - нейтрально
    else if (testData.q5 === 'D') { pioneerScore += 2; strategistScore += 1; }
    
    // Вопрос 6 (Опасение)
    if (testData.q6 === 'A') { strategistScore += 3; } // ключевая боль
    else if (testData.q6 === 'B') { optimizerScore += 1; strategistScore += 1; }
    else if (testData.q6 === 'C') { pioneerScore += 1; optimizerScore += 1; }
    else if (testData.q6 === 'D') { optimizerScore += 2; }
    
    // Вопрос 8 (Гипотетическая проблема)
    if (testData.q8 === 'A') { optimizerScore += 2; }
    else if (testData.q8 === 'B') { strategistScore += 1; pioneerScore += 1; }
    else if (testData.q8 === 'C') { strategistScore += 2; }
    else if (testData.q8 === 'D') { optimizerScore += 1; strategistScore += 1; }
    
    // Блок 3: Предпочитаемые решения
    
    // Вопрос 9 (Суперэффект)
    if (testData.q9 === 'A') { optimizerScore += 3; }
    else if (testData.q9 === 'B') { pioneerScore += 3; }
    else if (testData.q9 === 'C') { optimizerScore += 1; pioneerScore += 2; }
    else if (testData.q9 === 'D') { strategistScore += 3; }
    
    // Вопрос 11 (Что важнее)
    if (testData.q11 === 'A') { strategistScore += 2; }
    else if (testData.q11 === 'B') { optimizerScore += 2; pioneerScore += 1; }
    // C, D - нейтрально
    
    // Вопрос 12 (Направление)
    if (testData.q12 === 'A') { optimizerScore += 3; }
    else if (testData.q12 === 'B') { pioneerScore += 3; strategistScore += 1; }
    else if (testData.q12 === 'C') { strategistScore += 2; optimizerScore += 1; }
    else if (testData.q12 === 'D') { pioneerScore += 2; }
    
    // Определяем доминантный архетип
    let profileType = 'optimizer';
    let profileName = 'Системный Оптимизатор';
    let readinessScore = Math.min(95, 60 + optimizerScore * 2);
    
    if (strategistScore >= optimizerScore && strategistScore >= pioneerScore) {
        profileType = 'strategist';
        profileName = 'Дальновидный Практик';
        readinessScore = Math.min(95, 65 + strategistScore * 2);
    } else if (pioneerScore >= optimizerScore && pioneerScore >= strategistScore) {
        profileType = 'pioneer';
        profileName = 'Энтузиаст-Экспериментатор';
        readinessScore = Math.min(95, 70 + pioneerScore * 2);
    }

    // Если по какой-то причине ни один ответ не распознан — выдать базовый уровень и явно пометить как «optimizer»
    if (optimizerScore === 0 && strategistScore === 0 && pioneerScore === 0) {
        profileType = 'optimizer';
        profileName = 'Системный Оптимизатор';
        readinessScore = 45; // безопасное дефолтное значение, чтобы не застревать на 65
    }

    const clientType = readinessScore >= 75 ? 'hot' : readinessScore >= 55 ? 'warm' : 'cold';

    return {
        readinessScore,
        clientType,
        profileType,
        profileName,
        keyAnswers,
        vectors: {
            optimizer: optimizerScore,
            strategist: strategistScore,
            pioneer: pioneerScore
        },
        recommendations: buildRecommendations(testData, profileType),
        personalizedMessage: generatePersonalizedMessage(profileType, testData, keyAnswers)
    };
}

function buildRecommendations(testData, profileType) {
    const rec = [];
    
    // Рекомендации по новым архетипам
    switch (profileType) {
        case 'optimizer':
            rec.push('Начните с автоматизации одной конкретной рутинной задачи');
            rec.push('Используйте готовые воркфлоу с измеримым ROI');
            rec.push('Внедряйте решения поэтапно с контролем результата');
            break;
        case 'strategist':
            rec.push('Изучите AI-инструменты, повышающие вашу ценность на рынке');
            rec.push('Получите сертификацию по работе с AI в вашей сфере');
            rec.push('Станьте экспертом по AI в своей команде/компании');
            break;
        case 'pioneer':
            rec.push('Экспериментируйте с созданием уникальных AI-решений');
            rec.push('Разрабатывайте собственные агенты и воркфлоу');
            rec.push('Создавайте инновационные продукты с использованием AI');
            break;
    }

    // Добавляем рекомендации на основе направления (q12)
    if (testData.q12 === 'A') {
        rec.push('Освойте no-code платформы для автоматизации');
    } else if (testData.q12 === 'B') {
        rec.push('Начните с простого чат-бота для вашей задачи');
    }

    return rec.slice(0, 4);
}

function generatePersonalizedMessage(profileType, testData, keyAnswers) {
    // Получаем текстовые варианты ответов для цитирования
    const answerTexts = {
        q1: {
            'A': 'исполнитель, отвечающий за конкретные задачи',
            'B': 'координатор/менеджер процессов',
            'C': 'стратег, определяющий вектор развития',
            'D': 'универсальный специалист'
        },
        q2: {
            'A': 'обработка информации',
            'B': 'создание контента',
            'C': 'монотонные операции',
            'D': 'анализ данных'
        },
        q5: {
            'A': 'нехватка времени',
            'B': 'информационный перегруз',
            'C': 'техническая сложность',
            'D': 'отсутствие конкретной задачи'
        },
        q6: {
            'A': 'страх замещения AI',
            'B': 'вопросы безопасности данных',
            'C': 'непрозрачность AI-решений',
            'D': 'высокие затраты'
        },
        q9: {
            'A': 'освобождение времени от рутины',
            'B': 'генерация идей и решений',
            'C': 'персональный AI-ассистент',
            'D': 'повышение профессиональной ценности'
        },
        q10: {
            'A': 'короткий мастер-класс',
            'B': 'комплексный курс',
            'C': 'практический воркшоп',
            'D': 'самостоятельное изучение'
        }
    };
    
    switch (profileType) {
        case 'optimizer':
            return `Системный Оптимизатор: Вы видите хаос и инстинктивно хотите превратить его в систему.

Вы не гонитесь за хайпом. Для вас технология — это рычаг, а не игрушка. Ваша главная цель — найти узкие места в своей работе и расширить их с помощью AI. 

Вы ответили, что ваш главный барьер — "${answerTexts.q5[keyAnswers.barrier] || 'неопределенный барьер'}", а больше всего вас привлекает возможность "${answerTexts.q9[keyAnswers.superpower] || 'неопределенный эффект'}". Это классические признаки человека, который ценит предсказуемый результат и эффективность.

Ваш идеальный следующий шаг: Вам не нужен долгий теоретический курс обо всём. Вам нужно точечное, мощное решение, которое можно внедрить за выходные и в понедельник уже увидеть результат.`;
            
        case 'strategist':
            return `Дальновидный Практик: Вы понимаете, что мир меняется, и хотите быть среди тех, кто формирует будущее.

Для вас AI — это не просто инструмент оптимизации, а способ кардинально повысить свою ценность на рынке. Вы видите долгосрочную перспективу и готовы инвестировать в глубокие знания.

Ваше главное опасение — "${answerTexts.q6[keyAnswers.fear] || 'неопределенные риски'}", а цель — "${answerTexts.q9[keyAnswers.superpower] || 'профессиональный рост'}". Это показывает человека, который думает стратегически и понимает важность опережающего развития.

Ваш идеальный следующий шаг: Вам нужны не поверхностные навыки, а глубокая экспертность, которая сделает вас незаменимым специалистом в новой AI-реальности.`;
            
        case 'pioneer':
            return `Энтузиаст-Экспериментатор: Вы не хотите просто использовать готовые решения — вы хотите создавать новое.

Для вас AI — это не инструмент для оптимизации существующего, а платформа для создания того, чего раньше не было. Вы видите возможности там, где другие видят ограничения.

Вы стремитесь к "${answerTexts.q9[keyAnswers.superpower] || 'творческим возможностям'}" и готовы экспериментировать. Ваш барьер — "${answerTexts.q5[keyAnswers.barrier] || 'неопределенные препятствия'}", но это не останавливает вас от поиска нестандартных решений.

Ваш идеальный следующий шаг: Вам нужна не инструкция, а "песочница" и проводник, который поможет превратить ваши идеи в работающие AI-решения.`;
            
        default:
            return 'Ваш уникальный профиль готовности к AI определен. Получите персональные рекомендации по развитию навыков.';
    }
}

// Add CSS for contact form
const style = document.createElement('style');
style.textContent = `
    .contact-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
        padding: 20px 0;
    }
    
    .contact-header {
        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
        padding: 40px 0;
        text-align: center;
        margin-bottom: 40px;
        position: relative;
    }
    
    .contact-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
    }
    
    .contact-header > * {
        position: relative;
        z-index: 2;
    }
    
    .contact-header h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: #ffffff;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        font-weight: 700;
    }
    
    .contact-subtitle {
        font-size: 1.2rem;
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }
    
    .contact-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .contact-form-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 60px;
        align-items: start;
        max-width: 1000px;
        margin: 0 auto;
    }
    
    .contact-form {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 40px;
        backdrop-filter: blur(10px);
    }
    
    .form-group {
        margin-bottom: 25px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #ffffff;
        font-weight: 500;
        font-size: 1rem;
    }
    
    .form-group input {
        width: 100%;
        padding: 15px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: #ffffff;
        font-size: 1rem;
        font-family: 'Inter', sans-serif;
        transition: all 0.3s ease;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: rgba(78, 205, 196, 0.5);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
    }
    
    .form-group input::placeholder {
        color: #888;
    }
    
    .form-group small {
        display: block;
        margin-top: 5px;
        color: #b0b0b0;
        font-size: 0.85rem;
    }
    
    .checkbox-group {
        margin-bottom: 30px;
    }
    
    .checkbox-label {
        display: flex;
        align-items: flex-start;
        cursor: pointer;
        font-size: 0.95rem;
        line-height: 1.4;
        color: #e0e0e0;
    }
    
    .checkbox-label input[type="checkbox"] {
        width: auto;
        margin-right: 12px;
        margin-top: 2px;
        accent-color: #4ecdc4;
    }
    
    .submit-button {
        width: 100%;
        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
        border: none;
        color: white;
        padding: 18px 30px;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .submit-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(78, 205, 196, 0.4);
    }
    
    .submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
    
    .contact-benefits {
        background: rgba(78, 205, 196, 0.1);
        border: 1px solid rgba(78, 205, 196, 0.2);
        border-radius: 16px;
        padding: 40px;
        position: relative;
        overflow: hidden;
    }
    
    .contact-benefits::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
    }
    
    .contact-benefits h3 {
        color: #4ecdc4;
        margin-bottom: 25px;
        font-size: 1.4rem;
        font-weight: 600;
        text-align: center;
    }
    
    .contact-benefits ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .contact-benefits li {
        color: #ffffff;
        margin-bottom: 16px;
        font-size: 1.1rem;
        line-height: 1.6;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .contact-benefits li:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
    
    .field-error {
        color: #ff6363;
        font-size: 0.85rem;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    }
    
    .form-group input.error {
        border-color: rgba(255, 99, 99, 0.5);
        background: rgba(255, 99, 99, 0.05);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        .contact-header h1 {
            font-size: 2rem;
        }
        
        .contact-form-wrapper {
            grid-template-columns: 1fr;
            gap: 30px;
        }
        
        .contact-form {
            padding: 24px 16px;
        }
        
        .contact-benefits {
            padding: 20px 16px;
        }
        .contact-content { padding: 0 16px; }
        .contact-form-wrapper { gap: 20px; }
    }
`;
document.head.appendChild(style);

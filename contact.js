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

        // Save to Google Sheets
        const sheetsData = {
            ...formData,
            ...testData,
            profileType: localResults.profileType,
            readinessScore: localResults.readinessScore,
            timestamp: new Date().toISOString()
        };

        fetch('/api/save-to-sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sheetsData)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Saved to Google Sheets:', result);
        })
        .catch(error => {
            console.error('Error saving to Google Sheets:', error);
            // Don't block navigation if sheets save fails
        });

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
    // Safety: normalize inside as well
    testData = normalizeTestData(testData || {});

    // ЧЕСТНАЯ система подсчета баллов (от 0 до 100)
    // Каждый вопрос оценивает РЕАЛЬНУЮ готовность к AI
    let totalScore = 0;

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

    // q1: Роль (макс 8 баллов)
    if (testData.q1 === 'A') totalScore += 4;      // Исполнитель - средняя готовность
    else if (testData.q1 === 'B') totalScore += 6; // Координатор - выше средней
    else if (testData.q1 === 'C') totalScore += 8; // Стратег - высокая готовность
    else if (testData.q1 === 'D') totalScore += 5; // Универсал - средняя

    // q2: Рутинные задачи (макс 8 баллов)
    if (testData.q2 === 'A') totalScore += 7;      // Обработка инфо - хорошо для AI
    else if (testData.q2 === 'B') totalScore += 7; // Контент - хорошо для AI
    else if (testData.q2 === 'C') totalScore += 8; // Монотонные операции - идеально для AI
    else if (testData.q2 === 'D') totalScore += 7; // Анализ данных - хорошо для AI

    // q3: Уровень владения инструментами (макс 8 баллов)
    if (testData.q3 === 'A') totalScore += 5;      // Уверенный пользователь
    else if (testData.q3 === 'B') totalScore += 7; // Энтузиаст - высокая готовность
    else if (testData.q3 === 'C') totalScore += 8; // Power User - максимальная готовность
    else if (testData.q3 === 'D') totalScore += 2; // Новичок - низкая готовность

    // q4: Влияние AI на отрасль (макс 8 баллов)
    if (testData.q4 === 'A') totalScore += 8;      // Критическое - понимает важность
    else if (testData.q4 === 'B') totalScore += 6; // Значительное
    else if (testData.q4 === 'C') totalScore += 3; // Умеренное - слабое понимание
    else if (testData.q4 === 'D') totalScore += 1; // Неясно - очень слабое понимание

    // q5: Главный барьер (макс 5 баллов - барьеры снижают готовность)
    if (testData.q5 === 'A') totalScore += 4;      // Нехватка времени - слабый барьер
    else if (testData.q5 === 'B') totalScore += 5; // Инфо перегруз - средний барьер
    else if (testData.q5 === 'C') totalScore += 2; // Техническая сложность - сильный барьер
    else if (testData.q5 === 'D') totalScore += 1; // Нет задачи - очень сильный барьер

    // q6: Опасения (макс 6 баллов)
    if (testData.q6 === 'A') totalScore += 3;      // Замена AI - сильное опасение
    else if (testData.q6 === 'B') totalScore += 5; // Безопасность - разумное опасение
    else if (testData.q6 === 'C') totalScore += 6; // Черный ящик - технически подкованное
    else if (testData.q6 === 'D') totalScore += 4; // Бюджеты - преодолимое опасение

    // q7: Трудности в обучении (макс 7 баллов)
    if (testData.q7 === 'A') totalScore += 5;      // Найти материалы
    else if (testData.q7 === 'B') totalScore += 6; // Совмещать с работой
    else if (testData.q7 === 'C') totalScore += 4; // Нет наставника
    else if (testData.q7 === 'D') totalScore += 7; // Теория→практика (хороший признак)

    // q8: Гипотетические проблемы (макс 6 баллов)
    if (testData.q8 === 'A') totalScore += 4;      // Не получу пользу
    else if (testData.q8 === 'B') totalScore += 3; // Не оценят
    else if (testData.q8 === 'C') totalScore += 6; // Устареет - понимает динамику
    else if (testData.q8 === 'D') totalScore += 5; // Ошибка

    // q9: Суперэффект (макс 8 баллов)
    if (testData.q9 === 'A') totalScore += 7;      // Освободить время
    else if (testData.q9 === 'B') totalScore += 8; // Генерация идей - высокая мотивация
    else if (testData.q9 === 'C') totalScore += 7; // Персональный ассистент
    else if (testData.q9 === 'D') totalScore += 8; // Повысить стоимость - бизнес-мышление

    // q10: Формат обучения (макс 8 баллов)
    if (testData.q10 === 'A') totalScore += 6;      // Короткий интенсив
    else if (testData.q10 === 'B') totalScore += 7; // Комплексный курс - серьезный подход
    else if (testData.q10 === 'C') totalScore += 8; // Практический воркшоп - максимум вовлеченности
    else if (testData.q10 === 'D') totalScore += 5; // Самостоятельно

    // q11: Что важнее в обучении (макс 8 баллов)
    if (testData.q11 === 'A') totalScore += 7;      // Фундаментальные знания
    else if (testData.q11 === 'B') totalScore += 8; // Практические инструменты - готов применять
    else if (testData.q11 === 'C') totalScore += 6; // Поддержка
    else if (testData.q11 === 'D') totalScore += 5; // Гибкость

    // q12: Направление (макс 8 баллов)
    if (testData.q12 === 'A') totalScore += 8;      // Автоматизация - конкретное применение
    else if (testData.q12 === 'B') totalScore += 7; // Чат-боты
    else if (testData.q12 === 'C') totalScore += 7; // Анализ данных
    else if (testData.q12 === 'D') totalScore += 7; // Генерация контента

    // Максимум возможных баллов = 96
    // Приводим к шкале 0-100
    const readinessScore = Math.round((totalScore / 96) * 100);

    // ЧЕСТНАЯ градация профилей (на основе балла готовности)
    let profileType, profileName, clientType;

    if (readinessScore >= 76) {
        profileType = 'expert';
        profileName = 'Эксперт';
        clientType = 'hot';
    } else if (readinessScore >= 56) {
        profileType = 'practitioner';
        profileName = 'Практик';
        clientType = 'warm-hot';
    } else if (readinessScore >= 31) {
        profileType = 'explorer';
        profileName = 'Исследователь';
        clientType = 'warm';
    } else {
        profileType = 'observer';
        profileName = 'Наблюдатель';
        clientType = 'cold';
    }

    return {
        readinessScore,
        clientType,
        profileType,
        profileName,
        keyAnswers,
        rawScore: totalScore,
        maxScore: 96,
        recommendations: buildRecommendations(testData, profileType),
        personalizedMessage: generatePersonalizedMessage(profileType, testData, keyAnswers, readinessScore)
    };
}

function buildRecommendations(testData, profileType) {
    const rec = [];

    // Рекомендации по новым профилям
    switch (profileType) {
        case 'expert':
            rec.push('Создавайте сложные AI-агенты и системы автоматизации');
            rec.push('Монетизируйте ваши AI-навыки через консалтинг или продукты');
            rec.push('Станьте AI-лидером в вашей команде или компании');
            rec.push('Делитесь опытом и обучайте других');
            break;
        case 'practitioner':
            rec.push('Внедряйте AI в свои ежедневные рабочие процессы');
            rec.push('Изучайте продвинутые техники промптинга и автоматизации');
            rec.push('Создавайте собственные воркфлоу для конкретных задач');
            rec.push('Измеряйте ROI от внедрения AI-инструментов');
            break;
        case 'explorer':
            rec.push('Пробуйте разные AI-инструменты для ваших задач');
            rec.push('Начните с простых кейсов: резюме текстов, генерация идей');
            rec.push('Изучайте базовые концепции промптинга');
            rec.push('Найдите сообщество практиков для обмена опытом');
            break;
        case 'observer':
            rec.push('Познакомьтесь с базовыми AI-инструментами (ChatGPT, Claude)');
            rec.push('Развейте мифы и страхи про AI через практику');
            rec.push('Найдите одну конкретную задачу для применения AI');
            rec.push('Пройдите короткий вводный курс по AI');
            break;
    }

    return rec.slice(0, 4);
}

function generatePersonalizedMessage(profileType, testData, keyAnswers, readinessScore) {
    // Получаем текстовые варианты ответов для цитирования
    const answerTexts = {
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
        }
    };

    switch (profileType) {
        case 'expert':
            return `**Эксперт** (${readinessScore}/100) — Вы в топ-25% по готовности к AI!

Вы демонстрируете высокий уровень технической подкованности и стратегического мышления. Ваш результат показывает, что вы не просто интересуетесь AI, а готовы применять его на серьезном уровне.

Ваша мотивация — "${answerTexts.q9[keyAnswers.superpower] || 'профессиональное развитие'}" — говорит о том, что вы понимаете истинную ценность AI-навыков. Вам не нужны базовые курсы.

Что дальше: Вам нужны сложные проекты, экспертное сообщество и возможности для монетизации ваших знаний. Рассмотрите консалтинг, создание собственных AI-решений или партнерство в AI-проектах.`;

        case 'practitioner':
            return `**Практик** (${readinessScore}/100) — Вы на правильном пути!

Ваш результат показывает хорошую базу для внедрения AI. Вы активно используете цифровые инструменты и видите конкретные задачи для AI.

Главный барьер — "${answerTexts.q5[keyAnswers.barrier] || 'неопределенные препятствия'}". Это преодолимо! Вас привлекает "${answerTexts.q9[keyAnswers.superpower] || 'практическое применение'}" — это правильная мотивация.

Что дальше: Вам нужна структура и практика. Воркшопы, где вы создадите реальные AI-воркфлоу для своих задач, дадут максимальный результат. Фокус на ROI и измеримые улучшения.`;

        case 'explorer':
            return `**Исследователь** (${readinessScore}/100) — Есть интерес, нужна систематизация.

Вы интересуетесь AI, но пока действуете без четкой системы. Ваш результат честно отражает текущее состояние — есть потенциал, но нужна поддержка.

Барьер — "${answerTexts.q5[keyAnswers.barrier] || 'неопределенные препятствия'}" — типичен для вашего уровня. Опасение "${answerTexts.q6[keyAnswers.fear] || 'неясные риски'}" также понятно.

Что дальше: Вам нужны простые кейсы с быстрым результатом и поддерживающее сообщество. Начните с базовых инструментов (ChatGPT, Claude) для конкретных задач. Вводный курс даст структуру.`;

        case 'observer':
            return `**Наблюдатель** (${readinessScore}/100) — Начало пути.

Ваш результат показывает низкую текущую готовность. Это честная оценка, не приговор! У вас либо сильные опасения, либо пока нет четкого понимания, как применить AI.

Барьер — "${answerTexts.q5[keyAnswers.barrier] || 'отсутствие задачи'}" и опасение "${answerTexts.q6[keyAnswers.fear] || 'неясные риски'}" мешают начать.

Что дальше: Вам нужно снять страхи и увидеть AI "в деле". Бесплатные материалы, простые примеры из вашей сферы, развенчание мифов. Первая задача — просто попробовать, без обязательств.`;

        default:
            return `Ваш уникальный профиль готовности к AI определен (${readinessScore}/100). Получите персональные рекомендации по развитию навыков.`;
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

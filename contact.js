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
    // Человекочитаемые ответы с текстами (сформированы в test.js при завершении теста)
    const answersVerbose = JSON.parse(localStorage.getItem('answersVerbose') || '[]');

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

    // Show full-screen loading overlay
    showLoadingOverlay();

    // Calculate initial profile locally
    const localResults = calculateTestResults(testData);
    console.log('Local results:', localResults);

    // Save to Google Sheets immediately (independent from AI)
    // Это фиксирует лид-просадку: запись формы не зависит от ответа модели
    const sheetsData = {
        ...formData,
        ...testData,
        profileType: localResults.profileType,
        readinessScore: localResults.readinessScore,
        timestamp: new Date().toISOString()
    };

    fetch('/api/save-to-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetsData)
    })
    .then(r => r.json().catch(() => ({})))
    .then(result => console.log('Saved to Google Sheets (pre-AI):', result))
    .catch(err => console.error('Error saving to Google Sheets (pre-AI):', err));

    // Prepare payload and store for potential retry on results page
    const aiPayload = {
        testData: testData,
        answersVerbose: answersVerbose,
        profileType: localResults.profileType,
        readinessScore: localResults.readinessScore
    };
    localStorage.setItem('pendingAIRequest', JSON.stringify(aiPayload));

    // Real API call to generate AI-powered results
    console.log('AI request starting to /api/generate-results', aiPayload);
    fetch('/api/generate-results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiPayload),
        keepalive: true
    })
    .then(async response => {
        console.log('AI response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || 'Ошибка генерации результатов');
        }
        return response.json();
    })
    .then(data => {
        console.log('AI Generated Results:', data);
        // Clear pending marker on success
        localStorage.removeItem('pendingAIRequest');

        // Parse archetype from AI response
        let archetype = null;
        const aiMessage = data.message || data.aiGeneratedStrategy || '';

        // Extract archetype from "АРХЕТИП: [название]" format
        const archetypeMatch = aiMessage.match(/АРХЕТИП:\s*([А-Яа-яЁё\-]+)/i);
        if (archetypeMatch) {
            archetype = archetypeMatch[1].trim();
            console.log('Extracted archetype:', archetype);
        } else {
            // Fallback to local profile if archetype not found
            archetype = localResults.profileName || 'Оптимизатор';
            console.log('Using fallback archetype:', archetype);
        }

        // Save AI-generated results along with local calculation
        localStorage.setItem('testResults', JSON.stringify({
            profile: localResults.profileName,
            readinessScore: localResults.readinessScore,
            aiGeneratedStrategy: aiMessage,
            profileType: localResults.profileType,
            personalizedMessage: aiMessage,
            archetype: archetype  // Add archetype for spinning wheel
        }));

        // Hide loading overlay before navigation
        hideLoadingOverlay();
        window.location.href = 'results.html';
    })
    .catch(error => {
        console.error('Error:', error);
        // Hide loading overlay on error
        hideLoadingOverlay();
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        // Show detailed error message
        const errorMsg = `Произошла ошибка при генерации результатов: ${error.message}\n\nПожалуйста, попробуйте еще раз.`;
        alert(errorMsg);
    });
}

function showLoadingOverlay() {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div id="loadingWheel"></div>
            <div class="loading-message">
                Искусственный интеллект определяет ваш архетип.
                Анализ может занять 1-2 минуты.
                Спасибо за ожидание!
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Create spinning wheel in the loading overlay
    createLoadingSpinningWheel();

    // Prevent scrolling when overlay is active
    document.body.style.overflow = 'hidden';
}

// createLoadingSpinningWheel — см. переопределение ниже (современная версия с вращаемой группой и clipPath)

function hideLoadingOverlay() {
    // Stop wheel spinning animation
    if (window.loadingWheelInterval) {
        clearInterval(window.loadingWheelInterval);
        window.loadingWheelInterval = null;
    }

    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
    // Restore scrolling
    document.body.style.overflow = '';
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

    // ПЛОСКАЯ ЧЕСТНАЯ система подсчета (макс 8 баллов на вопрос, минимум 0-1)
    // Каждый вопрос имеет полный диапазон от "скептик/не готов" до "энтузиаст/готов"

    // q1: Роль (макс 8 баллов)
    if (testData.q1 === 'A') totalScore += 3;      // Исполнитель - низкая готовность
    else if (testData.q1 === 'B') totalScore += 5; // Координатор - средняя
    else if (testData.q1 === 'C') totalScore += 8; // Стратег - высокая готовность
    else if (testData.q1 === 'D') totalScore += 0; // Универсал - нет фокуса, не готов

    // q2: Рутинные задачи (макс 8 баллов)
    if (testData.q2 === 'A') totalScore += 6;      // Обработка инфо - хорошо для AI
    else if (testData.q2 === 'B') totalScore += 5; // Контент - средне для AI
    else if (testData.q2 === 'C') totalScore += 8; // Монотонные операции - идеально для AI
    else if (testData.q2 === 'D') totalScore += 1; // Анализ данных - сложно автоматизировать

    // q3: Уровень владения инструментами (макс 8 баллов)
    if (testData.q3 === 'A') totalScore += 4;      // Уверенный пользователь - средне
    else if (testData.q3 === 'B') totalScore += 7; // Энтузиаст - высокая готовность
    else if (testData.q3 === 'C') totalScore += 8; // Power User - максимальная готовность
    else if (testData.q3 === 'D') totalScore += 0; // Новичок - не готов

    // q4: Влияние AI на отрасль (макс 8 баллов)
    if (testData.q4 === 'A') totalScore += 8;      // Критическое - понимает важность
    else if (testData.q4 === 'B') totalScore += 5; // Значительное - средне
    else if (testData.q4 === 'C') totalScore += 2; // Умеренное - слабое понимание
    else if (testData.q4 === 'D') totalScore += 0; // Неясно - совсем не понимает

    // q5: Главный барьер (макс 8 баллов)
    if (testData.q5 === 'A') totalScore += 6;      // Нехватка времени - преодолимо
    else if (testData.q5 === 'B') totalScore += 4; // Инфо перегруз - средний барьер
    else if (testData.q5 === 'C') totalScore += 1; // Техническая сложность - сильный барьер
    else if (testData.q5 === 'D') totalScore += 0; // Нет задачи - фатальный барьер

    // q6: Опасения (макс 8 баллов)
    if (testData.q6 === 'A') totalScore += 1;      // Замена AI - сильное опасение, не готов
    else if (testData.q6 === 'B') totalScore += 5; // Безопасность - разумное опасение
    else if (testData.q6 === 'C') totalScore += 8; // Черный ящик - технически подкованное
    else if (testData.q6 === 'D') totalScore += 3; // Бюджеты - финансовое опасение

    // q7: Трудности в обучении (макс 8 баллов)
    if (testData.q7 === 'A') totalScore += 4;      // Найти материалы - средняя сложность
    else if (testData.q7 === 'B') totalScore += 5; // Совмещать с работой - средняя
    else if (testData.q7 === 'C') totalScore += 1; // Нет наставника - сильная сложность
    else if (testData.q7 === 'D') totalScore += 7; // Теория→практика - хороший признак

    // q8: Гипотетические проблемы (макс 8 баллов)
    if (testData.q8 === 'A') totalScore += 0;      // Не получу пользу - скептик
    else if (testData.q8 === 'B') totalScore += 1; // Не оценят - скептик
    else if (testData.q8 === 'C') totalScore += 8; // Устареет - понимает динамику, прогрессивный
    else if (testData.q8 === 'D') totalScore += 4; // Ошибка - осторожный

    // q9: Суперэффект (макс 8 баллов)
    if (testData.q9 === 'A') totalScore += 6;      // Освободить время - практичная цель
    else if (testData.q9 === 'B') totalScore += 8; // Генерация идей - высокая мотивация
    else if (testData.q9 === 'C') totalScore += 5; // Персональный ассистент - средняя цель
    else if (testData.q9 === 'D') totalScore += 7; // Повысить стоимость - бизнес-мышление

    // q10: Формат обучения (макс 8 баллов)
    if (testData.q10 === 'A') totalScore += 5;      // Короткий интенсив - средняя готовность
    else if (testData.q10 === 'B') totalScore += 7; // Комплексный курс - серьезный подход
    else if (testData.q10 === 'C') totalScore += 8; // Практический воркшоп - максимум вовлеченности
    else if (testData.q10 === 'D') totalScore += 2; // Самостоятельно - низкая готовность

    // q11: Что важнее в обучении (макс 8 баллов)
    if (testData.q11 === 'A') totalScore += 4;      // Фундаментальные знания - теория
    else if (testData.q11 === 'B') totalScore += 8; // Практические инструменты - готов применять
    else if (testData.q11 === 'C') totalScore += 3; // Поддержка - нужна помощь
    else if (testData.q11 === 'D') totalScore += 2; // Гибкость - низкая мотивация

    // q12: Направление (макс 8 баллов)
    if (testData.q12 === 'A') totalScore += 8;      // Автоматизация - конкретное применение
    else if (testData.q12 === 'B') totalScore += 6; // Чат-боты - конкретно
    else if (testData.q12 === 'C') totalScore += 7; // Анализ данных - технически
    else if (testData.q12 === 'D') totalScore += 4; // Генерация контента - базово

    // Максимум возможных баллов = 96
    // Минимум возможных баллов = 10 (если все худшие ответы)
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

    /* Loading Overlay Styles */
    #loadingOverlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 15, 35, 0.98);
        backdrop-filter: blur(10px);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
    }

    .loading-content {
        text-align: center;
        padding: 20px;
        max-width: 600px;
        width: 90%;
    }

    #loadingWheel {
        width: 280px;
        margin: 0 auto 30px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #loadingWheel svg {
        max-width: 100%;
        height: auto;
    }

    .loading-message {
        color: #ffffff;
        font-size: 1.3rem;
        line-height: 1.8;
        font-weight: 400;
        text-align: center;
        padding: 0 20px;
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.9; }
        50% { opacity: 1; }
    }

    /* Responsive Loading Overlay */
    @media (max-width: 1200px) {
        .loading-message {
            font-size: 1.2rem;
            line-height: 1.7;
        }
        .spinner {
            width: 70px;
            height: 70px;
        }
    }

    @media (max-width: 768px) {
        .loading-message {
            font-size: 1.1rem;
            line-height: 1.6;
            padding: 0 15px;
        }
        .spinner {
            width: 60px;
            height: 60px;
            margin-bottom: 25px;
        }
        .loading-content {
            max-width: 500px;
        }
    }

    @media (max-width: 480px) {
        .loading-message {
            font-size: 1rem;
            line-height: 1.5;
            padding: 0 10px;
        }
        .spinner {
            width: 50px;
            height: 50px;
            margin-bottom: 20px;
            border-width: 3px;
        }
        .loading-content {
            max-width: 100%;
            padding: 15px;
        }
    }

    @media (max-width: 360px) {
        .loading-message {
            font-size: 0.95rem;
            line-height: 1.4;
        }
        .spinner {
            width: 45px;
            height: 45px;
        }
    }
`;
document.head.appendChild(style);

// --- Override waiting wheel to keep pointer static and rotate only sectors ---
// This redefines createLoadingSpinningWheel to avoid rotating the pointer, and
// adds slight blur while spinning so надписи визуально «сливаются».
function createLoadingSpinningWheel() {
    const archetypes = [
        'Оптимизатор', 'Визионер', 'Прагматик', 'Предприниматель', 'Энтузиаст',
        'Скептик', 'Наблюдатель', 'Универсал', 'Аналитик', 'Искатель'
    ];

    const colors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#a8dadc', '#f1c40f',
        '#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#e67e22'
    ];

    const container = document.getElementById('loadingWheel');
    if (!container) return;

    const size = 280;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    const segmentAngle = 360 / archetypes.length;
    const angleRad = (Math.PI * 2) / archetypes.length;
    const fontSize = Math.max(10, Math.round(size * 0.045));

    // Build clipPaths first
    let defs = '<defs>';
    for (let i = 0; i < archetypes.length; i++) {
        const startAngle = i * segmentAngle - 90;
        const endAngle = (i + 1) * segmentAngle - 90;
        const sr = (startAngle * Math.PI) / 180;
        const er = (endAngle * Math.PI) / 180;
        const x1 = centerX + radius * Math.cos(sr);
        const y1 = centerY + radius * Math.sin(sr);
        const x2 = centerX + radius * Math.cos(er);
        const y2 = centerY + radius * Math.sin(er);
        const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
        defs += `<clipPath id="lwclip-${i}"><path d="${d}"/></clipPath>`;
    }
    defs += '</defs>';

    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" id="loadingWheelSVG" style="filter: drop-shadow(0 4px 20px rgba(0,0,0,0.5));">${defs}
        <g id="loadingWheelGroup" style="transform-box: fill-box; transform-origin: 50% 50%;">
    `;

    for (let i = 0; i < archetypes.length; i++) {
        const startAngle = i * segmentAngle - 90;
        const endAngle = (i + 1) * segmentAngle - 90;
        const sr = (startAngle * Math.PI) / 180;
        const er = (endAngle * Math.PI) / 180;
        const x1 = centerX + radius * Math.cos(sr);
        const y1 = centerY + radius * Math.sin(sr);
        const x2 = centerX + radius * Math.cos(er);
        const y2 = centerY + radius * Math.sin(er);

        svg += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z"
                fill="${colors[i]}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>`;

        const mid = (startAngle + endAngle) / 2;
        const tr = radius * 0.62;
        const tx = centerX + tr * Math.cos((mid * Math.PI) / 180);
        const ty = centerY + tr * Math.sin((mid * Math.PI) / 180);
        const textLen = Math.max(40, Math.round(tr * angleRad * 0.85));

        svg += `<text class="wheel-text" x="${tx}" y="${ty}"
                fill="white" font-size="${fontSize}" font-weight="700"
                text-anchor="middle" dominant-baseline="middle"
                transform="rotate(${mid + 90}, ${tx}, ${ty})"
                clip-path="url(#lwclip-${i})" lengthAdjust="spacingAndGlyphs" textLength="${textLen}"
                style="text-shadow: 1px 1px 3px rgba(0,0,0,0.8); pointer-events: none;">${archetypes[i]}</text>`;
    }

    // центр (внутри вращающейся группы)
    svg += `<circle cx="${centerX}" cy="${centerY}" r="25" fill="rgba(255,255,255,0.9)" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>
            <circle cx="${centerX}" cy="${centerY}" r="15" fill="rgba(255,107,107,0.8)"/>
        </g>`;

    // Неподвижная стрелка
    const arrowSize = 25;
    const arrowY = 5;
    svg += `<path d="M ${centerX} ${arrowY} L ${centerX - arrowSize/2} ${arrowY + arrowSize} L ${centerX + arrowSize/2} ${arrowY + arrowSize} Z"
            fill="#ff3333" stroke="rgba(255,255,255,0.9)" stroke-width="2"
            style="filter: drop-shadow(0 2px 8px rgba(255,51,51,0.6));"/>
            <circle cx="${centerX}" cy="${arrowY + arrowSize + 5}" r="8" fill="rgba(255,51,51,0.9)" stroke="white" stroke-width="2"/>
        </svg>`;

    container.innerHTML = svg;

    // Незаметность подписей во время вращения
    const blurStyle = document.createElement('style');
    blurStyle.textContent = `#loadingWheel .wheel-text { filter: blur(2px); opacity: .7; }`;
    document.head.appendChild(blurStyle);

    // Крутим только группу
    let rotation = 0;
    const group = document.getElementById('loadingWheelGroup');
    const spinInterval = setInterval(() => {
        rotation = (rotation + 5) % 360;
        group.style.transform = `rotate(${rotation}deg)`;
    }, 16);

    window.loadingWheelInterval = spinInterval;
}

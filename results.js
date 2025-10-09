// Results page functionality
document.addEventListener('DOMContentLoaded', function() {
    const results = JSON.parse(localStorage.getItem('testResults') || '{}');
    
    if (!results.readinessScore) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: white;">Результаты теста не найдены. <a href="index.html" style="color: #4ecdc4;">Вернуться на главную</a></div>';
        return;
    }

    // Update score display
    const scoreElement = document.getElementById('scoreNumber');
    if (scoreElement) {
        scoreElement.textContent = results.readinessScore;
    }

    // Update profile display with new archetype names
    const profileElement = document.getElementById('profile-type');
    if (profileElement) {
        profileElement.textContent = results.profileName || 'Системный Оптимизатор';
    }

    // Update personalized diagnostic message
    const messageElement = document.getElementById('personalized-message');
    if (messageElement && results.personalizedMessage) {
        // Разбиваем сообщение на параграфы для лучшего отображения
        const paragraphs = results.personalizedMessage.split('\n\n');
        messageElement.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    }

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

    // Animate speedometer
    if (typeof results.readinessScore === 'number') {
        animateSpeedometer(results.readinessScore);
    }
});

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
            return '<p>Персональная стратегия развития будет сгенерирована на основе ваших результатов.</p>';
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

function downloadGift() {
    const results = JSON.parse(localStorage.getItem('testResults') || '{}');
    const userData = JSON.parse(localStorage.getItem('fullUserData') || '{}');
    
    // Simulate gift download/email sending
    const button = document.getElementById('giftButton');
    const originalText = button.textContent;
    
    button.textContent = 'Отправляем...';
    button.disabled = true;
    
    // Here you would typically send data to your backend
    // For demo purposes, we'll just simulate the process
    setTimeout(() => {
        button.textContent = 'Подарок отправлен на email!';
        button.style.background = '#4CAF50';
        
        // Show success message
        showSuccessMessage();
        
        // Log data for demonstration (remove in production)
        console.log('User Data:', userData);
        console.log('Test Results:', results);
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.background = '';
        }, 3000);
    }, 1500);
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
        margin-bottom: 20px;
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
        bottom: 10px;
        left: 10px;
        color: #b0b0b0;
        font-size: 0.9rem;
    }
    
    .label-middle {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        color: #b0b0b0;
        font-size: 0.9rem;
    }
    
    .label-end {
        position: absolute;
        bottom: 10px;
        right: 10px;
        color: #b0b0b0;
        font-size: 0.9rem;
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
        }
        
        .speedometer-arc {
            width: 150px;
            height: 75px;
        }
        
        .speedometer-needle {
            height: 60px;
        }
        
        .score-number {
            font-size: 2.5rem;
        }
        
        .social-links {
            flex-direction: column;
            align-items: center;
        }
    }
`;
document.head.appendChild(style);

// New dynamic single-question test
let currentIndex = 0;
let testData = {};

const questions = [
  // Блок 1: Ваша текущая реальность. «Кто вы на карте будущего?»
  { id: 'q1', block: 'Ваша текущая реальность', text: 'Какова ваша основная роль в рабочем процессе?', type: 'radio', options: ['Я — исполнитель: отвечаю за конкретные задачи и их качество.', 'Я — координатор/менеджер: управляю процессами и/или командой.', 'Я — стратег/владелец: определяю вектор развития, ищу новые возможности.', 'Я — "универсальный солдат": делаю все вышеперечисленное.'] },
  { id: 'q2', block: 'Ваша текущая реальность', text: 'С какой из этих рутинных задач вы сталкиваетесь чаще всего?', type: 'radio', options: ['Обработка и структурирование больших объемов информации (отчеты, письма, документы).', 'Поиск идей, подготовка контента (презентации, статьи, посты).', 'Монотонные операции и повторяющиеся действия в программах.', 'Анализ данных для принятия решений (поиск трендов, аномалий).'] },
  { id: 'q3', block: 'Ваша текущая реальность', text: 'Как бы вы описали свой текущий уровень владения современными цифровыми инструментами (кроме стандартного офисного пакета)?', type: 'radio', options: ['Уверенный пользователь: легко осваиваю новые программы, если есть инструкция.', 'Энтузиаст: пробую новые сервисы и приложения "для себя", ищу способы оптимизации.', 'Power User: активно использую скрипты, макросы, сложные формулы или no-code/low-code платформы.', 'Новичок: предпочитаю проверенные и знакомые инструменты.'] },
  { id: 'q4', block: 'Ваша текущая реальность', text: 'Как вы оцениваете влияние AI на вашу отрасль в ближайшие 2-3 года?', type: 'radio', options: ['Критическое: те, кто не адаптируется, останутся позади.', 'Значительное: появятся новые инструменты, но основы профессии не изменятся.', 'Умеренное: коснется только некоторых аспектов работы.', 'Пока неясно: слишком много шума, мало конкретики.'] },

  // Блок 2: Препятствия на пути. «Что мешает вашему росту?»
  { id: 'q5', block: 'Препятствия на пути', text: 'Что является главным барьером для вас в активном использовании AI прямо сейчас?', type: 'radio', options: ['Нехватка времени: нет свободных часов, чтобы сесть и разобраться.', 'Информационный перегруз: неясно, с чего начать, какие инструменты действительно полезны.', 'Техническая сложность: кажется, что это требует навыков программирования.', 'Отсутствие конкретной задачи: не понимаю, как применить AI в своей работе.'] },
  { id: 'q6', block: 'Препятствия на пути', text: 'Какое из утверждений об AI вызывает у вас наибольшее опасение?', type: 'radio', options: ['"AI может обесценить мой опыт и даже заменить меня".', '"Данные, которые я доверю AI, могут быть использованы небезопасно".', '"Это \'черный ящик\', я не смогу контролировать результат и нести за него ответственность".', '"Чтобы получить реальную пользу, нужны огромные бюджеты".'] },
  { id: 'q7', block: 'Препятствия на пути', text: 'Вспомните свой последний опыт изучения новой сложной технологии. Что было самым трудным?', type: 'radio', options: ['Найти качественные, структурированные материалы.', 'Совмещать обучение с основной работой.', 'Отсутствие наставника, которому можно задать вопрос.', 'Понять, как перейти от теории к практике и получить первый результат.'] },
  { id: 'q8', block: 'Препятствия на пути', text: 'Представьте, что вы уже начали внедрять AI. Какая гипотетическая проблема вас тревожит больше всего?', type: 'radio', options: ['Я потрачу много времени на обучение, но не получу ожидаемого роста производительности.', 'Мое руководство или команда не оценят инициативу, сочтут это "игрушками".', 'Инструменты, которые я освою, быстро устареют.', 'Я совершу ошибку из-за неправильного использования AI, которая будет стоить дорого.'] },

  // Блок 3: Предпочитаемые решения. «Ваш идеальный путь к мастерству»
  { id: 'q9', block: 'Предпочитаемые решения', text: 'Если бы вы могли получить один "суперэффект" от AI уже завтра, что бы вы выбрали?', type: 'radio', options: ['Освободить 5-10 часов в неделю за счет автоматизации рутины.', 'Генерировать идеи и решения для сложных задач на порядок быстрее.', 'Создать персонализированного ассистента, который помогает с аналитикой и планированием.', 'Получить новое, востребованное на рынке умение и повысить свою стоимость как специалиста.'] },
  { id: 'q10', block: 'Предпочитаемые решения', text: 'Какой формат обучения вы считаете для себя наиболее эффективным?', type: 'radio', options: ['Короткий интенсив (мастер-класс): один конкретный инструмент/навык за несколько часов.', 'Комплексный курс: глубокое погружение в тему с домашними заданиями и обратной связью.', 'Практический воркшоп: совместное создание работающего решения (например, агента) под руководством эксперта.', 'Самостоятельное изучение по предоставленным материалам с возможностью задавать вопросы в чате.'] },
  { id: 'q11', block: 'Предпочитаемые решения', text: 'Что для вас важнее в обучении?', type: 'radio', options: ['Фундаментальные знания: я хочу понимать, "как это работает" изнутри.', 'Практические инструменты: мне нужен готовый воркфлоу, который я смогу применить сразу после занятия.', 'Поддержка и нетворкинг: важно быть в сообществе единомышленников и общаться с наставником.', 'Гибкость: возможность проходить обучение в своем темпе.'] },
  { id: 'q12', block: 'Предпочитаемые решения', text: 'Какое направление вам кажется наиболее перспективным для ваших задач?', type: 'radio', options: ['Автоматизация рабочих процессов (Workflow Automation).', 'Создание умных чат-ботов и агентов.', 'Продвинутый анализ данных и прогнозирование.', 'Генерация креативного контента (тексты, изображения).'] },

  // Блок 4: Открытый вопрос. «Ваш личный запрос»
  { id: 'q13', block: 'Ваш личный запрос', text: 'Есть ли какая-то конкретная задача или проблема в вашей работе, для которой вы ищете решение, но не нашли ее в вариантах выше? Опишите ее кратко.', type: 'textarea', placeholder: 'Поле для свободного ввода...' }
];

document.addEventListener('DOMContentLoaded', () => {
  renderQuestion();
  updateProgress();
  updateNavVisibility();
  // keyboard navigation
  document.addEventListener('keydown', onKeyNav);
});

function renderQuestion() {
  const q = questions[currentIndex];
  const blockTitle = document.getElementById('blockTitle');
  blockTitle.textContent = q.block;

  const container = document.getElementById('questionContainer');
  container.innerHTML = '';

  const h3 = document.createElement('h3');
  h3.textContent = `${currentIndex + 1}. ${q.text}`;
  container.appendChild(h3);

  if (q.type === 'radio') {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'options';
    q.options.forEach((opt, idx) => {
      const id = `${q.id}_${idx}`;
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = q.id;
      input.value = opt;
      input.id = id;
      if (testData[q.id] === opt) input.checked = true;
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      optionsDiv.appendChild(label);
    });
    container.appendChild(optionsDiv);
  } else if (q.type === 'textarea') {
    const wrap = document.createElement('div');
    wrap.className = 'text-input';
    const ta = document.createElement('textarea');
    ta.name = q.id;
    ta.placeholder = q.placeholder || '';
    ta.rows = 4;
    ta.value = testData[q.id] || '';
    wrap.appendChild(ta);
    container.appendChild(wrap);
  }

  // helper hint
  const hint = document.createElement('div');
  hint.style.marginTop = '10px';
  hint.style.color = '#9aa0a6';
  hint.style.fontSize = '.95rem';
  hint.textContent = 'Выберите наиболее подходящий вариант. В конце получите персональный профиль готовности.';
  container.appendChild(hint);
}

function nextQuestion() {
  if (!validateCurrent()) return;
  saveCurrent();
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
    updateProgress();
    updateNavVisibility();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
    updateProgress();
    updateNavVisibility();
  }
}

function validateCurrent() {
  const q = questions[currentIndex];
  if (q.type === 'textarea') return true; // optional
  const checked = document.querySelector(`input[name="${q.id}"]:checked`);
  if (!checked) {
    showValidationMessage('Пожалуйста, выберите вариант ответа');
    return false;
  }
  return true;
}

function saveCurrent() {
  const q = questions[currentIndex];
  if (q.type === 'radio') {
    const checked = document.querySelector(`input[name="${q.id}"]:checked`);
    if (checked) testData[q.id] = checked.value;
  } else if (q.type === 'textarea') {
    const ta = document.querySelector(`textarea[name="${q.id}"]`);
    testData[q.id] = ta ? ta.value.trim() : '';
  }
}

function updateProgress() {
  const progress = ((currentIndex + 1) / questions.length) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  document.getElementById('currentQuestion').textContent = currentIndex + 1;
  document.getElementById('totalQuestions').textContent = questions.length;
}

function updateNavVisibility() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  prevBtn.style.display = currentIndex === 0 ? 'none' : 'inline-block';
  if (currentIndex === questions.length - 1) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'inline-block';
    submitBtn.style.display = 'none';
  }
}

function submitTest() {
  saveCurrent();
  // minimal completeness check
  const requiredAnswered = questions.slice(0, questions.length - 1).every(q => testData[q.id]);
  if (!requiredAnswered) {
    showValidationMessage('Ответьте на обязательные вопросы');
    return;
  }
  localStorage.setItem('testData', JSON.stringify(testData));
  window.location.href = 'contact.html';
}

// UI helpers
function showValidationMessage(text) {
  const existing = document.querySelector('.validation-message');
  if (existing) existing.remove();
  const message = document.createElement('div');
  message.className = 'validation-message';
  message.textContent = text;
  const navigation = document.querySelector('.test-navigation');
  navigation.parentNode.insertBefore(message, navigation);
  setTimeout(() => message.remove(), 2500);
}

// Keyboard handlers
function onKeyNav(e) {
  if (e.key === 'ArrowRight') {
    // Try go next if valid
    if (validateCurrent()) {
      nextQuestion();
    }
  } else if (e.key === 'ArrowLeft') {
    prevQuestion();
  } else if (e.key === 'Enter') {
    const q = questions[currentIndex];
    if (q.type === 'radio') {
      // Enter = Next if something selected
      const checked = document.querySelector(`input[name="${q.id}"]:checked`);
      if (checked) {
        nextQuestion();
      }
    } else if (currentIndex === questions.length - 1) {
      submitTest();
    }
  }
}

// Keep existing CSS injection but tuned copy
const style = document.createElement('style');
style.textContent = `
  .validation-message { background: rgba(255,99,99,0.1); border:1px solid rgba(255,99,99,0.3); color:#ff6363; padding:12px 20px; border-radius:8px; margin:20px 0; text-align:center; font-weight:500; animation: fadeIn .3s ease; }
  @keyframes fadeIn { from {opacity:0; transform: translateY(-10px)} to {opacity:1; transform: translateY(0)} }
  .test-container { min-height:100vh; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); padding:20px 0; }
  .test-header { background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%); padding:40px 0; text-align:center; margin-bottom:40px; position:relative; }
  .test-header::before { content:''; position:absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.4); }
  .test-header > * { position:relative; z-index:2; }
  .test-header h1 { font-size:2.5rem; margin-bottom:1rem; color:#fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); font-weight:700; }
  .test-subtitle { font-size:1.1rem; color:#fff; margin-bottom:2rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.7); }
  .progress-bar { width:100%; max-width:500px; height:8px; background: rgba(255,255,255,0.1); border-radius:4px; margin:0 auto 1rem; overflow:hidden; }
  .progress-fill { height:100%; background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); border-radius:4px; transition: width .3s ease; width:6.67%; }
  .progress-text { color:#b0b0b0; font-size:.9rem; }
  .test-content { max-width:800px; margin:0 auto; padding:0 20px; }
  .question-block { background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:40px; margin-bottom:30px; backdrop-filter: blur(10px); }
  .block-title { font-size:1.6rem; margin-bottom:1.5rem; text-align:center; color:#4ecdc4; }
  .question h3 { font-size:1.25rem; margin-bottom:1.2rem; color:#fff; line-height:1.4; }
  .options { display:flex; flex-direction:column; gap:12px; }
  .options label { display:flex; align-items:center; padding:15px 20px; background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:10px; cursor:pointer; transition: all .3s ease; font-size:1rem; color:#e0e0e0; }
  .options label:hover { background: rgba(78,205,196,0.1); border-color: rgba(78,205,196,0.3); transform: translateX(5px); }
  .options input[type=radio] { margin-right:15px; width:18px; height:18px; accent-color:#4ecdc4; }
  .text-input textarea { width:100%; min-height:120px; padding:20px; background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-size:1rem; resize:vertical; }
  .text-input textarea::placeholder { color:#888; }
  .test-navigation { display:flex; justify-content:center; gap:20px; margin-top:30px; }
  .test-navigation button { background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); border:none; color:#fff; padding:15px 30px; font-size:1.05rem; font-weight:600; border-radius:10px; cursor:pointer; transition: all .3s ease; min-width:140px; }
  .test-navigation button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(78,205,196,.4); }
  @media (max-width:768px){ .test-header h1{font-size:2rem} .question-block{padding:30px 20px} .question h3{font-size:1.1rem} .test-navigation{flex-direction:column} .test-navigation button{width:220px} }
`;
document.head.appendChild(style);

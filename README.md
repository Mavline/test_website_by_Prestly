# AI Readiness Test Landing Page

Лендинг и квиз-приложение для оценки готовности к работе с AI технологиями.

## Технологии

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Vercel Serverless Functions
- **AI**: OpenRouter API (модель Z.AI: GLM 4.6)
- **Хостинг**: Vercel
- **Дизайн**: Matrix rain effect + Glassmorphism

## Локальная разработка

1. Откройте проект в браузере:
```bash
python -m http.server 8000
# или
npx serve .
```

2. Перейдите на http://localhost:8000

## Деплой на Vercel

### Через CLI:

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Залогиньтесь:
```bash
vercel login
```

3. Задеплойте:
```bash
vercel
```

4. Добавьте Environment Variables:
```bash
vercel env add OPENROUTER_API_KEY
```

### Через GitHub:

1. Подключите репозиторий к Vercel
2. Добавьте environment variable `OPENROUTER_API_KEY` в настройках проекта
3. Автоматический деплой при push

## Структура файлов

```
.
├── index.html          # Главная страница
├── test.html          # Страница теста
├── contact.html       # Форма контактов
├── results.html       # Страница результатов
├── script.js          # Логика главной страницы
├── test.js            # Логика теста
├── contact.js         # Логика формы + скоринг
├── results.js         # Логика результатов
├── matrix.js          # Matrix rain эффект
├── styles.css         # Глобальные стили
├── api/
│   └── generate-results.js  # Serverless function для OpenRouter
└── vercel.json        # Конфигурация Vercel
```

## API Endpoint

**POST /api/generate-results**

Request:
```json
{
  "testData": {...},
  "profileType": "optimizer|strategist|pioneer",
  "readinessScore": 75
}
```

Response:
```json
{
  "success": true,
  "message": "Персонализированное сообщение от AI..."
}
```

## Environment Variables

- `OPENROUTER_API_KEY` - API ключ от OpenRouter
- `SITE_URL` - URL сайта (для OpenRouter headers)

## Дизайн

- **Matrix Rain** - анимированный фон с падающими символами
- **Glassmorphism** - полупрозрачные карточки с blur эффектом
- **Neon Glow** - неоновые свечения на кнопках и карточках
- **Градиенты** - сочетание cyan, magenta, blue
- **Адаптивный** - оптимизирован для мобильных устройств

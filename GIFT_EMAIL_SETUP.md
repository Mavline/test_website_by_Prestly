# Настройка отправки подарков по email

## Обзор

Система автоматической отправки персонализированных подарков по email для пользователей, прошедших тест AI-готовности.

## Архитектура

### Backend структура
- **Serverless функция**: `/api/send-gift.js` (Vercel Serverless Function)
- **Email сервис**: Resend API (https://resend.com)
- **Файлы подарков**: `/public/gifts/` (статические PDF файлы)

### Типы подарков (по уровню готовности)

1. **HOT лиды (75-100 баллов)** - `/gifts/hot/`
   - AI-Strategy-Professional.pdf
   - AI-Tools-Checklist-100.pdf

2. **WARM лиды (55-74 балла)** - `/gifts/warm/`
   - AI-Tools-50-Productivity.pdf

3. **COLD лиды (0-54 балла)** - `/gifts/cold/`
   - AI-First-Steps-Guide.pdf

## Шаг 1: Настройка Resend Email Service

### 1.1. Создайте аккаунт Resend

1. Зайдите на https://resend.com
2. Создайте аккаунт (бесплатный план включает 3,000 emails/месяц)
3. Подтвердите email

### 1.2. Верифицируйте домен

**ВАЖНО:** Для отправки с вашего домена (@expertai.academy) нужна верификация.

1. В Resend: Settings → Domains → Add Domain
2. Введите: `expertai.academy`
3. Добавьте DNS записи в настройки вашего домена:

```
Type: TXT
Name: _resend
Value: (значение из Resend)

Type: CNAME
Name: resend._domainkey
Value: (значение из Resend)
```

4. Дождитесь верификации (обычно 5-30 минут)

### 1.3. Получите API ключ

1. В Resend: API Keys → Create API Key
2. Название: `ExpertAI Production`
3. Права: `Full access` или `Sending access`
4. **Скопируйте ключ** (он показывается только один раз!)
   - Формат: `re_xxxxxxxxxxxxxxxxxxxxx`

### 1.4. Добавьте ключ в Vercel

```bash
# В Vercel Dashboard:
Settings → Environment Variables → Add

Name: RESEND_API_KEY
Value: re_xxxxxxxxxxxxxxxxxxxxx
Environment: Production (и другие, если нужно)
```

## Шаг 2: Подготовка PDF файлов подарков

### 2.1. Структура файлов

Создайте следующую структуру в вашем проекте:

```
public/
└── gifts/
    ├── hot/
    │   ├── ai-strategy-professional.pdf
    │   └── ai-tools-checklist-100.pdf
    ├── warm/
    │   └── ai-tools-50-productivity.pdf
    └── cold/
        └── ai-first-steps-guide.pdf
```

### 2.2. Требования к файлам

- **Формат**: PDF
- **Размер**: до 10 MB на файл (ограничение Resend)
- **Имена файлов**: lowercase, через дефис, без пробелов
- **Кодировка**: UTF-8 (для кириллицы в метаданных)

### 2.3. Загрузка файлов

```bash
# Локально создайте структуру
cd /mnt/c/Users/pavelk/Desktop/Projects/Landing_by_Prestly
mkdir -p public/gifts/hot public/gifts/warm public/gifts/cold

# Поместите PDF файлы в соответствующие папки
# Затем закоммитьте и задеплойте на Vercel
```

### 2.4. Проверка доступности файлов

После деплоя на Vercel проверьте, что файлы доступны:

```
https://www.expertai.academy/gifts/hot/ai-strategy-professional.pdf
https://www.expertai.academy/gifts/warm/ai-tools-50-productivity.pdf
https://www.expertai.academy/gifts/cold/ai-first-steps-guide.pdf
```

## Шаг 3: Настройка файла конфигурации Vercel

### 3.1. Обновите vercel.json

Добавьте настройки для статических файлов (если еще не добавлено):

```json
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/test", "destination": "/test.html" },
    { "source": "/contact", "destination": "/contact.html" },
    { "source": "/results", "destination": "/results.html" },
    { "source": "/clear-data", "destination": "/clear-data.html" }
  ],
  "headers": [
    {
      "source": "/gifts/(.*)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/pdf"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Шаг 4: Тестирование функционала

### 4.1. Локальное тестирование API

```bash
# Установите переменные окружения локально
cp .env.local.example .env.local
# Добавьте RESEND_API_KEY в .env.local

# Тестовый запрос
curl -X POST https://www.expertai.academy/api/send-gift \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test@email.com",
    "name": "Тестовый Пользователь",
    "profileType": "strategist",
    "readinessScore": 80
  }'
```

### 4.2. Тестирование через интерфейс

1. Пройдите тест на сайте
2. На странице результатов нажмите "Получить подарок"
3. Проверьте:
   - Кнопка меняет текст на "Отправляем..."
   - Приходит сообщение об успешной отправке
   - Email приходит в течение 1-2 минут

### 4.3. Проверка email в Resend Dashboard

1. Зайдите в Resend Dashboard
2. Emails → Recent Emails
3. Найдите отправленный email
4. Проверьте:
   - Status: `delivered`
   - To: правильный email
   - Attachments: PDF файлы прикреплены

## Шаг 5: Мониторинг и логи

### 5.1. Логи Vercel

```bash
# Просмотр логов функции
# В Vercel Dashboard:
Functions → /api/send-gift → View Logs
```

### 5.2. Метрики Resend

```bash
# В Resend Dashboard:
Analytics → Delivery Stats
- Отправлено
- Доставлено
- Отклонено
```

## Troubleshooting

### Проблема: Email не отправляется

**Решение:**
```bash
# 1. Проверьте API ключ в Vercel
Settings → Environment Variables → RESEND_API_KEY

# 2. Проверьте домен верифицирован
Resend Dashboard → Domains → статус должен быть "Verified"

# 3. Проверьте логи
Vercel Dashboard → Functions → /api/send-gift → Logs
```

### Проблема: PDF не прикрепляется

**Решение:**
```bash
# 1. Проверьте размер файла (макс 10 MB)
ls -lh public/gifts/hot/*.pdf

# 2. Проверьте доступность URL
curl -I https://www.expertai.academy/gifts/hot/ai-strategy-professional.pdf

# 3. Проверьте формат имени файла в коде
# api/send-gift.js → getGiftContent() → pdfFiles
```

### Проблема: Email попадает в спам

**Решение:**
1. Убедитесь, что домен верифицирован в Resend
2. Добавьте SPF и DKIM записи (Resend предоставляет)
3. Используйте корректный "from" адрес (`AI Academy <noreply@expertai.academy>`)
4. Не используйте спам-слова в теме письма

### Проблема: Ошибка CORS

**Решение:**
```javascript
// В api/send-gift.js уже настроены CORS заголовки
// Если проблема сохраняется, проверьте:
res.setHeader('Access-Control-Allow-Origin', '*');
```

## Customization

### Изменение контента email

Отредактируйте функцию `generateEmailHTML()` в `/api/send-gift.js`:

```javascript
function generateEmailHTML(name, giftContent) {
    return `
    <!DOCTYPE html>
    <html>
    <!-- Ваш HTML шаблон -->
    </html>
    `;
}
```

### Добавление новых типов подарков

1. Создайте новую папку: `/public/gifts/новый-тип/`
2. Добавьте PDF файлы
3. Обновите логику в `getGiftContent()`:

```javascript
function getGiftContent(profileType, readinessScore) {
    const clientType = readinessScore >= 90 ? 'premium' :
                      readinessScore >= 75 ? 'hot' :
                      readinessScore >= 55 ? 'warm' : 'cold';

    const gifts = {
        premium: {
            title: 'Премиум пакет',
            // ...
        },
        // остальные типы
    };
}
```

### Изменение email отправителя

```javascript
// В api/send-gift.js
from: 'Ваше Имя <email@yourdomain.com>',
```

**ВАЖНО:** Домен должен быть верифицирован в Resend!

## Лимиты Resend

### Бесплатный план
- 3,000 emails/месяц
- 100 emails/день
- 10 MB на attachment

### Платные планы
- От $20/месяц за 50,000 emails
- Больше лимитов на attachments
- Приоритетная поддержка

Подробнее: https://resend.com/pricing

## Безопасность

1. **НИКОГДА не коммитьте API ключи** в Git
   ```bash
   # .gitignore должен содержать:
   .env
   .env.local
   .env*.local
   ```

2. **Ротация ключей** - обновляйте API ключ раз в 3-6 месяцев

3. **Rate limiting** - Resend автоматически ограничивает частоту запросов

4. **Валидация input** - уже реализована в `/api/send-gift.js`

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Vercel Docs: https://vercel.com/docs/functions

## Чеклист запуска

- [ ] Создан аккаунт Resend
- [ ] Домен верифицирован в Resend
- [ ] API ключ получен и добавлен в Vercel
- [ ] PDF файлы созданы и размещены в `/public/gifts/`
- [ ] Структура папок соответствует документации
- [ ] Файлы доступны по URL
- [ ] Проведено тестирование отправки
- [ ] Email доставлен успешно
- [ ] PDF прикреплены к письму
- [ ] Проверены логи в Vercel и Resend
- [ ] Email не попадает в спам

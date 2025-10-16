# Настройка переменных окружения

Для работы всех функций проекта необходимо настроить следующие переменные окружения в Vercel:

## Переменные окружения

### 1. OPENROUTER_API_KEY
**Описание:** API ключ для OpenRouter (AI модель GLM 4.6)
**Где получить:** https://openrouter.ai/keys
**Как добавить в Vercel:**
```
Settings → Environment Variables
Name: OPENROUTER_API_KEY
Value: sk-or-v1-...
```

### 2. GOOGLE_SCRIPT_URL
**Описание:** URL Google Apps Script Web App для сохранения данных в Google Sheets
**Где получить:** См. файл `GOOGLE_SHEETS_SETUP.md`
**Как добавить в Vercel:**
```
Settings → Environment Variables
Name: GOOGLE_SCRIPT_URL
Value: https://script.google.com/macros/s/.../exec
```

### 3. RESEND_API_KEY
**Описание:** API ключ для Resend (отправка email с подарками)
**Где получить:** https://resend.com/api-keys
**Как добавить в Vercel:**
```
Settings → Environment Variables
Name: RESEND_API_KEY
Value: re_...
```

### 4. SITE_URL (опционально)
**Описание:** URL вашего сайта для OpenRouter
**Значение по умолчанию:** https://www.expertai.academy
**Как добавить в Vercel:**
```
Settings → Environment Variables
Name: SITE_URL
Value: https://your-domain.com
```

## После добавления переменных

1. Сохраните все переменные
2. Перейдите в Deployments
3. Нажмите "Redeploy" на последнем деплойменте
4. Выберите "Use existing Build Cache"
5. Нажмите "Redeploy"

## Проверка работы

После деплоя проверьте:
- ✅ AI генерация результатов работает
- ✅ Данные сохраняются в Google Sheets
- ✅ Кнопка "Получить подарок" отправляет email

## Troubleshooting

### AI не генерирует результаты
- Проверьте `OPENROUTER_API_KEY` в Vercel
- Убедитесь что модель `z-ai/glm-4.6` доступна

### Данные не попадают в Google Sheets
- Проверьте `GOOGLE_SCRIPT_URL` в Vercel
- Убедитесь что Web App настроен с доступом "Anyone"
- Проверьте логи в Google Apps Script

### Подарок не отправляется
- Проверьте `RESEND_API_KEY` в Vercel
- Убедитесь что email домен верифицирован в Resend
- Проверьте логи в Vercel Functions

# Настройка Google Sheets интеграции

## Шаг 1: Создайте Google Таблицу

1. Откройте https://sheets.google.com
2. Создайте новую таблицу с названием "AI Test Results"
3. В первой строке создайте заголовки колонок:
   - A1: Timestamp
   - B1: Name
   - C1: Email
   - D1: Phone
   - E1: Profile Type
   - F1: Readiness Score
   - G1: Test Answers (JSON)

## Шаг 2: Создайте Google Apps Script

1. В вашей таблице: Extensions → Apps Script
2. Удалите весь код и вставьте следующий:

```javascript
function doPost(e) {
  try {
    // Получаем данные из запроса
    const data = JSON.parse(e.postData.contents);

    // Открываем активную таблицу
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Подготавливаем строку данных
    const row = [
      new Date().toISOString(),           // Timestamp
      data.name || '',                     // Name
      data.email || '',                    // Email
      data.phone || '',                    // Phone
      data.profileType || '',              // Profile Type
      data.readinessScore || '',           // Readiness Score
      JSON.stringify(data) || ''           // Full data as JSON
    ];

    // Добавляем строку в таблицу
    sheet.appendRow(row);

    // Возвращаем успешный ответ
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Google Sheets API is working'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Шаг 3: Деплой Apps Script

1. Нажмите "Deploy" → "New deployment"
2. Выберите тип: "Web app"
3. Настройки:
   - Execute as: **Me** (ваш email)
   - Who has access: **Anyone**
4. Нажмите "Deploy"
5. Скопируйте Web App URL (выглядит как: https://script.google.com/macros/s/AKfycby.../exec)

## Шаг 4: Добавьте URL в Vercel

1. Откройте ваш проект на Vercel
2. Settings → Environment Variables
3. Добавьте переменную:
   - Name: `GOOGLE_SCRIPT_URL`
   - Value: (ваш Web App URL из шага 3)
4. Сохраните и передеплойте проект

## Готово!

Теперь данные из формы будут автоматически сохраняться в Google Таблицу.

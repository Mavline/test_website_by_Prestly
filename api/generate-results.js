// Vercel Serverless Function for OpenRouter API
// Model: Z.AI: GLM 4.6

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { testData, profileType, readinessScore } = req.body;

        // Validate input
        if (!testData || typeof testData !== 'object' || Object.keys(testData).length === 0) {
            console.error('Invalid testData:', testData);
            return res.status(400).json({
                error: 'Missing or invalid testData',
                received: { hasTestData: !!testData, testDataType: typeof testData, keys: testData ? Object.keys(testData).length : 0 }
            });
        }

        if (!profileType) {
            console.error('Missing profileType');
            return res.status(400).json({ error: 'Missing profileType' });
        }

        // OpenRouter API configuration
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY not configured');
            return res.status(500).json({ error: 'API configuration missing' });
        }

        // Prepare prompt for GLM 4.6 with HONEST scoring system
        const systemPrompt = `Вы - эксперт по AI и автоматизации с опытом оценки готовности специалистов к внедрению AI-технологий.

ВАЖНО: Система оценки основана на ЧЕСТНОМ подсчете баллов (от 0 до 100), где каждый балл отражает реальную готовность человека работать с AI.

Профили пользователей (на основе честных баллов готовности):

1. **Эксперт (76-100 баллов)** - HOT лид
   - Высокая техническая подкованность
   - Понимает важность AI для карьеры/бизнеса
   - Готов к сложным проектам и монетизации навыков
   - Нужен: консалтинг, премиум-программы, партнерство

2. **Практик (56-75 баллов)** - WARM-HOT лид
   - Активно использует цифровые инструменты
   - Видит конкретные задачи для AI
   - Готов внедрять и учиться
   - Нужен: структурированные курсы, воркшопы, практика

3. **Исследователь (31-55 баллов)** - WARM лид
   - Интересуется AI, но пока без системности
   - Есть барьеры (время, информационный перегруз)
   - Готов пробовать, но нужна поддержка
   - Нужен: вводные курсы, сообщество, простые кейсы

4. **Наблюдатель (0-30 баллов)** - COLD лид
   - Низкая готовность или сильные опасения
   - Слабое понимание AI или нет конкретных задач
   - Нужно снять страхи и показать базовые возможности
   - Нужен: бесплатный контент, развенчание мифов, простые примеры

Ваша задача:
- Провести ЧЕСТНЫЙ анализ ответов пользователя
- Объяснить, ПОЧЕМУ он получил именно этот балл (на основе его ответов)
- Дать развернутые выводы и рекомендации
- Быть многословным, детальным и конкретным
- НЕ приукрашивать и НЕ занижать результаты`;

        const userPrompt = `Профиль: ${profileType}
Уровень готовности: ${readinessScore}/100

Данные теста (ответы пользователя):
${JSON.stringify(testData, null, 2)}

Создайте развернутое персонализированное сообщение (4-6 абзацев), которое:

1. **АНАЛИЗ**: Объясните, почему пользователь получил именно ${readinessScore} баллов. Процитируйте конкретные ответы, которые повлияли на оценку (как положительно, так и отрицательно).

2. **ЧЕСТНАЯ ОЦЕНКА**: Опишите сильные стороны И слабые места в готовности пользователя. Будьте объективны - не приукрашивайте, но и не обесценивайте.

3. **ВЫВОДЫ**: Дайте развернутый вывод о том, на каком этапе пути к AI-мастерству находится человек. Что у него уже есть, чего не хватает.

4. **КОНКРЕТНЫЕ ШАГИ**: Предложите 3-4 конкретных действия, которые нужно сделать в первую очередь, исходя из его профиля и барьеров.

Тон: профессиональный коуч, который говорит правду, но поддерживает. Без лишнего позитива и мотивационной воды. Конкретика и честность.

Формат: простой текст, 4-6 абзацев, развернутые объяснения.`;

        // Call OpenRouter API with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.SITE_URL || 'https://www.expertai.academy',
                    'X-Title': 'AI Readiness Test'
                },
                body: JSON.stringify({
                    model: 'z-ai/glm-4.6',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500  // Увеличено для развернутых ответов
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('OpenRouter API error:', errorText);
                return res.status(response.status).json({
                    error: 'AI service error',
                    details: errorText
                });
            }

            const data = await response.json();
            const aiMessage = data.choices?.[0]?.message?.content;

            if (!aiMessage) {
                throw new Error('No response from AI');
            }

            return res.status(200).json({
                success: true,
                message: aiMessage,
                profile: profileType,
                readinessScore: readinessScore,
                aiGeneratedStrategy: aiMessage,
                usage: data.usage
            });

        } catch (fetchError) {
            clearTimeout(timeout);
            if (fetchError.name === 'AbortError') {
                console.error('OpenRouter API timeout');
                return res.status(504).json({
                    error: 'AI service timeout',
                    message: 'Request took too long'
                });
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('Error in generate-results:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

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

        // Prepare prompt for GLM 4.6 with 10 archetypes
        const systemPrompt = `Вы - эксперт по AI и автоматизации с опытом анализа мотивации и подходов людей к технологическим изменениям.

10 АРХЕТИПОВ (вы ДОЛЖНЫ выбрать ОДИН наиболее подходящий):

1. **Оптимизатор** - Видит процессы, ищет узкие места и способы устранить хаос. AI для него = инструмент для борьбы с рутиной и возврата контроля над временем.

2. **Визионер** - Думает на годы вперед, видит в AI возможность переизобрести индустрию. Деньги вторичны, главное - создать новую ценность и влияние.

3. **Прагматик** - Фокусируется на конкретных результатах здесь и сейчас. AI = набор практических инструментов для решения текущих задач, без философии.

4. **Предприниматель** - Постоянно ищет новые возможности для роста и масштабирования. AI = конкурентное преимущество и способ вырваться вперед.

5. **Энтузиаст** - Любит пробовать всё новое, экспериментировать. AI = захватывающая территория для открытий. Уже играл с инструментами, хочет углубиться.

6. **Скептик** - Критически оценивает хайп, сомневается в обещаниях. Пришел проверить - не фигня ли это. Готов переубедиться, но нужны доказательства.

7. **Наблюдатель** - Осторожно изучает издалека, прежде чем принять решение. AI интересен, но пока не готов прыгать в воду. Нужна уверенность и понятный план.

8. **Универсал** - Совмещает множество ролей, тянет на себе кучу задач. Тонет в многозадачности. AI = способ клонировать себя и не утонуть окончательно.

9. **Аналитик** - Ценит глубину, фундамент, понимание принципов. AI требует не просто "нажать кнопку", а разобраться, как это работает на самом деле.

10. **Искатель** - Ищет новый смысл и роль в меняющемся мире. Возможно выгорел или устал от текущей работы. AI = шанс переосмыслить свою профессию и найти новый вызов.

Ваша задача:
- Проанализировать ВСЕ ответы пользователя
- ВЫБРАТЬ ОДИН архетип из 10 (наиболее подходящий)
- Дать честный, развернутый, интересный анализ
- Быть конкретным, многословным (4-6 абзацев)
- Говорить правду, но поддерживать`;

        const userPrompt = `Данные теста (ответы пользователя):
${JSON.stringify(testData, null, 2)}

ОБЯЗАТЕЛЬНО начните свой ответ с названия архетипа в формате:
АРХЕТИП: [название]

Затем создайте развернутое персонализированное сообщение (4-6 абзацев):

1. **АНАЛИЗ**: Объясните, почему вы выбрали именно этот архетип. Процитируйте конкретные ответы пользователя, которые на это указывают.

2. **ХАРАКТЕРИСТИКА**: Опишите, как этот архетип проявляется у данного человека. Какие у него сильные стороны, какие барьеры, что его мотивирует.

3. **ЧЕСТНАЯ ОЦЕНКА**: Что уже есть у человека, что ему поможет. Чего не хватает или что может помешать. Без приукрашивания, но с поддержкой.

4. **КОНКРЕТНЫЕ ШАГИ**: 3-4 практических действия, которые стоит сделать в первую очередь, учитывая его архетип и ответы.

Тон: профессиональный коуч, который говорит правду и вдохновляет. Без мотивационной воды, с конкретикой.

ВАЖНО: Первая строка ОБЯЗАТЕЛЬНО должна быть "АРХЕТИП: [название]"`;

        // Call OpenRouter API with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout (модель может думать 1-2 минуты)

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

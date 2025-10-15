// Vercel Serverless Function for OpenRouter API
// Model: x-ai/grok-4-fast

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
        if (!testData || !profileType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // OpenRouter API configuration
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY not configured');
            return res.status(500).json({ error: 'API configuration missing' });
        }

        // Prepare prompt for Grok 4 Fast
        const systemPrompt = `Вы - эксперт по AI и автоматизации. Анализируете результаты теста готовности к AI и создаёте персонализированные рекомендации на русском языке.

Архетипы пользователей:
- optimizer (Системный Оптимизатор): фокус на эффективность и автоматизацию
- strategist (Дальновидный Практик): долгосрочное планирование и развитие
- pioneer (Энтузиаст-Экспериментатор): инновации и эксперименты

Ваша задача: создать краткое, мотивирующее сообщение (2-3 абзаца) для пользователя с профилем ${profileType} и уровнем готовности ${readinessScore}/100.`;

        const userPrompt = `Профиль: ${profileType}
Уровень готовности: ${readinessScore}/100

Данные теста:
${JSON.stringify(testData, null, 2)}

Создайте персонализированное сообщение в стиле коучинга, которое:
1. Подтверждает сильные стороны пользователя
2. Даёт конкретные next steps
3. Мотивирует на действия

Формат: простой текст, 2-3 абзаца, неформально-профессиональный тон.`;

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.SITE_URL || 'https://www.expertai.academy',
                'X-Title': 'AI Readiness Test'
            },
            body: JSON.stringify({
                model: 'x-ai/grok-4-fast',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

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

    } catch (error) {
        console.error('Error in generate-results:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

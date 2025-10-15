// Vercel Serverless Function for sending gift via email
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
        const { email, name, profileType, readinessScore } = req.body;

        // Validate required fields
        if (!email || !name) {
            return res.status(400).json({ error: 'Missing required fields: email and name' });
        }

        // Determine gift materials based on profile type
        const giftContent = getGiftContent(profileType, readinessScore);

        // Email service configuration (using Resend API as example)
        const RESEND_API_KEY = process.env.RESEND_API_KEY;

        if (!RESEND_API_KEY) {
            console.error('RESEND_API_KEY not configured');
            return res.status(500).json({ error: 'Email service not configured' });
        }

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'AI Academy <noreply@expertai.academy>',
                to: email,
                subject: `🎁 Ваш персональный подарок: ${giftContent.title}`,
                html: generateEmailHTML(name, giftContent)
            })
        });

        if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error('Email service error:', errorText);
            return res.status(emailResponse.status).json({
                error: 'Failed to send email',
                details: errorText
            });
        }

        const emailResult = await emailResponse.json();

        return res.status(200).json({
            success: true,
            message: 'Gift sent successfully',
            emailId: emailResult.id
        });

    } catch (error) {
        console.error('Error in send-gift:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

function getGiftContent(profileType, readinessScore) {
    const clientType = readinessScore >= 75 ? 'hot' : readinessScore >= 55 ? 'warm' : 'cold';

    const gifts = {
        hot: {
            title: 'AI-стратегия для профессионалов',
            description: 'Эксклюзивный гайд + персональная консультация на 30 минут',
            materials: [
                'Гайд "AI-стратегия для профессионалов" (PDF)',
                'Чек-лист из 100 AI-инструментов (PDF)',
                'Промокод на консультацию: EXPERT30',
                'Доступ к закрытому сообществу',
                'Бонус: Шаблоны промптов для вашей профессии'
            ]
        },
        warm: {
            title: '50 AI-инструментов для повышения продуктивности',
            description: 'Подробный чек-лист + доступ к закрытому сообществу',
            materials: [
                'Чек-лист "50 AI-инструментов для повышения продуктивности" (PDF)',
                'Видео-гайд: "Как выбрать свой первый AI-инструмент"',
                'Доступ к закрытому Telegram-сообществу',
                'Шаблоны автоматизации для вашей сферы'
            ]
        },
        cold: {
            title: 'Первые шаги в AI',
            description: 'Стартовый набор с пошаговым планом изучения',
            materials: [
                'Гайд "Первые шаги в AI" (PDF)',
                'Пошаговый план изучения на 30 дней',
                '10 простых AI-инструментов для начинающих',
                'Видео: "Основы работы с ChatGPT"'
            ]
        }
    };

    return gifts[clientType] || gifts.cold;
}

function generateEmailHTML(name, giftContent) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .gift-title {
            color: #4ecdc4;
            font-size: 22px;
            font-weight: bold;
            margin: 20px 0 10px;
        }
        .gift-description {
            color: #666;
            margin-bottom: 20px;
        }
        .materials {
            background: #f8f9fa;
            border-left: 4px solid #4ecdc4;
            padding: 20px;
            margin: 20px 0;
        }
        .materials h3 {
            margin-top: 0;
            color: #333;
        }
        .materials ul {
            padding-left: 20px;
            margin: 10px 0;
        }
        .materials li {
            margin: 8px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            color: #4ecdc4;
            text-decoration: none;
            margin: 0 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎁 Ваш персональный подарок готов!</h1>
        </div>
        <div class="content">
            <p class="greeting">Здравствуйте, ${name}!</p>

            <p>Спасибо за прохождение теста готовности к AI. Мы подготовили для вас персональный подарок, который поможет вам на пути освоения искусственного интеллекта.</p>

            <div class="gift-title">${giftContent.title}</div>
            <p class="gift-description">${giftContent.description}</p>

            <div class="materials">
                <h3>Что входит в ваш подарок:</h3>
                <ul>
                    ${giftContent.materials.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>

            <p>Все материалы доступны по ссылке ниже. Сохраните эту ссылку - доступ к материалам остается навсегда.</p>

            <center>
                <a href="https://www.expertai.academy/gifts" class="cta-button">Получить подарок</a>
            </center>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <strong>P.S.</strong> Если у вас возникнут вопросы или вам понадобится помощь - пишите напрямую в Telegram, я всегда рад помочь!
            </p>
        </div>
        <div class="footer">
            <div class="social-links">
                <a href="https://t.me/intellects_relationships">Telegram</a>
                <a href="https://www.linkedin.com/in/konovalov-pavel/">LinkedIn</a>
            </div>
            <p>С уважением,<br>Павел Коновалов<br>AI Academy</p>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
                Вы получили это письмо, потому что прошли тест на нашем сайте expertai.academy
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

// Vercel Serverless Function for Google Sheets integration
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
        const userData = req.body;

        // Validate required fields
        if (!userData.email || !userData.name) {
            return res.status(400).json({ error: 'Missing required fields: email and name' });
        }

        // Google Apps Script Web App URL
        const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

        if (!GOOGLE_SCRIPT_URL) {
            console.error('GOOGLE_SCRIPT_URL not configured');
            return res.status(500).json({ error: 'Google Sheets integration not configured' });
        }

        // Send data to Google Sheets via Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Sheets API error:', errorText);
            return res.status(response.status).json({
                error: 'Failed to save to Google Sheets',
                details: errorText
            });
        }

        const result = await response.json();

        return res.status(200).json({
            success: true,
            message: 'Data saved to Google Sheets successfully',
            result: result
        });

    } catch (error) {
        console.error('Error in save-to-sheets:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

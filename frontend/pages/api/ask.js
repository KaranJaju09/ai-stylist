const axios = require('axios');

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Send to AI service chat endpoint
    const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
      message: query
    }, {
      timeout: 30000, // 30 second timeout
    });

    res.json({
      success: true,
      data: response.data,
      message: 'Style suggestion generated successfully'
    });

  } catch (error) {
    console.error('Ask error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate style suggestion',
      details: error.response?.data || error.message 
    });
  }
}

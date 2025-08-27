import axios from 'axios';

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.get(`${AI_SERVICE_URL}/wardrobe`, {
      timeout: 30000,
    });

    res.json({
      success: true,
      data: response.data,
      message: 'Wardrobe items retrieved successfully'
    });

  } catch (error) {
    console.error('Wardrobe error:', error.message);
    res.status(500).json({ 
      error: 'Failed to retrieve wardrobe items',
      details: error.response?.data || error.message 
    });
  }
}

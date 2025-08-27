import axios from 'axios';

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

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
    // For now, just proxy the request to the AI service
    // In production, you might want to handle file upload differently
    const response = await axios.post(`${AI_SERVICE_URL}/upload`, req.body, {
      headers: {
        'Content-Type': req.headers['content-type'],
      },
      timeout: 30000, // 30 second timeout
    });

    res.json({
      success: true,
      data: response.data,
      message: 'Image uploaded and processed successfully'
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error.response?.data || error.message 
    });
  }
}

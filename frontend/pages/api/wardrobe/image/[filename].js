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
    const { filename } = req.query;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    // Proxy the image request to the AI service
    const response = await axios.get(`${AI_SERVICE_URL}/wardrobe/image/${filename}`, {
      responseType: 'stream',
      timeout: 30000,
    });

    // Set appropriate headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Content-Length', response.headers['content-length']);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Pipe the image data
    response.data.pipe(res);

  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(404).json({ 
      error: 'Image not found',
      details: error.response?.data || error.message 
    });
  }
}

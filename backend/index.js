const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// Route to upload clothing images
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create form data to send to AI service
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Send to AI service upload endpoint
    const response = await axios.post(`${AI_SERVICE_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
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
});

// Route to ask styling questions
app.post('/api/ask', async (req, res) => {
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
});

// Route to get all wardrobe items
app.get('/api/wardrobe', async (req, res) => {
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
});

// Route to serve wardrobe images
app.get('/api/wardrobe/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Proxy the image request to the AI service
    const response = await axios.get(`${AI_SERVICE_URL}/wardrobe/image/${filename}`, {
      responseType: 'stream',
      timeout: 30000,
    });

    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Content-Length': response.headers['content-length'],
      'Cache-Control': 'public, max-age=86400' // Cache for 1 day
    });

    // Pipe the image data
    response.data.pipe(res);

  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(404).json({ 
      error: 'Image not found',
      details: error.response?.data || error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AI Stylist Backend',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`AI Stylist Backend running on port ${port}`);
  console.log(`AI Service URL: ${AI_SERVICE_URL}`);
});

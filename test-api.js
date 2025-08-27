const axios = require('axios');

// Test the API endpoints
async function testAPI() {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://your-app.vercel.app'
    : 'http://localhost:3000';

  console.log('Testing API endpoints...');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test wardrobe endpoint
    console.log('2. Testing wardrobe endpoint...');
    const wardrobeResponse = await axios.get(`${baseURL}/api/wardrobe`);
    console.log('✅ Wardrobe endpoint working');

    console.log('\n✅ All API endpoints are working correctly!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

module.exports = { testAPI };

// Run test if this file is executed directly
if (require.main === module) {
  testAPI();
}

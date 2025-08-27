# AI Stylist - Wardrobe Chatbot

A modern AI-powered wardrobe management system with intelligent outfit suggestions and color-accurate fashion item analysis.

## 🚀 Live Deployment

**✅ FULLY DEPLOYED AND READY TO USE!**

### 🌐 Frontend (Vercel)
**URL**: https://frontend-n9ve3d8am-karan-jajus-projects.vercel.app
- Serverless Next.js application
- Global CDN for fast loading
- Responsive design for all devices

### 🤖 AI Service (Railway)  
**URL**: https://strong-acceptance-production-ba37.up.railway.app
- FastAPI backend with ML capabilities
- Advanced color detection & analysis
- Real-time outfit suggestions

### 📦 GitHub Repository
**URL**: https://github.com/KaranJaju09/ai-stylist
- Complete source code
- Deployment configurations
- Documentation

### 📐 Architecture Documentation
**Design Document**: [DESIGN.md](./DESIGN.md)
- Detailed system architecture
- Component specifications  
- Data flow diagrams
- ML pipeline details
- Performance considerations

## 🌟 Features

- **Smart Color Detection**: Advanced AI analysis with 60+ color classifications
- **Intelligent Categorization**: Automatic detection of shirts, t-shirts, jeans, suits, shoes, etc.
- **Outfit Suggestions**: AI-powered recommendations for casual and formal occasions
- **Real-time Chat**: Natural language interface for wardrobe queries
- **Upload & Analyze**: Add new items with automatic color and category detection
- **Visual Wardrobe**: Browse your collection with real images and detailed descriptions

## 🏗️ Architecture

### Services
- **AI Service** (Port 8001): FastAPI backend with wardrobe management and chat
- **Backend** (Port 3001): Express.js proxy and API gateway
- **Frontend** (Port 3000): Next.js web interface

### Tech Stack
- **Backend**: FastAPI, Python, scikit-learn, PIL, NumPy
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Proxy**: Express.js, Node.js
- **AI**: K-means clustering for color analysis, HSV color space processing

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KaranJaju09/ai-stylist.git
cd ai-stylist
```

2. **Set up Python environment**
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r ai_service/requirements.txt
```

3. **Set up Node.js dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### Running the Application

1. **Start AI Service**
```bash
source .venv/bin/activate
cd ai_service
python chatbot.py
```

2. **Start Backend** (new terminal)
```bash
cd backend
npm start
```

3. **Start Frontend** (new terminal)
```bash
cd frontend
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- AI Service: http://localhost:8001
- Backend API: http://localhost:3001

## 🚀 Production Deployment

### Vercel Deployment (Recommended)

This project is optimized for **Vercel** deployment with serverless functions:

1. **Deploy AI Service First**: Deploy the FastAPI service to Railway
2. **Deploy Frontend to Vercel**: The frontend includes serverless API routes that proxy to your AI service

### Architecture After Deployment
- **Frontend**: Vercel Edge Network
- **API Routes**: Vercel Serverless Functions (proxy layer)
- **AI Service**: Railway cloud deployment

## 📁 Project Structure

```
ai_stylist/
├── ai_service/           # FastAPI AI service
│   ├── chatbot.py       # Main FastAPI application
│   ├── wardrobe_manager.py  # Core wardrobe logic
│   ├── wardrobe/        # Fashion item images
│   └── requirements.txt # Python dependencies
├── backend/             # Express.js backend
│   ├── index.js        # API proxy and routing
│   └── package.json    # Node.js dependencies
├── frontend/           # Next.js frontend
│   ├── src/app/       # Application pages
│   ├── next.config.ts # Next.js configuration
│   └── package.json   # Frontend dependencies
└── README.md          # This file
```

## 🎯 API Endpoints

### AI Service (localhost:8001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/wardrobe` | GET | Get all wardrobe items |
| `/chat` | POST | Chat with AI stylist |
| `/upload` | POST | Upload new fashion item |
| `/wardrobe/image/{filename}` | GET | Serve wardrobe images |
| `/regenerate-metadata` | POST | Regenerate item analysis |

### Backend (localhost:3001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wardrobe` | GET | Proxy to AI service wardrobe |
| `/api/ask` | POST | Proxy to AI service chat |
| `/api/upload` | POST | Proxy to AI service upload |
| `/api/wardrobe/image/{filename}` | GET | Proxy to AI service images |

## 🎨 Color Analysis

The system uses advanced color analysis with:
- **K-means clustering** for dominant color detection
- **HSV color space** conversion for accurate classification
- **Background removal** to focus on clothing colors
- **60+ color names** including specific shades like "powder blue", "beige", "red-orange"

## 👔 Supported Categories

- **Shirts**: Formal and casual shirts
- **T-shirts**: Casual t-shirts and tees
- **Jeans**: Denim pants and jeans
- **Trousers**: Formal pants and trousers
- **Shoes**: All types of footwear
- **Suits**: Formal suits and blazers

## 🤖 Chat Features

The AI stylist understands:
- **Outfit requests**: "What should I wear today?"
- **Category browsing**: "Show me my shirts"
- **Color preferences**: "I want to wear something blue"
- **Occasion-based**: "Suggest a formal outfit"
- **Search queries**: "Find my jeans"

## 🛠️ Development

### Adding New Features
1. AI logic: Modify `ai_service/wardrobe_manager.py`
2. API endpoints: Update `ai_service/chatbot.py`
3. Frontend: Add components in `frontend/src/app/`

### Debugging
- AI service logs: Check terminal running `python chatbot.py`
- Backend logs: Check terminal running `npm start`
- Frontend logs: Check browser console and terminal

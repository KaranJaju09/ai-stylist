# AI Stylist - Architecture & Design Document

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Architecture Design](#architecture-design)
- [Component Details](#component-details)
- [Data Flow & Execution](#data-flow--execution)
- [API Design](#api-design)
- [ML Pipeline](#ml-pipeline)
- [Deployment Strategy](#deployment-strategy)
- [Performance Considerations](#performance-considerations)

## 🏗️ System Overview

The AI Stylist is a modern, serverless-first fashion technology platform that combines computer vision, machine learning, and web technologies to provide intelligent wardrobe management and styling recommendations.

### Core Objectives
- **Digital Wardrobe Management**: Digitize and organize physical clothing collections
- **AI-Powered Analysis**: Automated color detection and garment categorization
- **Intelligent Styling**: Generate outfit recommendations based on available items
- **User Experience**: Intuitive interface with real-time interactions

### Key Principles
- **Serverless Architecture**: Scalable, cost-effective deployment
- **ML-First Design**: Advanced computer vision at the core
- **API-Driven**: Clean separation of concerns with RESTful APIs
- **Mobile-Responsive**: Cross-device compatibility

## 🏛️ Architecture Design

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (Vercel)                                 │
│  ├── React Components                                      │
│  ├── Tailwind CSS Styling                                  │
│  ├── TypeScript Type Safety                                │
│  └── Responsive Design                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS/API Calls
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Vercel Serverless Functions                               │
│  ├── /api/wardrobe - Wardrobe data proxy                   │
│  ├── /api/upload - File upload proxy                       │
│  ├── /api/ask - Chat interface proxy                       │
│  └── /api/wardrobe/image/[filename] - Image serving        │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP Proxy
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 AI Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Backend (Railway)                                 │
│  ├── Wardrobe Management                                   │
│  ├── ML Color Detection                                     │
│  ├── Image Processing                                       │
│  ├── Chat Interface                                         │
│  └── File Storage                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │ File I/O
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  ├── Wardrobe Images (Static Files)                        │
│  ├── Metadata JSON (Structured Data)                       │
│  └── ML Models (scikit-learn)                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Distribution

#### Frontend Layer (Vercel)
- **Framework**: Next.js 15.5.0 with React 18
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Image Handling**: Next.js Image component with optimization
- **HTTP Client**: Axios for API communication
- **Deployment**: Vercel with global CDN

#### API Gateway Layer (Vercel Serverless)
- **Runtime**: Node.js serverless functions
- **Purpose**: Request proxying and CORS handling
- **Features**: Automatic scaling, edge caching
- **Security**: Environment variable management

#### AI Service Layer (Railway)
- **Framework**: FastAPI 0.116.1 with Python 3.12+
- **ML Libraries**: scikit-learn, NumPy, Pillow
- **API Documentation**: Automatic OpenAPI/Swagger generation
- **Container**: Docker with Nixpacks auto-detection
- **Deployment**: Railway with health monitoring

#### Data Layer
- **Images**: Static file storage with container persistence
- **Metadata**: JSON-based document storage
- **Models**: In-memory ML model instances

## 🔧 Component Details

### Frontend Components

#### 1. Wardrobe Management Interface
```typescript
// Wardrobe grid component with filtering and search
const WardrobeGrid = () => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([]);
  
  // Real-time filtering logic
  useEffect(() => {
    const filtered = items.filter(item => 
      matchesCategory(item, selectedCategory) &&
      matchesColor(item, selectedColor) &&
      matchesSearch(item, searchTerm)
    );
    setFilteredItems(filtered);
  }, [items, selectedCategory, selectedColor, searchTerm]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map(item => (
        <WardrobeItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
```

#### 2. Image Upload Component
```typescript
// Drag & drop upload with preview
const ImageUpload = () => {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Update wardrobe state with new item
    setWardrobeItems(prev => [...prev, response.data.item]);
  };
  
  return (
    <div className="dropzone" onDrop={handleUpload}>
      {/* Drag & drop UI */}
    </div>
  );
};
```

### Backend Components

#### 1. Wardrobe Manager
```python
class WardrobeManager:
    def __init__(self, wardrobe_path: str = "./wardrobe"):
        self.wardrobe_path = Path(wardrobe_path)
        self.metadata_file = self.wardrobe_path / "metadata.json"
        self.metadata = self._load_or_create_metadata()
    
    def _analyze_image(self, file_path: Path) -> Dict:
        """Comprehensive image analysis pipeline"""
        # Category detection from filename
        category = self._detect_category_from_filename(file_path.name)
        
        # ML-based color detection
        color = self._detect_dominant_color(file_path)
        
        # Generate metadata
        return {
            "id": str(uuid.uuid4()),
            "filename": file_path.name,
            "category": category,
            "color": color,
            "path": str(file_path.relative_to(self.wardrobe_path.parent)),
            "description": f"{color.title()} {category}"
        }
```

#### 2. Color Detection Pipeline
```python
def _detect_dominant_color(self, file_path: Path) -> str:
    """Advanced ML-based color detection"""
    with Image.open(file_path) as img:
        # Preprocessing
        img = img.convert('RGB').resize((300, 300))
        pixels = np.array(img).reshape(-1, 3)
        
        # Background removal
        non_white_pixels = pixels[np.sum(pixels, axis=1) < 700]
        
        # K-means clustering
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=3)
        kmeans.fit(non_white_pixels)
        
        # Dominant color selection
        dominant_colors = kmeans.cluster_centers_
        labels = kmeans.labels_
        label_counts = np.bincount(labels)
        most_prominent_color = dominant_colors[np.argmax(label_counts)]
        
        # Color name mapping
        return self._rgb_to_color_name(most_prominent_color)

def _rgb_to_color_name(self, rgb: np.ndarray) -> str:
    """HSV-based color classification with 60+ color names"""
    r, g, b = rgb / 255.0
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    h = h * 360
    
    # Sophisticated color mapping logic
    if s < 0.15:  # Grayscale
        return self._classify_grayscale(v)
    else:
        return self._classify_hue_based_color(h, s, v)
```

## 🌊 Data Flow & Execution

### 1. Image Upload Flow
```
User Selects Image
        ↓
Frontend Validation (File type, size)
        ↓
FormData Creation
        ↓
POST /api/upload (Vercel Function)
        ↓
Proxy to Railway POST /upload
        ↓
File Storage + UUID Generation
        ↓
Image Analysis Pipeline:
  ├── Category Detection (Filename patterns)
  ├── Color Detection (K-means + HSV)
  └── Metadata Generation
        ↓
JSON Metadata Update
        ↓
Response with Item Data
        ↓
Frontend State Update
        ↓
UI Refresh with New Item
```

### 2. Wardrobe Browse Flow
```
Page Load
        ↓
GET /api/wardrobe (Vercel Function)
        ↓
Proxy to Railway GET /wardrobe
        ↓
JSON Metadata Read
        ↓
Item List Response
        ↓
Frontend Rendering:
  ├── Grid Layout Generation
  ├── Image Loading (/api/wardrobe/image/[filename])
  ├── Filter Controls Setup
  └── Search Functionality
        ↓
Interactive UI with Real-time Filtering
```

### 3. AI Chat Flow
```
User Types Message
        ↓
POST /api/ask (Vercel Function)
        ↓
Proxy to Railway POST /chat
        ↓
Intent Recognition:
  ├── Outfit Request
  ├── Search Query
  ├── Category Browse
  └── Color Preference
        ↓
Wardrobe Data Processing
        ↓
Response Generation:
  ├── Text Response
  ├── Item Suggestions
  └── Outfit Combinations
        ↓
Frontend Chat Update
```

### 4. Color Analysis Pipeline
```
Image Input (PIL.Image)
        ↓
RGB Conversion & Resize (300x300)
        ↓
Pixel Array Extraction
        ↓
Background Removal (Filter light pixels)
        ↓
K-means Clustering (3 clusters)
        ↓
Dominant Color Selection (Largest cluster)
        ↓
RGB to HSV Conversion
        ↓
Color Classification:
  ├── Grayscale Detection (s < 0.15)
  ├── Brightness Analysis (v parameter)
  └── Hue-based Mapping (h parameter)
        ↓
Color Name Return (60+ possible names)
```

## 🔌 API Design

### REST API Endpoints

#### Wardrobe Management
```
GET    /wardrobe                    # Get all items
GET    /wardrobe/category/{cat}     # Filter by category  
GET    /wardrobe/item/{id}          # Get specific item
GET    /wardrobe/image/{filename}   # Serve images
POST   /upload                      # Upload new item
POST   /regenerate-metadata         # Refresh analysis
```

#### AI Interface
```
POST   /chat                        # Chat with AI
GET    /health                      # Service health
GET    /                           # Root health check
```

### Request/Response Schemas

#### Upload Request
```typescript
interface UploadRequest {
  file: File;           // Multipart file upload
  category?: string;    // Optional category override
}
```

#### Upload Response
```typescript
interface UploadResponse {
  message: string;
  item: WardrobeItem;
  filename: string;
}

interface WardrobeItem {
  id: string;
  filename: string;
  category: string;
  color: string;
  path: string;
  description: string;
}
```

#### Chat Request/Response
```typescript
interface ChatRequest {
  message: string;
  user_id?: string;
}

interface ChatResponse {
  response: string;
  outfit_suggestion?: OutfitSuggestion;
  items?: WardrobeItem[];
}
```

## 🤖 ML Pipeline

### Color Detection Algorithm

#### 1. Preprocessing Stage
- **Image Normalization**: Convert to RGB, resize to 300x300
- **Background Removal**: Filter pixels with sum > 700 (near-white)
- **Sample Size Limitation**: Max 1000 pixels for performance

#### 2. Clustering Stage
```python
# K-means configuration for optimal performance
kmeans = KMeans(
    n_clusters=3,        # 3 dominant colors
    random_state=42,     # Reproducible results
    n_init=3,           # Reduced iterations for speed
    max_iter=100        # Limited iterations
)
```

#### 3. Color Classification
```python
# HSV-based classification with sophisticated rules
def classify_color(h, s, v):
    if s < 0.15:  # Grayscale detection
        if v < 0.2: return "black"
        elif v < 0.35: return "dark gray"
        elif v < 0.65: return "gray"
        elif v < 0.85: return "light gray"
        else: return "white"
    
    # Hue-based color mapping with 60+ colors
    if h < 15 or h > 345:
        return classify_red_spectrum(s, v)
    elif h < 45:
        return classify_orange_spectrum(s, v)
    # ... additional hue ranges
```

### Category Detection System

#### Pattern Matching Strategy
```python
def detect_category(filename: str) -> str:
    name = filename.lower()
    
    # Priority-based matching (specific to general)
    if 'tshirt' in name or 't-shirt' in name:
        return 'tshirt'
    elif 'shirt' in name:
        return 'shirt'  
    elif 'jean' in name or 'denim' in name:
        return 'jeans'
    elif 'trouser' in name or 'pant' in name:
        return 'trousers'
    # ... additional patterns
```

## 🚀 Deployment Strategy

### Multi-Stage Deployment

#### 1. Frontend Deployment (Vercel)
```bash
# Automatic deployment on git push
vercel --prod

# Environment configuration
vercel env add AI_SERVICE_URL production
```

#### 2. Backend Deployment (Railway)
```bash
# Container deployment with Nixpacks
railway up

# Automatic domain generation
railway domain
```

### Environment Configuration

#### Production Environment Variables
```bash
# Frontend (Vercel)
AI_SERVICE_URL=https://strong-acceptance-production-ba37.up.railway.app

# Backend (Railway) - Auto-configured
PORT=8080
RAILWAY_ENVIRONMENT=production
```

### Health Monitoring
```python
@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Stylist Wardrobe API",
        "version": "1.0.0",
        "wardrobe_items": len(wardrobe_manager.get_all_items())
    }
```

## ⚡ Performance Considerations

### Frontend Optimization
- **Next.js Image Optimization**: Automatic WebP conversion, lazy loading
- **Tailwind CSS Purging**: Removes unused styles in production
- **Code Splitting**: Component-level splitting for faster loads
- **CDN Caching**: Vercel edge caching for global performance

### Backend Optimization
- **K-means Optimization**: Limited iterations and sample sizes
- **Image Preprocessing**: Resize before processing for speed
- **JSON Caching**: Metadata cached in memory after load
- **CORS Wildcard**: Simplified for production environments

### Scaling Strategy
- **Serverless Auto-scaling**: Vercel functions scale automatically
- **Container Scaling**: Railway provides automatic scaling
- **Stateless Design**: No session state for horizontal scaling
- **Asset Optimization**: Compressed images and efficient storage

### Performance Metrics
- **Image Upload**: < 5 seconds for analysis
- **Color Detection**: ~200ms average processing time
- **API Response**: < 500ms for wardrobe queries
- **Frontend Load**: < 2 seconds initial page load

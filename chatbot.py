"""
Chatbot - FastAPI endpoints for wardrobe-based chatbot
"""
import os
import re
import shutil
from typing import Optional, List, Dict, Any
from pathlib import Path
import uuid

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from wardrobe_manager import WardrobeManager

# Initialize FastAPI app
app = FastAPI(
    title="Wardrobe Chatbot API",
    description="AI-powered wardrobe and styling chatbot service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3003", 
        "http://localhost:3001", 
        "http://localhost:3000",
        "https://frontend-8zs411l6d-karan-jajus-projects.vercel.app",
        "https://*.vercel.app",
        "*"  # Allow all origins for production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize wardrobe manager
wardrobe_manager = WardrobeManager("./wardrobe")

# Mount static files for serving images
app.mount("/static", StaticFiles(directory="wardrobe"), name="static")

# Root endpoint for health checks
@app.get("/")
async def root():
    """Root endpoint for Railway healthcheck"""
    return {
        "status": "healthy",
        "service": "AI Stylist Wardrobe API",
        "version": "1.0.0",
        "wardrobe_items": len(wardrobe_manager.get_all_items())
    }

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    outfit_suggestion: Optional[Dict] = None
    items: Optional[List[Dict]] = None

class UploadResponse(BaseModel):
    message: str
    item: Dict
    filename: str

class WardrobeResponse(BaseModel):
    items: List[Dict]
    total_count: int

# API Endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "wardrobe-chatbot"}

@app.get("/wardrobe", response_model=WardrobeResponse)
async def get_wardrobe():
    """Get all wardrobe items"""
    try:
        items = wardrobe_manager.get_all_items()
        return WardrobeResponse(items=items, total_count=len(items))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get wardrobe: {str(e)}")

@app.get("/wardrobe/category/{category}")
async def get_items_by_category(category: str):
    """Get items by category"""
    try:
        items = wardrobe_manager.get_items_by_category(category)
        return {"items": items, "category": category, "count": len(items)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get items by category: {str(e)}")

@app.get("/wardrobe/item/{item_id}")
async def get_item(item_id: str):
    """Get specific item by ID"""
    try:
        items = wardrobe_manager.get_all_items()
        item = next((item for item in items if item["id"] == item_id), None)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get item: {str(e)}")

@app.get("/wardrobe/image/{filename}")
async def get_image(filename: str):
    """Serve wardrobe images"""
    try:
        file_path = Path("wardrobe") / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Image not found")
        return FileResponse(file_path)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to serve image: {str(e)}")

@app.post("/regenerate-metadata")
async def regenerate_metadata():
    """Regenerate metadata for all wardrobe items with improved analysis"""
    try:
        wardrobe_manager.regenerate_metadata()
        
        return {
            "success": True,
            "message": "Metadata regenerated successfully",
            "total_items": len(wardrobe_manager.get_all_items())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate metadata: {str(e)}")

@app.post("/upload", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None)
):
    """Upload new wardrobe item with enhanced analysis"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = Path("wardrobe") / unique_filename
        
        # Ensure wardrobe directory exists
        file_path.parent.mkdir(exist_ok=True)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Add to wardrobe metadata with analysis
        item_data = wardrobe_manager.add_new_item(unique_filename, file_path)
        
        # Override category if provided by user
        if category and category.strip().lower() != 'unknown':
            item_data["category"] = category.strip().lower()
            # Update description with new category
            item_data["description"] = f"{item_data['color'].title()} {item_data['category']}"
            wardrobe_manager._save_metadata()
        
        return UploadResponse(
            message="File uploaded and analyzed successfully",
            item=item_data,
            filename=unique_filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint for outfit suggestions"""
    try:
        message = request.message.lower().strip()
        
        # Parse user intent from message
        intent = parse_user_intent(message)
        
        response_text = ""
        outfit_suggestion = None
        items = None
        
        if intent["type"] == "outfit_request":
            # Generate outfit suggestion
            preferences = {
                "category": intent.get("category"),
                "color": intent.get("color"),
                "occasion": intent.get("occasion")
            }
            
            outfit_suggestion = wardrobe_manager.suggest_outfit(preferences)
            
            if outfit_suggestion and outfit_suggestion["items"]:
                response_text = f"Here's a great outfit suggestion for you: {outfit_suggestion['description']}"
                items = outfit_suggestion["items"]
            else:
                response_text = "I don't have enough items in your wardrobe to suggest a complete outfit. Try uploading some more clothes!"
                
        elif intent["type"] == "search":
            # Search for specific items
            search_results = wardrobe_manager.search_items(message)
            if search_results:
                response_text = f"I found {len(search_results)} items matching your search:"
                items = search_results
            else:
                response_text = "I couldn't find any items matching your search. Try different keywords or upload new items!"
                
        elif intent["type"] == "category_browse":
            # Browse by category
            category_items = wardrobe_manager.get_items_by_category(intent["category"])
            if category_items:
                response_text = f"Here are all the {intent['category']} items in your wardrobe:"
                items = category_items
            else:
                response_text = f"You don't have any {intent['category']} items yet. Would you like to upload some?"
                
        else:
            # General conversation
            response_text = generate_general_response(message)
        
        return ChatResponse(
            response=response_text,
            outfit_suggestion=outfit_suggestion,
            items=items
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

def parse_user_intent(message: str) -> Dict[str, Any]:
    """Parse user message to understand intent"""
    intent = {"type": "general"}
    
    # Keywords for different intents
    outfit_keywords = ["outfit", "what to wear", "suggest", "recommendation", "style", "dress", "clothing combination"]
    search_keywords = ["find", "search", "show me", "do you have", "looking for"]
    category_keywords = {
        "shirt": ["shirt", "shirts"],
        "tshirt": ["tshirt", "t-shirt", "tee", "tees"],
        "jeans": ["jeans", "denim"],
        "trousers": ["trousers", "pants", "chinos"],
        "shoes": ["shoes", "sneakers", "boots", "footwear"],
        "suit": ["suit", "suits", "formal", "blazer"]
    }
    
    color_keywords = ["red", "blue", "green", "yellow", "black", "white", "gray", "grey", "pink", "purple", "orange", "brown"]
    occasion_keywords = {
        "formal": ["formal", "office", "work", "business", "meeting"],
        "casual": ["casual", "relaxed", "comfortable", "everyday"],
        "party": ["party", "celebration", "event", "night out"],
        "sport": ["sport", "gym", "exercise", "athletic"]
    }
    
    # Check for outfit request
    if any(keyword in message for keyword in outfit_keywords):
        intent["type"] = "outfit_request"
        
        # Check for specific category mention
        for category, keywords in category_keywords.items():
            if any(keyword in message for keyword in keywords):
                intent["category"] = category
                break
        
        # Check for color preference
        for color in color_keywords:
            if color in message:
                intent["color"] = color
                break
        
        # Check for occasion
        for occasion, keywords in occasion_keywords.items():
            if any(keyword in message for keyword in keywords):
                intent["occasion"] = occasion
                break
    
    # Check for search intent
    elif any(keyword in message for keyword in search_keywords):
        intent["type"] = "search"
    
    # Check for category browsing
    else:
        for category, keywords in category_keywords.items():
            if any(keyword in message for keyword in keywords):
                intent["type"] = "category_browse"
                intent["category"] = category
                break
    
    return intent

def generate_general_response(message: str) -> str:
    """Generate response for general conversation"""
    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    thanks = ["thank", "thanks", "appreciate"]
    help_requests = ["help", "how", "what can you do"]
    
    if any(greeting in message for greeting in greetings):
        return "Hello! I'm your personal wardrobe assistant. I can help you find the perfect outfit, suggest clothing combinations, and manage your wardrobe. What would you like to wear today?"
    
    elif any(thank in message for thank in thanks):
        return "You're welcome! I'm always here to help you look your best. Is there anything else I can help you with?"
    
    elif any(help_word in message for help_word in help_requests):
        return """I can help you with several things:
        
• **Outfit Suggestions**: Ask me "What should I wear?" or "Suggest an outfit for work"
• **Search Items**: Say "Show me my blue shirts" or "Find my jeans"
• **Browse Categories**: Ask about "shirts", "shoes", "suits", etc.
• **Upload New Items**: Use the upload feature to add new clothes to your wardrobe

Just tell me what you're looking for!"""
    
    else:
        return "I'm here to help with your wardrobe! You can ask me to suggest outfits, find specific items, or browse your clothing by category. What would you like to do?"

# Initialize wardrobe on startup
@app.on_event("startup")
async def startup_event():
    """Initialize wardrobe metadata on startup"""
    try:
        # This will scan the wardrobe folder and create/update metadata
        wardrobe_manager._scan_wardrobe_folder()
        items_count = len(wardrobe_manager.get_all_items())
        print(f"Wardrobe initialized with {items_count} items")
    except Exception as e:
        print(f"Error initializing wardrobe: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("chatbot:app", host="0.0.0.0", port=8001, reload=True)

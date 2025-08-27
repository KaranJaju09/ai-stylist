"""
Wardrobe Manager - Handles metadata creation, image scanning, and outfit suggestions
"""
import os
import json
import uuid
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import re
from PIL import Image
import colorsys
import numpy as np

class WardrobeManager:
    def __init__(self, wardrobe_path: str = "./wardrobe"):
        self.wardrobe_path = Path(wardrobe_path)
        self.metadata_file = self.wardrobe_path / "metadata.json"
        self.metadata = self._load_or_create_metadata()
        
    def _load_or_create_metadata(self) -> Dict:
        """Load existing metadata or create new one by scanning wardrobe folder"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {"items": []}
            
        # Store metadata first, then scan for new items
        self.metadata = metadata
        self._scan_wardrobe_folder()
        return self.metadata
    
    def _scan_wardrobe_folder(self):
        """Scan wardrobe folder and add new items to metadata"""
        if not self.wardrobe_path.exists():
            self.wardrobe_path.mkdir(parents=True)
            return
            
        existing_files = {item["filename"] for item in self.metadata.get("items", [])}
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
        
        for file_path in self.wardrobe_path.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in image_extensions:
                filename = file_path.name
                if filename not in existing_files:
                    # Create new item metadata
                    item_data = self._analyze_image(file_path)
                    self.metadata["items"].append(item_data)
                    
        self._save_metadata()
    
    def _analyze_image(self, file_path: Path) -> Dict:
        """Analyze image to extract metadata"""
        filename = file_path.name
        
        # Detect category from filename
        category = self._detect_category_from_filename(filename)
        
        # Detect color from image
        color = self._detect_dominant_color(file_path)
        
        # Generate unique ID
        item_id = str(uuid.uuid4())
        
        return {
            "id": item_id,
            "filename": filename,
            "category": category,
            "color": color,
            "path": str(file_path.relative_to(self.wardrobe_path.parent)),
            "description": f"{color.title()} {category}"
        }
    
    def _detect_category_from_filename(self, filename: str) -> str:
        """Detect category from filename using enhanced pattern matching"""
        filename_lower = filename.lower()
        
        # Remove file extension for better matching
        name_without_ext = filename_lower.replace('.jpg', '').replace('.jpeg', '').replace('.png', '').replace('.gif', '').replace('.bmp', '').replace('.webp', '')
        
        # Enhanced pattern matching with priority order
        
        # T-shirts (check first before shirts)
        if any(term in name_without_ext for term in ['tshirt', 't-shirt', 'tee']):
            return 'tshirt'
        
        # Shirts (formal/casual shirts)
        if any(term in name_without_ext for term in ['shirt', 'blouse']):
            return 'shirt'
        
        # Suits (includes blazers, jackets)
        if any(term in name_without_ext for term in ['suit', 'blazer', 'jacket', 'formal']):
            return 'suit'
        
        # Jeans (specific type of pants)
        if any(term in name_without_ext for term in ['jean', 'denim']):
            return 'jeans'
        
        # Trousers/Pants (formal pants)
        if any(term in name_without_ext for term in ['trouser', 'pant', 'chino', 'slack']):
            return 'trousers'
        
        # Shoes (all footwear)
        if any(term in name_without_ext for term in ['shoe', 'sneaker', 'boot', 'sandal', 'loafer', 'oxford', 'heel']):
            return 'shoes'
        
        # Additional categories for completeness
        if any(term in name_without_ext for term in ['dress', 'gown']):
            return 'dress'
        
        if any(term in name_without_ext for term in ['skirt']):
            return 'skirt'
        
        if any(term in name_without_ext for term in ['shorts']):
            return 'shorts'
        
        if any(term in name_without_ext for term in ['hoodie', 'sweatshirt']):
            return 'hoodie'
        
        if any(term in name_without_ext for term in ['sweater', 'pullover', 'cardigan']):
            return 'sweater'
        
        # Fallback: try to infer from common numbered patterns
        if re.match(r'^(shirt|tshirt|jean|trouser|shoe|suit)\d*$', name_without_ext):
            base_name = re.sub(r'\d+$', '', name_without_ext)
            return base_name if base_name in ['shirt', 'tshirt', 'jean', 'trouser', 'shoe', 'suit'] else 'unknown'
        
        # If filename contains category followed by number (e.g., "jeans1", "shirt2")
        category_patterns = {
            'tshirt': 'tshirt',
            'shirt': 'shirt', 
            'jean': 'jeans',
            'trouser': 'trousers',
            'shoe': 'shoes',
            'suit': 'suit'
        }
        
        for pattern, category in category_patterns.items():
            if name_without_ext.startswith(pattern):
                return category
        
        return 'unknown'
    
    def _detect_dominant_color(self, file_path: Path) -> str:
        """Detect dominant color from image using improved color analysis"""
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize image for faster processing while maintaining detail
                img = img.resize((300, 300))
                
                # Get pixel data
                pixels = np.array(img)
                pixels = pixels.reshape(-1, 3)
                
                # Remove background/white pixels that might interfere with clothing color detection
                # Filter out very light pixels (likely background)
                non_white_pixels = pixels[np.sum(pixels, axis=1) < 700]  # Remove near-white pixels
                
                if len(non_white_pixels) < 100:  # If too few colored pixels, use all pixels
                    non_white_pixels = pixels
                
                # Try to use K-means clustering for better color detection
                try:
                    from sklearn.cluster import KMeans
                    
                    # Use fewer clusters and samples for faster processing
                    sample_size = min(1000, len(non_white_pixels))  # Limit sample size
                    if sample_size < len(non_white_pixels):
                        # Random sampling for faster processing
                        indices = np.random.choice(len(non_white_pixels), sample_size, replace=False)
                        sample_pixels = non_white_pixels[indices]
                    else:
                        sample_pixels = non_white_pixels
                    
                    # Find 3 dominant colors (reduced from 5)
                    n_clusters = min(3, len(sample_pixels))
                    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=3, max_iter=100)
                    kmeans.fit(sample_pixels)
                    
                    # Get the cluster centers (dominant colors)
                    dominant_colors = kmeans.cluster_centers_
                    
                    # Count pixels in each cluster
                    labels = kmeans.labels_
                    label_counts = np.bincount(labels)
                    
                    # Find the most prominent color (largest cluster)
                    most_prominent_idx = np.argmax(label_counts)
                    most_prominent_color = dominant_colors[most_prominent_idx]
                    
                    # Convert to color name
                    return self._rgb_to_color_name(most_prominent_color)
                    
                except ImportError:
                    # Fallback: Use histogram-based color detection
                    return self._detect_color_histogram_method(non_white_pixels)
                
        except Exception as e:
            return "unknown"
    
    def _detect_color_histogram_method(self, pixels: np.ndarray) -> str:
        """Fallback color detection using histogram analysis"""
        # Split into RGB channels
        r_values = pixels[:, 0]
        g_values = pixels[:, 1]
        b_values = pixels[:, 2]
        
        # Create histograms for each channel
        r_hist, _ = np.histogram(r_values, bins=32, range=(0, 255))
        g_hist, _ = np.histogram(g_values, bins=32, range=(0, 255))
        b_hist, _ = np.histogram(b_values, bins=32, range=(0, 255))
        
        # Find the most common color ranges
        r_peak = np.argmax(r_hist) * 8  # Convert bin index to approximate RGB value
        g_peak = np.argmax(g_hist) * 8
        b_peak = np.argmax(b_hist) * 8
        
        # Use the peak values as the dominant color
        dominant_color = np.array([r_peak, g_peak, b_peak])
        
        return self._rgb_to_color_name(dominant_color)
    
    def _rgb_to_color_name(self, rgb: np.ndarray) -> str:
        """Convert RGB values to accurate color name using enhanced color mapping"""
        r, g, b = rgb
        
        # Normalize RGB values
        r, g, b = r / 255.0, g / 255.0, b / 255.0
        
        # Convert to HSV for better color classification
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        h = h * 360  # Convert to degrees
        
        # Enhanced color classification
        
        # Handle grayscale colors first
        if s < 0.15:  # Low saturation = grayscale
            if v < 0.2:
                return "black"
            elif v < 0.35:
                return "dark gray"
            elif v < 0.65:
                return "gray"
            elif v < 0.85:
                return "light gray"
            else:
                return "white"
        
        # Handle very dark colors
        if v < 0.25:
            if s > 0.3:
                if h < 30 or h > 330:
                    return "dark red"
                elif h < 90:
                    return "dark brown"
                elif h < 150:
                    return "dark green"
                elif h < 210:
                    return "navy blue"
                elif h < 270:
                    return "dark purple"
                else:
                    return "dark red"
            else:
                return "black"
        
        # Handle bright/saturated colors
        if s > 0.3:  # Colorful (not grayscale)
            if h < 15 or h > 345:
                if v > 0.8 and s > 0.6:
                    return "bright red"
                elif v > 0.6:
                    return "red"
                else:
                    return "dark red"
            elif h < 25:
                return "red-orange"
            elif h < 45:
                if v > 0.7:
                    return "orange"
                else:
                    return "brown"
            elif h < 65:
                if v > 0.8:
                    return "yellow"
                else:
                    return "olive"
            elif h < 85:
                return "yellow-green"
            elif h < 125:
                if v > 0.6:
                    return "green"
                else:
                    return "dark green"
            elif h < 155:
                return "teal"
            elif h < 175:
                return "cyan"
            elif h < 195:
                return "light blue"
            elif h < 225:
                if v > 0.6:
                    return "blue"
                else:
                    return "navy blue"
            elif h < 245:
                return "blue-purple"
            elif h < 275:
                if v > 0.6:
                    return "purple"
                else:
                    return "dark purple"
            elif h < 295:
                return "magenta"
            elif h < 315:
                return "pink"
            elif h < 330:
                return "rose"
            else:
                return "red"
        
        # Handle desaturated but not grayscale colors
        else:
            if h < 30 or h > 330:
                return "light pink"
            elif h < 60:
                return "beige"
            elif h < 90:
                return "khaki"
            elif h < 150:
                return "sage green"
            elif h < 210:
                return "powder blue"
            elif h < 270:
                return "lavender"
            else:
                return "light pink"
    
    def _save_metadata(self):
        """Save metadata to JSON file"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def add_new_item(self, filename: str, file_path: Path) -> Dict:
        """Add new item to wardrobe and metadata"""
        item_data = self._analyze_image(file_path)
        item_data["filename"] = filename
        
        self.metadata["items"].append(item_data)
        self._save_metadata()
        
        return item_data
    
    def get_all_items(self) -> List[Dict]:
        """Get all wardrobe items"""
        return self.metadata.get("items", [])
    
    def get_items_by_category(self, category: str) -> List[Dict]:
        """Get items filtered by category"""
        return [item for item in self.metadata.get("items", []) if item.get("category") == category]
    
    def get_items_by_color(self, color: str) -> List[Dict]:
        """Get items filtered by color"""
        return [item for item in self.metadata.get("items", []) if color.lower() in item.get("color", "").lower()]
    
    def suggest_outfit(self, preferences: Dict = None) -> Dict:
        """Suggest a random outfit combination"""
        import random
        
        # Get available items by category
        shirts = self.get_items_by_category("shirt")
        tshirts = self.get_items_by_category("tshirt")
        jeans = self.get_items_by_category("jeans")
        trousers = self.get_items_by_category("trousers")
        shoes = self.get_items_by_category("shoes")
        suits = self.get_items_by_category("suit")
        
        outfit = {"items": [], "description": ""}
        
        # Check if user wants a suit
        if preferences and preferences.get("category") == "suit" and suits:
            # Suit outfit: suit + shoes
            suit = random.choice(suits)
            outfit["items"].append(suit)
            
            if shoes:
                shoe = random.choice(shoes)
                outfit["items"].append(shoe)
            
            outfit["description"] = f"Formal suit outfit: {suit['description']} with {shoe['description'] if shoes else 'shoes'}"
            
        else:
            # Casual outfit: (shirt/tshirt) + (jeans/trousers) + shoes
            
            # Choose top
            tops = shirts + tshirts
            if tops:
                top = random.choice(tops)
                outfit["items"].append(top)
            
            # Choose bottom
            bottoms = jeans + trousers
            if bottoms:
                bottom = random.choice(bottoms)
                outfit["items"].append(bottom)
            
            # Choose shoes
            if shoes:
                shoe = random.choice(shoes)
                outfit["items"].append(shoe)
            
            top_desc = outfit["items"][0]["description"] if len(outfit["items"]) > 0 else "top"
            bottom_desc = outfit["items"][1]["description"] if len(outfit["items"]) > 1 else "bottom"
            shoe_desc = outfit["items"][2]["description"] if len(outfit["items"]) > 2 else "shoes"
            
            outfit["description"] = f"Casual outfit: {top_desc} with {bottom_desc} and {shoe_desc}"
        
        return outfit
    
    def regenerate_metadata(self):
        """Regenerate metadata for all items with improved analysis"""
        # Clear existing metadata
        self.metadata = {"items": []}
        
        # Rescan all items
        self._scan_wardrobe_folder()
    
    def update_item_analysis(self, item_id: str) -> Dict:
        """Update analysis for a specific item"""
        for i, item in enumerate(self.metadata.get("items", [])):
            if item.get("id") == item_id:
                # Re-analyze the item
                file_path = self.wardrobe_path / item["filename"]
                if file_path.exists():
                    updated_item = self._analyze_image(file_path)
                    updated_item["id"] = item_id  # Keep the same ID
                    updated_item["filename"] = item["filename"]  # Keep the same filename
                    
                    # Update the item in metadata
                    self.metadata["items"][i] = updated_item
                    self._save_metadata()
                    
                    return updated_item
        
        return None
    
    def search_items(self, query: str) -> List[Dict]:
        """Search items based on query"""
        query_lower = query.lower()
        results = []
        
        for item in self.metadata.get("items", []):
            # Search in category, color, description, filename
            searchable_text = f"{item.get('category', '')} {item.get('color', '')} {item.get('description', '')} {item.get('filename', '')}".lower()
            
            if any(term in searchable_text for term in query_lower.split()):
                results.append(item)
        
        return results

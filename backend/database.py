import json
import os
from pathlib import Path
from typing import Any, List, Optional
from config import settings
from datetime import datetime
import uuid

# Ensure data directory exists
os.makedirs(settings.DATA_DIR, exist_ok=True)

class JSONDatabase:
    """Simple JSON file-based database for storing application data"""
    
    def __init__(self, data_dir: str = settings.DATA_DIR):
        self.data_dir = data_dir
        self.initialize_collections()
    
    def initialize_collections(self):
        """Initialize JSON collection files"""
        collections = [
            "users",
            "lessons",
            "grades",
            "tests",
            "test_results",
            "courses",
            "course_progress",
            "attendance"
        ]
        
        for collection in collections:
            file_path = os.path.join(self.data_dir, f"{collection}.json")
            if not os.path.exists(file_path):
                with open(file_path, "w") as f:
                    json.dump([], f, indent=2)
                print(f"✓ Created {collection}.json")
    
    def get_collection_path(self, collection: str) -> str:
        """Get file path for collection"""
        return os.path.join(self.data_dir, f"{collection}.json")
    
    def read_collection(self, collection: str) -> List[dict]:
        """Read all items from collection"""
        try:
            with open(self.get_collection_path(collection), "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading {collection}: {e}")
            return []
    
    def write_collection(self, collection: str, data: List[dict]):
        """Write all items to collection"""
        try:
            with open(self.get_collection_path(collection), "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error writing {collection}: {e}")
    
    def find(self, collection: str, query: dict = None) -> List[dict]:
        """Find items matching query"""
        data = self.read_collection(collection)
        if not query:
            return data
        
        results = []
        for item in data:
            match = True
            for key, value in query.items():
                if key not in item or item[key] != value:
                    match = False
                    break
            if match:
                results.append(item)
        return results
    
    def find_one(self, collection: str, query: dict) -> Optional[dict]:
        """Find single item matching query"""
        results = self.find(collection, query)
        return results[0] if results else None
    
    def find_by_id(self, collection: str, id: str) -> Optional[dict]:
        """Find item by ID"""
        return self.find_one(collection, {"id": id})
    
    def insert_one(self, collection: str, document: dict) -> dict:
        """Insert single document and return it with generated ID"""
        if "id" not in document:
            document["id"] = str(uuid.uuid4())
        if "createdAt" not in document:
            document["createdAt"] = datetime.utcnow().isoformat()
        
        data = self.read_collection(collection)
        data.append(document)
        self.write_collection(collection, data)
        
        return document
    
    def insert_many(self, collection: str, documents: List[dict]) -> List[dict]:
        """Insert multiple documents"""
        for doc in documents:
            if "id" not in doc:
                doc["id"] = str(uuid.uuid4())
            if "createdAt" not in doc:
                doc["createdAt"] = datetime.utcnow().isoformat()
        
        data = self.read_collection(collection)
        data.extend(documents)
        self.write_collection(collection, data)
        return documents
    
    def update_one(self, collection: str, query: dict, update: dict) -> Optional[dict]:
        """Update single document"""
        data = self.read_collection(collection)
        for i, item in enumerate(data):
            match = True
            for key, value in query.items():
                if key not in item or item[key] != value:
                    match = False
                    break
            if match:
                data[i].update(update)
                data[i]["updatedAt"] = datetime.utcnow().isoformat()
                self.write_collection(collection, data)
                return data[i]
        return None
    
    def update_by_id(self, collection: str, id: str, update: dict) -> Optional[dict]:
        """Update document by ID"""
        return self.update_one(collection, {"id": id}, update)
    
    def delete_one(self, collection: str, query: dict) -> bool:
        """Delete single document"""
        data = self.read_collection(collection)
        original_len = len(data)
        data = [item for item in data if not all(
            item.get(key) == value for key, value in query.items()
        )]
        if len(data) < original_len:
            self.write_collection(collection, data)
            return True
        return False
    
    def delete_by_id(self, collection: str, id: str) -> bool:
        """Delete document by ID"""
        return self.delete_one(collection, {"id": id})
    
    def count(self, collection: str, query: dict = None) -> int:
        """Count documents in collection"""
        return len(self.find(collection, query))

# Global database instance
db = JSONDatabase()

def get_db() -> JSONDatabase:
    """Get database instance"""
    return db

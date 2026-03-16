from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import importlib.util
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from fastapi.staticfiles import StaticFiles

# --- PATH CONFIGURATION ---
# BASE_PATH points to the 'backend' directory
BASE_PATH = Path(__file__).resolve().parent

# Check for .env in the backend folder
if (BASE_PATH / '.env').exists():
    load_dotenv(BASE_PATH / '.env')

# Database Setup
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    # On Vercel, ensure you've added MONGO_URL to Environment Variables
    raise RuntimeError("MONGO_URL not found in environment variables")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test')]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'trekhievers-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# --- MODELS ---

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: User

class Tour(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    description: str
    price: int
    original_price: Optional[int] = None
    duration: str
    category: str
    destination: str
    image_url: str
    hero_background_image: Optional[str] = None
    images: List[str] = []
    inclusions: List[str] = []
    exclusions: List[str] = []
    itinerary: List[dict] = []
    available_dates: List[str] = []
    group_size: Optional[int] = None
    difficulty: Optional[str] = None
    featured: bool = False
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tour_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    tour_id: str
    rating: int
    comment: str

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str
    discount_value: int
    description: str
    valid_until: Optional[datetime] = None
    active: bool = True

class CouponValidate(BaseModel):
    code: str
    amount: int

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tour_id: str
    tour_title: str
    travel_date: str
    guests: int
    total_amount: int
    coupon_code: Optional[str] = None
    discount_amount: int = 0
    final_amount: int
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    tour_id: str
    travel_date: str
    guests: int
    coupon_code: Optional[str] = None

# --- HELPERS ---

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        user_doc = await db.users.find_one({'id': user_id}, {'_id': 0, 'password': 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user_doc)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# --- ROUTES ---

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(input: UserCreate):
    existing = await db.users.find_one({'email': input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(**input.model_dump(exclude={'password'}))
    doc = user.model_dump()
    doc['password'] = hash_password(input.password)
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return TokenResponse(token=create_token(user.id), user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(input: UserLogin):
    user_doc = await db.users.find_one({'email': input.email}, {'_id': 0})
    if not user_doc or not verify_password(input.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_doc.pop('password')
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    user = User(**user_doc)
    return TokenResponse(token=create_token(user.id), user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/tours", response_model=List[Tour])
async def get_tours(category: Optional[str] = None, destination: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category: query['category'] = category
    if destination: query['destination'] = destination
    if search:
        query['$or'] = [{'title': {'$regex': search, '$options': 'i'}}, {'description': {'$regex': search, '$options': 'i'}}]
    tours = await db.tours.find(query, {'_id': 0}).to_list(100)
    for t in tours:
        if isinstance(t['created_at'], str): t['created_at'] = datetime.fromisoformat(t['created_at'])
    return tours

# --- APP CONFIG & STATIC FILES ---

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# LOCAL MOUNTING: Pointing to 'images' inside 'backend'
images_dir = BASE_PATH / "images"

if images_dir.exists():
    app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")
    logger.info(f"Images mounted from: {images_dir}")
else:
    logger.warning(f"Images directory NOT found at: {images_dir}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.get("/temp-seed-database")
def run_seed_script():
    script_path = BASE_PATH / 'scripts' / 'seed_data.py'
    try:
        spec = importlib.util.spec_from_file_location("seed_data", script_path)
        seed_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(seed_module)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

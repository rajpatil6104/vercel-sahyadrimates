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
# BASE_PATH is the 'backend' folder
BASE_PATH = Path(__file__).resolve().parent
# PROJECT_ROOT is the main directory (where images/ sits)
PROJECT_ROOT = BASE_PATH.parent

load_dotenv(BASE_PATH / '.env')

# Database Setup
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise RuntimeError("MONGO_URL not found in environment variables")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test')]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'trekhievers-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# --- MODELS (User, Tour, Review, Coupon, Booking) ---
# [Keep your existing class definitions here...]
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

# --- HELPER FUNCTIONS & ROUTES ---
# [Keep all your register, login, tour, review, coupon, and booking endpoints here...]

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
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(input: UserCreate):
    existing = await db.users.find_one({'email': input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = input.model_dump(exclude={'password'})
    user = User(**user_dict)
    doc = user.model_dump()
    doc['password'] = hash_password(input.password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(input: UserLogin):
    user_doc = await db.users.find_one({'email': input.email}, {'_id': 0})
    if not user_doc or not verify_password(input.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc.pop('password')
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/tours", response_model=List[Tour])
async def get_tours(
    category: Optional[str] = None,
    destination: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None
):
    query = {}
    if category:
        query['category'] = category
    if destination:
        query['destination'] = destination
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'destination': {'$regex': search, '$options': 'i'}}
        ]
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    
    tours = await db.tours.find(query, {'_id': 0}).to_list(1000)
    for tour in tours:
        if isinstance(tour['created_at'], str):
            tour['created_at'] = datetime.fromisoformat(tour['created_at'])
    return tours

@api_router.get("/tours/{tour_id}", response_model=Tour)
async def get_tour(tour_id: str):
    tour = await db.tours.find_one({'id': tour_id}, {'_id': 0})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    if isinstance(tour['created_at'], str):
        tour['created_at'] = datetime.fromisoformat(tour['created_at'])
    return Tour(**tour)

@api_router.get("/tours/slug/{slug}", response_model=Tour)
async def get_tour_by_slug(slug: str):
    tour = await db.tours.find_one({'slug': slug}, {'_id': 0})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    if isinstance(tour['created_at'], str):
        tour['created_at'] = datetime.fromisoformat(tour['created_at'])
    return Tour(**tour)

@api_router.get("/reviews/{tour_id}", response_model=List[Review])
async def get_reviews(tour_id: str):
    reviews = await db.reviews.find({'tour_id': tour_id}, {'_id': 0}).to_list(1000)
    for review in reviews:
        if isinstance(review['created_at'], str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(input: ReviewCreate, current_user: User = Depends(get_current_user)):
    review = Review(
        tour_id=input.tour_id,
        user_id=current_user.id,
        user_name=current_user.name,
        rating=input.rating,
        comment=input.comment
    )
    doc = review.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    
    reviews = await db.reviews.find({'tour_id': input.tour_id}, {'_id': 0}).to_list(1000)
    avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
    await db.tours.update_one(
        {'id': input.tour_id},
        {'$set': {'rating': round(avg_rating, 1), 'reviews_count': len(reviews)}}
    )
    
    return review

@api_router.post("/coupons/validate")
async def validate_coupon(input: CouponValidate):
    coupon = await db.coupons.find_one({'code': input.code.upper(), 'active': True}, {'_id': 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    if coupon.get('valid_until'):
        valid_until = datetime.fromisoformat(coupon['valid_until']) if isinstance(coupon['valid_until'], str) else coupon['valid_until']
        if valid_until < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Coupon expired")
    
    discount_amount = 0
    if coupon['discount_type'] == 'percentage':
        discount_amount = int(input.amount * coupon['discount_value'] / 100)
    else:
        discount_amount = coupon['discount_value']
    
    return {
        'valid': True,
        'discount_amount': discount_amount,
        'description': coupon['description']
    }

@api_router.get("/coupons", response_model=List[Coupon])
async def get_coupons():
    coupons = await db.coupons.find({'active': True}, {'_id': 0}).to_list(100)
    return coupons

@api_router.post("/bookings", response_model=Booking)
async def create_booking(input: BookingCreate, current_user: User = Depends(get_current_user)):
    tour = await db.tours.find_one({'id': input.tour_id}, {'_id': 0})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    total_amount = tour['price'] * input.guests
    discount_amount = 0
    
    if input.coupon_code:
        try:
            validation = await validate_coupon(CouponValidate(code=input.coupon_code, amount=total_amount))
            discount_amount = validation['discount_amount']
        except:
            pass
    
    booking = Booking(
        user_id=current_user.id,
        tour_id=input.tour_id,
        tour_title=tour['title'],
        travel_date=input.travel_date,
        guests=input.guests,
        total_amount=total_amount,
        coupon_code=input.coupon_code,
        discount_amount=discount_amount,
        final_amount=total_amount - discount_amount
    )
    
    doc = booking.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.bookings.insert_one(doc)
    
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(current_user: User = Depends(get_current_user)):
    bookings = await db.bookings.find({'user_id': current_user.id}, {'_id': 0}).to_list(1000)
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.get("/destinations")
async def get_destinations():
    destinations = await db.tours.distinct('destination')
    result = []
    for dest in destinations:
        count = await db.tours.count_documents({'destination': dest})
        tour = await db.tours.find_one({'destination': dest, 'featured': True}, {'_id': 0})
        if not tour:
            tour = await db.tours.find_one({'destination': dest}, {'_id': 0})
        result.append({
            'name': dest,
            'count': count,
            'image_url': tour['image_url'] if tour else ''
        })
    return result

@api_router.get("/categories")
async def get_categories():
    categories = await db.tours.distinct('category')
    result = []
    for cat in categories:
        count = await db.tours.count_documents({'category': cat})
        result.append({'name': cat, 'count': count})
    return result

# --- FINAL APP CONFIG ---
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# STATIC FILES MOUNTING (CRITICAL FIX)
images_dir = PROJECT_ROOT / "images"

if images_dir.exists():
    app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")
    logger.info(f"Successfully mounted images from: {images_dir}")
else:
    # If it doesn't exist, we don't mount it to avoid the RuntimeError crash
    logger.warning(f"Images directory NOT found at: {images_dir}. Check your folder structure.")

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
        return {"status": "success", "message": "Seed script executed successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
'''from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
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

#ROOT_DIR = Path(__file__).parent
#load_dotenv(ROOT_DIR / '.env')

BASE_PATH = Path(__file__).resolve().parent # This is the /backend folder
PROJECT_ROOT = BASE_PATH.parent
load_dotenv(PROJECT_ROOT / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'trekhievers-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Models
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

# Helper functions
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
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(input: UserCreate):
    existing = await db.users.find_one({'email': input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = input.model_dump(exclude={'password'})
    user = User(**user_dict)
    doc = user.model_dump()
    doc['password'] = hash_password(input.password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(input: UserLogin):
    user_doc = await db.users.find_one({'email': input.email}, {'_id': 0})
    if not user_doc or not verify_password(input.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc.pop('password')
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Tour Routes
@api_router.get("/tours", response_model=List[Tour])
async def get_tours(
    category: Optional[str] = None,
    destination: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None
):
    query = {}
    if category:
        query['category'] = category
    if destination:
        query['destination'] = destination
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'destination': {'$regex': search, '$options': 'i'}}
        ]
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    
    tours = await db.tours.find(query, {'_id': 0}).to_list(1000)
    for tour in tours:
        if isinstance(tour['created_at'], str):
            tour['created_at'] = datetime.fromisoformat(tour['created_at'])
    return tours

@api_router.get("/tours/{tour_id}", response_model=Tour)
async def get_tour(tour_id: str):
    tour = await db.tours.find_one({'id': tour_id}, {'_id': 0})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    if isinstance(tour['created_at'], str):
        tour['created_at'] = datetime.fromisoformat(tour['created_at'])
    return Tour(**tour)

@api_router.get("/tours/slug/{slug}", response_model=Tour)
async def get_tour_by_slug(slug: str):
    tour = await db.tours.find_one({'slug': slug}, {'_id': 0})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    if isinstance(tour['created_at'], str):
        tour['created_at'] = datetime.fromisoformat(tour['created_at'])
    return Tour(**tour)

# Review Routes
@api_router.get("/reviews/{tour_id}", response_model=List[Review])
async def get_reviews(tour_id: str):
    reviews = await db.reviews.find({'tour_id': tour_id}, {'_id': 0}).to_list(1000)
    for review in reviews:
        if isinstance(review['created_at'], str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(input: ReviewCreate, current_user: User = Depends(get_current_user)):
    review = Review(
        tour_id=input.tour_id,
        user_id=current_user.id,
        user_name=current_user.name,
        rating=input.rating,
        comment=input.comment
    )
    doc = review.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    
    reviews = await db.reviews.find({'tour_id': input.tour_id}, {'_id': 0}).to_list(1000)
    avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
    await db.tours.update_one(
        {'id': input.tour_id},
        {'$set': {'rating': round(avg_rating, 1), 'reviews_count': len(reviews)}}
    )
    
    return review

# Coupon Routes
@api_router.post("/coupons/validate")
async def validate_coupon(input: CouponValidate):
    coupon = await db.coupons.find_one({'code': input.code.upper(), 'active': True}, {'_id': 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    if coupon.get('valid_until'):
        valid_until = datetime.fromisoformat(coupon['valid_until']) if isinstance(coupon['valid_until'], str) else coupon['valid_until']
        if valid_until < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Coupon expired")
    
    discount_amount = 0
    if coupon['discount_type'] == 'percentage':
        discount_amount = int(input.amount * coupon['discount_value'] / 100)
    else:
        discount_amount = coupon['discount_value']
    
    return {
        'valid': True,
        'discount_amount': discount_amount,
        'description': coupon['description']
    }

@api_router.get("/coupons", response_model=List[Coupon])
async def get_coupons():
    coupons = await db.coupons.find({'active': True}, {'_id': 0}).to_list(100)
    return coupons

# Booking Routes
@api_router.post("/bookings", response_model=Booking)
async def create_booking(input: BookingCreate, current_user: User = Depends(get_current_user)):
    tour = await db.tours.find_one({'id': input.tour_id}, {'_id': 0})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    total_amount = tour['price'] * input.guests
    discount_amount = 0
    
    if input.coupon_code:
        try:
            validation = await validate_coupon(CouponValidate(code=input.coupon_code, amount=total_amount))
            discount_amount = validation['discount_amount']
        except:
            pass
    
    booking = Booking(
        user_id=current_user.id,
        tour_id=input.tour_id,
        tour_title=tour['title'],
        travel_date=input.travel_date,
        guests=input.guests,
        total_amount=total_amount,
        coupon_code=input.coupon_code,
        discount_amount=discount_amount,
        final_amount=total_amount - discount_amount
    )
    
    doc = booking.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.bookings.insert_one(doc)
    
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(current_user: User = Depends(get_current_user)):
    bookings = await db.bookings.find({'user_id': current_user.id}, {'_id': 0}).to_list(1000)
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

# Destinations & Categories
@api_router.get("/destinations")
async def get_destinations():
    destinations = await db.tours.distinct('destination')
    result = []
    for dest in destinations:
        count = await db.tours.count_documents({'destination': dest})
        tour = await db.tours.find_one({'destination': dest, 'featured': True}, {'_id': 0})
        if not tour:
            tour = await db.tours.find_one({'destination': dest}, {'_id': 0})
        result.append({
            'name': dest,
            'count': count,
            'image_url': tour['image_url'] if tour else ''
        })
    return result

#change this 

@api_router.get("/categories")
async def get_categories():
    categories = await db.tours.distinct('category')
    result = []
    for cat in categories:
        count = await db.tours.count_documents({'category': cat})
        result.append({'name': cat, 'count': count})
    return result

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    
app.mount("/images", StaticFiles(directory="../images"), name="images")

#delet after work is done
@app.get("/temp-seed-database")
def run_seed_script():
    # Path to your seed file
    script_path = os.path.join(os.path.dirname(__file__), 'scripts', 'seed_data.py')
    
    try:
        # This dynamically loads and runs the seed_data.py file
        spec = importlib.util.spec_from_file_location("seed_data", script_path)
        seed_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(seed_module)
        
        return {"status": "success", "message": "Seed script executed successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
'''
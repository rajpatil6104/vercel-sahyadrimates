import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone, timedelta


IMAGE_DIR = "images/"
async def seed_database():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing data
    await db.tours.delete_many({})
    await db.coupons.delete_many({})
   
    
    # Here we add the tour details
    tours = [
        {
            'id': 'tour-1',
            'title': 'Bhairavgad Trek',
            'slug': 'bhairavgad-trek',
            'description': 'We SahyadriMates Happy to Invite you to the most Thrilling Trek in Maharashtra - "Bhairavgad with 300 feet Climbing-Rappelling and Jungle Trek Event"',
            'price': 1899,
            'original_price': 2299,
            'duration': 'One Day',
            'category': 'trek',
            'destination': 'Maharashtra',
            'image_url': '/images/tour/bhairavgad.jpg', 
            'hero_background_image': '/images/tour/tour_hero/bhairavgad.webp',
            'images': ['/images/tour/bhairavgad.jpg'],
            'inclusions': ['Transportation from Pune/Mumbai','Tea & Breakfast','Delicious lunch(Veg or Non-Veg)', 'Experienced & Certified leader', 'Frist aid kit', 'Safety equipment for climbing & rappelling'],
            'exclusions': ['Personal expenses', 'Travel insurance', 'Porter charges', 'Any meals not mentioned'],
            'itinerary': [
                {'day': 1, 'title': 'Pune / Kalyan to Base Village'},
                {'Time': '08:30 PM', 'title': 'Pickup from Pune', 'description': 'Participants assemble at the pickup point in Pune and start the journey towards Bhairavgad base village.'},
                {'Time': '11:30 PM', 'title': 'Pickup from Kalyan', 'description': 'Participants joining from Kalyan will board the vehicle and continue the journey towards the base village.'},
                {'day': 2, 'title': 'Bhairavgad Trek & Rappelling'},
                {'Time': '05:00 AM', 'title': 'Reach Base Village', 'description': 'Freshen up and have tea & breakfast.'},
                {'Time': '06:30 AM', 'title': 'Start Trekking', 'description': 'Begin the trek through jungle trails towards Bhairavgad.'},
                {'Time': '09:00 AM', 'title': 'Reach Climbing Patch', 'description': 'Experience thrilling rock climbing and 300 ft rappelling with safety gear.'},
                {'Time': '12:00 PM', 'title': 'Start Decending'},
                {'Time': '03:00 PM', 'title': 'Reach Base Village & Lunch'},
                {'Time': '04:30 PM', 'title': 'Start return journey', 'description': 'After a hearty lunch, start the return journey back to Pune/Kalyan.'},
                {'Time': '10:00 PM', 'title': 'Reach Pune/Kalyan', 'description': 'Arrive back at the pickup points in Pune and Kalyan, marking the end of an exhilarating trek.'},
            ],
            'available_dates': ['Every Saturday', 'Every Sunday'],
            'group_size': 20,
            'difficulty': 'Moderate',
            'featured': True,
            'rating': 4.8,
            'reviews_count': 127,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'tour-2',
            'title': 'Kalvantin Durga Trek',
            'slug': 'kalvantin-durga-trek',
            'description': 'Experience the thrill of trekking to Kalvanti Durga. A perfect blend of adventure and natural beauty.',
            'price': 1299,
            'original_price': 1499,
            'duration': 'Saturday-Sunday',
            'category': 'trek',
            'destination': 'Maharashtra',
            'image_url': '/images/tour/kalavantindurg.png',
            'hero_background_image': '/images/tour/tour_hero/kalavantindurg.webp',
            'images': ['images/tour/kalavantindurg.png'],
            'inclusions': ['Transportation from Pune/Mumbai','Tea & Breakfast','Delicious lunch(Veg or Non-Veg)', 'Experienced & Certified leader', 'Frist aid kit', 'Safety equipment for climbing & rappelling'],
            'exclusions': ['Personal expenses', 'Travel insurance', 'Porter charges', 'Any meals not mentioned'],
            'itinerary': [
                 {'day': 1, 'title': 'Pune / Kalyan to Base Village'},
                 {'Time': '08:30 PM', 'title': 'Pickup from Pune', 'description': 'Participants assemble at the pickup point in Pune and start the journey towards Bhairavgad base village.'},
                 {'Time': '11:30 PM', 'title': 'Pickup from Kalyan', 'description': 'Participants joining from Kalyan will board the vehicle and continue the journey towards the base village.'},
                 {'day': 2, 'title': 'Bhairavgad Trek & Rappelling'},
                 {'Time': '05:00 AM', 'title': 'Reach Base Village', 'description': 'Freshen up and have tea & breakfast.'},
                 {'Time': '06:30 AM', 'title': 'Start Trekking', 'description': 'Begin the trek through jungle trails towards Kalavanti Durga.'},
                 {'Time': '09:00 AM', 'title': 'Reach Climbing Patch', 'description': 'Experience thrilling rock climbing and 300 ft rappelling with safety gear.'},
                 {'Time': '12:00 PM', 'title': 'Start Decending'},
                 {'Time': '03:00 PM', 'title': 'Reach Base Village & Lunch'},
                 {'Time': '04:30 PM', 'title': 'Start return journey', 'description': 'After a hearty lunch, start the return journey back to Pune/Kalyan.'},
                 {'Time': '10:00 PM', 'title': 'Reach Pune/Kalyan', 'description': 'Arrive back at the pickup points in Pune and Kalyan, marking the end of an exhilarating trek.'},
             ],
            'available_dates': ['Every Saturday', 'Every Sunday'],
            'group_size': 50,
            'difficulty': 'Easy',
            'featured': True,
            'rating': 4.6,
            'reviews_count': 342,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'tour-3',
            'title': 'Kalsubai Trek',
            'slug': 'kalsubai-trek',
            'description': 'Experience the thrill of trekking to Kalsubai. A perfect blend of adventure and natural beauty.',
            'price': 1299,
            'original_price': 1499,
            'duration': 'Saturday-Sunday',
            'category': 'trek',
            'destination': 'Maharashtra',
            'image_url': '/images/tour/kalsubai.png',
            'hero_background_image': '/images/tour/tour_hero/kalsubai.webp',
            'images': ['images/tour/kalsubai.png'],
            'inclusions': ['Transportation from Pune/Mumbai','Tea & Breakfast','Delicious lunch(Veg or Non-Veg)', 'Experienced & Certified leader', 'Frist aid kit', 'Safety equipment for climbing & rappelling'],
            'exclusions': ['Personal expenses', 'Travel insurance', 'Porter charges', 'Any meals not mentioned'],
            'itinerary': [
                 {'day': 1, 'title': 'Pune / Kalyan to Base Village'},
                 {'Time': '08:30 PM', 'title': 'Pickup from Pune', 'description': 'Participants assemble at the pickup point in Pune and start the journey towards Bhairavgad base village.'},
                 {'Time': '11:30 PM', 'title': 'Pickup from Kalyan', 'description': 'Participants joining from Kalyan will board the vehicle and continue the journey towards the base village.'},
                 {'day': 2, 'title': 'Bhairavgad Trek & Rappelling'},
                 {'Time': '05:00 AM', 'title': 'Reach Base Village', 'description': 'Freshen up and have tea & breakfast.'},
                 {'Time': '06:30 AM', 'title': 'Start Trekking', 'description': 'Begin the trek through jungle trails towards Kalsubai.'},
                 {'Time': '09:00 AM', 'title': 'Reach Climbing Patch', 'description': 'Experience thrilling rock climbing and 300 ft rappelling with safety gear.'},
                 {'Time': '12:00 PM', 'title': 'Start Decending'},
                 {'Time': '03:00 PM', 'title': 'Reach Base Village & Lunch'},
                 {'Time': '04:30 PM', 'title': 'Start return journey', 'description': 'After a hearty lunch, start the return journey back to Pune/Kalyan.'},
                 {'Time': '10:00 PM', 'title': 'Reach Pune/Kalyan', 'description': 'Arrive back at the pickup points in Pune and Kalyan, marking the end of an exhilarating trek.'},
             ],
            'available_dates': ['Every Saturday', 'Every Sunday'],
            'group_size': 15,
            'difficulty': 'Easy',
            'featured': True,
            'rating': 4.9,
            'reviews_count': 89,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'tour-4',
            'title': 'Srisailam Mallikarjuna Jyotirlinga Tour',
            'slug': 'srisailam-jyotirlinga',
            'description': 'Experience a spiritual backpacking trip to Srisailam. Includes Mallikarjuna Swamy Darshan, Patal Ganga, and Srisailam Dam.',
            'price': 6999,
            'duration': '3N/4D',
            'category': 'tour',
            'destination': 'Srisailam',
            'image_url': '/images/tour/srisailam_mallikarjuna.jpg', 
            'hero_background_image': '/images/tour/tour_hero/srisailam.webp',
            'images': [],
            'inclusions': [
                'Train Tickets', 
                'Bus/Taxi/Auto Fare', 
                'Stay on Sharing Basis (3-4 person)', 
                'Two Breakfast', 
                'Two Dinner(Veg)', 
                'Entry Fees', 
                'First Aid Kit'
            ],
            'exclusions': ['Lunch', 'Personal expenses', 'Additional water/snacks'],
            'itinerary': [
                {'day': 1, 'title': 'Departure from Pune/Mumbai', 'description': 'Boarding the train and overnight journey to Srisailam.'},
                {'day': 2, 'title': 'Arrival & Temple Visit', 'description': 'Check-in, Mallikarjuna Swamy Darshan, and Bhramaramba Devi Temple visit.'},
                {'day': 3, 'title': 'Local Sightseeing', 'description': 'Visit Patal Ganga, Srisailam Dam, Sakshi Ganpati, and Paladhara Panchadara.'},
                {'day': 4, 'title': 'Return Journey', 'description': 'Visit Hemareddy Mallamma temple and departure for Pune/Mumbai.'}
            ],
            'available_dates': ['05 Apr 2026', '06 Apr 2026', '07 Apr 2026', '08 Apr 2026'],
            'group_size': 15, 
            'difficulty': 'Moderate',
            'featured': True,
            'rating': 4.8,
            'reviews_count': 120,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'tour-6',
            'title': 'Hampi-Hippie Island Trip',
            'slug': 'hampi-hippie-island',
            'description': 'A backpacking adventure to the UNESCO World Heritage site of Hampi and the vibrant Hippie Island. Explore ancient ruins, enjoy coracle rides, and witness stunning sunsets.',
            'price': 7777,
            'duration': '2D/3N',
            'category': 'tour',
            'destination': 'Hampi',
            'image_url': '/images/tour/hampi.jpg',
            'hero_background_image': '/images/tour/tour_hero/hampi.jpg',
            'images': [],
            'inclusions': [
                'Transport from Pune/Mumbai/Nashik',
                'Professional Sightseeing Guide',
                'Stay on sharing basis',
                'Coracle Ride',
                'South Indian food (as per plan)',
                'Entry Fees for historical sites'
            ],
            'exclusions': ['Personal expenses','Cliff jump gear (if extra)','Additional snacks/drinks'
            ],
            'itinerary': [
                {'day': 1, 'title': 'Departure', 'description': 'Evening departure (approx. 8:30 PM) from Pune/Mumbai/Nashik via overnight bus.'},
                {'day': 2, 'title': 'Historical Hampi Exploration', 'description': 'Visit Vijaya Vitthala Temple (Stone Chariot), Elephant Stables, Lotus Mahal, and Virupaksha Temple. Evening at Hampi Bazar.'},
                {'day': 3, 'title': 'Hippie Island & Adventure', 'description': 'Explore Hippie Island, Coracle ride at Sanapur Lake, Cliff jumping, and sunset at Anjanadri Hills.'},
                {'day': 4, 'title': 'Temple Visit & Return', 'description': 'Visit Hemakuta Hills and Chintamani Temple (Historical Ramayana Place). Departure for return journey, arriving Monday morning (approx. 7 AM).'}
            ],
            'available_dates': ['09 Feb 2026', '10 Feb 2026', '11 Feb 2026', '12 Feb 2026'],
            'group_size': 15,
            'difficulty': 'Easy to Moderate',
            'featured': True,
            'rating': 4.9,
            'reviews_count': 210,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'tour-7',
            'title': 'Kedarnath Dham (Rishikesh & Ganga-Arati)',
            'slug': 'kedarnath-dham-ek-dham',
            'description': 'A divine backpacking trip to Kedarnath Jyotirlinga, including the spiritual Ganga Arati in Rishikesh and river rafting adventures.',
            'price': 13999, 
            'duration': '8N/9D',
            'category': 'tour',
            'destination': 'Uttarakhand',
            'image_url': '/images/tour/kedarnath.jpg',
            'hero_background_image': '/images/tour/tour_hero/kedarnath.jpeg',
            'images': [],
            'inclusions': [
                'Transportation',
                'Accommodation',
                'Delicious Meals During hotel stays',
                'Tour guide & coordinators',
                'First Aid Kit'
            ],
            'exclusions': [
                'Meals during transit',
                'Pony/Palki charges at Kedarnath',
                'Helicopter tickets',
                'Personal expenses'
            ],
            'itinerary': [
                {'day': 1, 'title': 'Mumbai/Pune to Delhi', 'description': 'Transit day from origin to Delhi.'},
                {'day': 2, 'title': 'Delhi to Haridwar', 'description': 'Travel to the holy city of Haridwar and witness Ganga Arati.'},
                {'day': 3, 'title': 'Haridwar to Sonprayag', 'description': 'Scenic drive towards the base of the Kedarnath trek.'},
                {'day': 4, 'title': 'Sonprayag to Kedarnath', 'description': 'Trek to the Kedarnath Temple for darshan.'},
                {'day': 5, 'title': 'Kedarnath to Gaurikund/Sitapur', 'description': 'Trek down from the temple to the base camp.'},
                {'day': 6, 'title': 'Sitapur to Haridwar', 'description': 'Return journey to Haridwar.'},
                {'day': 7, 'title': 'Rishikesh Sightseeing', 'description': 'Explore Rishikesh, local temples, and optional River Rafting.'},
                {'day': 8, 'title': 'Rishikesh to Delhi', 'description': 'Travel back to the capital city.'},
                {'day': 9, 'title': 'Delhi to Mumbai/Pune', 'description': 'Final transit for return journey home.'}
            ],
            'available_dates': ['17 May 2026', '21 May 2026', '14 Jun 2026'],
            'group_size': 12,
            'difficulty': 'Hard',
            'featured': True,
            'rating': 4.9,
            'reviews_count': 342,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        
    ]
    
    # Insert tours
    await db.tours.insert_many(tours)
    print(f"✓ Inserted {len(tours)} tours")
    
    # Sample coupons
    coupons = [
        {
            'id': 'coupon-1',
            'code': 'LOYALTY50',
            'discount_type': 'flat',
            'discount_value': 50,
            'description': 'Flat ₹50 off for loyal customers',
            'valid_until': None,
            'active': True
        },
        {
            'id': 'coupon-2',
            'code': 'LOYALTY200',
            'discount_type': 'flat',
            'discount_value': 200,
            'description': 'Flat ₹200 off on bookings',
            'valid_until': None,
            'active': True
        },
        {
            'id': 'coupon-3',
            'code': 'LOYALTY500',
            'discount_type': 'flat',
            'discount_value': 500,
            'description': 'Flat ₹500 off on premium tours',
            'valid_until': None,
            'active': True
        },
        {
            'id': 'coupon-4',
            'code': 'FIRST10',
            'discount_type': 'percentage',
            'discount_value': 10,
            'description': '10% off for first booking',
            'valid_until': (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
            'active': True
        }
    ]
    
    # Insert coupons
    await db.coupons.insert_many(coupons)
    print(f"✓ Inserted {len(coupons)} coupons")
    
    print("\n✓ Database seeded successfully!")
    client.close()

if __name__ == '__main__':
    asyncio.run(seed_database())

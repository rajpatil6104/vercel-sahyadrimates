import requests
import sys
import json
from datetime import datetime

class TrekhieversAPITester:
    def __init__(self, base_url="http://localhost:3000/"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n🔐 Testing Authentication Flow...")
        
        # Test user registration
        test_user = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
        else:
            print("   ❌ Failed to get token from registration")
            return False

        # Test login with same credentials
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        # Test get current user
        self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        return True

    def test_tours_api(self):
        """Test tours API endpoints"""
        print("\n🏔️ Testing Tours API...")
        
        # Get all tours
        success, tours_data = self.run_test(
            "Get All Tours",
            "GET",
            "tours",
            200
        )
        
        if success and tours_data:
            print(f"   Found {len(tours_data)} tours")
            
            # Test tour by ID if tours exist
            if len(tours_data) > 0:
                tour_id = tours_data[0]['id']
                self.run_test(
                    "Get Tour by ID",
                    "GET",
                    f"tours/{tour_id}",
                    200
                )
                
                # Test tour by slug if available
                if 'slug' in tours_data[0]:
                    slug = tours_data[0]['slug']
                    self.run_test(
                        "Get Tour by Slug",
                        "GET",
                        f"tours/slug/{slug}",
                        200
                    )
        
        # Test tours with filters
        self.run_test(
            "Get Tours with Search Filter",
            "GET",
            "tours?search=trek",
            200
        )
        
        self.run_test(
            "Get Tours with Category Filter",
            "GET",
            "tours?category=Trekking",
            200
        )
        
        self.run_test(
            "Get Tours with Price Filter",
            "GET",
            "tours?min_price=5000&max_price=15000",
            200
        )

    def test_destinations_and_categories(self):
        """Test destinations and categories endpoints"""
        print("\n📍 Testing Destinations & Categories...")
        
        self.run_test(
            "Get Destinations",
            "GET",
            "destinations",
            200
        )
        
        self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )

    def test_coupons_api(self):
        """Test coupon validation"""
        print("\n🎫 Testing Coupons API...")
        
        # Get available coupons
        success, coupons_data = self.run_test(
            "Get Available Coupons",
            "GET",
            "coupons",
            200
        )
        
        # Test coupon validation with known codes
        test_coupons = ["LOYALTY50", "LOYALTY200", "LOYALTY500", "FIRST10"]
        
        for coupon_code in test_coupons:
            self.run_test(
                f"Validate Coupon {coupon_code}",
                "POST",
                "coupons/validate",
                200,
                data={"code": coupon_code, "amount": 10000}
            )
        
        # Test invalid coupon
        self.run_test(
            "Validate Invalid Coupon",
            "POST",
            "coupons/validate",
            404,
            data={"code": "INVALID123", "amount": 10000}
        )

    def test_reviews_api(self):
        """Test reviews functionality"""
        print("\n⭐ Testing Reviews API...")
        
        # First get a tour to review
        success, tours_data = self.run_test(
            "Get Tours for Review Test",
            "GET",
            "tours",
            200
        )
        
        if success and tours_data and len(tours_data) > 0:
            tour_id = tours_data[0]['id']
            
            # Get existing reviews
            self.run_test(
                f"Get Reviews for Tour {tour_id}",
                "GET",
                f"reviews/{tour_id}",
                200
            )
            
            # Create a review (requires authentication)
            if self.token:
                review_data = {
                    "tour_id": tour_id,
                    "rating": 5,
                    "comment": "Amazing experience! Highly recommended."
                }
                
                self.run_test(
                    "Create Review",
                    "POST",
                    "reviews",
                    200,
                    data=review_data
                )

    def test_bookings_api(self):
        """Test booking functionality"""
        print("\n📅 Testing Bookings API...")
        
        if not self.token:
            print("   ⚠️ Skipping booking tests - no authentication token")
            return
        
        # Get tours for booking
        success, tours_data = self.run_test(
            "Get Tours for Booking Test",
            "GET",
            "tours",
            200
        )
        
        if success and tours_data and len(tours_data) > 0:
            tour = tours_data[0]
            tour_id = tour['id']
            
            # Create a booking
            booking_data = {
                "tour_id": tour_id,
                "travel_date": "2024-12-25",
                "guests": 2,
                "coupon_code": "LOYALTY50"
            }
            
            success, booking_response = self.run_test(
                "Create Booking",
                "POST",
                "bookings",
                200,
                data=booking_data
            )
            
            # Get user bookings
            self.run_test(
                "Get User Bookings",
                "GET",
                "bookings",
                200
            )

    def test_error_cases(self):
        """Test error handling"""
        print("\n🚫 Testing Error Cases...")
        
        # Test non-existent tour
        self.run_test(
            "Get Non-existent Tour",
            "GET",
            "tours/non-existent-id",
            404
        )
        
        # Test unauthorized access
        old_token = self.token
        self.token = "invalid-token"
        
        self.run_test(
            "Unauthorized Access",
            "GET",
            "auth/me",
            401
        )
        
        self.token = old_token

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Trekhievers API Testing...")
        print(f"Testing against: {self.base_url}")
        
        # Test authentication first
        auth_success = self.test_auth_flow()
        
        # Test public endpoints
        self.test_tours_api()
        self.test_destinations_and_categories()
        self.test_coupons_api()
        
        # Test authenticated endpoints
        if auth_success:
            self.test_reviews_api()
            self.test_bookings_api()
        
        # Test error cases
        self.test_error_cases()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = TrekhieversAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
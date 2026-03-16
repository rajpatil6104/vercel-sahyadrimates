/*import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Star, Clock, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchTour();
    fetchReviews();
  }, [id]);

  const fetchTour = async () => {
    try {
      const response = await axios.get(`${API}/tours/${id}`);
      setTour(response.data);
      if (response.data.available_dates.length > 0) {
        setSelectedDate(response.data.available_dates[0]);
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
      toast.error('Tour not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode) return;
    try {
      const response = await axios.post(`${API}/coupons/validate`, {
        code: couponCode,
        amount: tour.price * guests
      });
      setDiscount(response.data.discount_amount);
      toast.success(`Coupon applied! You saved ₹${response.data.discount_amount}`);
    } catch (error) {
      toast.error('Invalid or expired coupon');
      setDiscount(0);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book');
      navigate('/auth');
      return;
    }

    try {
      await axios.post(
        `${API}/bookings`,
        {
          tour_id: tour.id,
          travel_date: selectedDate,
          guests,
          coupon_code: couponCode || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Booking confirmed! Check your profile for details.');
      setShowBooking(false);
      navigate('/profile');
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    }
  };

  const handleReview = async () => {
    if (!user) {
      toast.error('Please login to review');
      navigate('/auth');
      return;
    }

    try {
      await axios.post(
        `${API}/reviews`,
        { tour_id: tour.id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review submitted successfully!');
      setShowReview(false);
      setComment('');
      fetchReviews();
      fetchTour();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!tour) {
    return <div>Tour not found</div>;
  }

  const totalAmount = tour.price * guests;
  const finalAmount = totalAmount - discount;

  return (
    <div className="min-h-screen" data-testid="tour-detail-page">
      <Navbar />

    
      <div className="relative h-[60vh] mt-20" data-testid="tour-hero">
        <img
          src={tour.image_url}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           Main Content 
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 mb-8"
              data-testid="tour-info-card"
            >
              <h1 className="text-4xl font-bold text-primary mb-4" data-testid="tour-title">{tour.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span data-testid="tour-destination">{tour.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span data-testid="tour-duration">{tour.duration}</span>
                </div>
                {tour.rating > 0 && (
                  <div className="flex items-center gap-2" data-testid="tour-rating">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{tour.rating}</span>
                    <span>({tour.reviews_count} reviews)</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-lg mb-8" data-testid="tour-description">{tour.description}</p>

              {/* Inclusions & Exclusions 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4" data-testid="inclusions-title">Inclusions</h3>
                  <ul className="space-y-2">
                    {tour.inclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2" data-testid={`inclusion-${idx}`}>
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4" data-testid="exclusions-title">Exclusions</h3>
                  <ul className="space-y-2">
                    {tour.exclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2" data-testid={`exclusion-${idx}`}>
                        <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Itinerary 
              {tour.itinerary.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-4" data-testid="itinerary-title">Itinerary</h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {tour.itinerary.map((day, idx) => (
                      <AccordionItem key={idx} value={`day-${idx}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline" data-testid={`itinerary-day-${idx}`}>
                          <span className="font-semibold">Day {day.day}: {day.title}</span>
                        </AccordionTrigger>
                        <AccordionContent data-testid={`itinerary-content-${idx}`}>
                          <p className="text-gray-600">{day.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </motion.div>

            {/* Reviews 
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
              data-testid="reviews-section"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary">Reviews</h3>
                <Button onClick={() => setShowReview(true)} variant="outline" data-testid="write-review-button">
                  Write a Review
                </Button>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0" data-testid={`review-${review.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold" data-testid={`review-user-${review.id}`}>{review.user_name}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600" data-testid={`review-comment-${review.id}`}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500" data-testid="no-reviews-message">No reviews yet. Be the first to review!</p>
              )}
            </motion.div>
          </div>

          {/* Booking Card 
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 sticky top-32"
              data-testid="booking-card"
            >
              <div className="mb-6">
                <div className="text-4xl font-bold text-accent mb-2" data-testid="booking-price">
                  ₹{tour.price.toLocaleString()}
                </div>
                {tour.original_price && (
                  <div className="text-lg text-gray-500 line-through">
                    ₹{tour.original_price.toLocaleString()}
                  </div>
                )}
                <div className="text-sm text-gray-600">per person</div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <select
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full mt-1 p-3 border rounded-lg"
                    data-testid="date-select"
                  >
                    {tour.available_dates.map((date, idx) => (
                      <option key={idx} value={date}>{date}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={tour.group_size || 50}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="mt-1"
                    data-testid="guests-input"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-accent text-white hover:bg-accent/90 rounded-full py-6 text-lg font-bold mb-4"
                onClick={() => setShowBooking(true)}
                data-testid="book-now-button"
              >
                Book Now
              </Button>

              <div className="text-center text-sm text-gray-500">
                Free cancellation up to 7 days before departure
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Dialog 
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent data-testid="booking-dialog">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>Review your booking details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Tour:</span>
                <span className="font-semibold">{tour.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Date:</span>
                <span className="font-semibold">{selectedDate}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Guests:</span>
                <span className="font-semibold">{guests}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Price per person:</span>
                <span className="font-semibold">₹{tour.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="coupon">Coupon Code (Optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  data-testid="coupon-input"
                />
                <Button onClick={validateCoupon} variant="outline" data-testid="apply-coupon-button">
                  Apply
                </Button>
              </div>
            </div>

            {discount > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount:</span>
                  <span data-testid="discount-amount">- ₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-900 font-bold text-lg mt-2">
                  <span>Final Amount:</span>
                  <span data-testid="final-amount">₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-accent text-white hover:bg-accent/90"
              onClick={handleBooking}
              data-testid="confirm-booking-button"
            >
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog 
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent data-testid="review-dialog">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>Share your experience with others</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    data-testid={`rating-star-${star}`}
                  >
                    <Star
                      className={`w-8 h-8 cursor-pointer ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="comment">Your Review</Label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg min-h-[120px]"
                placeholder="Tell us about your experience..."
                data-testid="review-comment-input"
              />
            </div>

            <Button
              className="w-full bg-accent text-white hover:bg-accent/90"
              onClick={handleReview}
              data-testid="submit-review-button"
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}*/


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Star, Clock, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchTour();
    fetchReviews();
  }, [id]);

  const fetchTour = async () => {
    try {
      const response = await axios.get(`${API}/tours/${id}`);
      setTour(response.data);
      if (response.data.available_dates.length > 0) {
        setSelectedDate(response.data.available_dates[0]);
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
      toast.error('Tour not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode) return;
    try {
      const response = await axios.post(`${API}/coupons/validate`, {
        code: couponCode,
        amount: tour.price * guests
      });
      setDiscount(response.data.discount_amount);
      toast.success(`Coupon applied! You saved ₹${response.data.discount_amount}`);
    } catch (error) {
      toast.error('Invalid or expired coupon');
      setDiscount(0);
    }
  };

  const handleBooking = () => {
    // REPLACE WITH YOUR ACTUAL WHATSAPP NUMBER (Including Country Code, no +)
    const phoneNumber = "918329834883"; 

    const totalAmount = tour.price * guests;
    const finalAmount = totalAmount - discount;

    const message = `*New Booking Inquiry*
--------------------------
*Tour:* ${tour.title}
*Destination:* ${tour.destination}
*Travel Date:* ${selectedDate}
*Number of Guests:* ${guests}
*Total Price:* ₹${finalAmount.toLocaleString()}
${couponCode ? `*Coupon Used:* ${couponCode} (-₹${discount})` : ''}
--------------------------
Please confirm the availability for these dates.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    setShowBooking(false);
    toast.success('Redirecting to WhatsApp for confirmation...');
  };

  const handleReview = async () => {
    try {
      // Note: This still sends to your API, but removed the "user" check
      await axios.post(
        `${API}/reviews`,
        { tour_id: tour.id, rating, comment }
      );
      toast.success('Review submitted successfully!');
      setShowReview(false);
      setComment('');
      fetchReviews();
      fetchTour();
    } catch (error) {
      toast.error('Failed to submit review. Anonymous reviews might be disabled on backend.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!tour) {
    return <div>Tour not found</div>;
  }

  const totalAmount = tour.price * guests;
  const finalAmount = totalAmount - discount;

  return (
    <div className="min-h-screen" data-testid="tour-detail-page">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-[70vh] " data-testid="tour-hero">
        <img
          src={`${BACKEND_URL}${tour.hero_background_image}`}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 mb-8"
              data-testid="tour-info-card"
            >
              <h1 className="text-4xl font-bold text-primary mb-4" data-testid="tour-title">{tour.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span data-testid="tour-destination">{tour.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span data-testid="tour-duration">{tour.duration}</span>
                </div>
                {tour.rating > 0 && (
                  <div className="flex items-center gap-2" data-testid="tour-rating">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{tour.rating}</span>
                    <span>({tour.reviews_count} reviews)</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-lg mb-8" data-testid="tour-description">{tour.description}</p>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4" data-testid="inclusions-title">Inclusions</h3>
                  <ul className="space-y-2">
                    {tour.inclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2" data-testid={`inclusion-${idx}`}>
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4" data-testid="exclusions-title">Exclusions</h3>
                  <ul className="space-y-2">
                    {tour.exclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2" data-testid={`exclusion-${idx}`}>
                        <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Itinerary 
              {tour.itinerary.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-4" data-testid="itinerary-title">Itinerary</h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {tour.itinerary.map((day, idx) => (
                      <AccordionItem key={idx} value={`day-${idx}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline" data-testid={`itinerary-day-${idx}`}>
                          <span className="font-semibold">Day {day.day}: {day.title}</span>
                        </AccordionTrigger>
                        <AccordionContent data-testid={`itinerary-content-${idx}`}>
                          <p className="text-gray-600">{day.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}*/}
              {tour.itinerary.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-4" data-testid="itinerary-title">Itinerary</h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {tour.itinerary.map((item, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4 mb-2">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-baseline gap-2 text-left">
                            {/* If 'day' exists, show Day X. Otherwise, show the Time. */}
                            <span className="font-bold text-primary whitespace-nowrap">
                              {item.day ? `Day ${item.day}:` : item.Time}
                            </span>
                            <span className="font-semibold text-gray-800">{item.title}</span>
                          </div>
                        </AccordionTrigger>
                        
                        {/* Only show content if a description exists */}
                        {item.description && (
                          <AccordionContent className="pb-4 text-gray-600 border-t pt-2">
                            {item.description}
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
              data-testid="reviews-section"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary">Reviews</h3>
                <Button onClick={() => setShowReview(true)} variant="outline" data-testid="write-review-button">
                  Write a Review
                </Button>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0" data-testid={`review-${review.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold" data-testid={`review-user-${review.id}`}>{review.user_name}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600" data-testid={`review-comment-${review.id}`}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500" data-testid="no-reviews-message">No reviews yet. Be the first to review!</p>
              )}
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 sticky top-32"
              data-testid="booking-card"
            >
              <div className="mb-6">
                <div className="text-4xl font-bold text-accent mb-2" data-testid="booking-price">
                  ₹{tour.price.toLocaleString()}
                </div>
                {tour.original_price && (
                  <div className="text-lg text-gray-500 line-through">
                    ₹{tour.original_price.toLocaleString()}
                  </div>
                )}
                <div className="text-sm text-gray-600">per person</div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <select
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full mt-1 p-3 border rounded-lg"
                    data-testid="date-select"
                  >
                    {tour.available_dates.map((date, idx) => (
                      <option key={idx} value={date}>{date}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={tour.group_size || 50}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="mt-1"
                    data-testid="guests-input"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-accent text-white hover:bg-accent/90 rounded-full py-6 text-lg font-bold mb-4"
                onClick={() => setShowBooking(true)}
                data-testid="book-now-button"
              >
                Book Now
              </Button>

              <div className="text-center text-sm text-gray-500">
                Direct booking via WhatsApp
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent data-testid="booking-dialog">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>Review your details before we redirect you to WhatsApp</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Tour:</span>
                <span className="font-semibold">{tour.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Date:</span>
                <span className="font-semibold">{selectedDate}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Guests:</span>
                <span className="font-semibold">{guests}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Price per person:</span>
                <span className="font-semibold">₹{tour.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="coupon">Coupon Code (Optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  data-testid="coupon-input"
                />
                <Button onClick={validateCoupon} variant="outline" data-testid="apply-coupon-button">
                  Apply
                </Button>
              </div>
            </div>

            {discount > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount:</span>
                  <span data-testid="discount-amount">- ₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-900 font-bold text-lg mt-2">
                  <span>Final Amount:</span>
                  <span data-testid="final-amount">₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] font-bold"
              onClick={handleBooking}
              data-testid="confirm-booking-button"
            >
              Continue to WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent data-testid="review-dialog">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>Share your experience with others</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    data-testid={`rating-star-${star}`}
                  >
                    <Star
                      className={`w-8 h-8 cursor-pointer ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="comment">Your Review</Label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg min-h-[120px]"
                placeholder="Tell us about your experience..."
                data-testid="review-comment-input"
              />
            </div>

            <Button
              className="w-full bg-accent text-white hover:bg-accent/90"
              onClick={handleReview}
              data-testid="submit-review-button"
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
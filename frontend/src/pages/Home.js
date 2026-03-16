import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TourCard from '../components/TourCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';



const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Home() {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeaturedTours();
    fetchDestinations();
  }, []);

  const fetchFeaturedTours = async () => {
    try {
      const response = await axios.get(`${API}/tours`);
      setFeaturedTours(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${API}/destinations`);
      setDestinations(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/tours?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen  flex items-center justify-center" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img
            src={`${BACKEND_URL}/images/hero2.png`}
            alt="Majestic Himalayas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold- mb-6 text-shadow"
            data-testid="hero-title"
          >
            Discover Your Next Adventure With
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold- mb-6 text-shadow text-orange-400"
            data-testid="hero-title"
          >
            SahyadriMates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-12 text-shadow"
            data-testid="hero-subtitle"
          >
            Explore 150+ destinations across India with expert guides
          </motion.p>

          {/* Floating Search Bar
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto"
            data-testid="search-container"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-full p-2 shadow-2xl flex items-center gap-2">
              <Search className="w-6 h-6 text-gray-400 ml-4" />
              <Input
                type="text"
                placeholder="Search destinations, treks, tours..."
                className="flex-1 border-0 bg-transparent text-gray-800 placeholder:text-gray-500 focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="search-input"
              />
              <Button
                className="bg-accent text-white hover:bg-accent/90 rounded-full px-8 py-6"
                onClick={handleSearch}
                data-testid="search-button"
              >
                Search
              </Button>
            </div>
          </motion.div> */}
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-24 lg:py-32 bg-background" data-testid="featured-tours-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-primary mb-4" data-testid="featured-tours-title">Featured Adventures</h2>
            <p className="text-xl text-gray-600">Handpicked experiences for your next journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/tours" data-testid="view-all-tours-link">
              <Button className="bg-accent text-white hover:bg-accent/90 rounded-full px-8 py-6 text-lg" data-testid="view-all-tours-button">
                View All Tours
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-24 lg:py-32" data-testid="destinations-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-primary mb-4" data-testid="destinations-title">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Explore the most sought-after locations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {destinations.map((dest, idx) => (
              <Link
                key={idx}
                to={`/tours?destination=${encodeURIComponent(dest.name)}`}
                data-testid={`destination-card-${idx}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative h-96 rounded-3xl overflow-hidden group cursor-pointer"
                >
                  <img
                    src={`${BACKEND_URL}${dest.image_url}`}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-4xl font-bold mb-2" data-testid={`destination-name-${idx}`}>{dest.name}</h3>
                    <p className="text-lg" data-testid={`destination-count-${idx}`}>{dest.count} Tours Available</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-secondary/20" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-primary mb-4" data-testid="testimonials-title">What Travelers Say</h2>
            <p className="text-xl text-gray-600">Real experiences from our adventure community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Tarka Pednekar',
                role: 'Digital Creator',
                text: 'Trekhievers made this experience much better and comfortable. The place is so great that all the after-trek body ache was all worth it.',
                image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100'
              },
              {
                name: 'Subhash B',
                role: 'Co-Founder Kitabeli',
                text: 'The best trek organizers. Trekking with them for the last 3 years and never disappointed. My fondest memories are that of Kalsubai.',
                image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100'
              },
              {
                name: 'Hiral Tanna',
                role: 'Avid Traveller',
                text: 'I enjoyed my trek with Trekhievers. The arrangements were pretty good with proper planning and management. We made some unforgettable memories.',
                image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100'
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg"
                data-testid={`testimonial-card-${idx}`}
              >
                <p className="text-gray-700 mb-6 font-['Caveat'] text-xl" data-testid={`testimonial-text-${idx}`}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-primary" data-testid={`testimonial-name-${idx}`}>{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6" data-testid="cta-title">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8">Join thousands of adventurers exploring India</p>
          <Link to="/tours">
            <Button className="bg-accent text-white hover:bg-accent/90 rounded-full px-12 py-8 text-xl" data-testid="cta-button">
              Explore All Tours
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
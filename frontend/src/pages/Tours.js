import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TourCard from '../components/TourCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Tours() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchDestinations();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTours();
  }, [searchParams]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('category')) params.category = searchParams.get('category');
      if (searchParams.get('destination')) params.destination = searchParams.get('destination');
      if (searchParams.get('min_price')) params.min_price = searchParams.get('min_price');
      if (searchParams.get('max_price')) params.max_price = searchParams.get('max_price');

      const response = await axios.get(`${API}/tours`, { params });
      setTours(response.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${API}/destinations`);
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFilters = () => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (category) params.category = category;
    if (destination) params.destination = destination;
    if (priceRange[0] > 0) params.min_price = priceRange[0];
    if (priceRange[1] < 50000) params.max_price = priceRange[1];
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setDestination('');
    setPriceRange([0, 50000]);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen" data-testid="tours-page">
      <Navbar />

      <div className="pt-32 pb-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4" data-testid="tours-page-title">Explore All Tours</h1>
          <p className="text-xl">Find your perfect adventure from our collection</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12" data-testid="filter-section">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                className="border-0 focus-visible:ring-0"
                data-testid="tours-search-input"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
              data-testid="toggle-filters-button"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <div className={`flex flex-col lg:flex-row gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full lg:w-[200px]" data-testid="category-filter">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger className="w-full lg:w-[200px]" data-testid="destination-filter">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {destinations.map((dest) => (
                    <SelectItem key={dest.name} value={dest.name}>{dest.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={applyFilters}
                className="bg-accent text-white hover:bg-accent/90"
                data-testid="apply-filters-button"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>

              <Button
                variant="outline"
                onClick={clearFilters}
                data-testid="clear-filters-button"
              >
                Clear
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <label className="block text-sm font-semibold mb-4">Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={50000}
                step={1000}
                className="mb-4"
                data-testid="price-range-slider"
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6" data-testid="tours-count">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${tours.length} tours found`}
          </p>
        </div>

        {/* Tours Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="tours-grid">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20" data-testid="no-tours-message">
            <p className="text-2xl text-gray-500">No tours found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
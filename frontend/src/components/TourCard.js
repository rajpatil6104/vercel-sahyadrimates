import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function TourCard({ tour }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      data-testid={`tour-card-${tour.id}`}
    >
      <Link to={`/tours/${tour.id}`} className="block">
        <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-500">
          <div className="relative h-64 overflow-hidden">
            <img
              src={`${BACKEND_URL}${tour.image_url}`}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              data-testid={`tour-card-image-${tour.id}`}
            />
            <div className="absolute inset-0 card-overlay"></div>
            
            {tour.original_price && (
              <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold" data-testid={`tour-discount-badge-${tour.id}`}>
                Save ₹{tour.original_price - tour.price}
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2" data-testid={`tour-card-title-${tour.id}`}>{tour.title}</h3>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span data-testid={`tour-card-destination-${tour.id}`}>{tour.destination}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span data-testid={`tour-card-duration-${tour.id}`}>{tour.duration}</span>
                </div>
                {tour.group_size && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Max {tour.group_size}</span>
                  </div>
                )}
              </div>
              {tour.rating > 0 && (
                <div className="flex items-center gap-1 text-sm" data-testid={`tour-card-rating-${tour.id}`}>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-gray-500">({tour.reviews_count})</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-accent" data-testid={`tour-card-price-${tour.id}`}>₹{tour.price.toLocaleString()}</div>
                {tour.original_price && (
                  <div className="text-sm text-gray-500 line-through">₹{tour.original_price.toLocaleString()}</div>
                )}
              </div>
              <div className="bg-accent text-white px-6 py-3 rounded-full font-semibold group-hover:bg-accent/90 transition-colors" data-testid={`tour-card-view-button-${tour.id}`}>
                View Details
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
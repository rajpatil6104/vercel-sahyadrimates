import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-20" style={{background:"#7A4A1E"}} data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-3xl font-bold mb-6" data-testid="footer-brand">SahyadriMates</h3>
            <p className="text-gray-300 mb-6">
              Your adventure partner for treks, tours, and backpacking across India.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/sahyadrimates" className="hover:text-accent transition-colors" data-testid="footer-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/sahyadri_mates?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="hover:text-accent transition-colors" data-testid="footer-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              {/*<a href="#" className="hover:text-accent transition-colors" data-testid="footer-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors" data-testid="footer-youtube">
                <Youtube className="w-5 h-5" />
              </a>*/}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/tours" className="text-gray-300 hover:text-accent transition-colors">All Tours</Link></li>
              <li><Link to="/tours?category=trek" className="text-gray-300 hover:text-accent transition-colors">Treks</Link></li>
              <li><Link to="/tours?category=camping" className="text-gray-300 hover:text-accent transition-colors">Camping</Link></li>
              <li><Link to="/tours?category=tour" className="text-gray-300 hover:text-accent transition-colors">Group Tours</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6">Destinations</h4>
            <ul className="space-y-3">
              <li><Link to="/tours?destination=Maharashtra" className="text-gray-300 hover:text-accent transition-colors">Maharashtra</Link></li>
              <li><Link to="/tours?destination=Uttarakhand" className="text-gray-300 hover:text-accent transition-colors">Uttarakhand</Link></li>
              <li><Link to="/tours?destination=Srisailam" className="text-gray-300 hover:text-accent transition-colors">Srisailam</Link></li>
              <li><Link to="/tours?destination=Hampi" className="text-gray-300 hover:text-accent transition-colors">Hampi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <a href="tel:+919156574952" className="text-gray-300 hover:text-accent transition-colors block">+91 9156574952</a>
                  
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@sahyadrimates.com" className="text-gray-300 hover:text-accent transition-colors">info@sahyadrimates.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Mumbai, Nashik & Pune</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2026 SahyadriMates. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

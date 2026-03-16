{/*import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav 
        className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 md:px-10 md:py-4 shadow-2xl flex items-center justify-between gap-2 md:gap-8 w-[95%] md:w-auto max-w-4xl" 
        data-testid="navbar"
      >
        {/* Logo - Smaller font on mobile *
        <Link 
          to="/" 
          className="text-xl md:text-3xl font-bold shrink-0" 
          style={{ color: '#F28C1C' }} 
          data-testid="nav-logo"
        >
          SahyadriMates
        </Link>
        
        {/* Desktop Menu - Hidden on mobile *
        <div className="hidden md:flex items-center gap-6" data-testid="nav-menu">
          <Link to="/tours" className="text-primary hover:text-accent transition-colors font-medium">
            Tours
          </Link>
          <Link to="/tours?category=trek" className="text-primary hover:text-accent transition-colors font-medium">
            Treks
          </Link>
          <Link to="/tours?category=camping" className="text-primary hover:text-accent transition-colors font-medium">
            Camping
          </Link>
        </div>

        <div className="flex items-center gap-1 md:gap-4 ml-auto">
          {/* User Section */}
          

          {/* Mobile Menu Toggle *
          <button 
            className="md:hidden p-2 text-primary hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Overlay *
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-lg md:hidden flex flex-col items-center justify-center gap-8 pt-20">
          <Link to="/tours" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold">Tours</Link>
          <Link to="/tours?category=trek" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold">Treks</Link>
          <Link to="/tours?category=camping" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold">Camping</Link>
        </div>
      )}
    </>
  );
}*/}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav 
        className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 md:px-6 md:py-3 shadow-2xl flex items-center justify-between gap-2 md:gap-8 w-[95%] md:w-auto max-w-4xl" 
        data-testid="navbar"
      >
        {/* --- LOGO AND TEXT SECTION --- */}
        <Link 
          to="/" 
          className="flex items-center gap-2 md:gap-3 shrink-0 group" 
          data-testid="nav-logo"
        >
          <div className="relative">
            <img 
              src={`${BACKEND_URL}/images/logo.png`} // Ensure your logo is in public/images/L5.png
              alt="SahyadriMates" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform group-hover:scale-110" 
            />
          </div>
          <span 
            className="text-lg md:text-2xl font-bold tracking-tight" 
            style={{ color: '#F28C1C' }}
          >
            SahyadriMates
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6" data-testid="nav-menu">
          <Link to="/tours" className="text-primary hover:text-accent transition-colors font-medium">
            Tours
          </Link>
          <Link to="/tours?category=trek" className="text-primary hover:text-accent transition-colors font-medium">
            Treks
          </Link>
          <Link to="/tours?category=camping" className="text-primary hover:text-accent transition-colors font-medium">
            Camping
          </Link>
        </div>

        <div className="flex items-center gap-1 md:gap-4 ml-auto">
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-primary hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-lg md:hidden flex flex-col items-center justify-center gap-8 pt-20">
          {/* Optional: Add a large logo here for the mobile menu too */}
          <img src={`${BACKEND_URL}/images/logo.png`}alt="Logo" className="w-24 h-24 mb-4" />
          <Link to="/tours" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold">Tours</Link>
          <Link to="/tours?category=trek" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold">Treks</Link>
          <Link to="/tours?category=camping" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold">Camping</Link>
        </div>
      )}
    </>
  );
}
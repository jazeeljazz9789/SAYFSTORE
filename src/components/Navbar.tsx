import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-pitch-black/90 backdrop-blur-md border-b border-white/10">
      <div className="text-2xl font-oswald font-bold tracking-widest uppercase">
        <a href="#hero">Urban<span className="text-vibrant-red">Step</span></a>
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-10 text-sm tracking-widest uppercase text-ash-grey">
        <a href="#collections" className="hover:text-stark-white transition-colors duration-300">Collections</a>
        <a href="#about" className="hover:text-stark-white transition-colors duration-300">About</a>
        <a href="#contact" className="hover:text-stark-white transition-colors duration-300">Contact</a>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="text-sm font-semibold tracking-widest uppercase hover:text-vibrant-red transition-colors duration-300 flex items-center gap-2">
          Cart <span className="bg-vibrant-red text-stark-white text-xs px-2 py-0.5 rounded-full">0</span>
        </button>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-stark-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-pitch-black border-b border-white/10 py-4 px-6 flex flex-col gap-4 md:hidden">
          <a href="#collections" className="text-lg uppercase tracking-widest hover:text-vibrant-red transition-colors">Collections</a>
          <a href="#about" className="text-lg uppercase tracking-widest hover:text-vibrant-red transition-colors">About</a>
          <a href="#contact" className="text-lg uppercase tracking-widest hover:text-vibrant-red transition-colors">Contact</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

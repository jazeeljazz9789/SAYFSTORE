import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background organic shape */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-dark-gray rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse"></div>
      
      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        <div className="relative z-30 pt-10 md:pt-0">
          <h1 className="text-[15vw] md:text-[9vw] font-oswald font-bold leading-[0.85] tracking-tighter uppercase text-stark-white mix-blend-difference relative">
            Urban<br/>
            <span className="text-vibrant-red">Step.</span>
          </h1>
          <p className="mt-8 text-ash-grey max-w-md text-lg font-medium leading-relaxed">
            Define your street presence with our latest high-contrast footwear collection. Built for the concrete jungle.
          </p>
          <div className="mt-10 flex gap-4">
            <a href="#collections" className="inline-block bg-stark-white text-pitch-black px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-vibrant-red hover:text-stark-white transition-all duration-300 transform hover:-translate-y-1">
              Shop Now
            </a>
            <a href="#about" className="inline-block border border-white/20 text-stark-white px-8 py-4 text-sm font-bold tracking-widest uppercase hover:border-stark-white transition-all duration-300">
              Our Story
            </a>
          </div>
        </div>
        
        <div className="relative z-10 md:-ml-20">
          {/* Fashion model placeholder image */}
          <div className="relative w-full h-[500px] md:h-[800px] clip-organic-shape bg-dark-gray">
            <img 
              src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Streetwear Fashion Model" 
              className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-1000"
            />
          </div>
          
          {/* Floating badge accent */}
          <div className="absolute bottom-10 -left-10 bg-vibrant-red text-stark-white px-6 py-4 uppercase tracking-widest font-bold text-sm hidden md:block transform -rotate-90 origin-bottom-left shadow-2xl z-40">
            New Arrival
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-50 z-20">
        <span className="text-xs tracking-[0.3em] uppercase text-ash-grey">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-stark-white to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;

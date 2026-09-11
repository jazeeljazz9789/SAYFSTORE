import React from "react";

const products = [
  { id: 1, name: "Onyx High-Top", price: "₹12,999", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Phantom Low", price: "₹9,499", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Crimson Runner", price: "₹14,999", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Ash Retro", price: "₹11,499", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
];

const ProductSection: React.FC = () => {
  return (
    <section id="collections" className="py-32 px-6 relative z-20 bg-pitch-black">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-white/10 pb-6">
          <h2 className="text-5xl md:text-8xl font-oswald font-bold uppercase tracking-tighter">
            The <span className="text-vibrant-red">Collection</span>
          </h2>
          <button className="mt-4 md:mt-0 text-ash-grey hover:text-stark-white uppercase tracking-widest text-sm font-bold pb-2 border-b-2 border-transparent hover:border-vibrant-red transition-all">
            View All Series
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group relative overflow-hidden bg-dark-gray aspect-[4/5] cursor-pointer">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-overlay opacity-90 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full">
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <h3 className="text-3xl font-oswald font-bold uppercase mb-2 leading-none text-stark-white drop-shadow-lg">{product.name}</h3>
                  <p className="text-ash-grey font-medium mb-6">{product.price}</p>
                  
                  <button className="w-full bg-stark-white text-pitch-black py-4 uppercase tracking-widest text-sm font-bold group-hover:bg-vibrant-red group-hover:text-stark-white transition-colors duration-300 opacity-0 group-hover:opacity-100">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;

import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Hotel, Phone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TRAVEL_ITEMS = [
  {
    name: 'Eventos Partenón',
    type: 'Sede del Evento',
    address: 'Blvd. Antonio Quiroga, Hermosillo',
    link: 'https://maps.app.goo.gl/kSPnzJwCzk3XibCz8',
    image: '/assets/guia-viaje/partenon.jpg'
  },
  {
    name: 'Hotel Santorian',
    type: 'Hospedaje Recomendado',
    address: 'Hermosillo, Sonora',
    link: 'https://maps.app.goo.gl/QNEKnpkcCPN2vrFK7',
    image: '/assets/guia-viaje/santorian.jpg'
  },
  {
    name: 'Hotel San Angel',
    type: 'Hospedaje Recomendado',
    address: 'Blvd. García Morales, Hermosillo',
    link: 'https://maps.app.goo.gl/Dzgj9GCaC4wYtiZi7',
    image: '/assets/guia-viaje/san-angel.jpg'
  },
  {
    name: 'Hotel Royal Palace',
    type: 'Hospedaje Recomendado',
    address: 'Blvd. García Morales 306, Hermosillo',
    link: 'https://maps.app.goo.gl/yCF9jkSU4BDtxRCX9',
    image: '/assets/guia-viaje/royal-palace.jpg'
  }
];

export default function TravelSection() {
  return (
    <section className="py-24 px-6 bg-slate-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-branding-orange/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p className="text-[#FF5100] text-[10px] font-black tracking-[0.5em] uppercase mb-4">Logística y Estancia</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Guía de <span className="text-[#FF5100]">Viaje</span>
            </h2>
          </div>
          <Link 
            to="/guia-viaje"
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-branding-orange transition-colors"
          >
            Ver Guía Completa
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-branding-orange group-hover:bg-branding-orange/10 transition-all">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRAVEL_ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="premium-card group overflow-hidden border-white/5 flex flex-col h-full"
            >
              <div className="h-40 -mx-6 -mt-6 mb-6 overflow-hidden bg-white/5">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
                  onError={(e) => {
                    // Fallback to a placeholder if image doesn't exist yet
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
                  }}
                />
              </div>
              <div className="mb-2">
                <span className="text-[#FF5100]/60 text-[9px] font-black uppercase tracking-widest">{item.type}</span>
              </div>
              <h3 className="text-xl font-black mb-4 uppercase text-white group-hover:text-branding-orange transition-colors leading-tight">{item.name}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                  <MapPin className="w-3 h-3 text-branding-orange flex-shrink-0 mt-0.5" />
                  {item.address}
                </div>
              </div>

              <div className="mt-auto">
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[10px] font-black uppercase tracking-widest text-[#FF5100] border-b border-branding-orange/20 pb-1 hover:border-branding-orange transition-all"
                >
                  CONTACTO
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

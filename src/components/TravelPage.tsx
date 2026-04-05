import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Car, Hotel, ArrowLeft, ExternalLink, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';

const HOTELS = [
  {
    name: 'Hotel Santorian',
    desc: 'Estilo boutique y cercanía estratégica. Una de las mejores opciones modernas en la ciudad.',
    link: 'https://hotelsantorian.mx/',
    address: 'Hermosillo, Sonora',
    phone: '662 213 3131',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Hotel San Angel',
    desc: 'Tradición y confort. Ideal para quienes buscan una estancia clásica con excelente servicio.',
    link: 'https://hotelsanangel.com.mx/',
    address: 'Blvd. García Morales, Hermosillo',
    phone: '662 259 8100',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Hotel Royal Palace',
    desc: 'Elegancia y prestigio en una ubicación privilegiada. Habitaciones de lujo y servicio de primer nivel.',
    link: 'https://hotelroyalpalace.com.mx/',
    address: 'Blvd. García Morales 306, Hermosillo',
    phone: '662 236 3333',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Hotel Marsella',
    desc: 'Un clásico renovado en el corazón de la zona hotelera.',
    link: 'https://hotelmarsella.com.mx/',
    address: 'Fray Bernardino de Sahagún, Col. Centro',
    phone: '662 213 1400',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const CAR_RENTALS = [
  {
    name: 'Hertz México',
    desc: 'Ubicados en el Aeropuerto Internacional de Hermosillo.',
    phone: '800 709 5000'
  },
  {
    name: 'Enterprise Rent-A-Car',
    desc: 'Amplia flota de vehículos para tu estancia.',
    phone: '662 261 0134'
  }
];

export default function TravelPage({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-6">
      <SEO 
        title="Guía de Viaje y Hospedaje - Encuentro Jóvenes Coparmex"
        description="Recomendaciones de hoteles y transporte para los asistentes al Encuentro de Jóvenes Coparmex en Hermosillo."
        path="/guia-viaje"
      />

      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-branding-orange transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Volver al Inicio</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <p className="text-[#FF5100] text-[10px] font-black tracking-[0.5em] uppercase mb-4">Logística y Estancia</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
            Prepara tu <span className="text-[#FF5100]">Viaje</span>
          </h1>
          <p className="text-white/40 mt-6 text-lg max-w-2xl leading-relaxed">
            Hermosillo te recibe con los brazos abiertos. Hemos seleccionado las mejores opciones para que tu única preocupación sea aprender y hacer networking.
          </p>
        </motion.div>

        {/* Hotels Grid */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <Hotel className="text-branding-orange w-6 h-6" />
            <h2 className="text-2xl font-black uppercase tracking-widest">Hospedaje Recomendado</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOTELS.map((hotel, i) => (
              <motion.div
                key={hotel.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="premium-card group overflow-hidden"
              >
                <div className="h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                </div>
                <h3 className="text-xl font-black mb-3 uppercase">{hotel.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6 h-12 overflow-hidden">{hotel.desc}</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                    <MapPin className="w-3 h-3 text-branding-orange" />
                    {hotel.address}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                    <Phone className="w-3 h-3 text-branding-orange" />
                    {hotel.phone}
                  </div>
                </div>
                <a 
                  href={hotel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 glass-morphism rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-branding-orange transition-colors"
                >
                  Reservar Ahora
                  <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transport Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Car className="text-branding-orange w-6 h-6" />
              <h2 className="text-2xl font-black uppercase tracking-widest">Renta de Autos</h2>
            </div>
            <div className="space-y-4">
              {CAR_RENTALS.map((car) => (
                <div key={car.name} className="premium-card !p-6 flex justify-between items-center group">
                  <div>
                    <h3 className="font-black uppercase text-sm mb-1">{car.name}</h3>
                    <p className="text-[11px] text-white/30">{car.desc}</p>
                  </div>
                  <a href={`tel:${car.phone.replace(/ /g, '')}`} className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center hover:bg-branding-orange transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card bg-branding-orange/5 border-branding-orange/20">
            <h3 className="text-xl font-black mb-4 uppercase text-branding-orange">Tip del Experto</h3>
            <p className="text-sm text-white/60 leading-relaxed mb-6 font-medium">
              Si llegas vía aérea, el Aeropuerto Internacional General Ignacio Pesqueira García (HMO) cuenta con diversas opciones de transporte terrestre y renta de vehículos justo en la salida. 
              <br /><br />
              El evento se llevará a cabo en <strong>Eventos Partenon</strong>, ubicado en una zona de fácil acceso para todos los hoteles recomendados.
            </p>
            <div className="h-px w-full bg-branding-orange/10 mb-6" />
            <button 
              onClick={() => navigate('/checkout')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-branding-orange transition-colors"
            >
              Aún no tengo mi carnet →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

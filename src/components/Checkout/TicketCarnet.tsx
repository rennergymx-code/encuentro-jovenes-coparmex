import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Calendar, MapPin, User, Ticket as TicketIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

interface TicketCarnetProps {
  ticket: {
    id: string;
    attendee_name: string;
    type: string;
    qr_code: string;
  };
}

export default function TicketCarnet({ ticket }: TicketCarnetProps) {
  const carnetRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!carnetRef.current) return;
    
    try {
      const canvas = await html2canvas(carnetRef.current, {
        backgroundColor: '#0f172a', // Slate 900
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Boleto-EncuentroCoparmex-${ticket.attendee_name.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (err) {
      console.error('Error al generar imagen:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Visual Carnet (The one that gets captured) */}
      <div 
        ref={carnetRef}
        className="w-[350px] aspect-[1/1.6] bg-slate-900 text-white rounded-[40px] p-8 relative overflow-hidden shadow-2xl border border-white/10 flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        }}
      >
        {/* Background Accents */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px]" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/5 rounded-full blur-[60px]" />
        <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6 pt-4">
          <img src="/assets/logos/logo-white-v.png" alt="Coparmex" className="h-20 w-auto mb-4 drop-shadow-2xl" />
          <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1 text-white">
            Encuentro <span className="text-orange-500 italic">Jóvenes</span>
          </h3>
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-orange-500/50">
            Coparmex Sonora Norte
          </p>
        </div>

        {/* Attendee Info */}
        <div className="flex-1 space-y-6 flex flex-col justify-center py-4">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 italic">Asistente Confirmado</p>
            <h4 className="text-3xl font-black uppercase tracking-tight text-white leading-none px-2 drop-shadow-lg">
              {ticket.attendee_name}
            </h4>
          </div>
          
          <div className="flex justify-center gap-3">
            <div className="bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
              <p className="text-[7px] font-black uppercase tracking-widest text-slate-500 mb-1">Carnet</p>
              <p className="text-xs font-black uppercase text-orange-500 tracking-wider">
                {ticket.type === 'estudiante' ? 'Estudiante' : 'General'}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
              <p className="text-[7px] font-black uppercase tracking-widest text-slate-500 mb-1">Folio</p>
              <p className="text-xs font-black uppercase text-white font-mono">
                {ticket.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-4 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-slate-900 overflow-hidden">
            <QRCodeSVG 
              value={ticket.qr_code} 
              size={120}
              level="H"
              includeMargin={false}
            />
          </div>
          {/* Ticket Perforation look */}
          <div className="w-full flex items-center justify-between mt-8 opacity-20">
            <div className="w-4 h-4 bg-slate-950 rounded-full -ml-10" />
            <div className="flex-1 border-t border-dashed border-white/30 mx-2" />
            <div className="w-4 h-4 bg-slate-950 rounded-full -mr-10" />
          </div>
        </div>

        {/* Footer Details */}
        <div className="grid grid-cols-2 gap-4 pb-2">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            12 Mayo, 2026
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400 justify-end">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            Hermosillo, SON
          </div>
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-4 left-0 w-full text-center">
          <p className="text-[6px] font-black uppercase tracking-[0.5em] text-slate-700">
            No compartas este código con nadie
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleDownload}
        className="w-full premium-button bg-white text-black py-4 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/5"
      >
        <Download className="w-4 h-4" /> 
        Descargar Carnet
      </button>
    </div>
  );
}

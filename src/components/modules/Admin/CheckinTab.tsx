import React from 'react';
import { motion } from 'motion/react';
import QRScanner from '../../QRScanner';
import { Clock, UserCheck, AlertCircle } from 'lucide-react';

interface CheckinTabProps {
  tickets: any[];
}

export default function CheckinTab({ tickets }: CheckinTabProps) {
  const recentScans = tickets
    .filter(t => t.status === 'scanned')
    .sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime())
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Scanner Column */}
      <div className="lg:col-span-2">
        <div className="premium-card !p-0 overflow-hidden">
          <QRScanner />
        </div>
      </div>

      {/* Stats & History Column */}
      <div className="space-y-8">
        <div className="premium-card">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Resumen de Acceso</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-300">Total Ingresos</span>
              </div>
              <span className="text-xl font-black">{tickets.filter(t => t.status === 'scanned').length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-500">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-bold">Pendientes</span>
              </div>
              <span className="text-xl font-black">{tickets.filter(t => t.status !== 'scanned').length}</span>
            </div>
          </div>
        </div>

        <div className="premium-card">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Últimos Ingresos</h3>
          <div className="space-y-4">
            {recentScans.length > 0 ? (
              recentScans.map((scan) => (
                <motion.div 
                  key={scan.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 border-l-2 border-emerald-500 bg-emerald-500/5 rounded-r-xl"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase truncate">{scan.attendee_name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">OK</span>
                </motion.div>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-slate-600 font-bold uppercase tracking-widest italic">Sin ingresos recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

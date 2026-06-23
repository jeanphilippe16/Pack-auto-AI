import { useState, useEffect } from 'react';
import { KeyRound, Clock, CheckCircle, XCircle, Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Rental, Page } from '../types';

interface RentalsPageProps {
  onNavigate: (page: Page, carId?: string) => void;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'text-amber-400 bg-amber-500/20', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmee', color: 'text-blue-400 bg-blue-500/20', icon: <CheckCircle size={14} /> },
  active: { label: 'En cours', color: 'text-emerald-400 bg-emerald-500/20', icon: <KeyRound size={14} /> },
  completed: { label: 'Terminee', color: 'text-slate-400 bg-slate-500/20', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Annulee', color: 'text-red-400 bg-red-500/20', icon: <XCircle size={14} /> },
};

export default function RentalsPage({ onNavigate }: RentalsPageProps) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRentals(); }, []);

  async function fetchRentals() {
    setLoading(true);
    const { data, error } = await supabase.from('rentals').select('*, car:cars(*)').order('created_at', { ascending: false });
    if (!error && data) setRentals(data as unknown as Rental[]);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><KeyRound size={28} className="text-emerald-400" />Gestion des locations</h1>
            <p className="text-slate-400 mt-1">{rentals.length} reservation(s)</p>
          </div>
          <button onClick={() => onNavigate('catalog')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">Nouvelle location</button>
        </div>
        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-28 animate-pulse" />))}</div>
        ) : rentals.length === 0 ? (
          <div className="text-center py-16"><KeyRound size={48} className="mx-auto text-slate-600 mb-4" /><p className="text-slate-400 text-lg">Aucune location enregistree</p><button onClick={() => onNavigate('catalog')} className="mt-4 text-emerald-400 hover:underline text-sm">Explorer le catalogue</button></div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => {
              const status = STATUS_MAP[rental.status] || STATUS_MAP.pending;
              return (
                <div key={rental.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                        {rental.car?.image_url ? <img src={rental.car.image_url} alt="" className="w-full h-full object-cover rounded-xl" /> : <Car size={24} />}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{rental.car?.brand} {rental.car?.model}</h3>
                        <p className="text-slate-400 text-sm">{rental.customer_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>Du {new Date(rental.start_date).toLocaleDateString('fr-FR')}</span>
                          <span>Au {new Date(rental.end_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-lg">{rental.total_price} EUR</span>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${status.color}`}>{status.icon} {status.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

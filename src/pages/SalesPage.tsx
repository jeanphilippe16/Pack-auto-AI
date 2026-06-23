import { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, MessageSquare, Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Sale, Page } from '../types';

interface SalesPageProps {
  onNavigate: (page: Page, carId?: string) => void;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'text-amber-400 bg-amber-500/20', icon: <Clock size={14} /> },
  negotiating: { label: 'Negociation', color: 'text-blue-400 bg-blue-500/20', icon: <MessageSquare size={14} /> },
  accepted: { label: 'Acceptee', color: 'text-emerald-400 bg-emerald-500/20', icon: <CheckCircle size={14} /> },
  rejected: { label: 'Refusee', color: 'text-red-400 bg-red-500/20', icon: <XCircle size={14} /> },
};

export default function SalesPage({ onNavigate }: SalesPageProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSales(); }, []);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase.from('sales').select('*, car:cars(*)').order('created_at', { ascending: false });
    if (!error && data) setSales(data as unknown as Sale[]);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><DollarSign size={28} className="text-blue-400" />Gestion des ventes</h1>
            <p className="text-slate-400 mt-1">{sales.length} offre(s)</p>
          </div>
          <button onClick={() => onNavigate('catalog')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">Voir le catalogue</button>
        </div>
        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-28 animate-pulse" />))}</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16"><DollarSign size={48} className="mx-auto text-slate-600 mb-4" /><p className="text-slate-400 text-lg">Aucune offre d'achat</p><button onClick={() => onNavigate('catalog')} className="mt-4 text-blue-400 hover:underline text-sm">Explorer le catalogue</button></div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => {
              const status = STATUS_MAP[sale.status] || STATUS_MAP.pending;
              return (
                <div key={sale.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                        {sale.car?.image_url ? <img src={sale.car.image_url} alt="" className="w-full h-full object-cover rounded-xl" /> : <Car size={24} />}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{sale.car?.brand} {sale.car?.model}</h3>
                        <p className="text-slate-400 text-sm">{sale.customer_name} - {sale.customer_email}</p>
                        {sale.message && <p className="text-slate-500 text-xs mt-1 line-clamp-1">{sale.message}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-lg">{sale.offered_price.toLocaleString('fr-FR')} EUR</span>
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

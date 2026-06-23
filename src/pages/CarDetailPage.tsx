import { useState, useEffect } from 'react';
import { ArrowLeft, Fuel, Settings2, Users, Calendar, Gauge, KeyRound, DollarSign, Sparkles, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Car, Page } from '../types';

interface CarDetailPageProps {
  carId: string;
  onNavigate: (page: Page) => void;
}

export default function CarDetailPage({ carId, onNavigate }: CarDetailPageProps) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'rent' | 'buy'>('info');
  const [rentForm, setRentForm] = useState({ name: '', email: '', phone: '', startDate: '', endDate: '' });
  const [buyForm, setBuyForm] = useState({ name: '', email: '', phone: '', price: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  useEffect(() => { fetchCar(); }, [carId]);

  async function fetchCar() {
    setLoading(true);
    const { data } = await supabase.from('cars').select('*').eq('id', carId).maybeSingle();
    if (data) {
      setCar(data as Car);
      if ((data as Car).price_sale > 0) setBuyForm((f) => ({ ...f, price: String((data as Car).price_sale) }));
    }
    setLoading(false);
  }

  async function fetchRecommendation() {
    if (!car) return;
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({ carId: car.id, criteria: `${car.brand} ${car.model} ${car.category} ${car.fuel_type}` }),
      });
      if (res.ok) { const data = await res.json(); setRecommendation(data.recommendation || null); return; }
    } catch { /* fallback */ }
    setRecommendation(`Le ${car.brand} ${car.model} est un excellent choix dans la categorie ${car.category}. Moteur ${car.fuel_type}, transmission ${car.transmission}, ${car.seats} places. Un bon equilibre confort/performance.`);
  }

  async function handleRentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!car) return;
    setSubmitting(true);
    const days = rentForm.startDate && rentForm.endDate ? Math.max(1, Math.ceil((new Date(rentForm.endDate).getTime() - new Date(rentForm.startDate).getTime()) / 86400000)) : 1;
    const { error } = await supabase.from('rentals').insert({
      car_id: car.id, customer_name: rentForm.name, customer_email: rentForm.email, customer_phone: rentForm.phone,
      start_date: rentForm.startDate, end_date: rentForm.endDate, total_price: days * car.price_rental_daily, status: 'pending',
    });
    if (!error) setSuccess(true);
    setSubmitting(false);
  }

  async function handleBuySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!car) return;
    setSubmitting(true);
    const { error } = await supabase.from('sales').insert({
      car_id: car.id, customer_name: buyForm.name, customer_email: buyForm.email, customer_phone: buyForm.phone,
      offered_price: parseFloat(buyForm.price) || car.price_sale, message: buyForm.message, status: 'pending',
    });
    if (!error) setSuccess(true);
    setSubmitting(false);
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>;
  if (!car) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4"><p className="text-slate-400 text-lg">Vehicule non trouve</p><button onClick={() => onNavigate('catalog')} className="text-emerald-400 hover:underline">Retour au catalogue</button></div>;

  return (
    <div className="min-h-screen bg-slate-950 pt-4 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate('catalog')} className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 text-sm mb-6 transition-colors"><ArrowLeft size={16} /> Retour au catalogue</button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">
          <div className="h-64 sm:h-80 bg-slate-800 relative">
            {car.image_url ? <img src={car.image_url} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl font-bold">{car.brand} {car.model}</div>}
            <div className="absolute top-4 left-4 flex gap-2">
              {(car.type === 'rental' || car.type === 'both') && <span className="px-3 py-1 bg-emerald-500/90 text-white text-sm font-medium rounded-lg">Location</span>}
              {(car.type === 'sale' || car.type === 'both') && <span className="px-3 py-1 bg-blue-500/90 text-white text-sm font-medium rounded-lg">Vente</span>}
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{car.brand} {car.model}</h1>
            <p className="text-slate-400 text-sm mb-6">{car.year} - {car.category}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { icon: <Fuel size={18} />, label: 'Carburant', value: car.fuel_type },
                { icon: <Settings2 size={18} />, label: 'Transmission', value: car.transmission },
                { icon: <Users size={18} />, label: 'Places', value: `${car.seats}` },
                { icon: <Gauge size={18} />, label: 'Kilometrage', value: `${car.mileage.toLocaleString('fr-FR')} km` },
              ].map((spec) => (
                <div key={spec.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-emerald-400 mb-1 flex justify-center">{spec.icon}</div>
                  <div className="text-white text-sm font-medium">{spec.value}</div>
                  <div className="text-slate-500 text-xs">{spec.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              {(car.type === 'rental' || car.type === 'both') && (
                <div className="flex-1 min-w-[200px] p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1"><KeyRound size={16} /> Location</div>
                  <div className="text-2xl font-bold text-white">{car.price_rental_daily} <span className="text-sm text-slate-400">/jour</span></div>
                </div>
              )}
              {(car.type === 'sale' || car.type === 'both') && (
                <div className="flex-1 min-w-[200px] p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-400 text-sm mb-1"><DollarSign size={16} /> Vente</div>
                  <div className="text-2xl font-bold text-white">{car.price_sale.toLocaleString('fr-FR')} <span className="text-sm text-slate-400">EUR</span></div>
                </div>
              )}
            </div>
            {car.description && <div className="mb-6"><h3 className="text-white font-semibold mb-2">Description</h3><p className="text-slate-300 text-sm leading-relaxed">{car.description}</p></div>}
            {car.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Equipements</h3>
                <div className="flex flex-wrap gap-2">{car.features.map((f) => (<span key={f} className="flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"><Check size={10} className="text-emerald-400" />{f}</span>))}</div>
              </div>
            )}
            <div className="mb-6">
              <button onClick={fetchRecommendation} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors">
                <Sparkles size={16} /> Obtenir une recommandation IA
              </button>
              {recommendation && <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{recommendation}</p></div>}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-slate-800">
            <TabBtn active={activeTab === 'info'} onClick={() => setActiveTab('info')}>Informations</TabBtn>
            {(car.type === 'rental' || car.type === 'both') && <TabBtn active={activeTab === 'rent'} onClick={() => setActiveTab('rent')}><KeyRound size={14} /> Louer</TabBtn>}
            {(car.type === 'sale' || car.type === 'both') && <TabBtn active={activeTab === 'buy'} onClick={() => setActiveTab('buy')}><DollarSign size={14} /> Acheter</TabBtn>}
          </div>
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-emerald-400" /></div>
                <h3 className="text-xl font-semibold text-white mb-2">Demande envoyee !</h3>
                <p className="text-slate-400 text-sm">Nous vous contacterons sous 24h.</p>
                <button onClick={() => onNavigate('catalog')} className="mt-4 text-emerald-400 hover:underline text-sm">Retour au catalogue</button>
              </div>
            ) : activeTab === 'rent' ? (
              <form onSubmit={handleRentSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Reserver la location</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Nom complet" value={rentForm.name} onChange={(v) => setRentForm({ ...rentForm, name: v })} required />
                  <InputField label="Email" type="email" value={rentForm.email} onChange={(v) => setRentForm({ ...rentForm, email: v })} required />
                  <InputField label="Telephone" value={rentForm.phone} onChange={(v) => setRentForm({ ...rentForm, phone: v })} required />
                  <InputField label="Date debut" type="date" value={rentForm.startDate} onChange={(v) => setRentForm({ ...rentForm, startDate: v })} required icon={<Calendar size={14} />} />
                  <InputField label="Date fin" type="date" value={rentForm.endDate} onChange={(v) => setRentForm({ ...rentForm, endDate: v })} required icon={<Calendar size={14} />} />
                </div>
                {rentForm.startDate && rentForm.endDate && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <span className="text-emerald-400 font-semibold">Total: {Math.max(1, Math.ceil((new Date(rentForm.endDate).getTime() - new Date(rentForm.startDate).getTime()) / 86400000)) * car.price_rental_daily} EUR</span>
                    <span className="text-slate-400 text-sm ml-2">({Math.max(1, Math.ceil((new Date(rentForm.endDate).getTime() - new Date(rentForm.startDate).getTime()) / 86400000))} jours x {car.price_rental_daily}/jour)</span>
                  </div>
                )}
                <button type="submit" disabled={submitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">{submitting ? 'Envoi...' : 'Confirmer la reservation'}</button>
              </form>
            ) : activeTab === 'buy' ? (
              <form onSubmit={handleBuySubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Faire une offre d'achat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Nom complet" value={buyForm.name} onChange={(v) => setBuyForm({ ...buyForm, name: v })} required />
                  <InputField label="Email" type="email" value={buyForm.email} onChange={(v) => setBuyForm({ ...buyForm, email: v })} required />
                  <InputField label="Telephone" value={buyForm.phone} onChange={(v) => setBuyForm({ ...buyForm, phone: v })} required />
                  <InputField label="Prix propose (EUR)" type="number" value={buyForm.price} onChange={(v) => setBuyForm({ ...buyForm, price: v })} required />
                </div>
                <div><label className="text-sm text-slate-400 mb-1 block">Message (optionnel)</label><textarea value={buyForm.message} onChange={(e) => setBuyForm({ ...buyForm, message: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 resize-none" placeholder="Conditions souhaitees..." /></div>
                <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">{submitting ? 'Envoi...' : "Envoyer l'offre"}</button>
              </form>
            ) : <p className="text-slate-400 text-sm">Selectionnez un onglet pour louer ou acheter ce vehicule.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-colors ${active ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}>{children}</button>;
}

function InputField({ label, type = 'text', value, onChange, required = false, icon }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-1 block">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className={`w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 ${icon ? 'pl-10' : ''}`} />
      </div>
    </div>
  );
}

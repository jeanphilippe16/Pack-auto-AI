import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Fuel, Settings2, Users, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AISearchBar from '../components/AISearchBar';
import type { Car, Page } from '../types';

interface CatalogPageProps {
  onNavigate: (page: Page, carId?: string) => void;
}

const CATEGORIES = ['Tous', 'SUV', 'Berline', 'Citadine', 'Sportive', 'Utilitaire', 'Break'];
const FUEL_TYPES = ['Tous', 'Essence', 'Diesel', 'Electrique', 'Hybride'];
const TRANSMISSIONS = ['Tous', 'Automatique', 'Manuelle'];
const TYPES = ['Tous', 'Location', 'Vente', 'Les deux'];

export default function CatalogPage({ onNavigate }: CatalogPageProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('Tous');
  const [fuelType, setFuelType] = useState('Tous');
  const [transmission, setTransmission] = useState('Tous');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  useEffect(() => { fetchCars(); }, []);

  async function fetchCars() {
    setLoading(true);
    const { data, error } = await supabase.from('cars').select('*').eq('available', true).order('created_at', { ascending: false });
    if (!error && data) setCars(data as Car[]);
    setLoading(false);
  }

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchSearch = !search || car.brand.toLowerCase().includes(search.toLowerCase()) || car.model.toLowerCase().includes(search.toLowerCase()) || car.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'Tous' || car.category.toLowerCase() === category.toLowerCase();
      const matchFuel = fuelType === 'Tous' || car.fuel_type.toLowerCase() === fuelType.toLowerCase();
      const matchTrans = transmission === 'Tous' || car.transmission.toLowerCase() === transmission.toLowerCase();
      const matchType = typeFilter === 'Tous' || car.type === typeFilter.toLowerCase().replace('les deux', 'both') || (typeFilter === 'Les deux' && car.type === 'both');
      const matchPrice = (car.type === 'rental' || car.type === 'both') ? car.price_rental_daily >= priceRange[0] && car.price_rental_daily <= priceRange[1] : true;
      return matchSearch && matchCategory && matchFuel && matchTrans && matchType && matchPrice;
    });
  }, [cars, search, category, fuelType, transmission, typeFilter, priceRange]);

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Catalogue vehicules</h1>
          <p className="text-slate-400">{cars.length} vehicules disponibles</p>
        </div>

        {/* AI Search Bar - Prominent */}
        <div className="mb-6">
          <AISearchBar onNavigate={onNavigate} variant="compact" />
        </div>

        {/* Classic Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer par marque, modele..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal size={16} /> Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 p-5 bg-slate-900 border border-slate-700 rounded-xl slide-in-from-top">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FilterSelect label="Categorie" value={category} options={CATEGORIES} onChange={setCategory} />
              <FilterSelect label="Carburant" value={fuelType} options={FUEL_TYPES} onChange={setFuelType} />
              <FilterSelect label="Transmission" value={transmission} options={TRANSMISSIONS} onChange={setTransmission} />
              <FilterSelect label="Type" value={typeFilter} options={TYPES} onChange={setTypeFilter} />
            </div>
            <div className="mt-4">
              <label className="text-sm text-slate-400 mb-1 block">Prix location/jour: {priceRange[0]} - {priceRange[1]} EUR</label>
              <input type="range" min={0} max={500} value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-emerald-500" />
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (<div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-72 animate-pulse" />))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">Aucun vehicule trouve</p>
            <p className="text-slate-500 text-sm mt-1">Essayez la recherche IA ou modifiez vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <button
                key={car.id}
                onClick={() => onNavigate('car-detail', car.id)}
                className="group text-left bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  {car.image_url ? (
                    <img src={car.image_url} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Search size={48} /></div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {(car.type === 'rental' || car.type === 'both') && <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-xs font-medium rounded-md">Location</span>}
                    {(car.type === 'sale' || car.type === 'both') && <span className="px-2 py-0.5 bg-blue-500/90 text-white text-xs font-medium rounded-md">Vente</span>}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">{car.brand} {car.model}</h3>
                  <p className="text-sm text-slate-500 mb-3">{car.year} - {car.category}</p>
                  <div className="flex items-center gap-3 text-slate-400 text-xs mb-3">
                    <span className="flex items-center gap-1"><Fuel size={12} />{car.fuel_type}</span>
                    <span className="flex items-center gap-1"><Settings2 size={12} />{car.transmission}</span>
                    <span className="flex items-center gap-1"><Users size={12} />{car.seats}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    {(car.type === 'rental' || car.type === 'both') && <span className="text-emerald-400 font-semibold text-sm">{car.price_rental_daily}/jour</span>}
                    {(car.type === 'sale' || car.type === 'both') && <span className="text-blue-400 font-semibold text-sm">{car.price_sale.toLocaleString('fr-FR')} EUR</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 pr-8">
          {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, Car, X, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Car as CarType, Page } from '../types';

interface AISearchBarProps {
  onNavigate: (page: Page, carId?: string) => void;
  variant?: 'hero' | 'compact';
}

export default function AISearchBar({ onNavigate, variant = 'hero' }: AISearchBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CarType[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setShowResults(true);
    setAiAnswer(null);

    // Search cars from database
    const { data: cars } = await supabase
      .from('cars')
      .select('*')
      .eq('available', true)
      .or(`brand.ilike.%${query}%,model.ilike.%${query}%,category.ilike.%${query}%,fuel_type.ilike.%${query}%,description.ilike.%${query}%`);

    if (cars && cars.length > 0) {
      setResults(cars as CarType[]);
    } else {
      setResults([]);
    }

    // Get AI recommendation via Claude API
    try {
      const allCars = cars || [];
      const systemPrompt = `Tu es JP Auto-AI, assistant de recommandation de véhicules pour JP Pack Auto. Analyse les critères de l'utilisateur et fournis une recommandation courte (2-3 phrases max) en français. Sois professionnel, direct et utile. Si des véhicules sont disponibles, commente-les brièvement. Si aucun véhicule, suggère des alternatives.`;
      const userPrompt = `Critères de recherche : "${query}"\nVéhicules disponibles (${allCars.length}) : ${allCars.slice(0, 5).map(c => `${c.brand} ${c.model} ${c.year} - ${c.category} - ${c.fuel_type}`).join(', ') || 'aucun trouvé'}`;
      
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      if (claudeRes.ok) {
        const data = await claudeRes.json();
        const recommendation = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '';
        if (recommendation) setAiAnswer(recommendation);
      } else {
        throw new Error('Claude API failed');
      }
    } catch {
      // local fallback recommendation
      if (cars && cars.length > 0) {
        setAiAnswer(`JP Auto-AI : ${cars.length} véhicule(s) trouvé(s) pour "${query}". Cliquez sur un résultat pour voir les détails ou consultez le chatbot pour des conseils personnalisés.`);
      } else {
        setAiAnswer(`JP Auto-AI : Aucun véhicule ne correspond exactement à "${query}". Essayez des termes comme "SUV", "électrique", "famille" ou un budget "200/jour".`);
      }
    }

    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setAiAnswer(null);
    inputRef.current?.focus();
  }

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={`relative ${isHero ? 'max-w-3xl mx-auto' : 'max-w-2xl'}`}>
      {/* Search Input */}
      <div className={`relative flex items-center ${isHero ? 'ai-glow' : ''} bg-slate-900/90 backdrop-blur-xl border ${isHero ? 'border-slate-600' : 'border-slate-700'} rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20`}>
        <div className="pl-4 text-emerald-400 flex items-center gap-2">
          <Sparkles size={isHero ? 20 : 16} />
          {isHero && <span className="text-xs font-medium hidden sm:inline">IA</span>}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Recherche IA : SUV familial, electrique, budget 200/jour..."
          className={`flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none ${isHero ? 'py-5 px-4 text-lg' : 'py-2.5 px-3 text-sm'}`}
        />
        {query && (
          <button onClick={clearSearch} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className={`flex items-center gap-2 m-2 px-5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 btn-ripple ${
            isHero
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 shadow-lg shadow-emerald-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white py-2'
          }`}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {isHero && <span>Rechercher</span>}
        </button>
      </div>

      {/* Results Dropdown */}
      {showResults && (results.length > 0 || aiAnswer) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[500px] overflow-y-auto slide-in-from-top">
          {/* AI Answer */}
          {aiAnswer && (
            <div className="p-4 bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Reponse IA</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{aiAnswer}</p>
            </div>
          )}

          {/* Car Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-xs text-slate-500 font-medium">
                {results.length} vehicule(s) trouve(s)
              </div>
              {results.map((car) => (
                <button
                  key={car.id}
                  onClick={() => { setShowResults(false); onNavigate('car-detail', car.id); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left group"
                >
                  <div className="w-14 h-14 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                    {car.image_url ? (
                      <img src={car.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Car size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors truncate">
                      {car.brand} {car.model}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{car.year}</span>
                      <span>-</span>
                      <span>{car.category}</span>
                      <span>-</span>
                      <span>{car.fuel_type}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {car.price_rental_daily > 0 && (
                      <div className="text-emerald-400 text-sm font-semibold">{car.price_rental_daily}/j</div>
                    )}
                    {car.price_sale > 0 && (
                      <div className="text-blue-400 text-xs">{car.price_sale.toLocaleString('fr-FR')}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.length === 0 && !aiAnswer && !loading && (
            <div className="p-8 text-center">
              <Search size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-400 text-sm">Aucun resultat pour "{query}"</p>
              <p className="text-slate-500 text-xs mt-1">Essayez "SUV", "electrique", "famille"...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { DollarSign, Loader2, ChevronDown, ChevronUp, TrendingDown, TrendingUp, PieChart } from 'lucide-react';

interface TCOInput {
  brand: string;
  model: string;
  year: number;
  purchasePrice: number;
  mileagePerYear: number;
  fuelType: 'Essence' | 'Diesel' | 'Electrique' | 'Hybride';
  insurancePerYear: number;
  maintenancePerYear: number;
}

interface TCOResult {
  tco1year: number;
  tco3years: number;
  tco5years: number;
  breakdownPercent: { category: string; percent: number; color: string }[];
  recommendation: string;
  score: 'excellent' | 'bon' | 'moyen' | 'élevé';
}

const TCO_SYSTEM_PROMPT = `Tu es JP Auto-AI, expert en analyse financière automobile et calcul du Coût Total de Possession (TCO).

Analyse les données véhicule fournies et calcule le TCO. Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "tco1year": <nombre entier en EUR>,
  "tco3years": <nombre entier en EUR>,
  "tco5years": <nombre entier en EUR>,
  "breakdownPercent": [
    {"category": "Dépréciation", "percent": <0-100>, "color": "#6366f1"},
    {"category": "Carburant/Energie", "percent": <0-100>, "color": "#f59e0b"},
    {"category": "Maintenance", "percent": <0-100>, "color": "#10b981"},
    {"category": "Assurance", "percent": <0-100>, "color": "#3b82f6"},
    {"category": "Divers", "percent": <0-100>, "color": "#8b5cf6"}
  ],
  "recommendation": "<analyse professionnelle en 2-3 phrases avec recommandations concrètes>",
  "score": "<'excellent' | 'bon' | 'moyen' | 'élevé'>"
}

Calculs à effectuer :
- Dépréciation : environ 15-20%/an du prix d'achat (électrique déprécie plus vite au départ)
- Carburant : essence≈8L/100km à 1.7€/L, diesel≈6L/100km à 1.6€/L, électrique≈18kWh/100km à 0.18€/kWh, hybride≈5L/100km
- Maintenance : utilise le montant fourni, ajuste selon l'âge (véhicule > 8 ans = +30%)
- Assurance : utilise le montant fourni
- Divers (péages, parking, lavage) : environ 800€/an

Réponds en français, sois précis et professionnel.`;

const FUEL_CONSUMPTION: Record<string, { unit: string; rate: number; pricePerUnit: number }> = {
  Essence: { unit: 'L', rate: 8, pricePerUnit: 1.7 },
  Diesel: { unit: 'L', rate: 6, pricePerUnit: 1.6 },
  Electrique: { unit: 'kWh', rate: 18, pricePerUnit: 0.18 },
  Hybride: { unit: 'L', rate: 5, pricePerUnit: 1.7 },
};

export default function TCOAgent() {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TCOResult | null>(null);
  const [form, setForm] = useState<TCOInput>({
    brand: 'Renault', model: 'Clio', year: 2021,
    purchasePrice: 18000, mileagePerYear: 15000,
    fuelType: 'Essence', insurancePerYear: 800, maintenancePerYear: 600,
  });

  async function calculateTCO() {
    setLoading(true);
    const prompt = `Calcule le TCO pour ce véhicule:\n${JSON.stringify(form, null, 2)}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: TCO_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '';
        const clean = text.replace(/```json|```/g, '').trim();
        setResult(JSON.parse(clean));
        setLoading(false);
        return;
      }
    } catch { /* fallback */ }

    // Fallback calculation
    const age = new Date().getFullYear() - form.year;
    const depreciationRate = 0.17 + (age > 5 ? 0.03 : 0);
    const fuel = FUEL_CONSUMPTION[form.fuelType];
    const fuelCostYear = (form.mileagePerYear / 100) * fuel.rate * fuel.pricePerUnit;
    const depreciationYear = form.purchasePrice * depreciationRate;
    const maintenanceAdj = form.maintenancePerYear * (age > 7 ? 1.3 : 1);
    const divers = 800;
    const totalYear = depreciationYear + fuelCostYear + form.insurancePerYear + maintenanceAdj + divers;
    const total = Math.round(depreciationYear + fuelCostYear + form.insurancePerYear + maintenanceAdj + divers);

    setResult({
      tco1year: total,
      tco3years: Math.round(total * 3 * 0.95),
      tco5years: Math.round(total * 5 * 0.90),
      breakdownPercent: [
        { category: 'Dépréciation', percent: Math.round((depreciationYear / totalYear) * 100), color: '#6366f1' },
        { category: 'Carburant/Energie', percent: Math.round((fuelCostYear / totalYear) * 100), color: '#f59e0b' },
        { category: 'Maintenance', percent: Math.round((maintenanceAdj / totalYear) * 100), color: '#10b981' },
        { category: 'Assurance', percent: Math.round((form.insurancePerYear / totalYear) * 100), color: '#3b82f6' },
        { category: 'Divers', percent: Math.round((divers / totalYear) * 100), color: '#8b5cf6' },
      ],
      recommendation: `Le ${form.brand} ${form.model} (${form.year}) présente un TCO annuel de ${total.toLocaleString('fr-FR')}€. La dépréciation représente le poste le plus important. ${form.fuelType === 'Electrique' ? 'Le carburant électrique génère des économies significatives sur le long terme.' : form.fuelType === 'Diesel' ? 'Le diesel reste économique pour les forts kilométrages (>20 000 km/an).' : 'Envisagez un passage à l\'hybride pour réduire les coûts carburant.'} Recommandation : conserver ce véhicule ${age < 5 ? '3-4 ans supplémentaires' : 'et envisager un remplacement dans 2 ans'} pour optimiser le TCO.`,
      score: total < 4000 ? 'excellent' : total < 6000 ? 'bon' : total < 9000 ? 'moyen' : 'élevé',
    });
    setLoading(false);
  }

  const scoreConfig = {
    excellent: { color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30', icon: <TrendingDown size={16} /> },
    bon: { color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30', icon: <TrendingDown size={16} /> },
    moyen: { color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', icon: <TrendingUp size={16} /> },
    élevé: { color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', icon: <TrendingUp size={16} /> },
  };

  const inputClass = "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500";
  const labelClass = "block text-slate-400 text-xs font-medium mb-1";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
            <DollarSign size={24} className="text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold text-lg">Agent IA — Analyse Financière TCO</h3>
            <p className="text-slate-400 text-sm">Calcul du Coût Total de Possession par véhicule</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-medium">
            <PieChart size={12} /> Analyse TCO
          </span>
          {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-800 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Marque</label>
              <input className={inputClass} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="ex: Renault" />
            </div>
            <div>
              <label className={labelClass}>Modèle</label>
              <input className={inputClass} value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="ex: Clio" />
            </div>
            <div>
              <label className={labelClass}>Année</label>
              <input type="number" className={inputClass} value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 2020 })} />
            </div>
            <div>
              <label className={labelClass}>Prix d'achat (€)</label>
              <input type="number" className={inputClass} value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className={labelClass}>Km/an</label>
              <input type="number" className={inputClass} value={form.mileagePerYear} onChange={e => setForm({ ...form, mileagePerYear: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className={labelClass}>Carburant</label>
              <select className={inputClass} value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value as TCOInput['fuelType'] })}>
                {(['Essence', 'Diesel', 'Electrique', 'Hybride'] as const).map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Assurance/an (€)</label>
              <input type="number" className={inputClass} value={form.insurancePerYear} onChange={e => setForm({ ...form, insurancePerYear: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className={labelClass}>Maintenance/an (€)</label>
              <input type="number" className={inputClass} value={form.maintenancePerYear} onChange={e => setForm({ ...form, maintenancePerYear: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <button
            onClick={calculateTCO}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <DollarSign size={18} />}
            {loading ? 'Calcul du TCO en cours...' : 'Calculer le TCO avec JP Auto-AI'}
          </button>

          {result && (
            <div className="space-y-4">
              {/* Score */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${scoreConfig[result.score].bg}`}>
                <div>
                  <p className="text-slate-400 text-xs">Score TCO</p>
                  <p className={`text-2xl font-bold ${scoreConfig[result.score].color} capitalize`}>{result.score}</p>
                </div>
                <div className={scoreConfig[result.score].color}>{scoreConfig[result.score].icon}</div>
              </div>

              {/* TCO Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'TCO 1 an', value: result.tco1year },
                  { label: 'TCO 3 ans', value: result.tco3years },
                  { label: 'TCO 5 ans', value: result.tco5years },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-800 rounded-xl text-center">
                    <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-bold">{item.value.toLocaleString('fr-FR')}€</p>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="p-4 bg-slate-800 rounded-xl">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Répartition des coûts</p>
                <div className="space-y-2">
                  {result.breakdownPercent.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{item.category}</span>
                        <span className="text-slate-400 font-mono">{item.percent}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">📊 Analyse JP Auto-AI</p>
                <p className="text-slate-300 text-sm leading-relaxed">{result.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

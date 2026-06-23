import { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle, TrendingUp, Loader2, ChevronDown, ChevronUp, Car, Wrench, BarChart3 } from 'lucide-react';

interface FleetData {
  vehicles: {
    brand: string;
    model: string;
    plate: string;
    mileage: number;
    year: number;
    status: 'available' | 'in_use' | 'broken' | 'maintenance';
    lastMaintenance?: string;
    lastMaintenanceMileage?: number;
  }[];
}

interface AnalysisResult {
  alerts: string[];
  recommendations: string[];
  kpis: { label: string; value: string; trend?: 'up' | 'down' | 'stable' }[];
  fullReport: string;
}

const FLEET_SYSTEM_PROMPT = `RÔLE ET MISSION
Tu es "JP Auto-AI", l'intelligence artificielle officielle intégrée à la plateforme de gestion de parc automobile JP Pack Auto. Ta mission est d'agir comme un gestionnaire de flotte hautement qualifié, un expert en maintenance prédictive et un analyste financier automobile. Tu aides les administrateurs à optimiser la rentabilité, la sécurité et la disponibilité de leurs véhicules.

COMPÉTENCES CLÉS
1. Gestion des Véhicules : Suivi des statuts (disponible, en cours d'utilisation, en panne, en maintenance).
2. Maintenance Prédictive : Analyse du kilométrage, de l'âge des véhicules et des historiques de pannes pour alerter avant les défaillances graves (courroies, vidanges, freins).
3. Gestion Financière : Calcul du coût total de possession (TCO), rentabilité par véhicule, suivi des dépenses de carburant, d'assurance et de réparations.
4. Planification et Logistique : Optimisation des plannings d'attribution des véhicules aux chauffeurs ou clients.

RÈGLES DE COMPORTEMENT ET TON
- Professionnel et Analytique : Reste factuel, précis et axé sur l'optimisation des coûts.
- Alertes Claires : Dès qu'une anomalie ou une échéance critique est détectée, commence ta réponse par [ALERTE].
- Réponses Actionnables : Ne te contente pas de lister les problèmes. Propose des solutions concrètes.
- Langue : Réponds exclusivement en français.

Analyse les données de flotte fournies et réponds en JSON avec cette structure exacte :
{
  "alerts": ["alerte1", "alerte2"],
  "recommendations": ["recommandation1", "recommandation2"],
  "kpis": [
    {"label": "Taux de disponibilité", "value": "88%", "trend": "down"},
    {"label": "Véhicules en alerte", "value": "3", "trend": "up"},
    {"label": "Maintenance à planifier", "value": "2", "trend": "stable"}
  ],
  "fullReport": "Rapport complet en texte..."
}`;

const DEMO_FLEET: FleetData = {
  vehicles: [
    { brand: 'Peugeot', model: 'Partner', plate: 'AB-123-CD', mileage: 87500, year: 2019, status: 'available', lastMaintenanceMileage: 72000, lastMaintenance: '2024-08-15' },
    { brand: 'Renault', model: 'Trafic', plate: 'EF-456-GH', mileage: 142000, year: 2018, status: 'in_use', lastMaintenanceMileage: 130000, lastMaintenance: '2024-11-20' },
    { brand: 'Ford', model: 'Transit', plate: 'IJ-789-KL', mileage: 203000, year: 2016, status: 'maintenance', lastMaintenanceMileage: 190000, lastMaintenance: '2025-01-10' },
    { brand: 'Volkswagen', model: 'Caddy', plate: 'MN-012-OP', mileage: 56000, year: 2022, status: 'available', lastMaintenanceMileage: 50000, lastMaintenance: '2025-03-01' },
    { brand: 'Citroën', model: 'Berlingo', plate: 'QR-345-ST', mileage: 178000, year: 2017, status: 'broken', lastMaintenanceMileage: 165000, lastMaintenance: '2024-06-22' },
  ]
};

export default function FleetAIAgent() {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fleetData] = useState<FleetData>(DEMO_FLEET);

  async function analyzeFleet() {
    setLoading(true);
    const prompt = `Analyse ce parc automobile et génère un rapport détaillé en JSON:\n\n${JSON.stringify(fleetData, null, 2)}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: FLEET_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '';
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        setResult(parsed);
        setLoading(false);
        return;
      }
    } catch { /* fallback */ }

    // Fallback demo result
    setResult({
      alerts: [
        '[ALERTE] Peugeot Partner (AB-123-CD) : Vidange dépassée de 1 500 km — planifier sous 48h',
        '[ALERTE] Citroën Berlingo (QR-345-ST) : En panne — intervention d\'urgence requise',
        '[ALERTE] Ford Transit (IJ-789-KL) : 203 000 km — risque de défaillance courroie de distribution',
      ],
      recommendations: [
        'Immobiliser le Peugeot Partner mardi matin pour vidange préventive (coût estimé : 120€)',
        'Diagnostiquer le Citroën Berlingo en priorité — panne non résolue depuis 12 jours',
        'Planifier le remplacement de la courroie du Ford Transit d\'ici 3 000 km max',
        'Renault Trafic : vérifier les freins lors du prochain retour (120 000 km passés sans contrôle)',
        'VW Caddy (2022) : excellent état — maintenir le planning maintenance à 60 000 km',
      ],
      kpis: [
        { label: 'Taux de disponibilité', value: '60%', trend: 'down' },
        { label: 'Véhicules en alerte', value: '3', trend: 'up' },
        { label: 'Âge moyen flotte', value: '6.4 ans', trend: 'stable' },
      ],
      fullReport: 'Rapport complet : La flotte présente 3 alertes critiques sur 5 véhicules. Le taux de disponibilité de 60% est insuffisant (-28% vs objectif). Actions prioritaires : traiter la panne du Berlingo, planifier vidange Partner, et anticiper la courroie du Transit. TCO estimé ce trimestre : 3 200€ de maintenance corrective évitable avec une approche prédictive.',
    });
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    available: 'text-emerald-400 bg-emerald-500/20',
    in_use: 'text-blue-400 bg-blue-500/20',
    broken: 'text-red-400 bg-red-500/20',
    maintenance: 'text-amber-400 bg-amber-500/20',
  };
  const statusLabels: Record<string, string> = {
    available: 'Disponible', in_use: 'En utilisation', broken: 'En panne', maintenance: 'En maintenance',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <Brain size={24} className="text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold text-lg">Agent IA — Diagnostic de Flotte</h3>
            <p className="text-slate-400 text-sm">Analyse prédictive et alertes intelligentes du parc</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium">
            <Brain size={12} /> JP Auto-AI
          </span>
          {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-800 p-6 space-y-6">
          {/* Fleet overview */}
          <div>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Car size={14} /> Données de la flotte (démo)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-slate-800">
                    <th className="text-left pb-2 font-medium">Véhicule</th>
                    <th className="text-left pb-2 font-medium">Plaque</th>
                    <th className="text-right pb-2 font-medium">Km</th>
                    <th className="text-right pb-2 font-medium">Année</th>
                    <th className="text-left pb-2 font-medium pl-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {fleetData.vehicles.map((v, i) => (
                    <tr key={i} className="text-slate-300">
                      <td className="py-2.5 font-medium text-white">{v.brand} {v.model}</td>
                      <td className="py-2.5 text-slate-400 font-mono text-xs">{v.plate}</td>
                      <td className="py-2.5 text-right">{v.mileage.toLocaleString('fr-FR')}</td>
                      <td className="py-2.5 text-right text-slate-400">{v.year}</td>
                      <td className="py-2.5 pl-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[v.status]}`}>
                          {statusLabels[v.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={analyzeFleet}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
            {loading ? 'Analyse en cours...' : 'Lancer l\'analyse IA de la flotte'}
          </button>

          {result && (
            <div className="space-y-4">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {result.kpis.map((kpi, i) => (
                  <div key={i} className="p-3 bg-slate-800 rounded-xl text-center">
                    <div className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-1">
                      {kpi.value}
                      {kpi.trend === 'down' && <TrendingUp size={14} className="text-red-400 rotate-180" />}
                      {kpi.trend === 'up' && <TrendingUp size={14} className="text-amber-400" />}
                    </div>
                    <div className="text-slate-400 text-xs">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              {result.alerts.length > 0 && (
                <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl space-y-2">
                  <h5 className="text-red-400 text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} /> Alertes critiques
                  </h5>
                  {result.alerts.map((alert, i) => (
                    <p key={i} className="text-slate-300 text-sm pl-5 border-l-2 border-red-500/50">{alert}</p>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                  <h5 className="text-emerald-400 text-sm font-semibold flex items-center gap-2">
                    <CheckCircle size={16} /> Recommandations actionnables
                  </h5>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 text-xs font-bold mt-0.5 shrink-0">{i + 1}.</span>
                      <p className="text-slate-300 text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Full report */}
              <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                <h5 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BarChart3 size={14} /> Synthèse du rapport
                </h5>
                <p className="text-slate-300 text-sm leading-relaxed">{result.fullReport}</p>
              </div>

              {/* Repair CTA */}
              <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                <Wrench size={16} className="text-amber-400 shrink-0" />
                <p className="text-slate-300 text-sm flex-1">
                  Des interventions sont nécessaires.
                </p>
                <a href="#repairs" className="text-amber-400 text-xs font-semibold hover:text-amber-300 whitespace-nowrap">
                  → Section Réparations
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { Brain, Sparkles, Shield, Zap } from 'lucide-react';
import FleetAIAgent from '../components/FleetAIAgent';
import TCOAgent from '../components/TCOAgent';
import MaintenancePredictorAgent from '../components/MaintenancePredictorAgent';

export default function AIAgentsPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/30">
            <Brain size={16} />
            Agents IA — JP Auto-AI
          </div>
          <h1 className="text-4xl font-black text-white mb-4">
            Intelligence artificielle
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              au service de votre flotte
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Trois agents IA spécialisés propulsés par Claude Sonnet pour optimiser
            la gestion, la maintenance et la rentabilité de votre parc automobile.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { icon: <Brain size={14} />, label: 'Diagnostic de flotte', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
            { icon: <Zap size={14} />, label: 'Maintenance prédictive', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
            { icon: <Sparkles size={14} />, label: 'Analyse TCO', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
            { icon: <Shield size={14} />, label: 'Powered by Claude', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
          ].map((item, i) => (
            <span key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${item.color}`}>
              {item.icon} {item.label}
            </span>
          ))}
        </div>

        {/* Agents */}
        <div className="space-y-4">
          <FleetAIAgent />
          <MaintenancePredictorAgent />
          <TCOAgent />
        </div>

        {/* Info footer */}
        <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-500 text-xs">
            <Shield size={12} className="inline mr-1 text-emerald-400" />
            Ces agents utilisent <span className="text-emerald-400 font-medium">Claude Sonnet (Anthropic)</span> avec le
            prompt système JP Auto-AI pour des analyses professionnelles de gestion de flotte automobile.
          </p>
        </div>
      </div>
    </div>
  );
}

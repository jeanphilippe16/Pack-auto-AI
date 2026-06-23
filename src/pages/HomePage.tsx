import { useEffect, useRef, useState } from 'react';
import { KeyRound, DollarSign, Wrench, Sparkles, ArrowRight, Shield, Star, Car, Brain, Zap, BarChart3, CheckCircle, ChevronRight } from 'lucide-react';
import AISearchBar from '../components/AISearchBar';
import type { Page } from '../types';

interface HomePageProps {
  onNavigate: (page: Page, carId?: string) => void;
}

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Floating particle ── */
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div className="particle absolute rounded-full opacity-30" style={style} />
  );
}

const TESTIMONIALS = [
  { text: 'Service impeccable, la recherche IA m\'a trouvé le SUV parfait en 30 secondes !', author: 'Marie D.', role: 'Cliente location' },
  { text: 'J\'ai acheté ma Peugeot 308 via la plateforme. Démarches simples, voiture en parfait état.', author: 'Karim B.', role: 'Client vente' },
  { text: 'Le suivi des réparations en temps réel est vraiment pratique. Équipe très réactive.', author: 'Sophie L.', role: 'Cliente réparation' },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    const interval = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  const particles = [
    { width: 8, height: 8, top: '15%', left: '8%', background: '#10b981', '--dur': '7s', '--delay': '0s' },
    { width: 12, height: 12, top: '30%', left: '92%', background: '#3b82f6', '--dur': '9s', '--delay': '1s' },
    { width: 6, height: 6, top: '70%', left: '5%', background: '#a78bfa', '--dur': '6s', '--delay': '2s' },
    { width: 10, height: 10, top: '60%', left: '88%', background: '#10b981', '--dur': '8s', '--delay': '0.5s' },
    { width: 5, height: 5, top: '85%', left: '50%', background: '#f59e0b', '--dur': '10s', '--delay': '3s' },
    { width: 14, height: 14, top: '10%', left: '55%', background: '#3b82f6', '--dur': '11s', '--delay': '1.5s' },
  ] as React.CSSProperties[];

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center hero-mesh">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        {particles.map((p, i) => <Particle key={i} style={p} />)}

        {/* Orb deco */}
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 w-full">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-medium mb-8 border border-emerald-500/30 transition-all duration-700 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="w-2 h-2 bg-emerald-400 rounded-full badge-pulse" />
            Propulsé par JP Auto-AI · Claude Sonnet
            <Sparkles size={14} />
          </div>

          {/* Headline */}
          <div className={`transition-all duration-700 delay-100 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-none tracking-tight mb-4">
              JP Pack Auto
            </h1>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-none tracking-tight mb-8">
              <span className="gradient-text">votre garage</span>
              <br />
              <span className="text-slate-400 font-light italic text-3xl sm:text-4xl lg:text-5xl">intelligent</span>
            </h2>
          </div>

          {/* Sub */}
          <p className={`text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-200 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Trouvez le véhicule idéal, réservez en ligne, planifiez votre entretien.
            L'IA JP Auto-AI s'occupe de tout.
          </p>

          {/* Search */}
          <div className={`transition-all duration-700 delay-300 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <AISearchBar onNavigate={onNavigate} variant="hero" />
            <p className="text-slate-600 text-xs mt-4">Essayez : "SUV familial électrique" · "berline diesel automatique" · "utilitaire pas cher"</p>
          </div>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 transition-all duration-700 delay-500 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <button onClick={() => onNavigate('catalog')}
              className="group flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30 btn-ripple">
              Explorer le catalogue
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onNavigate('ai-agents')}
              className="flex items-center gap-2 px-8 py-4 glass text-white font-semibold rounded-2xl hover:border-emerald-500/40 transition-all duration-200 btn-ripple">
              <Brain size={18} className="text-emerald-400" />
              Agents IA Flotte
            </button>
          </div>

          {/* Trust line */}
          <div className={`flex items-center justify-center gap-6 mt-14 flex-wrap transition-all duration-700 delay-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {[
              { icon: <Shield size={14} />, label: 'Véhicules certifiés' },
              { icon: <CheckCircle size={14} />, label: 'Sans frais cachés' },
              { icon: <Star size={14} />, label: '98% satisfaits' },
              { icon: <Zap size={14} />, label: 'Réservation instantanée' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-500 text-xs">
                <span className="text-emerald-500">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.05),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Ce que nous faisons</p>
            <h2 className="text-4xl font-black text-white mb-4">Trois services,<br /><span className="gradient-text">une seule plateforme</span></h2>
            <p className="text-slate-400 max-w-lg mx-auto">Tout ce dont vous avez besoin pour votre mobilité automobile en un seul endroit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <KeyRound size={28} />,
                title: 'Location',
                tagline: 'Roulez dès aujourd\'hui',
                desc: 'Large choix de véhicules disponibles immédiatement. Tarifs transparents, réservation en ligne en 2 minutes.',
                page: 'rentals' as Page,
                color: 'emerald',
                gradient: 'from-emerald-900/40 to-transparent',
                border: 'border-emerald-500/20 hover:border-emerald-500/50',
                features: ['Réservation en ligne', 'Assurance incluse', 'Livraison possible'],
              },
              {
                icon: <DollarSign size={28} />,
                title: 'Vente',
                tagline: 'Trouvez votre voiture',
                desc: 'Achetez parmi notre sélection de véhicules inspectés et certifiés, avec garantie de 6 à 12 mois.',
                page: 'sales' as Page,
                color: 'blue',
                gradient: 'from-blue-900/40 to-transparent',
                border: 'border-blue-500/20 hover:border-blue-500/50',
                features: ['Véhicules certifiés', 'Garantie 6-12 mois', 'Financement dispo'],
              },
              {
                icon: <Wrench size={28} />,
                title: 'Réparation',
                tagline: 'Expertise technique',
                desc: 'Service de réparation et entretien complet. Suivi en temps réel de votre véhicule.',
                page: 'repairs' as Page,
                color: 'amber',
                gradient: 'from-amber-900/40 to-transparent',
                border: 'border-amber-500/20 hover:border-amber-500/50',
                features: ['Devis rapide', 'Suivi en temps réel', 'Toutes marques'],
              },
            ].map((s, i) => (
              <button key={s.page} onClick={() => onNavigate(s.page)}
                className={`group card-hover card-shine text-left p-8 bg-gradient-to-br ${s.gradient} bg-slate-900 border ${s.border} rounded-2xl transition-all duration-300 animate-fade-up`}
                style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  s.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                  s.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {s.icon}
                </div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${
                  s.color === 'emerald' ? 'text-emerald-500' : s.color === 'blue' ? 'text-blue-500' : 'text-amber-500'
                }`}>{s.tagline}</p>
                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2 mb-6">
                  {s.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-slate-400 text-xs">
                      <CheckCircle size={12} className={s.color === 'emerald' ? 'text-emerald-500' : s.color === 'blue' ? 'text-blue-500' : 'text-amber-500'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  s.color === 'emerald' ? 'text-emerald-400' : s.color === 'blue' ? 'text-blue-400' : 'text-amber-400'
                } opacity-0 group-hover:opacity-100 transition-all`}>
                  Découvrir <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 150, suffix: '+', label: 'Véhicules disponibles', icon: <Car size={20} /> },
              { value: 2500, suffix: '+', label: 'Locations réalisées', icon: <KeyRound size={20} /> },
              { value: 98, suffix: '%', label: 'Clients satisfaits', icon: <Star size={20} /> },
              { value: 3, suffix: ' IA', label: 'Agents JP Auto-AI', icon: <Brain size={20} /> },
            ].map((stat, i) => (
              <div key={i} className="text-center group animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-center gap-2 text-emerald-400 mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-4xl font-black text-white mb-1 stat-glow">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IA AGENTS ── */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 text-blue-400 text-sm font-medium mb-6 border border-blue-500/30">
              <Brain size={14} /> JP Auto-AI — Agents Intelligents
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Gestion de flotte<br />
              <span className="gradient-text">propulsée par l'IA</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Trois agents spécialisés pour diagnostiquer, prédire et optimiser votre parc automobile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
            {[
              { icon: <Brain size={26} />, title: 'Diagnostic de Flotte', desc: 'Analyse complète de votre parc. Alertes automatiques sur les véhicules nécessitant une intervention.', color: 'blue', features: ['Suivi statuts', 'Alertes kilométrage', 'Taux de disponibilité'] },
              { icon: <Zap size={26} />, title: 'Maintenance Prédictive', desc: 'Score de santé 0-100 pour chaque véhicule. Anticipez les pannes avant qu\'elles surviennent.', color: 'amber', features: ['Score santé', 'Alertes critique/urgent', 'Coûts estimés'] },
              { icon: <BarChart3 size={26} />, title: 'Analyse TCO', desc: 'Coût Total de Possession sur 1, 3 et 5 ans. Répartition détaillée de tous les postes de coûts.', color: 'purple', features: ['TCO 1/3/5 ans', 'Répartition coûts', 'Recommandations'] },
            ].map((agent, i) => (
              <div key={i} className={`card-hover card-shine p-6 rounded-2xl border bg-slate-900 animate-fade-up ${
                agent.color === 'blue' ? 'border-blue-500/20 hover:border-blue-500/40' :
                agent.color === 'amber' ? 'border-amber-500/20 hover:border-amber-500/40' :
                'border-purple-500/20 hover:border-purple-500/40'
              }`} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  agent.color === 'blue' ? 'bg-blue-500/15 text-blue-400' :
                  agent.color === 'amber' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-purple-500/15 text-purple-400'
                }`}>{agent.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{agent.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{agent.desc}</p>
                <ul className="space-y-1.5">
                  {agent.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-slate-500 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.color === 'blue' ? 'bg-blue-400' : agent.color === 'amber' ? 'bg-amber-400' : 'bg-purple-400'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <button onClick={() => onNavigate('ai-agents')}
              className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 btn-ripple">
              <Brain size={20} />
              Accéder aux Agents IA
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-12">Ce que disent nos clients</p>
          <div className="relative min-h-[180px]">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`absolute inset-0 transition-all duration-700 ${i === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="text-5xl text-emerald-500/30 mb-4 font-serif">"</div>
                <p className="text-slate-300 text-xl leading-relaxed mb-6 italic">{t.text}</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {t.author[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-semibold">{t.author}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-emerald-400 w-6' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST + CTA ── */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-60" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-up">
          <Shield size={52} className="text-emerald-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">Confiance et transparence</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Chaque véhicule est inspecté et certifié. Nos prix sont transparents, sans frais cachés.
            JP Auto-AI vous garantit les meilleures recommandations basées sur vos besoins réels.
          </p>
          <button onClick={() => onNavigate('catalog')}
            className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-slate-900 hover:bg-emerald-400 font-bold rounded-2xl transition-all duration-200 hover:shadow-xl btn-ripple">
            Voir tous les véhicules
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}

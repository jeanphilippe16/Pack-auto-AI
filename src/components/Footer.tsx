import { Car, Mail, Phone, MapPin, Brain, Sparkles, KeyRound, DollarSign, Wrench, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                <Car size={20} className="text-white" />
              </div>
              <span className="text-white font-black text-xl">JP Pack Auto</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">
              Plateforme complète de gestion automobile propulsée par JP Auto-AI.
              Location, vente et réparation avec une assistance intelligente 24/7.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
              <Brain size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Propulsé par JP Auto-AI · Claude Sonnet</span>
              <Sparkles size={12} className="text-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Services</h3>
            <ul className="space-y-3">
              {[
                { icon: <KeyRound size={14} />, label: 'Location de véhicules' },
                { icon: <DollarSign size={14} />, label: 'Vente de voitures' },
                { icon: <Wrench size={14} />, label: 'Réparation et entretien' },
                { icon: <Brain size={14} />, label: 'Agents IA de flotte' },
              ].map(item => (
                <li key={item.label} className="flex items-center gap-2 text-slate-400 text-sm hover:text-emerald-400 transition-colors cursor-pointer group">
                  <span className="text-slate-600 group-hover:text-emerald-500 transition-colors">{item.icon}</span>
                  {item.label}
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Contact</h3>
            <ul className="space-y-3">
              {[
                { icon: <Phone size={14} />, text: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
                { icon: <Mail size={14} />, text: 'contact@jppackauto.fr', href: 'mailto:contact@jppackauto.fr' },
                { icon: <MapPin size={14} />, text: 'Abidjan, Côte d\'Ivoire', href: '#' },
              ].map(item => (
                <li key={item.text}>
                  <a href={item.href} className="flex items-center gap-2 text-slate-400 text-sm hover:text-emerald-400 transition-colors">
                    <span className="text-slate-600">{item.icon}</span>
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">© 2026 JP Pack Auto. Tous droits réservés.</p>
          <div className="flex items-center gap-1 text-slate-600 text-xs">
            <span>Propulsé par</span>
            <span className="text-emerald-500 font-semibold">Claude Sonnet</span>
            <span>· Anthropic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

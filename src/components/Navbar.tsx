import { useState, useEffect } from 'react';
import { Car, Home, Search, KeyRound, DollarSign, Wrench, Menu, X, Brain } from 'lucide-react';
import type { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'home', label: 'Accueil', icon: <Home size={16} /> },
  { page: 'catalog', label: 'Catalogue', icon: <Search size={16} /> },
  { page: 'rentals', label: 'Location', icon: <KeyRound size={16} /> },
  { page: 'sales', label: 'Vente', icon: <DollarSign size={16} /> },
  { page: 'repairs', label: 'Réparation', icon: <Wrench size={16} /> },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav shadow-xl shadow-black/30' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/40 transition-all">
              <Car size={18} className="text-white" />
            </div>
            <span className="hidden sm:inline text-white font-black text-lg tracking-tight group-hover:text-emerald-400 transition-colors">
              JP Pack Auto
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map(({ page, label, icon }) => (
              <button key={page} onClick={() => handleNav(page)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPage === page
                    ? 'text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {icon}
                {label}
                {currentPage === page && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button onClick={() => handleNav('ai-agents')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                currentPage === 'ai-agents'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50'
              }`}
            >
              <Brain size={15} />
              <span className="hidden sm:inline">Agents IA</span>
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-nav border-t border-slate-800 px-4 py-3 space-y-1 animate-slide-in-from-top">
          {navItems.map(({ page, label, icon }) => (
            <button key={page} onClick={() => handleNav(page)}
              className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentPage === page
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {icon} {label}
            </button>
          ))}
          <button onClick={() => handleNav('ai-agents')}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all">
            <Brain size={16} /> Agents IA — JP Auto-AI
          </button>
        </div>
      )}
    </nav>
  );
}

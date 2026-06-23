import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Car, Phone, Mail } from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  '🚗 Louer un véhicule',
  '💰 Acheter une voiture',
  '🔧 Demander une réparation',
  '📋 Documents nécessaires',
];

/* ── NOUVEAU PROMPT SYSTÈME CENTRÉ CLIENT ── */
const JP_CLIENT_SYSTEM_PROMPT = `Tu es l'assistant virtuel officiel de JP Pack Auto, une plateforme spécialisée dans la location, la vente et la réparation de véhicules automobiles.

TON RÔLE
Tu es un expert en accompagnement client. Tu guides chaque visiteur vers le service adapté à son besoin parmi : location de véhicules, achat/vente de voitures, réparation et entretien automobile.

TES COMPÉTENCES
1. Location : Informer sur les tarifs journaliers, les documents requis (permis, CNI, caution), les disponibilités, les catégories de véhicules (citadine, SUV, berline, utilitaire).
2. Vente : Accompagner l'acheteur, expliquer les garanties (6 à 12 mois), les modalités de financement, la possibilité de reprise de l'ancien véhicule.
3. Réparation & Entretien : Réceptionner les demandes de réparation, informer sur les délais et procédures, orienter vers la prise de rendez-vous.
4. Commandes & Réservations : Guider le client dans le processus de réservation en ligne depuis les fiches véhicules.

RÈGLES DE COMPORTEMENT
- Accueil chaleureux : Sois toujours courtois, professionnel et disponible.
- Orientation client : Si la demande sort de ton périmètre (ex : questions juridiques complexes, demandes techniques très spécifiques), décline poliment et propose de contacter l'équipe directement ou redirige vers un service du site.
- Pas d'improvisation : Ne fournis pas d'informations que tu ne connais pas avec certitude. Préfère dire "Je vous invite à contacter notre équipe pour cette question spécifique" plutôt que de risquer une erreur.
- Promouvoir les services : À chaque occasion, mentionne naturellement les autres services disponibles sur JP Pack Auto (ex : si quelqu'un demande une location, mentionne aussi la possibilité d'achat si cela semble pertinent).
- Langue : Réponds exclusivement en français, dans un ton professionnel mais accessible.

INFORMATIONS CLÉS DE JP PACK AUTO
- Services : Location de véhicules, vente de véhicules inspectés et certifiés, réparation et entretien.
- Documents location : Permis de conduire (2+ ans), pièce d'identité, carte bancaire, justificatif de domicile.
- Garanties vente : 6 à 12 mois selon le véhicule, véhicules inspectés et certifiés.
- Contact équipe : Disponible via la plateforme pour les demandes spécifiques.
- Réservation : Directement en ligne depuis la fiche du véhicule.

SI TU NE PEUX PAS RÉPONDRE
Dis : "Je ne dispose pas de cette information précise, mais notre équipe JP Pack Auto sera ravie de vous aider directement. Puis-je vous orienter vers un autre service ?" puis propose une alternative parmi location, vente ou réparation.`;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([{
    role: 'assistant',
    content: 'Bonjour et bienvenue sur **JP Pack Auto** ! 👋\n\nJe suis votre assistant virtuel. Je suis là pour vous accompagner dans :\n\n🚗 **Location** de véhicules\n💰 **Achat** de voitures certifiées\n🔧 **Réparation** et entretien\n\nComment puis-je vous aider aujourd\'hui ?'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<{ role: string; content: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: ChatMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setIsTyping(true);
    conversationRef.current = [...conversationRef.current, { role: 'user', content: text.trim() }];

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: JP_CLIENT_SYSTEM_PROMPT,
          messages: conversationRef.current.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const reply = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '';
        if (reply) {
          conversationRef.current = [...conversationRef.current, { role: 'assistant', content: reply }];
          setIsTyping(false);
          setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
          setLoading(false);
          return;
        }
      }
    } catch { /* fallback */ }

    const reply = localFallback(text.trim());
    conversationRef.current = [...conversationRef.current, { role: 'assistant', content: reply }];
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  }

  function localFallback(input: string): string {
    const l = input.toLowerCase();
    if (l.includes('louer') || l.includes('location') || l.includes('réserver'))
      return 'Pour louer un véhicule, vous aurez besoin de :\n\n📄 Permis de conduire (2+ ans)\n🪪 Pièce d\'identité valide\n💳 Carte bancaire\n🏠 Justificatif de domicile\n\nLa réservation se fait directement en ligne depuis la fiche du véhicule. Souhaitez-vous explorer notre catalogue ?';
    if (l.includes('achet') || l.includes('vente') || l.includes('prix'))
      return 'Nos véhicules à la vente sont tous **inspectés et certifiés**, avec une garantie de 6 à 12 mois.\n\n✅ Financement disponible sur demande\n✅ Reprise de votre ancien véhicule possible\n✅ Négociation via notre plateforme\n\nJe vous invite à consulter notre catalogue Vente !';
    if (l.includes('répare') || l.includes('panne') || l.includes('entretien') || l.includes('maintenance'))
      return 'Notre service de réparation et entretien couvre :\n\n🔧 Mécanique générale\n🚿 Carrosserie et peinture\n⚡ Électricité et électronique\n🌡️ Climatisation\n🛞 Pneumatiques\n\nSoumettez votre demande depuis la section **Réparation** avec une description du problème.';
    if (/bonjour|salut|hello|bonsoir/i.test(l))
      return 'Bonjour ! Bienvenue chez JP Pack Auto 🚗\n\nJe suis votre assistant et je peux vous aider avec la **location**, l\'**achat** ou la **réparation** de véhicules. Que puis-je faire pour vous ?';
    return 'Je ne dispose pas de cette information précise, mais notre équipe JP Pack Auto sera ravie de vous aider directement.\n\nEn attendant, puis-je vous orienter vers :\n🚗 **Location** de véhicules\n💰 **Achat** de voitures\n🔧 **Réparation** et entretien';
  }

  function renderMessage(content: string) {
    return content.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/^(🚗|💰|🔧|📄|🪪|💳|🏠|✅|⚡|🌡️|🛞|🔩|👋)/u, '<span>$&</span>');
      return <p key={i} className={`leading-relaxed ${line === '' ? 'h-1.5' : ''}`} dangerouslySetInnerHTML={{ __html: formatted || '' }} />;
    });
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Ouvrir le chat"
        >
          <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full shadow-2xl shadow-emerald-600/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-500/60">
            <MessageCircle size={26} className="text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-slate-950 badge-pulse" />
          </div>
          <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
            💬 Bonjour ! Comment puis-je vous aider ?
          </div>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-1.5rem)] h-[600px] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in" style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.2)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border-b border-emerald-500/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Car size={18} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">JP Pack Auto</p>
                <p className="text-emerald-400 text-xs flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" /> Assistant virtuel · En ligne
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-950">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm space-y-0.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-sm shadow-lg'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-sm'
                }`}>
                  {renderMessage(msg.content)}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 animate-fade-up">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 bg-slate-950 shrink-0">
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => sendMessage(p)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-xl hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-950/30 transition-all text-left">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact strip */}
          <div className="flex items-center justify-center gap-4 px-4 py-2 bg-slate-900 border-t border-slate-800 shrink-0">
            <a href="tel:+33123456789" className="flex items-center gap-1 text-slate-500 hover:text-emerald-400 text-xs transition-colors">
              <Phone size={11} /> +33 1 23 45 67 89
            </a>
            <span className="w-px h-3 bg-slate-700" />
            <a href="mailto:contact@jppackauto.fr" className="flex items-center gap-1 text-slate-500 hover:text-emerald-400 text-xs transition-colors">
              <Mail size={11} /> contact@jppackauto.fr
            </a>
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Posez votre question..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition-all"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="px-3 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl transition-all disabled:opacity-40 shadow-md btn-ripple"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

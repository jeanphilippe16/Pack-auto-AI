import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Repair } from '../types';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'text-amber-400 bg-amber-500/20', icon: <Clock size={14} /> },
  diagnosed: { label: 'Diagnostique', color: 'text-blue-400 bg-blue-500/20', icon: <Wrench size={14} /> },
  in_progress: { label: 'En cours', color: 'text-emerald-400 bg-emerald-500/20', icon: <Wrench size={14} /> },
  completed: { label: 'Terminee', color: 'text-slate-400 bg-slate-500/20', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Annulee', color: 'text-red-400 bg-red-500/20', icon: <XCircle size={14} /> },
};

const URGENCY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'text-slate-400 bg-slate-500/20' },
  medium: { label: 'Moyenne', color: 'text-amber-400 bg-amber-500/20' },
  high: { label: 'Haute', color: 'text-red-400 bg-red-500/20' },
};

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerPhone: '', carBrand: '', carModel: '', carYear: '', issueDescription: '', urgency: 'medium' as 'low' | 'medium' | 'high' });

  useEffect(() => { fetchRepairs(); }, []);

  async function fetchRepairs() {
    setLoading(true);
    const { data, error } = await supabase.from('repairs').select('*, car:cars(*)').order('created_at', { ascending: false });
    if (!error && data) setRepairs(data as unknown as Repair[]);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('repairs').insert({
      customer_name: form.customerName, customer_email: form.customerEmail, customer_phone: form.customerPhone,
      car_brand: form.carBrand || null, car_model: form.carModel || null, car_year: form.carYear ? parseInt(form.carYear) : null,
      issue_description: form.issueDescription, urgency: form.urgency, status: 'pending',
    });
    if (!error) { setSuccess(true); setShowForm(false); fetchRepairs(); setForm({ customerName: '', customerEmail: '', customerPhone: '', carBrand: '', carModel: '', carYear: '', issueDescription: '', urgency: 'medium' }); }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Wrench size={28} className="text-amber-400" />Reparations & Entretien</h1>
            <p className="text-slate-400 mt-1">{repairs.length} demande(s)</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setSuccess(false); }} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-colors"><Plus size={16} /> Nouvelle demande</button>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <div><p className="text-emerald-400 font-medium text-sm">Demande enregistree !</p><p className="text-slate-400 text-xs">Notre equipe vous contactera pour confirmer le rendez-vous.</p></div>
          </div>
        )}

        {showForm && (
          <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 slide-in-from-top">
            <h3 className="text-lg font-semibold text-white mb-4">Nouvelle demande de reparation</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom complet *" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} required />
                <Field label="Email *" type="email" value={form.customerEmail} onChange={(v) => setForm({ ...form, customerEmail: v })} required />
                <Field label="Telephone *" value={form.customerPhone} onChange={(v) => setForm({ ...form, customerPhone: v })} required />
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Urgence *</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => {
                      const urg = URGENCY_MAP[level];
                      return <button key={level} type="button" onClick={() => setForm({ ...form, urgency: level })} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${form.urgency === level ? `${urg.color} border-current` : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>{urg.label}</button>;
                    })}
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-sm text-slate-500 mb-3">Informations du vehicule (optionnel)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Marque" value={form.carBrand} onChange={(v) => setForm({ ...form, carBrand: v })} />
                  <Field label="Modele" value={form.carModel} onChange={(v) => setForm({ ...form, carModel: v })} />
                  <Field label="Annee" type="number" value={form.carYear} onChange={(v) => setForm({ ...form, carYear: v })} />
                </div>
              </div>
              <div><label className="text-sm text-slate-400 mb-1 block">Description du probleme *</label><textarea required rows={4} value={form.issueDescription} onChange={(e) => setForm({ ...form, issueDescription: e.target.value })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 resize-none" placeholder="Decrivez le probleme, symptomes, bruits anormaux..." /></div>
              <button type="submit" disabled={submitting} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">{submitting ? 'Envoi...' : 'Envoyer la demande'}</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-28 animate-pulse" />))}</div>
        ) : repairs.length === 0 ? (
          <div className="text-center py-16"><Wrench size={48} className="mx-auto text-slate-600 mb-4" /><p className="text-slate-400 text-lg">Aucune demande de reparation</p><button onClick={() => setShowForm(true)} className="mt-4 text-amber-400 hover:underline text-sm">Creer une demande</button></div>
        ) : (
          <div className="space-y-4">
            {repairs.map((repair) => {
              const status = STATUS_MAP[repair.status] || STATUS_MAP.pending;
              const urgency = URGENCY_MAP[repair.urgency] || URGENCY_MAP.medium;
              return (
                <div key={repair.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{repair.car_brand || repair.car?.brand || 'Vehicule'} {repair.car_model || repair.car?.model || ''}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${urgency.color}`}>{repair.urgency === 'high' && <AlertTriangle size={10} className="inline mr-1" />}{urgency.label}</span>
                      </div>
                      <p className="text-slate-500 text-sm">{repair.customer_name}</p>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{repair.issue_description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {repair.estimated_cost > 0 && <span className="text-white font-semibold">{repair.estimated_cost} EUR</span>}
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${status.color}`}>{status.icon} {status.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, required = false }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return <div><label className="text-sm text-slate-400 mb-1 block">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" /></div>;
}

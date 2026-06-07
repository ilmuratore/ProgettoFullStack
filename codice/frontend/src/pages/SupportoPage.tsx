import { HelpCircle, MessageSquare, FileText, ExternalLink, Mail, Phone } from 'lucide-react';

export function SupportoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Supporto</h1>
        <p className="text-sm text-[#6B7280] mt-1">Hai bisogno di aiuto? Siamo qui per te.</p>
      </div>

      {/* Contatti rapidi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <MessageSquare className="w-6 h-6" />, title: 'Chat con il supporto', detail: 'Risposta in pochi minuti', action: 'Avvia chat', color: 'text-[#17E88F]', bg: 'bg-[#F0FDF7]' },
          { icon: <Mail className="w-6 h-6" />,         title: 'Email',                detail: 'supporto@logichain.it',    action: 'Invia email', color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]' },
          { icon: <Phone className="w-6 h-6" />,        title: 'Telefono',             detail: '+39 02 1234 5678',          action: 'Chiama ora', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-2xl border border-[#E5EAF2] p-6 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>
              {c.icon}
            </div>
            <div>
              <p className="font-semibold text-[#2D2D2D]">{c.title}</p>
              <p className="text-sm text-[#6B7280] mt-0.5">{c.detail}</p>
            </div>
            <button className={`mt-auto text-sm font-medium ${c.color} hover:underline text-left`}>
              {c.action} →
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Domande Frequenti</h3>
        </div>
        <div className="space-y-3">
          {[
            { q: 'Come creo un nuovo ordine di acquisto?',        a: 'Vai su Acquisti → Nuovo Ordine e compila il form.' },
            { q: 'Come aggiungo un magazzino?',                   a: 'Sezione Magazzino → Struttura → Nuovo Magazzino.' },
            { q: 'Come esporto un DDT?',                          a: 'Disponibile con milestone M10 (Spedizioni & DDT).' },
            { q: 'Come cambio il mio ruolo?',                     a: 'Contatta un amministratore — il ruolo non è auto-modificabile.' },
            { q: 'Cosa significa "fonte ecosistema" su un fornitore?', a: 'Il fornitore proviene dalla rete B2B LogiChain e non può essere modificato manualmente.' },
          ].map((item, i) => (
            <details key={i} className="border border-[#E5EAF2] rounded-xl group">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-[#2D2D2D] hover:bg-[#F7F9FC] rounded-xl list-none">
                {item.q}
                <span className="text-[#9CA3AF] group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="px-4 pb-4 pt-1 text-sm text-[#6B7280]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Documentazione */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Documentazione</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Guida introduttiva',
            'Gestione magazzino',
            'Ordini di acquisto',
            'Spedizioni e DDT',
            'RBAC e permessi',
            'API Reference',
          ].map(doc => (
            <button key={doc} className="flex items-center justify-between p-3 border border-[#E5EAF2] rounded-xl hover:bg-[#F7F9FC] transition-colors text-left">
              <span className="text-sm text-[#2D2D2D]">{doc}</span>
              <ExternalLink className="w-4 h-4 text-[#9CA3AF]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

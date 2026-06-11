import { useState } from 'react';
import { useNavigate } from 'react-router';
import { HelpCircle, FileText, Mail, Phone, Ticket, ArrowRight, Clock } from 'lucide-react';
import { PageTabBar, type TabConfig } from '../components/ui/PageTabBar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import {
  faqSections,
  operatorManuals,
  clientManuals,
  contacts,
  type ContactIcon,
  type ManualeItem,
} from './support-data';

type SupportoTab = 'faq' | 'manuali-operatori' | 'manuali-clienti';

const tabs: TabConfig[] = [
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'manuali-operatori', label: 'Manuali Operatori', icon: FileText },
  { id: 'manuali-clienti', label: 'Manuali Clienti', icon: FileText },
];

const CONTACT_ICONS: Record<ContactIcon, React.ElementType> = {
  mail: Mail,
  phone: Phone,
  ticket: Ticket,
};

function ManualeCard({ manuale }: { manuale: ManualeItem }) {
  const navigate = useNavigate();
  const disponibile = manuale.stato === 'disponibile';

  return (
    <Card className="border-[#E5EAF2] gap-4 py-6">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-[#2D2D2D]">{manuale.titolo}</CardTitle>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap ${
              disponibile ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#FEF3C7] text-[#D97706]'
            }`}
          >
            {disponibile ? 'Disponibile' : 'In preparazione'}
          </span>
        </div>
        <CardDescription className="text-sm text-[#6B7280] mt-1">{manuale.descrizione}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]">
          {manuale.modulo}
        </span>
      </CardContent>
      <CardFooter>
        {disponibile && manuale.url ? (
          <button
            onClick={() => navigate(manuale.url!)}
            className="text-sm font-medium text-[#17E88F] hover:underline flex items-center gap-1.5"
          >
            Apri guida <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-sm font-medium text-[#9CA3AF] flex items-center gap-1.5 cursor-not-allowed">
            <Clock className="w-3.5 h-3.5" /> In preparazione
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

export function SupportoPage() {
  const [activeTab, setActiveTab] = useState<SupportoTab>('faq');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Supporto</h1>
        <p className="text-sm text-[#6B7280] mt-1">Hai bisogno di aiuto? Trova le risposte alle domande più comuni o consulta i manuali disponibili.</p>
      </div>

      {/* Contatti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contacts.map((c) => {
          const Icon = CONTACT_ICONS[c.icona];
          const content = (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#F0FDF7] text-[#17E88F] flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-[#2D2D2D]">{c.nome}</p>
                <p className="text-sm text-[#6B7280] mt-0.5">{c.valore}</p>
              </div>
            </>
          );

          return c.href ? (
            <a key={c.id} href={c.href} className="bg-white rounded-2xl border border-[#E5EAF2] p-6 flex flex-col gap-4 hover:border-[#17E88F] transition-colors">
              {content}
            </a>
          ) : (
            <div key={c.id} className="bg-white rounded-2xl border border-[#E5EAF2] p-6 flex flex-col gap-4">
              {content}
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as SupportoTab)} />

        <div className="p-6 space-y-4">
          {activeTab === 'faq' && faqSections.map((section) => (
            <div key={section.id} className="border border-[#E5EAF2] rounded-2xl p-6">
              <h3 className="font-semibold text-[#2D2D2D] mb-2">{section.categoria}</h3>
              <Accordion type="single" collapsible>
                {section.domande.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border-[#E5EAF2]">
                    <AccordionTrigger className="text-sm text-[#2D2D2D] hover:no-underline">
                      {item.domanda}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[#6B7280]">
                      {item.risposta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {activeTab === 'manuali-operatori' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operatorManuals.map((manuale) => (
                <ManualeCard key={manuale.id} manuale={manuale} />
              ))}
            </div>
          )}

          {activeTab === 'manuali-clienti' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientManuals.map((manuale) => (
                <ManualeCard key={manuale.id} manuale={manuale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

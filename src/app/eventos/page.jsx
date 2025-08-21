import EventsViewer from "@/app/components/eventos/EventsViewer";

export const metadata = {
  title: "Eventos | IEADSM",
  description: "Calendário geral de eventos e atividades da igreja.",
};

export default function EventsPage() {
  const pdfUrl = "/agendaieadsm.pdf"; // coloque o PDF em /public
  return (
    <div className="bg-stone-50 py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">Agenda da Igreja</h2>
          <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Calendário Geral</p>
          <p className="mt-4 text-lg text-stone-600">Consulte a nossa agenda completa de eventos e atividades.</p>
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <EventsViewer pdfUrl={pdfUrl} />
        </div>
      </div>
    </div>
  );
}

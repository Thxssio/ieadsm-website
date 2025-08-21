import InstitutionalContent from "@/institutional/InstitutionalContent";

export const metadata = {
  title: "Institucional | IEADSM",
  description: "Conheça a história e missão da Igreja Evangélica Assembleia de Deus de Santa Maria.",
};

export default function InstitucionalPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <InstitutionalContent />
    </main>
  );
}


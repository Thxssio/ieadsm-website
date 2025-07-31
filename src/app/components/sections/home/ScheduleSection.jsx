import { Hand, Users, BookOpen, Star, BookMarked, Radio, CalendarDays } from "lucide-react";

const DEFAULT_SCHEDULE = {
  "Terça-feira": [{ name: "Culto de Oração", time: "19h30", icon: <Hand size={20} /> }],
  "Quarta-feira": [{ name: "Círculo de Oração", time: "15h00", icon: <Users size={20} /> }],
  "Quinta-feira": [{ name: "Culto de Ensino", time: "19h45", note: "Oração às 19h15", icon: <BookOpen size={20} /> }],
  "Sexta-feira": [{ name: "Culto da Vitória", time: "15h00", icon: <Star size={20} /> }],
  "Sábado": [
    { name: "DEPAD (Adolescentes)", time: "15h00", icon: <Users size={20} /> },
    { name: "Culto de Jovens", time: "19h30", icon: <Users size={20} /> },
  ],
  "Domingo": [
    { name: "Escola Bíblica Dominical", time: "09h00", icon: <BookMarked size={20} /> },
    { name: "Programa 'A Voz da Assembleia de Deus'", time: "11h00", icon: <Radio size={20} /> },
    { name: "Culto Público", time: "19h00", icon: <CalendarDays size={20} /> },
  ],
};

export default function ScheduleSection({ schedule = DEFAULT_SCHEDULE }) {
  return (
    <section id="schedule" className="py-20 sm:py-28 bg-stone-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">Nossa Programação</h2>
          <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Participe Conosco</p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="space-y-8">
            {Object.entries(schedule).map(([day, events]) => (
              <div key={day} className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="md:w-32 text-left md:text-center">
                  <h3 className="text-xl font-bold text-stone-800">{day}</h3>
                </div>

                <div className="flex-1 space-y-4 border-l-2 border-stone-200 pl-6 md:pl-8">
                  {events.map((event) => (
                    <div
                      key={`${day}-${event.name}-${event.time}`}
                      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#2a3d57]/10 text-[#2a3d57] p-2 rounded-full">
                            {event.icon}
                          </div>
                          <div>
                            <p className="font-bold text-stone-700">{event.name}</p>
                            {event.note && <p className="text-xs text-stone-500">{event.note}</p>}
                          </div>
                        </div>
                        <p className="text-lg font-bold text-[#2a3d57]">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

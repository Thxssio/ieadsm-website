"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client'; // Verifique se este caminho está correto
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

import { Hand, Users, BookOpen, Star, BookMarked, Radio, CalendarDays } from "lucide-react";

const iconMap = {
  prayer: <Hand size={20} />,
  youth: <Users size={20} />,
  study: <BookOpen size={20} />,
  victory: <Star size={20} />,
  ebd: <BookMarked size={20} />,
  broadcast: <Radio size={20} />,
  worship: <CalendarDays size={20} />,
};

// --- CORREÇÃO AQUI ---
// Agora a lista inclui todos os dias da semana que você usa.
const orderedDaysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export default function ScheduleSection() {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessSchedule = async () => {
      try {
        const scheduleCollection = collection(db, 'schedule');
        const q = query(scheduleCollection, orderBy('dayOfWeek'), orderBy('time'));
        const scheduleSnapshot = await getDocs(q);
        const scheduleList = scheduleSnapshot.docs.map(doc => doc.data());

        const dayLabels = { '1': 'Domingo', '2': 'Segunda-feira', '3': 'Terça-feira', '4': 'Quarta-feira', '5': 'Quinta-feira', '6': 'Sexta-feira', '7': 'Sábado' };

        const grouped = scheduleList.reduce((acc, item) => {
          const day = dayLabels[item.dayOfWeek];
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push({
            name: item.title,
            time: item.time,
            note: item.description,
            icon: item.icon
          });
          return acc;
        }, {});
        
        setSchedule(grouped);
      } catch (error) {
        console.error("Erro ao buscar programação:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessSchedule();
  }, []);

  if (loading) {
    return (
      <section id="schedule" className="py-20 sm:py-28 bg-stone-50 dark:bg-slate-800">
        <div className="container text-center text-stone-900 dark:text-stone-100">Carregando programação...</div>
      </section>
    );
  }

  return (
    <section id="schedule" className="py-20 sm:py-28 bg-stone-50 dark:bg-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">Nossa Programação</h2>
          <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight sm:text-4xl">Participe Conosco</p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          {Object.keys(schedule).length === 0 ? (
            <p className="text-center text-stone-500 dark:text-stone-400">Nenhum horário cadastrado no momento.</p>
          ) : (
            <div className="space-y-8">
              {orderedDaysOfWeek.map(day => {
                const events = schedule[day];
                if (!events || events.length === 0) return null;

                return (
                  <div key={day} className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="md:w-32 text-left md:text-center shrink-0">
                      <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">{day}</h3>
                    </div>
                    <div className="flex-1 space-y-4 border-l-2 border-stone-200 dark:border-slate-700 pl-6 md:pl-8">
                      {events.map((event, index) => (
                        <div key={`${day}-${event.name}-${index}`} className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#2a3d57]/10 text-[#2a3d57] p-2 rounded-full">
                                {iconMap[event.icon] || iconMap['worship']}
                              </div>
                              <div>
                                <p className="font-bold text-stone-700 dark:text-stone-200">{event.name}</p>
                                {event.note && <p className="text-xs text-stone-500 dark:text-stone-400">{event.note}</p>}
                              </div>
                            </div>
                            <p className="text-lg font-bold text-[#2a3d57]">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

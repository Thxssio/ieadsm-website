import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

import PageContent from '@/components/portal/ui/PageContent';

import { Hand, Users, BookOpen, Star, BookMarked, Radio, CalendarDays, Trash2 as TrashIcon } from 'lucide-react';

const iconOptions = [
    { value: 'worship', label: 'Culto/Evento Padrão' },
    { value: 'prayer', label: 'Oração' },
    { value: 'study', label: 'Ensino' },
    { value: 'ebd', label: 'EBD' }, // Adicionando EBD separadamente para clareza
    { value: 'youth', label: 'Jovens/Adolescentes' },
    { value: 'broadcast', label: 'Programa/Transmissão' },
    { value: 'victory', label: 'Vitória/Campanha' },
];

const ScheduleFormModal = ({ isOpen, onClose, onSave, currentItem }) => {
  const initialFormState = { dayOfWeek: '1', time: '', title: '', description: '', icon: 'worship' };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (currentItem) { setFormData(currentItem); }
    else { setFormData(initialFormState); }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;
  
  const weekDays = [ { label: 'Domingo', value: '1' }, { label: 'Segunda-feira', value: '2' }, { label: 'Terça-feira', value: '3' }, { label: 'Quarta-feira', value: '4' }, { label: 'Quinta-feira', value: '5' }, { label: 'Sexta-feira', value: '6' }, { label: 'Sábado', value: '7' }];

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-xl font-bold text-slate-800 mb-4">{currentItem?.id ? 'Editar Horário' : 'Adicionar Horário'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg text-gray-900" required>
              {weekDays.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
            </select>
            
            <select name="icon" value={formData.icon} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg text-gray-900" required>
                <option value="" disabled>Selecione um Tipo (para o Ícone)</option>
                {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            
            <input type="text" name="time" value={formData.time} onChange={handleChange} placeholder="Horário (ex: 19:45)" maxLength="5" pattern="\d{2}:\d{2}" title="Digite a hora no formato HH:MM (24 horas)" className="w-full p-2 border border-slate-300 rounded-lg text-gray-900" required />
            
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Nome do Culto/Evento" className="w-full p-2 border border-slate-300 rounded-lg text-gray-900" required />
            
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descrição curta (opcional)" className="w-full p-2 border border-slate-300 rounded-lg text-gray-900" rows="3"></textarea>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-[#2a3d57] text-white font-semibold rounded-lg hover:bg-opacity-90">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function SchedulePage() {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // AJUSTE 2: Atualizar o iconMap para usar os ícones importados da lucide-react
  const iconMap = { 
    prayer: <Hand size={24} />, 
    study: <BookOpen size={24} />, 
    youth: <Users size={24} />, 
    broadcast: <Radio size={24} />, 
    worship: <CalendarDays size={24} />, 
    victory: <Star size={24} />,
    ebd: <BookMarked size={24} />,
  };

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const scheduleCollection = collection(db, 'schedule');
      const q = query(scheduleCollection, orderBy('dayOfWeek'), orderBy('time'));
      const scheduleSnapshot = await getDocs(q);
      const scheduleList = scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScheduleItems(scheduleList);
    } catch (error) { console.error("Erro ao buscar programação:", error); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const handleOpenModal = (item = null) => { setCurrentItem(item); setIsModalOpen(true); };
  const handleCloseModal = () => { setCurrentItem(null); setIsModalOpen(false); };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await updateDoc(doc(db, 'schedule', formData.id), formData);
        setMessage('Horário atualizado!');
      } else {
        await addDoc(collection(db, 'schedule'), formData);
        setMessage('Horário adicionado!');
      }
      handleCloseModal(); fetchSchedule();
    } catch (error) { console.error("Erro ao salvar:", error); }
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleDelete = async (itemId) => {
    if (window.confirm("Tem certeza?")) {
      try {
        await deleteDoc(doc(db, 'schedule', itemId));
        setMessage('Horário excluído!'); fetchSchedule();
      } catch (error) { console.error("Erro ao excluir:", error); }
    }
  };
  
  const getDayLabel = (value) => ({ '1': 'Domingo', '2': 'Segunda-feira', '3': 'Terça-feira', '4': 'Quarta-feira', '5': 'Quinta-feira', '6': 'Sexta-feira', '7': 'Sábado' }[value] || '');

  return (
    <PageContent title="Gerenciar Programação Semanal">
      {message && <p className="mb-4 text-sm text-green-600 bg-green-100 p-2 rounded-md">{message}</p>}
      <div className="mb-6 flex justify-end"><button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#2a3d57] text-white font-semibold rounded-lg hover:bg-opacity-90">Adicionar Horário</button></div>
      {loading ? <p>Carregando...</p> : (
        <div className="space-y-4">
          <AnimatePresence>
            {scheduleItems.length > 0 ? scheduleItems.map(item => (
              <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-slate-500">{iconMap[item.icon] || <CalendarDays size={24} />}</div>
                  <div>
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <p className="text-sm text-slate-600">{getDayLabel(item.dayOfWeek)} às {item.time}</p>
                  </div>
                </div>
                <div className="flex space-x-2"><button onClick={() => handleOpenModal(item)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Editar</button><button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><TrashIcon size={16} /></button></div>
              </motion.div>
            )) : <p className="text-center text-slate-500 py-8">Nenhum horário cadastrado.</p>}
          </AnimatePresence>
        </div>
      )}
      <ScheduleFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} currentItem={currentItem} />
    </PageContent>
  );
}

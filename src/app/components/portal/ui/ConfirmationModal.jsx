import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-slate-700 dark:text-slate-300">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">{title}</h3>
        <div className="mt-2 text-sm">
          {children}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-background text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
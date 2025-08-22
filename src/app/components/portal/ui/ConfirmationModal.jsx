import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {children}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
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
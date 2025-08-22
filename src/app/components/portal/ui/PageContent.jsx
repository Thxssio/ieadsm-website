import React from 'react';

export default function PageContent({ title, children }) {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 mb-6">{title}</h1>
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}
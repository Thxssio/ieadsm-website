import React from 'react';

export default function PageContent({ title, children }) {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{title}</h1>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
        {children}
      </div>
    </div>
  );
}
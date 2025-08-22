import React from 'react';

export default function StatusBadge({ verified }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
      {verified ? 'Verificado' : 'Pendente'}
    </span>
  );
}
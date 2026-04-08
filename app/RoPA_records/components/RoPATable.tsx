"use client";
import React from 'react';

export default function RoPATable({ searchTerm, setSearchTerm, setIsCreating }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-slate-900">RoPA Records</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-2 bg-[#8B93C5] text-white rounded-full font-bold shadow-md"
        >
          + New
        </button>
      </div>
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center">
         <p className="text-slate-400 italic">No records found. Click "+ "New to start.</p>
      </div>
    </div>
  );
}
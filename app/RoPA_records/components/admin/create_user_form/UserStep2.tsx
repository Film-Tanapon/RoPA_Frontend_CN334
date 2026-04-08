"use client";
import React, { useState } from 'react';

export default function UserStep2({ onBack, onSubmit }: { onBack: () => void, onSubmit: (data: any) => void }) {
  const [selectedRole, setSelectedRole] = useState('Viewer');
  const roles = [
    { title: 'Admin', desc: 'Full access to all settings and records' },
    { title: 'Data Owner', desc: 'Can manage department records only' },
    { title: 'Viewer', desc: 'Read-only access to specific records' }
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="space-y-4">
        <label className="text-sm font-black text-slate-700 ml-1">Assign System Role</label>
        <div className="grid grid-cols-1 gap-4">
          {roles.map((role) => (
            <label 
              key={role.title} 
              className={`flex items-center p-5 border-2 rounded-3xl cursor-pointer transition-all group ${
                selectedRole === role.title ? 'border-[#8B93C5] bg-blue-50/30' : 'border-slate-100 hover:bg-slate-50'
              }`}
            >
              <input 
                type="radio" 
                name="role" 
                checked={selectedRole === role.title}
                onChange={() => setSelectedRole(role.title)}
                className="w-5 h-5 accent-[#8B93C5]" 
              />
              <div className="ml-4">
                <p className="font-black text-slate-800">{role.title}</p>
                <p className="text-xs text-slate-400 font-bold">{role.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <button onClick={onBack} className="px-10 py-4 text-slate-400 font-black hover:text-slate-600 transition-all">
          ← Back
        </button>
        <button 
          onClick={() => onSubmit({ role: selectedRole })} 
          className="px-12 py-4 bg-green-500 text-white rounded-full font-black shadow-lg hover:bg-green-600 active:scale-95 transition-all"
        >
          Complete & Save
        </button>
      </div>
    </div>
  );
}
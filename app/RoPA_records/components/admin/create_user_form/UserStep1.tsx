"use client";
import React, { useState } from 'react';

export default function UserStep1({ onNext }: { onNext: (data: any) => void }) {
  // แก้ไขตัวแปรให้ตรงกับ Database Schema
  const [info, setInfo] = useState({ 
    username: '', 
    password_hash: '',
    fullname: '', 
    email: '', 
    tel: '',
    departments: 'IT Support' 
  });

  // ตรวจสอบว่ากรอกข้อมูลสำคัญครบหรือยัง
  const isFormValid = info.username && info.password_hash && info.fullname && info.email;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Username */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">Username <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={info.username}
            onChange={(e) => setInfo({...info, username: e.target.value})}
            placeholder="johndoe123" 
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-900 focus:border-[#8B93C5] focus:bg-white transition-all font-medium" 
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">Password <span className="text-red-500">*</span></label>
          <input 
            type="password" 
            value={info.password_hash}
            onChange={(e) => setInfo({...info, password_hash: e.target.value})}
            placeholder="••••••••" 
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-900 focus:border-[#8B93C5] focus:bg-white transition-all font-medium" 
          />
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">Full Name <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={info.fullname}
            onChange={(e) => setInfo({...info, fullname: e.target.value})}
            placeholder="e.g. Somchai Dev" 
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-900 focus:border-[#8B93C5] focus:bg-white transition-all font-medium" 
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">Email Address <span className="text-red-500">*</span></label>
          <input 
            type="email" 
            value={info.email}
            onChange={(e) => setInfo({...info, email: e.target.value})}
            placeholder="somchai@company.com" 
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-900 focus:border-[#8B93C5] focus:bg-white transition-all font-medium" 
          />
        </div>

        {/* Telephone */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">Telephone</label>
          <input 
            type="tel" 
            value={info.tel}
            onChange={(e) => setInfo({...info, tel: e.target.value})}
            placeholder="0812345678" 
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-900 focus:border-[#8B93C5] focus:bg-white transition-all font-medium" 
          />
        </div>

        {/* Departments */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">Department</label>
          <select 
            value={info.departments}
            onChange={(e) => setInfo({...info, departments: e.target.value})}
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-900 focus:border-[#8B93C5] focus:bg-white transition-all font-medium appearance-none"
          >
            <option value="IT Support">IT Support</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={() => onNext(info)}
          disabled={!isFormValid}
          className="px-10 py-4 bg-[#8B93C5] text-white rounded-full font-black shadow-lg hover:bg-[#7a82b5] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          Next<span>→</span>
        </button>
      </div>
    </div>
  );
}
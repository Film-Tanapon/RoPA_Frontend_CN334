"use client";
import React, { useState, useEffect } from 'react';

export default function UserStep1({ onNext, initialData }: { onNext: (data: any) => void, initialData?: any }) {
  const [info, setInfo] = useState({
    username: '',
    password_hash: '',
    fullname: '',
    email: '',
    tel: ''
  });

  useEffect(() => {
    if (initialData) {
      setInfo({
        username: initialData.username || '',
        password_hash: '',
        fullname: initialData.fullname || '',
        email: initialData.email || '',
        tel: initialData.tel || ''
      });
    }
  }, [initialData]);

  // ตรวจสอบความถูกต้องของข้อมูล (ถ้าเป็นโหมด Edit อาจไม่ต้องบังคับกรอก password ใหม่)
  const isFormValid = initialData
    ? info.username && info.fullname && info.email // โหมด Edit: ไม่บังคับ Password
    : info.username && info.password_hash && info.fullname && info.email; // โหมด Create: บังคับ Password

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Username */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">Username <span className="text-red-500">*</span></label>
          <input
            type="text"
            disabled={!!initialData}
            value={info.username}
            onChange={(e) => setInfo({ ...info, username: e.target.value })}
            placeholder="johndoe123"
            className={`w-full p-4 border-2 rounded-2xl outline-none transition-all font-medium ${initialData ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-[#8B93C5] focus:bg-white'}`}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">
            {initialData ? "New Password (Leave blank)" : "Password *"}
          </label>
          <input
            type="password"
            value={info.password_hash}
            onChange={(e) => setInfo({ ...info, password_hash: e.target.value })}
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
            onChange={(e) => setInfo({ ...info, fullname: e.target.value })}
            placeholder="e.g. Somchai Dev"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-900 focus:border-[#8B93C5] focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 ml-1">Email Address <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={info.email}
            onChange={(e) => setInfo({ ...info, email: e.target.value })}
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
            onChange={(e) => setInfo({ ...info, tel: e.target.value })}
            placeholder="0812345678"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-900 focus:border-[#8B93C5] focus:bg-white transition-all font-medium"
          />
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
"use client";
import React, { useState } from 'react';
import Step1 from './Step1'; 

export default function Feedback() {
  const [view, setView] = useState<'list' | 'detail'>('list');

  const mockFeedbackList = [
    { id: 1, title: 'ชื่อกิจกรรม', description: 'รายละเอียดการแก้ไข : ................................' },
    { id: 2, title: 'ชื่อกิจกรรม', description: 'รายละเอียดการแก้ไข : ................................' },
  ];

  // ถ้าสถานะเป็น detail ให้แสดง Component Step1 ที่เราแยกไว้
  if (view === 'detail') {
    return <Step1 onBack={() => setView('list')} />;
  }

  // -----------------------------------------------------
  // หน้ารายการ (List View)
  // -----------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-white rounded-[3rem] p-10 shadow-sm animate-in zoom-in duration-300">
      
      <div className="flex-1 bg-[#EBF4FA] rounded-2xl p-8 overflow-y-auto custom-scrollbar">
        <div className="space-y-6 max-w-4xl mx-auto">
          {mockFeedbackList.map((item) => (
            <div 
              key={item.id}
              onClick={() => setView('detail')} 
              className="group flex bg-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all overflow-hidden border border-slate-100"
            >
              <div className="flex-1 p-8">
                <h3 className="text-2xl font-normal text-slate-800 mb-4">{item.title}</h3>
                <p className="text-slate-600 font-medium">{item.description}</p>
              </div>
              
              <div className="w-24 bg-[#D3E5F5] flex items-center justify-center group-hover:bg-[#C2D9ED] transition-colors">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E2A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
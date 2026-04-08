"use client";
import React from 'react';
//adadad//
export default function Dashboard() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto pr-2 custom-scrollbar">
      <h1 className="text-4xl font-black text-slate-900 mb-8">Overview</h1>
      

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-slate-500 font-bold mb-2">Total Activities</p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-black text-[#2D3663]">20</p>
            <span className="text-green-500 font-bold text-sm">↑ 12%</span>
          </div>
        </div>


        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 col-span-2">
          <p className="text-slate-500 font-bold mb-6">Processing Status</p>
          <div className="flex gap-12">
            <div className="flex flex-col items-center">
               <div className="w-20 h-20 bg-[#E7F3FF] rounded-full mb-3 flex items-center justify-center border-4 border-white shadow-inner">
                  <span className="text-[#8B93C5] font-black text-xl">85%</span>
               </div>
               <p className="text-sm font-black text-[#2D3663]">Reviewed</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-20 h-20 bg-red-50 rounded-full mb-3 flex items-center justify-center border-4 border-white shadow-inner">
                  <span className="text-red-400 font-black text-xl">5%</span>
               </div>
               <p className="text-sm font-black text-[#2D3663]">Expired</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full mb-3 flex items-center justify-center border-4 border-white shadow-inner">
                  <span className="text-slate-400 font-black text-xl">10%</span>
               </div>
               <p className="text-sm font-black text-[#2D3663]">Pending</p>
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 gap-8 pb-10">

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[#2D3663] text-xl font-black">RoPA Registration Progress</p>
            <select className="text-slate-700 bg-slate-50 border-none rounded-lg text-sm font-bold p-2 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="w-full h-64 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="font-bold">Chart visualization will be here</p>
          </div>
        </div>


        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[#2D3663] text-xl font-black mb-6">Department Comparison</p>
          <div className="space-y-4">
            {['HR', 'Marketing', 'IT', 'Sales'].map((dept, index) => (
              <div key={dept} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-600">{dept}</span>
                  <span className="text-[#2D3663]">{[80, 60, 95, 40][index]}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8B93C5] rounded-full transition-all duration-1000" 
                    style={{ width: `${[80, 60, 95, 40][index]}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
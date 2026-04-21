"use client";
import React from 'react';

// กำหนด Props เพื่อรับฟังก์ชันกดกลับจากหน้าหลัก
interface Step1Props {
  onBack: () => void;
}

export default function Step1({ onBack }: Step1Props) {
  return (
    <div className="flex flex-col h-full bg-white rounded-[3rem] p-8 shadow-sm animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
      {/* ปุ่มกลับ */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold w-fit mb-6 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        กลับไปหน้ารายการ
      </button>

      <div className="space-y-6 text-[#1E2A5E]">
        {/* กล่อง 1: รายละเอียดการแก้ไข */}
        <div className="bg-[#EBF4FA] border border-[#C5D9ED] p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">รายละเอียดการแก้ไข</h3>
          <p className="text-sm text-slate-700">แก้ไขส่วนวัตถุประสงค์ของการประมวลผล................................................</p>
        </div>

        {/* กล่อง 2: บันทึกรายการกิจกรรมการประมวลผล */}
        <div className="bg-[#EBF4FA] border border-[#C5D9ED] p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">บันทึกรายการกิจกรรมการประมวลผล</h3>
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">ชื่อกิจกรรม</label>
                <input type="text" className="w-full border border-[#C5D9ED] p-2.5 outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">วันที่เริ่มกิจกรรม</label>
                <input type="text" className="w-full border border-[#C5D9ED] p-2.5 outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">ระยะเวลาการเก็บรักษาข้อมูล</label>
                <input type="text" placeholder="เช่น 5 ปี, 10 ปี" className="w-full border border-[#C5D9ED] p-2.5 outline-none focus:ring-2 focus:ring-blue-200 bg-white placeholder-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">วัตถุประสงค์ของการประมวลผล</label>
              <textarea rows={4} className="w-full border border-[#C5D9ED] p-2.5 outline-none focus:ring-2 focus:ring-blue-200 bg-white resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">เจ้าของข้อมูลส่วนบุคคล</label>
                <input type="text" className="w-full border border-[#C5D9ED] p-2.5 outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">หมวดหมู่ข้อมูล</label>
                <select className="w-full border border-[#C5D9ED] p-2.5 outline-none focus:ring-2 focus:ring-blue-200 bg-white text-slate-500">
                  <option>Select...</option>
                  <option>ข้อมูลทั่วไป</option>
                  <option>ข้อมูลอ่อนไหว</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* กล่อง 3: คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย */}
        <div className="bg-[#EBF4FA] border border-[#C5D9ED] p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย</h3>
          
          <div className="space-y-4">
            {[
              'มาตรการเชิงองค์กร',
              'มาตรการเชิงเทคนิค',
              'มาตรการทางกายภาพ',
              'การควบคุมการเข้าถึงข้อมูล',
              'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน',
              'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน',
              'มาตรการตรวจสอบย้อนหลัง'
            ].map((label, index) => (
              <div key={index}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <input type="text" className="w-full border border-[#C5D9ED] p-2.5 outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
              </div>
            ))}
          </div>

          {/* ปุ่ม Actions */}
          <div className="flex items-center justify-end gap-6 mt-10">
            <button className="text-[#E04F4F] font-bold underline hover:text-red-700 transition-colors">
              Reset
            </button>
            <button className="bg-[#6BB588] hover:bg-[#5AA176] text-white px-8 py-2.5 rounded-full font-bold shadow-sm transition-colors">
              Save Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
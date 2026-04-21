"use client";
import React, { useState } from 'react';

export default function PendingReview({ data, onBack }: { data?: any; onBack?: () => void }) {
  const [step, setStep] = useState(data ? 2 : 1);
  const [selectedActivity, setSelectedActivity] = useState<any>(data || null);
  
  // สร้าง state สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    data_subject: "",
    retention_period: "",
    objective: "",
    data_category: "",
    data_type: "general",
    collected_data: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const labelStyle = "block text-[15px] font-bold text-[#1e293b] mb-2";
  const inputStyle = "w-full p-4 bg-white border border-[#cbd5e1] rounded-xl text-[#334155] focus:border-[#3b82f6] outline-none transition-all placeholder:text-[#94a3b8]";
  const selectStyle = "w-full p-4 bg-white border border-[#cbd5e1] rounded-xl text-[#334155] focus:border-[#3b82f6] outline-none transition-all appearance-none cursor-pointer";

  // --- Step 1: รายการกิจกรรม ---
  if (step === 1 && !data) {
    const mockPendingActivities = [
      { id: 1, activityName: "ชื่อกิจกรรม 1", createdAt: "2024-03-20" },
      { id: 2, activityName: "ชื่อกิจกรรม 2", createdAt: "2024-03-21" }
    ];

    return (
      <div className="flex flex-col h-full p-4 animate-in fade-in duration-500 bg-[#F0F9FF]">
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar pt-4">
          {mockPendingActivities.map((item) => (
            <div 
              key={item.id}
              onClick={() => { setSelectedActivity(item); setStep(2); }}
              className="flex items-center justify-between bg-white rounded-[1.5rem] shadow-xl border border-slate-50 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden h-[110px]"
            >
              <div className="py-9 px-12">
                <span className="text-[#2D3663] font-bold text-3xl">{item.activityName}</span>
              </div>
              <div className="w-24 h-full absolute right-0 top-0 bg-[#D1EAFF] flex items-center justify-center group-hover:bg-blue-500 transition-all">
                 <span className="text-blue-900 group-hover:text-white font-black text-2xl">❯</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Step 2: หน้ากรอกข้อมูล (แก้ไขส่วนเจ้าของข้อมูลแล้ว) ---
  if (step === 2) {
    const measures = [
      "มาตรการเชิงองค์กร", "มาตรการเชิงเทคนิค", "มาตรการทางกายภาพ", 
      "การควบคุมการเข้าถึงข้อมูล", "การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน", "มาตรการตรวจสอบย้อนหลัง"
    ];
    
    return (
      <div className="h-full flex flex-col p-6 animate-in slide-in-from-right duration-500 bg-[#F0F9FF]">
        <div className="bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-full overflow-hidden border border-slate-100">
          
          {/* Header */}
          <div className="px-10 py-7 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-[22px] font-black text-[#1e293b]">บันทึกรายการกิจกรรมการประมวลผล</h2>
            <button onClick={onBack || (() => setStep(1))} className="text-slate-400 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
            
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className={labelStyle}>ชื่อกิจกรรม</label>
                <input type="text" value={selectedActivity?.activityName || ''} readOnly className={`${inputStyle} bg-slate-50 font-bold`} />
              </div>
              <div className="col-span-1">
                <label className={labelStyle}>วันที่เริ่มกิจกรรม</label>
                <input type="text" value={selectedActivity?.createdAt || '2024-03-20'} readOnly className={`${inputStyle} bg-slate-50`} />
              </div>
              <div className="col-span-1">
                <label className={labelStyle}>ระยะเวลาการเก็บรักษาข้อมูล</label>
                <input type="text" name="retention_period" className={inputStyle} placeholder="เช่น 5 ปี, 10 ปี" onChange={handleChange} />
              </div>

              <div className="col-span-3">
                <label className={labelStyle}>วัตถุประสงค์ของการประมวลผล</label>
                <textarea name="objective" className={`${inputStyle} h-28 resize-none`} placeholder="ระบุวัตถุประสงค์..." onChange={handleChange} />
              </div>

              {/* ปรับปรุงส่วนนี้: เจ้าของข้อมูลส่วนบุคคล (เป็น Input กรอก) */}
              <div className="col-span-1">
                <label className={labelStyle}>เจ้าของข้อมูลส่วนบุคคล</label>
                <input 
                  type="text" 
                  name="data_subject" 
                  placeholder="ระบุเจ้าของข้อมูล..." 
                  onChange={handleChange} 
                  className={inputStyle} 
                />
              </div>

              {/* หมวดหมู่ข้อมูล */}
              <div className="col-span-2">
                <label className={labelStyle}>หมวดหมู่ข้อมูล</label>
                <div className="relative">
                  <select name="data_category" className={selectStyle} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="general">ข้อมูลทั่วไป</option>
                    <option value="financial">ข้อมูลทางการเงิน</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>

              {/* ประเภทข้อมูล */}
              <div className="col-span-3 pt-2">
                <label className={labelStyle}>ประเภทของข้อมูล</label>
                <div className="flex gap-10 mt-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="data_type" value="general" checked={formData.data_type === "general"} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
                    <span className="text-[15px] font-semibold text-[#475569] group-hover:text-blue-600 transition-colors">ข้อมูลทั่วไป</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="data_type" value="sensitive" checked={formData.data_type === "sensitive"} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
                    <span className="text-[15px] font-semibold text-[#475569] group-hover:text-blue-600 transition-colors">ข้อมูลอ่อนไหว</span>
                  </label>
                </div>
              </div>

              <div className="col-span-3">
                <label className={labelStyle}>ข้อมูลส่วนบุคคลที่จัดเก็บ</label>
                <textarea name="collected_data" className={`${inputStyle} h-24 resize-none`} placeholder="โปรดระบุ เช่น ชื่อ นามสกุล ที่อยู่ เป็นต้น...." onChange={handleChange} />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* ส่วนที่ 2: มาตรการความปลอดภัย */}
            <div className="space-y-8">
              <h3 className="text-[18px] font-black text-[#1e293b] flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย
              </h3>
              <div className="space-y-6">
                {measures.map((text) => (
                  <div key={text}>
                    <label className="text-[14px] font-bold text-[#64748b] mb-2 block">{text}</label>
                    <input type="text" className={inputStyle} placeholder={`ระบุ${text}...`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-6 border-t border-slate-100 flex justify-end gap-6 bg-slate-50/30">
            <button onClick={() => setStep(4)} className="text-[#E54D4D] font-bold text-lg hover:underline px-4">Request Edited</button>
            <button 
              onClick={() => { alert("Approved Success!"); onBack ? onBack() : setStep(1); }} 
              className="px-14 py-3.5 bg-[#00C285] text-white rounded-2xl font-bold shadow-lg hover:bg-[#00A873] transition-all"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 4: ส่วนแก้ไข ---
  if (step === 4) {
    return (
      <div className="h-full flex flex-col p-4 bg-[#F0F9FF]">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl h-full flex flex-col">
          <h2 className="text-[22px] font-black text-[#1e293b] mb-8">รายละเอียดการแก้ไข</h2>
          <textarea placeholder="ระบุข้อความ..." className="w-full flex-1 p-8 bg-slate-50 border border-[#cbd5e1] rounded-3xl outline-none resize-none" />
          <div className="mt-8 flex justify-between items-center">
            <button onClick={() => setStep(2)} className="text-slate-400 font-bold">← กลับไปหน้าตรวจสอบ</button>
            <button onClick={() => { alert("ส่งกลับเรียบร้อย"); setStep(1); }} className="px-14 py-3.5 bg-[#DBA129] text-white rounded-2xl font-bold">Send Back</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
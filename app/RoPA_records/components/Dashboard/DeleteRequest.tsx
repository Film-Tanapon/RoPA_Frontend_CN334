"use client";
import React, { useState, useEffect } from 'react';

export default function DeleteRequest() {
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    organizational_measure: '',
    technical_measure: '',
    physical_measure: '',
    access_control: '',
    user_responsibility: '',
    audit_measure: ''
  });

  const labelStyle = "block text-[15px] font-bold text-[#1e293b] mb-2 ml-1";
  const inputStyle = "w-full p-4 bg-white border border-[#cbd5e1] rounded-lg text-[#334155] focus:border-[#3b82f6] outline-none transition-all placeholder:text-[#94a3b8] text-[16px] shadow-sm";

  // --- Mock Data ---
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const mockData = [
          { id: 1, activityName: 'ชื่อกิจกรรม 1' },
          { id: 2, activityName: 'ชื่อกิจกรรม 2' },
          { id: 3, activityName: 'ชื่อกิจกรรม 3' },
        ];
        await new Promise(resolve => setTimeout(resolve, 500));
        setActivities(mockData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (Object.values(formData).some(val => val === '')) {
      alert("กรุณากรอกคำอธิบายให้ครบถ้วนทุกหัวข้อ");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      alert("ส่งคำร้องเรียบร้อยแล้ว");
      setIsSubmitting(false);
      setSelectedActivity(null);
    }, 1000);
  };

  // --- หน้าที่ 1: รายการกิจกรรม ---
  if (!selectedActivity) {
    return (
      <div className="flex flex-col h-full p-4 animate-in fade-in duration-500 bg-[#F0F9FF]">
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar pt-4">
          {isLoading ? (
            <div className="text-center py-10 text-slate-400 font-bold">กำลังโหลด...</div>
          ) : (
            activities.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedActivity(item)}
                className="flex items-center justify-between bg-white rounded-[1.5rem] shadow-xl border border-slate-50 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden h-[110px]"
              >
                <div className="py-9 px-12">
                  <span className="text-[#2D3663] font-bold text-3xl">{item.activityName}</span>
                </div>
                <div className="w-24 h-full absolute right-0 top-0 bg-[#D1EAFF] flex items-center justify-center group-hover:bg-blue-500 transition-all">
                   <span className="text-blue-900 group-hover:text-white font-black text-2xl">❯</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- หน้าที่ 2: ฟอร์มกรอกข้อมูล (ปรับปรุงใหม่) ---
  const inputFields = [
    { label: 'มาตรการเชิงองค์กร', name: 'organizational_measure' },
    { label: 'มาตรการเชิงเทคนิค', name: 'technical_measure' },
    { label: 'มาตรการทางกายภาพ', name: 'physical_measure' },
    { label: 'การควบคุมการเข้าถึงข้อมูล', name: 'access_control' },
    { label: 'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน', name: 'user_responsibility' }, // เหลือเพียงช่องเดียว
    { label: 'มาตรการการตรวจสอบย้อนหลัง', name: 'audit_measure' },
  ];

  return (
    <div className="h-full flex flex-col p-8 animate-in slide-in-from-right duration-500 bg-[#E3F2FD]">
      <div className="bg-white/50 rounded-[1rem] border border-slate-300 flex flex-col h-full overflow-hidden shadow-sm relative">
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="space-y-6">
            <h2 className="text-[18px] font-bold text-[#2D3663] mb-8">
              คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย
            </h2>
            
            <div className="space-y-5">
              {inputFields.map((field, index) => (
                <div key={index}>
                  <label className={labelStyle}>{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder=""
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer ปุ่ม Send Delete สีแดงวงรี */}
        <div className="p-8 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-10 py-3 bg-[#D32F2F] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#B71C1C] transition-all active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? 'Sending...' : 'Send Delete'}
          </button>
        </div>

        {/* ปุ่ม Back */}
        <button 
          onClick={() => setSelectedActivity(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
}
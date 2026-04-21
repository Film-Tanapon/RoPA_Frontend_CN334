"use client";
import React, { useState, useEffect } from 'react';

export default function ExtendRetention() {
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

  const handleApprove = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert("อนุมัติเรียบร้อยแล้ว");
      setIsSubmitting(false);
      setSelectedActivity(null);
    }, 1000);
  };

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

  return (
    <div className="h-full flex flex-col p-8 animate-in slide-in-from-right duration-500 bg-[#F0F9FF]">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 flex flex-col h-full overflow-hidden shadow-2xl relative">
        
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="space-y-8">
            {/* ส่วนหัวข้อ (ลบเส้นคั่น border-b ออกแล้ว) */}
            <h2 className="text-[22px] font-bold text-[#2D3663]">
              คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className={labelStyle}>มาตรการเชิงองค์กร</label>
                <input type="text" name="organizational_measure" onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>มาตรการเชิงเทคนิค</label>
                <input type="text" name="technical_measure" onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>มาตรการทางกายภาพ</label>
                <input type="text" name="physical_measure" onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>การควบคุมการเข้าถึงข้อมูล</label>
                <input type="text" name="access_control" onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน</label>
                <input type="text" name="user_responsibility" onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>มาตรการตรวจสอบย้อนหลัง</label>
                <input type="text" name="audit_measure" onChange={handleChange} className={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนท้าย (ลบเส้นคั่น border-t ออกแล้ว) */}
        <div className="p-8 px-12 flex justify-between items-center bg-slate-50/50">
          <button 
            onClick={() => setSelectedActivity(null)}
            className="flex items-center gap-2 text-[#2D3663] font-bold text-xl hover:text-blue-600 transition-colors"
          >
            <span className="text-2xl">←</span> Back
          </button>
          
          <div className="flex gap-6 items-center">
             <button 
                onClick={handleApprove}
                disabled={isSubmitting}
                className="px-14 py-3 bg-[#00C853] text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-[#00A844] transition-all active:scale-95"
              >
                {isSubmitting ? 'Processing...' : 'Approve'}
              </button>
          </div>
        </div>

        <button 
          onClick={() => setSelectedActivity(null)}
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
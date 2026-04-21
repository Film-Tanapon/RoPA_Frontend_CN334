import React from 'react';

export default function Dashboard({ data = {} }: any) {
  const totalActivities = data.totalActivities || 0;
  const reviewed = data.reviewed || 0;
  const actionRequired = data.actionRequired || 0;
  const expired = data.expired || 0;
  const pendingReview = data.pendingReview || 0;
  
  const defaultDepts = ['Finance', 'HR', 'Marketing', 'IT', 'Operations'];
  const displayDepartments = data.departments && data.departments.length > 0 
    ? data.departments 
    : defaultDepts;

  return (
    // แก้ไข: เพิ่ม h-screen เพื่อให้เทียบเท่าความสูงหน้าจอ และ overflow-y-auto ให้เลื่อนขึ้นลงได้
    <div className="h-screen overflow-y-auto p-8 space-y-8 animate-in fade-in duration-700 bg-[#F8FAFC]">
      <h2 className="text-4xl font-black text-[#2D3663] mb-8">Overview</h2>

      {/* --- ส่วนที่ 1: การ์ดด้านบน --- */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center min-h-[250px]">
          <p className="text-slate-400 font-bold mb-4">Total Activities</p>
          <h3 className="text-8xl font-black text-[#2D3663]">{totalActivities}</h3>
        </div>

        <div className="col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-slate-400 font-bold mb-6">Process Review Progress</p>
          <div className="grid grid-cols-4 gap-4 mb-8 text-center">
            <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Reviewed</p><p className="text-3xl font-black text-emerald-500">{reviewed}</p></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Action Required</p><p className="text-3xl font-black text-slate-400">{actionRequired}</p></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Expired</p><p className="text-3xl font-black text-red-500">{expired}</p></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Pending Review</p><p className="text-3xl font-black text-amber-400">{pendingReview}</p></div>
          </div>
          <div className="w-full h-12 bg-slate-100 rounded-xl overflow-hidden flex">
            {totalActivities > 0 ? (
              <>
                <div style={{ width: `${(reviewed/totalActivities)*100}%` }} className="bg-emerald-400 h-full" />
                <div style={{ width: `${(actionRequired/totalActivities)*100}%` }} className="bg-slate-400 h-full" />
                <div style={{ width: `${(expired/totalActivities)*100}%` }} className="bg-red-500 h-full" />
                <div style={{ width: `${(pendingReview/totalActivities)*100}%` }} className="bg-yellow-400 h-full" />
              </>
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">No Data Available</div>
            )}
          </div>
        </div>
      </div>

      {/* --- ส่วนที่ 2: กราฟตรงกลาง (ลดขนาด min-h ลงเพื่อให้ประหยัดพื้นที่) --- */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[300px] flex flex-col">
          <p className="text-slate-500 font-bold mb-6">RoPA Registration Progress</p>
          <div className="flex-1 flex items-center justify-center border-b border-l border-slate-100 relative">
            <span className="text-slate-300 font-bold italic opacity-40">Waiting for data...</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[300px] flex flex-col">
          <p className="text-slate-500 font-bold mb-6">Risk Level</p>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-40 h-40 rounded-full border-[15px] border-slate-50 flex items-center justify-center">
               <div className="text-center">
                 <p className="text-2xl font-black text-slate-200">{totalActivities}</p>
                 <p className="text-[10px] text-slate-300 font-bold uppercase">Total</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ส่วนที่ 3: Department Comparison (ใส่สีเข้มขึ้นเพื่อให้เห็นชัด) --- */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] min-h-[380px] flex flex-col mb-10">
        <p className="text-[#2D3663] font-black mb-8 text-xl">Department Comparison</p>
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex items-end justify-around h-56 border-b-2 border-slate-100 px-4 relative">
            
            {/* แสดงพื้นหลังหลอกๆ ถ้าไม่มีข้อมูล */}
            {(!data.departments || data.departments.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-slate-200 font-black italic tracking-widest text-xl opacity-60">PREVIEW MODE</span>
              </div>
            )}

            {displayDepartments.map((dept: any, index: number) => {
              const value = typeof dept === 'object' ? dept.value : 0;
              const name = typeof dept === 'object' ? dept.name : dept;
              const barHeight = value > 0 ? `${(value / 100) * 100}%` : '12px'; // ปรับความสูงขั้นต่ำเป็น 12px

              return (
                <div key={index} className="flex flex-col items-center w-full group relative">
                  <div 
                    style={{ height: barHeight }}
                    className={`w-12 rounded-t-lg transition-all duration-700 ${
                      value > 0 ? 'bg-blue-500' : 'bg-slate-200 opacity-50'
                    } group-hover:bg-blue-400`}
                  ></div>
                  <div className="absolute -bottom-12 text-center w-full">
                    <p className="text-[10px] font-black text-[#64748B] uppercase truncate px-1">{name}</p>
                    <p className="text-[10px] font-bold text-slate-300">{value > 0 ? value : '-'}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="h-16"></div> 
        </div>
      </div>
      
      {/* เพิ่มพื้นที่หายใจด้านล่างสุด */}
      <div className="h-10 w-full"></div>
    </div>
  );
}

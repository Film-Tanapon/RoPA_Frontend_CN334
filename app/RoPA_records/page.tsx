"use client";
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainForm from './components/processing_activity/step2_mainForm';
import UserManagement from './components/admin/create_user_form/UserManagement'; 

const mockData = [
  { id: 'PA-001', name: 'Employee Payroll', category: 'HR', legalBasis: 'Contract' },
  { id: 'PA-002', name: 'Customer Marketing', category: 'Marketing', legalBasis: 'Consent' },
  { id: 'PA-003', name: 'CCTV Surveillance', category: 'Security', legalBasis: 'Vital Interest' },
];

export default function RoPARecordsPage() {
  const [activeMenu, setActiveMenu] = useState('RoPA Records');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = mockData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    // --- 2. แก้ไข Logic: เช็คเมนู User Management ก่อนเป็นอันดับแรก ---
    if (activeMenu === 'User Management') {
      return <UserManagement searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
    }

    // ส่วนของ Dashboard หรือเมนูอื่นๆ ที่ยังไม่ทำ
    if (activeMenu === 'Dashboard') {
        return (
          <div className="flex flex-col h-full items-center justify-center animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Dashboard</h1>
            <p className="text-slate-400 font-bold italic">Dashboard metrics are coming soon...</p>
          </div>
        );
    }

    // --- 3. ปรับเงื่อนไข Default (Coming Soon) ให้ไปอยู่ท้ายสุด ---
    if (activeMenu !== 'RoPA Records') {
      return (
        <div className="flex flex-col h-full items-center justify-center animate-in fade-in duration-500">
          <h1 className="text-4xl font-black text-slate-900 mb-4">{activeMenu}</h1>
          <p className="text-slate-400 font-bold italic">This section is coming soon...</p>
        </div>
      );
    }

    if (isCreating) {
      return <MainForm onCancel={() => setIsCreating(false)} />;
    }

    // หน้าหลัก RoPA Records
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-slate-900">{activeMenu}</h1>
          <div className="flex items-center gap-4 w-1/2 justify-end">
            <div className="relative w-full max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search by name, ID or category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-full outline-none focus:border-[#8B93C5] transition-all shadow-sm font-medium text-slate-950"
              />
            </div>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-[#8B93C5] hover:bg-[#7a82b5] text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              + New
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-t-[2.5rem] border-2 border-slate-100 overflow-hidden flex flex-col shadow-sm">
          <div className="px-8 py-4 bg-[#D9E8F6] w-fit rounded-tr-[1.5rem] border-b-2 border-[#D9E8F6]">
            <span className="text-[#2D3663] font-bold">Processing Activities</span>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-[#E7F3FF] sticky top-0 z-10">
                <tr>
                  <th className="p-5 font-bold text-[#2D3663]">ID</th>
                  <th className="p-5 font-bold text-[#2D3663]">Activity Name</th>
                  <th className="p-5 font-bold text-[#2D3663]">Category</th>
                  <th className="p-5 font-bold text-[#2D3663]">Legal Basis</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="p-5 font-bold text-slate-500">{item.id}</td>
                      <td className="p-5 font-bold text-[#2D3663]">{item.name}</td>
                      <td className="p-5 text-slate-600">{item.category}</td>
                      <td className="p-5 text-slate-600">{item.legalBasis}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-slate-400 italic font-bold">
                      No results found for "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <Sidebar activeMenu={activeMenu} setActiveMenu={(menu) => {
        setActiveMenu(menu);
        setIsCreating(false); 
      }} />

      <div className="flex-1 p-0 bg-white">
        <div className="w-full h-full p-10">
          <div className="bg-slate-50 w-full h-full rounded-[3rem] border border-slate-200 p-10 shadow-sm overflow-hidden flex flex-col">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
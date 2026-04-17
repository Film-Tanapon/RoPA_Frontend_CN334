"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainForm from './components/processing_activity/step1';
import UserManagement from './components/admin/create_user_form/UserManagement'; 

export default function RoPARecordsPage() {
  const [activeMenu, setActiveMenu] = useState('RoPA Records');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]); 

  const API_URL = "http://localhost:3340/ropa-records";

  const loadRecords = async () => {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' }); 
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : data.data || data.records || []);
      } else {
        console.error("ไม่สามารถดึงข้อมูล RoPA ได้");
      }
    } catch (error) {
      console.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้:", error);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // 🌟 แก้ไข: ตัวแปรสำหรับการค้นหา
  const filteredData = records.filter((item) =>
    (item.activity_name || item.activityName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.id?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.data_category || item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteSelected = async () => {
    if (!window.confirm(`คุณต้องการลบข้อมูล ${selectedIds.length} รายการที่เลือกใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้`)) return;
    
    try {
      const token = localStorage.getItem("access_token");
      let successCount = 0;
      let failCount = 0;

      // วนลูปลบทีละรายการ
      for (const id of selectedIds) {
        // 👈 เช็ค URL ให้ตรงกับ Backend ของคุณนะครับ (มี s หรือไม่มี s)
        const res = await fetch(`http://localhost:3340/ropa-records/${id}`, {
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${token}` 
          }
        });

        // 🌟 เช็คว่าลบผ่านจริงๆ ไหม
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      }
      
      // สรุปผลการลบ
      if (failCount > 0) {
        alert(`ลบไม่สำเร็จ ${failCount} รายการ \n(ข้อมูลอาจถูกใช้งานอยู่ หรือเซิร์ฟเวอร์มีปัญหา)`);
      } else {
        alert("ลบข้อมูลสำเร็จ");
      }

      setSelectedIds([]); 
      loadRecords(); 
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };
  const renderContent = () => {
    if (activeMenu === 'User Management') {
      return <UserManagement searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
    }

    if (activeMenu === 'Dashboard') {
        return (
          <div className="flex flex-col h-full items-center justify-center animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Dashboard</h1>
            <p className="text-slate-400 font-bold italic">Dashboard metrics are coming soon...</p>
          </div>
        );
    }

    if (activeMenu !== 'RoPA Records') {
      return (
        <div className="flex flex-col h-full items-center justify-center animate-in fade-in duration-500">
          <h1 className="text-4xl font-black text-slate-900 mb-4">{activeMenu}</h1>
          <p className="text-slate-400 font-bold italic">This section is coming soon...</p>
        </div>
      );
    }

    if (isCreating || editingItem) {
      return (
        <MainForm 
          initialData={editingItem}
          onCancel={() => { 
            setIsCreating(false); 
            setEditingItem(null); 
          }} 
          onSuccess={() => { 
            setIsCreating(false); 
            setEditingItem(null);
            setSelectedIds([]); 
            loadRecords(); 
          }} 
        />
      );
    }

    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        
        {/* --- Top Toolbar --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full max-w-[320px]">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="ค้นหากิจกรรม, ID หรือหมวดหมู่..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-full text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#8B93C5]/20 text-slate-800"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50">
               <img src="https://www.svgrepo.com/show/532130/filter.svg" alt="filter" className="w-4 h-4 opacity-50" /> filter ▾
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 rounded-full text-sm font-bold text-slate-500 shadow-sm hover:bg-slate-50">
              <img src="https://www.svgrepo.com/show/521713/download.svg" alt="import" className="w-4 h-4 opacity-50" /> import
            </button>
            <button 
              onClick={() => { setIsCreating(true); setEditingItem(null); }}
              className="flex items-center gap-2 px-6 py-2 bg-[#8B93C5] text-white rounded-full font-bold shadow-md hover:bg-[#7a82b5] transition-all"
            >
              + New
            </button>
          </div>
        </div>

        {/* --- Main Table Area --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Header */}
          <div className="flex">
            <div className="px-6 py-2.5 bg-[#E9F2F9] border border-slate-300 border-b-0 text-[#2D3663] font-bold text-sm">
              บันทึกรายการกิจกรรมการประมวลผล
            </div>
            <div className="flex-1 border-b border-slate-300"></div>
          </div>
          
          {/* ✨ Bulk Action Toolbar */}
          {selectedIds.length > 0 && (
            <div className="bg-[#F8FAFC] border-x border-b border-slate-300 px-6 py-3 flex items-center justify-between transition-all animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-[#1E2A5E] font-bold text-[14px]">
                  เลือกแล้ว {selectedIds.length} รายการ
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (selectedIds.length > 1) {
                      alert('กรุณาเลือกแก้ไขทีละ 1 รายการ');
                    } else {
                      const itemToEdit = records.find(r => r.id === selectedIds[0]);
                      setEditingItem(itemToEdit);
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#F59E0B] text-white font-bold text-[13px] hover:bg-[#D97706] px-5 py-2 rounded-full transition-colors shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  แก้ไข
                </button>

                <button 
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 bg-[#EF4444] text-white font-bold text-[13px] hover:bg-[#DC2626] px-5 py-2 rounded-full transition-colors shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  ลบที่เลือก
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 bg-[#F4F9FD] border-x border-b border-slate-300 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#E9F2F9] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 w-12 text-center border-b border-slate-200">
                    <input 
                      type="checkbox" 
                      className="rounded-sm w-4 h-4 cursor-pointer"
                      checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                      onChange={(e) => setSelectedIds(e.target.checked ? filteredData.map(d => d.id) : [])}
                    />
                  </th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] border-b border-slate-200">ID</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] border-b border-slate-200">ชื่อกิจกรรม</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] border-b border-slate-200">เจ้าของข้อมูล</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] border-b border-slate-200">หมวดหมู่กิจกรรม</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] text-center border-b border-slate-200">ระดับความเสี่ยง</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] text-center border-b border-slate-200">สถานะ</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] border-b border-slate-200">วันที่เพิ่ม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded-sm w-4 h-4 cursor-pointer"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                        />
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{item.id || '-'}</td>
                      
                      {/* 🌟 แก้ไข: ตัวแปรสำหรับการแสดงผลตาราง */}
                      <td className="p-4 font-bold text-[#2D3663]">{item.activity_name || item.activityName || '-'}</td>
                      <td className="p-4 text-slate-600">{item.data_subject || item.dataSubject || '-'}</td>
                      <td className="p-4 text-slate-600">{item.data_category || item.category || '-'}</td>
                      
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          (item.risk_level || item.riskLevel) === 'สูง' ? 'bg-red-100 text-red-600' :
                          (item.risk_level || item.riskLevel) === 'ปานกลาง' ? 'bg-amber-100 text-amber-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {item.risk_level || item.riskLevel || 'ไม่ระบุ'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                          <span className={`text-[12px] font-bold ${item.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
                            {item.status || 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {/* ดึงวันที่จากตัวใดตัวหนึ่ง ถ้าไม่มีก็แสดง - */}
                        {item.create_date || item.dateAdded ? new Date(item.create_date || item.dateAdded).toLocaleDateString('th-TH') : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-16 text-center text-slate-400 italic font-bold bg-white">
                      ไม่พบข้อมูล
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
        setEditingItem(null); 
        setSelectedIds([]); 
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
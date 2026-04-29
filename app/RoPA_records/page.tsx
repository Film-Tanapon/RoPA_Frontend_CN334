"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RopaCombinedForm from './components/processing_activity/step1';
import UserManagement from './components/admin/create_user_form/UserManagement';
import ExpirationAlert from './components/ExpirationAlert/ExpirationAlert';
import Feedback from './components/Feedback/Feedback';
import Dashboard from './components/Dashboard/Dashboard';
import TotalActivitiesTable from './components/Dashboard/TotalActivitiesTable';
import PendingReview from './components/Dashboard/PendingReview';
import DeleteRequest from './components/Dashboard/DeleteRequest';
import ExtendRetention from './components/Dashboard/ExtendRetention';
import SharedRecords from './components/SharedRecords';

import { jwtDecode } from "jwt-decode";

const API_URL_BASE = process.env.API_URL || 'http://localhost:3340';

export default function RoPARecordsPage() {
  const [activeMenu, setActiveMenu] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);

  const API_URL = `${API_URL_BASE}/ropa-records`;

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      return "-";
    }
  };
  // ทำให้คำนวณเวลาแบบ Relative Time (1 min ago, บลาๆๆ)
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (diffInSeconds < 5) return "just now";

      const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'min', seconds: 60 },
        { label: 'sec', seconds: 1 }
      ];

      for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
          return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
      }
      return "-";
    } catch (e) {
      return "-";
    }
  };

  const loadRecords = async () => {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : data.data || data.records || []);
      }
    } catch (error) {
      console.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const role = decoded.role;
        setUserRole(role);

        if (role === 'Admin') {
          setActiveMenu('User Management');
        } else if (['Executive', 'Auditor', 'DPO(Data Protection Officer)'].includes(role)) {
          setActiveMenu('Dashboard');
        } else if (role === 'Data Controller' || role === 'Data Processor') {
          setActiveMenu('RoPA Records');
        } else {
          setActiveMenu('Feedback');
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
    loadRecords();
  }, []);

  const handleDeleteSelected = async () => {
    if (!window.confirm(`คุณต้องการลบข้อมูล ${selectedIds.length} รายการที่เลือกใช่หรือไม่?`)) return;
    try {
      const token = localStorage.getItem("access_token");
      for (const id of selectedIds) {
        await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
      alert("ลบข้อมูลสำเร็จ");
      setSelectedIds([]);
      loadRecords();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const renderContent = () => {
    if (!activeMenu) return null;

    if (activeMenu === 'User Management') return <UserManagement searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
    if (activeMenu === 'Dashboard') return <Dashboard />;
    if (activeMenu === 'Feedback') return <Feedback />;
    if (activeMenu === 'Expiration Alert') return <ExpirationAlert />;
    if (activeMenu === 'TotalActivities') return <TotalActivitiesTable onEdit={(item) => { setEditingItem(item); setIsCreating(true); }} userRole={userRole} />; 
    if (activeMenu === 'Pending Review') return <PendingReview />;
    if (activeMenu === 'Delete Request') return <DeleteRequest userRole={userRole} />;
    if (activeMenu === 'Extend Retention') return <ExtendRetention />;
    if (activeMenu === 'Shared Records') return <SharedRecords/>;

    if (isCreating || editingItem) {
      return (
        <RopaCombinedForm
          initialData={editingItem}
          onCancel={() => { setIsCreating(false); setEditingItem(null); }}
          onSuccess={() => { setIsCreating(false); setEditingItem(null); loadRecords(); }}
          userRole={userRole}
        />
      );
    }

    const filteredData = records.filter((item) =>
      (item.activity_name || item.activityName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const getStatusStyles = (status?: string) => {
      switch (status) {
        case 'Expired':
          return 'bg-red-500 text-white';
        case 'Reviewed':
          return 'bg-green-600 text-white';
        case 'Pending':
          return 'bg-amber-400 text-white'; // สีเหลือง
        case 'Action Required':
          return 'bg-slate-400 text-white';
        default:
          return 'bg-green-600 text-white'; // สีเขียว (กรณี Active หรืออื่นๆ)
      }
    };
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full max-w-[320px]">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="ค้นหากิจกรรม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#8B93C5]/20 text-slate-800"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsCreating(true); setEditingItem(null); }}
              className="flex items-center gap-2 px-6 py-2 bg-[#8B93C5] text-white rounded-full font-bold shadow-md hover:bg-[#7a82b5] transition-all"
            >
              + New
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="relative flex items-end">
            <div className="px-6 py-2.5 bg-[#E9F2F9] border border-slate-300 border-b-0 text-[#2D3663] font-bold text-sm rounded-t-lg">
              บันทึกรายการกิจกรรมการประมวลผล
            </div>

            {selectedIds.length > 0 && (
              <div className="absolute right-0 bottom-2 flex gap-2 animate-in fade-in slide-in-from-right-4">
                {selectedIds.length === 1 && (
                  <button
                    onClick={() => {
                      const item = records.find(r => r.id === selectedIds[0]);
                      setEditingItem(item);
                      setIsCreating(true);
                    }}
                    className="flex items-center gap-2 px-5 py-1.5 bg-[#FFB200] text-white rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-[#e6a000] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    แก้ไข
                  </button>
                )}

              </div>
            )}
            <div className="flex-1 border-b border-slate-300"></div>
          </div>

          <div className="flex-1 bg-white border-x border-b border-slate-300 overflow-auto rounded-b-xl shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#E9F2F9] sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded-sm w-4 h-4 cursor-pointer"
                      checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                      onChange={(e) => setSelectedIds(e.target.checked ? filteredData.map(d => d.id) : [])}
                    />
                  </th>
                  <th className="p-4 font-bold text-[#2D3663]">ID</th>
                  <th className="p-4 font-bold text-[#2D3663]">ชื่อกิจกรรม</th>
                  <th className="p-4 font-bold text-[#2D3663]">เจ้าของข้อมูล</th>
                  <th className="p-4 font-bold text-[#2D3663]">หมวดหมู่</th>
                  <th className="p-4 font-bold text-[#2D3663] text-center">ระดับความเสี่ยง</th>
                  <th className="p-4 font-bold text-[#2D3663] text-center">สถานะ</th>
                  <th className="p-4 font-bold text-[#2D3663] text-right">วันที่สร้าง</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 border-b border-slate-100 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                        />
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{item.id}</td>
                      <td className="p-4 font-bold text-[#2D3663]">{item.activity_name || item.activityName || '-'}</td>
                      <td className="p-4 text-slate-600">{item.data_subject || '-'}</td>
                      <td className="p-4 text-slate-600">{item.data_category || '-'}</td>
                      <td className="p-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${item.risk_level === 'ความเสี่ยงระดับสูง'
                          ? 'bg-red-50 text-red-500'
                          : item.risk_level === 'ความเสี่ยงระดับกลาง'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-emerald-50 text-emerald-500'
                          }`}>
                          {item.risk_level || 'ความเสี่ยงระดับต่ำ'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${getStatusStyles(item.status)}`}>
                          {item.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400 italic font-bold whitespace-nowrap">
                        {formatDate(item.create_date)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={8} className="p-20 text-center text-slate-400 italic">ไม่พบข้อมูล</td></tr>
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
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={(menu) => {
          setActiveMenu(menu);
          setIsCreating(false);
          setEditingItem(null);
          setSelectedIds([]);
        }}
        userRole={userRole}
      />
      <div className="flex-1 p-0 bg-white shadow-inner">
        <div className="w-full h-full p-10">
          <div className="bg-slate-50 w-full h-full rounded-[3rem] border border-slate-200 p-10 shadow-sm overflow-hidden flex flex-col">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
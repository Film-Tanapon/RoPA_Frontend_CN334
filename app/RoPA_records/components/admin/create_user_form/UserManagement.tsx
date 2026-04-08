"use client";
import React, { useState, useEffect } from 'react';
import UserStep1 from './UserStep1';
import UserStep2 from './UserStep2';

export default function UserManagement({ searchTerm, setSearchTerm }: any) {
  // --- 1. เตรียม State สำหรับเก็บข้อมูลจาก API ---
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [tempData, setTempData] = useState<any>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const API_URL = "http://localhost:3340/users";

  const [filters, setFilters] = useState({
    status: 'All Status',
    role: 'All Role',
    date: 'All Date'
  });

  const options = {
    status: ['All Status', 'Active', 'Inactive'],
    role: ['All Role', 'Admin', 'Data Owner', 'Viewer'],
    date: ['All Date', 'Newest', 'Oldest']
  };

  // --- 2. ดึงข้อมูลจาก API ตอนเปิดหน้า ---
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        // เช็คเผื่อ API ส่งมาเป็น Object จะได้ไม่พังตอน .filter()
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers(data.data || data.users || []);
        }
      })
      .catch(err => console.error("Fetch Error:", err));
  }, []);

  // --- 3. Logic สำหรับการกรองและเรียงลำดับ ---
  // ป้องกัน users ไม่ใช่ Array
  const safeUsers = Array.isArray(users) ? users : [];
  
  const filteredUsers = safeUsers
    .filter(user => {
      // แก้ให้ใช้ fullname และ email ตาม Backend
      const searchWord = searchTerm?.toLowerCase() || '';
      const nameMatch = user?.fullname?.toLowerCase().includes(searchWord) || false;
      const emailMatch = user?.email?.toLowerCase().includes(searchWord) || false;
      const matchesSearch = nameMatch || emailMatch;

      const matchesStatus = filters.status === 'All Status' || user.status === filters.status;
      // บางทีใน DB อาจเก็บตัวพิมพ์เล็ก/ใหญ่ต่างกัน เลยแปลงก่อนเทียบ
      const matchesRole = filters.role === 'All Role' || user?.role?.toLowerCase() === filters.role.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      if (filters.date === 'Newest') return b.id - a.id; // ไอดีเยอะ = ใหม่สุด
      if (filters.date === 'Oldest') return a.id - b.id; // ไอดิน้อย = เก่าสุด
      return 0;
    });

  // --- 4. Logic สำหรับการเลือก Checkbox ---
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // --- 5. ยิง API ลบข้อมูลทีละหลายคน ---
  const handleBulkDelete = async () => {
    if (window.confirm(`ลบผู้ใช้งานที่เลือกจำนวน ${selectedIds.length} รายการ?`)) {
      try {
        await Promise.all(selectedIds.map(id => 
          fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        ));
        // อัปเดต UI หลังจากลบสำเร็จ
        setUsers(users.filter(user => !selectedIds.includes(user.id)));
        setSelectedIds([]);
      } catch (error) {
        console.error("Error deleting users:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  // --- 6. ยิง API บันทึก User ใหม่ไปที่ /signup ---
  const handleFinalSubmit = async (finalData: any) => {
    // รวมข้อมูลจาก Step 1 (tempData) และ Step 2 (finalData = role)
    const newUser = {
      ...tempData,
      ...finalData, 
    };

    try {
      // เปลี่ยน Path เป็น /signup
      const res = await fetch("http://localhost:3340/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      if (res.ok) {
        // บางครั้ง API /signup อาจจะไม่ได้คืนค่าเป็น Object User กลับมา 
        // ถ้าคืนค่ามา เราก็เอาไปโชว์ในตารางได้เลย
        const savedUser = await res.json();
        
        // ถ้าระบบ Backend ส่งข้อมูล User ที่บันทึกสำเร็จกลับมาด้วย ก็ให้เอามาต่อใน State
        // แต่ถ้า Backend ส่งแค่ message: "Success" แนะนำให้ใช้ fetch(API_URL) ดึงใหม่ทั้งหมดครับ
        if (savedUser && savedUser.username) {
             setUsers([savedUser, ...users]);
        } else {
             // ทางเลือก: ดึงข้อมูลใหม่ทั้งหมดจาก DB ถ้า Backend ไม่ได้คืน Object กลับมา
             fetch(API_URL).then(res => res.json()).then(data => {
                setUsers(Array.isArray(data) ? data : (data.data || data.users || []));
             });
        }

        setIsAddingNew(false);
        setFormStep(1);
        setTempData({});
        alert("สร้างผู้ใช้งานสำเร็จ!");
      } else {
        const errData = await res.json();
        alert(errData.detail || "บันทึกข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("ไม่สามารถติดต่อ Server ได้");
    }
  };

  // --- UI ส่วนการเพิ่มคนใหม่ ---
  if (isAddingNew) {
    return (
      <div className="flex flex-col h-full bg-white rounded-[3rem] p-10 shadow-sm animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-slate-50">
          <h2 className="text-2xl font-black text-[#2D3663]">Create New User</h2>
          <button 
            onClick={() => { setIsAddingNew(false); setFormStep(1); }}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-400 transition-colors"
          >✕</button>
        </div>
        <div className="flex-1 overflow-auto">
          {formStep === 1 ? (
            <UserStep1 onNext={(data: any) => { setTempData(data); setFormStep(2); }} />
          ) : (
            <UserStep2 onBack={() => setFormStep(1)} onSubmit={handleFinalSubmit} />
          )}
        </div>
      </div>
    );
  }

  // --- UI ส่วนปุ่ม Filter ---
  const FilterButton = ({ type }: { type: 'status' | 'role' | 'date' }) => (
    <div className="relative">
      <button 
        onClick={() => setOpenDropdown(openDropdown === type ? null : type)}
        className="px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all"
      >
        <span>{type === 'status' ? '⚙️' : type === 'role' ? '👤' : '📅'}</span>
        {filters[type]} <span className="text-[10px]">▼</span>
      </button>
      {openDropdown === type && (
        <div className="absolute top-full mt-2 left-0 w-44 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 py-1">
          {options[type].map(opt => (
            <button 
              key={opt}
              onClick={() => { setFilters({ ...filters, [type]: opt }); setOpenDropdown(null); }}
              className={`w-full text-left px-5 py-2.5 text-sm font-medium ${filters[type] === opt ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-full outline-none focus:border-[#8B93C5] transition-all text-slate-900 shadow-sm"
            />
          </div>
          <FilterButton type="status" />
          <FilterButton type="date" />
          <FilterButton type="role" />
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-white border-2 border-slate-100 rounded-full font-bold text-slate-600">📤 Export</button>
          <button 
            onClick={() => setIsAddingNew(true)} 
            className="px-8 py-2.5 bg-[#8B93C5] text-white rounded-full font-black shadow-lg hover:bg-[#7a82b5] active:scale-95 transition-all"
          >+ New</button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[3rem] border-2 border-slate-50 overflow-hidden flex flex-col shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#E7F3FF]/50 border-b border-slate-100">
            <tr>
              <th className="p-6 w-12">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded-md border-slate-300 w-4 h-4" 
                />
              </th>
              {selectedIds.length > 0 ? (
                <th colSpan={5} className="p-6">
                  <div className="flex items-center justify-between animate-in slide-in-from-left-4">
                    <span className="text-[#2D3663] font-black">Selected {selectedIds.length} users</span>
                    <button onClick={handleBulkDelete} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold shadow-md">🗑️ Delete Selected</button>
                  </div>
                </th>
              ) : (
                <>
                  <th className="p-6 font-black text-[#2D3663] uppercase">Full Name</th>
                  <th className="p-6 font-black text-[#2D3663] uppercase">Email</th>
                  <th className="p-6 font-black text-[#2D3663] uppercase">Role</th>
                  <th className="p-6 font-black text-[#2D3663] uppercase">Department</th>
                  <th className="p-6 font-black text-[#2D3663] uppercase">Last Active</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(user.id) ? 'bg-blue-50/30' : ''}`}>
                <td className="p-6">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="rounded-md border-slate-300 w-4 h-4" 
                  />
                </td>
                {/* 7. แก้ไขชื่อตัวแปรให้ตรงกับ Backend */}
                <td className="p-6 font-bold text-slate-800">{user.fullname || user.username || '-'}</td>
                <td className="p-6 text-slate-500 font-medium">{user.email || '-'}</td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[0.7rem] font-black uppercase ${user.role?.toLowerCase() === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{user.role || 'VIEWER'}</span>
                </td>
                <td className="p-6 text-slate-500 font-medium">{user.departments || '-'}</td>
                <td className="p-6 text-slate-400 italic font-bold">
                  {user.create_date ? new Date(user.create_date).toLocaleDateString('en-GB') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
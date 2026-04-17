"use client";
import React, { useState, useEffect } from 'react';
import UserStep1 from './UserStep1';
import UserStep2 from './UserStep2';

export default function UserManagement({ searchTerm, setSearchTerm }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formStep, setFormStep] = useState(1);
  const [tempData, setTempData] = useState<any>({});
  
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const API_URL = "http://localhost:3340/users";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else setUsers(data.data || data.users || []);
      })
      .catch(err => console.error("Fetch Error:", err));
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`คุณต้องการลบผู้ใช้งาน ${selectedIds.length} รายการที่เลือกใช่หรือไม่?`)) return;
    
    try {
      const token = localStorage.getItem('access_token');
      console.log(token)
      const deletePromises = selectedIds.map(id => 
        fetch(`${API_URL}/${id}`, { method: 'DELETE' ,headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }}) 
      );
      const results = await Promise.all(deletePromises);
      if (results.every(res => res.ok)) {
        alert("ลบข้อมูลสำเร็จ!");
        setSelectedIds([]);
        loadUsers();
      } else {
        alert("เกิดข้อผิดพลาดบางรายการในการลบ");
        loadUsers();
      }
    } catch (err) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleEditClick = () => {
    const userToEdit = users.find(u => u.id === selectedIds[0]);
    if (userToEdit) {
      setEditingUser(userToEdit);
      const initialInfo = {
        username: userToEdit.username || '',
        fullname: userToEdit.fullname || '',
        email: userToEdit.email || '',
        tel: userToEdit.tel || '',
        departments: userToEdit.departments || 'IT Support',
        status: userToEdit.status || 'Active', // เก็บสถานะเดิมไว้ใน tempData
        password_hash: ''
      };
      setTempData(initialInfo);
      setIsEditing(true);
      setFormStep(1);
    }
  };


  const handleUpdateSubmit = async (finalData: any) => {
    const combined = { ...tempData, ...finalData };
    const payload: any = {
      fullname: combined.fullname,
      email: combined.email,
      username: combined.username,
      tel: combined.tel,
      departments: combined.departments,
      role: combined.role,
      status: combined.status 
    };
    
    if (combined.password_hash && combined.password_hash.trim() !== "") {
      payload.password_hash = combined.password_hash;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`},
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("อัปเดตข้อมูลสำเร็จ!");
        loadUsers();
        closeForm();
        setSelectedIds([]);
      } else {
        const errorDetail = await res.json();
        alert("ไม่สามารถอัปเดตได้: " + (errorDetail.detail || JSON.stringify(errorDetail)));
      }
    } catch (err) {
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };

  const handleFinalSubmit = async (finalData: any) => {
    const combined = { ...tempData, ...finalData };
    const payload = {
      username: combined.username,
      fullname: combined.fullname,
      email: combined.email,
      tel: combined.tel,
      departments: combined.departments,
      role: combined.role,
      status: combined.status, 
      password_hash: combined.password_hash
    };
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch("http://localhost:3340/user", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`},
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("สร้างผู้ใช้งานสำเร็จ!");
        loadUsers();
        closeForm();
      } else {
        const errData = await res.json();
        alert("บันทึกไม่สำเร็จ: " + (errData.detail || JSON.stringify(errData)));
      }
    } catch (error) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  const closeForm = () => {
    setIsAddingNew(false);
    setIsEditing(false);
    setFormStep(1);
    setTempData({});
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.fullname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.username?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const userStatus = u.status || "Active";
    const matchesStatus = statusFilter === "All" || userStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isAddingNew || isEditing) {
    return (
      <div className="flex flex-col h-full bg-white rounded-[3rem] p-10 shadow-sm animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-slate-50">
          <h2 className="text-2xl font-black text-[#2D3663]">
            {isEditing ? `Edit User: ${editingUser?.fullname}` : "Create New User"}
          </h2>
          <button onClick={closeForm} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-400">✕</button>
        </div>
        <div className="flex-1 overflow-auto">
          {formStep === 1 ? (
            <UserStep1 initialData={isEditing ? tempData : null} onNext={(data: any) => { setTempData(data); setFormStep(2); }} />
          ) : (
            <UserStep2 
              initialRole={isEditing ? editingUser?.role : 'Viewer'} 
              initialStatus={isEditing ? (editingUser?.status || 'Active') : 'Active'} // ✨ ส่งค่า Status ไปยัง Step 2
              isEditMode={isEditing} 
              onBack={() => setFormStep(1)} 
              onSubmit={isEditing ? handleUpdateSubmit : handleFinalSubmit} 
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full max-w-[280px]">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#8B93C5]/20 text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => {
              const statuses = ["All", "Active", "Inactive"];
              const next = statuses[(statuses.indexOf(statusFilter) + 1) % statuses.length];
              setStatusFilter(next);
            }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold transition-all ${statusFilter !== "All" ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-500'}`}
          >
             🔖 สถานะ: {statusFilter} ▾
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50">
             📅 วันที่ ▾
          </button>
          
          <button 
            onClick={() => {
              const roles = ["All", "Admin", "Data Controller", "Viewer"];
              const next = roles[(roles.indexOf(roleFilter) + 1) % roles.length];
              setRoleFilter(next);
            }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold transition-all ${roleFilter !== "All" ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500'}`}
          >
             👤 บทบาท: {roleFilter} ▾
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50">📤 Export</button>
          <button className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50">📥 Import</button>
          <button
            onClick={() => { setIsAddingNew(true); setIsEditing(false); setTempData({}); setFormStep(1); }}
            className="flex items-center gap-2 px-8 py-2 bg-[#8B93C5] text-white rounded-full font-black shadow-lg hover:scale-105 transition-transform"
          >
            + New
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#E9F2F9] border-b border-slate-100">
            <tr>
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => setSelectedIds(e.target.checked ? filteredUsers.map(u => u.id) : [])}
                  className="rounded-md w-4 h-4 cursor-pointer"
                />
              </th>
              {selectedIds.length > 0 ? (
                <th colSpan={8} className="p-4 bg-white/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[#2D3663] font-black">เลือกแล้ว {selectedIds.length} รายการ</span>
                    <div className="flex gap-2">
                      {selectedIds.length === 1 && (
                        <button onClick={handleEditClick} className="px-6 py-1.5 bg-amber-500 text-white rounded-full font-bold shadow-md hover:bg-amber-600 transition-colors flex items-center gap-2">
                          <img src="https://www.svgrepo.com/show/442480/edit.svg" alt="edit" className="h-4 w-4 invert"/> แก้ไข
                        </button>
                      )}
                      <button onClick={handleDeleteSelected} className="px-6 py-1.5 bg-red-500 text-white rounded-full font-bold shadow-md hover:bg-red-600 transition-colors flex items-center gap-2">
                        <img src="https://www.svgrepo.com/show/299401/recycle-bin-trash.svg" alt="del" className="h-4 w-4 invert" /> ลบที่เลือก
                      </button>
                    </div>
                  </div>
                </th>
              ) : (
                <>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px]">ID</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px]">ชื่อ-นามสกุล</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px]">อีเมล</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px]">ชื่อบัญชีผู้ใช้งาน</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] text-center">สถานะ</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] text-center">บทบาท</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px]">แผนก</th>
                  <th className="p-4 font-bold text-[#2D3663] text-[13px] text-right pr-6">ใช้งานล่าสุด</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(user.id) ? 'bg-[#F0F7FF]' : ''}`}>
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => setSelectedIds(prev => prev.includes(user.id) ? prev.filter(i => i !== user.id) : [...prev, user.id])}
                    className="rounded-md w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="p-4 text-slate-500 font-medium">{user.id}</td>
                <td className="p-4 font-bold text-slate-800">{user.fullname || '-'}</td>
                <td className="p-4 text-slate-500 font-medium">{user.email || '-'}</td>
                <td className="p-4 text-slate-500 font-medium">{user.username || '-'}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.status === 'Inactive' ? 'bg-slate-300' : 'bg-green-500'}`}></div>
                    <span className={`font-bold text-[12px] ${user.status === 'Inactive' ? 'text-slate-400' : 'text-green-600'}`}>
                      {user.status || 'Active'}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${user.role?.toLowerCase() === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {user.role || 'VIEWER'}
                  </span>
                </td>
                <td className="p-4 text-slate-500 font-medium">{user.departments || '-'}</td>
                <td className="p-4 text-right pr-6 text-slate-400 italic font-bold">11/04/2026</td>
              </tr>
            )) : (
              <tr><td colSpan={9} className="p-10 text-center text-slate-400 font-bold">ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไข</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
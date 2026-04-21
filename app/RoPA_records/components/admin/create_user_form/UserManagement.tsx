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

  // Filters State
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All");

  // Dropdown Toggle State
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

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
      const deletePromises = selectedIds.map(id =>
        fetch(`${API_URL}/${id}`, {
          method: 'DELETE', headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
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
        status: userToEdit.status || 'Active',
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
          'Authorization': `Bearer ${token}`
        },
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
          'Authorization': `Bearer ${token}`
        },
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
              initialStatus={isEditing ? (editingUser?.status || 'Active') : 'Active'}
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

      {/* ----------------- แถบด้านบน ----------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-20">

        {/* ฝั่งซ้าย: กล่องค้นหา และ ตัวกรอง */}
        <div className="flex flex-wrap items-center gap-3 flex-1">

          {/* ค้นหา */}
          <div className="relative w-full max-w-[280px]">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#8B93C5]/20 text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ตัวกรอง: สถานะ (Custom Dropdown) */}
          <div className="relative">
            <button
              onClick={() => { setIsStatusOpen(!isStatusOpen); setIsRoleOpen(false); setIsDateOpen(false); }}
              className={`flex items-center gap-2 pl-4 pr-3 py-2 border rounded-full text-xs font-bold transition-all outline-none shadow-sm ${statusFilter !== "All"
                ? 'bg-green-50 border-green-200 text-green-600'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
            >
              <img
                src="https://www.svgrepo.com/show/356007/badge.svg"
                width="14"
                height="14"
                alt="badge icon"
                className="w-3.5 h-3.5"
              />
              สถานะ: {statusFilter}
              <span className="text-[10px] ml-1">{isStatusOpen ? '▲' : '▼'}</span>
            </button>

            {isStatusOpen && (
              <div className="absolute top-full left-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {["All", "Active", "Inactive"].map((status) => (
                  <div
                    key={status}
                    onClick={() => { setStatusFilter(status); setIsStatusOpen(false); }}
                    className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${statusFilter === status ? 'bg-green-50 text-green-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {status === "All" ? "ทั้งหมด (All)" : status}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* ตัวกรอง: วันที่ (Custom Dropdown) */}
          <div className="relative">
            <button
              onClick={() => { setIsDateOpen(!isDateOpen); setIsStatusOpen(false); setIsRoleOpen(false); }}
              className={`flex items-center gap-2 pl-4 pr-3 py-2 border rounded-full text-xs font-bold transition-all outline-none shadow-sm ${dateFilter !== "All"
                ? 'bg-purple-50 border-purple-200 text-purple-600'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
            >
              <img
                src="https://www.svgrepo.com/show/381187/date-calendar-schedule-event-appointment.svg"
                width="14"
                height="14"
                alt="badge icon"
                className="w-3.5 h-3.5"
              />
              Date: {dateFilter}
              <span className="text-[10px] ml-1">{isDateOpen ? '▲' : '▼'}</span>
            </button>

            {isDateOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {["All", "Today", "Last 7 Days", "Last 30 Days"].map((date) => (
                  <div
                    key={date}
                    onClick={() => { setDateFilter(date); setIsDateOpen(false); }}
                    className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${dateFilter === date ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {date === "All" ? "ทั้งหมด (All)" : date}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ตัวกรอง: Role (Custom Dropdown) */}
          <div className="relative">
            <button
              onClick={() => { setIsRoleOpen(!isRoleOpen); setIsStatusOpen(false); setIsDateOpen(false); }}
              className={`flex items-center gap-2 pl-4 pr-3 py-2 border rounded-full text-xs font-bold transition-all outline-none shadow-sm ${roleFilter !== "All"
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
            >
              <img
                src="https://www.svgrepo.com/show/532363/user-alt-1.svg"
                width="14"
                height="14"
                alt="badge icon"
                className="w-3.5 h-3.5"
              />
              Role: {roleFilter === "DPO(Data Protection Officer)" ? "DPO" : roleFilter}
              <span className="text-[10px] ml-1">{isRoleOpen ? '▲' : '▼'}</span>
            </button>

            {isRoleOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {["All", "Data Controller", "Data Processor", "DPO(Data Protection Officer)", "Admin", "Auditor", "Excutive"].map((role) => (
                  <div
                    key={role}
                    onClick={() => { setRoleFilter(role); setIsRoleOpen(false); }}
                    className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${roleFilter === role ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {role === "All" ? "ทั้งหมด (All)" : role}
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>

        {/* ฝั่งขวา: ปุ่ม Action */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Import
          </button>

          <button
            onClick={() => { setIsAddingNew(true); setIsEditing(false); setTempData({}); setFormStep(1); }}
            className="flex items-center justify-center px-6 py-2 bg-[#8B93C5] text-white rounded-full text-sm font-bold shadow-md hover:bg-[#7a82b3] transition-colors"
          >
            + New
          </button>
        </div>
      </div>
      {/* ------------------------------------------------------------------ */}

      {/* ส่วนตาราง Z-index ต่ำกว่า Dropdown */}
      <div className="relative z-10 flex-1 bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col shadow-sm">
        <table className="w-full text-left text-sm border-collapse table-fixed">
          <thead className="bg-[#E9F2F9] border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 w-[5%] text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => setSelectedIds(e.target.checked ? filteredUsers.map(u => u.id) : [])}
                  className="rounded-md w-4 h-4 cursor-pointer"
                />
              </th>
              {selectedIds.length > 0 ? (
                <th colSpan={7} className="px-6 py-4 bg-white/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[#2D3663] font-black">เลือกแล้ว {selectedIds.length} รายการ</span>
                    <div className="flex gap-2">
                      {selectedIds.length === 1 && (
                        <button onClick={handleEditClick} className="px-6 py-1.5 bg-amber-500 text-white rounded-full font-bold shadow-md hover:bg-amber-600 transition-colors flex items-center gap-2">
                          <img src="https://www.svgrepo.com/show/442480/edit.svg" alt="edit" className="h-4 w-4 invert" /> แก้ไข
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
                  <th className="px-6 py-4 font-bold text-[#2D3663] text-[13px] w-[5%] whitespace-nowrap">ID</th>
                  <th className="px-6 py-4 font-bold text-[#2D3663] text-[13px] w-[20%] whitespace-nowrap">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 font-bold text-[#2D3663] text-[13px] w-[20%] whitespace-nowrap">อีเมล</th>
                  <th className="px-6 py-4 font-bold text-[#2D3663] text-[13px] w-[15%] whitespace-nowrap">ชื่อบัญชีผู้ใช้งาน</th>
                  <th className="px-6 py-4 font-bold text-[#2D3663] text-[13px] text-center w-[12%] whitespace-nowrap">สถานะ</th>
                  <th className="px-6 py-4 font-bold text-[#2D3663] text-[13px] w-[13%] whitespace-nowrap">แผนก</th>
                  <th className="px-6 py-4 font-bold text-[#2D3663] text-[13px] text-right w-[10%] whitespace-nowrap">ใช้งานล่าสุด</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(user.id) ? 'bg-[#F0F7FF]' : ''}`}>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => setSelectedIds(prev => prev.includes(user.id) ? prev.filter(i => i !== user.id) : [...prev, user.id])}
                    className="rounded-md w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">{user.id}</td>

                <td className="px-6 py-4 font-bold text-slate-800 truncate" title={user.fullname}>
                  {user.fullname || '-'}
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium truncate" title={user.email}>
                  {user.email || '-'}
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium truncate" title={user.username}>
                  {user.username || '-'}
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${user.status === 'Active' || !user.status
                      ? 'bg-[#239D62] text-white'
                      : user.status?.toLowerCase() === 'inactive'
                        ? 'bg-[#FFB200] text-white '
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                      {user.status || 'ACTIVE'}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-slate-500 font-medium truncate" title={user.departments}>
                  {user.departments || '-'}
                </td>

                <td className="px-6 py-4 text-right text-slate-400 italic font-bold whitespace-nowrap">11/04/2026</td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="p-10 text-center text-slate-400 font-bold">ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไข</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
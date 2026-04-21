"use client";
import React, { useState, useEffect } from 'react';

export default function UserStep2({
  onBack,
  onSubmit,
  initialRole,
  initialStatus,
  initialDepartment,
  isEditMode
}: {
  onBack: () => void,
  onSubmit: (data: any) => void,
  initialRole?: string,
  initialStatus?: string,
  initialDepartment?: string,
  isEditMode: boolean
}) {
  const [selectedRole, setSelectedRole] = useState(initialRole || 'Viewer');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || 'Active');
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment || '');

  useEffect(() => {
    if (initialRole) setSelectedRole(initialRole);
    if (initialStatus) setSelectedStatus(initialStatus);
    if (initialDepartment) setSelectedDepartment(initialDepartment);
  }, [initialRole, initialStatus, initialDepartment]);

  // ใช้ Role ใหม่ตามที่คุณระบุไว้
  const roles = [
    { title: 'Data Controller' },
    { title: 'Data Processor' },
    { title: 'DPO(Data Protection Officer)' },
    { title: 'Admin' },
    { title: 'Auditor' },
    { title: 'Excutive' }
  ];

  const statuses = [
    { title: 'Active', desc: 'User can log in and access the system', color: 'bg-green-500' },
    { title: 'Inactive', desc: 'Suspend user access to the system', color: 'bg-slate-300' }
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">

      {/* --- Section 1: Role Selection --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#8B93C5] rounded-full"></span>
          Assign User Role
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {roles.map((role) => (
            <div key={role.title} className="flex flex-col gap-2">
              <div
                onClick={() => setSelectedRole(role.title)}
                className={`p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedRole === role.title
                    ? 'border-[#8B93C5] bg-[#F8F9FF] shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === role.title ? 'border-[#2D3663]' : 'border-slate-300'
                  }`}>
                  {selectedRole === role.title && (
                    <div className="w-2.5 h-2.5 bg-[#2D3663] rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-black text-[#2D3663] text-sm">{role.title}</p>
                </div>
              </div>

              {/* Conditional Rendering ช่องไว้เลือกแผนก */}
              {role.title === 'Data Controller' && selectedRole === 'Data Controller' && (
                <div className="ml-8 mt-1 mb-2 p-5 border-2 border-slate-100 rounded-[1.2rem] bg-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-black text-slate-700 ml-1">Select Department <span className="text-red-500">*</span></label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="mt-2 w-full p-3 bg-white border-2 border-slate-200 rounded-xl outline-none text-slate-900 focus:border-[#8B93C5] transition-all font-medium appearance-none"
                  >
                    <option value="" disabled>-- กรุณาเลือกแผนก --</option>
                    <option value="ฝ่ายบริหาร">ฝ่ายบริหาร</option>
                    <option value="ฝ่ายจัดซื้อ">ฝ่ายจัดซื้อ</option>
                    <option value="ฝ่ายทรัพยากรบุคคล">ฝ่ายทรัพยากรบุคคล</option>
                    <option value="ฝ่ายเทคโนโลยีสารสนเทศ">ฝ่ายเทคโนโลยีสารสนเทศ</option>
                    <option value="ฝ่ายบัญชีและการเงิน">ฝ่ายบัญชีและการเงิน</option>
                    <option value="ฝ่ายพัฒนาซอฟต์แวร์">ฝ่ายพัฒนาซอฟต์แวร์</option>
                    <option value="ฝ่ายธุรการ">ฝ่ายธุรการ</option>
                    <option value="ฝ่ายลูกค้าสัมพันธ์ / บริการลูกค้า">ฝ่ายลูกค้าสัมพันธ์ / บริการลูกค้า</option>
                    <option value="ฝ่ายการตลาด">ฝ่ายการตลาด</option>
                    <option value="ฝ่ายกฎหมายและกำกับการดูแล">ฝ่ายกฎหมายและกำกับการดูแล</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- Section 2: Status Setting --- */}
      <div className="space-y-4 pt-4 border-t border-slate-50">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#43934B] rounded-full"></span>
          User Status
        </h3>

        <div className="flex gap-4">
          {statuses.map((status) => (
            <div
              key={status.title}
              onClick={() => setSelectedStatus(status.title)}
              className={`flex-1 p-4 rounded-[1.2rem] border-2 cursor-pointer transition-all flex flex-col gap-2 ${selectedStatus === status.title
                  ? 'border-[#43934B] bg-green-50/30'
                  : 'border-slate-100 bg-white'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                  <p className={`font-black text-sm ${selectedStatus === status.title ? 'text-[#43934B]' : 'text-slate-500'}`}>
                    {status.title}
                  </p>
                </div>
                {selectedStatus === status.title && (
                  <div className="w-5 h-5 bg-[#43934B] rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {status.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Action Buttons --- */}
      <div className="flex justify-between items-center pt-6">
        <button
          onClick={onBack}
          className="text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center gap-2"
        >
          ← Back
        </button>
        <button
          onClick={() => onSubmit({
            role: selectedRole,
            status: selectedStatus,
            departments: selectedRole === 'Data Controller' ? selectedDepartment : 'None'
          })}
          disabled={selectedRole === 'Data Controller' && !selectedDepartment}
          className={`px-12 py-3.5 rounded-full font-black shadow-lg transition-all text-white flex items-center gap-2 ${(selectedRole === 'Data Controller' && !selectedDepartment)
              ? 'bg-slate-300 shadow-none cursor-not-allowed'
              : isEditMode
                ? 'bg-[#43934B] hover:bg-green-700 hover:scale-105 active:scale-95'
                : 'bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95'
            }`}
        >
          {isEditMode ? 'Update & Save' : 'Create User'}
        </button>
      </div>
    </div>
  );
}
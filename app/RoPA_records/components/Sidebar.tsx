"use client";
import React from 'react';

const Sidebar = ({ activeMenu, setActiveMenu }: { activeMenu: string, setActiveMenu: (menu: string) => void }) => {
  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: (
        <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      name: 'User Management', 
      icon: (
        <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: 'RoPA Records', 
      icon: (
        <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      name: 'Feedback', 
      icon: (
        <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
  ];

  return (
    <div className="w-80 bg-[#CCEAFF] flex flex-col pt-8 pb-5 pl-2 pr-0 relative h-full border-r border-blue-200/50">
      <div className="flex justify-center mb-10 pr-5">
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border-4 border-white">
          <img src="https://www.svgrepo.com/show/530181/dinosaur.svg" alt="logo" className="w-20 h-20" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </div>

      {/* แก้ไขบรรทัดนี้: ลบ custom-scrollbar ออก และเพิ่ม overflow-x-hidden scrollbar-hide */}
      <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="w-full flex items-center px-6 py-4 mb-2 text-xl font-black text-slate-800 bg-[#A6D8FF] rounded-l-[2rem]">
           Departmental Records
        </div>

        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveMenu(item.name)}
            className={`w-[calc(100%+1px)] flex items-center px-8 py-5 text-lg font-bold transition-all duration-200 relative ${
              activeMenu === item.name
                ? 'bg-white text-slate-900 rounded-l-[2.5rem] shadow-[-4px_4px_12px_rgba(0,0,0,0.06)] z-10' 
                : 'text-slate-700 hover:bg-white/20 rounded-l-[2.5rem]'
            }`}
          >
            <span className={activeMenu === item.name ? "text-[#8B93C5]" : "text-slate-500"}>
              {item.icon}
            </span>
            {item.name}
          </button>
        ))}
      </div>

      <div className="border-t border-blue-300/30 pt-6 mt-4 space-y-3 pr-5">
        <button
          onClick={() => setActiveMenu('Profile')}
          className={`w-full flex items-center px-6 py-4 rounded-[1.5rem] text-lg font-bold transition-all ${
            activeMenu === 'Profile' ? 'bg-white shadow-sm text-[#8B93C5]' : 'text-slate-700 hover:bg-white/20'
          }`}
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </button>
        <div className="flex justify-center pt-2">
          <button className="bg-white text-red-500 px-12 py-2.5 rounded-full font-black shadow-md hover:bg-red-50 active:scale-95 transition-all text-sm uppercase tracking-wider">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
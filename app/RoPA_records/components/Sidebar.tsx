"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  userRole: string;
}

const Sidebar = ({ activeMenu, setActiveMenu, userRole }: SidebarProps) => {

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/");
  };

  const menuConfig = [
    {
      sectionName: 'Departmental Records',
      items: [
        {
          name: 'RoPA Records',
          roles: ['Data Controller', 'Data Processor'],
          icon: (
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )
        },
        {
          name: 'Feedback',
          roles: ['Data Controller', 'Data Processor'],
          icon: (
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )
        },
        {
          name: 'Expiration Alert',
          roles: ['Data Controller'],
          icon: (
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )
        },
      ]
    },
    {
      sectionName: userRole === 'Excutive' ? 'Analytics' : 'Organization Records',
      items: [
        {
          name: 'User Management',
          roles: ['Admin'],
          icon: (
            <img
              src="https://www.svgrepo.com/show/430793/book-5.svg"
              alt="dashboard icon"
              className="w-7 h-7 mr-3 object-contain opacity-70"
            />
          )
        },
        {
          name: 'Dashboard',
          roles: ['Admin', 'Excutive', 'DPO(Data Protection Officer)', 'Auditor'],
          icon: (
            <img
              src="https://www.svgrepo.com/show/10344/money-graph-with-up-arrow.svg"
              alt="dashboard icon"
              className="w-7 h-7 mr-3 object-contain opacity-70"
            />
          )
        },
        {
          name: 'TotalActivities',
          roles: ['DPO(Data Protection Officer)'],
          icon: (
            <img
              src="https://www.svgrepo.com/show/521669/folder.svg"
              alt="dashboard icon"
              className="w-7 h-7 mr-3 object-contain opacity-70"
            />
          )
        },
      ]
    },
    {
      sectionName: 'Verification',
      items: [
        {
          name: 'Pending Review',
          roles: ['DPO(Data Protection Officer)'],
          icon: (
            <img
              src="https://www.svgrepo.com/show/301749/waiting-list-clock.svg"
              alt="dashboard icon"
              className="w-7 h-7 mr-3 object-contain opacity-70"
            />
          )
        },
        {
          name: 'Delete Request',
          roles: ['Admin', 'DPO(Data Protection Officer)'],
          icon: (
            <img
              src="https://www.svgrepo.com/show/532806/file-xmark.svg"
              alt="dashboard icon"
              className="w-7 h-7 mr-3 object-contain opacity-70"
            />
          )
        },
        {
          name: 'Extend Retention',
          roles: ['DPO(Data Protection Officer)'],
          icon: (
            <img
              src="https://www.svgrepo.com/show/486001/contract-pending-line.svg"
              alt="dashboard icon"
              className="w-7 h-7 mr-3 object-contain opacity-70"
            />
          )
        }
      ]
    }
  ];

  const allowedSections = menuConfig
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(userRole))
    }))
    .filter(section => section.items.length > 0);

  return (
    <div className="w-80 bg-[#CCEAFF] flex flex-col pt-8 pb-5 pl-2 pr-0 relative h-full border-r border-blue-200/50">

      {/* โลโก้ */}
      <div className="flex justify-center mb-10 pr-5">
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border-4 border-white">
          <img src="https://www.svgrepo.com/show/530181/dinosaur.svg" alt="logo" className="w-20 h-20" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {allowedSections.map((section, index) => (
          <div key={index} className="space-y-1">
            <div className="w-full flex items-center px-6 py-4 mb-2 text-[16px] font-black text-slate-800 bg-[#A6D8FF] rounded-l-[2rem]">
              {section.sectionName}
            </div>
            {section.items.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`w-[calc(100%+1px)] flex items-center px-8 py-4 text-lg font-bold transition-all duration-200 relative ${activeMenu === item.name
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
        ))}
      </div>

      {/* ส่วนล่าง: Profile & Logout */}
      <div className="border-t border-blue-300/30 pt-4 mt-4 space-y-3 pr-5">


        <div className="w-full flex items-center px-6 py-4 mb-2 text-[16px] font-black text-slate-800 bg-[#A6D8FF] rounded-l-[2rem]">
          <img
            src="https://www.svgrepo.com/show/532363/user-alt-1.svg"
            alt="profile icon"
            className="w-5 h-5 mr-3 object-contain"
          />
          Profile
        </div>
        <div className="px-6 text-center text-sm font-bold text-slate-500 mb-2">
          Role: <span className="text-[#8B93C5]">{userRole}</span>
        </div>
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLogout}
            className="bg-white text-red-500 px-12 py-2.5 rounded-full font-black shadow-md hover:bg-red-50 active:scale-95 transition-all text-sm uppercase tracking-wider"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
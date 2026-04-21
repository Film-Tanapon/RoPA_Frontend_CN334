"use client";
import React, { useEffect, useState } from 'react';

const TotalActivitiesTable = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3340/ropa-records');
            const data = await response.json();
            setRecords(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = records.filter(item => 
        item.activityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toString().includes(searchTerm)
    );

    // ฟังก์ชันช่วยจัดการสีระดับความเสี่ยง
    const getRiskClass = (risk: string) => {
        switch (risk) {
            case 'สูง': return 'text-red-500';
            case 'กลาง': return 'text-yellow-500';
            default: return 'text-green-500';
        }
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 p-4">
            {/* Search Bar & Filter (ไม่มีปุ่ม New Activity ตามสั่ง) */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-80">
                    <input 
                        type="text" 
                        placeholder="พิมพ์เพื่อค้นหากิจกรรม..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                    />
                    <span className="absolute left-4 top-2.5 text-gray-400 text-sm">🔍</span>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors">
                    <span>Filter</span>
                </button>
            </div>

            {/* Table Container */}
            <div className="flex-1 flex flex-col border border-slate-300 rounded-sm overflow-hidden bg-white shadow-sm">
                {/* Header ส่วนชื่อตารางและจำนวนรายการ */}
                <div className="flex items-center border-b border-slate-300">
                    <div className="px-4 py-2 font-semibold text-[#2D3663] bg-[#C6E2F7] border-r border-slate-300">
                        บันทึกรายการกิจกรรมการประมวลผล
                    </div>
                    <div className="px-6 py-2 font-semibold text-blue-600 bg-white">
                        {filteredData.length}
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#E9F2F9] sticky top-0 z-10 border-b border-slate-300">
                            <tr>
                                <th className="p-3 w-10 text-center border-r border-slate-200"><input type="checkbox" /></th>
                                <th className="p-3 font-semibold text-slate-600 border-r border-slate-200 uppercase">ID</th>
                                <th className="p-3 font-semibold text-slate-600 border-r border-slate-200">ชื่อกิจกรรม</th>
                                <th className="p-3 font-semibold text-slate-600 border-r border-slate-200">เจ้าของข้อมูล</th>
                                <th className="p-3 font-semibold text-slate-600 border-r border-slate-200">หมวดหมู่กิจกรรม</th>
                                <th className="p-3 font-semibold text-slate-600 border-r border-slate-200 text-center">ระดับความเสี่ยง</th>
                                <th className="p-3 font-semibold text-slate-600 border-r border-slate-200 text-center">สถานะ</th>
                                <th className="p-3 font-semibold text-slate-600 text-right">วันที่เพิ่ม</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-3 text-center border-r border-slate-100"><input type="checkbox" /></td>
                                        <td className="p-3 text-slate-500 border-r border-slate-100">{item.id}</td>
                                        <td className="p-3 font-medium text-slate-700 border-r border-slate-100">{item.activityName || 'ทดสอบระบบ'}</td>
                                        <td className="p-3 text-slate-600 border-r border-slate-100">{item.dataSubject || 'ลูกค้า....'}</td>
                                        <td className="p-3 text-slate-600 border-r border-slate-100 text-center">{item.category || 'วอก'}</td>
                                        <td className="p-3 border-r border-slate-100 text-center">
                                            <span className={`font-bold ${getRiskClass(item.riskLevel)}`}>
                                                ความเสี่ยงระดับ{item.riskLevel || 'ต่ำ'}
                                            </span>
                                        </td>
                                        <td className="p-3 border-r border-slate-100 text-center">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${
                                                item.status === 'Pending' ? 'bg-yellow-400' : 'bg-[#28A745]'
                                            }`}>
                                                {item.status || 'Reviewed'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-400 text-right">{item.createdAt || 'วันที่เพิ่ม'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-gray-400 italic">No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TotalActivitiesTable;
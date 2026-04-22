"use client";
import React, { useEffect, useState, useRef } from 'react';

interface Props {
    onEdit?: (item: any) => void;
}

const TotalActivitiesTable = ({ onEdit }: Props) => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const departments = [
        'ฝ่ายบริหาร', 'ฝ่ายจัดซื้อ', 'ฝ่ายทรัพยากรบุคคล', 'ฝ่ายเทคโนโลยีสารสนเทศ',
        'ฝ่ายบัญชีและการเงิน', 'ฝ่ายพัฒนาซอฟต์แวร์', 'ฝ่ายธุรการ',
        'ฝ่ายลูกค้าสัมพันธ์ / บริการลูกค้า', 'ฝ่ายการตลาด', 'ฝ่ายกฎหมายและกำกับการดูแล'
    ];

    const API_URL = 'http://localhost:3340/ropa-records';

    const fetchData = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setRecords(Array.isArray(data) ? data : data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล ${selectedIds.length} รายการที่เลือก?`)) return;
        try {
            const token = localStorage.getItem("access_token");
            for (const id of selectedIds) {
                await fetch(`${API_URL}/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setSelectedIds([]);
            fetchData();
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredData = records.filter(item => {
        const activityName = (item.activity_name || item.activityName || '').toLowerCase();
        const matchesSearch = activityName.includes(searchTerm.toLowerCase()) || item.id?.toString().includes(searchTerm);
        const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(item.department);
        return matchesSearch && matchesDept;
    });

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Search & Filter Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative w-80">
                        <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="ค้นหากิจกรรม..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#8B93C5]/20 text-slate-800"
                        />
                    </div>
                    {/* Filter Button */}
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                            <img src="https://www.svgrepo.com/show/417812/setting-2.svg" className="w-4 h-4 opacity-70" alt="" />
                            <span className="font-medium">filter</span>
                            <span className={`text-[10px] transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {isFilterOpen && (
                            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-5 animate-in zoom-in-95">
                                <p className="text-sm font-black text-[#2D3663] mb-4">แผนก</p>
                                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                                    {departments.map((dept) => (
                                        <label key={dept} className="flex items-center gap-3 group cursor-pointer">
                                            <input type="checkbox" checked={selectedDepts.includes(dept)} onChange={() => setSelectedDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept])} className="h-5 w-5 rounded border-slate-300 text-[#8B93C5]" />
                                            <span className="text-sm text-slate-600 group-hover:text-[#2D3663]">{dept}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                    <div className="px-8 py-4 bg-[#E9F2F9] border-r border-slate-200 text-[#2D3663] font-black text-s uppercase ">
                        บันทึกรายการกิจกรรมการประมวลผล
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 bg-white">
                            {selectedIds.length > 0 ? (
                                <tr>

                                    <th colSpan={8} className="px-8 py-4 bg-white border-b border-slate-100 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <input
                                                    type="checkbox"
                                                    className="rounded w-4 h-4 border-slate-300"
                                                    checked={selectedIds.length === filteredData.length}
                                                    onChange={(e) => setSelectedIds(e.target.checked ? filteredData.map(d => d.id) : [])}
                                                />
                                                <span className="text-[#2D3663] font-black text-sm">เลือกแล้ว {selectedIds.length} รายการ</span>
                                            </div>
                                            <div className="flex gap-3">
                                                {selectedIds.length === 1 && (
                                                    <button
                                                        onClick={() => {
                                                            const itemToEdit = records.find(r => r.id === selectedIds[0]);
                                                            if (onEdit && itemToEdit) onEdit(itemToEdit);
                                                        }}
                                                        className="px-6 py-2 bg-amber-500 text-white rounded-full font-bold shadow-lg  hover:bg-amber-600 transition-all flex items-center gap-2 text-xs"
                                                    >
                                                        <img src="https://www.svgrepo.com/show/442480/edit.svg" alt="edit" className="h-3.5 w-3.5 invert" />
                                                        แก้ไข
                                                    </button>
                                                )}
                                                <button onClick={handleDeleteSelected} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold shadow-lg  hover:bg-red-600 transition-all flex items-center gap-2 text-xs">
                                                    <img src="https://www.svgrepo.com/show/299401/recycle-bin-trash.svg" alt="del" className="h-3.5 w-3.5 invert" />
                                                    ลบที่เลือก
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                            ) : (
                                <tr className="bg-[#F8FAFC] text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                                    <th className="p-5 w-14 text-center border-b border-slate-100">
                                        <input
                                            type="checkbox"
                                            className="rounded w-4 h-4 border-slate-300"
                                            checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                            onChange={(e) => setSelectedIds(e.target.checked ? filteredData.map(d => d.id) : [])}
                                        />
                                    </th>
                                    <th className="p-5 border-b border-slate-100">ID</th>
                                    <th className="p-5 border-b border-slate-100">ชื่อกิจกรรม</th>
                                    <th className="p-5 border-b border-slate-100">เจ้าของข้อมูล</th>
                                    <th className="p-5 border-b border-slate-100">หมวดหมู่</th>
                                    <th className="p-5 text-center border-b border-slate-100">ระดับความเสี่ยง</th>
                                    <th className="p-5 text-center border-b border-slate-100">สถานะ</th>
                                    <th className="p-5 text-right border-b border-slate-100">วันที่เพิ่ม</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredData.map((item) => (
                                <tr key={item.id} className={`hover:bg-blue-50/20 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/30' : ''}`}>
                                    <td className="p-5 text-center">
                                        <input type="checkbox" className="rounded w-4 h-4 cursor-pointer border-slate-300 text-[#8B93C5]" checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} />
                                    </td>
                                    <td className="p-5 text-slate-400 font-medium">{item.id}</td>
                                    <td className="p-5 font-bold text-[#2D3663]">{item.activity_name || item.activityName}</td>
                                    <td className="p-5 text-slate-600">{item.data_subject || '-'}</td>
                                    <td className="p-5 text-slate-500">{item.data_category || 'ทั่วไป'}</td>
                                    <td className="p-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${item.risk_level === 'สูง' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                            {item.risk_level || 'ต่ำ'}
                                        </span>
                                    </td>
                                    <td className={`p-5 text-center font-black text-xs ${item.status === 'Action Required'
                                            ? 'text-slate-400'     // ถ้าเป็น ACTION REQUIRED ให้ใช้สีเทา
                                            : 'text-emerald-500'   // ถ้าเป็นสถานะอื่น (เช่น Active) ให้ใช้สีเขียว
                                        }`}>
                                        {item.status || 'Active'}
                                    </td>
                                    <td className="p-5 text-right text-slate-400 font-bold italic">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH') : '11/04/2026'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="h-4"></div>
        </div>
    );
};

export default TotalActivitiesTable;
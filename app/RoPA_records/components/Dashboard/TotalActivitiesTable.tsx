"use client";
import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface Props {
    onEdit?: (item: any) => void;
    userRole?: string;
}

const TotalActivitiesTable = ({ onEdit, userRole }: Props) => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isAdmin = userRole === 'Admin';

    const departments = [
        'ฝ่ายบริหาร', 'ฝ่ายจัดซื้อ', 'ฝ่ายทรัพยากรบุคคล', 'ฝ่ายเทคโนโลยีสารสนเทศ',
        'ฝ่ายบัญชีและการเงิน', 'ฝ่ายพัฒนาซอฟต์แวร์', 'ฝ่ายธุรการ',
        'ฝ่ายลูกค้าสัมพันธ์ / บริการลูกค้า', 'ฝ่ายการตลาด', 'ฝ่ายกฎหมายและกำกับการดูแล'
    ];

    const API_BASE = process.env.API_URL || 'http://localhost:3340';
    const API_URL = `${API_BASE}/ropa-records`;

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

    useEffect(() => { fetchData(); }, []);

    const filteredData = records.filter(item => {
        const activityName = (item.activity_name || item.activityName || '').toLowerCase();
        const matchesSearch = activityName.includes(searchTerm.toLowerCase()) || item.id?.toString().includes(searchTerm);
        const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(item.department);

        let matchesDate = true;
        if (startDate || endDate) {
            const itemDate = new Date(item.create_date);
            if (isNaN(itemDate.getTime())) {
                matchesDate = false;
            } else {
                itemDate.setHours(0, 0, 0, 0);
                if (startDate) {
                    const sDate = new Date(startDate);
                    sDate.setHours(0, 0, 0, 0);
                    if (itemDate < sDate) matchesDate = false;
                }
                if (endDate) {
                    const eDate = new Date(endDate);
                    eDate.setHours(23, 59, 59, 999);
                    if (itemDate > eDate) matchesDate = false;
                }
            }
        }
        return matchesSearch && matchesDept && matchesDate;
    });

    const handleExportXLSX = async () => {
        const exportRecords = selectedIds.length > 0
            ? records.filter(r => selectedIds.includes(r.id?.toString()))
            : [];

        if (exportRecords.length === 0) {
            alert("กรุณาเลือกรายการที่ต้องการ Export อย่างน้อย 1 รายการ");
            return;
        }

        const columns = [
            { header: 'ID', width: 8 },
            { header: 'ชื่อกิจกรรม (Activity Name)', width: 35 },
            { header: 'วันที่เริ่มต้น (Start Date)', width: 20 },
            { header: 'ระยะเวลาเก็บรักษา (Retention Period)', width: 30 },
            { header: 'วัตถุประสงค์ (Purpose)', width: 40 },
            { header: 'เจ้าของข้อมูล (Data Owner)', width: 25 },
            { header: 'เจ้าของข้อมูลส่วนบุคคล (Data Subject)', width: 30 },
            { header: 'หมวดหมู่ข้อมูล (Data Category)', width: 25 },
            { header: 'ประเภทข้อมูล (Data Type)', width: 20 },
            { header: 'ข้อมูลส่วนบุคคล (Personal Info)', width: 35 },
            { header: 'แหล่งที่มาข้อมูล (Data Source)', width: 25 },
            { header: 'ฐานทางกฎหมาย (Legal Basis)', width: 30 },
            { header: 'วิธีการเก็บรวบรวม (Collection Method)', width: 30 },
            { header: 'เด็กอายุต่ำกว่า 10 ปี', width: 20 },
            { header: 'เด็กอายุ 10-20 ปี', width: 18 },
            { header: 'การส่งข้อมูลต่างประเทศ (Transfer Abroad)', width: 30 },
            { header: 'ประเทศปลายทาง (Destination Country)', width: 25 },
            { header: 'การส่งข้อมูลบริษัทในเครือ', width: 28 },
            { header: 'รายละเอียดบริษัทในเครือ', width: 30 },
            { header: 'วิธีการส่งข้อมูล (Transfer Method)', width: 30 },
            { header: 'มาตรการคุ้มครอง (Protection Measure)', width: 35 },
            { header: 'ข้อยกเว้น Art.28', width: 28 },
            { header: 'ประเภทข้อมูลที่เก็บ (Data Types)', width: 35 },
            { header: 'วิธีการจัดเก็บ (Storage Methods)', width: 35 },
            { header: 'สิทธิ์การเข้าถึง (Access Rights)', width: 30 },
            { header: 'วิธีการลบข้อมูล (Deletion Method)', width: 30 },
            { header: 'การใช้ข้อมูลโดยไม่ยินยอม', width: 30 },
            { header: 'การปฏิเสธสิทธิ์ (Denial of Rights)', width: 30 },
            { header: 'ระดับความเสี่ยง (Risk Level)', width: 25 },
            { header: 'สถานะ (Status)', width: 18 },
            { header: 'มาตรการเชิงองค์กร (Org Measure)', width: 35 },
            { header: 'มาตรการเชิงเทคนิค (Tech Measure)', width: 35 },
            { header: 'มาตรการเชิงกายภาพ (Physical Measure)', width: 35 },
            { header: 'การควบคุมการเข้าถึงข้อมูล (Access Control)', width: 35 },
            { header: 'ความรับผิดชอบของผู้ใช้งาน (User Responsibility)', width: 35 },
            { header: 'มาตรการตรวจสอบ (Audit Measure)', width: 35 },
            { header: 'วันที่สร้าง (Create Date)', width: 20 },
        ];

        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Fetch Transfer และ Security ของทุก record พร้อมกัน
        const enrichedRecords = await Promise.all(
            exportRecords.map(async (item) => {
                let transferData: any = {};
                let secMap: Record<string, string> = {};

                try {
                    const resTransfer = await fetch(`${API_BASE}/transfers/${item.id}`, { headers });
                    if (resTransfer.ok) {
                        const tJson = await resTransfer.json();
                        transferData = tJson.data || tJson || {};
                    }
                } catch (_) {}

                try {
                    const resSecurity = await fetch(`${API_BASE}/security/${item.id}`, { headers });
                    if (resSecurity.ok) {
                        const sJson = await resSecurity.json();
                        const secList: any[] = Array.isArray(sJson.data) ? sJson.data : (Array.isArray(sJson) ? sJson : []);
                        secList.forEach(sec => { secMap[sec.measure_type] = sec.description; });
                    }
                } catch (_) {}

                // แปลง boolean fields และ map ทุก field ให้ถูกต้อง
                const rName = transferData?.recipient_name;
                const hasRecipient = rName && rName !== '-' && rName !== 'no';

                return [
                    item.id ?? '-',
                    item.activity_name ?? '-',
                    item.retention_start ?? '-',                              // start_date → retention_start
                    item.retention_period ?? '-',
                    item.purpose ?? '-',
                    item.data_owner ?? '-',
                    item.data_subject ?? '-',
                    item.data_category ?? '-',
                    item.is_sensitive ? 'ข้อมูลอ่อนไหว' : 'ข้อมูลทั่วไป',   // boolean → label
                    item.personal_info ?? '-',
                    item.source ?? '-',                                        // data_source → source
                    item.legal_basis ?? '-',
                    item.collection_method ?? '-',
                    item.is_under_10 ? 'มี' : 'ไม่มี',                       // boolean → label
                    item.is_age_10_20 ? 'มี' : 'ไม่มี',                      // boolean → label
                    item.is_international ? 'มี' : 'ไม่มี',                  // boolean → label
                    transferData?.country && transferData.country !== '-' ? transferData.country : '-',
                    hasRecipient ? 'มี' : 'ไม่มี',
                    hasRecipient && rName !== 'yes' ? rName : '-',
                    transferData?.transfer_method && transferData.transfer_method !== '-' ? transferData.transfer_method : '-',
                    transferData?.protection_measure && transferData.protection_measure !== '-' ? transferData.protection_measure : '-',
                    transferData?.protection_std && transferData.protection_std !== '-' ? transferData.protection_std : '-',
                    item.storage_format ?? '-',                                // data_types → storage_format
                    item.retention_method ?? '-',                              // storage_methods → retention_method
                    item.access_control ?? '-',                                // access_rights → access_control
                    item.disposal_method ?? '-',                               // deletion_method → disposal_method
                    item.consent_exempt_basis ?? '-',                          // use_without_consent → consent_exempt_basis
                    item.right_rejection_reason ?? '-',                        // denial_of_rights → right_rejection_reason
                    item.risk_level ?? '-',
                    item.status ?? '-',
                    secMap['มาตรการเชิงองค์กร'] ?? '-',
                    secMap['มาตรการเชิงเทคนิค'] ?? '-',
                    secMap['มาตรการเชิงกายภาพ'] ?? '-',
                    secMap['การควบคุมการเข้าถึง'] ?? '-',
                    secMap['ความรับผิดชอบของผู้ใช้งาน'] ?? '-',
                    secMap['มาตรการตรวจสอบ'] ?? '-',
                    formatDate(item.create_date),
                ];
            })
        );

        const now = new Date();
        const nowStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

        const excelData: any[][] = [];
        excelData.push(['RoPA Records Export — บันทึกรายการกิจกรรมการประมวลผลข้อมูลส่วนบุคคล']);
        excelData.push([`ส่งออก ${exportRecords.length} รายการ • ${nowStr}`]);
        excelData.push(columns.map(col => col.header));
        enrichedRecords.forEach(row => excelData.push(row));

        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = columns.map(col => ({ wch: col.width }));
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'RoPA Records');

        const filename = `ropa_records_export_${now.toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const toggleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? filteredData.map(d => d.id?.toString()) : []);
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

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
                            <div className="absolute left-0 mt-2 w-[340px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-5 animate-in zoom-in-95">
                                <p className="text-sm font-black text-[#2D3663] mb-4">แผนก</p>
                                <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                                    {departments.map((dept) => (
                                        <label key={dept} className="flex items-center gap-3 group cursor-pointer">
                                            <input type="checkbox" checked={selectedDepts.includes(dept)} onChange={() => setSelectedDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept])} className="h-5 w-5 rounded border-slate-300 text-[#8B93C5] focus:ring-[#8B93C5]/30" />
                                            <span className="text-sm text-slate-600 group-hover:text-[#2D3663]">{dept}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="h-px bg-slate-100 w-full mb-4"></div>

                                <div className="mb-5">
                                    <p className="text-sm font-black text-[#2D3663] mb-3">ช่วงวันที่สร้าง</p>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 mb-1.5 block">ตั้งแต่</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#8B93C5]/20 focus:border-[#8B93C5] transition-all"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 mb-1.5 block">ถึง</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#8B93C5]/20 focus:border-[#8B93C5] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Export Button — Admin only */}
                {isAdmin && (
                    <button
                        onClick={handleExportXLSX}
                        title={selectedIds.length === 0 ? "เลือกรายการก่อน Export" : `Export ${selectedIds.length} รายการที่เลือก`}
                        className={`flex items-center gap-2 px-5 py-2.5 border rounded-full text-sm font-bold shadow-sm transition-all ${selectedIds.length > 0
                            ? 'bg-[#2D3663] border-[#2D3663] text-white hover:bg-[#3d4f80]'
                            : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 cursor-default'
                            }`}
                    >
                        <img
                            src="https://www.svgrepo.com/show/381202/export-arrow-up.svg"
                            alt="export"
                            className={`w-4 h-4 ${selectedIds.length > 0 ? 'invert' : ''}`}
                        />
                        Export{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                    </button>
                )}
            </div>

            {/* Table Area */}
            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                    <div className="px-8 py-4 bg-[#E9F2F9] border-r border-slate-200 text-[#2D3663] font-black text-s uppercase">
                        บันทึกรายการกิจกรรมการประมวลผล
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 bg-white">
                            {isAdmin && selectedIds.length > 0 ? (
                                <tr>
                                    <th colSpan={isAdmin ? 9 : 8} className="px-8 py-4 bg-white border-b border-slate-100 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center gap-6">
                                            <input
                                                type="checkbox"
                                                className="rounded w-4 h-4 border-slate-300 cursor-pointer"
                                                checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                                onChange={(e) => toggleSelectAll(e.target.checked)}
                                            />
                                            <span className="text-[#2D3663] font-black text-sm">เลือกแล้ว {selectedIds.length} รายการ</span>
                                        </div>
                                    </th>
                                </tr>
                            ) : (
                                <tr className="bg-[#F8FAFC] text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                                    {isAdmin && (
                                        <th className="p-5 w-12 text-center border-b border-slate-100">
                                            <input
                                                type="checkbox"
                                                className="rounded w-4 h-4 border-slate-300 cursor-pointer"
                                                checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                                onChange={(e) => toggleSelectAll(e.target.checked)}
                                            />
                                        </th>
                                    )}
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
                            {filteredData.map((item) => {
                                const itemId = item.id?.toString();
                                const isSelected = selectedIds.includes(itemId);
                                return (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-blue-50/20 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
                                    >
                                        {isAdmin && (
                                            <td className="p-5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOne(itemId)}
                                                    className="rounded w-4 h-4 border-slate-300 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="p-5 text-slate-400 font-medium">{item.id}</td>
                                        <td className="p-5 font-bold text-[#2D3663]">{item.activity_name || item.activityName}</td>
                                        <td className="p-5 text-slate-600">{item.data_subject || '-'}</td>
                                        <td className="p-5 text-slate-500">{item.data_category || 'ทั่วไป'}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${item.risk_level === 'ความเสี่ยงระดับสูง'
                                                ? 'bg-red-50 text-red-500'
                                                : item.risk_level === 'ความเสี่ยงระดับกลาง'
                                                    ? 'bg-yellow-50 text-yellow-600'
                                                    : 'bg-emerald-50 text-emerald-500'
                                                }`}>
                                                {item.risk_level || 'ความเสี่ยงระดับต่ำ'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center text-sm font-medium">
                                            <span className={`px-4 py-1.5 rounded-full text-white ${item.status === 'Reviewed' || item.status === 'Reviewd'
                                                ? 'bg-[#53a362]'
                                                : item.status === 'Pending'
                                                    ? 'bg-[#efde4e]'
                                                    : item.status === 'Expired'
                                                        ? 'bg-[#EF4444]'
                                                        : 'bg-slate-400'
                                                }`}>
                                                {item.status || 'Action Required'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-slate-400 italic font-bold whitespace-nowrap">
                                            {formatDate(item.create_date)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="h-4"></div>
        </div>
    );
};

export default TotalActivitiesTable;
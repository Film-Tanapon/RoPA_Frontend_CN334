"use client";
import React, { useState, useEffect } from 'react';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDate(dateStr: string) {
  if (!dateStr || dateStr === '-') return '-';
  try {
    return new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
  } catch { return '-'; }
}

// ─────────────────────────────────────────────
// Approve Form
// ─────────────────────────────────────────────
function ExtendRetentionForm({
  ropaData,
  onCancel,
  onApprove,
  isSubmitting,
}: {
  ropaData: any;
  onCancel: () => void;
  onApprove: (newStartDate: string, newPeriod: string, securityMeasures: Record<string, string>) => void;
  isSubmitting: boolean;
}) {
  const [newStartDate, setNewStartDate] = useState('');
  const [newPeriod, setNewPeriod] = useState('');
  const [measures, setMeasures] = useState({
    organizational_measure: '',
    technical_measure: '',
    physical_measure: '',
    access_control: '',
    user_responsibility: '',
    audit_measure: '',
  });

  // Pre-fill with existing data
  useEffect(() => {
    if (!ropaData) return;
    if (ropaData.retention_start && ropaData.retention_start !== '-') setNewStartDate(ropaData.retention_start);
    if (ropaData.retention_period && ropaData.retention_period !== '-') setNewPeriod(ropaData.retention_period);

    // Fetch current security measures
    const token = localStorage.getItem('access_token');
    fetch(`http://localhost:3340/security/${ropaData.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        const data: any[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        const map: Record<string, string> = {};
        data.forEach(s => { map[s.measure_type] = s.description; });
        setMeasures({
          organizational_measure: map['มาตรการเชิงองค์กร'] || '',
          technical_measure: map['มาตรการเชิงเทคนิค'] || '',
          physical_measure: map['มาตรการเชิงกายภาพ'] || '',
          access_control: map['การควบคุมการเข้าถึง'] || '',
          user_responsibility: map['ความรับผิดชอบของผู้ใช้งาน'] || '',
          audit_measure: map['มาตรการตรวจสอบ'] || '',
        });
      })
      .catch(() => {});
  }, [ropaData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasures(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!newStartDate || !newPeriod) {
      alert('กรุณากรอกวันที่เริ่มต้นและระยะเวลาการเก็บรักษาใหม่');
      return;
    }
    onApprove(newStartDate, newPeriod, {
      'มาตรการเชิงองค์กร': measures.organizational_measure,
      'มาตรการเชิงเทคนิค': measures.technical_measure,
      'มาตรการเชิงกายภาพ': measures.physical_measure,
      'การควบคุมการเข้าถึง': measures.access_control,
      'ความรับผิดชอบของผู้ใช้งาน': measures.user_responsibility,
      'มาตรการตรวจสอบ': measures.audit_measure,
    });
  };

  const labelStyle = "block text-[14px] font-bold text-[#1e293b] mb-1.5 ml-1";
  const inputStyle = "w-full p-3 bg-white border border-[#cbd5e1] rounded-lg text-[#334155] focus:border-[#3b82f6] outline-none transition-all placeholder:text-[#94a3b8] text-[15px] shadow-sm";
  const dateInputStyle = "w-full p-3 bg-white border border-[#3b82f6] rounded-lg text-[#334155] focus:ring-2 focus:ring-blue-200 outline-none text-[15px] shadow-sm font-bold";

  return (
    <div className="h-full flex flex-col bg-[#F0F9FF]">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 flex flex-col h-full overflow-hidden shadow-2xl relative">

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-6 right-7 text-slate-400 hover:text-slate-600 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="space-y-8">

            {/* Header info */}
            <div>
              <h2 className="text-[22px] font-bold text-[#2D3663] mb-1">
                ต่ออายุการเก็บข้อมูล
              </h2>
              <p className="text-slate-500 text-[14px]">
                กิจกรรม: <span className="font-bold text-[#2D3663]">{ropaData?.activity_name || '-'}</span>
              </p>
              <p className="text-slate-500 text-[14px]">
                วันที่เริ่มเดิม: {formatDate(ropaData?.retention_start)} &nbsp;|&nbsp;
                ระยะเดิม: {ropaData?.retention_period || '-'}
              </p>
            </div>

            {/* New retention dates */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-[16px] font-bold text-[#2D3663] mb-5">กำหนดระยะเวลาการเก็บรักษาใหม่</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>วันที่เริ่มต้นใหม่ <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    className={dateInputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>ระยะเวลาการเก็บรักษาใหม่ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value)}
                    placeholder="เช่น 3 ปี, 6 เดือน, 18 เดือน"
                    className={dateInputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Security measures */}
            <div>
              <h3 className="text-[18px] font-bold text-[#2D3663] mb-6">
                คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย
              </h3>
              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>มาตรการเชิงองค์กร</label>
                  <input type="text" name="organizational_measure" value={measures.organizational_measure} onChange={handleChange} className={inputStyle} placeholder="ระบุมาตรการ..." />
                </div>
                <div>
                  <label className={labelStyle}>มาตรการเชิงเทคนิค</label>
                  <input type="text" name="technical_measure" value={measures.technical_measure} onChange={handleChange} className={inputStyle} placeholder="ระบุมาตรการ..." />
                </div>
                <div>
                  <label className={labelStyle}>มาตรการทางกายภาพ</label>
                  <input type="text" name="physical_measure" value={measures.physical_measure} onChange={handleChange} className={inputStyle} placeholder="ระบุมาตรการ..." />
                </div>
                <div>
                  <label className={labelStyle}>การควบคุมการเข้าถึงข้อมูล</label>
                  <input type="text" name="access_control" value={measures.access_control} onChange={handleChange} className={inputStyle} placeholder="ระบุมาตรการ..." />
                </div>
                <div>
                  <label className={labelStyle}>การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน</label>
                  <input type="text" name="user_responsibility" value={measures.user_responsibility} onChange={handleChange} className={inputStyle} placeholder="ระบุมาตรการ..." />
                </div>
                <div>
                  <label className={labelStyle}>มาตรการตรวจสอบย้อนหลัง</label>
                  <input type="text" name="audit_measure" value={measures.audit_measure} onChange={handleChange} className={inputStyle} placeholder="ระบุมาตรการ..." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 px-10 flex justify-between items-center bg-slate-50/50">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-[#2D3663] font-bold text-lg hover:text-blue-600 transition-colors"
          >
            <span className="text-xl">←</span> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-14 py-3 bg-[#00C853] text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-[#00A844] transition-all active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main ExtendRetention Component
// ─────────────────────────────────────────────
export default function ExtendRetention() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedRopa, setSelectedRopa] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => localStorage.getItem('access_token');
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3340/requests', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        const all: any[] = Array.isArray(data) ? data : data.data || [];
        const extendRequests = all.filter(
          r => r.req_type === 'ExtendRetention' && r.status === 'Pending'
        );
        setRequests(extendRequests);
      }
    } catch (err) { console.error('Fetch error:', err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleCardClick = async (req: any) => {
    setSelectedRequest(req);
    try {
      const res = await fetch(`http://localhost:3340/ropa-records/${req.ropa_id}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedRopa(data.data || data);
        setView('form');
      }
    } catch (err) { console.error('Error fetching ropa:', err); }
  };

  const handleApprove = async (
    newStartDate: string,
    newPeriod: string,
    securityMeasures: Record<string, string>
  ) => {
    if (!selectedRopa || !selectedRequest) return;
    setIsSubmitting(true);
    try {
      // 1. Update ropa-record with new retention dates & set status to Active
      const ropaRes = await fetch(`http://localhost:3340/ropa-records/${selectedRopa.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          retention_start: newStartDate,
          retention_period: newPeriod,
          status: 'Reviewed',
        }),
      });

      if (!ropaRes.ok) {
        const err = await ropaRes.json();
        alert(err.detail || 'ไม่สามารถอัพเดทข้อมูลได้');
        return;
      }

      // 2. Update security measures
      const measureEntries = [
        { type: 'มาตรการเชิงองค์กร', desc: securityMeasures['มาตรการเชิงองค์กร'] },
        { type: 'มาตรการเชิงเทคนิค', desc: securityMeasures['มาตรการเชิงเทคนิค'] },
        { type: 'มาตรการเชิงกายภาพ', desc: securityMeasures['มาตรการเชิงกายภาพ'] },
        { type: 'การควบคุมการเข้าถึง', desc: securityMeasures['การควบคุมการเข้าถึง'] },
        { type: 'ความรับผิดชอบของผู้ใช้งาน', desc: securityMeasures['ความรับผิดชอบของผู้ใช้งาน'] },
        { type: 'มาตรการตรวจสอบ', desc: securityMeasures['มาตรการตรวจสอบ'] },
      ].filter(m => m.desc && m.desc.trim() !== '');

      await Promise.all(
        measureEntries.map(m =>
          fetch(`http://localhost:3340/security`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              ropa_id: selectedRopa.id,
              measure_type: m.type,
              description: m.desc,
            }),
          })
        )
      );

      // 3. Mark request as Approved
      if (selectedRequest?.id) {
        await fetch(`http://localhost:3340/requests/${selectedRequest.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ status: 'Approved' }),
        });
      }

      alert('อนุมัติและต่ออายุการเก็บข้อมูลเรียบร้อยแล้ว');
      setView('list');
      setSelectedRopa(null);
      setSelectedRequest(null);
      fetchRequests();
    } catch {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Form view ──
  if (view === 'form' && selectedRopa) {
    return (
      <div className="flex flex-col h-full p-4 animate-in slide-in-from-right duration-500 bg-[#F0F9FF]">
        <ExtendRetentionForm
          ropaData={selectedRopa}
          onCancel={() => { setView('list'); setSelectedRopa(null); setSelectedRequest(null); }}
          onApprove={handleApprove}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="flex flex-col h-full p-4 animate-in fade-in duration-500 bg-[#F0F9FF]">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar pt-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400 font-bold">กำลังโหลด...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold">ไม่พบคำขอต่ออายุการเก็บข้อมูล</div>
        ) : (
          requests.map(req => (
            <div
              key={req.id}
              onClick={() => handleCardClick(req)}
              className="flex items-center justify-between bg-white rounded-[1.5rem] shadow-xl border border-slate-50 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden min-h-[100px]"
            >
              <div className="py-6 px-10 flex flex-col gap-1">
                <span className="text-[#2D3663] font-bold text-2xl">
                  คำขอ #{req.id} — RoPA ID: {req.ropa_id}
                </span>
                <span className="text-slate-400 text-[13px] font-medium">
                  สถานะ: {req.status} | สร้างเมื่อ: {req.create_date ? new Date(req.create_date).toLocaleDateString('th-TH') : '-'}
                </span>
              </div>
              <div className="w-20 h-full absolute right-0 top-0 bg-[#D1EAFF] flex items-center justify-center group-hover:bg-blue-500 transition-all">
                <span className="text-blue-900 group-hover:text-white font-black text-2xl">❯</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
}
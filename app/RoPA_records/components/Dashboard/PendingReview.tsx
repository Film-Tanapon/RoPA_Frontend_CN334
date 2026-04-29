"use client";
import React, { useState, useEffect } from 'react';

interface PendingReviewProps {
  onBack?: () => void;
}

const API_BASE = process.env.API_URL || 'http://localhost:3340';

const CustomRadio = ({ name, value, checked, onChange }: any) => (
  <div className="relative flex items-center justify-center">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="peer appearance-none w-4 h-4 border border-slate-400 rounded-full checked:border-[#4A85E6] bg-white transition-all cursor-pointer"
    />
    <div className="absolute w-2 h-2 rounded-full bg-[#4A85E6] opacity-0 peer-checked:opacity-100 transition-all pointer-events-none"></div>
  </div>
);

export default function PendingReview({ onBack }: PendingReviewProps) {
  const [step, setStep] = useState<1 | 2 | 4>(1);
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const [formData, setFormData] = useState({
    activityName: '', startDate: '', retentionPeriod: '', purpose: '',
    dataOwner: '', dataSubject: '', dataCategory: '', dataType: 'general',
    personalInfo: '', dataSource: 'direct', dataSourceOtherSpec: '',
    legalBasis: '', collectionMethod: 'digital', digitalSpec: '', paperSpec: '',
    minorUnder10: 'none', minor10to20: 'none', transferAbroad: 'no',
    destinationCountry: '', transferAffiliate: 'no', transferAffiliateSpec: '',
    transferMethod: '', protectionMeasure: '', exceptionArt28: '',
    dataTypes: [] as string[], storageMethods: [] as string[], accessRights: [] as string[],
    deletionMethod: '', useWithoutConsent: '', denialOfRights: '',
    riskLevel: 'ความเสี่ยงระดับต่ำ',
    orgMeasure: '', techMeasure: '', physicalMeasure: '',
    accessControl: '', userResponsibility: '', auditMeasure: ''
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const safeSplit = (str: string | undefined | null) => {
    if (!str || str === '-' || str === '[]') return [];
    return str.split(', ').filter(item => item.trim() !== '');
  };

  // Fetch pending records
  useEffect(() => {
    if (step !== 1) return;
    setIsLoading(true);
    fetch(`${API_BASE}/ropa-records`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const records = Array.isArray(data) ? data : (data.data || []);
        setPendingRecords(records.filter((r: any) => r.status?.toLowerCase() === 'pending'));
      })
      .catch(err => console.error('Failed to fetch records:', err))
      .finally(() => setIsLoading(false));
  }, [step]);

  // Load record data into form
  const loadRecord = async (record: any) => {
    setSelectedRecord(record);

    const safeSplitLocal = (str: string | undefined | null) => {
      if (!str || str === '-' || str === '[]') return [];
      return str.split(', ').filter((item: string) => item.trim() !== '');
    };

    setFormData(prev => ({
      ...prev,
      activityName: record.activity_name || '',
      startDate: record.retention_start && record.retention_start !== '-' ? record.retention_start : '',
      retentionPeriod: record.retention_period && record.retention_period !== '-' ? record.retention_period : '',
      purpose: record.purpose || '',
      dataOwner: record.data_owner !== '-' ? (record.data_owner || '') : '',
      dataSubject: record.data_subject !== '-' ? (record.data_subject || '') : '',
      dataCategory: record.data_category !== 'Uncategorized' ? (record.data_category || '') : '',
      personalInfo: record.personal_info || '',
      dataType: record.is_sensitive ? 'sensitive' : 'general',
      dataSource: record.source === 'direct' ? 'direct' : 'other',
      dataSourceOtherSpec: record.source !== 'direct' ? (record.source || '') : '',
      legalBasis: record.legal_basis !== '-' ? (record.legal_basis || '') : '',
      collectionMethod: record.collection_method || 'digital',
      minorUnder10: record.is_under_10 ? 'have' : 'none',
      minor10to20: record.is_age_10_20 ? 'have' : 'none',
      transferAbroad: record.is_international ? 'yes' : 'no',
      dataTypes: safeSplitLocal(record.storage_format),
      storageMethods: safeSplitLocal(record.retention_method),
      accessRights: safeSplitLocal(record.access_control),
      deletionMethod: record.disposal_method !== '-' ? (record.disposal_method || '') : '',
      useWithoutConsent: record.consent_exempt_basis !== '-' ? (record.consent_exempt_basis || '') : '',
      denialOfRights: record.right_rejection_reason !== '-' ? (record.right_rejection_reason || '') : '',
      riskLevel: record.risk_level || 'ความเสี่ยงระดับต่ำ',
    }));

    // Fetch transfer & security data
    try {
      const [resTransfer, resSecurity] = await Promise.all([
        fetch(`${API_BASE}/transfers/${record.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/security/${record.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      let transferData: any = null;
      if (resTransfer.ok) {
        const tJson = await resTransfer.json();
        transferData = tJson.data || tJson;
      }

      let securityData: any[] = [];
      if (resSecurity.ok) {
        const sJson = await resSecurity.json();
        securityData = Array.isArray(sJson.data) ? sJson.data : (Array.isArray(sJson) ? sJson : []);
      }

      const secMap: Record<string, string> = {};
      securityData.forEach(sec => { secMap[sec.measure_type] = sec.description; });

      const rName = transferData?.recipient_name;
      const hasRecipient = rName && rName !== '-' && rName !== 'no';

      setFormData(prev => ({
        ...prev,
        destinationCountry: transferData?.country !== '-' ? (transferData?.country || '') : '',
        transferAffiliate: hasRecipient ? 'yes' : 'no',
        transferAffiliateSpec: hasRecipient && rName !== 'yes' ? rName : '',
        transferMethod: transferData?.transfer_method !== '-' ? (transferData?.transfer_method || '') : '',
        protectionMeasure: transferData?.protection_measure !== '-' ? (transferData?.protection_measure || '') : '',
        exceptionArt28: transferData?.protection_std !== '-' ? (transferData?.protection_std || '') : '',
        orgMeasure: secMap['มาตรการเชิงองค์กร'] || '',
        techMeasure: secMap['มาตรการเชิงเทคนิค'] || '',
        physicalMeasure: secMap['มาตรการเชิงกายภาพ'] || '',
        accessControl: secMap['การควบคุมการเข้าถึง'] || '',
        userResponsibility: secMap['ความรับผิดชอบของผู้ใช้งาน'] || '',
        auditMeasure: secMap['มาตรการตรวจสอบ'] || '',
      }));
    } catch (err) { console.error('Failed to fetch related data:', err); }

    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxArray = (field: 'dataTypes' | 'storageMethods' | 'accessRights', value: string) => {
    setFormData(prev => {
      const array = prev[field] || [];
      return { ...prev, [field]: array.includes(value) ? array.filter(item => item !== value) : [...array, value] };
    });
  };

  const handleReviewed = async () => {
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/ropa-records/${selectedRecord.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'Reviewed' }),
      });
      if (res.ok) {
        alert('อนุมัติเรียบร้อยแล้ว');
        setStep(1);
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch { alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'); }
    finally { setIsSubmitting(false); }
  };

  const handleSendBack = async () => {
    if (!feedbackText.trim()) { alert('กรุณาระบุรายละเอียดการแก้ไข'); return; }
    if (!selectedRecord) return;
    setIsSubmitting(true);

    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let userId = 1;
    try { if (userRaw) userId = JSON.parse(userRaw).id || 1; } catch {}

    try {
      // 1. อัปเดต status เป็น Action Required
      const statusRes = await fetch(`${API_BASE}/ropa-records/${selectedRecord.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'Action Required' }),
      });
      if (!statusRes.ok) {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        return;
      }

      // 2. บันทึก feedback
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ropa_id: selectedRecord.id,
          detail: feedbackText,
        }),
      });
      if (res.ok) {
        alert('ส่งกลับเรียบร้อยแล้ว');
        setFeedbackText('');
        setStep(1);
      } else {
        alert('เกิดข้อผิดพลาดในการส่ง feedback');
      }
    } catch { alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'); }
    finally { setIsSubmitting(false); }
  };

  const inputCls = "p-2 border border-slate-300 rounded-md text-[14px] text-slate-800 outline-none focus:border-[#8B93C5] bg-white";
  const textareaCls = "p-3 border border-slate-300 rounded-md text-[14px] resize-none text-slate-800 outline-none focus:border-[#8B93C5] bg-white";

  // ─── Step 1: รายการ Pending ───────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex flex-col h-full p-4 bg-[#F0F9FF]">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-slate-400 text-[15px]">กำลังโหลด...</span>
            </div>
          ) : pendingRecords.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-slate-400 text-[15px]">ไม่มีรายการที่รอการตรวจสอบ</span>
            </div>
          ) : pendingRecords.map((item) => (
            <div
              key={item.id}
              onClick={() => loadRecord(item)}
              className="flex items-center justify-between bg-white rounded-[1.5rem] shadow-xl border border-slate-50 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden h-[110px]"
            >
              <div className="py-9 px-12">
                <span className="text-[#2D3663] font-bold text-3xl">{item.activity_name}</span>
                <p className="text-slate-400 text-[13px] mt-1">{item.create_date ? new Date(item.create_date).toLocaleDateString('th-TH') : ''}</p>
              </div>
              <div className="w-24 h-full absolute right-0 top-0 bg-[#D1EAFF] flex items-center justify-center group-hover:bg-blue-500 transition-all">
                <span className="text-blue-900 group-hover:text-white font-black text-2xl">❯</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Step 4: รายละเอียดการแก้ไข ────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="h-full flex flex-col p-4 bg-[#F0F9FF]">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl h-full flex flex-col">
          <h2 className="text-[22px] font-black text-[#1e293b] mb-8">รายละเอียดการแก้ไข</h2>
          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="ระบุข้อความ..."
            className="w-full flex-1 p-8 bg-slate-50 border border-[#cbd5e1] rounded-3xl outline-none resize-none text-slate-800"
          />
          <div className="mt-8 flex justify-between items-center">
            <button onClick={() => setStep(2)} className="text-slate-400 font-bold hover:text-slate-600 transition-colors">← กลับไปหน้าตรวจสอบ</button>
            <button
              onClick={handleSendBack}
              disabled={isSubmitting}
              className="px-14 py-3.5 bg-[#DBA129] text-white rounded-2xl font-bold hover:bg-[#c4911f] transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'กำลังส่ง...' : 'Send Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 2: Form แสดงข้อมูล ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col p-6 animate-in slide-in-from-right duration-500 bg-[#F0F9FF]">
      <div className="bg-[#F4F8FB] border border-slate-300 rounded-xl p-8 w-full h-full flex flex-col overflow-auto custom-scrollbar relative">

        {/* Close */}
        <button
          onClick={onBack || (() => setStep(1))}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all z-50"
        >
          <span className="text-2xl">×</span>
        </button>

        <h2 className="text-2xl font-bold text-[#1E2A5E] mb-6">บันทึกรายการกิจกรรมการประมวลผล</h2>

        <div className="flex flex-col gap-10 flex-1">

          {/* ─── ส่วนที่ 1: ข้อมูลหลัก ─────────────────── */}
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ชื่อกิจกรรม</label>
                <input type="text" name="activityName" value={formData.activityName} onChange={handleChange} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">วันที่เริ่มกิจกรรม</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ระยะเวลาการเก็บรักษา</label>
                <input type="text" name="retentionPeriod" value={formData.retentionPeriod} onChange={handleChange} placeholder="เช่น 5 ปี, 10 ปี" className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วัตถุประสงค์ของการประมวลผล</label>
              <textarea name="purpose" value={formData.purpose} onChange={handleChange} rows={3} className={textareaCls} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">เจ้าของข้อมูลส่วนบุคคล</label>
                <input type="text" name="dataSubject" value={formData.dataSubject} onChange={handleChange} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">หมวดหมู่ข้อมูล</label>
                <div className="relative">
                  <select name="dataCategory" value={formData.dataCategory} onChange={handleChange} className={`${inputCls} w-full appearance-none pr-10`}>
                    <option value="">Select ...</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ประเภทของข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <CustomRadio name="dataType" value="general" checked={formData.dataType === 'general'} onChange={handleChange} />
                  <span className="text-[#1E2A5E] text-[14px]">ข้อมูลทั่วไป</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <CustomRadio name="dataType" value="sensitive" checked={formData.dataType === 'sensitive'} onChange={handleChange} />
                  <span className="text-[#1E2A5E] text-[14px]">ข้อมูลอ่อนไหว</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ข้อมูลส่วนบุคคลที่จัดเก็บ</label>
              <textarea name="personalInfo" value={formData.personalInfo} onChange={handleChange} rows={2} className={textareaCls} placeholder="โปรดระบุ เช่น ชื่อ นามสกุล ที่อยู่ เป็นต้น...." />
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ─── ส่วนที่ 2: แหล่งข้อมูล ─────────────────── */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">แหล่งที่ได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <CustomRadio name="dataSource" value="direct" checked={formData.dataSource === 'direct'} onChange={handleChange} />
                  <span className="text-[#1E2A5E] text-[14px]">จากเจ้าของข้อมูลส่วนบุคคลโดยตรง</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <CustomRadio name="dataSource" value="other" checked={formData.dataSource === 'other'} onChange={handleChange} />
                    <span className="text-[#1E2A5E] text-[14px]">จากแหล่งอื่น :</span>
                  </label>
                  <input type="text" name="dataSourceOtherSpec" value={formData.dataSourceOtherSpec} onChange={handleChange} disabled={formData.dataSource !== 'other'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 outline-none text-slate-800" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ฐานในการประมวลผล</label>
              <textarea name="legalBasis" value={formData.legalBasis} onChange={handleChange} rows={2} className={textareaCls} placeholder="เช่น ฐานความยินยอม, ฐานปฏิบัติตามกฎหมาย" />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <CustomRadio name="collectionMethod" value="digital" checked={formData.collectionMethod === 'digital'} onChange={handleChange} />
                    <span className="text-[#1E2A5E] text-[14px]">รูปแบบดิจิทัล / ข้อมูลอิเล็กทรอนิกส์ :</span>
                  </label>
                  <input type="text" name="digitalSpec" value={formData.digitalSpec} onChange={handleChange} disabled={formData.collectionMethod !== 'digital'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 text-slate-800" placeholder="เช่น อีเมล..." />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <CustomRadio name="collectionMethod" value="paper" checked={formData.collectionMethod === 'paper'} onChange={handleChange} />
                    <span className="text-[#1E2A5E] text-[14px]">รูปแบบเอกสาร :</span>
                  </label>
                  <input type="text" name="paperSpec" value={formData.paperSpec} onChange={handleChange} disabled={formData.collectionMethod !== 'paper'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 text-slate-800" placeholder="เช่น เอกสารใบลงทะเบียน..." />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การขอความยินยอมของผู้เยาว์</label>
              <div className="grid grid-cols-[120px_1fr] gap-y-4 pl-4 items-start">
                <span className="text-[#1E2A5E] text-[14px] pt-0.5">อายุไม่เกิน 10 ปี :</span>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="minorUnder10" value="have" checked={formData.minorUnder10 === 'have'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
                  <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="minorUnder10" value="none" checked={formData.minorUnder10 === 'none'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
                </div>
                <span className="text-[#1E2A5E] text-[14px] pt-0.5">อายุ 10 - 20 ปี :</span>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="minor10to20" value="have" checked={formData.minor10to20 === 'have'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
                  <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="minor10to20" value="none" checked={formData.minor10to20 === 'none'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ─── ส่วนที่ 3: การส่งออกต่างประเทศ ────────── */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ</label>
              <div className="flex flex-col gap-4 pl-4">
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <CustomRadio name="transferAbroad" value="yes" checked={formData.transferAbroad === 'yes'} onChange={handleChange} />
                  <span className="text-[#1E2A5E] text-[14px]">มี</span>
                </label>
                {formData.transferAbroad === 'yes' && (
                  <div className="pl-8 flex flex-col gap-4 border-l-2 border-[#8B93C5] ml-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">ประเทศปลายทาง :</span>
                      <input type="text" name="destinationCountry" value={formData.destinationCountry} onChange={handleChange} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] text-slate-800" placeholder="โปรดระบุ...." />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[14px] text-[#1E2A5E]">การโอนข้อมูลในบริษัทในเครือ</span>
                      <div className="flex flex-col gap-2 pl-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-3 cursor-pointer w-fit">
                            <CustomRadio name="transferAffiliate" value="yes" checked={formData.transferAffiliate === 'yes'} onChange={handleChange} />
                            <span className="text-[#1E2A5E] text-[14px]">ใช่ :</span>
                          </label>
                          <input type="text" name="transferAffiliateSpec" value={formData.transferAffiliateSpec} onChange={handleChange} disabled={formData.transferAffiliate !== 'yes'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[220px] disabled:bg-slate-100 text-slate-800" placeholder="โปรดระบุ...." />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer w-fit">
                          <CustomRadio name="transferAffiliate" value="no" checked={formData.transferAffiliate === 'no'} onChange={handleChange} />
                          <span className="text-[#1E2A5E] text-[14px]">ไม่ใช่</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">วิธีการโอนย้าย :</span>
                      <input type="text" name="transferMethod" value={formData.transferMethod} onChange={handleChange} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] text-slate-800" placeholder="โปรดระบุ เช่น โอนทางอิเล็กทรอนิกส์" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] shrink-0">มาตรการคุ้มครองข้อมูลส่วนบุคคลของประเทศปลายทาง :</span>
                      <input type="text" name="protectionMeasure" value={formData.protectionMeasure} onChange={handleChange} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] text-slate-800" placeholder="โปรดระบุ...." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[14px] text-[#1E2A5E]">ข้อยกเว้นตามมาตรา 28</span>
                      <p className="text-[12px] text-slate-600"><span className="text-red-500">*</span> (เช่น ปฏิบัติตามกฎหมาย ความยินยอม ปฏิบัติตามสัญญา ป้องกันอันตรายต่อชีวิต ประโยชน์สาธารณะที่สำคัญ)</p>
                      <textarea name="exceptionArt28" value={formData.exceptionArt28} onChange={handleChange} rows={3} className={`${textareaCls} w-full max-w-[700px]`} placeholder="เช่น ฐานความยินยอม, ฐานปฏิบัติตามกฎหมาย" />
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <CustomRadio name="transferAbroad" value="no" checked={formData.transferAbroad === 'no'} onChange={handleChange} />
                  <span className="text-[#1E2A5E] text-[14px]">ไม่มี</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ระดับความเสี่ยง</label>
              <div className="flex flex-col gap-3 pl-4">
                {['ความเสี่ยงระดับต่ำ', 'ความเสี่ยงระดับกลาง', 'ความเสี่ยงระดับสูง'].map(level => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer w-fit">
                    <CustomRadio name="riskLevel" value={level} checked={formData.riskLevel === level} onChange={handleChange} />
                    <span className="text-[#1E2A5E] text-[14px]">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ─── ส่วนที่ 4: นโยบายการเก็บรักษา ──────────── */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">ประเภทของข้อมูลที่จัดเก็บ</span>
              <div className="flex gap-6 pl-4">
                {['ข้อมูลอิเล็กทรอนิกส์', 'เอกสาร'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.dataTypes.includes(item)} onChange={() => handleCheckboxArray('dataTypes', item)} className="w-4 h-4 rounded-sm text-[#4A85E6]" />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">วิธีการเก็บรักษาข้อมูล</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 pl-4">
                {['เซิร์ฟเวอร์ภายในองค์กร', 'พื้นที่เก็บข้อมูลบนคลาวด์', 'การเข้ารหัส', 'ผู้ให้บริการภายนอก', 'ใส่แฟ้มสำหรับเอกสาร'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.storageMethods.includes(item)} onChange={() => handleCheckboxArray('storageMethods', item)} className="w-4 h-4 rounded-sm" />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล (แผนกที่เข้าถึงได้)</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 pl-4">
                {['ฝ่ายบริหาร', 'ฝ่ายเทคโนโลยีสารสนเทศ', 'ฝ่ายทรัพยากรบุคคล', 'ฝ่ายพัฒนาซอฟต์แวร์', 'ฝ่ายบัญชีและการเงิน', 'ฝ่ายลูกค้าสัมพันธ์ / บริการลูกค้า', 'ฝ่ายธุรการ', 'ฝ่ายกฎหมาย', 'ฝ่ายการตลาด', 'ฝ่ายจัดซื้อ'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.accessRights.includes(item)} onChange={() => handleCheckboxArray('accessRights', item)} className="w-4 h-4 rounded-sm" />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการลบหรือทำลายข้อมูลส่วนบุคคล</label>
              <textarea name="deletionMethod" value={formData.deletionMethod} onChange={handleChange} rows={2} placeholder="โปรดระบุ..." className={textareaCls + ' w-full'} />
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ─── ส่วนที่ 5: ความยินยอมและมาตรการความปลอดภัย ─── */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับการยกเว้นไม่ต้องขอความยินยอม</label>
              <input type="text" name="useWithoutConsent" value={formData.useWithoutConsent} onChange={handleChange} className={inputCls + ' w-full'} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล</label>
              <input type="text" name="denialOfRights" value={formData.denialOfRights} onChange={handleChange} className={inputCls + ' w-full'} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[#1E2A5E] font-medium text-[14px] mb-2">คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย</span>
              <div className="flex flex-col gap-4 pl-4">
                {[
                  { label: 'มาตรการเชิงองค์กร', name: 'orgMeasure' },
                  { label: 'มาตรการเชิงเทคนิค', name: 'techMeasure' },
                  { label: 'มาตรการทางกายภาพ', name: 'physicalMeasure' },
                  { label: 'การควบคุมการเข้าถึงข้อมูล', name: 'accessControl' },
                  { label: 'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน', name: 'userResponsibility' },
                  { label: 'มาตรการตรวจสอบย้อนหลัง', name: 'auditMeasure' },
                ].map(field => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <span className="text-[#1E2A5E] text-[13px]">{field.label}</span>
                    <input type="text" name={field.name} value={(formData as any)[field.name]} onChange={handleChange} className={inputCls + ' w-full max-w-[700px]'} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ─── Footer Buttons ───────────────────────────── */}
        <div className="flex justify-between mt-12 pt-6 border-t border-slate-300 pb-2">
          <button
            onClick={() => setStep(4 as any)}
            className="text-[#E54D4D] font-bold text-[15px] hover:underline px-4"
          >
            Request Edited
          </button>
          <button
            onClick={handleReviewed}
            disabled={isSubmitting}
            className="px-10 py-2.5 rounded-full bg-[#6CA886] text-white font-bold text-[15px] hover:bg-[#5a9072] transition-all shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'Reviewed'}
          </button>
        </div>
      </div>
    </div>
  );
}
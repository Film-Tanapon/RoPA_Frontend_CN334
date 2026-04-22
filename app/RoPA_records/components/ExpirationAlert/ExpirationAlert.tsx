"use client";
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3340';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface RoPARecord {
  id: number;
  activity_name: string;
  purpose: string;
  data_owner: string;
  data_subject: string;
  data_category: string;
  is_sensitive: boolean;
  personal_info: string;
  collection_method: string;
  source: string;
  legal_basis: string;
  is_under_10: boolean;
  is_age_10_20: boolean;
  is_international: boolean;
  storage_format: string;
  retention_method: string;
  retention_start: string;
  retention_period: string;
  retention_until: string;
  access_control: string;
  disposal_method: string;
  consent_exempt_basis: string;
  right_rejection_reason: string;
  risk_level: string;
  status: string;
  create_by: number;
}

interface Transfer {
  id?: number;
  ropa_id: number;
  country: string;
  recipient_name: string;
  transfer_method: string;
  protection_std: string;
  protection_measure: string;
}

interface SecurityMeasure {
  id?: number;
  ropa_id: number;
  measure_type: string;
  description: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || '';
}

function getCurrentUserId(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id ?? payload.id ?? payload.sub_id ?? null;
  } catch {
    return null;
  }
}

function getDaysUntilExpiry(retentionUntil: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(retentionUntil);
  expiry.setHours(0, 0, 0, 0);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateTH(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function safeSplit(str: string | undefined | null): string[] {
  if (!str || str === '-' || str === '[]') return [];
  return str.split(', ').filter((s) => s.trim() !== '');
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-[#C5D9ED] border-t-[#1E2A5E] rounded-full animate-spin" />
    </div>
  );
}

const CustomRadio = ({
  name, value, checked, onChange,
}: {
  name: string; value: string; checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative flex items-center justify-center">
    <input
      type="radio" name={name} value={value} checked={checked} onChange={onChange}
      className="peer appearance-none w-4 h-4 border border-slate-400 rounded-full checked:border-[#4A85E6] bg-white transition-all cursor-pointer"
    />
    <div className="absolute w-2 h-2 rounded-full bg-[#4A85E6] opacity-0 peer-checked:opacity-100 transition-all pointer-events-none" />
  </div>
);

// ─── List View ─────────────────────────────────────────────────────────────────
function ExpirationAlertList({
  onSelect,
}: {
  onSelect: (record: RoPARecord) => void;
}) {
  const [records, setRecords] = useState<RoPARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const token = getToken();
        if (!token) throw new Error('ไม่พบ Token กรุณาเข้าสู่ระบบ');

        const currentUserId = getCurrentUserId();

        const ropaRes = await fetch(`${API_BASE}/ropa-records`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ropaRes.ok) throw new Error('โหลด RoPA ไม่สำเร็จ');
        const allRecords: RoPARecord[] = await ropaRes.json();

        // Filter: create_by = currentUser + retention_until ภายใน 14 วัน
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threshold = new Date(today);
        threshold.setDate(threshold.getDate() + 14);

        const filtered = allRecords.filter((r) => {
          if (currentUserId !== null && r.create_by !== currentUserId) return false;
          if (!r.retention_until) return false;
          const expiry = new Date(r.retention_until);
          expiry.setHours(0, 0, 0, 0);
          return expiry >= today && expiry <= threshold;
        });

        // Sort: ใกล้หมดอายุก่อน
        filtered.sort((a, b) =>
          new Date(a.retention_until).getTime() - new Date(b.retention_until).getTime()
        );

        setRecords(filtered);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-[3rem] p-10 shadow-sm animate-in zoom-in duration-300">
      <div className="flex-1 bg-[#EBF4FA] rounded-2xl p-8 overflow-y-auto custom-scrollbar">
        {loading && <Spinner />}
        {error && <p className="text-red-500 text-center py-6">{error}</p>}
        {!loading && !error && records.length === 0 && (
          <p className="text-center text-slate-500 py-12">ไม่มีรายการที่ใกล้หมดอายุ</p>
        )}
        <div className="space-y-6 max-w-4xl mx-auto">
          {records.map((record) => {
            const daysLeft = getDaysUntilExpiry(record.retention_until);
            const expiryDateFormatted = formatDateTH(record.retention_until);
            return (
              <div
                key={record.id}
                onClick={() => onSelect(record)}
                className="group flex bg-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all overflow-hidden border border-slate-100"
              >
                <div className="flex-1 p-8">
                  <h3 className="text-2xl font-normal text-slate-800 mb-4">
                    {record.activity_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <p className="text-red-500 font-medium text-[14px]">
                      หมดอายุ วันที่ {expiryDateFormatted} (อีก {daysLeft} วัน)
                    </p>
                  </div>
                </div>
                <div className="w-24 bg-[#D3E5F5] flex items-center justify-center group-hover:bg-[#C2D9ED] transition-colors">
                  <svg
                    width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="#1E2A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Detail / Form View ────────────────────────────────────────────────────────
function ExpirationAlertDetail({
  initialRecord,
  onBack,
}: {
  initialRecord: RoPARecord;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const daysLeft = getDaysUntilExpiry(initialRecord.retention_until);
  const expiryDateFormatted = formatDateTH(initialRecord.retention_until);

  const emptyForm = {
    activityName: '',
    startDate: '',
    retentionPeriod: '',
    purpose: '',
    dataOwner: '',
    dataSubject: '',
    dataCategory: '',
    dataType: 'general',
    personalInfo: '',
    dataSource: 'direct',
    dataSourceOtherSpec: '',
    legalBasis: '',
    collectionMethod: 'digital',
    minorUnder10: 'none',
    minor10to20: 'none',
    transferAbroad: 'no',
    destinationCountry: '',
    transferAffiliate: 'no',
    transferAffiliateSpec: '',
    transferMethod: '',
    protectionMeasure: '',
    exceptionArt28: '',
    dataTypes: [] as string[],
    storageMethods: [] as string[],
    accessRights: [] as string[],
    deletionMethod: '',
    useWithoutConsent: '',
    denialOfRights: '',
    riskLevel: 'ความเสี่ยงระดับต่ำ',
    orgMeasure: '',
    techMeasure: '',
    physicalMeasure: '',
    accessControl: '',
    userResponsibility: '',
    auditMeasure: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const populateForm = useCallback(async (record: RoPARecord) => {
    const token = getToken();
    let transferData: Transfer | null = null;
    let secMap: Record<string, string> = {};

    try {
      const [tRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/transfers/${record.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/security/${record.id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (tRes.ok) {
        const tj = await tRes.json();
        transferData = tj.data ?? tj;
      }
      if (sRes.ok) {
        const sj = await sRes.json();
        const sArr: SecurityMeasure[] = Array.isArray(sj.data) ? sj.data : Array.isArray(sj) ? sj : [];
        sArr.forEach((s) => { secMap[s.measure_type] = s.description; });
      }
    } catch { /* ignore */ }

    const hasRecipient =
      transferData?.recipient_name &&
      transferData.recipient_name !== '-' &&
      transferData.recipient_name !== 'no';

    const filled = {
      activityName: record.activity_name || '',
      startDate: record.retention_start && record.retention_start !== '-' ? record.retention_start : '',
      retentionPeriod: record.retention_period && record.retention_period !== '-' ? record.retention_period : '',
      purpose: record.purpose || '',
      dataOwner: record.data_owner !== '-' ? (record.data_owner || '') : '',
      dataSubject: record.data_subject !== '-' ? (record.data_subject || '') : '',
      dataCategory: record.data_category !== 'Uncategorized' ? (record.data_category || '') : '',
      dataType: record.is_sensitive ? 'sensitive' : 'general',
      personalInfo: record.personal_info || '',
      dataSource: record.source === 'direct' ? 'direct' : 'other',
      dataSourceOtherSpec: record.source !== 'direct' && record.source !== '-' ? record.source : '',
      legalBasis: record.legal_basis !== '-' ? (record.legal_basis || '') : '',
      collectionMethod: record.collection_method || 'digital',
      minorUnder10: record.is_under_10 ? 'have' : 'none',
      minor10to20: record.is_age_10_20 ? 'have' : 'none',
      transferAbroad: record.is_international ? 'yes' : 'no',
      destinationCountry: transferData?.country !== '-' ? (transferData?.country || '') : '',
      transferAffiliate: hasRecipient ? 'yes' : 'no',
      transferAffiliateSpec:
        hasRecipient && transferData?.recipient_name !== 'yes'
          ? transferData?.recipient_name || ''
          : '',
      transferMethod: transferData?.transfer_method !== '-' ? transferData?.transfer_method || '' : '',
      protectionMeasure: transferData?.protection_measure !== '-' ? transferData?.protection_measure || '' : '',
      exceptionArt28: transferData?.protection_std !== '-' ? transferData?.protection_std || '' : '',
      dataTypes: safeSplit(record.storage_format),
      storageMethods: safeSplit(record.retention_method),
      accessRights: safeSplit(record.access_control),
      deletionMethod: record.disposal_method !== '-' ? record.disposal_method || '' : '',
      useWithoutConsent: record.consent_exempt_basis !== '-' ? record.consent_exempt_basis || '' : '',
      denialOfRights: record.right_rejection_reason !== '-' ? record.right_rejection_reason || '' : '',
      riskLevel: record.risk_level || 'ความเสี่ยงระดับต่ำ',
      orgMeasure: secMap['มาตรการเชิงองค์กร'] && secMap['มาตรการเชิงองค์กร'] !== '-' ? secMap['มาตรการเชิงองค์กร'] : '',
      techMeasure: secMap['มาตรการเชิงเทคนิค'] && secMap['มาตรการเชิงเทคนิค'] !== '-' ? secMap['มาตรการเชิงเทคนิค'] : '',
      physicalMeasure: secMap['มาตรการเชิงกายภาพ'] && secMap['มาตรการเชิงกายภาพ'] !== '-' ? secMap['มาตรการเชิงกายภาพ'] : '',
      accessControl: secMap['การควบคุมการเข้าถึง'] && secMap['การควบคุมการเข้าถึง'] !== '-' ? secMap['การควบคุมการเข้าถึง'] : '',
      userResponsibility: secMap['ความรับผิดชอบของผู้ใช้งาน'] && secMap['ความรับผิดชอบของผู้ใช้งาน'] !== '-' ? secMap['ความรับผิดชอบของผู้ใช้งาน'] : '',
      auditMeasure: secMap['มาตรการตรวจสอบ'] && secMap['มาตรการตรวจสอบ'] !== '-' ? secMap['มาตรการตรวจสอบ'] : '',
    };

    setFormData(filled);
    setLoading(false);
  }, []);

  useEffect(() => {
    populateForm(initialRecord);
  }, [initialRecord, populateForm]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxArray = (
    field: 'dataTypes' | 'storageMethods' | 'accessRights',
    value: string,
  ) => {
    setFormData((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value],
      };
    });
  };

  // ── Extend Retention ──────────────────────────────────────────────────────────
  const handleExtendRetention = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    const token = getToken();
    const currentUserId = getCurrentUserId();
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const id = initialRecord.id;

    try {
      // 1. PUT RoPA record — อัพเดทข้อมูลฟอร์มปัจจุบัน + status → Pending
      const ropaPayload = {
        activity_name: formData.activityName || '-',
        purpose: formData.purpose || '-',
        data_owner: formData.dataOwner || '-',
        data_subject: formData.dataSubject || '-',
        data_category: formData.dataCategory || 'Uncategorized',
        is_sensitive: formData.dataType === 'sensitive',
        personal_info: formData.personalInfo || '-',
        collection_method: formData.collectionMethod || '-',
        source:
          formData.dataSource === 'other' && formData.dataSourceOtherSpec
            ? formData.dataSourceOtherSpec
            : formData.dataSource,
        legal_basis: formData.legalBasis || '-',
        is_under_10: formData.minorUnder10 === 'have',
        is_age_10_20: formData.minor10to20 === 'have',
        is_international: formData.transferAbroad === 'yes',
        storage_format: formData.dataTypes.length > 0 ? formData.dataTypes.join(', ') : '-',
        retention_method: formData.storageMethods.length > 0 ? formData.storageMethods.join(', ') : '-',
        retention_start: formData.startDate || '-',
        retention_period: formData.retentionPeriod || '-',
        access_control: formData.accessRights.length > 0 ? formData.accessRights.join(', ') : '-',
        disposal_method: formData.deletionMethod || '-',
        consent_exempt_basis: formData.useWithoutConsent || '-',
        right_rejection_reason: formData.denialOfRights || '-',
        risk_level: formData.riskLevel,
        status: 'Pending',
      };

      const ropaRes = await fetch(`${API_BASE}/ropa-records/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(ropaPayload),
      });
      if (!ropaRes.ok) throw new Error('อัพเดท RoPA ไม่สำเร็จ');

      // 2. POST request — Extend Retention
      const requestPayload = {
        ropa_id: id,
        req_type: 'Extend Retention',
        status: 'pending',
      };

      const reqRes = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });
      if (!reqRes.ok) throw new Error('สร้าง Request ไม่สำเร็จ');

      setSuccessMsg('ส่งคำขอต่ออายุเรียบร้อยแล้ว');
      setTimeout(() => onBack(), 1500);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Request Deletion ──────────────────────────────────────────────────────────
  const handleRequestDeletion = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const id = initialRecord.id;

    try {
      const requestPayload = {
        ropa_id: id,
        req_type: 'Delete',
        status: 'pending',
      };

      const reqRes = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });
      if (!reqRes.ok) throw new Error('สร้าง Request ลบไม่สำเร็จ');

      setSuccessMsg('ส่งคำขอลบข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => onBack(), 1500);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-[3rem] p-10 shadow-sm">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[3rem] p-10 shadow-sm animate-in zoom-in duration-300">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* ── Header ── */}
        <div className="border border-slate-200 rounded-2xl p-6 mb-8 bg-white">
          <h2 className="text-2xl font-semibold text-[#1E2A5E] mb-2">แจ้งเตือนหมดอายุ</h2>
          <p className="text-red-500 font-medium text-[15px]">
            หมดอายุ วันที่ {expiryDateFormatted} (เหลืออีก {daysLeft} วัน)
          </p>
        </div>

        {/* ── Feedback / Error messages ── */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[14px] text-center">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[14px] text-center">
            {errorMsg}
          </div>
        )}

        {/* ── Form ── */}
        <div className="border border-slate-200 rounded-2xl p-8 bg-white space-y-8">

          {/* ── Section: ข้อมูลทั่วไป ── */}
          <section className="flex flex-col gap-5">
            <h3 className="text-[16px] font-semibold text-[#1E2A5E] border-b border-slate-200 pb-2">
              บันทึกรายการกิจกรรมการประมวลผล
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] text-[13px] font-medium">ชื่อกิจกรรม</label>
                <input
                  type="text" name="activityName" value={formData.activityName}
                  onChange={handleChange}
                  className="p-2 px-3 border border-slate-300 rounded-md text-[13px] text-slate-800 outline-none focus:border-[#8B93C5]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] text-[13px] font-medium">วันที่เริ่มกิจกรรม</label>
                <input
                  type="text" name="startDate" value={formData.startDate}
                  onChange={handleChange}
                  className="p-2 px-3 border border-slate-300 rounded-md text-[13px] text-slate-800 outline-none focus:border-[#8B93C5]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] text-[13px] font-medium">ระยะเวลาการเก็บรักษาข้อมูล</label>
                <input
                  type="text" name="retentionPeriod" value={formData.retentionPeriod}
                  onChange={handleChange}
                  placeholder="เช่น 5 ปี, 10 ปี"
                  className="p-2 px-3 border border-slate-300 rounded-md text-[13px] text-slate-800 outline-none focus:border-[#8B93C5]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] text-[13px] font-medium">วัตถุประสงค์ของการประมวลผล</label>
              <textarea
                name="purpose" value={formData.purpose} onChange={handleChange} rows={4}
                className="p-3 border border-slate-300 rounded-md text-[14px] resize-none w-full outline-none focus:border-[#8B93C5] text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] text-[13px] font-medium">เจ้าของข้อมูลส่วนบุคคล</label>
                <input
                  type="text" name="dataOwner" value={formData.dataOwner} onChange={handleChange}
                  className="p-2 px-3 border border-slate-300 rounded-md text-[13px] text-slate-800 outline-none focus:border-[#8B93C5]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] text-[13px] font-medium">หมวดหมู่ข้อมูล</label>
                <select
                  name="dataCategory" value={formData.dataCategory} onChange={handleChange}
                  className="p-2 px-3 border border-slate-300 rounded-md text-[13px] text-slate-800 outline-none focus:border-[#8B93C5] bg-white"
                >
                  <option value="">Select...</option>
                  <option value="ข้อมูลส่วนบุคคลทั่วไป">ข้อมูลส่วนบุคคลทั่วไป</option>
                  <option value="ข้อมูลส่วนบุคคลอ่อนไหว">ข้อมูลส่วนบุคคลอ่อนไหว</option>
                  <option value="ข้อมูลเด็ก">ข้อมูลเด็ก</option>
                  <option value="ข้อมูลทางการแพทย์">ข้อมูลทางการแพทย์</option>
                  <option value="Uncategorized">ไม่ระบุ</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] text-[13px] font-medium">ประเภทของข้อมูล</label>
              <div className="flex flex-col gap-2 pl-4">
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
          </section>

          <hr className="border-slate-200" />

          {/* ── Section: มาตรการความปลอดภัย ── */}
          <section className="flex flex-col gap-5">
            <h3 className="text-[16px] font-semibold text-[#1E2A5E] border-b border-slate-200 pb-2">
              คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'มาตรการเชิงองค์กร', name: 'orgMeasure' },
                { label: 'มาตรการเชิงเทคนิค', name: 'techMeasure' },
                { label: 'มาตรการทางกายภาพ', name: 'physicalMeasure' },
                { label: 'การควบคุมการเข้าถึงข้อมูล', name: 'accessControl' },
                { label: 'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน', name: 'userResponsibility' },
                { label: 'มาตรการตรวจสอบย้อนหลัง', name: 'auditMeasure' },
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <label className="text-[#1E2A5E] text-[13px] font-medium">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={(formData as Record<string, unknown>)[field.name] as string}
                    onChange={handleChange}
                    className="p-2 px-3 border border-slate-300 rounded-md text-[13px] w-full max-w-[700px] text-slate-800 outline-none focus:border-[#8B93C5]"
                  />
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* ── Section: ข้อมูลเพิ่มเติม ── */}
          <section className="flex flex-col gap-5">
            <h3 className="text-[16px] font-semibold text-[#1E2A5E] border-b border-slate-200 pb-2">
              ข้อมูลเพิ่มเติม
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] text-[13px] font-medium">วิธีการลบหรือทำลายข้อมูลส่วนบุคคล</label>
              <textarea
                name="deletionMethod" value={formData.deletionMethod} onChange={handleChange} rows={2}
                placeholder="โปรดระบุ..."
                className="p-3 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors resize-none rounded-md text-[14px] w-full text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] text-[13px] font-medium">
                การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับการยกเว้นไม่ต้องขอความยินยอม
              </label>
              <input
                type="text" name="useWithoutConsent" value={formData.useWithoutConsent} onChange={handleChange}
                className="p-2 border border-slate-300 rounded-md text-[14px] w-full text-slate-800 outline-none focus:border-[#8B93C5]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] text-[13px] font-medium">
                การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล
              </label>
              <input
                type="text" name="denialOfRights" value={formData.denialOfRights} onChange={handleChange}
                className="p-2 border border-slate-300 rounded-md text-[14px] w-full text-slate-800 outline-none focus:border-[#8B93C5]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[13px]">ระดับความเสี่ยง</label>
              <div className="flex flex-col gap-3 pl-4">
                {['ความเสี่ยงระดับต่ำ', 'ความเสี่ยงระดับกลาง', 'ความเสี่ยงระดับสูง'].map((v) => (
                  <label key={v} className="flex items-center gap-3 cursor-pointer w-fit">
                    <CustomRadio name="riskLevel" value={v} checked={formData.riskLevel === v} onChange={handleChange} />
                    <span className="text-[#1E2A5E] text-[14px]">{v}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* ── Buttons ── */}
          <div className="flex justify-end gap-4 items-center mt-4 pt-6 border-t border-slate-200">
            <button
              onClick={handleExtendRetention}
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-full bg-[#1E2A5E] text-white font-bold text-[14px] hover:bg-[#2d3d7a] transition-all shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? 'กำลังดำเนินการ...' : 'Extend Retention'}
            </button>
            <button
              onClick={handleRequestDeletion}
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-full bg-red-500 text-white font-bold text-[14px] hover:bg-red-600 transition-all shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? 'กำลังดำเนินการ...' : 'Request Deletion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function ExpirationAlert() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedRecord, setSelectedRecord] = useState<RoPARecord | null>(null);

  function handleSelect(record: RoPARecord) {
    setSelectedRecord(record);
    setView('detail');
  }

  if (view === 'detail' && selectedRecord) {
    return (
      <ExpirationAlertDetail
        initialRecord={selectedRecord}
        onBack={() => setView('list')}
      />
    );
  }

  return <ExpirationAlertList onSelect={handleSelect} />;
}
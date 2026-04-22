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

interface FeedbackItem {
  id: number;
  ropa_id: number;
  detail: string;
  create_date: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || '';
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
function FeedbackList({
  onSelect,
}: {
  onSelect: (record: RoPARecord, feedbacks: FeedbackItem[]) => void;
}) {
  const [records, setRecords] = useState<RoPARecord[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, FeedbackItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const token = getToken();
        if (!token) throw new Error('ไม่พบ Token กรุณาเข้าสู่ระบบ');

        // Decode user_id from JWT
        let currentUserId: number | null = null;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.user_id ?? payload.id ?? payload.sub_id ?? null;
        } catch { /* ignore */ }

        const ropaRes = await fetch(`${API_BASE}/ropa-records`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ropaRes.ok) throw new Error('โหลด RoPA ไม่สำเร็จ');
        const allRecords: RoPARecord[] = await ropaRes.json();

        // Filter: status = "Action Required" + create_by = currentUser
        const filtered = allRecords.filter(
          (r) =>
            r.status === 'Action Required' &&
            (currentUserId === null || r.create_by === currentUserId),
        );
        setRecords(filtered);

        // Fetch feedbacks for each filtered record
        const fbMap: Record<number, FeedbackItem[]> = {};
        await Promise.all(
          filtered.map(async (r) => {
            try {
              const fbRes = await fetch(`${API_BASE}/feedback/${r.id}`);
              if (fbRes.ok) {
                const fbJson = await fbRes.json();
                fbMap[r.id] = Array.isArray(fbJson) ? fbJson : (fbJson.data ?? []);
              } else {
                fbMap[r.id] = [];
              }
            } catch {
              fbMap[r.id] = [];
            }
          }),
        );
        setFeedbackMap(fbMap);
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
          <p className="text-center text-slate-500 py-12">ไม่มีรายการที่ต้องดำเนินการ</p>
        )}
        <div className="space-y-6 max-w-4xl mx-auto">
          {records.map((record) => {
            const feedbacks = feedbackMap[record.id] ?? [];
            const latestFb = feedbacks[feedbacks.length - 1];
            return (
              <div
                key={record.id}
                onClick={() => onSelect(record, feedbacks)}
                className="group flex bg-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all overflow-hidden border border-slate-100"
              >
                <div className="flex-1 p-8">
                  <h3 className="text-2xl font-normal text-slate-800 mb-4">
                    {record.activity_name}
                  </h3>
                  <p className="text-slate-600 font-medium">
                    รายละเอียดการแก้ไข : {latestFb?.detail ?? '—'}
                  </p>
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

// ─── Detail / Edit View ────────────────────────────────────────────────────────
function FeedbackDetail({
  initialRecord,
  feedbacks,
  onBack,
}: {
  initialRecord: RoPARecord;
  feedbacks: FeedbackItem[];
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm = {
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
    accessControl: '', userResponsibility: '', auditMeasure: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [snapshot, setSnapshot] = useState(emptyForm);

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
      digitalSpec: '',
      paperSpec: '',
      minorUnder10: record.is_under_10 ? 'have' : 'none',
      minor10to20: record.is_age_10_20 ? 'have' : 'none',
      transferAbroad: record.is_international ? 'yes' : 'no',
      destinationCountry: transferData?.country !== '-' ? (transferData?.country || '') : '',
      transferAffiliate: hasRecipient ? 'yes' : 'no',
      transferAffiliateSpec:
        hasRecipient && transferData?.recipient_name !== 'yes'
          ? transferData?.recipient_name || ''
          : '',
      transferMethod:
        transferData?.transfer_method !== '-' ? transferData?.transfer_method || '' : '',
      protectionMeasure:
        transferData?.protection_measure !== '-' ? transferData?.protection_measure || '' : '',
      exceptionArt28:
        transferData?.protection_std !== '-' ? transferData?.protection_std || '' : '',
      dataTypes: safeSplit(record.storage_format),
      storageMethods: safeSplit(record.retention_method),
      accessRights: safeSplit(record.access_control),
      deletionMethod: record.disposal_method !== '-' ? record.disposal_method || '' : '',
      useWithoutConsent:
        record.consent_exempt_basis !== '-' ? record.consent_exempt_basis || '' : '',
      denialOfRights:
        record.right_rejection_reason !== '-' ? record.right_rejection_reason || '' : '',
      riskLevel: record.risk_level || 'ความเสี่ยงระดับต่ำ',
      orgMeasure:
        secMap['มาตรการเชิงองค์กร'] && secMap['มาตรการเชิงองค์กร'] !== '-'
          ? secMap['มาตรการเชิงองค์กร']
          : '',
      techMeasure:
        secMap['มาตรการเชิงเทคนิค'] && secMap['มาตรการเชิงเทคนิค'] !== '-'
          ? secMap['มาตรการเชิงเทคนิค']
          : '',
      physicalMeasure:
        secMap['มาตรการเชิงกายภาพ'] && secMap['มาตรการเชิงกายภาพ'] !== '-'
          ? secMap['มาตรการเชิงกายภาพ']
          : '',
      accessControl:
        secMap['การควบคุมการเข้าถึง'] && secMap['การควบคุมการเข้าถึง'] !== '-'
          ? secMap['การควบคุมการเข้าถึง']
          : '',
      userResponsibility:
        secMap['ความรับผิดชอบของผู้ใช้งาน'] && secMap['ความรับผิดชอบของผู้ใช้งาน'] !== '-'
          ? secMap['ความรับผิดชอบของผู้ใช้งาน']
          : '',
      auditMeasure:
        secMap['มาตรการตรวจสอบ'] && secMap['มาตรการตรวจสอบ'] !== '-'
          ? secMap['มาตรการตรวจสอบ']
          : '',
    };

    setFormData(filled);
    setSnapshot(filled);
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

  const handleReset = () => setFormData(snapshot);

  const handleSave = async () => {
    setIsSubmitting(true);
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const id = initialRecord.id;
    const cleanStart =
      formData.startDate && formData.startDate !== '-' ? formData.startDate : '-';

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
      retention_method:
        formData.storageMethods.length > 0 ? formData.storageMethods.join(', ') : '-',
      retention_start: cleanStart,
      retention_period: formData.retentionPeriod || '-',
      access_control: formData.accessRights.length > 0 ? formData.accessRights.join(', ') : '-',
      disposal_method: formData.deletionMethod || '-',
      consent_exempt_basis: formData.useWithoutConsent || '-',
      right_rejection_reason: formData.denialOfRights || '-',
      risk_level: formData.riskLevel,
      status: 'Pending', // เปลี่ยน status → Pending เมื่อ Save
    };

    try {
      // 1. PUT RoPA record
      const ropaRes = await fetch(`${API_BASE}/ropa-records/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(ropaPayload),
      });
      if (!ropaRes.ok) {
        const err = await ropaRes.json();
        throw new Error(err.detail || 'อัปเดต RoPA ไม่สำเร็จ');
      }

      // 2. Security measures — PUT existing, POST new
      const securityMeasures = [
        { type: 'มาตรการเชิงองค์กร', desc: formData.orgMeasure },
        { type: 'มาตรการเชิงเทคนิค', desc: formData.techMeasure },
        { type: 'มาตรการเชิงกายภาพ', desc: formData.physicalMeasure },
        { type: 'การควบคุมการเข้าถึง', desc: formData.accessControl },
        { type: 'ความรับผิดชอบของผู้ใช้งาน', desc: formData.userResponsibility },
        { type: 'มาตรการตรวจสอบ', desc: formData.auditMeasure },
      ];

      const secRes = await fetch(`${API_BASE}/security/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingSec: SecurityMeasure[] = secRes.ok
        ? ((await secRes.json().then((j) => j.data ?? j)) as SecurityMeasure[]).filter(Boolean)
        : [];

      await Promise.all(
        securityMeasures.map(async (m) => {
          const desc = m.desc?.trim() || '-';
          const existing = existingSec.find((s) => s.measure_type === m.type);
          if (existing?.id) {
            await fetch(`${API_BASE}/security/${existing.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ measure_type: m.type, description: desc }),
            });
          } else {
            await fetch(`${API_BASE}/security`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ ropa_id: id, measure_type: m.type, description: desc }),
            });
          }
        }),
      );

      // 3. Transfer
      if (formData.transferAbroad === 'yes') {
        const transferPayload = {
          ropa_id: id,
          country: formData.destinationCountry || '-',
          recipient_name:
            formData.transferAffiliate === 'yes'
              ? formData.transferAffiliateSpec || 'yes'
              : 'no',
          transfer_method: formData.transferMethod || '-',
          protection_std: formData.exceptionArt28 || '-',
          protection_measure: formData.protectionMeasure || '-',
        };
        const checkT = await fetch(`${API_BASE}/transfers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (checkT.ok) {
          const existing = await checkT.json();
          const tId = existing.id ?? existing.data?.id;
          await fetch(`${API_BASE}/transfers/${tId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(transferPayload),
          });
        } else {
          await fetch(`${API_BASE}/transfers`, {
            method: 'POST',
            headers,
            body: JSON.stringify(transferPayload),
          });
        }
      }

      alert('อัปเดตข้อมูลสำเร็จ! สถานะเปลี่ยนเป็น Pending แล้ว');
      onBack();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-[3rem] p-8 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold w-fit mb-6 transition-colors"
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          กลับไปหน้ารายการ
        </button>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[3rem] p-8 shadow-sm animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold w-fit mb-6 transition-colors"
      >
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        กลับไปหน้ารายการ
      </button>

      <div className="bg-[#F4F8FB] border border-slate-300 rounded-xl p-8 w-full flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[#1E2A5E] mb-2">
          แก้ไขกิจกรรมการประมวลผล (ROPA)
        </h2>

        {/* Feedback detail boxes */}
        {feedbacks.length > 0 && (
          <div className="flex flex-col gap-3 mb-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-[#EBF4FA] border border-[#C5D9ED] p-5 rounded-lg">
                <h3 className="text-base font-bold text-[#1E2A5E] mb-1">รายละเอียดการแก้ไข</h3>
                <p className="text-sm text-slate-700">{fb.detail}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(fb.create_date).toLocaleDateString('th-TH')}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-10">

          {/* ── Section 1 ── */}
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ชื่อกิจกรรม</label>
                <input type="text" name="activityName" value={formData.activityName} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] text-slate-800" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">วันที่เริ่มกิจกรรม</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] text-slate-800" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ระยะเวลาการเก็บรักษา</label>
                <input type="text" name="retentionPeriod" value={formData.retentionPeriod} onChange={handleChange} placeholder="เช่น 5 ปี, 10 ปี" className="p-2 border border-slate-300 rounded-md text-[14px] text-slate-800" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วัตถุประสงค์ของการประมวลผล</label>
              <textarea name="purpose" value={formData.purpose} onChange={handleChange} rows={3} className="p-3 border border-slate-300 rounded-md text-[14px] resize-none text-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">เจ้าของข้อมูลส่วนบุคคล</label>
                <input type="text" name="dataSubject" value={formData.dataSubject} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] text-slate-800" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">หมวดหมู่ข้อมูล</label>
                <div className="relative">
                  <select name="dataCategory" value={formData.dataCategory} onChange={handleChange} className="w-full p-2.5 px-4 border border-slate-300 bg-white rounded-md text-[14px] appearance-none pr-10 text-slate-800">
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
                <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="dataType" value="general" checked={formData.dataType === 'general'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ข้อมูลทั่วไป</span></label>
                <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="dataType" value="sensitive" checked={formData.dataType === 'sensitive'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ข้อมูลอ่อนไหว</span></label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ข้อมูลส่วนบุคคลที่จัดเก็บ</label>
              <textarea name="personalInfo" value={formData.personalInfo} onChange={handleChange} rows={2} className="p-3 border border-slate-300 rounded-md text-[14px] resize-none text-slate-800" placeholder="โปรดระบุ เช่น ชื่อ นามสกุล ที่อยู่ เป็นต้น..." />
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ── Section 2 ── */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">แหล่งที่ได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="dataSource" value="direct" checked={formData.dataSource === 'direct'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">จากเจ้าของข้อมูลส่วนบุคคลโดยตรง</span></label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="dataSource" value="other" checked={formData.dataSource === 'other'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">จากแหล่งอื่น :</span></label>
                  <input type="text" name="dataSourceOtherSpec" value={formData.dataSourceOtherSpec} onChange={handleChange} disabled={formData.dataSource !== 'other'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 outline-none text-slate-800" placeholder="โปรดระบุ...." />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ฐานในการประมวลผล</label>
              <textarea name="legalBasis" value={formData.legalBasis} onChange={handleChange} rows={2} className="p-3 border border-slate-300 rounded-md text-[14px] resize-none text-slate-800" />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="collectionMethod" value="digital" checked={formData.collectionMethod === 'digital'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">รูปแบบดิจิทัล / ข้อมูลอิเล็กทรอนิกส์ :</span></label>
                  <input type="text" name="digitalSpec" value={formData.digitalSpec} onChange={handleChange} disabled={formData.collectionMethod !== 'digital'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 text-slate-800" placeholder="เช่น เว็บฟอร์ม, อีเมล" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="collectionMethod" value="paper" checked={formData.collectionMethod === 'paper'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">รูปแบบเอกสาร :</span></label>
                  <input type="text" name="paperSpec" value={formData.paperSpec} onChange={handleChange} disabled={formData.collectionMethod !== 'paper'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 text-slate-800" placeholder="เช่น การส่งเอกสาร" />
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

          {/* ── Section 3 ── */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ</label>
              <div className="flex flex-col gap-4 pl-4">
                <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="transferAbroad" value="yes" checked={formData.transferAbroad === 'yes'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
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
                          <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="transferAffiliate" value="yes" checked={formData.transferAffiliate === 'yes'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ใช่ :</span></label>
                          <input type="text" name="transferAffiliateSpec" value={formData.transferAffiliateSpec} onChange={handleChange} disabled={formData.transferAffiliate !== 'yes'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[220px] disabled:bg-slate-100 text-slate-800" placeholder="โปรดระบุ...." />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="transferAffiliate" value="no" checked={formData.transferAffiliate === 'no'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ไม่ใช่</span></label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">วิธีการโอนย้าย :</span>
                      <input type="text" name="transferMethod" value={formData.transferMethod} onChange={handleChange} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] text-slate-800" placeholder="โปรดระบุ เช่น โอนทางอิเล็กทรอนิกส์" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] shrink-0 whitespace-nowrap">มาตรการคุ้มครองข้อมูลส่วนบุคคล :</span>
                      <input type="text" name="protectionMeasure" value={formData.protectionMeasure} onChange={handleChange} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] text-slate-800" placeholder="โปรดระบุ" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[14px] text-[#1E2A5E]">ข้อยกเว้นตามมาตรา 28</span>
                      <p className="text-[12px] text-slate-800 leading-relaxed">
                        <span className="text-red-500">*</span> (เช่น ปฏิบัติตามกฎหมาย ความยินยอม ปฏิบัติตามสัญญา ป้องกันอันตรายต่อชีวิต ประโยชน์สาธารณะที่สำคัญ)
                      </p>
                      <textarea name="exceptionArt28" value={formData.exceptionArt28} onChange={handleChange} rows={3} className="p-3 border border-slate-300 rounded-md text-[14px] resize-none w-full max-w-[700px] outline-none focus:border-[#8B93C5] text-slate-800" placeholder="เช่น ฐานความยินยอม, ฐานปฏิบัติตามกฎหมาย" />
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer w-fit"><CustomRadio name="transferAbroad" value="no" checked={formData.transferAbroad === 'no'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ระดับความเสี่ยง</label>
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

          <hr className="border-slate-300" />

          {/* ── Section 4 ── */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">ประเภทของข้อมูลที่จัดเก็บ</span>
              <div className="flex gap-6 pl-4">
                {['ข้อมูลอิเล็กทรอนิกส์', 'เอกสาร'].map((item) => (
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
                {['เซิร์ฟเวอร์ภายในองค์กร', 'พื้นที่เก็บข้อมูลบนคลาวด์', 'การเข้ารหัส', 'ผู้ให้บริการภายนอก', 'ใส่แฟ้มสำหรับเอกสาร'].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.storageMethods.includes(item)} onChange={() => handleCheckboxArray('storageMethods', item)} className="w-4 h-4 rounded-sm text-[#4A85E6]" />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล (แผนกที่เข้าถึงได้)</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 pl-4">
                {['ฝ่ายบริหาร', 'ฝ่ายเทคโนโลยีสารสนเทศ', 'ฝ่ายทรัพยากรบุคคล', 'ฝ่ายพัฒนาซอฟต์แวร์', 'ฝ่ายบัญชีและการเงิน', 'ฝ่ายลูกค้าสัมพันธ์ / บริการลูกค้า', 'ฝ่ายธุรการ', 'ฝ่ายกฎหมาย', 'ฝ่ายการตลาด', 'ฝ่ายจัดซื้อ'].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.accessRights.includes(item)} onChange={() => handleCheckboxArray('accessRights', item)} className="w-4 h-4 rounded-sm text-[#4A85E6]" />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการลบหรือทำลายข้อมูลส่วนบุคคล</label>
              <textarea name="deletionMethod" value={formData.deletionMethod} onChange={handleChange} rows={2} placeholder="โปรดระบุ..." className="p-3 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors resize-none rounded-md text-[14px] w-full text-slate-800" />
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ── Section 5 ── */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับการยกเว้นไม่ต้องขอความยินยอม</label>
              <input type="text" name="useWithoutConsent" value={formData.useWithoutConsent} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] w-full text-slate-800" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล</label>
              <input type="text" name="denialOfRights" value={formData.denialOfRights} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] w-full text-slate-800" />
            </div>
            <div className="flex flex-col gap-4 pl-4">
              {[
                { label: 'มาตรการเชิงองค์กร', name: 'orgMeasure' },
                { label: 'มาตรการเชิงเทคนิค', name: 'techMeasure' },
                { label: 'มาตรการทางกายภาพ', name: 'physicalMeasure' },
                { label: 'การควบคุมการเข้าถึงข้อมูล', name: 'accessControl' },
                { label: 'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน', name: 'userResponsibility' },
                { label: 'มาตรการตรวจสอบย้อนหลัง', name: 'auditMeasure' },
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <span className="text-[#1E2A5E] text-[13px]">{field.label}</span>
                  <input
                    type="text"
                    name={field.name}
                    value={(formData as Record<string, unknown>)[field.name] as string}
                    onChange={handleChange}
                    className="p-2 border border-slate-300 rounded-md text-[14px] w-full max-w-[700px] text-slate-800"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Buttons ── */}
        <div className="flex justify-end gap-8 items-center mt-12 pt-6 border-t border-slate-300">
          <button
            onClick={handleReset}
            disabled={isSubmitting}
            className="group flex items-center gap-2 text-red-500 font-bold text-[14px] disabled:opacity-50"
          >
            <span className="border-b-2 border-red-500 pb-0.5">Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-10 py-2.5 rounded-full bg-[#6CA886] text-white font-bold text-[15px] hover:bg-[#5a9072] transition-all shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'Save Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function Feedback() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedRecord, setSelectedRecord] = useState<RoPARecord | null>(null);
  const [selectedFeedbacks, setSelectedFeedbacks] = useState<FeedbackItem[]>([]);

  function handleSelect(record: RoPARecord, feedbacks: FeedbackItem[]) {
    setSelectedRecord(record);
    setSelectedFeedbacks(feedbacks);
    setView('detail');
  }

  if (view === 'detail' && selectedRecord) {
    return (
      <FeedbackDetail
        initialRecord={selectedRecord}
        feedbacks={selectedFeedbacks}
        onBack={() => setView('list')}
      />
    );
  }

  return <FeedbackList onSelect={handleSelect} />;
}
"use client";
import React, { useState, useEffect } from 'react';

interface CombinedFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export default function RopaCombinedForm({ onCancel, onSuccess, initialData }: CombinedFormProps) {
  const token = localStorage.getItem('access_token');
  const [formData, setFormData] = useState({
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
    digitalSpec: '',
    paperSpec: '',
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
    status: 'Pending',
    orgMeasure: '',
    techMeasure: '',
    physicalMeasure: '',
    accessControl: '',
    userResponsibility: '',
    auditMeasure: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleClear = () => {
    setFormData({
      activityName: '', startDate: '', retentionPeriod: '', purpose: '', dataOwner: '',
      dataSubject: '', dataCategory: '', dataType: 'general', personalInfo: '', dataSource: 'direct',
      dataSourceOtherSpec: '', legalBasis: '', collectionMethod: 'digital', digitalSpec: '', paperSpec: '',
      minorUnder10: 'none', minor10to20: 'none', transferAbroad: 'no', destinationCountry: '', transferAffiliate: 'no',
      transferAffiliateSpec: '', transferMethod: '', protectionMeasure: '', exceptionArt28: '', riskLevel: 'ความเสี่ยงระดับต่ำ', dataTypes: [],
      storageMethods: [], accessRights: [], deletionMethod: '', useWithoutConsent: '', denialOfRights: '', status: 'Pending',
      orgMeasure: '', techMeasure: '', physicalMeasure: '', accessControl: '', userResponsibility: '', auditMeasure: ''
    });
  };

  const safeSplit = (str: string | undefined | null) => {
    if (!str || str === '-' || str === '[]') return [];
    return str.split(', ').filter(item => item.trim() !== '');
  };

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!initialData?.id) return;
      const token = localStorage.getItem("access_token");
      const headers = { "Authorization": `Bearer ${token}` };

      try {
        const resTransfer = await fetch(`http://localhost:3340/transfers/${initialData.id}`, { headers });
        let transferData = null;
        if (resTransfer.ok) {
          const tJson = await resTransfer.json();
          transferData = tJson.data || tJson;
        }

        const resSecurity = await fetch(`http://localhost:3340/security/${initialData.id}`, { headers });
        let securityData: any[] = [];
        if (resSecurity.ok) {
          const sJson = await resSecurity.json();
          securityData = Array.isArray(sJson.data) ? sJson.data : (Array.isArray(sJson) ? sJson : []);
        }

        let secMap: Record<string, string> = {};
        securityData.forEach(sec => { secMap[sec.measure_type] = sec.description; });

        // ตรวจสอบว่า recipient_name มีข้อมูลระบุมาหรือไม่
        const rName = transferData?.recipient_name;
        const hasRecipient = rName && rName !== '-' && rName !== 'no';

        setFormData(prev => ({
          ...prev,
          destinationCountry: transferData?.country !== '-' ? (transferData?.country || '') : '',

          // --- แก้ไข: เช็คและดึงข้อมูลชื่อบริษัทในเครือ ---
          transferAffiliate: hasRecipient ? 'yes' : 'no',
          transferAffiliateSpec: hasRecipient && rName !== 'yes' ? rName : '',

          transferMethod: transferData?.transfer_method !== '-' ? (transferData?.transfer_method || '') : '',
          protectionMeasure: transferData?.protection_measure !== '-' ? (transferData?.protection_measure || '') : '',
          exceptionArt28: transferData?.protection_std !== '-' ? (transferData?.protection_std || '') : '',

          // --- แก้ไข: เปลี่ยน Key เป็นภาษาไทยให้ตรงกับที่เซฟลง DB ---
          orgMeasure: secMap['มาตรการเชิงองค์กร'] && secMap['มาตรการเชิงองค์กร'] !== '-' ? secMap['มาตรการเชิงองค์กร'] : '',
          techMeasure: secMap['มาตรการเชิงเทคนิค'] && secMap['มาตรการเชิงเทคนิค'] !== '-' ? secMap['มาตรการเชิงเทคนิค'] : '',
          physicalMeasure: secMap['มาตรการเชิงกายภาพ'] && secMap['มาตรการเชิงกายภาพ'] !== '-' ? secMap['มาตรการเชิงกายภาพ'] : '',
          accessControl: secMap['การควบคุมการเข้าถึง'] && secMap['การควบคุมการเข้าถึง'] !== '-' ? secMap['การควบคุมการเข้าถึง'] : '',
          userResponsibility: secMap['ความรับผิดชอบของผู้ใช้งาน'] && secMap['ความรับผิดชอบของผู้ใช้งาน'] !== '-' ? secMap['ความรับผิดชอบของผู้ใช้งาน'] : '',
          auditMeasure: secMap['มาตรการตรวจสอบ'] && secMap['มาตรการตรวจสอบ'] !== '-' ? secMap['มาตรการตรวจสอบ'] : ''
        }));
      } catch (err) { console.error("Failed to fetch related data:", err); }
    };

    if (initialData) {
      setFormData(prev => ({
        ...prev,
        activityName: initialData.activity_name || '',
        startDate: initialData.retention_start && initialData.retention_start !== '-' ? initialData.retention_start : '',
        retentionPeriod: initialData.retention_period && initialData.retention_period !== '-' ? initialData.retention_period : '',
        purpose: initialData.purpose || '',
        dataOwner: initialData.data_owner !== '-' ? initialData.data_owner : '',
        dataSubject: initialData.data_subject !== '-' ? initialData.data_subject : '',
        dataCategory: initialData.data_category !== 'Uncategorized' ? initialData.data_category : '',
        personalInfo: initialData.personal_info || '',
        dataType: initialData.is_sensitive ? 'sensitive' : 'general',
        dataSource: initialData.source === 'direct' ? 'direct' : 'other',
        legalBasis: initialData.legal_basis !== '-' ? initialData.legal_basis : '',
        collectionMethod: initialData.collection_method || 'digital',
        minorUnder10: initialData.is_under_10 ? 'have' : 'none',
        minor10to20: initialData.is_age_10_20 ? 'have' : 'none',
        transferAbroad: initialData.is_international ? 'yes' : 'no',
        dataTypes: safeSplit(initialData.storage_format),
        storageMethods: safeSplit(initialData.retention_method),
        accessRights: safeSplit(initialData.access_control),
        deletionMethod: initialData.disposal_method !== '-' ? initialData.disposal_method : '',
        useWithoutConsent: initialData.consent_exempt_basis !== '-' ? initialData.consent_exempt_basis : '',
        denialOfRights: initialData.right_rejection_reason !== '-' ? initialData.right_rejection_reason : '',
        status: initialData.status || 'Pending',
        riskLevel: initialData.risk_level || 'ความเสี่ยงระดับต่ำ',
      }));
      fetchRelatedData();
    }
  }, [initialData]);

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

  const handleDelete = async () => {
    if (!initialData || !initialData.id) return;
    const confirmDelete = window.confirm("คุณต้องการลบข้อมูลกิจกรรมนี้ใช่หรือไม่?");
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:3340/ropa-records/${initialData.id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) { alert("ลบข้อมูลเรียบร้อยแล้ว"); if (onSuccess) onSuccess(); }
    } catch (error) { alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"); } finally { setIsDeleting(false); }
  };

  const handleSaveData = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const isEditing = !!initialData;
      const cleanStartDate = (formData.startDate && formData.startDate !== '-') ? formData.startDate : '-';

      // 1. เตรียม Payload หลัก
      const ropaPayload = {
        activity_name: formData.activityName || '-',
        purpose: formData.purpose || '-',
        data_owner: formData.dataOwner || '-',
        data_subject: formData.dataSubject || '-',
        data_category: formData.dataCategory || 'Uncategorized',
        is_sensitive: formData.dataType === 'sensitive',
        personal_info: formData.personalInfo || '-',
        collection_method: formData.collectionMethod || '-',
        source: formData.dataSource === 'other' && formData.dataSourceOtherSpec ? formData.dataSourceOtherSpec : formData.dataSource,
        legal_basis: formData.legalBasis || '-',
        is_under_10: formData.minorUnder10 === 'have',
        is_age_10_20: formData.minor10to20 === 'have',
        is_international: formData.transferAbroad === 'yes',
        storage_format: formData.dataTypes.length > 0 ? formData.dataTypes.join(', ') : '-',
        retention_method: formData.storageMethods.length > 0 ? formData.storageMethods.join(', ') : '-',
        retention_start: cleanStartDate,
        retention_period: formData.retentionPeriod || '-',
        access_control: formData.accessRights.length > 0 ? formData.accessRights.join(', ') : '-',
        disposal_method: formData.deletionMethod || '-',
        consent_exempt_basis: formData.useWithoutConsent || '-',
        right_rejection_reason: formData.denialOfRights || '-',
        risk_level: formData.riskLevel,
        status: (() => {
          if (cleanStartDate && cleanStartDate !== '-' && formData.retentionPeriod && formData.retentionPeriod !== '-') {
            const start = new Date(cleanStartDate);
            if (!isNaN(start.getTime())) {
              // Parse period: supports "3 ปี", "6 เดือน", bare numbers (→ years)
              const s = formData.retentionPeriod.trim().toLowerCase();
              const numMatch = s.match(/^([\d.]+)/);
              if (numMatch) {
                const num = parseFloat(numMatch[1]);
                if (!isNaN(num)) {
                  const isMonth = s.includes('เดือน') || s.includes('month') || s.includes('mo');
                  const isYear  = s.includes('ปี')    || s.includes('year')  || s.includes('yr');
                  const months  = isMonth ? num : (isYear ? num * 12 : num * 12);
                  const endDate = new Date(start);
                  endDate.setMonth(endDate.getMonth() + months);
                  endDate.setHours(23, 59, 59, 999);
                  if (endDate < new Date()) return 'Expired';
                }
              }
            }
          }
          return 'Pending';
        })(),
      };

      // 2. บันทึก RoPA
      const ropaUrl = isEditing
        ? `http://localhost:3340/ropa-records/${initialData.id}`
        : `http://localhost:3340/ropa-records`;

      const ropaRes = await fetch(ropaUrl, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ropaPayload)
      });

      if (!ropaRes.ok) {
        const err = await ropaRes.json();
        throw new Error(err.detail || "บันทึกข้อมูลหลักไม่สำเร็จ");
      }

      const ropaResponseData = await ropaRes.json();
      const targetRopaId = isEditing ? initialData.id : (ropaResponseData.id || ropaResponseData.data?.id);

      const securityMeasures = [
        { type: "มาตรการเชิงองค์กร", desc: formData.orgMeasure },
        { type: "มาตรการเชิงเทคนิค", desc: formData.techMeasure },
        { type: "มาตรการเชิงกายภาพ", desc: formData.physicalMeasure },
        { type: "การควบคุมการเข้าถึง", desc: formData.accessControl },
        { type: "ความรับผิดชอบของผู้ใช้งาน", desc: formData.userResponsibility },
        { type: "มาตรการตรวจสอบ", desc: formData.auditMeasure },
      ].filter(m => m.desc && m.desc.trim() !== '' && m.desc !== '-');

      // ยิง API Security ทั้งหมดพร้อมกัน
      await Promise.all(securityMeasures.map(measure =>
        fetch(`http://localhost:3340/security`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ropa_id: targetRopaId,
            measure_type: measure.type,
            description: measure.desc
          })
        })
      ));

      if (formData.transferAbroad === 'yes') {
        const transferPayload = {
          ropa_id: targetRopaId,
          country: formData.destinationCountry || '-',
          recipient_name: formData.transferAffiliate === 'yes' ? (formData.transferAffiliateSpec || 'yes') : 'no',
          
          transfer_method: formData.transferMethod || '-',
          protection_std: formData.exceptionArt28 || '-',
          protection_measure: formData.protectionMeasure || '-'
        };

        const checkTransfer = await fetch(`http://localhost:3340/transfers/${targetRopaId}`, { headers });
        if (checkTransfer.ok) {
          const existing = await checkTransfer.json();
          const tId = existing.id || existing.data?.id;
          await fetch(`http://localhost:3340/transfers/${tId}`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(transferPayload)
          });
        } else {
          await fetch(`http://localhost:3340/transfers`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(transferPayload)
          });
        }
      }

      alert(isEditing ? "อัปเดตข้อมูลสำเร็จ!" : "บันทึกข้อมูลสำเร็จ!");
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error("Save Error:", error);
      alert(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <button
        onClick={onCancel}
        className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all z-50"
      >
        <span className="text-2xl">×</span>
      </button>
      <div className="bg-[#F4F8FB] border border-slate-300 rounded-xl p-8 w-full h-full flex flex-col overflow-auto custom-scrollbar">
        <h2 className="text-2xl font-bold text-[#1E2A5E] mb-2">{initialData ? 'แก้ไขกิจกรรมการประมวลผล (ROPA)' : 'บันทึกรายการกิจกรรมการประมวลผล'}</h2>

        <div className="flex flex-col gap-10 flex-1">
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5"><label className="text-[#1E2A5E] font-medium text-[14px]">ชื่อกิจกรรม</label><input type="text" name="activityName" value={formData.activityName} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] text-slate-800" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[#1E2A5E] font-medium text-[14px]">วันที่เริ่มกิจกรรม</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] text-slate-800" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[#1E2A5E] font-medium text-[14px]">ระยะเวลาการเก็บรักษา</label><input type="text" name="retentionPeriod" value={formData.retentionPeriod} onChange={handleChange} placeholder="เช่น 5 ปี, 10 ปี" className="p-2 border border-slate-300 rounded-md text-[14px] text-slate-800" /></div>
            </div>

            <div className="flex flex-col gap-1.5"><label className="text-[#1E2A5E] font-medium text-[14px]">วัตถุประสงค์ของการประมวลผล</label><textarea name="purpose" value={formData.purpose} onChange={handleChange} rows={3} className="p-3 border border-slate-300 rounded-md text-[14px] resize-none text-slate-800" /></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5"><label className="text-[#1E2A5E] font-medium text-[14px]">เจ้าของข้อมูลส่วนบุคคล</label><input type="text" name="dataSubject" value={formData.dataSubject} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] text-slate-800" /></div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">หมวดหมู่ข้อมูล</label>
                <div className="relative group">
                  <select name="dataCategory" value={formData.dataCategory} onChange={handleChange} className="w-full p-2.5 px-4 border border-slate-300 bg-white rounded-md text-[14px] appearance-none pr-10 text-slate-800">
                    <option value="">Select ...</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ประเภทของข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <CustomRadio name="dataType" value="general" checked={formData.dataType === 'general'} onChange={handleChange} />
                  <span className="text-[#1E2A5E] text-[14px]">ข้อมูลทั่วไป</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <CustomRadio name="dataType" value="sensitive" checked={formData.dataType === 'sensitive'} onChange={handleChange} />
                  <span className="text-[#1E2A5E] text-[14px]">ข้อมูลอ่อนไหว</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5"><label className="text-[#1E2A5E] font-medium text-[14px]">ข้อมูลส่วนบุคคลที่จัดเก็บ</label><textarea name="personalInfo" value={formData.personalInfo} onChange={handleChange} rows={2} className="p-3 border border-slate-300 rounded-md text-[14px] resize-none text-slate-800" placeholder='โปรดระบุ เช่น ชื่อ นามสกุล ที่อยู่ เป็นต้น....' /></div>
          </section>

          <hr className="border-slate-300" />

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">แหล่งที่ได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <CustomRadio name="dataSource" value="direct" checked={formData.dataSource === 'direct'} onChange={handleChange} />
                  <span className="text-[#1E2A5E] text-[14px]">จากเจ้าของข้อมูลส่วนบุคคลโดยตรง</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <CustomRadio name="dataSource" value="other" checked={formData.dataSource === 'other'} onChange={handleChange} />
                    <span className="text-[#1E2A5E] text-[14px] ">จากแหล่งอื่น :</span>
                  </label>
                  <input type="text" name="dataSourceOtherSpec" value={formData.dataSourceOtherSpec} onChange={handleChange} disabled={formData.dataSource !== 'other'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 outline-none text-slate-800" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5"><label className="text-[#1E2A5E] font-medium text-[14px]">ฐานในการประมวลผล</label><textarea name="legalBasis" value={formData.legalBasis} onChange={handleChange} rows={2} className="p-3 border border-slate-300 rounded-md text-[14px] resize-none text-slate-800" /></div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <CustomRadio name="collectionMethod" value="digital" checked={formData.collectionMethod === 'digital'} onChange={handleChange} />
                    <span className="text-[#1E2A5E] text-[14px]">รูปแบบดิจิทัล / ข้อมูลอิเล็กทรอนิกส์ :</span>
                  </label>
                  <input type="text" name="digitalSpec" value={formData.digitalSpec} onChange={handleChange} disabled={formData.collectionMethod !== 'digital'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 text-slate-800" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <CustomRadio name="collectionMethod" value="paper" checked={formData.collectionMethod === 'paper'} onChange={handleChange} />
                    <span className="text-[#1E2A5E] text-[14px]">รูปแบบเอกสาร :</span>
                  </label>
                  <input type="text" name="paperSpec" value={formData.paperSpec} onChange={handleChange} disabled={formData.collectionMethod !== 'paper'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 text-slate-800" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การขอความยินยอมของผู้เยาว์</label>
              <div className="grid grid-cols-[120px_1fr] gap-y-4 pl-4 items-start">
                <span className="text-[#1E2A5E] text-[14px] pt-0.5">อายุไม่เกิน 10 ปี :</span>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit"><CustomRadio name="minorUnder10" value="have" checked={formData.minorUnder10 === 'have'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group w-fit"><CustomRadio name="minorUnder10" value="none" checked={formData.minorUnder10 === 'none'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
                </div>
                <span className="text-[#1E2A5E] text-[14px] pt-0.5">อายุ 10 - 20 ปี :</span>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit"><CustomRadio name="minor10to20" value="have" checked={formData.minor10to20 === 'have'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group w-fit"><CustomRadio name="minor10to20" value="none" checked={formData.minor10to20 === 'none'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-300" />

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ</label>
              <div className="flex flex-col gap-4 pl-4">
                <label className="flex items-center gap-3 cursor-pointer group w-fit"><CustomRadio name="transferAbroad" value="yes" checked={formData.transferAbroad === 'yes'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
                {formData.transferAbroad === 'yes' && (
                  <div className="pl-8 flex flex-col gap-4 border-l-2 border-[#8B93C5] ml-2">
                    <div className="flex items-center gap-3"><span className="text-[14px] text-[#1E2A5E] w-[140px]">ประเทศปลายทาง :</span><input type="text" name="destinationCountry" value={formData.destinationCountry} onChange={handleChange} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] text-slate-800" placeholder='โปรดระบุ....' /></div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[14px] text-[#1E2A5E]">การโอนข้อมูลในบริษัทในเครือ</span>
                      <div className="flex flex-col gap-2 pl-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-3 cursor-pointer group w-fit"><CustomRadio name="transferAffiliate" value="yes" checked={formData.transferAffiliate === 'yes'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px] ">ใช่ :</span></label>
                          <input type="text" name="transferAffiliateSpec"         
                            value={formData.transferAffiliateSpec} 
                            onChange={handleChange} disabled={formData.transferAffiliate !== 'yes'} className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[220px] disabled:bg-slate-100 text-slate-800" placeholder='โปรดระบุ....' />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group w-fit"><CustomRadio name="transferAffiliate" value="no" checked={formData.transferAffiliate === 'no'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ไม่ใช่</span></label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">วิธีการโอนย้าย :</span>
                      <input
                        type="text"
                        name="transferMethod"
                        value={formData.transferMethod}
                        onChange={handleChange}
                        className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] outline-none focus:border-[#8B93C5] text-slate-800"
                        placeholder='โปรดระบุ เช่น โอนทางอิเล็กทรอนิกส์'
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] shrink-0 whitespace-nowrap">
                        มาตรการคุ้มครองข้อมูลส่วนบุคคล :
                      </span>
                      <input
                        type="text"
                        name="protectionMeasure"
                        value={formData.protectionMeasure}
                        onChange={handleChange}
                        className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] outline-none focus:border-[#8B93C5] text-slate-800"
                        placeholder="โปรดระบุ...."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] text-[#1E2A5E]">
                          ข้อยกเว้นตามมาตรา 28
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-800 leading-relaxed">
                        <span className="text-red-500">*</span> (เช่น ปฏิบัติตามกฎหมาย ความยินยอม ปฏิบัติตามสัญญา ป้องกันอันตรายต่อชีวิต ประโยชน์สาธารณะที่สำคัญ)
                      </p>
                      <textarea
                        name="exceptionArt28"
                        value={formData.exceptionArt28}
                        onChange={handleChange}
                        rows={3}
                        className="p-3 border border-slate-300 rounded-md text-[14px] resize-none w-full max-w-[700px] outline-none focus:border-[#8B93C5] whitespace-pre-wrap text-slate-800"
                        placeholder="เช่น ฐานความยินยอม, ฐานปฏิบัติตามกฎหมาย"
                      />

                    </div>
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer group w-fit"><CustomRadio name="transferAbroad" value="no" checked={formData.transferAbroad === 'no'} onChange={handleChange} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ระดับความเสี่ยง</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <CustomRadio
                    name="riskLevel"
                    value="ความเสี่ยงระดับต่ำ"
                    checked={formData.riskLevel === 'ความเสี่ยงระดับต่ำ'}
                    onChange={handleChange}
                  />
                  <span className="text-[#1E2A5E] text-[14px]">ความเสี่ยงระดับต่ำ</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <CustomRadio
                    name="riskLevel"
                    value="ความเสี่ยงระดับกลาง"
                    checked={formData.riskLevel === 'ความเสี่ยงระดับกลาง'}
                    onChange={handleChange}
                  />
                  <span className="text-[#1E2A5E] text-[14px]">ความเสี่ยงระดับกลาง</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <CustomRadio
                    name="riskLevel"
                    value="ความเสี่ยงระดับสูง"
                    checked={formData.riskLevel === 'ความเสี่ยงระดับสูง'}
                    onChange={handleChange}
                  />
                  <span className="text-[#1E2A5E] text-[14px]">ความเสี่ยงระดับสูง</span>
                </label>
              </div>
            </div>
          </section>

          <hr className="border-slate-300" />

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
                    <input type="checkbox" checked={formData.storageMethods.includes(item)} onChange={() => handleCheckboxArray('storageMethods', item)} className="w-4 h-4 rounded-sm text-[#4A85E6]" />
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

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2"><label className="text-[#1E2A5E] font-medium text-[14px]">การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับการยกเว้นไม่ต้องขอความยินยอม</label><input type="text" name="useWithoutConsent" value={formData.useWithoutConsent} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] w-full text-slate-800" /></div>
            <div className="flex flex-col gap-2"><label className="text-[#1E2A5E] font-medium text-[14px]">การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล</label><input type="text" name="denialOfRights" value={formData.denialOfRights} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] w-full text-slate-800" /></div>
            <div className="flex flex-col gap-4 pl-4">
              {[{ label: 'มาตรการเชิงองค์กร', name: 'orgMeasure' }, { label: 'มาตรการเชิงเทคนิค', name: 'techMeasure' }, { label: 'มาตรการทางกายภาพ', name: 'physicalMeasure' }, { label: 'การควบคุมการเข้าถึงข้อมูล', name: 'accessControl' }, { label: 'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน', name: 'userResponsibility' }, { label: 'มาตรการตรวจสอบย้อนหลัง', name: 'auditMeasure' }].map(field => (
                <div key={field.name} className="flex flex-col gap-1.5"><span className="text-[#1E2A5E] text-[13px] ">{field.label}</span><input type="text" name={field.name} value={(formData as any)[field.name]} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] w-full max-w-[700px] text-slate-800" /></div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12 pt-6 border-t border-slate-300 pb-2">
          <div>
            {initialData && (
              <button onClick={handleDelete} disabled={isSubmitting || isDeleting} className="px-6 py-2.5 rounded-full border border-red-500 text-red-500 font-bold text-[14px] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex gap-8 items-center">
            <button onClick={handleClear} disabled={isSubmitting || isDeleting} className="group flex items-center gap-2 text-red-500 font-bold text-[14px]"><div className="flex items-center gap-1.5 border-b-2 border-red-500 pb-0.5"><span>Clear Data</span></div></button>
            <button onClick={handleSaveData} disabled={isSubmitting || isDeleting} className="px-10 py-2.5 rounded-full bg-[#6CA886] text-white font-bold text-[15px] hover:bg-[#5a9072] transition-all shadow-sm">{isSubmitting ? 'Saving...' : (initialData ? 'Update Data' : 'Save Data')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
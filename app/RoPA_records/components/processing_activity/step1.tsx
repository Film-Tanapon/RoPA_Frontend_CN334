"use client";
import React, { useState, useEffect } from 'react';

interface CombinedFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  initialData?: any; // เพิ่ม initialData เพื่อแยกว่าเป็นการสร้างใหม่หรือแก้ไข
}

export default function RopaCombinedForm({ onCancel, onSuccess, initialData }: CombinedFormProps) {
  const [formData, setFormData] = useState({
    activityName: '',       
    startDate: '',     
    retentionPeriod: '',    
    purpose: '',             
    dataOwner: '',          
    dataSubject: '',        
    dataCategory: '',       
    dataType: 'general',     
    personalDataCollected: '',
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
    transferMethod: '',
    protectionMeasure: '',
    exceptionArt28: '',
    riskLevel: 'low',       
    dataTypes: [] as string[],
    storageMethods: [] as string[],
    accessRights: [] as string[],
    deletionMethod: '',   
    useWithoutConsent: '',
    denialOfRights: '',
    orgMeasure: '',
    techMeasure: '',
    physicalMeasure: '',
    accessControl: '',
    userResponsibility: '',
    auditMeasure: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ป้องกัน Error ตอน split() หากข้อมูลเก่ามีค่าเป็น null, undefined หรือ '-'
  const safeSplit = (str: string | undefined | null) => {
    if (!str || str === '-' || str === '[]') return [];
    return str.split(', ').filter(item => item.trim() !== '');
  };

  // ดึงข้อมูล Transfer และ Security หากเป็นการแก้ไข
  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!initialData?.id) return;
      const token = localStorage.getItem("access_token");
      const headers = { "Authorization": `Bearer ${token}` };

      try {
        // ดึงข้อมูล Transfers
        const resTransfer = await fetch(`http://localhost:3340/transfers/${initialData.id}`, { headers });
        let transferData = null;
        if (resTransfer.ok) {
          const tJson = await resTransfer.json();
          transferData = tJson.data;
        }

        // ดึงข้อมูล Security
        const resSecurity = await fetch(`http://localhost:3340/security/${initialData.id}`, { headers });
        let securityData = null;
        if (resSecurity.ok) {
          const sJson = await resSecurity.json();
          securityData = sJson.data;
        }

        setFormData(prev => ({
          ...prev,
          // ข้อมูล Transfers
          destinationCountry: transferData?.destination_country !== '-' ? (transferData?.destination_country || '') : '',
          transferAffiliate: transferData?.transfer_affiliate === 'yes' ? 'yes' : 'no',
          transferMethod: transferData?.transfer_method !== '-' ? (transferData?.transfer_method || '') : '',
          protectionMeasure: transferData?.protection_measure !== '-' ? (transferData?.protection_measure || '') : '',
          exceptionArt28: transferData?.exception_art_28 !== '-' ? (transferData?.exception_art_28 || '') : '',
          
          // ข้อมูล Security
          orgMeasure: securityData?.org_measure !== '-' ? (securityData?.org_measure || '') : '',
          techMeasure: securityData?.tech_measure !== '-' ? (securityData?.tech_measure || '') : '',
          physicalMeasure: securityData?.physical_measure !== '-' ? (securityData?.physical_measure || '') : '',
          accessControl: securityData?.access_control !== '-' ? (securityData?.access_control || '') : '',
          userResponsibility: securityData?.user_responsibility !== '-' ? (securityData?.user_responsibility || '') : '',
          auditMeasure: securityData?.audit_measure !== '-' ? (securityData?.audit_measure || '') : ''
        }));
      } catch (err) {
        console.error("Failed to fetch related data:", err);
      }
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
        riskLevel: initialData.risk_level || 'low',
      }));

      // เรียกฟังก์ชันดึงตารางลูก
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
      return {
        ...prev,
        [field]: array.includes(value) ? array.filter(item => item !== value) : [...array, value]
      };
    });
  };

  const handleDelete = async () => {
    if (!initialData || !initialData.id) return;
    
    const confirmDelete = window.confirm("คุณต้องการลบข้อมูลกิจกรรมนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("access_token");
      // แก้ไข Endpoint ให้เป็น /ropa-record/{id} ไม่มี s
      const res = await fetch(`http://localhost:3340/ropa-records/${initialData.id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}` 
        }
      });

      if (res.ok) {
        alert("ลบข้อมูลเรียบร้อยแล้ว");
        if (onSuccess) onSuccess();
      } else if (res.status === 401) {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      } else {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsDeleting(false);
    }
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

      // 1. ================= เตรียมข้อมูล ROPA =================
      const ropaPayload = {
        activity_name: formData.activityName || '-',
        purpose: formData.purpose || '-',
        data_owner: formData.dataOwner || '-',
        data_subject: formData.dataSubject || '-',
        data_category: formData.dataCategory || 'Uncategorized',
        is_sensitive: formData.dataType === 'sensitive',
        collection_method: formData.collectionMethod || '-',
        source: formData.dataSource === 'other' && formData.dataSourceOtherSpec ? formData.dataSourceOtherSpec : formData.dataSource,
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
        risk_level: formData.riskLevel || 'low',
        status: 'Active',
        create_by: 1 
      };

      const ropaUrl = isEditing 
        ? `http://localhost:3340/ropa-records/${initialData.id}` 
        : `http://localhost:3340/ropa-records`;
      
      const ropaRes = await fetch(ropaUrl, {
        method: isEditing ? "PUT" : "POST",
        headers,
        body: JSON.stringify(ropaPayload)
      });

      if (ropaRes.status === 401) {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        setIsSubmitting(false);
        return;
      }
      if (!ropaRes.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึก ROPA");

      const ropaResponseData = await ropaRes.json();
      // ดึง ID ของ ROPA มาใช้ต่อ ไม่ว่าจะเป็นการสร้างใหม่หรืออัปเดต
      const targetRopaId = isEditing ? initialData.id : ropaResponseData.data.id;

      // 2. ================= จัดการ Transfers =================
      if (formData.transferAbroad === 'yes') {
        const transferPayload = {
          ropa_id: targetRopaId,
          destination_country: formData.destinationCountry || '-',
          transfer_affiliate: formData.transferAffiliate,
          transfer_method: formData.transferMethod || '-',
          protection_measure: formData.protectionMeasure || '-',
          exception_art_28: formData.exceptionArt28 || '-'
        };

        // เช็คว่ามีข้อมูล Transfer เดิมอยู่หรือไม่
        const checkTransferRes = await fetch(`http://localhost:3340/transfers/${targetRopaId}`, { headers });
        if (checkTransferRes.ok) {
          const existingTransfer = await checkTransferRes.json();
          await fetch(`http://localhost:3340/transfers/${existingTransfer.data.id}`, {
            method: "PUT", headers, body: JSON.stringify(transferPayload)
          });
        } else {
          await fetch(`http://localhost:3340/transfers`, {
            method: "POST", headers, body: JSON.stringify(transferPayload)
          });
        }
      }

      // 3. ================= จัดการ Security Measures =================
      const securityPayload = {
        ropa_id: targetRopaId,
        org_measure: formData.orgMeasure || '-',
        tech_measure: formData.techMeasure || '-',
        physical_measure: formData.physicalMeasure || '-',
        access_control: formData.accessControl || '-',
        user_responsibility: formData.userResponsibility || '-',
        audit_measure: formData.auditMeasure || '-'
      };

      // เช็คว่ามีข้อมูล Security เดิมอยู่หรือไม่
      const checkSecurityRes = await fetch(`http://localhost:3340/security/${targetRopaId}`, { headers });
      if (checkSecurityRes.ok) {
        const existingSecurity = await checkSecurityRes.json();
        await fetch(`http://localhost:3340/security/${existingSecurity.data.id}`, {
          method: "PUT", headers, body: JSON.stringify(securityPayload)
        });
      } else {
        await fetch(`http://localhost:3340/security`, {
          method: "POST", headers, body: JSON.stringify(securityPayload)
        });
      }

      alert(isEditing ? "อัปเดตข้อมูลสำเร็จ!" : "บันทึกข้อมูลสำเร็จ!");
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error saving data:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ หรือเกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-[#F4F8FB] border border-slate-300 rounded-xl p-8 w-full h-full flex flex-col overflow-auto custom-scrollbar">

        <h2 className="text-2xl font-bold text-[#1E2A5E] mb-2">
          {initialData ? 'แก้ไขกิจกรรมการประมวลผล (ROPA)' : 'บันทึกรายการกิจกรรมการประมวลผล (ROPA)'}
        </h2>
        <p className="text-slate-500 text-[14px] mb-8">กรุณากรอกข้อมูลกิจกรรมการประมวลผลให้ครบถ้วนทุกส่วน</p>

        <div className="flex flex-col gap-10 flex-1">
          {/* ==================== ส่วนที่ 1: ข้อมูลพื้นฐานกิจกรรม ==================== */}
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ชื่อกิจกรรม</label>
                <input type="text" name="activityName" value={formData.activityName} onChange={handleChange} className="p-2 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors rounded-md text-[14px] text-slate-800" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">วันที่เริ่มกิจกรรม</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="p-2 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors text-slate-600 rounded-md text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ระยะเวลาการเก็บรักษาข้อมูล</label>
                <input type="text" name="retentionPeriod" value={formData.retentionPeriod} onChange={handleChange} placeholder="เช่น 5 ปี, 10 ปี" className="p-2 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors placeholder:text-slate-400 rounded-md text-[14px] text-slate-800" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วัตถุประสงค์ของการประมวลผล</label>
              <textarea name="purpose" value={formData.purpose} onChange={handleChange} rows={3} className="p-3 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors resize-none rounded-md text-[14px] text-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ผู้ควบคุม/เจ้าของข้อมูล (Data Owner)</label>
                <input type="text" name="dataOwner" value={formData.dataOwner} onChange={handleChange} placeholder="เช่น ฝ่ายทรัพยากรบุคคล..." className="p-2 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors rounded-md text-[14px] text-slate-800" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">เจ้าของข้อมูลส่วนบุคคล (Data Subject)</label>
                <input type="text" name="dataSubject" value={formData.dataSubject} onChange={handleChange} className="p-2 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors rounded-md text-[14px] text-slate-800" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">หมวดหมู่ข้อมูล</label>
                <select name="dataCategory" value={formData.dataCategory} onChange={handleChange} className="p-2 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors text-slate-800 rounded-md text-[14px] ">
                  <option value="">Select...</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Security">Security</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ประเภทของข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="dataType" value="general" checked={formData.dataType === 'general'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px] ">ข้อมูลทั่วไป</span></label>
                <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="dataType" value="sensitive" checked={formData.dataType === 'sensitive'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">ข้อมูลอ่อนไหว</span></label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ข้อมูลส่วนบุคคลที่จัดเก็บ</label>
              <textarea name="personalDataCollected" value={formData.personalDataCollected} onChange={handleChange} rows={2} placeholder="โปรดระบุ เช่น ชื่อ นามสกุล ที่อยู่ เป็นต้น...." className="p-3 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors resize-none placeholder:text-slate-400 rounded-md text-[14px] text-slate-800" />
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ==================== ส่วนที่ 2: แหล่งที่มาและฐานการประมวลผล ==================== */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">แหล่งที่ได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="dataSource" value="direct" checked={formData.dataSource === 'direct'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">จากเจ้าของข้อมูลส่วนบุคคลโดยตรง</span></label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="dataSource" value="other" checked={formData.dataSource === 'other'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">จากแหล่งอื่น :</span></label>
                  <input type="text" name="dataSourceOtherSpec" value={formData.dataSourceOtherSpec} onChange={handleChange} disabled={formData.dataSource !== 'other'} placeholder="Please specific..." className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 outline-none focus:border-[#8B93C5]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ฐานในการประมวลผล</label>
              <textarea name="legalBasis" value={formData.legalBasis} onChange={handleChange} rows={2} placeholder="เช่น ฐานความยินยอม, ฐานปฏิบัติตามกฎหมาย" className="p-3 border border-slate-300 bg-white outline-none focus:border-[#8B93C5] transition-colors resize-none placeholder:text-slate-400 rounded-md text-[14px] text-slate-800" />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-3 pl-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="collectionMethod" value="digital" checked={formData.collectionMethod === 'digital'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">รูปแบบดิจิทัล / อิเล็กทรอนิกส์ :</span></label>
                  <input type="text" name="digitalSpec" value={formData.digitalSpec} onChange={handleChange} disabled={formData.collectionMethod !== 'digital'} placeholder="เช่น อีเมล..." className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 outline-none focus:border-[#8B93C5] text-slate-800" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="collectionMethod" value="paper" checked={formData.collectionMethod === 'paper'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">รูปแบบเอกสาร :</span></label>
                  <input type="text" name="paperSpec" value={formData.paperSpec} onChange={handleChange} disabled={formData.collectionMethod !== 'paper'} placeholder="เช่น ใบลงทะเบียน..." className="p-1 px-3 border border-slate-300 rounded-md text-[13px] w-[250px] disabled:bg-slate-100 outline-none focus:border-[#8B93C5] text-slate-800" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การขอความยินยอมของผู้เยาว์</label>
              <div className="grid grid-cols-[120px_1fr] gap-y-4 pl-4 items-start">

                <span className="text-[#1E2A5E] text-[14px] pt-0.5">อายุไม่เกิน 10 ปี :</span>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="minorUnder10" value="have" checked={formData.minorUnder10 === 'have'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" />
                    <span className="text-[14px] text-[#1E2A5E]">มี</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="minorUnder10" value="none" checked={formData.minorUnder10 === 'none'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" />
                    <span className="text-[14px] text-[#1E2A5E]">ไม่มี</span>
                  </label>
                </div>

                <span className="text-[#1E2A5E] text-[14px] pt-0.5">อายุ 10 - 20 ปี :</span>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="minor10to20" value="have" checked={formData.minor10to20 === 'have'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" />
                    <span className="text-[14px] text-[#1E2A5E]">มี</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="minor10to20" value="none" checked={formData.minor10to20 === 'none'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" />
                    <span className="text-[14px] text-[#1E2A5E]">ไม่มี</span>
                  </label>
                </div>

              </div>
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ==================== ส่วนที่ 3: การโอนข้อมูลและความเสี่ยง ==================== */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ</label>
              <div className="flex flex-col gap-4 pl-4">
                <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="transferAbroad" value="yes" checked={formData.transferAbroad === 'yes'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>

                {formData.transferAbroad === 'yes' && (
                  <div className="pl-8 flex flex-col gap-4 border-l-2 border-[#8B93C5] ml-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">ประเทศปลายทาง :</span>
                      <input type="text" name="destinationCountry" value={formData.destinationCountry} onChange={handleChange} placeholder="โปรดระบุ...." className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] outline-none focus:border-[#8B93C5]" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[14px] text-[#1E2A5E]">การโอนข้อมูลในบริษัทในเครือ</span>
                      <div className="flex flex-col gap-2 pl-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer w-[60px]"><input type="radio" name="transferAffiliate" value="yes" checked={formData.transferAffiliate === 'yes'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[14px]">ใช่ :</span></label>
                          <input type="text" disabled={formData.transferAffiliate !== 'yes'} placeholder="โปรดระบุ...." className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[220px] disabled:bg-slate-100 outline-none focus:border-[#8B93C5]" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer w-[60px]"><input type="radio" name="transferAffiliate" value="no" checked={formData.transferAffiliate === 'no'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[14px]">ไม่ใช่</span></label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">วิธีการโอนย้ายข้อมูล :</span>
                      <input type="text" name="transferMethod" value={formData.transferMethod} onChange={handleChange} placeholder="เช่น โอนทางอิเล็กทรอนิกส์" className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] outline-none focus:border-[#8B93C5]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[280px]">มาตรการคุ้มครองข้อมูลของประเทศปลายทาง :</span>
                      <input type="text" name="protectionMeasure" value={formData.protectionMeasure} onChange={handleChange} placeholder="โปรดระบุ...." className="p-1 px-3 border border-slate-300 rounded-md text-[13px] flex-1 max-w-[300px] outline-none focus:border-[#8B93C5]" />
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[14px] text-[#1E2A5E]">ข้อยกเว้นตามมาตรา 28 <span className="text-red-500 text-[12px]">*</span></span>
                      <textarea name="exceptionArt28" value={formData.exceptionArt28} onChange={handleChange} rows={2} className="p-3 border border-slate-300 rounded-md text-[14px] resize-none max-w-[600px] outline-none focus:border-[#8B93C5]" />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="transferAbroad" value="no" checked={formData.transferAbroad === 'no'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ระดับความเสี่ยง</label>
              <div className="flex gap-6 pl-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="riskLevel" value="low" checked={formData.riskLevel === 'low'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">ระดับต่ำ</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="riskLevel" value="medium" checked={formData.riskLevel === 'medium'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">ระดับกลาง</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="riskLevel" value="high" checked={formData.riskLevel === 'high'} onChange={handleChange} className="w-4 h-4 text-[#4A85E6]" /><span className="text-[#1E2A5E] text-[14px]">ระดับสูง</span></label>
              </div>
            </div>
          </section>

          <hr className="border-slate-300" />

          {/* ==================== ส่วนที่ 4: นโยบายและสิทธิการเข้าถึง ==================== */}
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

          {/* ==================== ส่วนที่ 5: มาตรการรักษาความปลอดภัย ==================== */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับการยกเว้นไม่ต้องขอความยินยอม <span className="text-red-500 text-[12px]">*</span></label>
              <input type="text" name="useWithoutConsent" value={formData.useWithoutConsent} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] outline-none focus:border-[#8B93C5] w-full text-slate-800" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล <span className="text-red-500 text-[12px]">*</span></label>
              <input type="text" name="denialOfRights" value={formData.denialOfRights} onChange={handleChange} className="p-2 border border-slate-300 rounded-md text-[14px] outline-none focus:border-[#8B93C5] w-full text-slate-800" />
            </div>

            <div className="flex flex-col gap-4 pl-4"> 
              {[
                { label: 'มาตรการเชิงองค์กร', name: 'orgMeasure' },
                { label: 'มาตรการเชิงเทคนิค', name: 'techMeasure' },
                { label: 'มาตรการทางกายภาพ', name: 'physicalMeasure' },
                { label: 'การควบคุมการเข้าถึงข้อมูล', name: 'accessControl' },
                { label: 'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน', name: 'userResponsibility' },
                { label: 'มาตรการตรวจสอบย้อนหลัง', name: 'auditMeasure' }
              ].map(field => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <span className="text-[#1E2A5E] text-[13px]">{field.label}</span>
                  <input
                    type="text"
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    className="p-2 border border-slate-300 rounded-md text-[14px] outline-none focus:border-[#8B93C5] w-full max-w-[700px] text-slate-800" 
                  />
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ==================== Action Buttons ==================== */}
        <div className="flex justify-between mt-12 pt-6 border-t border-slate-300 sticky bottom-0 bg-[#F4F8FB] pb-2">
          
          <div>
            {initialData && (
              <button
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="px-6 py-2.5 rounded-md border border-red-500 text-red-500 font-bold text-[14px] hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              disabled={isSubmitting || isDeleting}
              className="px-6 py-2.5 rounded-md border border-slate-300 bg-white text-[#1E2A5E] font-bold text-[14px] hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveData}
              disabled={isSubmitting || isDeleting}
              className="px-8 py-2.5 rounded-md bg-[#6CA886] text-white font-bold text-[14px] hover:bg-[#5a9072] transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update Data' : 'Save Data')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
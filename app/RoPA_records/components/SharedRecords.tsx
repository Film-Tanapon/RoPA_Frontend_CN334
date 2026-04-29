"use client";
import React, { useState, useEffect } from 'react';

interface SharedRecordsProps {
  setActiveMenu?: (menu: string) => void;
}

const ReadOnlyRadio = ({ checked }: { checked: boolean }) => (
  <div className="relative flex items-center justify-center">
    <div className="w-4 h-4 border border-slate-400 rounded-full bg-white flex items-center justify-center">
      {checked && <div className="w-2 h-2 rounded-full bg-[#4A85E6]" />}
    </div>
  </div>
);

const ReadOnlyCheckbox = ({ checked }: { checked: boolean }) => (
  <div className={`w-4 h-4 rounded-sm border ${checked ? 'bg-[#4A85E6] border-[#4A85E6]' : 'border-slate-400 bg-white'} flex items-center justify-center`}>
    {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
  </div>
);

export default function SharedRecords({ setActiveMenu }: SharedRecordsProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [reviewedRecords, setReviewedRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);


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

  const safeSplit = (str: string | undefined | null) => {
    if (!str || str === '-' || str === '[]') return [];
    return str.split(', ').filter(item => item.trim() !== '');
  };

  useEffect(() => {
    if (step !== 1) return;
    setIsLoading(true);
    fetch('http://localhost:3340/ropa-records', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const records = Array.isArray(data) ? data : (data.data || []);
        setReviewedRecords(records.filter((r: any) => r.status?.toLowerCase() === 'reviewed'));
      })
      .catch(err => console.error('Failed to fetch records:', err))
      .finally(() => setIsLoading(false));
  }, [step]);

  const loadRecord = async (record: any) => {
    setSelectedRecord(record);

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
      dataTypes: safeSplit(record.storage_format),
      storageMethods: safeSplit(record.retention_method),
      accessRights: safeSplit(record.access_control),
      deletionMethod: record.disposal_method !== '-' ? (record.disposal_method || '') : '',
      useWithoutConsent: record.consent_exempt_basis !== '-' ? (record.consent_exempt_basis || '') : '',
      denialOfRights: record.right_rejection_reason !== '-' ? (record.right_rejection_reason || '') : '',
      riskLevel: record.risk_level || 'ความเสี่ยงระดับต่ำ',
    }));

    try {
      const [resTransfer, resSecurity] = await Promise.all([
        fetch(`http://localhost:3340/transfers/${record.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`http://localhost:3340/security/${record.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
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

  const handleConfirm = () => {
    if (setActiveMenu) {
      setActiveMenu('RoPA Records');
    } else {
      setStep(1);
    }
  };

  const inputCls = "p-2 border border-slate-200 rounded-md text-[14px] text-slate-700 bg-slate-50 pointer-events-none select-none";
  const textareaCls = "p-3 border border-slate-200 rounded-md text-[14px] resize-none text-slate-700 bg-slate-50 pointer-events-none select-none";

  if (step === 1) {
    return (
      <div className="flex flex-col h-full p-4 bg-[#F0F9FF]">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-slate-400 text-[15px]">กำลังโหลด...</span>
            </div>
          ) : reviewedRecords.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-slate-400 text-[15px]">ไม่มีรายการที่ผ่านการตรวจสอบแล้ว</span>
            </div>
          ) : reviewedRecords.map((item) => (
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

  return (
    <div className="h-full flex flex-col p-6 bg-[#F0F9FF]">
      <div className="bg-[#F4F8FB] border border-slate-300 rounded-xl p-8 w-full h-full flex flex-col overflow-auto relative">

        <button
          onClick={() => setStep(1)}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all z-50"
        >
          <span className="text-2xl">×</span>
        </button>

        <h2 className="text-2xl font-bold text-[#1E2A5E] mb-6">บันทึกรายการกิจกรรมการประมวลผล</h2>

        <div className="flex flex-col gap-10 flex-1">

          <section className="flex flex-col gap-5">
            <div className="flex gap-6 flex-wrap">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ชื่อกิจกรรม</label>
                <input readOnly value={formData.activityName} className={inputCls + ' w-full'} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                <label className="text-[#1E2A5E] font-medium text-[14px]">วันที่เริ่มกิจกรรม</label>
                <input readOnly value={formData.startDate} className={inputCls + ' w-full'} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ระยะเวลาการเก็บรักษาข้อมูล</label>
                <input readOnly value={formData.retentionPeriod} placeholder="เช่น 5 ปี, 10 ปี" className={inputCls + ' w-full'} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วัตถุประสงค์ของการประมวลผล</label>
              <textarea readOnly value={formData.purpose} rows={3} className={textareaCls + ' w-full'} />
            </div>

            <div className="flex gap-6 flex-wrap">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-[#1E2A5E] font-medium text-[14px]">เจ้าของข้อมูลส่วนบุคคล</label>
                <input readOnly value={formData.dataOwner} className={inputCls + ' w-full'} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-[#1E2A5E] font-medium text-[14px]">หมวดหมู่ข้อมูล</label>
                <input readOnly value={formData.dataCategory} className={inputCls + ' w-full'} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ประเภทของข้อมูล</label>
              <div className="flex flex-col gap-2 pl-4">
                {[['general', 'ข้อมูลทั่วไป'], ['sensitive', 'ข้อมูลอ่อนไหว']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-3 w-fit">
                    <ReadOnlyRadio checked={formData.dataType === val} />
                    <span className="text-[#1E2A5E] text-[14px]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ข้อมูลส่วนบุคคลที่จัดเก็บ</label>
              <textarea readOnly value={formData.personalInfo} rows={3} placeholder="โปรดระบุ เช่น ชื่อ นามสกุล ที่อยู่ เป็นต้น...." className={textareaCls + ' w-full'} />
            </div>
          </section>

          <hr className="border-slate-300" />

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">แหล่งที่ได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-2 pl-4">
                <label className="flex items-center gap-3 w-fit">
                  <ReadOnlyRadio checked={formData.dataSource === 'direct'} />
                  <span className="text-[#1E2A5E] text-[14px]">จากเจ้าของข้อมูลส่วนบุคคลโดยตรง</span>
                </label>
                <label className="flex items-center gap-3 w-fit">
                  <ReadOnlyRadio checked={formData.dataSource === 'other'} />
                  <span className="text-[#1E2A5E] text-[14px]">จากแหล่งอื่น :</span>
                  {formData.dataSource === 'other' && (
                    <input readOnly value={formData.dataSourceOtherSpec} className={inputCls + ' w-48'} placeholder="Please specific..." />
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ฐานในการประมวลผล</label>
              <textarea readOnly value={formData.legalBasis} rows={2} placeholder="เช่น ฐานความยินยอม, ฐานปฏิบัติตามกฎหมาย" className={textareaCls + ' w-full max-w-[700px]'} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-2 pl-4">
                <label className="flex items-center gap-3 w-fit">
                  <ReadOnlyRadio checked={formData.collectionMethod === 'digital'} />
                  <span className="text-[#1E2A5E] text-[14px]">รูปแบบดิจิทัล / ข้อมูลอิเล็กทรอนิกส์ :</span>
                  <input readOnly value={formData.digitalSpec} className={inputCls + ' w-40'} placeholder="เช่น อีเมล..." />
                </label>
                <label className="flex items-center gap-3 w-fit">
                  <ReadOnlyRadio checked={formData.collectionMethod === 'paper'} />
                  <span className="text-[#1E2A5E] text-[14px]">รูปแบบเอกสาร :</span>
                  <input readOnly value={formData.paperSpec} className={inputCls + ' w-40'} placeholder="เช่น เอกสารใบลงทะเบียน..." />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การขอความยินยอมของผู้เยาว์</label>
              <div className="grid grid-cols-1 gap-2 pl-4">
                <div className="flex items-center gap-6">
                  <span className="text-[#1E2A5E] text-[14px] w-32">อายุไม่เกิน 10 ปี :</span>
                  {[['have', 'มี'], ['none', 'ไม่มี']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 w-fit">
                      <ReadOnlyRadio checked={formData.minorUnder10 === val} />
                      <span className="text-[#1E2A5E] text-[14px]">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[#1E2A5E] text-[14px] w-32">อายุ 10 - 20 ปี :</span>
                  {[['have', 'มี'], ['none', 'ไม่มี']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 w-fit">
                      <ReadOnlyRadio checked={formData.minor10to20 === val} />
                      <span className="text-[#1E2A5E] text-[14px]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-300" />

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ</label>
              <div className="flex flex-col gap-3 pl-4">
                <label className="flex items-center gap-3 w-fit">
                  <ReadOnlyRadio checked={formData.transferAbroad === 'yes'} />
                  <span className="text-[#1E2A5E] text-[14px]">มี</span>
                </label>
                {formData.transferAbroad === 'yes' && (
                  <div className="ml-7 flex flex-col gap-3 border-l-2 border-slate-200 pl-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-32">ประเทศปลายทาง :</span>
                      <input readOnly value={formData.destinationCountry} className={inputCls + ' flex-1 max-w-[300px]'} placeholder="โปรดระบุ...." />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[14px] text-[#1E2A5E]">การโอนข้อมูลในบริษัทในเครือ</span>
                      <div className="flex flex-col gap-2 pl-4">
                        <label className="flex items-center gap-3 w-fit">
                          <ReadOnlyRadio checked={formData.transferAffiliate === 'yes'} />
                          <span className="text-[#1E2A5E] text-[14px]">ใช่ :</span>
                          <input readOnly value={formData.transferAffiliateSpec} className={inputCls + ' w-48'} placeholder="โปรดระบุ...." />
                        </label>
                        <label className="flex items-center gap-3 w-fit">
                          <ReadOnlyRadio checked={formData.transferAffiliate === 'no'} />
                          <span className="text-[#1E2A5E] text-[14px]">ไม่ใช่</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-32">วิธีการโอนย้าย :</span>
                      <input readOnly value={formData.transferMethod} className={inputCls + ' flex-1 max-w-[300px]'} placeholder="โปรดระบุ เช่น โอนทางอิเล็กทรอนิกส์" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] shrink-0">มาตรการคุ้มครองข้อมูล :</span>
                      <input readOnly value={formData.protectionMeasure} className={inputCls + ' flex-1 max-w-[300px]'} placeholder="โปรดระบุ...." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[14px] text-[#1E2A5E]">ข้อยกเว้นตามมาตรา 28</span>
                      <p className="text-[12px] text-slate-500"><span className="text-red-500">*</span> (เช่น ปฏิบัติตามกฎหมาย ความยินยอม ปฏิบัติตามสัญญา ป้องกันอันตรายต่อชีวิต)</p>
                      <textarea readOnly value={formData.exceptionArt28} rows={3} className={textareaCls + ' w-full max-w-[700px]'} placeholder="เช่น ฐานความยินยอม, ฐานปฏิบัติตามกฎหมาย" />
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-3 w-fit">
                  <ReadOnlyRadio checked={formData.transferAbroad === 'no'} />
                  <span className="text-[#1E2A5E] text-[14px]">ไม่มี</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ระดับความเสี่ยง</label>
              <div className="flex flex-col gap-3 pl-4">
                {['ความเสี่ยงระดับต่ำ', 'ความเสี่ยงระดับกลาง', 'ความเสี่ยงระดับสูง'].map(level => (
                  <label key={level} className="flex items-center gap-3 w-fit">
                    <ReadOnlyRadio checked={formData.riskLevel === level} />
                    <span className="text-[#1E2A5E] text-[14px]">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-slate-300" />


          <section className="flex flex-col gap-5">
            <h3 className="text-[#1E2A5E] font-bold text-[15px]">นโยบายการเก็บรักษาข้อมูลส่วนบุคคล</h3>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">ประเภทของข้อมูลที่จัดเก็บ</span>
              <div className="flex gap-6 pl-4">
                {['ข้อมูลอิเล็กทรอนิกส์', 'เอกสาร'].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <ReadOnlyCheckbox checked={formData.dataTypes.includes(item)} />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">วิธีการเก็บรักษาข้อมูล</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 pl-4">
                {['เซิร์ฟเวอร์ภายในองค์กร', 'พื้นที่เก็บข้อมูลบนคลาวด์', 'การเข้ารหัส', 'ผู้ให้บริการภายนอก', 'ใส่แฟ้มสำหรับเอกสาร'].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <ReadOnlyCheckbox checked={formData.storageMethods.includes(item)} />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล (แผนกที่เข้าถึงได้)</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 pl-4">
                {['ฝ่ายบริหาร', 'ฝ่ายเทคโนโลยีสารสนเทศ', 'ฝ่ายทรัพยากรบุคคล', 'ฝ่ายพัฒนาซอฟต์แวร์', 'ฝ่ายบัญชีและการเงิน', 'ฝ่ายลูกค้าสัมพันธ์ / บริการลูกค้า', 'ฝ่ายธุรการ', 'ฝ่ายกฎหมาย', 'ฝ่ายการตลาด', 'ฝ่ายจัดซื้อ'].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <ReadOnlyCheckbox checked={formData.accessRights.includes(item)} />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการลบหรือทำลายข้อมูลส่วนบุคคล</label>
              <textarea readOnly value={formData.deletionMethod} rows={2} placeholder="โปรดระบุ..." className={textareaCls + ' w-full'} />
            </div>
          </section>

          <hr className="border-slate-300" />

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับการยกเว้นไม่ต้องขอความยินยอม</label>
              <p className="text-[12px] text-slate-500"><span className="text-red-500">*</span> (ระบุให้สอดคล้องฐานในการประมวลผล)</p>
              <textarea readOnly value={formData.useWithoutConsent} rows={3} className={textareaCls + ' w-full'} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล</label>
              <p className="text-[12px] text-slate-500"><span className="text-red-500">*</span> (ลงข้อมูลเมื่อมีการปฏิเสธการใช้สิทธิ)</p>
              <input readOnly value={formData.denialOfRights} className={inputCls + ' w-full'} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[#1E2A5E] font-medium text-[14px] mb-2">คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย</span>
              <div className="flex flex-col gap-4 pl-4">
                {[
                  { label: 'มาตรการเชิงองค์กร', key: 'orgMeasure' },
                  { label: 'มาตรการเชิงเทคนิค', key: 'techMeasure' },
                  { label: 'มาตรการทางกายภาพ', key: 'physicalMeasure' },
                  { label: 'การควบคุมการเข้าถึงข้อมูล', key: 'accessControl' },
                  { label: 'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน', key: 'userResponsibility' },
                  { label: 'มาตรการตรวจสอบย้อนหลัง', key: 'auditMeasure' },
                ].map(field => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <span className="text-[#1E2A5E] text-[13px]">{field.label}</span>
                    <input readOnly value={(formData as any)[field.key]} className={inputCls + ' w-full max-w-[700px]'} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ─── Footer ─────────────────────────────────────────────── */}
        <div className="flex justify-end mt-12 pt-6 border-t border-slate-300 pb-2">
          <button
            onClick={handleConfirm}
            className="px-10 py-2.5 rounded-full bg-[#6CA886] text-white font-bold text-[15px] hover:bg-[#5a9072] transition-all shadow-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
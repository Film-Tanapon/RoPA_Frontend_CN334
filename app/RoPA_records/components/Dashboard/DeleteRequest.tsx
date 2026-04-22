"use client";
import React, { useState, useEffect } from 'react';

interface DeleteRequestProps {
  userRole: string;
}

// ========================================================
// Inline RoPA Form (adapted from step1.tsx)
// ========================================================
function RopaFormReadOnly({
  initialData,
  onCancel,
  onSendDelete,
  onDeleteConfirm,
  isSubmitting,
  mode, // 'dpo' | 'admin'
}: {
  initialData: any;
  onCancel: () => void;
  onSendDelete?: () => void;
  onDeleteConfirm?: () => void;
  isSubmitting: boolean;
  mode: 'dpo' | 'admin';
}) {
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
    orgMeasure: '',
    techMeasure: '',
    physicalMeasure: '',
    accessControl: '',
    userResponsibility: '',
    auditMeasure: '',
  });

  const safeSplit = (str: string | undefined | null) => {
    if (!str || str === '-' || str === '[]') return [];
    return str.split(', ').filter((item) => item.trim() !== '');
  };

  useEffect(() => {
    if (!initialData) return;

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    setFormData((prev) => ({
      ...prev,
      activityName: initialData.activity_name || '',
      startDate:
        initialData.retention_start && initialData.retention_start !== '-'
          ? initialData.retention_start
          : '',
      retentionPeriod:
        initialData.retention_period && initialData.retention_period !== '-'
          ? initialData.retention_period
          : '',
      purpose: initialData.purpose || '',
      dataOwner: initialData.data_owner !== '-' ? initialData.data_owner : '',
      dataSubject: initialData.data_subject !== '-' ? initialData.data_subject : '',
      dataCategory:
        initialData.data_category !== 'Uncategorized' ? initialData.data_category : '',
      personalInfo: initialData.personal_info || '',
      dataType: initialData.is_sensitive ? 'sensitive' : 'general',
      dataSource: initialData.source === 'direct' ? 'direct' : 'other',
      dataSourceOtherSpec: initialData.source !== 'direct' ? initialData.source : '',
      legalBasis: initialData.legal_basis !== '-' ? initialData.legal_basis : '',
      collectionMethod: initialData.collection_method || 'digital',
      minorUnder10: initialData.is_under_10 ? 'have' : 'none',
      minor10to20: initialData.is_age_10_20 ? 'have' : 'none',
      transferAbroad: initialData.is_international ? 'yes' : 'no',
      dataTypes: safeSplit(initialData.storage_format),
      storageMethods: safeSplit(initialData.retention_method),
      accessRights: safeSplit(initialData.access_control),
      deletionMethod: initialData.disposal_method !== '-' ? initialData.disposal_method : '',
      useWithoutConsent:
        initialData.consent_exempt_basis !== '-' ? initialData.consent_exempt_basis : '',
      denialOfRights:
        initialData.right_rejection_reason !== '-' ? initialData.right_rejection_reason : '',
      riskLevel: initialData.risk_level || 'ความเสี่ยงระดับต่ำ',
    }));

    // Fetch transfer & security data
    const fetchRelated = async () => {
      try {
        const resTransfer = await fetch(
          `http://localhost:3340/transfers/${initialData.id}`,
          { headers }
        );
        let transferData = null;
        if (resTransfer.ok) {
          const tJson = await resTransfer.json();
          transferData = tJson.data || tJson;
        }

        const resSecurity = await fetch(
          `http://localhost:3340/security/${initialData.id}`,
          { headers }
        );
        let securityData: any[] = [];
        if (resSecurity.ok) {
          const sJson = await resSecurity.json();
          securityData = Array.isArray(sJson.data)
            ? sJson.data
            : Array.isArray(sJson)
            ? sJson
            : [];
        }

        const secMap: Record<string, string> = {};
        securityData.forEach((sec) => {
          secMap[sec.measure_type] = sec.description;
        });

        const rName = transferData?.recipient_name;
        const hasRecipient = rName && rName !== '-' && rName !== 'no';

        setFormData((prev) => ({
          ...prev,
          destinationCountry:
            transferData?.country !== '-' ? transferData?.country || '' : '',
          transferAffiliate: hasRecipient ? 'yes' : 'no',
          transferAffiliateSpec:
            hasRecipient && rName !== 'yes' ? rName : '',
          transferMethod:
            transferData?.transfer_method !== '-'
              ? transferData?.transfer_method || ''
              : '',
          protectionMeasure:
            transferData?.protection_measure !== '-'
              ? transferData?.protection_measure || ''
              : '',
          exceptionArt28:
            transferData?.protection_std !== '-'
              ? transferData?.protection_std || ''
              : '',
          orgMeasure: secMap['มาตรการเชิงองค์กร'] || '',
          techMeasure: secMap['มาตรการเชิงเทคนิค'] || '',
          physicalMeasure: secMap['มาตรการเชิงกายภาพ'] || '',
          accessControl: secMap['การควบคุมการเข้าถึง'] || '',
          userResponsibility: secMap['ความรับผิดชอบของผู้ใช้งาน'] || '',
          auditMeasure: secMap['มาตรการตรวจสอบ'] || '',
        }));
      } catch (err) {
        console.error('Failed to fetch related data:', err);
      }
    };

    fetchRelated();
  }, [initialData]);

  const CustomRadio = ({
    name,
    value,
    checked,
  }: {
    name: string;
    value: string;
    checked: boolean;
  }) => (
    <div className="relative flex items-center justify-center">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        readOnly
        className="peer appearance-none w-4 h-4 border border-slate-400 rounded-full checked:border-[#4A85E6] bg-white transition-all cursor-default"
      />
      <div className="absolute w-2 h-2 rounded-full bg-[#4A85E6] opacity-0 peer-checked:opacity-100 transition-all pointer-events-none"></div>
    </div>
  );

  const inputCls =
    'p-2 border border-slate-200 rounded-md text-[14px] text-slate-800 bg-slate-50 w-full';
  const textareaCls =
    'p-3 border border-slate-200 rounded-md text-[14px] resize-none text-slate-800 bg-slate-50 w-full';

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-300 overflow-hidden relative">
      {/* Close button */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all z-50"
      >
        <span className="text-xl leading-none">×</span>
      </button>

      <div className="bg-[#F4F8FB] border border-slate-200 rounded-xl p-8 pt-6 w-full h-full flex flex-col overflow-auto custom-scrollbar">
        <h2 className="text-xl font-bold text-[#1E2A5E] mb-6">
          {mode === 'dpo' ? 'ส่งคำขอลบกิจกรรมการประมวลผล' : 'รายละเอียดคำขอลบ'}
        </h2>

        <div className="flex flex-col gap-8 flex-1">
          {/* Section 1 */}
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ชื่อกิจกรรม</label>
                <input readOnly value={formData.activityName} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">วันที่เริ่มกิจกรรม</label>
                <input readOnly value={formData.startDate} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ระยะเวลาการเก็บรักษา</label>
                <input readOnly value={formData.retentionPeriod} className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วัตถุประสงค์ของการประมวลผล</label>
              <textarea readOnly value={formData.purpose} rows={3} className={textareaCls} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">เจ้าของข้อมูลส่วนบุคคล</label>
                <input readOnly value={formData.dataSubject} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">หมวดหมู่ข้อมูล</label>
                <input readOnly value={formData.dataCategory} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">ผู้รับผิดชอบข้อมูล</label>
                <input readOnly value={formData.dataOwner} className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ประเภทของข้อมูล</label>
              <div className="flex flex-col gap-2 pl-4">
                <label className="flex items-center gap-3">
                  <CustomRadio name="dataType" value="general" checked={formData.dataType === 'general'} />
                  <span className="text-[#1E2A5E] text-[14px]">ข้อมูลทั่วไป</span>
                </label>
                <label className="flex items-center gap-3">
                  <CustomRadio name="dataType" value="sensitive" checked={formData.dataType === 'sensitive'} />
                  <span className="text-[#1E2A5E] text-[14px]">ข้อมูลอ่อนไหว</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ข้อมูลส่วนบุคคลที่จัดเก็บ</label>
              <textarea readOnly value={formData.personalInfo} rows={2} className={textareaCls} />
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 2 */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">แหล่งที่ได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-2 pl-4">
                <label className="flex items-center gap-3">
                  <CustomRadio name="dataSource" value="direct" checked={formData.dataSource === 'direct'} />
                  <span className="text-[#1E2A5E] text-[14px]">จากเจ้าของข้อมูลส่วนบุคคลโดยตรง</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3">
                    <CustomRadio name="dataSource" value="other" checked={formData.dataSource === 'other'} />
                    <span className="text-[#1E2A5E] text-[14px]">จากแหล่งอื่น :</span>
                  </label>
                  <input readOnly value={formData.dataSourceOtherSpec} className="p-1 px-3 border border-slate-200 rounded-md text-[13px] w-[250px] bg-slate-50 text-slate-800" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ฐานในการประมวลผล</label>
              <textarea readOnly value={formData.legalBasis} rows={2} className={textareaCls} />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการได้มาซึ่งข้อมูล</label>
              <div className="flex flex-col gap-2 pl-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3">
                    <CustomRadio name="collectionMethod" value="digital" checked={formData.collectionMethod === 'digital'} />
                    <span className="text-[#1E2A5E] text-[14px]">รูปแบบดิจิทัล / ข้อมูลอิเล็กทรอนิกส์ :</span>
                  </label>
                  <input readOnly value={formData.digitalSpec} className="p-1 px-3 border border-slate-200 rounded-md text-[13px] w-[250px] bg-slate-50 text-slate-800" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3">
                    <CustomRadio name="collectionMethod" value="paper" checked={formData.collectionMethod === 'paper'} />
                    <span className="text-[#1E2A5E] text-[14px]">รูปแบบเอกสาร :</span>
                  </label>
                  <input readOnly value={formData.paperSpec} className="p-1 px-3 border border-slate-200 rounded-md text-[13px] w-[250px] bg-slate-50 text-slate-800" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การขอความยินยอมของผู้เยาว์</label>
              <div className="grid grid-cols-[120px_1fr] gap-y-4 pl-4 items-start">
                <span className="text-[#1E2A5E] text-[14px] pt-0.5">อายุไม่เกิน 10 ปี :</span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3"><CustomRadio name="minorUnder10" value="have" checked={formData.minorUnder10 === 'have'} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
                  <label className="flex items-center gap-3"><CustomRadio name="minorUnder10" value="none" checked={formData.minorUnder10 === 'none'} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
                </div>
                <span className="text-[#1E2A5E] text-[14px] pt-0.5">อายุ 10 - 20 ปี :</span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3"><CustomRadio name="minor10to20" value="have" checked={formData.minor10to20 === 'have'} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
                  <label className="flex items-center gap-3"><CustomRadio name="minor10to20" value="none" checked={formData.minor10to20 === 'none'} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 3: Transfer */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ</label>
              <div className="flex flex-col gap-4 pl-4">
                <label className="flex items-center gap-3"><CustomRadio name="transferAbroad" value="yes" checked={formData.transferAbroad === 'yes'} /><span className="text-[#1E2A5E] text-[14px]">มี</span></label>
                {formData.transferAbroad === 'yes' && (
                  <div className="pl-8 flex flex-col gap-4 border-l-2 border-[#8B93C5] ml-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">ประเทศปลายทาง :</span>
                      <input readOnly value={formData.destinationCountry} className="p-1 px-3 border border-slate-200 rounded-md text-[13px] flex-1 max-w-[300px] bg-slate-50 text-slate-800" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[14px] text-[#1E2A5E]">การโอนข้อมูลในบริษัทในเครือ</span>
                      <div className="flex flex-col gap-2 pl-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-3"><CustomRadio name="transferAffiliate" value="yes" checked={formData.transferAffiliate === 'yes'} /><span className="text-[#1E2A5E] text-[14px]">ใช่ :</span></label>
                          <input readOnly value={formData.transferAffiliateSpec} className="p-1 px-3 border border-slate-200 rounded-md text-[13px] flex-1 max-w-[220px] bg-slate-50 text-slate-800" />
                        </div>
                        <label className="flex items-center gap-3"><CustomRadio name="transferAffiliate" value="no" checked={formData.transferAffiliate === 'no'} /><span className="text-[#1E2A5E] text-[14px]">ไม่ใช่</span></label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">วิธีการโอนย้าย :</span>
                      <input readOnly value={formData.transferMethod} className="p-1 px-3 border border-slate-200 rounded-md text-[13px] flex-1 max-w-[300px] bg-slate-50 text-slate-800" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] shrink-0">มาตรการคุ้มครองข้อมูลส่วนบุคคล :</span>
                      <input readOnly value={formData.protectionMeasure} className="p-1 px-3 border border-slate-200 rounded-md text-[13px] flex-1 max-w-[300px] bg-slate-50 text-slate-800" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[14px] text-[#1E2A5E]">ข้อยกเว้นตามมาตรา 28</span>
                      <textarea readOnly value={formData.exceptionArt28} rows={2} className={textareaCls + ' max-w-[700px]'} />
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-3"><CustomRadio name="transferAbroad" value="no" checked={formData.transferAbroad === 'no'} /><span className="text-[#1E2A5E] text-[14px]">ไม่มี</span></label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">ระดับความเสี่ยง</label>
              <div className="flex flex-col gap-2 pl-4">
                {['ความเสี่ยงระดับต่ำ', 'ความเสี่ยงระดับกลาง', 'ความเสี่ยงระดับสูง'].map((lvl) => (
                  <label key={lvl} className="flex items-center gap-3">
                    <CustomRadio name="riskLevel" value={lvl} checked={formData.riskLevel === lvl} />
                    <span className="text-[#1E2A5E] text-[14px]">{lvl}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 4: Storage */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">ประเภทของข้อมูลที่จัดเก็บ</span>
              <div className="flex gap-6 pl-4">
                {['ข้อมูลอิเล็กทรอนิกส์', 'เอกสาร'].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.dataTypes.includes(item)} readOnly className="w-4 h-4 rounded-sm" />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">วิธีการเก็บรักษาข้อมูล</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 pl-4">
                {['เซิร์ฟเวอร์ภายในองค์กร', 'พื้นที่เก็บข้อมูลบนคลาวด์', 'การเข้ารหัส', 'ผู้ให้บริการภายนอก', 'ใส่แฟ้มสำหรับเอกสาร'].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.storageMethods.includes(item)} readOnly className="w-4 h-4 rounded-sm" />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#1E2A5E] font-medium">สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล (แผนกที่เข้าถึงได้)</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 pl-4">
                {['ฝ่ายบริหาร', 'ฝ่ายเทคโนโลยีสารสนเทศ', 'ฝ่ายทรัพยากรบุคคล', 'ฝ่ายพัฒนาซอฟต์แวร์', 'ฝ่ายบัญชีและการเงิน', 'ฝ่ายลูกค้าสัมพันธ์ / บริการลูกค้า', 'ฝ่ายธุรการ', 'ฝ่ายกฎหมาย', 'ฝ่ายการตลาด', 'ฝ่ายจัดซื้อ'].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.accessRights.includes(item)} readOnly className="w-4 h-4 rounded-sm" />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">วิธีการลบหรือทำลายข้อมูลส่วนบุคคล</label>
              <textarea readOnly value={formData.deletionMethod} rows={2} className={textareaCls} />
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 5: Security */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับการยกเว้นไม่ต้องขอความยินยอม</label>
              <input readOnly value={formData.useWithoutConsent} className={inputCls} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล</label>
              <input readOnly value={formData.denialOfRights} className={inputCls} />
            </div>
            <div className="flex flex-col gap-4 pl-4">
              {[
                { label: 'มาตรการเชิงองค์กร', key: 'orgMeasure' },
                { label: 'มาตรการเชิงเทคนิค', key: 'techMeasure' },
                { label: 'มาตรการทางกายภาพ', key: 'physicalMeasure' },
                { label: 'การควบคุมการเข้าถึงข้อมูล', key: 'accessControl' },
                { label: 'การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน', key: 'userResponsibility' },
                { label: 'มาตรการตรวจสอบย้อนหลัง', key: 'auditMeasure' },
              ].map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <span className="text-[#1E2A5E] text-[13px] font-medium">{field.label}</span>
                  <input readOnly value={(formData as any)[field.key]} className={inputCls + ' max-w-[700px]'} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-slate-200 pb-2 items-center">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-500 font-bold text-[14px] hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {mode === 'dpo' && (
            <button
              onClick={onSendDelete}
              disabled={isSubmitting}
              className="px-10 py-3 bg-[#D32F2F] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#B71C1C] transition-all active:scale-95"
            >
              {isSubmitting ? 'Sending...' : 'Send Delete'}
            </button>
          )}
          {mode === 'admin' && (
            <button
              onClick={onDeleteConfirm}
              disabled={isSubmitting}
              className="px-10 py-3 bg-[#D32F2F] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#B71C1C] transition-all active:scale-95"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          )}
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

// ========================================================
// Main DeleteRequest Component
// ========================================================
export default function DeleteRequest({ userRole }: DeleteRequestProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null); // ropa record data
  const [selectedRequest, setSelectedRequest] = useState<any>(null); // request object (admin only)
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDPO = userRole === 'DPO(Data Protection Officer)';
  const isAdmin = userRole === 'Admin';

  const getToken = () => localStorage.getItem('access_token');
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  });

  // --- Fetch list ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (isDPO) {
          // DPO: fetch all ropa records
          const res = await fetch('http://localhost:3340/ropa-records', {
            headers: authHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            setItems(Array.isArray(data) ? data : data.data || []);
          }
        } else if (isAdmin) {
          // Admin: fetch delete requests, then enrich with ropa data
          const res = await fetch('http://localhost:3340/requests', {
            headers: authHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            const allRequests: any[] = Array.isArray(data) ? data : data.data || [];
            // Filter only Delete type requests
            const deleteRequests = allRequests.filter(
              (r) => r.req_type === 'Delete' || r.req_type === 'delete'
            );
            setItems(deleteRequests);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userRole]);

  // --- Handle card click ---
  const handleCardClick = async (item: any) => {
    try {
      if (isDPO) {
        // item is a ropa record
        setSelectedItem(item);
        setView('form');
      } else if (isAdmin) {
        // item is a request, need to fetch the ropa record
        setSelectedRequest(item);
        const res = await fetch(`http://localhost:3340/ropa-records/${item.ropa_id}`, {
          headers: authHeaders(),
        });
        if (res.ok) {
          const ropaData = await res.json();
          setSelectedItem(ropaData.data || ropaData);
        }
        setView('form');
      }
    } catch (err) {
      console.error('Error fetching ropa record:', err);
    }
  };

  // --- DPO: Send Delete Request ---
  const handleSendDelete = async () => {
    if (!selectedItem) return;

    const userIdStr = localStorage.getItem('user_id');
    const userId = userIdStr ? parseInt(userIdStr) : 0;

    setIsSubmitting(true);
    try {
      const payload = {
        ropa_id: selectedItem.id,
        req_type: 'Delete',
        status: 'Pending',
        create_by: userId,
      };

      const res = await fetch('http://localhost:3340/requests', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('ส่งคำขอลบเรียบร้อยแล้ว');
        setView('list');
        setSelectedItem(null);
      } else {
        const err = await res.json();
        alert(err.detail || 'เกิดข้อผิดพลาดในการส่งคำขอ');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Admin: Delete the record ---
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    const confirmed = window.confirm(
      `คุณต้องการลบกิจกรรม "${selectedItem.activity_name}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      // Delete the ropa record
      const res = await fetch(`http://localhost:3340/ropa-records/${selectedItem.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (res.ok) {
        // Also update the request status to Approved/Completed if we have request id
        if (selectedRequest?.id) {
          await fetch(`http://localhost:3340/requests/${selectedRequest.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status: 'Approved' }),
          });
        }

        alert('ลบข้อมูลเรียบร้อยแล้ว');

        // Refresh list
        const updatedRes = await fetch('http://localhost:3340/requests', {
          headers: authHeaders(),
        });
        if (updatedRes.ok) {
          const data = await updatedRes.json();
          const allRequests: any[] = Array.isArray(data) ? data : data.data || [];
          setItems(allRequests.filter((r) => r.req_type === 'Delete' || r.req_type === 'delete'));
        }

        setView('list');
        setSelectedItem(null);
        setSelectedRequest(null);
      } else {
        const err = await res.json();
        alert(err.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Form view ---
  if (view === 'form' && selectedItem) {
    return (
      <div className="flex flex-col h-full p-4 bg-[#F0F9FF] overflow-hidden">
        <RopaFormReadOnly
          initialData={selectedItem}
          onCancel={() => {
            setView('list');
            setSelectedItem(null);
            setSelectedRequest(null);
          }}
          onSendDelete={isDPO ? handleSendDelete : undefined}
          onDeleteConfirm={isAdmin ? handleDeleteConfirm : undefined}
          isSubmitting={isSubmitting}
          mode={isDPO ? 'dpo' : 'admin'}
        />
      </div>
    );
  }

  // --- List view ---
  return (
    <div className="flex flex-col h-full p-4 animate-in fade-in duration-500 bg-[#F0F9FF]">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar pt-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400 font-bold">กำลังโหลด...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold">
            {isDPO ? 'ไม่พบรายการกิจกรรม' : 'ไม่พบคำขอลบข้อมูล'}
          </div>
        ) : (
          items.map((item) => {
            const title = isDPO
              ? item.activity_name || `รายการ #${item.id}`
              : `คำขอ #${item.id} — RoPA ID: ${item.ropa_id}`;
            const subtitle = isDPO
              ? item.data_category || ''
              : `สถานะ: ${item.status} | สร้างเมื่อ: ${item.create_date ? new Date(item.create_date).toLocaleDateString('th-TH') : '-'}`;

            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="flex items-center justify-between bg-white rounded-[1.5rem] shadow-xl border border-slate-50 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden min-h-[90px]"
              >
                <div className="py-6 px-10 flex flex-col gap-1">
                  <span className="text-[#2D3663] font-bold text-2xl">{title}</span>
                  {subtitle && (
                    <span className="text-slate-400 text-[13px] font-medium">{subtitle}</span>
                  )}
                </div>
                <div className="w-20 h-full absolute right-0 top-0 bg-[#D1EAFF] flex items-center justify-center group-hover:bg-blue-500 transition-all">
                  <span className="text-blue-900 group-hover:text-white font-black text-2xl">❯</span>
                </div>
              </div>
            );
          })
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
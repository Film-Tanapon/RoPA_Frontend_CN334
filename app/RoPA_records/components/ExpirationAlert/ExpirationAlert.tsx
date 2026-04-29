"use client";
import React, { useState, useEffect } from "react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
/**
 * Parse retention period string → total months.
 * Handles: "3 ปี", "6 เดือน", "2", "2.5", "1 year", "6 months"
 * Bare numbers (no unit) are treated as YEARS.
 */
function parseRetentionToMonths(period: string): number | null {
  if (!period || period === "-") return null;
  const s = period.trim().toLowerCase();
  const numMatch = s.match(/^([\d.]+)/);
  if (!numMatch) return null;
  const num = parseFloat(numMatch[1]);
  if (isNaN(num)) return null;
  const isMonth =
    s.includes("เดือน") || s.includes("month") || s.includes("mo");
  const isYear = s.includes("ปี") || s.includes("year") || s.includes("yr");
  if (isMonth) return num; // "6 เดือน" → 6
  if (isYear) return num * 12; // "2 ปี"   → 24
  return num * 12; // bare number → treat as years
}

function computeRetentionEndDate(
  retentionStart: string,
  retentionPeriod: string,
): Date | null {
  if (!retentionStart || retentionStart === "-") return null;
  const start = new Date(retentionStart);
  if (isNaN(start.getTime())) return null;
  const months = parseRetentionToMonths(retentionPeriod);
  if (months === null) return null;
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  return end;
}

function daysUntilExpiry(
  retentionStart: string,
  retentionPeriod: string,
): number {
  const end = computeRetentionEndDate(retentionStart, retentionPeriod);
  if (!end) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = end.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  if (!dateStr || dateStr === "-") return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return "-";
  }
}

// ─────────────────────────────────────────────
// Read-Only RoPA form (same as DeleteRequest)
// ─────────────────────────────────────────────
function RopaFormReadOnly({
  initialData,
  onCancel,
  onExtendRetention,
  onRequestDeletion,
  isSubmitting,
}: {
  initialData: any;
  onCancel: () => void;
  onExtendRetention: () => void;
  onRequestDeletion: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    activityName: "",
    startDate: "",
    retentionPeriod: "",
    purpose: "",
    dataOwner: "",
    dataSubject: "",
    dataCategory: "",
    dataType: "general",
    personalInfo: "",
    dataSource: "direct",
    dataSourceOtherSpec: "",
    legalBasis: "",
    collectionMethod: "digital",
    digitalSpec: "",
    paperSpec: "",
    minorUnder10: "none",
    minor10to20: "none",
    transferAbroad: "no",
    destinationCountry: "",
    transferAffiliate: "no",
    transferAffiliateSpec: "",
    transferMethod: "",
    protectionMeasure: "",
    exceptionArt28: "",
    dataTypes: [] as string[],
    storageMethods: [] as string[],
    accessRights: [] as string[],
    deletionMethod: "",
    useWithoutConsent: "",
    denialOfRights: "",
    riskLevel: "ความเสี่ยงระดับต่ำ",
    orgMeasure: "",
    techMeasure: "",
    physicalMeasure: "",
    accessControl: "",
    userResponsibility: "",
    auditMeasure: "",
  });

  const safeSplit = (str: string | undefined | null) => {
    if (!str || str === "-" || str === "[]") return [];
    return str.split(", ").filter((i) => i.trim() !== "");
  };

  useEffect(() => {
    if (!initialData) return;
    const token = localStorage.getItem("access_token");
    const headers = { Authorization: `Bearer ${token}` };

    setFormData((prev) => ({
      ...prev,
      activityName: initialData.activity_name || "",
      startDate:
        initialData.retention_start && initialData.retention_start !== "-"
          ? initialData.retention_start
          : "",
      retentionPeriod:
        initialData.retention_period && initialData.retention_period !== "-"
          ? initialData.retention_period
          : "",
      purpose: initialData.purpose || "",
      dataOwner: initialData.data_owner !== "-" ? initialData.data_owner : "",
      dataSubject:
        initialData.data_subject !== "-" ? initialData.data_subject : "",
      dataCategory:
        initialData.data_category !== "Uncategorized"
          ? initialData.data_category
          : "",
      personalInfo: initialData.personal_info || "",
      dataType: initialData.is_sensitive ? "sensitive" : "general",
      dataSource: initialData.source === "direct" ? "direct" : "other",
      dataSourceOtherSpec:
        initialData.source !== "direct" ? initialData.source : "",
      legalBasis:
        initialData.legal_basis !== "-" ? initialData.legal_basis : "",
      collectionMethod: initialData.collection_method || "digital",
      minorUnder10: initialData.is_under_10 ? "have" : "none",
      minor10to20: initialData.is_age_10_20 ? "have" : "none",
      transferAbroad: initialData.is_international ? "yes" : "no",
      dataTypes: safeSplit(initialData.storage_format),
      storageMethods: safeSplit(initialData.retention_method),
      accessRights: safeSplit(initialData.access_control),
      deletionMethod:
        initialData.disposal_method !== "-" ? initialData.disposal_method : "",
      useWithoutConsent:
        initialData.consent_exempt_basis !== "-"
          ? initialData.consent_exempt_basis
          : "",
      denialOfRights:
        initialData.right_rejection_reason !== "-"
          ? initialData.right_rejection_reason
          : "",
      riskLevel: initialData.risk_level || "ความเสี่ยงระดับต่ำ",
    }));

    const fetchRelated = async () => {
      try {
        const resSecurity = await fetch(
          `${API_BASE}/security/${initialData.id}`,
          { headers },
        );
        if (resSecurity.ok) {
          const sJson = await resSecurity.json();
          const securityData: any[] = Array.isArray(sJson.data)
            ? sJson.data
            : Array.isArray(sJson)
              ? sJson
              : [];
          const secMap: Record<string, string> = {};
          securityData.forEach((sec) => {
            secMap[sec.measure_type] = sec.description;
          });
          setFormData((prev) => ({
            ...prev,
            orgMeasure: secMap["มาตรการเชิงองค์กร"] || "",
            techMeasure: secMap["มาตรการเชิงเทคนิค"] || "",
            physicalMeasure: secMap["มาตรการเชิงกายภาพ"] || "",
            accessControl: secMap["การควบคุมการเข้าถึง"] || "",
            userResponsibility: secMap["ความรับผิดชอบของผู้ใช้งาน"] || "",
            auditMeasure: secMap["มาตรการตรวจสอบ"] || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch security data:", err);
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
    "p-2 border border-slate-200 rounded-md text-[14px] text-slate-800 bg-slate-50 w-full";
  const textareaCls =
    "p-3 border border-slate-200 rounded-md text-[14px] resize-none text-slate-800 bg-slate-50 w-full";

  const days = daysUntilExpiry(
    initialData?.retention_start,
    initialData?.retention_period,
  );

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-300 overflow-hidden relative">
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all z-50"
      >
        <span className="text-xl leading-none">×</span>
      </button>

      <div className="bg-[#F4F8FB] border border-slate-200 rounded-xl p-8 pt-6 w-full h-full flex flex-col overflow-auto custom-scrollbar">
        <h2 className="text-xl font-bold text-[#1E2A5E] mb-2">
          รายละเอียดกิจกรรมการประมวลผล
        </h2>

        {/* Expiry warning banner */}
        <div
          className={`mb-6 px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-bold ${days <= 0 ? "bg-red-50 text-red-600 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
        >
          <span className="text-lg">⚠️</span>
          {days <= 0
            ? `หมดอายุแล้ว ${Math.abs(days)} วัน (วันสิ้นสุด: ${formatDate(initialData?.retention_until)})`
            : `อีก ${days} วันจะหมดอายุ`}
        </div>

        <div className="flex flex-col gap-8 flex-1">
          {/* Section 1 */}
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">
                  ชื่อกิจกรรม
                </label>
                <input
                  readOnly
                  value={formData.activityName}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">
                  วันที่เริ่มกิจกรรม
                </label>
                <input
                  readOnly
                  value={formData.startDate}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">
                  ระยะเวลาการเก็บรักษา (ปี)
                </label>
                <input
                  readOnly
                  value={formData.retentionPeriod}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                วัตถุประสงค์ของการประมวลผล
              </label>
              <textarea
                readOnly
                value={formData.purpose}
                rows={3}
                className={textareaCls}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">
                  เจ้าของข้อมูลส่วนบุคคล
                </label>
                <input
                  readOnly
                  value={formData.dataSubject}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">
                  หมวดหมู่ข้อมูล
                </label>
                <input
                  readOnly
                  value={formData.dataCategory}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#1E2A5E] font-medium text-[14px]">
                  ผู้รับผิดชอบข้อมูล
                </label>
                <input
                  readOnly
                  value={formData.dataOwner}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                ประเภทของข้อมูล
              </label>
              <div className="flex flex-col gap-2 pl-4">
                <label className="flex items-center gap-3">
                  <CustomRadio
                    name="dataType"
                    value="general"
                    checked={formData.dataType === "general"}
                  />
                  <span className="text-[#1E2A5E] text-[14px]">
                    ข้อมูลทั่วไป
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <CustomRadio
                    name="dataType"
                    value="sensitive"
                    checked={formData.dataType === "sensitive"}
                  />
                  <span className="text-[#1E2A5E] text-[14px]">
                    ข้อมูลอ่อนไหว
                  </span>
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                ข้อมูลส่วนบุคคลที่จัดเก็บ
              </label>
              <textarea
                readOnly
                value={formData.personalInfo}
                rows={2}
                className={textareaCls}
              />
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 2 */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                แหล่งที่ได้มาซึ่งข้อมูล
              </label>
              <div className="flex flex-col gap-2 pl-4">
                <label className="flex items-center gap-3">
                  <CustomRadio
                    name="dataSource"
                    value="direct"
                    checked={formData.dataSource === "direct"}
                  />
                  <span className="text-[#1E2A5E] text-[14px]">
                    จากเจ้าของข้อมูลส่วนบุคคลโดยตรง
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3">
                    <CustomRadio
                      name="dataSource"
                      value="other"
                      checked={formData.dataSource === "other"}
                    />
                    <span className="text-[#1E2A5E] text-[14px]">
                      จากแหล่งอื่น :
                    </span>
                  </label>
                  <input
                    readOnly
                    value={formData.dataSourceOtherSpec}
                    className="p-1 px-3 border border-slate-200 rounded-md text-[13px] w-[250px] bg-slate-50 text-slate-800"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                ฐานในการประมวลผล
              </label>
              <textarea
                readOnly
                value={formData.legalBasis}
                rows={2}
                className={textareaCls}
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                การขอความยินยอมของผู้เยาว์
              </label>
              <div className="grid grid-cols-[120px_1fr] gap-y-4 pl-4 items-start">
                <span className="text-[#1E2A5E] text-[14px] pt-0.5">
                  อายุไม่เกิน 10 ปี :
                </span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3">
                    <CustomRadio
                      name="minorUnder10"
                      value="have"
                      checked={formData.minorUnder10 === "have"}
                    />
                    <span className="text-[#1E2A5E] text-[14px]">มี</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <CustomRadio
                      name="minorUnder10"
                      value="none"
                      checked={formData.minorUnder10 === "none"}
                    />
                    <span className="text-[#1E2A5E] text-[14px]">ไม่มี</span>
                  </label>
                </div>
                <span className="text-[#1E2A5E] text-[14px] pt-0.5">
                  อายุ 10 - 20 ปี :
                </span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3">
                    <CustomRadio
                      name="minor10to20"
                      value="have"
                      checked={formData.minor10to20 === "have"}
                    />
                    <span className="text-[#1E2A5E] text-[14px]">มี</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <CustomRadio
                      name="minor10to20"
                      value="none"
                      checked={formData.minor10to20 === "none"}
                    />
                    <span className="text-[#1E2A5E] text-[14px]">ไม่มี</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 3: Risk & Transfer */}
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                การส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ
              </label>
              <div className="flex flex-col gap-4 pl-4">
                <label className="flex items-center gap-3">
                  <CustomRadio
                    name="transferAbroad"
                    value="yes"
                    checked={formData.transferAbroad === "yes"}
                  />
                  <span className="text-[#1E2A5E] text-[14px]">มี</span>
                </label>
                {formData.transferAbroad === "yes" && (
                  <div className="pl-8 flex flex-col gap-4 border-l-2 border-[#8B93C5] ml-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-[#1E2A5E] w-[140px]">
                        ประเทศปลายทาง :
                      </span>
                      <input
                        readOnly
                        value={formData.destinationCountry}
                        className="p-1 px-3 border border-slate-200 rounded-md text-[13px] flex-1 max-w-[300px] bg-slate-50 text-slate-800"
                      />
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-3">
                  <CustomRadio
                    name="transferAbroad"
                    value="no"
                    checked={formData.transferAbroad === "no"}
                  />
                  <span className="text-[#1E2A5E] text-[14px]">ไม่มี</span>
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                ระดับความเสี่ยง
              </label>
              <div className="flex flex-col gap-2 pl-4">
                {[
                  "ความเสี่ยงระดับต่ำ",
                  "ความเสี่ยงระดับกลาง",
                  "ความเสี่ยงระดับสูง",
                ].map((lvl) => (
                  <label key={lvl} className="flex items-center gap-3">
                    <CustomRadio
                      name="riskLevel"
                      value={lvl}
                      checked={formData.riskLevel === lvl}
                    />
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
              <span className="text-[14px] text-[#1E2A5E] font-medium">
                ประเภทของข้อมูลที่จัดเก็บ
              </span>
              <div className="flex gap-6 pl-4">
                {["ข้อมูลอิเล็กทรอนิกส์", "เอกสาร"].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.dataTypes.includes(item)}
                      readOnly
                      className="w-4 h-4 rounded-sm"
                    />
                    <span className="text-[#1E2A5E] text-[14px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#1E2A5E] font-medium text-[14px]">
                วิธีการลบหรือทำลายข้อมูลส่วนบุคคล
              </label>
              <textarea
                readOnly
                value={formData.deletionMethod}
                rows={2}
                className={textareaCls}
              />
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 5: Security measures */}
          <section className="flex flex-col gap-5">
            <h3 className="text-[#1E2A5E] font-bold text-[15px]">
              คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย
            </h3>
            <div className="flex flex-col gap-4 pl-4">
              {[
                { label: "มาตรการเชิงองค์กร", key: "orgMeasure" },
                { label: "มาตรการเชิงเทคนิค", key: "techMeasure" },
                { label: "มาตรการทางกายภาพ", key: "physicalMeasure" },
                { label: "การควบคุมการเข้าถึงข้อมูล", key: "accessControl" },
                {
                  label: "การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
                  key: "userResponsibility",
                },
                { label: "มาตรการตรวจสอบย้อนหลัง", key: "auditMeasure" },
              ].map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <span className="text-[#1E2A5E] text-[13px] font-medium">
                    {field.label}
                  </span>
                  <input
                    readOnly
                    value={(formData as any)[field.key]}
                    className={inputCls + " max-w-[700px]"}
                  />
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
          <div className="flex gap-4 items-center">
            <button
              onClick={onExtendRetention}
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#2D3663] text-white rounded-full font-bold text-[15px] shadow-lg hover:bg-[#3d4880] transition-all active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? "Processing..." : "Extend Retention"}
            </button>
            <button
              onClick={onRequestDeletion}
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#D32F2F] text-white rounded-full font-bold text-[15px] shadow-lg hover:bg-[#B71C1C] transition-all active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? "Processing..." : "Request Deletion"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// Extension Popup Component
// ─────────────────────────────────────────────
function ExtensionPopup({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (extensionPeriod: string) => void;
  isSubmitting: boolean;
}) {
  const [extensionPeriod, setExtensionPeriod] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all text-xl leading-none"
        >
          ×
        </button>
        <h3 className="text-[#2D3663] font-bold text-lg mb-5">
          ระยะเวลาที่ต้องการต่ออายุ
        </h3>
        <input
          type="text"
          value={extensionPeriod}
          onChange={(e) => setExtensionPeriod(e.target.value)}
          placeholder="เช่น 5 ปี, 10 ปี"
          className="w-full p-3 border border-slate-200 rounded-xl text-[#334155] text-[15px] outline-none focus:border-blue-400 transition-all placeholder:text-slate-300 mb-6"
        />
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (!extensionPeriod.trim()) {
                alert("กรุณากรอกระยะเวลาที่ต้องการต่ออายุ");
                return;
              }
              onSubmit(extensionPeriod.trim());
            }}
            disabled={isSubmitting}
            className="px-7 py-2.5 bg-[#00C853] text-white rounded-full font-bold text-[15px] shadow hover:bg-[#00A844] transition-all active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? "Processing..." : "Submit Extension"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
const API_BASE = process.env.API_URL || 'http://localhost:3340';

// ─────────────────────────────────────────────
// Main ExpirationAlert Component
// ─────────────────────────────────────────────
export default function ExpirationAlert() {
  const [view, setView] = useState<"list" | "form">("list");
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExtensionPopup, setShowExtensionPopup] = useState(false);

  const getToken = () => localStorage.getItem("access_token");
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchExpiredRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ropa-records`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const all: any[] = Array.isArray(data) ? data : data.data || [];
        // Show records that are Expired OR near expiry (≤30 days)
        const filtered = all.filter((item) => {
          if (item.status === "Expired") return true;
          const days = daysUntilExpiry(
            item.retention_start,
            item.retention_period,
          );
          return days >= 0 && days <= 30;
        });
        setItems(filtered);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiredRecords();
  }, []);

  // ── Extend Retention: open popup first ──
  const handleExtendRetention = () => {
    setShowExtensionPopup(true);
  };

  const handleSubmitExtension = async (extensionPeriod: string) => {
    if (!selectedItem) return;
    const userIdStr = localStorage.getItem("user_id");
    const userId = userIdStr ? parseInt(userIdStr) : 0;
    setIsSubmitting(true);
    try {
      const payload = {
        ropa_id: selectedItem.id,
        req_type: "ExtendRetention",
        detail: extensionPeriod,
        status: "Pending",
      };
      const res = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowExtensionPopup(false);
        alert("ส่งคำขอต่ออายุการเก็บข้อมูลเรียบร้อยแล้ว");
        setView("list");
        setSelectedItem(null);
        fetchExpiredRecords();
      } else {
        const err = await res.json();
        alert(err.detail || "เกิดข้อผิดพลาดในการส่งคำขอ");
      }
    } catch {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Request Deletion: same as DeleteRequest (DPO flow) ──
  const handleRequestDeletion = async () => {
    if (!selectedItem) return;
    const userIdStr = localStorage.getItem("user_id");
    const userId = userIdStr ? parseInt(userIdStr) : 0;
    setIsSubmitting(true);
    try {
      const payload = {
        ropa_id: selectedItem.id,
        req_type: "Delete",
        status: "Pending",
        detail: "Request deletion of expired record"

      };
      const res = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("ส่งคำขอลบเรียบร้อยแล้ว");
        setView("list");
        setSelectedItem(null);
        fetchExpiredRecords();
      } else {
        const err = await res.json();
        alert(err.detail || "เกิดข้อผิดพลาดในการส่งคำขอ");
      }
    } catch {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Form view ──
  if (view === "form" && selectedItem) {
    return (
      <div className="flex flex-col h-full p-4 bg-[#F0F9FF] overflow-hidden">
        {showExtensionPopup && (
          <ExtensionPopup
            onClose={() => setShowExtensionPopup(false)}
            onSubmit={handleSubmitExtension}
            isSubmitting={isSubmitting}
          />
        )}
        <RopaFormReadOnly
          initialData={selectedItem}
          onCancel={() => {
            setView("list");
            setSelectedItem(null);
          }}
          onExtendRetention={handleExtendRetention}
          onRequestDeletion={handleRequestDeletion}
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
          <div className="text-center py-10 text-slate-400 font-bold">
            กำลังโหลด...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold">
            ไม่พบรายการที่ใกล้หมดอายุ
          </div>
        ) : (
          items.map((item) => {
            const days = daysUntilExpiry(
              item.retention_start,
              item.retention_period,
            );
            const isExpired = item.status === "Expired" || days <= 0;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setView("form");
                }}
                className="flex items-center justify-between bg-white rounded-[1.5rem] shadow-xl border border-slate-50 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden min-h-[100px]"
              >
                <div className="py-6 px-10 flex flex-col gap-1.5">
                  <span className="text-[#2D3663] font-bold text-2xl">
                    {item.activity_name || `รายการ #${item.id}`}
                  </span>
                  <span
                    className={`text-sm font-bold flex items-center gap-1.5 ${isExpired ? "text-red-500" : "text-amber-500"}`}
                  >
                    <span>⚠</span>
                    {isExpired
                      ? `หมดอายุ วันที่ ${formatDate(item.retention_until)} (อีก ${Math.abs(days)} วัน)`
                      : `หมดอายุ วันที่ ${formatDate(item.retention_until)} (อีก ${days} วัน)`}
                  </span>
                </div>
                <div className="w-20 h-full absolute right-0 top-0 bg-[#D1EAFF] flex items-center justify-center group-hover:bg-blue-500 transition-all">
                  <span className="text-blue-900 group-hover:text-white font-black text-2xl">
                    ❯
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}

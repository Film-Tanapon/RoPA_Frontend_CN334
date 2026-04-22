import React, { useEffect, useState, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoPARecord {
  id: number;
  activity_name: string;
  status: string;
  risk_level: string;
  create_date: string;
  create_by: number;
  [key: string]: any;
}

interface User {
  id: number;
  departments: string;
  [key: string]: any;
}

interface DashboardData {
  totalActivities: number;
  reviewed: number;
  actionRequired: number;
  expired: number;
  pendingReview: number;
  ropaByMonth: { month: string; count: number }[];
  riskHigh: number;
  riskMid: number;
  riskLow: number;
  departments: { name: string; value: number }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3340';

const STATUS_MAP: Record<string, keyof Pick<DashboardData, 'reviewed' | 'actionRequired' | 'expired' | 'pendingReview'>> = {
  reviewed:       'reviewed',
  'action required': 'actionRequired',
  expired:        'expired',
  'pending review': 'pendingReview',
  pending:        'pendingReview',
};

const RISK_LABELS: Record<string, string> = {
  'ความเสี่ยงระดับสูง':  'high',
  'ความเสี่ยงระดับกลาง': 'mid',
  'ความเสี่ยงระดับต่ำ':  'low',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildMonthlyData(records: RoPARecord[]): { month: string; count: number }[] {
  const counts: Record<string, number> = {};

  records.forEach((r) => {
    if (!r.create_date) return;
    const d = new Date(r.create_date);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  // Fill last 12 months
  const result: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('th-TH', { month: 'short', year: '2-digit' });
    result.push({ month: label, count: counts[key] || 0 });
  }
  return result;
}

// ─── Mini chart components ────────────────────────────────────────────────────
function LineChart({ data }: { data: { month: string; count: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const w = 520;
  const h = 160;
  const padL = 32;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * chartW;
    const y = padT + (1 - d.count / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pathD = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${padT + chartH} L ${pts[0].x} ${padT + chartH} Z`;

  // Y axis ticks
  const ticks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {ticks.map((t) => {
        const y = padT + (1 - t / maxVal) * chartH;
        return (
          <g key={t}>
            <line x1={padL} x2={padL + chartW} y1={y} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#94A3B8" fontFamily="monospace">{t}</text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaD} fill="url(#lineGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#6366F1" stroke="white" strokeWidth="2" />
          {p.count > 0 && (
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="#6366F1" fontWeight="700">{p.count}</text>
          )}
          <text
            x={p.x} y={padT + chartH + 14}
            textAnchor="middle" fontSize="9" fill="#94A3B8" fontWeight="600"
            transform={`rotate(-35, ${p.x}, ${padT + chartH + 14})`}
          >
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ high, mid, low }: { high: number; mid: number; low: number }) {
  const total = high + mid + low || 1;
  const pHigh = high / total;
  const pMid = mid / total;
  const pLow = low / total;

  const cx = 90, cy = 90, r = 68, stroke = 28;
  const circ = 2 * Math.PI * r;

  const segments = [
    { pct: pHigh, color: '#EF4444', label: 'สูง', count: high },
    { pct: pMid,  color: '#F59E0B', label: 'กลาง', count: mid },
    { pct: pLow,  color: '#10B981', label: 'ต่ำ',  count: low },
  ];

  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = s.pct * circ;
    const gap = circ - dash;
    const el = (
      <circle
        key={s.label}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={s.color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <div className="flex items-center gap-6 w-full justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        {arcs}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="900" fill="#2D3663">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="600">ทั้งหมด</text>
      </svg>
      <div className="flex flex-col gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-slate-500 font-semibold w-12">ระดับ{s.label}</span>
            <span className="text-sm font-black" style={{ color: s.color }}>{s.count}</span>
            <span className="text-xs text-slate-400">({total > 0 ? Math.round((s.count / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [ropaRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/ropa-records`),
          fetch(`${API_BASE}/users`),
        ]);

        if (!ropaRes.ok) throw new Error(`ropa_records: ${ropaRes.status}`);
        if (!usersRes.ok) throw new Error(`users: ${usersRes.status}`);

        const ropaRecords: RoPARecord[] = await ropaRes.json();
        const users: User[] = await usersRes.json();

        // ── Status counts ──────────────────────────────────────────────────
        const statusCount = { reviewed: 0, actionRequired: 0, expired: 0, pendingReview: 0 };
        ropaRecords.forEach((r) => {
          const key = STATUS_MAP[(r.status || '').toLowerCase().trim()];
          if (key) statusCount[key]++;
        });

        // ── Risk level ─────────────────────────────────────────────────────
        let riskHigh = 0, riskMid = 0, riskLow = 0;
        ropaRecords.forEach((r) => {
          const level = RISK_LABELS[(r.risk_level || '').trim()];
          if (level === 'high') riskHigh++;
          else if (level === 'mid') riskMid++;
          else if (level === 'low') riskLow++;
        });

        // ── Monthly data ───────────────────────────────────────────────────
        const ropaByMonth = buildMonthlyData(ropaRecords);

        // ── Departments ────────────────────────────────────────────────────
        const deptCount: Record<string, number> = {};
        users.forEach((u) => {
          const dept = (u.departments || '').trim();
          if (dept) deptCount[dept] = (deptCount[dept] || 0) + 1;
        });
        const departments = Object.entries(deptCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        setData({
          totalActivities: ropaRecords.length,
          ...statusCount,
          ropaByMonth,
          riskHigh,
          riskMid,
          riskLow,
          departments,
        });
      } catch (e: any) {
        setError(e.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#6366F1] border-t-transparent animate-spin" />
          <p className="text-slate-400 font-semibold text-sm">กำลังโหลดข้อมูล Dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white rounded-3xl p-10 shadow text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-slate-600 font-semibold mb-2">ไม่สามารถเชื่อมต่อ API ได้</p>
          <p className="text-red-400 text-sm font-mono">{error}</p>
        </div>
      </div>
    );
  }

  const {
    totalActivities,
    reviewed, actionRequired, expired, pendingReview,
    ropaByMonth,
    riskHigh, riskMid, riskLow,
    departments,
  } = data;

  const maxDept = Math.max(...departments.map((d) => d.value), 1);

  const statusItems = [
    { label: 'Reviewed',       value: reviewed,       color: 'text-emerald-500', bg: 'bg-emerald-400' },
    { label: 'Action Required',value: actionRequired,  color: 'text-slate-400',   bg: 'bg-slate-400'   },
    { label: 'Expired',        value: expired,         color: 'text-red-500',     bg: 'bg-red-500'     },
    { label: 'Pending Review', value: pendingReview,   color: 'text-amber-400',   bg: 'bg-yellow-400'  },
  ];

  return (
    <div className="h-screen overflow-y-auto p-8 space-y-6 bg-[#F8FAFC]" style={{ fontFamily: "'Noto Sans Thai', 'Sarabun', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-[#2D3663]">Overview</h2>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-slate-400 hover:text-[#6366F1] font-semibold px-4 py-2 rounded-xl border border-slate-200 hover:border-[#6366F1] transition-all"
        >
          ↻ รีเฟรช
        </button>
      </div>

      {/* Row 1: Total + Progress */}
      <div className="grid grid-cols-12 gap-6">

        {/* Total Activities */}
        <div className="col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center min-h-[220px]">
          <p className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">Total Activities</p>
          <h3 className="text-8xl font-black text-[#2D3663]">{totalActivities}</h3>
          <p className="text-slate-300 text-xs font-semibold mt-3 uppercase tracking-widest">RoPA Records</p>
        </div>

        {/* Process Review Progress */}
        <div className="col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-slate-400 font-bold mb-6 uppercase tracking-widest text-xs">Process Review Progress</p>
          <div className="grid grid-cols-4 gap-4 mb-8 text-center">
            {statusItems.map((s) => (
              <div key={s.label}>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-300 font-semibold">
                  {totalActivities > 0 ? Math.round((s.value / totalActivities) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
          <div className="w-full h-10 bg-slate-100 rounded-xl overflow-hidden flex">
            {totalActivities > 0 ? (
              statusItems.map((s) => (
                <div
                  key={s.label}
                  style={{ width: `${(s.value / totalActivities) * 100}%` }}
                  className={`${s.bg} h-full transition-all duration-700`}
                  title={`${s.label}: ${s.value}`}
                />
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                No Data Available
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 flex-wrap">
            {statusItems.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${s.bg}`} />
                <span className="text-[10px] text-slate-400 font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: RoPA by Month + Risk Level */}
      <div className="grid grid-cols-2 gap-6">

        {/* RoPA Registration Progress */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <p className="text-slate-400 font-bold mb-1 uppercase tracking-widest text-xs">RoPA Registration Progress</p>
          <p className="text-slate-300 text-[10px] font-semibold mb-5">จำนวน RoPA ที่ลงทะเบียน (12 เดือนล่าสุด)</p>
          <div className="flex-1 min-h-[180px] flex items-end">
            <LineChart data={ropaByMonth} />
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <p className="text-slate-400 font-bold mb-1 uppercase tracking-widest text-xs">Risk Level</p>
          <p className="text-slate-300 text-[10px] font-semibold mb-5">สัดส่วนระดับความเสี่ยงของ RoPA ทั้งหมด</p>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart high={riskHigh} mid={riskMid} low={riskLow} />
          </div>
        </div>
      </div>

      {/* Row 3: Department Comparison */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <p className="text-[#2D3663] font-black mb-1 text-lg">Department Comparison</p>
        <p className="text-slate-300 text-[10px] font-semibold mb-8 uppercase tracking-widest">จำนวนผู้ใช้งานแต่ละแผนก</p>

        {departments.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-200 font-black italic tracking-widest text-xl">
            ไม่พบข้อมูลแผนก
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {departments.map((dept, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-32 text-right text-xs font-bold text-[#64748B] truncate flex-shrink-0">
                  {dept.name}
                </div>
                <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#6366F1] group-hover:bg-[#4F46E5] transition-all duration-700 flex items-center justify-end pr-3"
                    style={{ width: `${(dept.value / maxDept) * 100}%`, minWidth: '2rem' }}
                  >
                    <span className="text-white text-[10px] font-black">{dept.value}</span>
                  </div>
                </div>
                <div className="w-16 text-xs text-slate-400 font-semibold flex-shrink-0">
                  {Math.round((dept.value / departments.reduce((a, d) => a + d.value, 0)) * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
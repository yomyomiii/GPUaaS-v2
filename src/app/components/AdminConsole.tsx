import React, { useState, useEffect } from "react";
import { WorkspacePage } from "./WorkspacePage";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Server, Users, Layers, Database, Image, Cpu, CreditCard, ReceiptText, Zap,
  BellRing, Settings, Plus, Edit, Trash2, AlertTriangle, Search, ChevronUp, ChevronDown, Clock, X,
  Crown, Shield, User, HardDriveUpload, CheckCircle, Calendar, ScrollText, ClipboardList, Play, Square,
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_20, GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, RED_10, GREEN, BLUE, YELLOW, YELLOW_10, ORANGE, ORANGE_10, Badge, StatusDot, Card, PrimaryBtn, Table, PageContainer, MetricCard, TabBar,
  SectionCard, ListCard, StatCard,
  type AdminScreen,
} from "./ConsoleLayout";

// ─── Admin Dashboard mock data ────────────────────────────────────────────────
const serverTrend = [
  { day: "7/1", active: 38, stopped: 12 }, { day: "7/2", active: 41, stopped: 11 },
  { day: "7/3", active: 39, stopped: 13 }, { day: "7/4", active: 44, stopped: 10 },
  { day: "7/5", active: 43, stopped: 11 }, { day: "7/6", active: 46, stopped: 9 },
  { day: "7/7", active: 47, stopped: 8 },
];

const creditUsageTrend = [
  { day: "7/1", used: 52000 }, { day: "7/2", used: 68000 },
  { day: "7/3", used: 49000 }, { day: "7/4", used: 72000 },
  { day: "7/5", used: 81000 }, { day: "7/6", used: 76000 },
  { day: "7/7", used: 84000 },
];

const userGrowth = [
  { month: "2월", users: 142, ws: 89 }, { month: "3월", users: 178, ws: 112 },
  { month: "4월", users: 201, ws: 134 }, { month: "5월", users: 234, ws: 156 },
  { month: "6월", users: 261, ws: 178 }, { month: "7월", users: 284, ws: 156 },
];

const gpuOccupancy = [
  { name: "H100 SXM5", occupied: 24, free: 8, total: 32 },
  { name: "A100 SXM4", occupied: 36, free: 12, total: 48 },
  { name: "RTX A5000", occupied: 33, free: 15, total: 48 },
];

const storageDist = [
  { name: "Local Storage",  value: 110,  color: BLUE    },
  { name: "Volume Storage", value: 498,  color: PRIMARY },
  { name: "Shared Storage", value: 1700, color: GREEN   },
];

// ─── SVG Donut for storage distribution (no recharts clipping) ───────────────
function StorageDonut({ data, total, size }: { data: { name: string; value: number; color: string }[]; total: number; size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.37;
  const sw = size * 0.14;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map(d => {
    const len = (d.value / total) * circ;
    const seg = { ...d, dashOffset: offset, dashLen: Math.max(0, len - 2) };
    offset += len;
    return seg;
  });
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ display: "block" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={GRAY_5} strokeWidth={sw} />
          {segments.map((seg, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={sw}
              strokeDasharray={`${seg.dashLen} ${circ - seg.dashLen}`}
              strokeDashoffset={-seg.dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: size * 0.1, color: GRAY_60 }}>전체</div>
          <div style={{ fontSize: size * 0.15, fontWeight: 800, color: GRAY_90, lineHeight: 1.1 }}>{(total / 1000).toFixed(1)}</div>
          <div style={{ fontSize: size * 0.09, color: GRAY_60 }}>TB</div>
        </div>
      </div>
    </div>
  );
}

const adminAlerts: { msg: string; time: string; level: "info" | "warning" | "critical" }[] = [
  { msg: "RTX A6000 GPU 타입 전체 슬롯이 점유되어 신규 서버 배포가 불가합니다.", time: "18분 전",  level: "critical" },
  { msg: "ML Research Lab의 크레딧 사용량이 롤링 기준 대비 200% 초과했습니다.",    time: "42분 전",  level: "critical" },
  { msg: "abuse-server-01이 72시간 이상 연속 실행 중입니다.",                    time: "1시간 전", level: "warning"  },
  { msg: "새로운 워크스페이스 'Team Beta'가 생성되었습니다.",                     time: "2시간 전", level: "info"     },
];

const CreditUsageTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: `1px solid ${GRAY_30}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: GRAY_60, marginBottom: 4 }}>{label}</div>
      <div style={{ color: GREEN, fontWeight: 700 }}>크레딧 사용: {payload[0]?.value.toLocaleString()} cr</div>
    </div>
  );
};

const ServerTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: `1px solid ${GRAY_30}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: GRAY_60, marginBottom: 4 }}>{label}</div>
      <div style={{ color: PRIMARY, fontWeight: 700 }}>활성: {payload[0]?.value}개</div>
      <div style={{ color: GRAY_40, fontWeight: 600 }}>정지: {payload[1]?.value}개</div>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export function AdminDashboard() {
  const totalStorage = storageDist.reduce((s, d) => s + d.value, 0);

  return (
    <PageContainer
      title="Admin Dashboard"
      subtitle="서비스 전체 현황을 실시간 모니터링합니다."
      actions={
        <span style={{ fontSize: 12, color: GRAY_60 }}>마지막 업데이트 · 2026년 7월 13일 14:32</span>
      }
    >
      {/* ── KPI 4종 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <MetricCard label="활성 사용자" value="284" icon={<Users size={18} />} color={YELLOW} trend={{ up: true, text: "전일 대비 +4명" }} />
        <MetricCard label="활성 서버" value="47" icon={<Server size={18} />} color={PRIMARY} trend={{ up: true, text: "전일 대비 +3개" }} />
        <MetricCard label="GPU 점유율" value="73%" icon={<Cpu size={18} />} color={BLUE} trend={{ up: true, text: "전일 대비 +5%p" }} />
        <MetricCard label="오늘 크레딧 사용" value="84,000 cr" icon={<CreditCard size={18} />} color={GREEN} trend={{ up: true, text: "전일 대비 +10%" }} />
      </div>

      {/* ── Row 1: 서버 추이 + 매출 추이 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* 서버 수 추이 */}
        <SectionCard title="서버 수 추이" subtitle="최근 7일 활성/정지 서버 현황">
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={serverTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ServerTooltip />} />
              <Area type="monotone" dataKey="active" stroke={PRIMARY} strokeWidth={2} fill="url(#activeGrad)" name="활성" />
              <Area type="monotone" dataKey="stopped" stroke={GRAY_40} strokeWidth={1.5} fill="none" strokeDasharray="4 2" name="정지" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* 크레딧 사용 추이 */}
        <SectionCard title="일별 크레딧 사용 추이" subtitle="최근 7일 크레딧 사용 현황">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={creditUsageTrend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CreditUsageTooltip />} />
              <Bar dataKey="used" fill={GREEN} radius={[4, 4, 0, 0]} name="크레딧 사용" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Row 2: GPU 점유율 (가로 바) + 사용자 성장 추이 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* GPU 점유율 */}
        <SectionCard title="GPU 유형별 점유율" subtitle="전체 가용 GPU 128개">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {gpuOccupancy.map(gpu => {
              const pct = Math.round(gpu.occupied / gpu.total * 100);
              const barColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
              return (
                <div key={gpu.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: barColor }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>{gpu.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: GRAY_70 }}>
                      <span style={{ fontWeight: 700, color: barColor }}>{gpu.occupied}</span>
                      <span style={{ color: GRAY_40 }}>/{gpu.total} GPU</span>
                    </div>
                  </div>
                  <div style={{ height: 10, backgroundColor: GRAY_5, borderRadius: 5, overflow: "hidden", display: "flex" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: barColor, borderRadius: 5, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 10, color: GRAY_60 }}>
                    <span>{pct}% 점유 · 여유 {gpu.free}개</span>
                    <span style={{ color: pct >= 90 ? RED : pct >= 70 ? YELLOW : GRAY_60 }}>
                      {pct >= 90 ? "⚠ 포화 임박" : pct === 0 ? "비활성" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 사용자 & 워크스페이스 성장 */}
        <SectionCard title="사용자 · 워크스페이스 성장" subtitle="최근 6개월 누적 기준">
          <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: PRIMARY, display: "inline-block" }} />사용자</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: GREEN, display: "inline-block" }} />워크스페이스</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={userGrowth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number, name: string) => [v, name === "users" ? "사용자" : "워크스페이스"]} />
              <Line type="monotone" dataKey="users" stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 4, fill: PRIMARY }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="ws" stroke={GREEN} strokeWidth={2} dot={{ r: 3, fill: GREEN }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Row 3: 알림 + 스토리지 분포 + 결제 현황 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
        {/* 알림 피드 */}
        <ListCard title="최근 알림" action={<Badge color="danger">2 Critical</Badge>}>
          {adminAlerts.map((a, i) => {
            const lvMeta = {
              info:     { label: "Info",     color: BLUE,    bg: "rgba(36,142,213,0.1)"  },
              warning:  { label: "Warning",  color: YELLOW,  bg: "rgba(234,179,8,0.1)"   },
              critical: { label: "Critical", color: RED,     bg: "rgba(239,68,68,0.1)"   },
            }[a.level];
            return (
              <div key={i} style={{
                padding: "12px 20px", display: "flex", gap: 12, cursor: "pointer",
                borderBottom: i < adminAlerts.length - 1 ? `1px solid rgb(248,248,248)` : "none",
                backgroundColor: a.level === "critical" ? "rgb(255,252,252)" : "white",
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = GRAY_5)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = a.level === "critical" ? "rgb(255,252,252)" : "white")}>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: lvMeta.color, backgroundColor: lvMeta.bg, flexShrink: 0, alignSelf: "flex-start" }}>
                  {lvMeta.label}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 12, color: GRAY_70 }}>{a.msg}</span>
                    <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap", flexShrink: 0 }}>{a.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </ListCard>

        {/* 스토리지 분포 */}
        <SectionCard title="스토리지 분포" subtitle={`총 ${(totalStorage / 1000).toFixed(1)} TB`}>
          {/* SVG donut — no recharts clipping */}
          <StorageDonut data={storageDist} total={totalStorage} size={110} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {storageDist.map(d => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: d.color }} />
                  <span style={{ color: GRAY_70 }}>{d.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: GRAY_90 }}>{d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}TB` : `${d.value}GB`}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 오늘 크레딧 현황 */}
        <SectionCard title="오늘 크레딧 현황">
          {[
            { label: "관리자 지급", value: "3건", amount: "+32,000 cr", color: GREEN, icon: "↑" },
            { label: "관리자 회수", value: "1건", amount: "-5,000 cr",  color: RED,   icon: "↓" },
          ].map(({ label, value, amount, color, icon }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid rgb(248,248,248)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color, fontWeight: 700 }}>{icon}</div>
                <span style={{ fontSize: 13, color: GRAY_70 }}>{label}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>{value}</div>
                <div style={{ fontSize: 11, color: GRAY_60 }}>{amount}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: PRIMARY_10, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: GRAY_60 }}>순 지급 (지급 - 회수)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, marginTop: 2 }}>+27,000 cr</div>
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: {
  title: string; message: React.ReactNode; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "white", borderRadius: 14, padding: "28px 32px", width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: GRAY_90, marginBottom: 16 }}>{title}</div>
        <div style={{ height: 1, backgroundColor: GRAY_10, marginBottom: 20 }} />
        <div style={{ fontSize: 14, color: GRAY_70, lineHeight: 1.7, marginBottom: 28 }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onCancel} style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY_30}`, backgroundColor: "white", color: GRAY_70, cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>취소</button>
          <button type="button" onClick={onConfirm} style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", backgroundColor: RED, color: "white", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Workspace tooltip (for user management table) ───────────────────────────
function WsTooltip({ names }: { names: string[] }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: GRAY_10, border: `1px solid ${GRAY_30}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: GRAY_60, cursor: "default", userSelect: "none" as const }}>i</span>
      {show && (
        <div style={{ position: "absolute", left: "50%", bottom: "calc(100% + 6px)", transform: "translateX(-50%)", backgroundColor: GRAY_90, borderRadius: 6, padding: "6px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.18)", zIndex: 300, whiteSpace: "nowrap", minWidth: 120 }}>
          {names.map((n, i) => (
            <div key={i} style={{ fontSize: 11, color: "white", lineHeight: "18px" }}>{n}</div>
          ))}
          <div style={{ position: "absolute", left: "50%", top: "100%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `5px solid ${GRAY_90}` }} />
        </div>
      )}
    </div>
  );
}

// ─── User Management ──────────────────────────────────────────────────────────
export function AdminUserManagement() {
  const allUsers = [
    { name: "지염염", email: "yeomeyeom.ji@sdt.inc", joined: "2026-01-15", workspaces: 2, workspaceNames: ["My Workspace", "ML Research Lab"], servers: 2, status: "active", lastLogin: "오늘 09:42", usedCr: 12450, totalCr: 45230, role: "owner" },
    { name: "이지현", email: "jihyun.lee@sdt.inc", joined: "2026-02-20", workspaces: 1, workspaceNames: ["Team Alpha"], servers: 5, status: "active", lastLogin: "어제 18:30", usedCr: 28600, totalCr: 120500, role: "admin" },
    { name: "김태민", email: "taemin.kim@sdt.inc", joined: "2026-03-10", workspaces: 1, workspaceNames: ["ML Research Lab"], servers: 1, status: "active", lastLogin: "2일 전", usedCr: 4200, totalCr: 8200, role: "user" },
    { name: "최유진", email: "yujin.choi@sdt.inc", joined: "2026-04-05", workspaces: 1, workspaceNames: ["Old Project"], servers: 0, status: "inactive", lastLogin: "14일 전", usedCr: 0, totalCr: 1000, role: "user" },
    { name: "장민준", email: "minjun.jang@sdt.inc", joined: "2026-05-22", workspaces: 1, workspaceNames: ["My Workspace"], servers: 1, status: "active", lastLogin: "오늘 14:15", usedCr: 3100, totalCr: 9800, role: "user" },
  ];
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);
  const [selectedUser, setSelectedUser] = useState<typeof allUsers[0] | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<typeof allUsers[0] | null>(null);
  const [deactivatedEmails, setDeactivatedEmails] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const effectiveUserStatus = (u: typeof allUsers[0]) => deactivatedEmails.has(u.email) ? "inactive" : u.status;
  const roleOrder: Record<string, number> = { owner: 0, admin: 1, user: 2 };
  const users = [...allUsers]
    .filter(u => filterStatus === "All" || effectiveUserStatus(u) === filterStatus)
    .filter(u => !search || u.name.includes(search) || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      if (sortKey === "name")            { va = a.name;         vb = b.name; }
      else if (sortKey === "role")       { va = roleOrder[a.role] ?? 2; vb = roleOrder[b.role] ?? 2; }
      else if (sortKey === "status")     { va = effectiveUserStatus(a); vb = effectiveUserStatus(b); }
      else if (sortKey === "workspaces") { va = a.workspaces;   vb = b.workspaces; }
      else if (sortKey === "servers")    { va = a.servers;      vb = b.servers; }
      else if (sortKey === "credits")    { va = a.totalCr;      vb = b.totalCr; }
      else if (sortKey === "joined")     { va = a.joined;       vb = b.joined; }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const roleTextColor = (role: string) => role === "owner" ? PRIMARY : role === "admin" ? "rgb(180,80,0)" : GRAY_60;
  const roleBgColor   = (role: string) => role === "owner" ? PRIMARY_10 : role === "admin" ? "rgb(255,246,230)" : GRAY_5;
  const roleLabel = (role: string) => role === "owner" ? "Owner" : role === "admin" ? "Admin" : "User";

  return (
    <>
    <PageContainer title="User Management" subtitle="전체 사용자 목록을 조회하고 관리합니다." actions={<PrimaryBtn size="small"><Plus size={14} /> 사용자 초대</PrimaryBtn>}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
          전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{users.length}</span>명
          {(filterStatus !== "All" || search) && <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}> / {allUsers.length}명 중</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder="검색어를 입력하세요." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: 220, height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${search ? PRIMARY : GRAY_30}`, fontSize: 12, color: GRAY_90, outline: "none", boxSizing: "border-box" as const }} />
          </div>
          <div style={{ position: "relative" }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ height: 34, paddingLeft: 10, paddingRight: 26, border: `1px solid ${filterStatus !== "All" ? PRIMARY : GRAY_30}`, borderRadius: 8, fontSize: 12, color: filterStatus !== "All" ? PRIMARY : GRAY_70, fontFamily: "inherit", fontWeight: filterStatus !== "All" ? 600 : 400, backgroundColor: filterStatus !== "All" ? PRIMARY_10 : "white", outline: "none", cursor: "pointer", appearance: "none" as const }}>
              {[["All", "상태"], ["active", "활성"], ["inactive", "비활성"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={11} color={filterStatus !== "All" ? PRIMARY : GRAY_60} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* User table */}
      <Card style={{ overflow: "hidden" }}>
        <Table
          spacerGaps
          headers={[
            <SortableHeader k="name" label="Name / Email" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="workspaces" label="Workspaces" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="credits" label="Credit Usage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            "Last Login",
            <SortableHeader k="joined" label="Joined" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            "Actions",
          ]}
          rows={users.map(u => {
            const creditLow = (u.totalCr - u.usedCr) < 5000;
            const avatarBg = u.role === "owner" ? PRIMARY : u.role === "admin" ? "rgb(255,206,107)" : GRAY_10;
            const avatarFg = u.role === "owner" ? "white" : u.role === "admin" ? "white" : GRAY_60;
            return [
              /* 이름/이메일 */
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: avatarBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: avatarFg }}>{u.name[0]}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: GRAY_60 }}>{u.email}</div>
                </div>
              </div>,
              /* 상태 */
              <Badge color={u.status === "active" ? "success" : "neutral"}>{u.status === "active" ? "활성" : "비활성"}</Badge>,
              /* 워크스페이스 */
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Layers size={12} color={GRAY_40} />
                <span style={{ fontWeight: 600, color: GRAY_90 }}>{u.workspaces}</span>
                <WsTooltip names={u.workspaceNames} />
              </div>,
              /* 이달 크레딧 사용 */
              <span style={{ fontSize: 12, color: GRAY_90, whiteSpace: "nowrap" }}>{u.usedCr.toLocaleString()} cr</span>,
              /* 최근 로그인 */
              <span style={{ fontSize: 12, color: GRAY_60, whiteSpace: "nowrap" }}>{u.lastLogin}</span>,
              /* 가입일 */
              <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" }}>{u.joined}</span>,
              /* 액션 */
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button type="button" onClick={() => setSelectedUser(u)} style={{ height: 36, padding: "0 14px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                <div style={{ position: "relative" }}>
                  {openMenuId === u.email && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                  <button type="button" onClick={(e) => { if (openMenuId !== u.email) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === u.email ? null : u.email); }}
                    style={{ height: 36, fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === u.email ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                    onMouseEnter={e => { if (openMenuId !== u.email) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                    onMouseLeave={e => { if (openMenuId !== u.email) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                    <span style={{ padding: "0 10px 0 12px" }}>관리</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === u.email ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 8px", borderLeft: `1px solid ${openMenuId === u.email ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                      <ChevronDown size={12} color={PRIMARY} style={{ transform: openMenuId === u.email ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </span>
                  </button>
                  {openMenuId === u.email && menuAnchor && (
                    <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 130, padding: "4px 0" }}>
                      {effectiveUserStatus(u) === "active"
                        ? <button type="button" onClick={() => { setOpenMenuId(null); setDeactivatingUser(u); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>비활성화</button>
                        : <button type="button" onClick={() => setOpenMenuId(null)} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>활성화</button>
                      }
                    </div>
                  )}
                </div>
              </div>,
            ];
          })}
        />
      </Card>
      {selectedUser && (
        <>
          <div onClick={() => setSelectedUser(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{selectedUser.name} 상세 정보</span>
              <button type="button" onClick={() => setSelectedUser(null)} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>닫기</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>기본 정보</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 14, columnGap: 20 }}>
                  {[
                    { label: "이름", value: selectedUser.name },
                    { label: "이메일", value: selectedUser.email },
                    { label: "역할", value: <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 99, backgroundColor: roleBgColor(selectedUser.role), color: roleTextColor(selectedUser.role) }}>{roleLabel(selectedUser.role)}</span> },
                    { label: "상태", value: <Badge color={selectedUser.status === "active" ? "success" : "neutral"}>{selectedUser.status === "active" ? "활성" : "비활성"}</Badge> },
                    { label: "가입일", value: selectedUser.joined },
                    { label: "최근 로그인", value: selectedUser.lastLogin },
                    { label: "워크스페이스", value: `${selectedUser.workspaces}개` },
                    { label: "서버", value: `${selectedUser.servers}개` },
                    { label: "이달 사용 크레딧", value: `${selectedUser.usedCr.toLocaleString()} cr` },
                    { label: "보유 크레딧", value: `${selectedUser.totalCr.toLocaleString()} cr` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </section>
              {selectedUser.workspaceNames.length > 0 && (
                <section>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>소속 워크스페이스</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedUser.workspaceNames.map(name => (
                      <span key={name} style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 8, backgroundColor: PRIMARY_10, color: PRIMARY }}>{name}</span>
                    ))}
                  </div>
                </section>
              )}
              <section style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>관리</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {selectedUser.status === "active"
                    ? <button type="button" onClick={() => setSelectedUser(null)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>비활성화</button>
                    : <button type="button" onClick={() => setSelectedUser(null)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>활성화</button>
                  }
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </PageContainer>
    {deactivatingUser && (
      <ConfirmModal
        title="사용자 비활성화 확인"
        message={<span>사용자 <strong style={{ color: GRAY_90 }}>{deactivatingUser.name}</strong> ({deactivatingUser.email}) 계정을 비활성화하시겠습니까?<br /><br />비활성화 즉시 로그인이 차단되며, 운영 중인 모든 서버가 일시 중지됩니다. 비활성화는 언제든 관리자가 되돌릴 수 있습니다.</span>}
        confirmLabel="비활성화"
        onConfirm={() => { setDeactivatedEmails(prev => new Set([...prev, deactivatingUser.email])); setDeactivatingUser(null); }}
        onCancel={() => setDeactivatingUser(null)}
      />
    )}
    </>
  );
}

// ─── Workspace Management ─────────────────────────────────────────────────────
export function AdminWorkspaceManagement({ onDetail }: { onDetail: () => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);
  const [deactivatingWs, setDeactivatingWs] = useState<{ name: string; wsId: string } | null>(null);
  const [deactivatedWsIds, setDeactivatedWsIds] = useState<Set<string>>(new Set());

  const allWorkspaces = [
    { name: "My Workspace",   wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", members: 5, servers: 4,  credits: 45230,  status: "active",   rate: 120, createdAt: "2026-01-15 10:30:22", lastActivity: "오늘 09:42" },
    { name: "Team Alpha",     wsId: "ws-d7e9a1b5", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc",   members: 8, servers: 12, credits: 120500, status: "active",   rate: 480, createdAt: "2026-02-20 14:05:47", lastActivity: "오늘 14:15" },
    { name: "ML Research Lab",wsId: "ws-c2f4d8e3", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc",   members: 3, servers: 2,  credits: 8200,   status: "active",   rate: 48,  createdAt: "2026-03-10 09:12:33", lastActivity: "2일 전" },
    { name: "Old Project",    wsId: "ws-b6a9c7d4", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc",   members: 1, servers: 0,  credits: 1000,   status: "inactive", rate: 0,   createdAt: "2026-04-05 16:48:09", lastActivity: "14일 전" },
  ];

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const effectiveWsStatus = (w: typeof allWorkspaces[0]) => deactivatedWsIds.has(w.wsId) ? "inactive" : w.status;
  const workspaces = [...allWorkspaces]
    .filter(w => filterStatus === "All" || effectiveWsStatus(w) === filterStatus)
    .filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.owner.includes(search))
    .sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      if (sortKey === "name")    { va = a.name;    vb = b.name; }
      else if (sortKey === "owner")   { va = a.owner;   vb = b.owner; }
      else if (sortKey === "status")  { va = effectiveWsStatus(a); vb = effectiveWsStatus(b); }
      else if (sortKey === "members") { va = a.members; vb = b.members; }
      else if (sortKey === "servers") { va = a.servers; vb = b.servers; }
      else if (sortKey === "credits")      { va = a.credits;      vb = b.credits; }
      else if (sortKey === "rate")         { va = a.rate;         vb = b.rate; }
      else if (sortKey === "createdAt")    { va = a.createdAt;    vb = b.createdAt; }
      else if (sortKey === "lastActivity") { va = a.lastActivity; vb = b.lastActivity; }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <>
    <PageContainer title="Workspace Management" subtitle="전체 워크스페이스를 조회하고 관리합니다.">
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
          전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{workspaces.length}</span>개
          {(filterStatus !== "All" || search) && <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}> / {allWorkspaces.length}개 중</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder="검색어를 입력하세요." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: 240, height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${search ? PRIMARY : GRAY_30}`, fontSize: 12, color: GRAY_90, outline: "none", boxSizing: "border-box" as const }} />
          </div>
          <div style={{ position: "relative" }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ height: 34, paddingLeft: 10, paddingRight: 26, border: `1px solid ${filterStatus !== "All" ? PRIMARY : GRAY_30}`, borderRadius: 8, fontSize: 12, color: filterStatus !== "All" ? PRIMARY : GRAY_70, fontFamily: "inherit", fontWeight: filterStatus !== "All" ? 600 : 400, backgroundColor: filterStatus !== "All" ? PRIMARY_10 : "white", outline: "none", cursor: "pointer", appearance: "none" as const }}>
              {[["All", "상태"], ["active", "활성"], ["inactive", "비활성"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={11} color={filterStatus !== "All" ? PRIMARY : GRAY_60} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <Card style={{ overflow: "hidden" }}>
        <Table
          spacerGaps
          headers={[
            <SortableHeader k="name" label="Workspace" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="owner" label="Owner" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="members" label="Members" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="credits" label="Credit Balance" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="createdAt" label="생성 일시" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            <SortableHeader k="lastActivity" label="Last Activity" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
            "Actions",
          ]}
          rows={workspaces.map(w => {
            const isLow = w.credits < 5000;
            return [
              /* Workspace */
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: w.status === "active" ? PRIMARY_10 : GRAY_10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={13} color={w.status === "active" ? PRIMARY : GRAY_40} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: GRAY_60, marginTop: 1 }}>{w.wsId}</div>
                </div>
              </div>,
              /* 상태 */
              <Badge color={w.status === "active" ? "success" : "neutral"}>{w.status === "active" ? "활성" : "비활성"}</Badge>,
              /* Owner */
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{w.owner}</div>
                <div style={{ fontSize: 11, color: GRAY_60 }}>{w.ownerEmail}</div>
              </div>,
              /* 멤버 */
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={12} color={GRAY_40} />
                <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{w.members}</span>
              </div>,
              /* 크레딧 잔액 */
              <span style={{ fontSize: 12, color: isLow ? RED : GRAY_90, fontWeight: 600 }}>{w.credits.toLocaleString()} cr</span>,
              /* 생성 일시 */
              <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" as const }}>{w.createdAt}</span>,
              /* 마지막 활동 */
              <span style={{ fontSize: 12, color: w.status === "inactive" ? GRAY_40 : GRAY_70, whiteSpace: "nowrap" as const }}>{w.lastActivity}</span>,
              /* 액션 */
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button type="button" onClick={onDetail} style={{ height: 36, padding: "0 14px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                <div style={{ position: "relative" }}>
                  {openMenuId === w.wsId && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                  <button type="button" onClick={(e) => { if (openMenuId !== w.wsId) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === w.wsId ? null : w.wsId); }}
                    style={{ height: 36, fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === w.wsId ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                    onMouseEnter={e => { if (openMenuId !== w.wsId) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                    onMouseLeave={e => { if (openMenuId !== w.wsId) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                    <span style={{ padding: "0 10px 0 12px" }}>관리</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === w.wsId ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 8px", borderLeft: `1px solid ${openMenuId === w.wsId ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                      <ChevronDown size={12} color={PRIMARY} style={{ transform: openMenuId === w.wsId ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </span>
                  </button>
                  {openMenuId === w.wsId && menuAnchor && (
                    <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 140, padding: "4px 0" }}>
                      <button type="button" onClick={() => setOpenMenuId(null)} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>크레딧 관리</button>
                      <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                      {effectiveWsStatus(w) === "active"
                        ? <button type="button" onClick={() => { setOpenMenuId(null); setDeactivatingWs({ name: w.name, wsId: w.wsId }); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>비활성화</button>
                        : <button type="button" onClick={() => setOpenMenuId(null)} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>활성화</button>
                      }
                    </div>
                  )}
                </div>
              </div>,
            ];
          })}
        />
      </Card>
    </PageContainer>
    {deactivatingWs && (
      <ConfirmModal
        title="워크스페이스 비활성화 확인"
        message={<span>워크스페이스 <strong style={{ color: GRAY_90 }}>{deactivatingWs.name}</strong>을(를) 비활성화하시겠습니까?<br /><br />비활성화 즉시 모든 멤버의 접근이 차단되며, 운영 중인 서버가 일시 중지됩니다. 비활성화는 언제든 관리자가 되돌릴 수 있습니다.</span>}
        confirmLabel="비활성화"
        onConfirm={() => { setDeactivatedWsIds(prev => new Set([...prev, deactivatingWs.wsId])); setDeactivatingWs(null); }}
        onCancel={() => setDeactivatingWs(null)}
      />
    )}
    </>
  );
}


export function AdminWorkspaceDetail({ onBack }: { onBack: () => void }) {
  return <WorkspacePage hideTabs={["Settings"]} onBack={onBack} />;
}

// ─── Server Management ────────────────────────────────────────────────────────
export function AdminServerManagement({ initialTab = "Servers" }: { initialTab?: string }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const allServers = [
    { name: "pytorch-dev-01", workspace: "My Workspace", wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", gpu: "RTX A5000 × 2", status: "running" as const, uptime: "5h 32m", uptimeMin: 332, gpuUtil: 75, flag: false, createdAt: "2026-07-10 09:14:00", lastUsed: null },
    { name: "llm-finetuning", workspace: "Team Alpha", wsId: "ws-d7e9a1b5", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc", gpu: "H100 SXM5 × 4", status: "running" as const, uptime: "2h 15m", uptimeMin: 135, gpuUtil: 93, flag: false, createdAt: "2026-07-10 11:42:17", lastUsed: null },
    { name: "abuse-server-01", workspace: "ML Research Lab", wsId: "ws-c2f4d8e3", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc", gpu: "A100 SXM4 × 8", status: "running" as const, uptime: "72h 11m", uptimeMin: 4331, gpuUtil: 14, flag: true, createdAt: "2026-07-07 22:03:55", lastUsed: null },
    { name: "stable-diffusion", workspace: "My Workspace", wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", gpu: "RTX 4090 × 1", status: "stopped" as const, uptime: "—", uptimeMin: -1, gpuUtil: 0, flag: false, createdAt: "2026-06-28 14:00:31", lastUsed: "2026-07-09 15:30:22" },
    { name: "data-preprocess", workspace: "Team Alpha", wsId: "ws-d7e9a1b5", owner: "장민준", ownerEmail: "minjun.jang@sdt.inc", gpu: "A100 SXM4 × 2", status: "creating" as const, uptime: "—", uptimeMin: -1, gpuUtil: 0, flag: false, createdAt: "2026-07-10 13:05:08", lastUsed: null },
    { name: "old-analysis-01", workspace: "Old Project", wsId: "ws-b6a9c7d4", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc", gpu: "RTX 3080 × 1", status: "stopped" as const, uptime: "—", uptimeMin: -1, gpuUtil: 0, flag: false, createdAt: "2026-06-10 10:00:44", lastUsed: "2026-06-25 17:44:51" },
  ];

  function handleServerSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const servers = [...allServers]
    .filter(s => filterStatus === "All" || s.status === filterStatus)
    .filter(s => {
      const q = search.toLowerCase();
      return !q || [s.name, s.gpu, s.workspace].some(v => v.toLowerCase().includes(q));
    })
    .sort((a, b) => {
    let va: number | string, vb: number | string;
    if (sortKey === "name") { va = a.name; vb = b.name; }
    else if (sortKey === "status") { va = a.status; vb = b.status; }
    else if (sortKey === "workspace") { va = a.workspace; vb = b.workspace; }
    else if (sortKey === "owner") { va = a.owner; vb = b.owner; }
    else if (sortKey === "uptime") { va = a.uptimeMin; vb = b.uptimeMin; }
    else { va = a.createdAt; vb = b.createdAt; }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); setView("list"); }, [initialTab]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);

  // ── Server Templates state ──
  const [view, setView] = useState<"list" | "create-template" | "edit-template">("list");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState([
    { id: "t1", name: "PyTorch LLM 학습", desc: "LLM 학습에 최적화된 PyTorch 기반 템플릿", image: "PyTorch 2.1 + CUDA 12.1", recVram: "80GB+", tmp: 30, hasLocal: true, local: 100, hasShared: false, shared: "", envVars: "WANDB_API_KEY=\nHF_TOKEN=", status: "Public", used: 312, createdAt: "2026-01-20 11:14:33" },
    { id: "t2", name: "Stable Diffusion 생성", desc: "이미지 생성을 위한 Stable Diffusion 템플릿", image: "Stable Diffusion WebUI", recVram: "24GB+", tmp: 20, hasLocal: true, local: 50, hasShared: false, shared: "", envVars: "", status: "Public", used: 198, createdAt: "2026-02-08 09:45:02" },
    { id: "t3", name: "LLaMA 파인튜닝", desc: "H100 기반 대규모 LLM 파인튜닝 전용 템플릿", image: "LLaMA Fine-tuning v2", recVram: "80GB+", tmp: 50, hasLocal: true, local: 200, hasShared: false, shared: "", envVars: "HF_TOKEN=\nWANDB_API_KEY=", status: "Public", used: 145, createdAt: "2026-03-15 14:22:50" },
    { id: "t4", name: "팀 데이터 분석", desc: "공유 스토리지 연결 팀용 데이터 분석 환경", image: "Data Science Pro", recVram: "24GB+", tmp: 10, hasLocal: true, local: 20, hasShared: true, shared: "team-shared-01", envVars: "", status: "Private", used: 87, createdAt: "2026-05-03 16:08:19" },
  ]);
  const blankTpl = { name: "", desc: "", image: "PyTorch 2.1 + CUDA 12.1", recVram: "80GB+", tmp: 20, hasLocal: false, local: 50, hasShared: false, shared: "", envVars: "", status: "Public" };
  const [tplForm, setTplForm] = useState({ ...blankTpl });
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [deletingAdminServer, setDeletingAdminServer] = useState<typeof allServers[0] | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<typeof templates[0] | null>(null);

  const IMAGE_NAMES = ["PyTorch 2.1 + CUDA 12.1", "TensorFlow 2.15", "LLaMA Fine-tuning v2", "Stable Diffusion WebUI", "Legacy GPU Image v1"];

  const fldStyle: React.CSSProperties = { width: "100%", height: 40, padding: "0 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" as const, marginBottom: 0, fontFamily: "inherit" };
  const txaStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" as const, resize: "vertical" as const, fontFamily: "inherit" };

  const renderTemplateForm = (isEdit: boolean) => (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 700 }}>
        <button type="button" onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Server Management</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: "0 0 24px" }}>{isEdit ? "서버 템플릿 수정" : "서버 템플릿 생성"}</h1>

        {/* 기본 정보 */}
        <Card style={{ padding: "24px 28px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 16 }}>기본 정보</div>
          <FormRow label="템플릿 이름" required>
            <input style={fldStyle} placeholder="예: PyTorch LLM 학습" value={tplForm.name} onChange={e => setTplForm(f => ({ ...f, name: e.target.value }))} />
          </FormRow>
          <FormRow label="설명">
            <textarea style={{ ...txaStyle, minHeight: 64 }} placeholder="이 템플릿의 용도를 간단히 설명하세요." value={tplForm.desc} onChange={e => setTplForm(f => ({ ...f, desc: e.target.value }))} />
          </FormRow>
          <FormRow label="기반 이미지" required>
            <select style={{ ...fldStyle, cursor: "pointer" }} value={tplForm.image} onChange={e => setTplForm(f => ({ ...f, image: e.target.value }))}>
              {IMAGE_NAMES.map(name => <option key={name}>{name}</option>)}
            </select>
          </FormRow>
        </Card>

        {/* 권장 리소스 */}
        <Card style={{ padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 16 }}>권장 리소스</div>
          <FormRow label="권장 vRAM" required>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["24GB+", "48GB+", "80GB+", "160GB+"].map(v => (
                  <button type="button" key={v} onClick={() => setTplForm(f => ({ ...f, recVram: v }))} style={{ padding: "6px 14px", borderRadius: 8, border: `2px solid ${tplForm.recVram === v ? PRIMARY : GRAY_30}`, backgroundColor: tplForm.recVram === v ? PRIMARY_10 : "white", color: tplForm.recVram === v ? PRIMARY : GRAY_70, fontSize: 13, fontWeight: tplForm.recVram === v ? 700 : 400, cursor: "pointer" }}>
                    {v}
                  </button>
                ))}
              </div>
              <input style={{ ...fldStyle, width: 120, marginBottom: 0 }} placeholder="직접 입력 (예: 40GB+)" value={tplForm.recVram} onChange={e => setTplForm(f => ({ ...f, recVram: e.target.value }))} />
            </div>
          </FormRow>
          <FormRow label="권장 Local 스토리지 (GB)">
            <input type="number" style={fldStyle} min={10} step={10} value={tplForm.tmp} onChange={e => setTplForm(f => ({ ...f, tmp: Number(e.target.value) }))} />
          </FormRow>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tplForm.hasLocal ? 10 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>권장 Volume 스토리지</div>
              <button type="button" onClick={() => setTplForm(f => ({ ...f, hasLocal: !f.hasLocal }))} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: tplForm.hasLocal ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: tplForm.hasLocal ? 21 : 3 }} />
              </button>
            </div>
            {tplForm.hasLocal && <input type="number" style={fldStyle} min={10} step={10} placeholder="용량 (GB)" value={tplForm.local} onChange={e => setTplForm(f => ({ ...f, local: Number(e.target.value) }))} />}
          </div>
        </Card>

        {/* 하단 버튼 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <PrimaryBtn variant="secondary" onClick={() => setView("list")}>취소</PrimaryBtn>
          <PrimaryBtn onClick={() => {
            if (isEdit && editingTemplateId) {
              setTemplates(ts => ts.map(t => t.id === editingTemplateId ? { ...t, ...tplForm } : t));
            } else {
              const now = new Date(); const p = (n: number) => String(n).padStart(2, "0");
              const nowStr = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
              setTemplates(ts => [...ts, { id: `t${Date.now()}`, ...tplForm, used: 0, createdAt: nowStr }]);
            }
            setView("list");
          }}>{isEdit ? "변경 저장" : "템플릿 생성"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );

  if (view === "create-template") return renderTemplateForm(false);
  if (view === "edit-template") return renderTemplateForm(true);

  return (
    <>
    <PageContainer
      title="Server Management"
      subtitle={tab === "Server Templates" ? "서버 배포에 사용할 템플릿을 등록·수정·관리합니다." : "전체 서버 현황을 조회하고 필요 시 강제 중지합니다."}
      actions={tab === "Server Templates" ? <PrimaryBtn size="small" onClick={() => { setTplForm({ ...blankTpl }); setEditingTemplateId(null); setView("create-template"); }}><Plus size={14} /> 템플릿 생성</PrimaryBtn> : undefined}
    >
      <TabBar tabs={["Servers", "Server Templates"]} active={tab} onChange={setTab} />
      {tab === "Servers" && <>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
          전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{servers.length}</span>개
          {(filterStatus !== "All" || search) && <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}> / {allServers.length}개 중</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder="검색어를 입력하세요." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: 220, height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, outline: "none", boxSizing: "border-box" as const }} />
          </div>
          <div style={{ position: "relative" }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ height: 34, paddingLeft: 10, paddingRight: 26, border: `1px solid ${filterStatus !== "All" ? PRIMARY : GRAY_30}`, borderRadius: 8, fontSize: 12, color: filterStatus !== "All" ? PRIMARY : GRAY_70, fontFamily: "inherit", fontWeight: filterStatus !== "All" ? 600 : 400, backgroundColor: filterStatus !== "All" ? PRIMARY_10 : "white", outline: "none", cursor: "pointer", appearance: "none" as const }}>
              {[["All", "상태"], ["running", "Running"], ["stopped", "Stopped"], ["creating", "Creating"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={11} color={filterStatus !== "All" ? PRIMARY : GRAY_60} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Server table */}
      <Card style={{ overflow: "hidden" }}>
        <Table
          spacerGaps
          headers={[
            <SortableHeader k="name" label="Server" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
            <SortableHeader k="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
            <SortableHeader k="workspace" label="Workspace" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
            <SortableHeader k="owner" label="User" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
            <SortableHeader k="uptime" label="Uptime" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
            <SortableHeader k="createdAt" label="생성 일시" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
            "Actions",
          ]}
          rows={servers.map(s => {
            const isRunning = s.status === "running";
            return [
              /* 서버명 */
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: s.status === "running" ? "rgba(34,197,94,0.1)" : s.status === "creating" ? "rgba(36,142,213,0.1)" : GRAY_10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Server size={13} color={s.status === "running" ? GREEN : s.status === "creating" ? BLUE : GRAY_40} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>{s.gpu}</span>
                </div>
              </div>,
              /* 상태 */
              <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
                <Badge color={s.status === "running" ? "success" : s.status === "creating" ? "info" : "neutral"}>{s.status}</Badge>
                {s.status === "stopped" && s.lastUsed && (
                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>
                    <Clock size={10} color={GRAY_60} />
                    {s.lastUsed}
                  </span>
                )}
              </div>,
              /* Workspace */
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{s.workspace}</div>
                <div style={{ fontSize: 11, color: GRAY_60, marginTop: 1 }}>{s.wsId}</div>
              </div>,
              /* User */
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{s.owner}</div>
                <div style={{ fontSize: 11, color: GRAY_60 }}>{s.ownerEmail}</div>
              </div>,
              /* 업타임 */
              <span style={{ fontSize: 13, color: s.uptime === "—" ? GRAY_40 : GRAY_90, whiteSpace: "nowrap" }}>{s.uptime}</span>,
              /* Created */
              <span style={{ fontSize: 13, color: GRAY_70, whiteSpace: "nowrap" }}>{s.createdAt}</span>,
              /* 액션 */
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button type="button" style={{ height: 36, padding: "0 14px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                {s.status !== "creating" && (
                  <div style={{ position: "relative" }}>
                    {openMenuId === s.name && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                    <button type="button" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); setOpenMenuId(openMenuId === s.name ? null : s.name); }}
                      style={{ height: 36, fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === s.name ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                      onMouseEnter={e => { if (openMenuId !== s.name) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                      onMouseLeave={e => { if (openMenuId !== s.name) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                      <span style={{ padding: "0 10px 0 12px" }}>관리</span>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === s.name ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 8px", borderLeft: `1px solid ${openMenuId === s.name ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                        <ChevronDown size={12} color={PRIMARY} style={{ transform: openMenuId === s.name ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                      </span>
                    </button>
                    {openMenuId === s.name && menuAnchor && (
                      <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 130, padding: "4px 0" }}>
                        {s.status === "stopped" && (
                          <button type="button" onClick={() => setOpenMenuId(null)} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>시작</button>
                        )}
                        {isRunning && (
                          <button type="button" onClick={() => setOpenMenuId(null)} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>중지</button>
                        )}
                        {s.status === "stopped" && (
                          <>
                            <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                            <button type="button" onClick={() => { setOpenMenuId(null); setDeletingAdminServer(s); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>삭제</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>,
            ];
          })}
        />
      </Card>
      </>}

      {/* ── Server Templates ── */}
      {tab === "Server Templates" && (
        <Card style={{ overflow: "hidden" }}>
          <Table
            spacerGaps
            headers={["Template", "Visibility", "Image", "Rec. vRAM", "Rec. Storage", "Uses", "생성 일시", "Actions"]}
            rows={templates.map(t => [
              /* Template */
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 280 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: t.status === "Public" ? PRIMARY_10 : GRAY_10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={13} color={t.status === "Public" ? PRIMARY : GRAY_40} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: GRAY_60 }}>{t.desc}</div>
                </div>
              </div>,
              /* Visibility */
              <Badge color={t.status === "Public" ? "primary" : "neutral"}>{t.status === "Public" ? "Public" : "Private"}</Badge>,
              /* Image */
              <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" }}>{t.image}</span>,
              /* Rec. vRAM */
              <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{t.recVram}</span>,
              /* Storage */
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, color: GRAY_70, whiteSpace: "nowrap" }}>Local <strong style={{ color: GRAY_90 }}>{t.tmp}GB</strong></span>
                {t.hasLocal && <span style={{ fontSize: 11, color: GRAY_70, whiteSpace: "nowrap" }}>Volume <strong style={{ color: GRAY_90 }}>{t.local}GB</strong></span>}
              </div>,
              /* Uses */
              <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{t.used.toLocaleString()}</span>,
              /* 생성 일시 */
              <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" }}>{(t as any).createdAt ?? "—"}</span>,
              /* Actions */
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button type="button" onClick={() => setSelectedTemplate(t)} style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                <div style={{ position: "relative" }}>
                  {openMenuId === t.id && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                  <button type="button" onClick={(e) => { if (openMenuId !== t.id) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === t.id ? null : t.id); }}
                    style={{ height: 28, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === t.id ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                    onMouseEnter={e => { if (openMenuId !== t.id) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                    onMouseLeave={e => { if (openMenuId !== t.id) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                    <span style={{ padding: "0 8px 0 10px" }}>관리</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === t.id ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${openMenuId === t.id ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                      <ChevronDown size={11} color={PRIMARY} style={{ transform: openMenuId === t.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </span>
                  </button>
                  {openMenuId === t.id && menuAnchor && (
                    <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 130, padding: "4px 0" }}>
                      <button type="button" onClick={() => { setTplForm({ name: t.name, desc: t.desc, image: t.image, recVram: t.recVram, tmp: t.tmp, hasLocal: t.hasLocal, local: t.local, hasShared: t.hasShared, shared: t.shared, envVars: t.envVars, status: t.status }); setEditingTemplateId(t.id); setView("edit-template"); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>수정</button>
                      {t.status === "Private" && <button type="button" onClick={() => { setTemplates(ts => ts.map(x => x.id === t.id ? { ...x, status: "Public" } : x)); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>공개</button>}
                      {t.status === "Public" && <button type="button" onClick={() => { setTemplates(ts => ts.map(x => x.id === t.id ? { ...x, status: "Private" } : x)); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>비공개</button>}
                      <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                      <button type="button" onClick={() => { setOpenMenuId(null); setDeletingTemplate(t); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>삭제</button>
                    </div>
                  )}
                </div>
              </div>,
            ])}
          />
        </Card>
      )}

      {selectedTemplate && (
        <>
          <div onClick={() => setSelectedTemplate(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{selectedTemplate.name} 상세 정보</span>
              <button type="button" onClick={() => setSelectedTemplate(null)} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>닫기</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>기본 정보</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 14, columnGap: 20 }}>
                  {([
                    { label: "템플릿 이름", value: selectedTemplate.name },
                    { label: "가시성", value: <Badge color={selectedTemplate.status === "Public" ? "primary" : "neutral"}>{selectedTemplate.status}</Badge> },
                    { label: "기반 이미지", value: selectedTemplate.image },
                    { label: "권장 vRAM", value: selectedTemplate.recVram },
                    { label: "생성 일시", value: (selectedTemplate as any).createdAt ?? "—" },
                    { label: "사용 횟수", value: `${selectedTemplate.used.toLocaleString()}회` },
                  ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </section>
              {selectedTemplate.desc && (
                <section>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>설명</div>
                  <div style={{ fontSize: 13, color: GRAY_70, lineHeight: 1.6 }}>{selectedTemplate.desc}</div>
                </section>
              )}
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>스토리지 설정</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: GRAY_60 }}>Local 스토리지</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{selectedTemplate.tmp} GB</span>
                  </div>
                  {selectedTemplate.hasLocal && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: GRAY_60 }}>Volume 스토리지</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{selectedTemplate.local} GB</span>
                    </div>
                  )}
                  {selectedTemplate.hasShared && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: GRAY_60 }}>공유 스토리지</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{selectedTemplate.shared}</span>
                    </div>
                  )}
                </div>
              </section>
              {selectedTemplate.envVars && (
                <section>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>환경변수</div>
                  <pre style={{ fontSize: 12, color: GRAY_70, backgroundColor: GRAY_5, borderRadius: 8, padding: "12px 16px", margin: 0, fontFamily: "'Roboto Mono', monospace", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedTemplate.envVars}</pre>
                </section>
              )}
              <section style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>관리</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  <button type="button" onClick={() => { setTplForm({ name: selectedTemplate.name, desc: selectedTemplate.desc, image: selectedTemplate.image, recVram: selectedTemplate.recVram, tmp: selectedTemplate.tmp, hasLocal: selectedTemplate.hasLocal, local: selectedTemplate.local, hasShared: selectedTemplate.hasShared, shared: selectedTemplate.shared, envVars: selectedTemplate.envVars, status: selectedTemplate.status }); setEditingTemplateId(selectedTemplate.id); setView("edit-template"); setSelectedTemplate(null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>수정</button>
                  {selectedTemplate.status === "Private" && <button type="button" onClick={() => { setTemplates(ts => ts.map(x => x.id === selectedTemplate.id ? { ...x, status: "Public" } : x)); setSelectedTemplate(t => t ? { ...t, status: "Public" } : null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>공개</button>}
                  {selectedTemplate.status === "Public" && <button type="button" onClick={() => { setTemplates(ts => ts.map(x => x.id === selectedTemplate.id ? { ...x, status: "Private" } : x)); setSelectedTemplate(t => t ? { ...t, status: "Private" } : null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>비공개</button>}
                  <button type="button" onClick={() => setDeletingTemplate(selectedTemplate)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>삭제</button>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </PageContainer>
    {deletingAdminServer && (
      <ConfirmModal
        title="서버 삭제"
        message={<>서버 <strong>{deletingAdminServer.name}</strong>을(를) 삭제하시겠습니까?<br /><br />삭제 즉시 서버가 종료되며, 로컬 스토리지(임시)의 모든 데이터가 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</>}
        confirmLabel="삭제"
        onConfirm={() => setDeletingAdminServer(null)}
        onCancel={() => setDeletingAdminServer(null)}
      />
    )}
    {deletingTemplate && (
      <ConfirmModal
        title="템플릿 삭제"
        message={<>서버 템플릿 <strong>{deletingTemplate.name}</strong>을(를) 삭제하시겠습니까?<br /><br />이 템플릿을 사용하는 서버 배포가 영향을 받을 수 있습니다. 이 작업은 되돌릴 수 없습니다.</>}
        confirmLabel="삭제"
        onConfirm={() => { setTemplates(ts => ts.filter(x => x.id !== deletingTemplate.id)); if (selectedTemplate?.id === deletingTemplate.id) setSelectedTemplate(null); setDeletingTemplate(null); }}
        onCancel={() => setDeletingTemplate(null)}
      />
    )}
    </>
  );
}

// ─── GPU Type Management ──────────────────────────────────────────────────────
function LabelToggle({ on, labelOn, labelOff, width, onToggle }: { on: boolean; labelOn: string; labelOff: string; width: number; onToggle: () => void }) {
  const thumbSize = 16;
  const pad = 3;
  return (
    <button type="button" onClick={onToggle} style={{ position: "relative", border: "none", cursor: "pointer", backgroundColor: on ? PRIMARY : GRAY_30, borderRadius: 11, height: 22, width, transition: "background 0.2s", flexShrink: 0, display: "inline-block", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
      <span style={{ position: "absolute", fontSize: 9, fontWeight: 700, color: on ? "white" : GRAY_70, letterSpacing: "0.02em", top: "50%", transform: "translateY(-50%)", left: on ? pad + 2 : undefined, right: on ? undefined : pad + 2, pointerEvents: "none", whiteSpace: "nowrap" }}>
        {on ? labelOn : labelOff}
      </span>
      <div style={{ position: "absolute", top: pad, left: on ? width - pad - thumbSize : pad, width: thumbSize, height: thumbSize, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
    </button>
  );
}

function GPUTypesContent({ prices }: { prices: GpuPrice[] }) {
  const gpuTypes = [
    { name: "H100 SXM5", vram: "80GB", occupied: 24, total: 32, capacity: "High",   on: true,  pub: true  },
    { name: "A100 SXM4", vram: "80GB", occupied: 36, total: 48, capacity: "Medium", on: true,  pub: true  },
    { name: "RTX A5000", vram: "24GB", occupied: 33, total: 48, capacity: "Low",    on: true,  pub: true  },
    { name: "RTX 4090",  vram: "24GB", occupied: 0,  total: 16, capacity: "No",     on: false, pub: false },
  ];

  const [gpuList, setGpuList] = useState(gpuTypes);
  const toggleOn  = (name: string) => setGpuList(ts => ts.map(t => t.name === name ? { ...t, on:  !t.on  } : t));
  const togglePub = (name: string) => setGpuList(ts => ts.map(t => t.name === name ? { ...t, pub: !t.pub } : t));
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<typeof gpuList[0] | null>(null);
  const [deactivatingGpu, setDeactivatingGpu] = useState<typeof gpuList[0] | null>(null);

  // spacerGaps-style helpers
  const brd = (light?: boolean) => `1px solid ${light ? "rgb(238,238,238)" : GRAY_10}`;
  const thBase: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left", whiteSpace: "nowrap", width: "1px", borderBottom: `1px solid ${GRAY_10}` };
  const thSp: React.CSSProperties = { borderBottom: `1px solid ${GRAY_10}` };
  const tdBase: React.CSSProperties = { fontSize: 13, color: GRAY_90, verticalAlign: "middle", width: "1px", whiteSpace: "nowrap" };
  const td = (pos: "first"|"mid"|"last", light?: boolean, extra?: React.CSSProperties): React.CSSProperties => ({
    ...tdBase,
    padding: pos === "first" ? "14px 0 14px 16px" : pos === "last" ? "14px 20px 14px 0" : "14px 0",
    borderBottom: brd(light), ...extra,
  });
  const sp = (light?: boolean, bg?: string): React.CSSProperties => ({ borderBottom: brd(light), backgroundColor: bg });

  return (
    <>
      <Card style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: GRAY_5 }}>
            <th style={{ ...thBase, padding: "10px 0 10px 16px" }}>GPU</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>GPU Usage</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>Rate</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>Visibility</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>Status</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 20px 10px 0" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gpuList.map(gpu => {
            const pct = Math.round(gpu.occupied / gpu.total * 100);
            return (
              <tr key={gpu.name}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}
              >
                {/* GPU Type */}
                <td style={{ ...td("first") }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(99,90,220,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Cpu size={13} color={PRIMARY} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{gpu.name}</div>
                      <div style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>VRAM {gpu.vram}</div>
                    </div>
                  </div>
                </td>
                <td style={sp()} />
                {/* GPU Usage */}
                <td style={{ ...td("mid"), minWidth: 160 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: GRAY_70 }}>{gpu.occupied} / {gpu.total} GPU</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 90 ? RED : pct >= 70 ? YELLOW : GRAY_90 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, backgroundColor: GRAY_10, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN, borderRadius: 3 }} />
                  </div>
                </td>
                <td style={sp()} />
                {/* Rate */}
                {(() => {
                  const p = prices.find(p => p.name === gpu.name);
                  return (
                    <td style={{ ...td("mid") }}>
                      {p ? (
                        <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{p.rate} cr / GB / {p.unit}</span>
                      ) : (
                        <Badge color="neutral">미설정</Badge>
                      )}
                    </td>
                  );
                })()}
                <td style={sp()} />
                {/* Visibility */}
                <td style={{ ...td("mid") }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, whiteSpace: "nowrap", backgroundColor: gpu.pub ? "rgba(99,90,220,0.1)" : GRAY_10, color: gpu.pub ? PRIMARY : GRAY_60 }}>{gpu.pub ? "Public" : "Private"}</span>
                </td>
                <td style={sp()} />
                {/* Status */}
                <td style={{ ...td("mid") }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, whiteSpace: "nowrap", backgroundColor: gpu.on ? "rgba(34,197,94,0.1)" : GRAY_10, color: gpu.on ? GREEN : GRAY_60 }}>{gpu.on ? "Active" : "Inactive"}</span>
                </td>
                <td style={sp()} />
                {/* Actions */}
                <td style={{ ...td("last") }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button type="button" onClick={() => setSelectedGpu(gpu)} style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                    <div style={{ position: "relative" }}>
                      {openMenuId === gpu.name && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                      <button type="button" onClick={(e) => { if (openMenuId !== gpu.name) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === gpu.name ? null : gpu.name); }}
                        style={{ height: 28, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === gpu.name ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                        onMouseEnter={e => { if (openMenuId !== gpu.name) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                        onMouseLeave={e => { if (openMenuId !== gpu.name) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                        <span style={{ padding: "0 8px 0 10px" }}>관리</span>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === gpu.name ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${openMenuId === gpu.name ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                          <ChevronDown size={11} color={PRIMARY} style={{ transform: openMenuId === gpu.name ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                        </span>
                      </button>
                      {openMenuId === gpu.name && menuAnchor && (
                        <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 130, padding: "4px 0" }}>
                          {!gpu.pub && <button type="button" onClick={() => { togglePub(gpu.name); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>공개</button>}
                          {gpu.pub && <button type="button" onClick={() => { togglePub(gpu.name); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>비공개</button>}
                          <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                          {gpu.on && <button type="button" onClick={() => { setOpenMenuId(null); setDeactivatingGpu(gpu); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>비활성화</button>}
                          {!gpu.on && <button type="button" onClick={() => { toggleOn(gpu.name); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>활성화</button>}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </Card>
      {selectedGpu && (
        <>
          <div onClick={() => setSelectedGpu(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{selectedGpu.name} 상세 정보</span>
              <button type="button" onClick={() => setSelectedGpu(null)} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>닫기</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>기본 정보</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 14, columnGap: 20 }}>
                  {((): { label: string; value: React.ReactNode }[] => {
                    const p = prices.find(p => p.name === selectedGpu.name);
                    return [
                      { label: "GPU 모델", value: selectedGpu.name },
                      { label: "VRAM", value: selectedGpu.vram },
                      { label: "총 수량", value: `${selectedGpu.total}대` },
                      { label: "점유 중", value: `${selectedGpu.occupied}대` },
                      { label: "가시성", value: <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 99, backgroundColor: selectedGpu.pub ? PRIMARY_10 : GRAY_10, color: selectedGpu.pub ? PRIMARY : GRAY_60 }}>{selectedGpu.pub ? "Public" : "Private"}</span> },
                      { label: "상태", value: <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 99, backgroundColor: selectedGpu.on ? "rgba(34,197,94,0.1)" : GRAY_10, color: selectedGpu.on ? GREEN : GRAY_60 }}>{selectedGpu.on ? "활성" : "비활성"}</span> },
                      { label: "단가", value: p ? `${p.rate} cr / GPU / ${p.unit}` : "미설정" },
                      { label: "용량", value: selectedGpu.capacity },
                    ];
                  })().map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>GPU 사용 현황</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 20px" }}>
                  {(() => {
                    const pct = Math.round(selectedGpu.occupied / selectedGpu.total * 100);
                    const pctColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 13, color: GRAY_70 }}>{selectedGpu.occupied} / {selectedGpu.total} GPU</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: pctColor }}>{pct}%</span>
                        </div>
                        <div style={{ height: 8, backgroundColor: GRAY_10, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pctColor, borderRadius: 4 }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                          <span style={{ fontSize: 11, color: GRAY_60 }}>점유: {selectedGpu.occupied}대</span>
                          <span style={{ fontSize: 11, color: GRAY_60 }}>여유: {selectedGpu.total - selectedGpu.occupied}대</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </section>
              <section style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>관리</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {!selectedGpu.pub && <button type="button" onClick={() => { togglePub(selectedGpu.name); setSelectedGpu(g => g ? { ...g, pub: true } : null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>공개</button>}
                  {selectedGpu.pub && <button type="button" onClick={() => { togglePub(selectedGpu.name); setSelectedGpu(g => g ? { ...g, pub: false } : null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>비공개</button>}
                  {selectedGpu.on && <button type="button" onClick={() => setDeactivatingGpu(selectedGpu)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>비활성화</button>}
                  {!selectedGpu.on && <button type="button" onClick={() => { toggleOn(selectedGpu.name); setSelectedGpu(g => g ? { ...g, on: true } : null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>활성화</button>}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    {deactivatingGpu && (
      <ConfirmModal
        title="GPU Type 비활성화"
        message={<>GPU Type <strong>{deactivatingGpu.name}</strong>을(를) 비활성화하시겠습니까?<br /><br />비활성화 즉시 신규 서버 생성에서 해당 GPU가 표시되지 않습니다. 기존 운영 중인 서버에는 영향을 주지 않습니다. 비활성화는 언제든 관리자가 되돌릴 수 있습니다.</>}
        confirmLabel="비활성화"
        onConfirm={() => { toggleOn(deactivatingGpu.name); if (selectedGpu?.name === deactivatingGpu.name) setSelectedGpu(g => g ? { ...g, on: false } : null); setDeactivatingGpu(null); }}
        onCancel={() => setDeactivatingGpu(null)}
      />
    )}
    </>
  );
}

// ─── Image Management shared styles ───────────────────────────────────────────
const fldStyle: React.CSSProperties = {
  width: "100%", height: 36, padding: "0 11px", borderRadius: 8,
  border: `1px solid ${GRAY_30}`, fontSize: 13, color: GRAY_90,
  outline: "none", boxSizing: "border-box",
};
const txaStyle: React.CSSProperties = {
  width: "100%", padding: "9px 11px", borderRadius: 8,
  border: `1px solid ${GRAY_30}`, fontSize: 13, color: GRAY_90,
  outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
};
function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, marginBottom: 6 }}>
        {label}{required && <span style={{ color: RED, marginLeft: 2 }}>*</span>}
      </div>
      {children}
    </div>
  );
}
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: GRAY_60, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{label}</div>
      <div style={{ flex: 1, height: 1, backgroundColor: GRAY_30 }} />
    </div>
  );
}

// ─── Image Form shared components (module-level for stable references) ───────
function MdEditor({ value, onChange, onFocus, onBlur }: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = value.slice(s, e);
    onChange(value.slice(0, s) + before + sel + after + value.slice(e));
    setTimeout(() => { el.focus(); el.setSelectionRange(s + before.length, e + before.length); }, 0);
  };

  const linePrefix = (text: string) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const ls = value.lastIndexOf("\n", s - 1) + 1;
    onChange(value.slice(0, ls) + text + value.slice(ls));
    setTimeout(() => { el.focus(); el.setSelectionRange(s + text.length, s + text.length); }, 0);
  };

  const insertAt = (text: string) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    onChange(value.slice(0, s) + text + value.slice(s));
    setTimeout(() => { el.focus(); el.setSelectionRange(s + text.length, s + text.length); }, 0);
  };

  const tools: ({ label: string; title: string; action: () => void; mono?: boolean; bold?: boolean; italic?: boolean } | { sep: true })[] = [
    { label: "H1", title: "제목 1", action: () => linePrefix("# ") },
    { label: "H2", title: "제목 2", action: () => linePrefix("## ") },
    { sep: true },
    { label: "B",  title: "굵게",   action: () => wrap("**"), bold: true },
    { label: "I",  title: "기울임", action: () => wrap("*"),  italic: true },
    { sep: true },
    { label: "`",   title: "인라인 코드", action: () => wrap("`"),           mono: true },
    { label: "</>", title: "코드 블록",   action: () => wrap("```\n", "\n```"), mono: true },
    { sep: true },
    { label: "•",  title: "목록",       action: () => linePrefix("- ") },
    { label: "1.", title: "번호 목록",   action: () => linePrefix("1. ") },
    { label: ">",  title: "인용",       action: () => linePrefix("> ") },
    { sep: true },
    { label: "─",  title: "구분선",     action: () => insertAt("\n---\n") },
  ];

  return (
    <div style={{ border: `1px solid ${GRAY_30}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "5px 8px", backgroundColor: GRAY_5, borderBottom: `1px solid ${GRAY_10}`, flexWrap: "wrap" as const }}>
        {tools.map((tool, i) =>
          "sep" in tool ? (
            <div key={i} style={{ width: 1, height: 16, backgroundColor: GRAY_30, margin: "0 3px" }} />
          ) : (
            <button type="button" key={i} title={tool.title} onClick={tool.action}
              style={{ minWidth: 28, height: 26, padding: "0 5px", borderRadius: 5, border: "none", backgroundColor: "transparent", cursor: "pointer",
                fontSize: tool.mono ? 11 : 12, fontWeight: tool.bold ? 700 : 600,
                fontStyle: tool.italic ? "italic" : "normal",
                fontFamily: tool.mono ? "'Roboto Mono', monospace" : "inherit",
                color: GRAY_70, display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; e.currentTarget.style.color = GRAY_90; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GRAY_70; }}
            >{tool.label}</button>
          )
        )}
      </div>
      <textarea
        ref={ref}
        style={{ width: "100%", minHeight: 220, padding: "12px 14px", border: "none", outline: "none",
          resize: "vertical" as const, fontSize: 13, fontFamily: "'Roboto Mono', monospace",
          color: GRAY_90, backgroundColor: "white", boxSizing: "border-box" as const, lineHeight: 1.7, display: "block" }}
        placeholder={"## 이미지 설명\n\n주요 특징을 마크다운으로 작성하세요.\n\n- 특징 1\n- 특징 2"}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

function ImgSecCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)", marginBottom: 20, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderBottom: `1px solid ${GRAY_10}` }}>
        <div style={{ width: 3, height: 14, borderRadius: 99, backgroundColor: PRIMARY, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>{label}</span>
      </div>
      <div style={{ padding: "20px 24px 4px" }}>{children}</div>
    </div>
  );
}

function ImgUploadBox({ file, dragOver, onDragOver, onDragLeave, onDrop, onClick, hint }: {
  file: string | null; dragOver: boolean;
  onDragOver: () => void; onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void; onClick: () => void;
  hint: string;
}) {
  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      style={{
        border: `2px dashed ${dragOver ? PRIMARY : file ? GREEN : GRAY_30}`,
        borderRadius: 12, backgroundColor: dragOver ? PRIMARY_10 : file ? "rgba(34,197,94,0.05)" : GRAY_5,
        padding: "28px 24px", textAlign: "center" as const, transition: "all 0.15s", cursor: "pointer",
      }}
    >
      {file ? (
        <>
          <CheckCircle size={26} color={GREEN} style={{ marginBottom: 7 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: GREEN, marginBottom: 3 }}>{file}</div>
          <div style={{ fontSize: 12, color: GRAY_60 }}>다시 클릭하면 변경할 수 있습니다.</div>
        </>
      ) : (
        <>
          <HardDriveUpload size={26} color={GRAY_40} style={{ marginBottom: 7 }} />
          <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_70, marginBottom: 3 }}>파일을 여기에 드래그하거나 클릭하여 업로드</div>
          <div style={{ fontSize: 12, color: GRAY_60 }}>{hint}</div>
        </>
      )}
    </div>
  );
}

// ─── Image Management ─────────────────────────────────────────────────────────
export function AdminImageManagement({ initialTab = "Image" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const [view, setView] = useState<"list" | "create-image" | "edit-image">("list");
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  useEffect(() => { setTab(initialTab); setView("list"); }, [initialTab]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);

  const syncInfo = { status: "success" as "success" | "failed", lastSyncAt: "2026-07-13 14:30:22", failedAt: null as string | null };
  // 실패 시뮬레이션: { status: "failed", lastSyncAt: "2026-07-13 09:15:44", failedAt: "2026-07-13 09:15:44" }

  // Mock: 이미지별 템플릿 매핑 (실제 서비스에서는 AdminServerManagement의 templates state와 공유)
  const imgTemplates = [
    { id: "t1", name: "PyTorch LLM 학습",      image: "PyTorch 2.1 + CUDA 12.1" },
    { id: "t3", name: "LLaMA 파인튜닝",         image: "LLaMA Fine-tuning v2"    },
    { id: "t2", name: "Stable Diffusion 생성", image: "Stable Diffusion WebUI"  },
    // TensorFlow 2.15 — 템플릿 없음
  ];

  const GPU_OPTIONS = ["RTX A5000", "A100 SXM4", "H100 SXM5", "RTX 4090"];
  const [images, setImages] = useState([
    { id: "i1", name: "PyTorch 2.1 + CUDA 12.1", path: "/pytorch:2.1-cuda12.1", tier: "Official", category: "ML/DL", status: "Public", isFeatured: true,  thumb: "🔵", desc: "PyTorch 2.1과 CUDA 12.1이 사전 설치된 공식 딥러닝 개발 환경.", recGpu: "A100 SXM4", recTmp: 30, recLocal: 100, tags: "PyTorch, CUDA 12.1, JupyterLab", packages: "torch==2.1.0\ntorchvision==0.16\ncuda==12.1\njupyterlab==4.0\nwandb\ntensorboard", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "WANDB_API_KEY, HF_TOKEN", used: 847 },
    { id: "i2", name: "TensorFlow 2.15",           path: "/tensorflow:2.15-cuda12.1",          tier: "Official", category: "ML/DL", status: "Public", isFeatured: false, thumb: "🟡", desc: "TensorFlow 2.15 및 Keras를 포함한 완전한 ML 개발 환경.", recGpu: "RTX A5000", recTmp: 20, recLocal: 50, tags: "TensorFlow, Keras, CUDA", packages: "tensorflow==2.15.0\nkeras==2.15\ncuda==12.1\njupyterlab==4.0", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "", used: 623 },
    { id: "i3", name: "LLaMA Fine-tuning v2",       path: "/llama-finetune:v2",                  tier: "Verified", category: "LLM",  status: "Public", isFeatured: true,  thumb: "🟣", desc: "Meta LLaMA 시리즈 모델을 LoRA/QLoRA로 파인튜닝하기 위한 최적화 환경. 4비트 양자화 지원.", recGpu: "H100 SXM5", recTmp: 50, recLocal: 200, tags: "LLaMA, LoRA, QLoRA, bitsandbytes", packages: "transformers==4.38\npeft==0.8\nbitsandbytes\nacccelerate\ntrl\ndatasets", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "HF_TOKEN, WANDB_API_KEY", used: 412 },
    { id: "i4", name: "Stable Diffusion WebUI",     path: "/sdwebui:latest",                     tier: "Verified", category: "CV",   status: "Public", isFeatured: false, thumb: "🟠", desc: "AUTOMATIC1111 Stable Diffusion WebUI + ControlNet, LoRA 지원.", recGpu: "RTX 4090", recTmp: 20, recLocal: 50, tags: "Stable Diffusion, ControlNet, xFormers", packages: "stable-diffusion-webui\ncontrolnet\nxformers\nCLIP", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "", used: 389 },
  ]);

  const CAT_COLORS = ["#635ADC", "#248ED5", "#22C55E", "#FFB144", "#EF4444", "#A855F7", "#EC4899", "#F97316", "#14B8A6", "#777777"];
  const [categories, setCategories] = useState([
    { id: "c1", name: "ML/DL", desc: "머신러닝·딥러닝 개발 환경", color: "#635ADC", imgCnt: 2 },
    { id: "c2", name: "LLM", desc: "대형 언어 모델 학습 및 추론", color: "#248ED5", imgCnt: 1 },
    { id: "c3", name: "CV", desc: "컴퓨터 비전 및 이미지 처리", color: "#22C55E", imgCnt: 1 },
    { id: "c4", name: "NLP", desc: "자연어 처리", color: "#FFB144", imgCnt: 0 },
    { id: "c5", name: "Data Science", desc: "데이터 분석 및 시각화", color: "#A855F7", imgCnt: 1 },
    { id: "c6", name: "개발환경", desc: "범용 Python·개발 환경", color: "#777777", imgCnt: 1 },
  ]);


  const [tiers, setTiers] = useState([
    { id: "tier-official", name: "Official", color: "#635ADC", desc: "NeuroStack이 직접 관리·검증하는 공식 이미지", imgCnt: 2 },
    { id: "tier-verified", name: "Verified", color: "#22C55E", desc: "커뮤니티 검증을 통과한 신뢰할 수 있는 이미지", imgCnt: 3 },
  ]);
  const TIER_COLORS = ["#635ADC", "#22C55E", "#248ED5", "#FFB144", "#EF4444", "#F97316", "#8B5CF6", "#EC4899", "#14B8A6", "#777777"];
  const blankTierForm = { name: "", desc: "", color: "#635ADC" };
  const [tierDrawer, setTierDrawer] = useState<{ editId: string | null; form: { name: string; desc: string; color: string } } | null>(null);
  const openTierCreate = () => setTierDrawer({ editId: null, form: { ...blankTierForm } });
  const openTierEdit = (t: typeof tiers[0]) => setTierDrawer({ editId: t.id, form: { name: t.name, desc: t.desc, color: t.color } });
  const closeTierDrawer = () => setTierDrawer(null);
  const saveTier = () => {
    if (!tierDrawer) return;
    const { editId, form } = tierDrawer;
    if (editId) {
      setTiers(ts => ts.map(t => t.id === editId ? { ...t, ...form } : t));
    } else {
      setTiers(ts => [...ts, { id: `tier-${Date.now()}`, ...form, imgCnt: 0 }]);
    }
    closeTierDrawer();
  };

  // ── Image form state ──
  const blankImg = { name: "", path: "", desc: "", tier: "Official", category: "ML/DL", status: "Public", thumb: "🔵", recGpu: "A100 SXM4", recTmp: 20, recLocal: 50, tags: "", packages: "", access: ["JupyterLab"] as string[], ports: "8888:JupyterLab", envKeys: "" };
  const [imgForm, setImgForm] = useState({ ...blankImg });
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [imgUploadFile, setImgUploadFile] = useState<string | null>(null);
  const [imgDragOver, setImgDragOver] = useState(false);
  const [imgThumbFile, setImgThumbFile] = useState<string | null>(null);
  const [imgThumbDragOver, setImgThumbDragOver] = useState(false);

  // ── Category drawer state ──
  const blankCatForm = { name: "", desc: "", color: PRIMARY };
  const [catDrawer, setCatDrawer] = useState<{ editId: string | null; form: { name: string; desc: string; color: string } } | null>(null);
  const openCatCreate = () => setCatDrawer({ editId: null, form: { ...blankCatForm } });
  const openCatEdit = (c: typeof categories[0]) => setCatDrawer({ editId: c.id, form: { name: c.name, desc: c.desc, color: c.color } });
  const closeCatDrawer = () => setCatDrawer(null);
  const saveCat = () => {
    if (!catDrawer) return;
    const { editId, form } = catDrawer;
    if (editId) {
      setCategories(cats => cats.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      setCategories(cats => [...cats, { id: `c${Date.now()}`, ...form, imgCnt: 0 }]);
    }
    closeCatDrawer();
  };

  const openCreate = () => {
    setImgForm({ name: "", path: "/", desc: "", tier: "Official", category: "ML/DL", status: "Public", thumb: "🔵", recGpu: "A100 SXM4", recTmp: 20, recLocal: 50, tags: "", packages: "", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "" });
    setEnvVars([{ key: "", value: "" }]);
    setEditingImageId(null);
    setImgUploadFile(null);
    setImgThumbFile(null);
    setView("create-image");
  };

  // ── Image table search / sort state ──
  const toggleStatus  = (id: string) => setImages(imgs => imgs.map(img => img.id === id ? { ...img, status: img.status === "Public" ? "Private" : "Public" } : img));
  // [BACKLOG: Gallery] TrendingUp 아이콘 — Used 상위 3개 이미지에 트렌딩 뱃지 표시
  // const trendingIds = new Set([...images].sort((a, b) => b.used - a.used).slice(0, 3).map(x => x.id));
  // JSX: {trendingIds.has(img.id) && <TrendingUp size={12} color="#22C55E" style={{ flexShrink: 0 }} />}
  // 재도입 시 lucide-react에서 TrendingUp import 복원 필요.

  const [imgSearch, setImgSearch] = useState("");
  const [imgSort, setImgSort] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "used", dir: "desc" });
  const [imgFilterTier, setImgFilterTier] = useState("All");
  const [imgFilterCat, setImgFilterCat] = useState("All");
  const [imgFilterStatus, setImgFilterStatus] = useState("All");
  const [selectedImage, setSelectedImage] = useState<typeof images[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[0] | null>(null);
  const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);
  const [deletingImage, setDeletingImage] = useState<typeof images[0] | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<typeof categories[0] | null>(null);
  const [deletingTier, setDeletingTier] = useState<typeof tiers[0] | null>(null);
  const cycleSort = (col: string) => setImgSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
  const sortIcon = (col: string) => {
    if (imgSort.col !== col) return <ChevronUp size={11} color={GRAY_40} style={{ marginLeft: 3, flexShrink: 0 }} />;
    return imgSort.dir === "asc"
      ? <ChevronUp size={11} color={PRIMARY} style={{ marginLeft: 3, flexShrink: 0 }} />
      : <ChevronDown size={11} color={PRIMARY} style={{ marginLeft: 3, flexShrink: 0 }} />;
  };
  const allTiers = ["All", ...Array.from(new Set(images.map(x => x.tier)))];
  const allCats  = ["All", ...Array.from(new Set(images.map(x => x.category)))];
  const allStatuses = ["All", "Public", "Private"];
  const filteredImgs = (() => {
    const q = imgSearch.trim().toLowerCase();
    let list = images.filter(img => {
      if (q && !(img.name.toLowerCase().includes(q) || img.path.toLowerCase().includes(q) || img.tier.toLowerCase().includes(q) || img.category.toLowerCase().includes(q))) return false;
      if (imgFilterTier !== "All" && img.tier !== imgFilterTier) return false;
      if (imgFilterCat  !== "All" && img.category !== imgFilterCat) return false;
      if (imgFilterStatus !== "All" && img.status !== imgFilterStatus) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let va: string | number = "", vb: string | number = "";
      if (imgSort.col === "name") { va = a.name; vb = b.name; }
      else if (imgSort.col === "tier") { va = a.tier; vb = b.tier; }
      else if (imgSort.col === "category") { va = a.category; vb = b.category; }
      else if (imgSort.col === "used") { va = a.used; vb = b.used; }
      else if (imgSort.col === "access") { va = (a.access?.[0] ?? ""); vb = (b.access?.[0] ?? ""); }
      else if (imgSort.col === "status") { va = a.status; vb = b.status; }
      if (typeof va === "number") return imgSort.dir === "asc" ? va - (vb as number) : (vb as number) - va;
      return imgSort.dir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
    });
    return list;
  })();

  // ── Image table spacerGaps helpers ──
  const imgBrd = (light?: boolean) => `1px solid ${light ? "rgb(238,238,238)" : GRAY_10}`;
  const imgThBase: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left", whiteSpace: "nowrap", width: "1px", borderBottom: `1px solid ${GRAY_10}` };
  const imgThSp: React.CSSProperties = { borderBottom: `1px solid ${GRAY_10}` };
  const imgTdBase: React.CSSProperties = { fontSize: 13, color: GRAY_90, verticalAlign: "middle", width: "1px", whiteSpace: "nowrap" };
  const imgTd = (pos: "first" | "mid" | "last", light?: boolean, extra?: React.CSSProperties): React.CSSProperties => ({
    ...imgTdBase,
    padding: pos === "first" ? "12px 0 12px 16px" : pos === "last" ? "12px 20px 12px 0" : "12px 0",
    borderBottom: imgBrd(light), ...extra,
  });
  const imgSp = (light?: boolean, bg?: string): React.CSSProperties => ({ borderBottom: imgBrd(light), backgroundColor: bg });
  const catColorMap = Object.fromEntries(categories.map(c => [c.name, c.color]));
  const accessColorMap: Record<string, string> = { "JupyterLab": "#248ED5", "VS Code": "#635ADC", "SSH": "#777777", "Terminal": "#22C55E", "복합": "#F97316" };
  const colorChip = (label: string, color: string) => (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, backgroundColor: `${color}18`, color, whiteSpace: "nowrap" }}>{label}</span>
  );

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: on ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: on ? 21 : 3 }} />
    </button>
  );

  // ── Full-page Image Form ──
  const renderImageForm = (isEdit: boolean) => {
    const catOptions = categories.map(c => c.name);
    const fld: React.CSSProperties = {
      width: "100%", height: 40, padding: "0 12px", borderRadius: 8,
      border: `1.5px solid ${GRAY_30}`, fontSize: 13, color: GRAY_90,
      outline: "none", boxSizing: "border-box", backgroundColor: "#ffffff",
    };
    const txa: React.CSSProperties = {
      width: "100%", padding: "10px 12px", borderRadius: 8,
      border: `1.5px solid ${GRAY_30}`, fontSize: 13, color: GRAY_90,
      outline: "none", resize: "vertical", fontFamily: "inherit",
      boxSizing: "border-box", backgroundColor: "#ffffff",
    };
    const onFoc = (e: React.FocusEvent<any>) => {
      e.currentTarget.style.border = `1.5px solid ${PRIMARY}`;
      e.currentTarget.style.boxShadow = `0 0 0 3px ${PRIMARY_10}`;
    };
    const onBlr = (e: React.FocusEvent<any>) => {
      e.currentTarget.style.border = `1.5px solid ${GRAY_30}`;
      e.currentTarget.style.boxShadow = "none";
    };
    const hint = (text: string) => (
      <div style={{ fontSize: 12, color: GRAY_60, marginTop: 5 }}>{text}</div>
    );
    return (
      <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
        <div style={{ maxWidth: 720 }}>
          <button type="button" onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Image Management</button>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0 }}>{isEdit ? "이미지 수정" : "이미지 등록"}</h1>
            <div style={{ fontSize: 13, color: GRAY_60, marginTop: 4 }}>서버 이미지 메타데이터와 접속·환경 정보를 입력하세요.</div>
          </div>

          {/* 1. 이미지 파일 (등록 시에만) */}
          {!isEdit && (
            <ImgSecCard label="이미지 파일">
              <div style={{ paddingBottom: 16 }}>
                <ImgUploadBox
                  file={imgUploadFile} dragOver={imgDragOver}
                  onDragOver={() => setImgDragOver(true)}
                  onDragLeave={() => setImgDragOver(false)}
                  onDrop={e => { const f = e.dataTransfer.files[0]; if (f) { setImgUploadFile(f.name); setImgForm(fm => ({ ...fm, name: fm.name || f.name.replace(/\.(tar\.gz|tar)$/, "") })); } }}
                  onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".tar,.tar.gz"; inp.onchange = (ev: any) => { const f = ev.target.files?.[0]; if (f) { setImgUploadFile(f.name); setImgForm(fm => ({ ...fm, name: fm.name || f.name.replace(/\.(tar\.gz|tar)$/, "") })); } }; inp.click(); }}
                  accept=".tar,.tar.gz"
                  hint=".tar, .tar.gz 포맷 지원"
                />
              </div>
            </ImgSecCard>
          )}

          {/* 2. 기본 정보: 이미지명 → 설명 → 썸네일 */}
          <ImgSecCard label="기본 정보">
            <FormRow label="이미지명" required>
              <input style={fld} placeholder="예: PyTorch 2.1 + CUDA 12.1" value={imgForm.name} onChange={e => setImgForm(f => ({ ...f, name: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("사용자에게 노출되는 이름. 버전과 주요 특징을 포함하세요.")}
            </FormRow>
            <FormRow label="설명">
              <MdEditor value={imgForm.desc} onChange={v => setImgForm(f => ({ ...f, desc: v }))} onFocus={onFoc} onBlur={onBlr} />
            </FormRow>
            <FormRow label="썸네일 이미지">
              <ImgUploadBox
                file={imgThumbFile} dragOver={imgThumbDragOver}
                onDragOver={() => setImgThumbDragOver(true)}
                onDragLeave={() => setImgThumbDragOver(false)}
                onDrop={e => { const f = e.dataTransfer.files[0]; if (f) setImgThumbFile(f.name); }}
                onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = (ev: any) => { const f = ev.target.files?.[0]; if (f) setImgThumbFile(f.name); }; inp.click(); }}
                accept="image/*"
                hint="PNG, JPG, SVG 지원 · 권장 크기 128×128px"
              />
            </FormRow>
          </ImgSecCard>

          {/* 3. 분류: Tier → 카테고리 → 태그 */}
          <ImgSecCard label="분류">
            <FormRow label="Tier">
              <div style={{ display: "flex", gap: 8 }}>
                {tiers.map(t => (
                  <button type="button" key={t.id} onClick={() => setImgForm(f => ({ ...f, tier: t.name }))} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `2px solid ${imgForm.tier === t.name ? t.color : GRAY_30}`, backgroundColor: imgForm.tier === t.name ? `${t.color}15` : "white", cursor: "pointer" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: imgForm.tier === t.name ? t.color : GRAY_70 }}>{t.name}</div>
                  </button>
                ))}
              </div>
            </FormRow>
            <FormRow label="카테고리">
              <select style={{ ...fld, cursor: "pointer" }} value={imgForm.category} onChange={e => setImgForm(f => ({ ...f, category: e.target.value }))} onFocus={onFoc} onBlur={onBlr}>
                {catOptions.map(c => <option key={c}>{c}</option>)}
              </select>
            </FormRow>
            <FormRow label="태그">
              <input style={fld} placeholder="PyTorch, CUDA, JupyterLab" value={imgForm.tags} onChange={e => setImgForm(f => ({ ...f, tags: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("쉼표(,)로 구분. 필터·검색에 활용됩니다.")}
            </FormRow>
          </ImgSecCard>

          {/* 4. 접속 및 런타임: 접속 방식 → 포트 → 환경변수 */}
          <ImgSecCard label="접속 및 런타임">
            <FormRow label="접속 방식">
              <div style={{ display: "flex", gap: 8, alignItems: "center", height: 40 }}>
                <span style={{ padding: "7px 14px", borderRadius: 8, border: `2px solid ${PRIMARY}`, backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600 }}>JupyterLab</span>
              </div>
            </FormRow>
            <FormRow label="포트 정보">
              <input style={fld} placeholder="8888:JupyterLab" value={imgForm.ports} onChange={e => setImgForm(f => ({ ...f, ports: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("포트번호:서비스명 형식으로 쉼표 구분.")}
            </FormRow>
            <FormRow label="환경변수 사용자 입력용">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {envVars.map((ev, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input placeholder="KEY" value={ev.key} onChange={e => setEnvVars(vs => vs.map((v, j) => j === i ? { ...v, key: e.target.value } : v))}
                      style={{ ...fld, flex: 1 }} onFocus={onFoc} onBlur={onBlr} />
                    <span style={{ fontSize: 12, color: GRAY_60, flexShrink: 0 }}>=</span>
                    <input placeholder="value (선택)" value={ev.value} onChange={e => setEnvVars(vs => vs.map((v, j) => j === i ? { ...v, value: e.target.value } : v))}
                      style={{ ...fld, flex: 1 }} onFocus={onFoc} onBlur={onBlr} />
                    <button type="button" onClick={() => setEnvVars(vs => vs.length > 1 ? vs.filter((_, j) => j !== i) : vs)}
                      disabled={envVars.length === 1}
                      style={{ width: 32, height: 40, borderRadius: 8, border: "none", backgroundColor: "transparent", cursor: envVars.length > 1 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: envVars.length > 1 ? 1 : 0.25 }}>
                      <Trash2 size={13} color={GRAY_60} />
                    </button>
                  </div>
                ))}
                <div>
                  <PrimaryBtn size="small" variant="secondary" onClick={() => setEnvVars(vs => [...vs, { key: "", value: "" }])}>
                    <Plus size={13} /> 추가
                  </PrimaryBtn>
                </div>
              </div>
              {hint("서버 생성 시 사용자에게 노출될 환경변수 키와 기본값.")}
            </FormRow>
          </ImgSecCard>

          {/* 5. 주요 패키지 */}
          <ImgSecCard label="주요 패키지">
            <FormRow label="패키지 목록 (줄바꿈으로 구분)">
              <textarea style={{ ...txa, minHeight: 100, fontFamily: "'Roboto Mono', monospace", fontSize: 12 }} placeholder={"torch==2.1.0\ntorchvision==0.16\ncuda==12.1"} value={imgForm.packages} onChange={e => setImgForm(f => ({ ...f, packages: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
            </FormRow>
          </ImgSecCard>

          {/* 6. 공개 여부 */}
          <ImgSecCard label="공개 여부">
            <FormRow label="공개 여부">
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 40 }}>
                <Toggle on={imgForm.status === "Public"} onToggle={() => setImgForm(f => ({ ...f, status: f.status === "Public" ? "Private" : "Public" }))} />
                <span style={{ fontSize: 13, color: imgForm.status === "Public" ? GREEN : GRAY_60, fontWeight: 500 }}>{imgForm.status === "Public" ? "Public (사용자 콘솔 노출)" : "Private (관리자만 접근)"}</span>
              </div>
            </FormRow>
          </ImgSecCard>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingBottom: 28, paddingTop: 8 }}>
            <PrimaryBtn variant="secondary" onClick={() => setView("list")}>취소</PrimaryBtn>
            <PrimaryBtn onClick={() => {
              const envKeys = envVars.filter(ev => ev.key.trim()).map(ev => ev.key.trim()).join(", ");
              const saved = { ...imgForm, envKeys };
              if (isEdit && editingImageId) {
                setImages(imgs => imgs.map(x => x.id === editingImageId ? { ...x, ...saved } : x));
              } else {
                setImages(imgs => [...imgs, { id: `i${Date.now()}`, ...saved, used: 0 }]);
              }
              setView("list");
            }}>{isEdit ? "변경 저장" : "이미지 등록"}</PrimaryBtn>
          </div>
        </div>
      </div>
    );
  };

  if (view === "create-image") return renderImageForm(false);
  if (view === "edit-image") return renderImageForm(true);

  return (
    <>
    <PageContainer
      title="Image Management"
      subtitle="서버 이미지·카테고리·티어를 등록·수정·관리합니다."
      actions={
        tab === "Image"      ? <PrimaryBtn size="small" onClick={() => openCreate()}><Plus size={14} /> 이미지 등록</PrimaryBtn>
        : tab === "Category" ? <PrimaryBtn size="small" onClick={openCatCreate}><Plus size={14} /> Category 생성</PrimaryBtn>
        : tab === "Tier"     ? <PrimaryBtn size="small" onClick={openTierCreate}><Plus size={14} /> Tier 생성</PrimaryBtn>
        : null
      }
    >
      <TabBar tabs={["Image", "Category", "Tier"]} active={tab} onChange={setTab} />

      {/* ── Image ── */}
      {tab === "Image" && (
        <>
          {(() => {
            const selStyle: React.CSSProperties = { height: 32, padding: "0 10px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", fontFamily: "inherit", color: GRAY_90, backgroundColor: "white", cursor: "pointer" };
            const hasFilter = imgSearch || imgFilterTier !== "All" || imgFilterCat !== "All" || imgFilterStatus !== "All";
            return (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
                    전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{filteredImgs.length}</span>개
                    {hasFilter && <span style={{ color: GRAY_60, fontWeight: 400 }}> / {images.length}개</span>}
                  </div>
                  {/* Image Repository 동기화 상태 — §3 인라인 상태 메시지 */}
                  {syncInfo.status === "failed"
                    ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, backgroundColor: RED_10 }}>
                        <AlertTriangle size={12} color={RED} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: RED }}>Image Repository 동기화 실패 — 발생 시각: {syncInfo.failedAt}</span>
                      </div>
                    ) : (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 10, backgroundColor: YELLOW_10 }}>
                        <Clock size={10} color={YELLOW} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: YELLOW }}>마지막 동기화 일시: {syncInfo.lastSyncAt}</span>
                      </div>
                    )
                  }
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input value={imgSearch} onChange={e => setImgSearch(e.target.value)} placeholder="검색어를 입력하세요."
                      style={{ height: 32, paddingLeft: 30, paddingRight: 12, borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", width: 180, fontFamily: "inherit", color: GRAY_90 }}
                      onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; }}
                      onBlur={e => { e.currentTarget.style.borderColor = GRAY_30; }}
                    />
                  </div>
                  <select value={imgFilterStatus} onChange={e => setImgFilterStatus(e.target.value)} style={selStyle}>
                    {allStatuses.map(s => <option key={s} value={s}>{s === "All" ? "Status: All" : s}</option>)}
                  </select>
                  <select value={imgFilterTier} onChange={e => setImgFilterTier(e.target.value)} style={selStyle}>
                    {allTiers.map(t => <option key={t} value={t}>{t === "All" ? "Tier: All" : t}</option>)}
                  </select>
                  <select value={imgFilterCat} onChange={e => setImgFilterCat(e.target.value)} style={selStyle}>
                    {allCats.map(c => <option key={c} value={c}>{c === "All" ? "Category: All" : c}</option>)}
                  </select>
                </div>
              </div>
            );
          })()}
          <Card style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: GRAY_5 }}>
                  <th style={{ ...imgThBase, padding: "10px 0 10px 12px", cursor: "pointer" }} onClick={() => cycleSort("name")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Image{sortIcon("name")}</span>
                  </th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => cycleSort("status")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Status{sortIcon("status")}</span>
                  </th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => cycleSort("tier")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Tier{sortIcon("tier")}</span>
                  </th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => cycleSort("category")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Category{sortIcon("category")}</span>
                  </th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 0" }}>Template</th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => cycleSort("used")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Used{sortIcon("used")}</span>
                  </th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 20px 10px 0" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredImgs.map((img, idx) => {
                  const isLast = idx === filteredImgs.length - 1;
                  const tpl = imgTemplates.find(t => t.image === img.name);
                  return (
                    <React.Fragment key={img.id}>
                      <tr
                        style={{ backgroundColor: "white" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}
                      >
                        <td style={{ ...imgTd("first", isLast), paddingLeft: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flexShrink: 0 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: GRAY_10, border: `1px dashed ${GRAY_30}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Image size={14} color={GRAY_40} /></div>
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{img.name}</span>
                              </div>
                              <div style={{ fontSize: 11, color: GRAY_60, fontFamily: "'Roboto Mono', monospace", whiteSpace: "nowrap" }}>{img.path}</div>
                            </div>
                          </div>
                        </td>
                        <td style={imgSp(isLast)} />
                        <td style={imgTd("mid", isLast)}>
                          <Badge color={img.status === "Public" ? "success" : "neutral"}>
                            {img.status === "Public" ? "Public" : "Private"}
                          </Badge>
                        </td>
                        <td style={imgSp(isLast)} />
                        <td style={imgTd("mid", isLast)}>
                          <Badge color={img.tier === "Official" ? "primary" : "success"}>{img.tier}</Badge>
                        </td>
                        <td style={imgSp(isLast)} />
                        <td style={imgTd("mid", isLast)}>
                          {colorChip(img.category, catColorMap[img.category] ?? GRAY_60)}
                        </td>
                        <td style={imgSp(isLast)} />
                        <td style={imgTd("mid", isLast)}>
                          {tpl
                            ? <span style={{ fontSize: 13, color: GRAY_90 }}>{tpl.name}</span>
                            : <span style={{ fontSize: 13, color: GRAY_40 }}>-</span>}
                        </td>
                        <td style={imgSp(isLast)} />
                        <td style={imgTd("mid", isLast)}>
                          <span style={{ fontSize: 13, color: GRAY_90 }}>{img.used.toLocaleString()}</span>
                        </td>
                        <td style={imgSp(isLast)} />
                        <td style={imgTd("last", isLast)}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button type="button" onClick={() => setSelectedImage(img)} style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                            <div style={{ position: "relative" }}>
                              {openMenuId === img.id && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                              <button type="button" onClick={(e) => { if (openMenuId !== img.id) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === img.id ? null : img.id); }}
                                style={{ height: 28, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === img.id ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                                onMouseEnter={e => { if (openMenuId !== img.id) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                                onMouseLeave={e => { if (openMenuId !== img.id) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                                <span style={{ padding: "0 8px 0 10px" }}>관리</span>
                                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === img.id ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${openMenuId === img.id ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                                  <ChevronDown size={11} color={PRIMARY} style={{ transform: openMenuId === img.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                                </span>
                              </button>
                              {openMenuId === img.id && menuAnchor && (
                                <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 130, padding: "4px 0" }}>
                                  <button type="button" onClick={() => { setImgForm({ name: img.name, path: img.path, desc: img.desc, tier: img.tier, category: img.category, status: img.status, thumb: img.thumb, recGpu: img.recGpu, recTmp: img.recTmp, recLocal: img.recLocal, tags: img.tags, packages: img.packages, access: img.access || [], ports: img.ports || "", envKeys: img.envKeys || "" }); const parsed = (img.envKeys || "").split(",").map(k => ({ key: k.trim(), value: "" })).filter(ev => ev.key); setEnvVars(parsed.length > 0 ? parsed : [{ key: "", value: "" }]); setEditingImageId(img.id); setView("edit-image"); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>수정</button>
                                  {img.status === "Private" && <button type="button" onClick={() => { toggleStatus(img.id); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>공개</button>}
                                  {img.status === "Public" && <button type="button" onClick={() => { toggleStatus(img.id); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>비공개</button>}
                                  <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                                  <button type="button" onClick={() => { setOpenMenuId(null); setDeletingImage(img); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>삭제</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* ── Category ── */}
      {tab === "Category" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
              전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{categories.length}</span>개
            </div>
          </div>
          <Card style={{ overflow: "hidden" }}>
            <Table
              spacerGaps
              headers={["Category", "Description", "Images", "Actions"]}
              rows={categories.map(cat => [
                <span style={{ fontSize: 12, fontWeight: 600, color: cat.color, backgroundColor: `${cat.color}18`, padding: "4px 12px", borderRadius: 99, whiteSpace: "nowrap" }}>{cat.name}</span>,
                <span style={{ fontSize: 13, color: GRAY_70, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minWidth: 280 }}>{cat.desc}</span>,
                <span style={{ fontSize: 13, color: GRAY_90 }}>{cat.imgCnt}개</span>,
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => setSelectedCategory(cat)} style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                  <div style={{ position: "relative" }}>
                    {openMenuId === cat.id && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                    <button type="button" onClick={(e) => { if (openMenuId !== cat.id) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === cat.id ? null : cat.id); }}
                      style={{ height: 28, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === cat.id ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                      onMouseEnter={e => { if (openMenuId !== cat.id) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                      onMouseLeave={e => { if (openMenuId !== cat.id) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                      <span style={{ padding: "0 8px 0 10px" }}>관리</span>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === cat.id ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${openMenuId === cat.id ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                        <ChevronDown size={11} color={PRIMARY} style={{ transform: openMenuId === cat.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                      </span>
                    </button>
                    {openMenuId === cat.id && menuAnchor && (
                      <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 120, padding: "4px 0" }}>
                        <button type="button" onClick={() => { openCatEdit(cat); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>수정</button>
                        <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                        <button type="button" onClick={() => { setOpenMenuId(null); setDeletingCategory(cat); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>삭제</button>
                      </div>
                    )}
                  </div>
                </div>,
              ])}
            />
          </Card>

          {/* Category Drawer */}
          {catDrawer && (
            <>
              <div onClick={closeCatDrawer} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 290 }} />
              <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, backgroundColor: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)", zIndex: 300, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${GRAY_10}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{catDrawer.editId ? "Category 수정" : "Category 생성"}</div>
                    <button type="button" onClick={closeCatDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>Category 이름</div>
                    <input
                      value={catDrawer.form.name}
                      onChange={e => setCatDrawer(d => d ? { ...d, form: { ...d.form, name: e.target.value } } : d)}
                      placeholder="예: ML/DL"
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
                      onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; }}
                      onBlur={e => { e.currentTarget.style.borderColor = GRAY_30; }}
                    />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>설명</div>
                    <input
                      value={catDrawer.form.desc}
                      onChange={e => setCatDrawer(d => d ? { ...d, form: { ...d.form, desc: e.target.value } } : d)}
                      placeholder="카테고리에 대한 간단한 설명"
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
                      onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; }}
                      onBlur={e => { e.currentTarget.style.borderColor = GRAY_30; }}
                    />
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>색상</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                      {CAT_COLORS.map(c => (
                        <button type="button" key={c} onClick={() => setCatDrawer(d => d ? { ...d, form: { ...d.form, color: c } } : d)}
                          style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: c, border: `2.5px solid ${catDrawer.form.color === c ? GRAY_90 : "transparent"}`, cursor: "pointer", flexShrink: 0, outline: "none", boxShadow: catDrawer.form.color === c ? "0 0 0 2px white inset" : "none" }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 18px", marginBottom: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>미리보기</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: catDrawer.form.color, backgroundColor: `${catDrawer.form.color}18`, padding: "5px 14px", borderRadius: 99, whiteSpace: "nowrap" }}>{catDrawer.form.name || "Category 이름"}</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <PrimaryBtn size="small" onClick={saveCat}>저장</PrimaryBtn>
                    <PrimaryBtn size="small" variant="secondary" onClick={closeCatDrawer}>취소</PrimaryBtn>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Tier ── */}
      {tab === "Tier" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
              전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{tiers.length}</span>개
            </div>
          </div>
          <Card style={{ overflow: "hidden" }}>
            <Table
              spacerGaps
              headers={["Tier", "Description", "Images", "Actions"]}
              rows={tiers.map(t => [
                <span style={{ fontSize: 12, fontWeight: 600, color: t.color, backgroundColor: `${t.color}18`, padding: "4px 12px", borderRadius: 99, whiteSpace: "nowrap" }}>{t.name}</span>,
                <span style={{ fontSize: 13, color: GRAY_70, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minWidth: 320 }}>{t.desc}</span>,
                <span style={{ fontSize: 13, color: GRAY_90 }}>{t.imgCnt}개</span>,
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => setSelectedTier(t)} style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                  <div style={{ position: "relative" }}>
                    {openMenuId === t.id && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                    <button type="button" onClick={(e) => { if (openMenuId !== t.id) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === t.id ? null : t.id); }}
                      style={{ height: 28, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === t.id ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                      onMouseEnter={e => { if (openMenuId !== t.id) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                      onMouseLeave={e => { if (openMenuId !== t.id) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                      <span style={{ padding: "0 8px 0 10px" }}>관리</span>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === t.id ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${openMenuId === t.id ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                        <ChevronDown size={11} color={PRIMARY} style={{ transform: openMenuId === t.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                      </span>
                    </button>
                    {openMenuId === t.id && menuAnchor && (
                      <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 120, padding: "4px 0" }}>
                        <button type="button" onClick={() => { openTierEdit(t); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>수정</button>
                        <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                        <button type="button" onClick={() => { setOpenMenuId(null); setDeletingTier(t); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>삭제</button>
                      </div>
                    )}
                  </div>
                </div>,
              ])}
            />
          </Card>

          {/* Tier Drawer */}
          {tierDrawer && (
            <>
              <div onClick={closeTierDrawer} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 290 }} />
              <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, backgroundColor: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)", zIndex: 300, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${GRAY_10}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{tierDrawer.editId ? "Tier 수정" : "Tier 생성"}</div>
                    <button type="button" onClick={closeTierDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                  {/* 이름 */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>Tier 이름</div>
                    <input
                      value={tierDrawer.form.name}
                      onChange={e => setTierDrawer(d => d ? { ...d, form: { ...d.form, name: e.target.value } } : d)}
                      placeholder="예: Official"
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                      onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; }}
                      onBlur={e => { e.currentTarget.style.borderColor = GRAY_30; }}
                    />
                  </div>

                  {/* 설명 */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>설명</div>
                    <input
                      value={tierDrawer.form.desc}
                      onChange={e => setTierDrawer(d => d ? { ...d, form: { ...d.form, desc: e.target.value } } : d)}
                      placeholder="Tier에 대한 설명을 입력하세요."
                      style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                      onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; }}
                      onBlur={e => { e.currentTarget.style.borderColor = GRAY_30; }}
                    />
                  </div>

                  {/* 컬러 */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>색상</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {TIER_COLORS.map(c => (
                        <button type="button" key={c} onClick={() => setTierDrawer(d => d ? { ...d, form: { ...d.form, color: c } } : d)}
                          style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: c, border: `2.5px solid ${tierDrawer.form.color === c ? GRAY_90 : "transparent"}`, cursor: "pointer", flexShrink: 0, outline: "none", boxShadow: tierDrawer.form.color === c ? `0 0 0 2px white inset` : "none" }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 미리보기 */}
                  <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 18px", marginBottom: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>미리보기</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: tierDrawer.form.color, backgroundColor: `${tierDrawer.form.color}18`, padding: "5px 14px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>{tierDrawer.form.name || "Tier 이름"}</span>
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <PrimaryBtn size="small" onClick={saveTier}>저장</PrimaryBtn>
                    <PrimaryBtn size="small" variant="secondary" onClick={closeTierDrawer}>취소</PrimaryBtn>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {selectedImage && (
        <>
          <div onClick={() => setSelectedImage(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{selectedImage.name} 상세 정보</span>
              <button type="button" onClick={() => setSelectedImage(null)} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>닫기</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>기본 정보</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 14, columnGap: 20 }}>
                  {([
                    { label: "이미지명", value: selectedImage.name },
                    { label: "경로", value: <span style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: GRAY_70 }}>{selectedImage.path}</span> },
                    { label: "Tier", value: <Badge color={selectedImage.tier === "Official" ? "primary" : "success"}>{selectedImage.tier}</Badge> },
                    { label: "Category", value: <span style={{ fontSize: 12, fontWeight: 600, color: catColorMap[selectedImage.category] ?? GRAY_60, backgroundColor: `${catColorMap[selectedImage.category] ?? GRAY_60}18`, padding: "2px 8px", borderRadius: 99 }}>{selectedImage.category}</span> },
                    { label: "공개 여부", value: <Badge color={selectedImage.status === "Public" ? "success" : "neutral"}>{selectedImage.status}</Badge> },
                    { label: "사용 횟수", value: `${selectedImage.used.toLocaleString()}회` },
                    { label: "권장 GPU", value: selectedImage.recGpu },
                    { label: "권장 Local", value: `${selectedImage.recTmp} GB` },
                  ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </section>
              {selectedImage.desc && (
                <section>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>설명</div>
                  <div style={{ fontSize: 13, color: GRAY_70, lineHeight: 1.6 }}>{selectedImage.desc}</div>
                </section>
              )}
              {selectedImage.tags && (
                <section>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 10 }}>태그</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedImage.tags.split(",").map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <span key={tag} style={{ fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 6, backgroundColor: GRAY_10, color: GRAY_70 }}>{tag}</span>
                    ))}
                  </div>
                </section>
              )}
              {selectedImage.packages && (
                <section>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>주요 패키지</div>
                  <pre style={{ fontSize: 12, color: GRAY_70, backgroundColor: GRAY_5, borderRadius: 8, padding: "12px 16px", margin: 0, fontFamily: "'Roboto Mono', monospace", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 160, overflowY: "auto" }}>{selectedImage.packages}</pre>
                </section>
              )}
              <section style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>관리</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  <button type="button" onClick={() => { setImgForm({ name: selectedImage.name, path: selectedImage.path, desc: selectedImage.desc, tier: selectedImage.tier, category: selectedImage.category, status: selectedImage.status, thumb: selectedImage.thumb, recGpu: selectedImage.recGpu, recTmp: selectedImage.recTmp, recLocal: selectedImage.recLocal, tags: selectedImage.tags, packages: selectedImage.packages, access: selectedImage.access || [], ports: selectedImage.ports || "", envKeys: selectedImage.envKeys || "" }); const parsed = (selectedImage.envKeys || "").split(",").map(k => ({ key: k.trim(), value: "" })).filter(ev => ev.key); setEnvVars(parsed.length > 0 ? parsed : [{ key: "", value: "" }]); setEditingImageId(selectedImage.id); setView("edit-image"); setSelectedImage(null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>수정</button>
                  {selectedImage.status === "Private" && <button type="button" onClick={() => { toggleStatus(selectedImage.id); setSelectedImage(i => i ? { ...i, status: "Public" } : null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>공개</button>}
                  {selectedImage.status === "Public" && <button type="button" onClick={() => { toggleStatus(selectedImage.id); setSelectedImage(i => i ? { ...i, status: "Private" } : null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>비공개</button>}
                  <button type="button" onClick={() => setDeletingImage(selectedImage)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>삭제</button>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
      {selectedCategory && (
        <>
          <div onClick={() => setSelectedCategory(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{selectedCategory.name} 상세 정보</span>
              <button type="button" onClick={() => setSelectedCategory(null)} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>닫기</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>기본 정보</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 14, columnGap: 20 }}>
                  {([
                    { label: "이름", value: <span style={{ fontSize: 12, fontWeight: 600, color: selectedCategory.color, backgroundColor: `${selectedCategory.color}18`, padding: "2px 8px", borderRadius: 99 }}>{selectedCategory.name}</span> },
                    { label: "이미지 수", value: `${selectedCategory.imgCnt}개` },
                    { label: "설명", value: selectedCategory.desc },
                    { label: "색상", value: <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: selectedCategory.color }} /> },
                  ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </section>
              <section style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>관리</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => { openCatEdit(selectedCategory); setSelectedCategory(null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>수정</button>
                  <button type="button" onClick={() => setDeletingCategory(selectedCategory)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>삭제</button>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
      {selectedTier && (
        <>
          <div onClick={() => setSelectedTier(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{selectedTier.name} 상세 정보</span>
              <button type="button" onClick={() => setSelectedTier(null)} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>닫기</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>기본 정보</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 14, columnGap: 20 }}>
                  {([
                    { label: "이름", value: <span style={{ fontSize: 12, fontWeight: 600, color: selectedTier.color, backgroundColor: `${selectedTier.color}18`, padding: "2px 8px", borderRadius: 99 }}>{selectedTier.name}</span> },
                    { label: "이미지 수", value: `${selectedTier.imgCnt}개` },
                    { label: "설명", value: selectedTier.desc },
                    { label: "색상", value: <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: selectedTier.color }} /> },
                  ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </section>
              <section style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>관리</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => { openTierEdit(selectedTier); setSelectedTier(null); }} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>수정</button>
                  <button type="button" onClick={() => setDeletingTier(selectedTier)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>삭제</button>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </PageContainer>
    {deletingImage && (
      <ConfirmModal
        title="이미지 삭제"
        message={<>이미지 <strong>{deletingImage.name}</strong>을(를) 삭제하시겠습니까?<br /><br />이 이미지를 기반으로 한 서버 템플릿이 비활성화되며, 저장된 이미지 파일이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</>}
        confirmLabel="삭제"
        onConfirm={() => { setImages(imgs => imgs.filter(x => x.id !== deletingImage.id)); if (selectedImage?.id === deletingImage.id) setSelectedImage(null); setDeletingImage(null); }}
        onCancel={() => setDeletingImage(null)}
      />
    )}
    {deletingCategory && (
      <ConfirmModal
        title="Category 삭제"
        message={<>Category <strong>{deletingCategory.name}</strong>을(를) 삭제하시겠습니까?<br /><br />이 Category에 속한 이미지의 분류가 해제됩니다. 이 작업은 되돌릴 수 없습니다.</>}
        confirmLabel="삭제"
        onConfirm={() => { setCategories(cats => cats.filter(c => c.id !== deletingCategory.id)); if (selectedCategory?.id === deletingCategory.id) setSelectedCategory(null); setDeletingCategory(null); }}
        onCancel={() => setDeletingCategory(null)}
      />
    )}
    {deletingTier && (
      <ConfirmModal
        title="Tier 삭제"
        message={<>Tier <strong>{deletingTier.name}</strong>을(를) 삭제하시겠습니까?<br /><br />이 Tier에 속한 이미지의 등급 분류가 해제됩니다. 이 작업은 되돌릴 수 없습니다.</>}
        confirmLabel="삭제"
        onConfirm={() => { setTiers(ts => ts.filter(x => x.id !== deletingTier.id)); if (selectedTier?.id === deletingTier.id) setSelectedTier(null); setDeletingTier(null); }}
        onCancel={() => setDeletingTier(null)}
      />
    )}
    </>
  );
}

// ─── Credit Management ────────────────────────────────────────────────────────
export function AdminCreditManagement() {
  const wsMap = [
    { name: "My Workspace",    wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", credits: 45230,  status: "active"   },
    { name: "Team Alpha",      wsId: "ws-d7e9a1b5", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc",   credits: 120500, status: "active"   },
    { name: "ML Research Lab", wsId: "ws-c2f4d8e3", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc",   credits: 8200,   status: "active"   },
    { name: "Old Project",     wsId: "ws-b6a9c7d4", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc",   credits: 1000,   status: "inactive" },
  ];
  const getWs = (wsId: string) => wsMap.find(w => w.wsId === wsId) ?? wsMap[0];

  const [creditDrawer, setCreditDrawer] = useState<{ form: { wsId: string; type: string; amount: string; reason: string } } | null>(null);
  const [wsDrawerSearch, setWsDrawerSearch] = useState("");
  const [wsDrawerPage, setWsDrawerPage] = useState(0);
  const [wsDrawerSort, setWsDrawerSort] = useState<"name" | "credits">("name");
  const [wsDrawerSortDir, setWsDrawerSortDir] = useState<"asc" | "desc">("asc");
  const WS_PAGE_SIZE = 3;
  const handleWsDrawerSort = (key: "name" | "credits") => {
    if (wsDrawerSort === key) setWsDrawerSortDir(d => d === "asc" ? "desc" : "asc");
    else { setWsDrawerSort(key); setWsDrawerSortDir("asc"); }
    setWsDrawerPage(0);
  };

  const openCreditDrawer = (type: "지급" | "회수") => setCreditDrawer({ form: { wsId: "ws-a3f8b2c1", type, amount: "", reason: "" } });
  const closeCreditDrawer = () => setCreditDrawer(null);

  // ── Credit History state ──
  const [histSearch,    setHistSearch]    = useState("");
  const [histFilterType, setHistFilterType] = useState("All");
  const [histFilterWs,  setHistFilterWs]  = useState("All");
  const [histSortKey,   setHistSortKey]   = useState("date");
  const [histSortDir,   setHistSortDir]   = useState<"asc" | "desc">("desc");

  const typeMeta: Record<PlatformCreditType, { bg: string; color: string; icon: React.ReactNode }> = {
    "관리자 지급":        { bg: "rgb(230,248,237)", color: GREEN,   icon: <CreditCard size={12} color={GREEN} />   },
    "관리자 회수":        { bg: "rgb(254,242,242)", color: RED,     icon: <CreditCard size={12} color={RED} />     },
    "서버 사용":          { bg: PRIMARY_10,          color: PRIMARY, icon: <Server size={12} color={PRIMARY} />     },
    "볼륨 스토리지 사용": { bg: "rgb(235,245,255)", color: BLUE,    icon: <Database size={12} color={BLUE} />      },
    "공유 스토리지 사용": { bg: "rgb(255,251,235)", color: YELLOW,  icon: <Database size={12} color={YELLOW} />    },
  };

  const histWsOptions   = Array.from(new Set(platformCreditHistory.map(r => r.wsName)));
  const histTypeOptions: [string, string][] = [
    ["All", "구분"], ["관리자 지급", "관리자 지급"], ["관리자 회수", "관리자 회수"],
    ["서버 사용", "서버 사용"], ["볼륨 스토리지 사용", "볼륨 스토리지 사용"], ["공유 스토리지 사용", "공유 스토리지 사용"],
  ];
  const histWsOptionPairs: [string, string][] = [["All", "워크스페이스"], ...histWsOptions.map(w => [w, w] as [string, string])];

  function handleHistSort(key: string) {
    if (histSortKey === key) setHistSortDir(d => d === "asc" ? "desc" : "asc");
    else { setHistSortKey(key); setHistSortDir("desc"); }
  }

  const histFiltered = platformCreditHistory
    .filter(r => histFilterType === "All" || r.type === histFilterType)
    .filter(r => histFilterWs   === "All" || r.wsName === histFilterWs)
    .filter(r => {
      const q = histSearch.toLowerCase();
      return !q || [r.wsName, r.desc, r.by, r.byEmail ?? ""].some(v => v.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const va = histSortKey === "date" ? `${a.date} ${a.time}` : histSortKey === "ws" ? a.wsName : histSortKey === "amount" ? a.amount : a.type;
      const vb = histSortKey === "date" ? `${b.date} ${b.time}` : histSortKey === "ws" ? b.wsName : histSortKey === "amount" ? b.amount : b.type;
      if (va < vb) return histSortDir === "asc" ? -1 : 1;
      if (va > vb) return histSortDir === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <PageContainer title="Credit History" subtitle="워크스페이스의 전체 크레딧 이력을 조회하고 지급·회수를 관리합니다."
      actions={<PrimaryBtn size="small" onClick={() => openCreditDrawer("지급")}><Plus size={14} /> 크레딧 관리</PrimaryBtn>}>
      <>
          {creditDrawer && (() => {
            const selWs = getWs(creditDrawer.form.wsId);
            const amt = parseInt(creditDrawer.form.amount || "0", 10);
            const isGrant = creditDrawer.form.type === "지급";
            const canSubmit = amt > 0 && creditDrawer.form.reason.trim().length > 0;
            return (
              <>
                <div onClick={closeCreditDrawer} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 290 }} />
                <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 440, backgroundColor: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)", zIndex: 300, display: "flex", flexDirection: "column" }}>
                  {/* 헤더 */}
                  <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${GRAY_10}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CreditCard size={16} color={PRIMARY} />
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>크레딧 관리</div>
                          <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>워크스페이스에 크레딧을 지급하거나 회수합니다.</div>
                        </div>
                      </div>
                      <button type="button" onClick={closeCreditDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* 폼 */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                    {/* 워크스페이스 */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>워크스페이스</div>
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input value={wsDrawerSearch} onChange={e => { setWsDrawerSearch(e.target.value); setWsDrawerPage(0); }} placeholder="검색어를 입력하세요."
                          style={{ width: "100%", height: 34, paddingLeft: 30, paddingRight: 10, border: `1px solid ${GRAY_30}`, borderRadius: 8, fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }} />
                      </div>
                      {(() => {
                        const filtered = wsMap
                          .filter(w => w.status === "active")
                          .filter(w => !wsDrawerSearch || w.name.toLowerCase().includes(wsDrawerSearch.toLowerCase()) || w.owner.toLowerCase().includes(wsDrawerSearch.toLowerCase()))
                          .sort((a, b) => {
                            const va = wsDrawerSort === "name" ? a.name : a.credits;
                            const vb = wsDrawerSort === "name" ? b.name : b.credits;
                            if (va < vb) return wsDrawerSortDir === "asc" ? -1 : 1;
                            if (va > vb) return wsDrawerSortDir === "asc" ? 1 : -1;
                            return 0;
                          });
                        const totalPages = Math.ceil(filtered.length / WS_PAGE_SIZE);
                        const paged = filtered.slice(wsDrawerPage * WS_PAGE_SIZE, (wsDrawerPage + 1) * WS_PAGE_SIZE);
                        const thBase: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: GRAY_60, textAlign: "left", whiteSpace: "nowrap", borderBottom: `1px solid ${GRAY_10}`, backgroundColor: GRAY_5 };
                        const tdStyle: React.CSSProperties = { fontSize: 13, color: GRAY_90, verticalAlign: "middle", padding: "10px 0", borderBottom: `1px solid ${GRAY_10}` };
                        return (
                          <>
                            <Card style={{ overflow: "hidden", marginBottom: 8 }}>
                              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                  <tr>
                                    <th style={{ ...thBase, padding: "8px 0 8px 12px" }}>
                                      <button type="button" onClick={() => handleWsDrawerSort("name")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontWeight: 600, color: wsDrawerSort === "name" ? PRIMARY : GRAY_60, display: "inline-flex", alignItems: "center", gap: 3 }}>
                                        Workspace {wsDrawerSort === "name" ? (wsDrawerSortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ChevronUp size={10} color={GRAY_40} />}
                                      </button>
                                    </th>
                                    <th style={{ ...thBase, padding: "8px 0" }}>Owner</th>
                                    <th style={{ ...thBase, padding: "8px 12px 8px 0", textAlign: "right" }}>
                                      <button type="button" onClick={() => handleWsDrawerSort("credits")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontWeight: 600, color: wsDrawerSort === "credits" ? PRIMARY : GRAY_60, display: "inline-flex", alignItems: "center", gap: 3 }}>
                                        {wsDrawerSort === "credits" ? (wsDrawerSortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ChevronUp size={10} color={GRAY_40} />} Credit Balance
                                      </button>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paged.length === 0
                                    ? <tr><td colSpan={3} style={{ padding: "16px 12px", fontSize: 12, color: GRAY_40, textAlign: "center" }}>검색 결과 없음</td></tr>
                                    : paged.map((w, idx) => {
                                      const selected = creditDrawer.form.wsId === w.wsId;
                                      const isLast = idx === paged.length - 1;
                                      const rowBg = selected ? PRIMARY_10 : "white";
                                      return (
                                        <tr key={w.wsId} onClick={() => setCreditDrawer(d => d ? { ...d, form: { ...d.form, wsId: w.wsId } } : d)}
                                          style={{ cursor: "pointer", backgroundColor: rowBg }}
                                          onMouseEnter={e => { if (!selected) e.currentTarget.style.backgroundColor = GRAY_5; }}
                                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = rowBg; }}>
                                          <td style={{ ...tdStyle, padding: `10px 0 10px 12px`, borderBottom: isLast ? "none" : `1px solid ${GRAY_10}`, backgroundColor: rowBg }}>
                                            <div>
                                              <div style={{ fontSize: 13, fontWeight: 600, color: selected ? PRIMARY : GRAY_90 }}>{w.name}</div>
                                              <div style={{ fontSize: 11, color: GRAY_60 }}>{w.wsId}</div>
                                            </div>
                                          </td>
                                          <td style={{ ...tdStyle, borderBottom: isLast ? "none" : `1px solid ${GRAY_10}`, backgroundColor: rowBg, paddingRight: 8 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{w.owner}</div>
                                            <div style={{ fontSize: 11, color: GRAY_60 }}>{w.ownerEmail}</div>
                                          </td>
                                          <td style={{ ...tdStyle, padding: `10px 12px 10px 0`, borderBottom: isLast ? "none" : `1px solid ${GRAY_10}`, backgroundColor: rowBg, textAlign: "right" }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{w.credits.toLocaleString()} cr</div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  }
                                </tbody>
                              </table>
                            </Card>
                            {totalPages > 1 && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <button type="button" onClick={() => setWsDrawerPage(p => Math.max(0, p - 1))} disabled={wsDrawerPage === 0}
                                  style={{ height: 28, padding: "0 10px", borderRadius: 6, border: `1px solid ${GRAY_30}`, backgroundColor: "white", fontSize: 12, color: wsDrawerPage === 0 ? GRAY_40 : GRAY_70, cursor: wsDrawerPage === 0 ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                                  <ChevronUp size={11} style={{ transform: "rotate(-90deg)" }} /> 이전
                                </button>
                                <span style={{ fontSize: 12, color: GRAY_60 }}>{wsDrawerPage + 1} / {totalPages}</span>
                                <button type="button" onClick={() => setWsDrawerPage(p => Math.min(totalPages - 1, p + 1))} disabled={wsDrawerPage === totalPages - 1}
                                  style={{ height: 28, padding: "0 10px", borderRadius: 6, border: `1px solid ${GRAY_30}`, backgroundColor: "white", fontSize: 12, color: wsDrawerPage === totalPages - 1 ? GRAY_40 : GRAY_70, cursor: wsDrawerPage === totalPages - 1 ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                                  다음 <ChevronDown size={11} style={{ transform: "rotate(-90deg)" }} />
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* 유형 */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>유형</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["지급", "회수"] as const).map(t => (
                          <button type="button" key={t} onClick={() => setCreditDrawer(d => d ? { ...d, form: { ...d.form, type: t } } : d)}
                            style={{ flex: 1, height: 42, borderRadius: 8, border: `1.5px solid ${creditDrawer.form.type === t ? (t === "지급" ? PRIMARY : RED) : GRAY_30}`, backgroundColor: creditDrawer.form.type === t ? (t === "지급" ? PRIMARY_10 : "rgb(254,242,242)") : "white", fontSize: 13, fontWeight: creditDrawer.form.type === t ? 700 : 400, color: creditDrawer.form.type === t ? (t === "지급" ? PRIMARY : RED) : GRAY_70, cursor: "pointer", transition: "all 0.12s" }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 수량 */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>수량 (cr)</div>
                      <input type="number" value={creditDrawer.form.amount} placeholder="0"
                        onChange={e => setCreditDrawer(d => d ? { ...d, form: { ...d.form, amount: e.target.value } } : d)}
                        style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
                        onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; }}
                        onBlur={e => { e.currentTarget.style.borderColor = GRAY_30; }} />
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        {[100, 500, 1000, 5000, 10000].map(preset => (
                          <button type="button" key={preset}
                            onClick={() => setCreditDrawer(d => d ? { ...d, form: { ...d.form, amount: String((parseInt(d.form.amount || "0", 10) + preset)) } } : d)}
                            style={{ flex: 1, height: 32, borderRadius: 7, border: `1px solid ${GRAY_30}`, backgroundColor: "white", fontSize: 11, fontWeight: 600, color: GRAY_70, cursor: "pointer", fontFamily: "inherit" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; e.currentTarget.style.backgroundColor = PRIMARY_10; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = GRAY_30; e.currentTarget.style.color = GRAY_70; e.currentTarget.style.backgroundColor = "white"; }}>
                            +{preset >= 1000 ? `${preset / 1000}K` : preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 사유 */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>사유 <span style={{ color: RED }}>*</span></div>
                      <input type="text" value={creditDrawer.form.reason} placeholder="사유를 입력하세요"
                        onChange={e => setCreditDrawer(d => d ? { ...d, form: { ...d.form, reason: e.target.value } } : d)}
                        style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
                        onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; }}
                        onBlur={e => { e.currentTarget.style.borderColor = GRAY_30; }} />
                    </div>

                    {/* 실행 전후 미리보기 */}
                    {(() => {
                      const before = selWs.credits;
                      const after = isGrant ? before + amt : before - amt;
                      const overLimit = after < 0;
                      return (
                        <div style={{ backgroundColor: GRAY_5, border: `1px solid ${GRAY_10}`, borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_60, marginBottom: 10 }}>실행 미리보기</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, color: GRAY_40, marginBottom: 3 }}>변경 전</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{before.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>cr</span></div>
                            </div>
                            <div style={{ fontSize: 13, color: GRAY_40, flexShrink: 0 }}>→</div>
                            <div style={{ flex: 1, textAlign: "right" as const }}>
                              <div style={{ fontSize: 10, color: GRAY_40, marginBottom: 3 }}>변경 후</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: overLimit ? RED : isGrant ? PRIMARY : GRAY_90 }}>
                                {overLimit ? "−" : ""}{Math.abs(after).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>cr</span>
                              </div>
                            </div>
                          </div>
                          {amt > 0 && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${GRAY_10}`, fontSize: 12, color: isGrant ? PRIMARY : RED, fontWeight: 600, textAlign: "center" as const }}>
                              {isGrant ? "+" : "−"}{amt.toLocaleString()} cr {creditDrawer.form.type}
                              {overLimit && <span style={{ fontSize: 11, color: RED, fontWeight: 400, marginLeft: 6 }}>· 잔액 한도 초과</span>}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 액션 */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <PrimaryBtn size="small" onClick={closeCreditDrawer} style={{ opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? "pointer" : "not-allowed" }}>실행</PrimaryBtn>
                      <PrimaryBtn size="small" variant="secondary" onClick={closeCreditDrawer}>취소</PrimaryBtn>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
              전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{histFiltered.length}</span>건
              {(histFilterType !== "All" || histFilterWs !== "All" || histSearch) && (
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}> / {platformCreditHistory.length}건 중</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ position: "relative" }}>
                <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="text" placeholder="검색어를 입력하세요." value={histSearch}
                  onChange={e => setHistSearch(e.target.value)}
                  style={{ width: 220, height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, outline: "none", boxSizing: "border-box" as const }} />
              </div>
              {[
                { value: histFilterWs,   onChange: (v: string) => setHistFilterWs(v),   options: histWsOptionPairs },
                { value: histFilterType, onChange: (v: string) => setHistFilterType(v), options: histTypeOptions },
              ].map(({ value, onChange, options }) => (
                <div key={String(options[0][1])} style={{ position: "relative" }}>
                  <select value={value} onChange={e => onChange(e.target.value)}
                    style={{ height: 34, paddingLeft: 10, paddingRight: 26, border: `1px solid ${value !== "All" ? PRIMARY : GRAY_30}`, borderRadius: 8, fontSize: 12, color: value !== "All" ? PRIMARY : GRAY_70, fontFamily: "inherit", fontWeight: value !== "All" ? 600 : 400, backgroundColor: value !== "All" ? PRIMARY_10 : "white", outline: "none", cursor: "pointer", appearance: "none" as const }}>
                    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <ChevronDown size={11} color={value !== "All" ? PRIMARY : GRAY_60} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              ))}
            </div>
          </div>
          <Card style={{ overflow: "hidden" }}>
            <Table spacerGaps
              headers={[
                <SortableHeader k="ws"     label="Workspace" sortKey={histSortKey} sortDir={histSortDir} onSort={handleHistSort} />,
                <SortableHeader k="type"   label="Type"      sortKey={histSortKey} sortDir={histSortDir} onSort={handleHistSort} />,
                "Details",
                "User",
                <SortableHeader k="amount" label="Amount"    sortKey={histSortKey} sortDir={histSortDir} onSort={handleHistSort} />,
                <SortableHeader k="date"   label="일시"      sortKey={histSortKey} sortDir={histSortDir} onSort={handleHistSort} />,
              ]}
              rows={histFiltered.map(r => {
                const meta = typeMeta[r.type];
                return [
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{r.wsName}</div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginTop: 1, whiteSpace: "nowrap" }}>{r.wsId}</div>
                  </div>,
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, backgroundColor: meta.bg, color: meta.color, borderRadius: 20, padding: "3px 9px 3px 6px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {meta.icon}{r.type}
                  </div>,
                  <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" }}>{r.desc}</span>,
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, whiteSpace: "nowrap" }}>{r.by}</div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginTop: 1, whiteSpace: "nowrap" }}>{r.byEmail ?? "—"}</div>
                  </div>,
                  <span style={{ fontSize: 13, fontWeight: 700, color: r.amount > 0 ? GREEN : RED, whiteSpace: "nowrap" }}>
                    {r.amount > 0 ? "+" : ""}{r.amount.toLocaleString()} cr
                  </span>,
                  <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" }}>{r.date} {r.time}</span>,
                ];
              })}
            />
            {histFiltered.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center" as const, color: GRAY_60, fontSize: 13 }}>검색 결과가 없습니다.</div>
            )}
          </Card>
      </>
    </PageContainer>
  );
}

// ─── Storage Management ───────────────────────────────────────────────────────
function SortableHeader({ k, label, sortKey, sortDir, onSort }: {
  k: string;
  label: string;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (k: string) => void;
}) {
  const active = sortKey === k;
  return (
    <button type="button" onClick={() => onSort(k)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 600, color: active ? PRIMARY : GRAY_60 }}>
      {label}
      <span style={{ display: "flex", flexDirection: "column", gap: 1, opacity: active ? 1 : 0.35 }}>
        <ChevronUp size={10} color={active && sortDir === "asc" ? PRIMARY : GRAY_60} />
        <ChevronDown size={10} color={active && sortDir === "desc" ? PRIMARY : GRAY_60} style={{ marginTop: -3 }} />
      </span>
    </button>
  );
}

export function AdminStorageManagement({ initialTab = "Storage" }: { initialTab?: string }) {
  const storages = [
    { name: "pytorch-dev-01-local", type: "Volume", workspace: "My Workspace", wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", capacity: 10, used: 6.8, status: "Normal", mountServer: "pytorch-dev-01", mountWorkspace: "My Workspace" },
    { name: "llm-finetuning-local", type: "Volume", workspace: "Team Alpha", wsId: "ws-d7e9a1b5", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc", capacity: 100, used: 67.3, status: "Normal", mountServer: "llm-finetuning", mountWorkspace: "Team Alpha" },
    { name: "ml-research-local", type: "Volume", workspace: "ML Research Lab", wsId: "ws-c2f4d8e3", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc", capacity: 50, used: 31.4, status: "Normal", mountServer: "abuse-server-01", mountWorkspace: "ML Research Lab" },
    { name: "old-project-local", type: "Volume", workspace: "Old Project", wsId: "ws-b6a9c7d4", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc", capacity: 10, used: 0, status: "Normal", mountServer: "old-project-01", mountWorkspace: "Old Project" },
    { name: "data-preprocess-local", type: "Volume", workspace: "Team Alpha", wsId: "ws-d7e9a1b5", owner: "장민준", ownerEmail: "minjun.jang@sdt.inc", capacity: 30, used: 8.2, status: "Normal", mountServer: "data-preprocess", mountWorkspace: "Team Alpha" },
    { name: "team-shared-01", type: "Shared", workspace: "My Workspace", wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", capacity: 500, used: 287, status: "Normal", mountServer: null, mountWorkspace: null, unmountedAt: "2026-07-10 18:42" },
    { name: "dataset-archive", type: "Shared", workspace: "Team Alpha", wsId: "ws-d7e9a1b5", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc", capacity: 1000, used: 435, status: "Normal", mountServer: null, mountWorkspace: null, unmountedAt: "2026-06-25 09:11" },
    { name: "pytorch-dev-01-temp", type: "Local", workspace: "My Workspace", wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", capacity: 20, used: 14.2, status: "Healthy", mountServer: "pytorch-dev-01", mountWorkspace: "My Workspace" },
  ];
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const [showStorageCreate, setShowStorageCreate] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Local" | "Volume" | "Shared">("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Normal" | "Healthy" | "Warning" | "Error">("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<typeof storages[0] | null>(null);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = storages
    .filter(s => filterType === "All" || s.type === filterType)
    .filter(s => filterStatus === "All" || s.status === filterStatus)
    .filter(s => {
      const q = search.toLowerCase();
      return !q || [s.name, s.type, s.mountServer ?? "", s.mountWorkspace ?? "", s.owner].some(v => v.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === "name") { va = a.name; vb = b.name; }
      else if (sortKey === "workspace") { va = a.workspace; vb = b.workspace; }
      else if (sortKey === "owner") { va = a.owner; vb = b.owner; }
      else if (sortKey === "capacity") { va = a.capacity; vb = b.capacity; }
      else if (sortKey === "used") { va = a.used; vb = b.used; }
      else { va = a.used / a.capacity; vb = b.used / b.capacity; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <PageContainer title="Storage Management" subtitle={tab === "Storage Settings" ? "서버 생성 시 스토리지 용량 산정 방식을 설정합니다." : "전체 스토리지 목록을 조회하고 관리합니다."}
      actions={tab === "Storage Pricing Policy" ? <PrimaryBtn size="small" onClick={() => setShowStorageCreate(true)}><Plus size={14} /> 가격 정책 등록</PrimaryBtn> : undefined}>
      <TabBar tabs={["Storage", "Storage Pricing Policy", "Storage Settings"]} active={tab} onChange={setTab} />
      {tab === "Storage" && (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            {/* Result count */}
            <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
              전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{filtered.length}</span>개
              {(filterType !== "All" || filterStatus !== "All" || search) && (
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}> / {storages.length}개 중</span>
              )}
            </div>
            {/* Search + Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ position: "relative" }}>
                <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="text" placeholder="검색어를 입력하세요." value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: 220, height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
              {[
                { value: filterType, onChange: (v: string) => setFilterType(v as typeof filterType), options: [["All", "유형"], ["Local", "Local"], ["Volume", "Volume"], ["Shared", "Shared"]] },
                { value: filterStatus, onChange: (v: string) => setFilterStatus(v as typeof filterStatus), options: [["All", "상태"], ["Normal", "Normal"], ["Healthy", "Healthy"], ["Warning", "Warning"], ["Error", "Error"]] },
              ].map(({ value, onChange, options }) => (
                <div key={options[0][1]} style={{ position: "relative" }}>
                  <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{ height: 34, paddingLeft: 10, paddingRight: 26, border: `1px solid ${value !== "All" ? PRIMARY : GRAY_30}`, borderRadius: 8, fontSize: 12, color: value !== "All" ? PRIMARY : GRAY_70, fontFamily: "inherit", fontWeight: value !== "All" ? 600 : 400, backgroundColor: value !== "All" ? PRIMARY_10 : "white", outline: "none", cursor: "pointer", appearance: "none" as const }}
                  >
                    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <ChevronDown size={11} color={value !== "All" ? PRIMARY : GRAY_60} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              ))}
            </div>
          </div>

          <Card style={{ overflow: "hidden" }}>
            <Table
              spacerGaps
              headers={[
              <SortableHeader k="name" label="Name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
              "Mounted To",
              <SortableHeader k="workspace" label="Workspace" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
              <SortableHeader k="owner" label="User" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
              <SortableHeader k="usedPct" label="Usage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
              "Actions",
            ]}
              rows={filtered.map(s => {
                const pct = Math.round(s.used / s.capacity * 100);
                const pctColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
                const typeColor = s.type === "Volume" ? PRIMARY : s.type === "Shared" ? GREEN : BLUE;
                const typeBg = s.type === "Volume" ? "rgba(99,90,220,0.1)" : s.type === "Shared" ? "rgba(34,197,94,0.1)" : "rgba(36,142,213,0.1)";
                const typeIcon = <Database size={13} color={typeColor} />;
                return [
                  /* 이름 */
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: typeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {typeIcon}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>{s.type}</span>
                    </div>
                  </div>,
                  /* 마운트 */
                  s.mountServer
                    ? <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, whiteSpace: "nowrap" }}>{s.mountServer}</span>
                    : <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13, color: GRAY_40, whiteSpace: "nowrap" }}>—</span>
                        {"unmountedAt" in s && (s as any).unmountedAt && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: YELLOW_10, borderRadius: 10, fontSize: 11, color: YELLOW, whiteSpace: "nowrap" }}>
                            <Clock size={10} color={YELLOW} />
                            마지막 해제 일시: {(s as any).unmountedAt}
                          </div>
                        )}
                      </div>,
                  /* Workspace */
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{s.workspace}</div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginTop: 1 }}>{s.wsId}</div>
                  </div>,
                  /* User */
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{s.owner}</div>
                    <div style={{ fontSize: 11, color: GRAY_60 }}>{s.ownerEmail}</div>
                  </div>,
                  /* 사용량 */
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 180 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: GRAY_70 }}>{s.used} <span style={{ color: GRAY_40 }}>/ {s.capacity} GB</span></span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: pctColor }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, backgroundColor: GRAY_10, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN, borderRadius: 3, transition: "width 0.3s ease" }} />
                    </div>
                  </div>,
                  /* 액션 */
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" onClick={() => setSelectedStorage(s)} style={{ height: 36, padding: "0 14px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                    {s.type !== "Local" && (
                      <div style={{ position: "relative" }}>
                        {openMenuId === s.name && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                        <button type="button" onClick={(e) => { if (openMenuId !== s.name) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === s.name ? null : s.name); }}
                          style={{ height: 36, fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === s.name ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                          onMouseEnter={e => { if (openMenuId !== s.name) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                          onMouseLeave={e => { if (openMenuId !== s.name) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                          <span style={{ padding: "0 10px 0 12px" }}>관리</span>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === s.name ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 8px", borderLeft: `1px solid ${openMenuId === s.name ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                            <ChevronDown size={12} color={PRIMARY} style={{ transform: openMenuId === s.name ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                          </span>
                        </button>
                        {openMenuId === s.name && menuAnchor && (
                          <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 130, padding: "4px 0" }}>
                            <button type="button" onClick={() => setOpenMenuId(null)} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>용량 상향</button>
                            <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                            <button type="button" onClick={() => setOpenMenuId(null)} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>삭제</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>,
                ];
              })}
            />
            {filtered.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center" as const, color: GRAY_60, fontSize: 13 }}>검색 결과가 없습니다.</div>
            )}
          </Card>
        </>
      )}
      {tab === "Storage Pricing Policy" && <StoragePricingPolicy showCreate={showStorageCreate} setShowCreate={setShowStorageCreate} />}

      {tab === "Storage Settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>

          {/* Local Storage */}
          <Card style={{ padding: "24px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Local Storage</div>
            <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>Temporary storage automatically assigned per server. Data is lost on server stop or deletion.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>Storage Buffer</div>
                <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>Extra space added on top of the image minimum requirement. Applied immediately to new server creation.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <input type="number" min={1} defaultValue={5}
                  style={{ width: 80, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "right" as const }} />
                <span style={{ fontSize: 13, color: GRAY_60 }}>GB</span>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn size="small">Apply</PrimaryBtn>
            </div>
          </Card>

          {/* Volume Storage */}
          <Card style={{ padding: "24px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Volume Storage</div>
            <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>Persistent local storage attached to servers. Billed even while the server is stopped.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid rgb(242,242,242)` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>Minimum Size</div>
                <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>Minimum size for new volume storage.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <input type="number" min={1} defaultValue={10}
                  style={{ width: 80, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "right" as const }} />
                <span style={{ fontSize: 13, color: GRAY_60 }}>GB</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>Minimum Increment</div>
                <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>Minimum size increase per upgrade.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <input type="number" min={1} defaultValue={1}
                  style={{ width: 80, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "right" as const }} />
                <span style={{ fontSize: 13, color: GRAY_60 }}>GB</span>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn size="small">Apply</PrimaryBtn>
            </div>
          </Card>

          {/* Shared Storage */}
          <Card style={{ padding: "24px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Shared Storage</div>
            <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>Workspace-level shared storage settings.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid rgb(242,242,242)` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>Minimum Size</div>
                <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>Minimum size for new shared storage.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <input type="number" min={1} defaultValue={10}
                  style={{ width: 80, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "right" as const }} />
                <span style={{ fontSize: 13, color: GRAY_60 }}>GB</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>Minimum Increment</div>
                <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>Minimum size increase per upgrade.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <input type="number" min={1} defaultValue={1}
                  style={{ width: 80, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "right" as const }} />
                <span style={{ fontSize: 13, color: GRAY_60 }}>GB</span>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn size="small">Apply</PrimaryBtn>
            </div>
          </Card>

        </div>
      )}
      {selectedStorage && (
        <>
          <div onClick={() => setSelectedStorage(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{selectedStorage.name} 상세 정보</span>
              <button type="button" onClick={() => setSelectedStorage(null)} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>닫기</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>기본 정보</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 14, columnGap: 20 }}>
                  {((): { label: string; value: React.ReactNode }[] => {
                    const typeColor = selectedStorage.type === "Volume" ? PRIMARY : selectedStorage.type === "Shared" ? GREEN : BLUE;
                    return [
                      { label: "이름", value: selectedStorage.name },
                      { label: "유형", value: <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 99, backgroundColor: `${typeColor}18`, color: typeColor }}>{selectedStorage.type}</span> },
                      { label: "워크스페이스", value: selectedStorage.workspace },
                      { label: "Workspace ID", value: <span style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: GRAY_60 }}>{selectedStorage.wsId}</span> },
                      { label: "소유자", value: selectedStorage.owner },
                      { label: "이메일", value: selectedStorage.ownerEmail },
                      { label: "마운트 서버", value: selectedStorage.mountServer ?? "—" },
                      { label: "상태", value: <Badge color={selectedStorage.status === "Normal" || selectedStorage.status === "Healthy" ? "success" : "neutral"}>{selectedStorage.status}</Badge> },
                    ];
                  })().map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>사용량</div>
                <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 20px" }}>
                  {(() => {
                    const pct = Math.round(selectedStorage.used / selectedStorage.capacity * 100);
                    const pctColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 13, color: GRAY_70 }}>{selectedStorage.used} <span style={{ color: GRAY_40 }}>/ {selectedStorage.capacity} GB</span></span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: pctColor }}>{pct}%</span>
                        </div>
                        <div style={{ height: 8, backgroundColor: GRAY_10, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pctColor, borderRadius: 4 }} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </section>
              {selectedStorage.type !== "Local" && (
                <section style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>관리</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => setSelectedStorage(null)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>용량 상향</button>
                    <button type="button" onClick={() => setSelectedStorage(null)} style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "rgba(239,68,68,0.08)", color: RED, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}>삭제</button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}


// ─── Credit History ───────────────────────────────────────────────────────────
type PlatformCreditType = "관리자 지급" | "관리자 회수" | "서버 사용" | "볼륨 스토리지 사용" | "공유 스토리지 사용";

const platformCreditHistory: {
  date: string; time: string; wsId: string; wsName: string;
  type: PlatformCreditType; desc: string; amount: number; by: string; byEmail?: string;
}[] = [
  { date: "2026-07-09", time: "10:15:02", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "관리자 지급",      desc: "서비스 크레딧 장애 보상",               amount:  10000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
  { date: "2026-07-08", time: "23:00:00", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "서버 사용",        desc: "pytorch-dev-01 컴퓨팅 청구",            amount:   -240, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-08", time: "23:00:00", wsId: "ws-d7e9a1b5", wsName: "Team Alpha",      type: "서버 사용",        desc: "llm-finetuning 컴퓨팅 청구",            amount:   -576, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-08", time: "23:00:00", wsId: "ws-d7e9a1b5", wsName: "Team Alpha",      type: "서버 사용",        desc: "stable-diffusion 컴퓨팅 청구",          amount:   -120, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "볼륨 스토리지 사용", desc: "local-vol-01 볼륨 스토리지 청구",       amount:    -32, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "볼륨 스토리지 사용", desc: "pytorch-data 볼륨 스토리지 청구",       amount:    -16, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-d7e9a1b5", wsName: "Team Alpha",      type: "볼륨 스토리지 사용", desc: "local-vol-02 볼륨 스토리지 청구",       amount:    -16, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "공유 스토리지 사용", desc: "shared-team-01 공유 스토리지 청구",     amount:    -96, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-c2f4d8e3", wsName: "ML Research Lab", type: "서버 사용",        desc: "bert-finetune 컴퓨팅 청구",             amount:   -480, by: "김태민", byEmail: "taemin.kim@sdt.inc"       },
  { date: "2026-07-06", time: "23:00:00", wsId: "ws-c2f4d8e3", wsName: "ML Research Lab", type: "공유 스토리지 사용", desc: "shared-team-01 공유 스토리지 청구",     amount:    -96, by: "김태민", byEmail: "taemin.kim@sdt.inc"       },
  { date: "2026-07-05", time: "17:58:30", wsId: "ws-c2f4d8e3", wsName: "ML Research Lab", type: "관리자 회수",      desc: "정책 위반 크레딧 회수",                 amount:  -2000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
  { date: "2026-07-03", time: "09:22:11", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "관리자 지급",      desc: "프로모션 크레딧 베타 참여 보상",        amount:  20000, by: "박성민", byEmail: "sungmin.park@sdt.inc"     },
  { date: "2026-07-02", time: "23:00:00", wsId: "ws-d7e9a1b5", wsName: "Team Alpha",      type: "서버 사용",        desc: "data-preprocess 컴퓨팅 청구",           amount:   -360, by: "최유진", byEmail: "yujin.choi@sdt.inc"       },
  { date: "2026-07-01", time: "08:30:19", wsId: "ws-b6a9c7d4", wsName: "Old Project",     type: "관리자 회수",      desc: "계정 해지 최종 정산",                 amount:  -1000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
];

// ─── System Settings ──────────────────────────────────────────────────────────
function LogoSlot({ id, label, desc, hint, src, onUpload, onRemove }: {
  id: string; label: string; desc: string; hint: string;
  src: string | null; onUpload: (f: File) => void; onRemove: () => void;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{label}</div>
      <label htmlFor={id} style={{ cursor: "pointer", display: "block" }}>
        <div style={{ height: 80, borderRadius: 10, border: `1.5px dashed ${GRAY_30}`, backgroundColor: GRAY_5, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = GRAY_30; }}>
          {src
            ? <img src={src} alt={label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 8 }} />
            : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Image size={18} color={GRAY_40} />
                <span style={{ fontSize: 10, color: GRAY_40 }}>Upload</span>
              </div>
          }
        </div>
        <input id={id} type="file" accept=".png,.svg,.jpg,.jpeg,.ico,.webp" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
      </label>
      <div style={{ fontSize: 10, color: GRAY_40 }}>{hint}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <PrimaryBtn size="xsmall" variant="secondary" onClick={() => document.getElementById(id)?.click()}>
          {src ? "Re-upload" : "Upload"}
        </PrimaryBtn>
        {src && (
          <PrimaryBtn size="xsmall" variant="danger" onClick={onRemove}>Remove</PrimaryBtn>
        )}
      </div>
    </div>
  );
}

export function AdminSystemSettings() {
  const [mainLogo,    setMainLogo]    = useState<string | null>(null);
  const [subLogo,     setSubLogo]     = useState<string | null>(null);
  const [faviconLogo, setFaviconLogo] = useState<string | null>(null);

  const readFile = (file: File, setter: (s: string) => void) => {
    const reader = new FileReader();
    reader.onload = e => { if (e.target?.result) setter(e.target.result as string); };
    reader.readAsDataURL(file);
  };

  return (
    <PageContainer title="System Settings" subtitle="Configure SMTP relay and Image Repository integration for the platform.">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>

        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Page Settings</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 20 }}>Upload and manage logos displayed across the platform UI.</div>
          <div style={{ display: "flex", gap: 16 }}>
            <LogoSlot id="logo-main"    label="Main Logo" desc="Header, login screen" hint="SVG, PNG · Recommended 160×48px"
              src={mainLogo}    onUpload={f => readFile(f, setMainLogo)}    onRemove={() => setMainLogo(null)} />
            <LogoSlot id="logo-sub"     label="Sub Logo"  desc="Collapsed sidebar"    hint="SVG, PNG · Recommended 36×36px"
              src={subLogo}     onUpload={f => readFile(f, setSubLogo)}     onRemove={() => setSubLogo(null)} />
            <LogoSlot id="logo-favicon" label="Favicon"   desc="Browser tab icon"     hint="ICO, PNG · Recommended 32×32px"
              src={faviconLogo} onUpload={f => readFile(f, setFaviconLogo)} onRemove={() => setFaviconLogo(null)} />
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <PrimaryBtn size="small">Apply</PrimaryBtn>
          </div>
        </Card>

        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>SMTP Relay Configuration</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>Outbound mail relay settings applied to all transactional and alert notifications.</div>
          {[
            { label: "Display Name",        value: "NeuroStack GPUaaS" },
            { label: "Envelope From",       value: "noreply@neurostack.sdt.inc" },
            { label: "Relay Host",          value: "smtp.sdt.inc" },
            { label: "Relay Port",          value: "587" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid rgb(242,242,242)` }}>
              <div style={{ fontSize: 13, color: GRAY_60, width: 140 }}>{label}</div>
              <input type="text" defaultValue={value} style={{ flex: 1, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13 }} />
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <PrimaryBtn size="small" variant="secondary">Verify Relay</PrimaryBtn>
            <PrimaryBtn size="small">Apply</PrimaryBtn>
          </div>
        </Card>

        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Image Repository Integration</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>Configure the Image Repository endpoint for automated catalog synchronization and image lifecycle management.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>Registry Endpoint</div>
              <input type="text" defaultValue="https://registry.sdt.inc/api/v1" style={{ width: "100%", height: 40, padding: "0 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <PrimaryBtn size="small">Apply</PrimaryBtn>
          </div>
        </Card>

      </div>
    </PageContainer>
  );
}

// ─── Storage Pricing Policy (table + drawer edit) ─────────────────────────────
function StoragePricingPolicy({ showCreate, setShowCreate }: { showCreate: boolean; setShowCreate: (v: boolean) => void }) {
  type Unit = "h" | "m" | "d";
  type PolicyRow = { id: string; type: string; color: string; ratePerGB: string; unit: Unit; billingStop: string };
  type HistEntry = { ver: number; at: string; applyAt: string; byName: string; by: string; ratePerGB: string; unit: Unit; billingStop: string };

  const [policies, setPolicies] = useState<PolicyRow[]>([
    { id: "tmp",    type: "Local",  color: BLUE,    ratePerGB: "0.05", unit: "h", billingStop: "서버 중지 시" },
    { id: "local",  type: "Volume", color: PRIMARY, ratePerGB: "0.10", unit: "h", billingStop: "서버 삭제 시" },
    { id: "shared", type: "Shared", color: GREEN,   ratePerGB: "0.15", unit: "h", billingStop: "없음" },
  ]);
  const [histories, setHistories] = useState<Record<string, HistEntry[]>>({
    tmp: [
      { ver: 3, at: "2026-06-01 09:00:00", applyAt: "2026-06-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.06", unit: "h", billingStop: "서버 중지 시" },
      { ver: 2, at: "2026-04-01 10:00:00", applyAt: "2026-04-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.05", unit: "h", billingStop: "서버 중지 시" },
      { ver: 1, at: "2026-01-01 00:00:00", applyAt: "2026-01-02 00:00", byName: "김민준", by: "minjun.kim@sdt.inc", ratePerGB: "0.03", unit: "h", billingStop: "서버 중지 시" },
    ],
    local: [
      { ver: 5, at: "2026-07-15 10:30:44", applyAt: "2026-07-18 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.11", unit: "h", billingStop: "서버 삭제 시" },
      { ver: 4, at: "2026-06-01 09:00:00", applyAt: "2026-06-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.12", unit: "h", billingStop: "서버 삭제 시" },
      { ver: 3, at: "2026-04-01 14:00:00", applyAt: "2026-04-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.10", unit: "h", billingStop: "서버 삭제 시" },
      { ver: 2, at: "2026-03-01 09:00:00", applyAt: "2026-03-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.09", unit: "h", billingStop: "서버 삭제 시" },
      { ver: 1, at: "2026-01-01 00:00:00", applyAt: "2026-01-02 00:00", byName: "김민준", by: "minjun.kim@sdt.inc", ratePerGB: "0.08", unit: "h", billingStop: "서버 삭제 시" },
    ],
    shared: [
      { ver: 4, at: "2026-07-15 09:00:00", applyAt: "2026-07-20 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.18", unit: "h", billingStop: "없음" },
      { ver: 3, at: "2026-07-14 14:00:00", applyAt: "2026-07-15 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.18", unit: "h", billingStop: "없음" },
      { ver: 2, at: "2026-06-01 09:00:00", applyAt: "2026-06-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: "0.15", unit: "h", billingStop: "없음" },
      { ver: 1, at: "2026-01-01 00:00:00", applyAt: "2026-01-02 00:00", byName: "김민준", by: "minjun.kim@sdt.inc", ratePerGB: "0.12", unit: "h", billingStop: "없음" },
    ],
  });
  const [draft, setDraft] = useState<PolicyRow | null>(null);
  const [drawerTab, setDrawerTab] = useState<"edit" | "history">("edit");
  const [applyAt, setApplyAt] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);

  const tomorrowDate = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  };

  const openDrawer = (p: PolicyRow) => { setDraft({ ...p }); setDrawerTab("edit"); setApplyAt(tomorrowDate()); };
  const closeDrawer = () => setDraft(null);
  const saveEdit = () => {
    if (!draft) return;
    const prevHist = histories[draft.id] || [];
    const newVer = (prevHist[0]?.ver ?? 0) + 1;
    const now = new Date(); const p = (n: number) => String(n).padStart(2, "0");
    const at = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`;
    setHistories(h => ({ ...h, [draft.id]: [{ ver: newVer, at, applyAt: `${applyAt} 00:00`, byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: draft.ratePerGB, unit: draft.unit, billingStop: draft.billingStop }, ...prevHist] }));
    setPolicies(ps => ps.map(p => p.id === draft.id ? draft : p));
    closeDrawer();
  };

  const previewVal = (rate: string, u: Unit) => {
    const r = parseFloat(rate || "0") * 100;
    return u === "h" ? r : u === "m" ? r / 60 : r * 24;
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 40, padding: "0 12px", borderRadius: 8,
    border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  const blankCreate = { selectedId: "", ratePerGB: "", unit: "h" as Unit };
  const [createForm, setCreateForm] = useState(blankCreate);
  const [createApplyAt, setCreateApplyAt] = useState("");
  const [createSearch, setCreateSearch] = useState("");
  const [createSort, setCreateSort] = useState<{ key: "type" | "rate"; dir: "asc" | "desc" }>({ key: "type", dir: "asc" });
  const [createUnitFilter, setCreateUnitFilter] = useState<Unit | "all">("all");
  const saveCreate = () => {
    const target = policies.find(p => p.id === createForm.selectedId);
    if (!target) return;
    const now = new Date(); const pad = (n: number) => String(n).padStart(2, "0");
    const at = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const prevHist = histories[target.id] || [];
    const newVer = (prevHist[0]?.ver ?? 0) + 1;
    setHistories(h => ({ ...h, [target.id]: [{ ver: newVer, at, applyAt: `${createApplyAt}`, byName: "이지염", by: "jiyeom.lee@sdt.inc", ratePerGB: createForm.ratePerGB, unit: createForm.unit, billingStop: target.billingStop }, ...prevHist] }));
    setPolicies(ps => ps.map(p => p.id === target.id ? { ...p, ratePerGB: createForm.ratePerGB, unit: createForm.unit } : p));
    setShowCreate(false);
  };
  const toggleStorageSort = (key: "type" | "rate") => setCreateSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  const storageSortIcon = (key: "type" | "rate") => {
    if (createSort.key !== key) return <ChevronUp size={10} color={GRAY_40} style={{ marginLeft: 2, flexShrink: 0 }} />;
    return createSort.dir === "asc" ? <ChevronUp size={10} color={PRIMARY} style={{ marginLeft: 2, flexShrink: 0 }} /> : <ChevronDown size={10} color={PRIMARY} style={{ marginLeft: 2, flexShrink: 0 }} />;
  };
  const filteredCreatePolicies = (() => {
    const q = createSearch.trim().toLowerCase();
    let list = policies.filter(p => {
      if (q && !p.type.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false;
      if (createUnitFilter !== "all" && p.unit !== createUnitFilter) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      const dir = createSort.dir === "asc" ? 1 : -1;
      if (createSort.key === "type") return a.type.localeCompare(b.type) * dir;
      return (parseFloat(a.ratePerGB) - parseFloat(b.ratePerGB)) * dir;
    });
  })();
  useEffect(() => { if (showCreate) { setCreateForm(blankCreate); setCreateApplyAt(tomorrowDate()); setCreateSearch(""); setCreateSort({ key: "type", dir: "asc" }); setCreateUnitFilter("all"); } }, [showCreate]);

  return (
    <>
      {/* Info banner */}
      {(() => {
        const now = new Date();
        const pendingCount = policies.filter(p => (histories[p.id] || []).some(h => new Date(h.applyAt.replace(" ", "T")) > now)).length;
        return pendingCount > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: PRIMARY_10, borderRadius: 10, marginBottom: 12 }}>
            <AlertTriangle size={12} color={PRIMARY} />
            <span style={{ fontSize: 12, color: PRIMARY }}>현재 적용 예정인 스토리지 가격 정책이 <strong>{pendingCount}건</strong> 있습니다.</span>
          </div>
        ) : null;
      })()}

      <Card style={{ overflow: "hidden" }}>
        <Table
          spacerGaps
          headers={["정책명", "상태", "대상", "정책 내용", "적용일", "액션"]}
          rows={policies.map(p => {
            const now = new Date();
            const hist = histories[p.id] || [];
            const pendingEntry = hist.find(h => new Date(h.applyAt.replace(" ", "T")) > now);
            const currentEntry = hist.find(h => new Date(h.applyAt.replace(" ", "T")) <= now);
            return [
            /* 정책명 */
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ScrollText size={13} color={PRIMARY} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{p.type.toLowerCase()}-policy{currentEntry ? `-v${currentEntry.ver}` : ""}</span>
                {pendingEntry && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: YELLOW_10, borderRadius: 10, width: "fit-content" }}>
                    <Clock size={10} color={YELLOW} />
                    <span style={{ fontSize: 11, color: YELLOW, whiteSpace: "nowrap" }}>v{pendingEntry.ver} 적용 예정일: {pendingEntry.applyAt.split(" ")[0]}</span>
                  </div>
                )}
              </div>
            </div>,
            /* 상태 */
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap", backgroundColor: "rgba(34,197,94,0.1)", color: GREEN }}>활성</span>,
            /* 대상 */
            <span style={{ fontSize: 13, color: GRAY_70, whiteSpace: "nowrap" }}>{p.type} Storage</span>,
            /* 정책 내용 */
            <span style={{ fontSize: 13, color: GRAY_70, whiteSpace: "nowrap" }}>{p.ratePerGB} cr / GB / {p.unit}</span>,
            /* 적용일 */
            <span style={{ fontSize: 12, color: GRAY_60, whiteSpace: "nowrap" }}>{currentEntry ? currentEntry.applyAt.split(" ")[0] : "—"}</span>,
            /* 액션 */
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button type="button" onClick={() => openDrawer(p)} style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
              <div style={{ position: "relative" }}>
                {openMenuId === p.id && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                <button type="button" onClick={(e) => { if (openMenuId !== p.id) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === p.id ? null : p.id); }}
                  style={{ height: 28, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === p.id ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                  onMouseEnter={e => { if (openMenuId !== p.id) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                  onMouseLeave={e => { if (openMenuId !== p.id) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                  <span style={{ padding: "0 8px 0 10px" }}>관리</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === p.id ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${openMenuId === p.id ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                    <ChevronDown size={11} color={PRIMARY} style={{ transform: openMenuId === p.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </span>
                </button>
                {openMenuId === p.id && menuAnchor && (
                  <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 140, padding: "4px 0" }}>
                    {pendingEntry
                      ? <button type="button" onClick={() => { openDrawer(p); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>새 버전 수정</button>
                      : <button type="button" onClick={() => { openDrawer(p); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>새 버전 생성</button>
                    }
                    <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                    <button type="button" onClick={() => { setPolicies(ps => ps.filter(x => x.id !== p.id)); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>삭제</button>
                  </div>
                )}
              </div>
            </div>,
          ]; })}
        />
      </Card>

      {/* Drawer */}
      {draft && (
        <>
          <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 290 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, backgroundColor: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)", zIndex: 300, display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${GRAY_10}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: draft.id === "tmp" ? "rgba(36,142,213,0.12)" : draft.id === "local" ? "rgba(99,90,220,0.12)" : "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Database size={14} color={draft.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{draft.type}</div>
                    <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>가격 정책 수정</div>
                  </div>
                </div>
                <button type="button" onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${GRAY_10}`, padding: "0 24px" }}>
              {(["edit", "history"] as const).map(t => {
                const hasPending = (histories[draft.id] || []).some(h => new Date(h.applyAt.replace(" ", "T")) > new Date());
                const label = t === "edit" ? (hasPending ? "새 버전 수정" : "새 버전 생성") : `버전 변경 이력 (${(histories[draft.id] || []).length})`;
                return (
                  <button key={t} type="button" onClick={() => setDrawerTab(t)} style={{ padding: "10px 14px", fontSize: 13, fontWeight: drawerTab === t ? 600 : 400, color: drawerTab === t ? PRIMARY : GRAY_60, background: "none", border: "none", borderBottom: `2px solid ${drawerTab === t ? PRIMARY : "transparent"}`, cursor: "pointer", marginBottom: -1, fontFamily: "inherit" }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* 변경 이력 탭 */}
            {drawerTab === "history" && (
              <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                {(histories[draft.id] || []).length === 0
                  ? <div style={{ fontSize: 13, color: GRAY_40, textAlign: "center", marginTop: 40 }}>변경 이력이 없습니다.</div>
                  : (() => {
                    const now = new Date();
                    const isPending = (h: HistEntry) => new Date(h.applyAt.replace(" ", "T")) > now;
                    const firstActiveIdx = (histories[draft.id] || []).findIndex(e => !isPending(e));
                    return (histories[draft.id] || []).map((h, i, arr) => {
                      const pending = isPending(h);
                      const isCurrent = !pending && i === firstActiveIdx;
                      const dotColor = pending ? ORANGE : isCurrent ? PRIMARY : GRAY_30;
                      return (
                        <div key={h.ver} style={{ position: "relative", paddingLeft: 22, paddingBottom: i < arr.length - 1 ? 24 : 0 }}>
                          <div style={{ position: "absolute", left: 0, top: 5, width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor }} />
                          {i < arr.length - 1 && <div style={{ position: "absolute", left: 3, top: 13, bottom: 0, width: 2, backgroundColor: GRAY_10 }} />}
                          {/* 버전 + 상태 */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, backgroundColor: isCurrent ? PRIMARY_10 : GRAY_10, color: isCurrent ? PRIMARY : GRAY_60 }}>v{h.ver}</span>
                            {isCurrent && <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>현재 적용 중</span>}
                            {pending && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: YELLOW_10, borderRadius: 10 }}>
                                <Clock size={10} color={YELLOW} />
                                <span style={{ fontSize: 11, color: YELLOW }}>v{h.ver} 적용 예정일: {h.applyAt.split(" ")[0]}</span>
                              </div>
                            )}
                          </div>
                          {/* 단가 */}
                          <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 6 }}>
                            {h.ratePerGB} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>cr / GB / {h.unit}</span>
                          </div>
                          {/* 메타 */}
                          <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", rowGap: 3 }}>
                            <span style={{ fontSize: 11, color: GRAY_40 }}>적용일</span>
                            <span style={{ fontSize: 11, color: GRAY_60 }}>{h.applyAt.split(" ")[0]}</span>
                            <span style={{ fontSize: 11, color: GRAY_40 }}>등록 일시</span>
                            <span style={{ fontSize: 11, color: GRAY_60 }}>{h.at}</span>
                            <span style={{ fontSize: 11, color: GRAY_40 }}>등록자</span>
                            <span style={{ fontSize: 11, color: GRAY_60 }}>{h.byName} ({h.by})</span>
                          </div>
                        </div>
                      );
                    });
                  })()
                }
              </div>
            )}

            {/* 편집 탭 */}
            {drawerTab === "edit" && <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

              {/* 버전명 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>버전명</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_10}`, backgroundColor: GRAY_5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_70 }}>v{(histories[draft.id]?.[0]?.ver ?? 0) + 1}</span>
                  <span style={{ fontSize: 10, color: GRAY_40, backgroundColor: "white", border: `1px solid ${GRAY_10}`, borderRadius: 4, padding: "1px 6px" }}>자동 생성</span>
                </div>
              </div>

              {/* 가격 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>가격</div>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, overflow: "hidden", transition: "border-color 0.1s" }}
                  onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; }}
                  onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = GRAY_30; }}>
                  <input type="number" step="0.01" min="0" value={draft.ratePerGB}
                    onChange={e => setDraft(d => d ? { ...d, ratePerGB: e.target.value } : d)}
                    style={{ flex: 1, height: 42, padding: "0 12px", border: "none", fontSize: 15, fontWeight: 700, outline: "none", minWidth: 0 }}
                  />
                  <div style={{ padding: "0 12px", fontSize: 12, color: GRAY_60, backgroundColor: GRAY_5, height: 42, display: "flex", alignItems: "center", borderLeft: `1px solid ${GRAY_10}`, whiteSpace: "nowrap" }}>
                    cr / GB
                  </div>
                </div>
              </div>

              {/* 과금 단위 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>과금 단위</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["h", "m", "d"] as Unit[]).map(u => (
                    <button type="button" key={u} onClick={() => setDraft(d => d ? { ...d, unit: u } : d)} style={{
                      flex: 1, height: 40, fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                      border: `1.5px solid ${draft.unit === u ? PRIMARY : GRAY_30}`,
                      backgroundColor: draft.unit === u ? `rgba(99,90,220,0.07)` : "white",
                      color: draft.unit === u ? PRIMARY : GRAY_60,
                      fontFamily: "inherit", transition: "all 0.1s",
                    }}>{u === "h" ? "시간 (h)" : u === "m" ? "분 (m)" : "일 (d)"}</button>
                  ))}
                </div>
              </div>

              {/* 변경 적용일 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>변경 적용일</div>
                <div style={{ position: "relative", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, height: 42, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", cursor: "pointer" }}>
                  <span style={{ fontSize: 13, color: applyAt ? GRAY_90 : GRAY_40, pointerEvents: "none", userSelect: "none" }}>
                    {applyAt ? applyAt : "YYYY-MM-DD"}
                  </span>
                  <Calendar size={14} color={GRAY_60} style={{ pointerEvents: "none", flexShrink: 0 }} />
                  <input type="date" value={applyAt} min={tomorrowDate()}
                    onChange={e => setApplyAt(e.target.value)}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                  />
                </div>
              </div>

              {/* 미리보기 */}
              <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 14 }}>미리보기 · 100GB 기준</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: GRAY_60 }}>정책명</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>{draft.id}-policy-v{(histories[draft.id]?.[0]?.ver ?? 0) + 1}</span>
                </div>
                {applyAt && (
                  <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${GRAY_10}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>적용일</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>{applyAt}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>상태</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, backgroundColor: ORANGE_10, color: ORANGE }}>적용 예정</span>
                    </div>
                  </div>
                )}
                {(() => {
                  const r = parseFloat(draft.ratePerGB || "0") * 100;
                  const perUnit = r;
                  const perDay  = draft.unit === "h" ? r * 24 : draft.unit === "m" ? r * 60 * 24 : r;
                  const perMonth = perDay * 30;
                  const rows = [
                    { label: `1${draft.unit}당`, val: perUnit.toFixed(2) },
                    { label: "일당",             val: perDay.toFixed(1) },
                    { label: "30일",             val: perMonth.toFixed(0) },
                  ];
                  return rows.map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: draft.color }}>{val} cr</span>
                    </div>
                  ));
                })()}
              </div>

              {/* 버튼 */}
              <div style={{ borderTop: `1px solid ${GRAY_10}`, marginTop: 24, paddingTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <PrimaryBtn size="small" onClick={saveEdit}>저장</PrimaryBtn>
                <PrimaryBtn size="small" variant="secondary" onClick={closeDrawer}>취소</PrimaryBtn>
              </div>
            </div>}
          </div>
        </>
      )}
      {/* Create Drawer */}
      {showCreate && (
        <>
          <div onClick={() => setShowCreate(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 290 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, backgroundColor: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)", zIndex: 300, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${GRAY_10}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ScrollText size={14} color={PRIMARY} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>가격 정책 등록</div>
                    <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>새 스토리지 가격 정책을 등록합니다.</div>
                  </div>
                </div>
                <button type="button" onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>스토리지 타입 선택</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ position: "relative" }}>
                    <Search size={12} color={GRAY_60} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input type="text" placeholder="검색어를 입력하세요." value={createSearch} onChange={e => setCreateSearch(e.target.value)}
                      style={{ width: "100%", height: 32, paddingLeft: 28, paddingRight: 10, borderRadius: 7, border: `1.5px solid ${GRAY_10}`, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                      onFocus={e => { e.target.style.borderColor = PRIMARY; }} onBlur={e => { e.target.style.borderColor = GRAY_10; }} />
                  </div>
                </div>
                <Card style={{ overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: GRAY_5 }}>
                        <th onClick={() => toggleStorageSort("type")} style={{ padding: "7px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: GRAY_60, borderBottom: `1px solid ${GRAY_10}`, cursor: "pointer", userSelect: "none" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>스토리지 타입{storageSortIcon("type")}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCreatePolicies.length === 0 ? (
                        <tr><td style={{ padding: "20px 14px", textAlign: "center", fontSize: 12, color: GRAY_40 }}>검색 결과가 없습니다.</td></tr>
                      ) : filteredCreatePolicies.map((p, idx) => {
                        const sel = createForm.selectedId === p.id;
                        const isLast = idx === filteredCreatePolicies.length - 1;
                        return (
                          <tr key={p.id} onClick={() => setCreateForm(f => ({ ...f, selectedId: p.id }))}
                            style={{ cursor: "pointer", backgroundColor: sel ? PRIMARY_10 : "white" }}
                            onMouseEnter={e => { if (!sel) e.currentTarget.style.backgroundColor = GRAY_5; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = sel ? PRIMARY_10 : "white"; }}>
                            <td style={{ padding: "10px 14px", borderBottom: isLast ? "none" : `1px solid ${GRAY_10}` }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: sel ? PRIMARY : GRAY_90 }}>{p.type}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>버전명</div>
                <div style={{ height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_10}`, backgroundColor: GRAY_5, display: "flex", alignItems: "center" }}>
                  {createForm.selectedId
                    ? <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_70 }}>v{(histories[createForm.selectedId]?.[0]?.ver ?? 0) + 1}</span>
                    : <span style={{ fontSize: 13, color: GRAY_40 }}>타입을 선택하면 자동 생성됩니다.</span>
                  }
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>가격</div>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, overflow: "hidden" }}
                  onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; }}
                  onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = GRAY_30; }}>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={createForm.ratePerGB}
                    onChange={e => setCreateForm(f => ({ ...f, ratePerGB: e.target.value }))}
                    style={{ flex: 1, height: 42, padding: "0 12px", border: "none", fontSize: 15, fontWeight: 700, outline: "none", minWidth: 0 }} />
                  <div style={{ padding: "0 12px", fontSize: 12, color: GRAY_60, backgroundColor: GRAY_5, height: 42, display: "flex", alignItems: "center", borderLeft: `1px solid ${GRAY_10}`, whiteSpace: "nowrap" }}>cr / GB</div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>과금 단위</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["h", "m", "d"] as Unit[]).map(u => (
                    <button type="button" key={u} onClick={() => setCreateForm(f => ({ ...f, unit: u }))} style={{
                      flex: 1, height: 40, fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                      border: `1.5px solid ${createForm.unit === u ? PRIMARY : GRAY_30}`,
                      backgroundColor: createForm.unit === u ? "rgba(99,90,220,0.07)" : "white",
                      color: createForm.unit === u ? PRIMARY : GRAY_60, fontFamily: "inherit", transition: "all 0.1s",
                    }}>{u === "h" ? "시간 (h)" : u === "m" ? "분 (m)" : "일 (d)"}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>적용일</div>
                <div style={{ position: "relative", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, height: 42, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", cursor: "pointer" }}>
                  <span style={{ fontSize: 13, color: createApplyAt ? GRAY_90 : GRAY_40, pointerEvents: "none", userSelect: "none" }}>
                    {createApplyAt ? `${createApplyAt}` : "YYYY-MM-DD"}
                  </span>
                  <Calendar size={14} color={GRAY_60} style={{ pointerEvents: "none", flexShrink: 0 }} />
                  <input type="date" value={createApplyAt} min={tomorrowDate()}
                    onChange={e => setCreateApplyAt(e.target.value)}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
                </div>
              </div>
              {/* 미리보기 */}
              <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 14 }}>미리보기 · 100GB 기준</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: GRAY_60 }}>정책명</span>
                  {createForm.selectedId
                    ? <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>{createForm.selectedId}-policy-v{(histories[createForm.selectedId]?.[0]?.ver ?? 0) + 1}</span>
                    : <span style={{ fontSize: 12, color: GRAY_40 }}>—</span>
                  }
                </div>
                {createApplyAt && (
                  <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${GRAY_10}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>적용일</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>{createApplyAt}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>상태</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, backgroundColor: ORANGE_10, color: ORANGE }}>적용 예정</span>
                    </div>
                  </div>
                )}
                {(() => {
                  const r = parseFloat(createForm.ratePerGB || "0") * 100;
                  const perDay = createForm.unit === "h" ? r * 24 : createForm.unit === "m" ? r * 60 * 24 : r;
                  return [
                    { label: `1${createForm.unit}당`, val: r.toFixed(2) },
                    { label: "일당",                  val: perDay.toFixed(1) },
                    { label: "30일",                  val: (perDay * 30).toFixed(0) },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{val} cr</span>
                    </div>
                  ));
                })()}
              </div>
              <div style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <PrimaryBtn size="small" onClick={saveCreate}>등록</PrimaryBtn>
                <PrimaryBtn size="small" variant="secondary" onClick={() => setShowCreate(false)}>취소</PrimaryBtn>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── GPU Type Pricing ─────────────────────────────────────────────────────────
type GpuUnit = "min" | "h" | "day";
type GpuPrice = { id: string; name: string; vram: string; rate: string; unit: GpuUnit; enabled: boolean; disabledAt?: string };
const INIT_GPU_PRICES: GpuPrice[] = [
  { id: "h100",  name: "H100 SXM5", vram: "80GB", rate: "210.00", unit: "h", enabled: true  },
  { id: "a100",  name: "A100 SXM4", vram: "80GB", rate: "120.00", unit: "h", enabled: true  },
  { id: "a5000", name: "RTX A5000", vram: "24GB", rate: "48.00",  unit: "h", enabled: true  },
  { id: "r4090", name: "RTX 4090",  vram: "24GB", rate: "42.00",  unit: "h", enabled: false, disabledAt: "2026-07-01" },
];

function GPUPricingContent({ prices, setPrices, showCreate, setShowCreate }: { prices: GpuPrice[]; setPrices: React.Dispatch<React.SetStateAction<GpuPrice[]>>; showCreate: boolean; setShowCreate: (v: boolean) => void }) {
  type GpuHistEntry = { ver: number; at: string; applyAt: string; byName: string; by: string; rate: string; unit: GpuUnit };
  const [histories, setHistories] = useState<Record<string, GpuHistEntry[]>>({
    h100:  [
      { ver: 4, at: "2026-07-15 11:00:22", applyAt: "2026-07-19 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "230.00", unit: "h" },
      { ver: 3, at: "2026-06-01 09:00:00", applyAt: "2026-06-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "220.00", unit: "h" },
      { ver: 2, at: "2026-04-01 10:00:00", applyAt: "2026-04-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "210.00", unit: "h" },
      { ver: 1, at: "2026-01-01 00:00:00", applyAt: "2026-01-02 00:00", byName: "김민준", by: "minjun.kim@sdt.inc", rate: "180.00", unit: "h" },
    ],
    a100:  [
      { ver: 3, at: "2026-05-15 10:30:00", applyAt: "2026-05-16 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "130.00", unit: "h" },
      { ver: 2, at: "2026-03-01 09:00:00", applyAt: "2026-03-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "120.00", unit: "h" },
      { ver: 1, at: "2026-01-01 00:00:00", applyAt: "2026-01-02 00:00", byName: "김민준", by: "minjun.kim@sdt.inc", rate: "100.00", unit: "h" },
    ],
    a5000: [
      { ver: 4, at: "2026-07-15 09:30:15", applyAt: "2026-07-21 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "54.00", unit: "h" },
      { ver: 3, at: "2026-07-14 11:00:00", applyAt: "2026-07-15 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "52.00", unit: "h" },
      { ver: 2, at: "2026-06-01 09:00:00", applyAt: "2026-06-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "48.00", unit: "h" },
      { ver: 1, at: "2026-01-01 00:00:00", applyAt: "2026-01-02 00:00", byName: "김민준", by: "minjun.kim@sdt.inc", rate: "44.00", unit: "h" },
    ],
    r4090: [
      { ver: 3, at: "2026-05-15 10:30:00", applyAt: "2026-05-16 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "46.00", unit: "h" },
      { ver: 2, at: "2026-03-01 09:00:00", applyAt: "2026-03-02 00:00", byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: "42.00", unit: "h" },
      { ver: 1, at: "2026-01-01 00:00:00", applyAt: "2026-01-02 00:00", byName: "김민준", by: "minjun.kim@sdt.inc", rate: "38.00", unit: "h" },
    ],
  });
  const [draft, setDraft] = useState<GpuPrice | null>(null);
  const [drawerTab, setDrawerTab] = useState<"edit" | "history">("edit");
  const [applyAt, setApplyAt] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);

  const tomorrowDate = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  };

  const openDrawer  = (p: GpuPrice) => { setDraft({ ...p }); setDrawerTab("edit"); setApplyAt(tomorrowDate()); };
  const closeDrawer = () => setDraft(null);
  const saveEdit    = () => {
    if (!draft) return;
    const prevHist = histories[draft.id] || [];
    const now = new Date(); const pad = (n: number) => String(n).padStart(2, "0");
    const at = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const newEntry: GpuHistEntry = { ver: (prevHist[0]?.ver ?? 0) + 1, at, applyAt: `${applyAt} 00:00`, byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: draft.rate, unit: draft.unit };
    setHistories(h => ({ ...h, [draft.id]: [newEntry, ...prevHist] }));
    setPrices(ps => ps.map(p => p.id === draft.id ? draft : p));
    closeDrawer();
  };

  const unitLabel = (u: GpuUnit) => u === "min" ? "min" : u === "h" ? "h" : "day";

  const blankCreate = { selectedId: "", rate: "", unit: "h" as GpuUnit };
  const [createForm, setCreateForm] = useState(blankCreate);
  const [createApplyAt, setCreateApplyAt] = useState("");
  const [gpuCreateSearch, setGpuCreateSearch] = useState("");
  const [gpuCreateSort, setGpuCreateSort] = useState<{ key: "name" | "vram" | "rate"; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
  const [gpuCreateUnitFilter, setGpuCreateUnitFilter] = useState<GpuUnit | "all">("all");
  const saveCreate = () => {
    const target = prices.find(p => p.id === createForm.selectedId);
    if (!target) return;
    const now = new Date(); const pad = (n: number) => String(n).padStart(2, "0");
    const at = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const prevHist = histories[target.id] || [];
    const newVer = (prevHist[0]?.ver ?? 0) + 1;
    setHistories(h => ({ ...h, [target.id]: [{ ver: newVer, at, applyAt: `${createApplyAt}`, byName: "이지염", by: "jiyeom.lee@sdt.inc", rate: createForm.rate, unit: createForm.unit }, ...prevHist] }));
    setPrices(ps => ps.map(p => p.id === target.id ? { ...p, rate: createForm.rate, unit: createForm.unit } : p));
    setShowCreate(false);
  };
  const toggleGpuSort = (key: "name" | "vram" | "rate") => setGpuCreateSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  const gpuSortIcon = (key: "name" | "vram" | "rate") => {
    if (gpuCreateSort.key !== key) return <ChevronUp size={10} color={GRAY_40} style={{ marginLeft: 2, flexShrink: 0 }} />;
    return gpuCreateSort.dir === "asc" ? <ChevronUp size={10} color={PRIMARY} style={{ marginLeft: 2, flexShrink: 0 }} /> : <ChevronDown size={10} color={PRIMARY} style={{ marginLeft: 2, flexShrink: 0 }} />;
  };
  const filteredCreatePrices = (() => {
    const q = gpuCreateSearch.trim().toLowerCase();
    let list = prices.filter(p => {
      if (!p.enabled) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.vram.toLowerCase().includes(q)) return false;
      if (gpuCreateUnitFilter !== "all" && p.unit !== gpuCreateUnitFilter) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      const dir = gpuCreateSort.dir === "asc" ? 1 : -1;
      if (gpuCreateSort.key === "name") return a.name.localeCompare(b.name) * dir;
      if (gpuCreateSort.key === "vram") return (parseInt(a.vram) - parseInt(b.vram)) * dir;
      return (parseFloat(a.rate) - parseFloat(b.rate)) * dir;
    });
  })();
  useEffect(() => { if (showCreate) { setCreateForm(blankCreate); setCreateApplyAt(tomorrowDate()); setGpuCreateSearch(""); setGpuCreateSort({ key: "name", dir: "asc" }); setGpuCreateUnitFilter("all"); } }, [showCreate]);
  const gpuInputStyle: React.CSSProperties = {
    width: "100%", height: 40, padding: "0 12px", borderRadius: 8,
    border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <>

      {/* Info banner */}
      {(() => {
        const now = new Date();
        const pendingCount = prices.filter(p => (histories[p.id] || []).some(h => new Date(h.applyAt.replace(" ", "T")) > now)).length;
        return pendingCount > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: PRIMARY_10, borderRadius: 10, marginBottom: 12 }}>
            <AlertTriangle size={12} color={PRIMARY} />
            <span style={{ fontSize: 12, color: PRIMARY }}>현재 적용 예정인 GPU 가격 정책이 <strong>{pendingCount}건</strong> 있습니다.</span>
          </div>
        ) : null;
      })()}

      <Card style={{ overflow: "hidden" }}>
        <Table
          spacerGaps
          headers={["정책명", "상태", "GPU", "정책 내용", "적용일", "액션"]}
          rows={prices.map(p => {
            const now = new Date();
            const hist = histories[p.id] || [];
            const pendingEntry = hist.find(h => new Date(h.applyAt.replace(" ", "T")) > now);
            const currentEntry = hist.find(h => new Date(h.applyAt.replace(" ", "T")) <= now);
            return [
            /* 정책명 */
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ScrollText size={13} color={PRIMARY} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{p.id}-{p.vram.toLowerCase()}-policy{currentEntry ? `-v${currentEntry.ver}` : ""}</span>
                {pendingEntry && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: YELLOW_10, borderRadius: 10, width: "fit-content" }}>
                    <Clock size={10} color={YELLOW} />
                    <span style={{ fontSize: 11, color: YELLOW, whiteSpace: "nowrap" }}>v{pendingEntry.ver} 적용 예정일: {pendingEntry.applyAt.split(" ")[0]}</span>
                  </div>
                )}
                {!p.enabled && p.disabledAt && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: YELLOW_10, borderRadius: 10, width: "fit-content" }}>
                    <Clock size={10} color={YELLOW} />
                    <span style={{ fontSize: 11, color: YELLOW, whiteSpace: "nowrap" }}>비활성 일시: {p.disabledAt}</span>
                  </div>
                )}
              </div>
            </div>,
            /* 상태 */
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap", backgroundColor: p.enabled ? "rgba(34,197,94,0.1)" : GRAY_10, color: p.enabled ? GREEN : GRAY_60 }}>{p.enabled ? "활성" : "비활성"}</span>,
            /* GPU Type */
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 13, color: GRAY_70, whiteSpace: "nowrap" }}>{p.name}</span>
              <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>VRAM {p.vram}</span>
            </div>,
            /* 정책 내용 */
            <span style={{ fontSize: 13, color: GRAY_70, whiteSpace: "nowrap" }}>{p.rate} cr / GPU / {unitLabel(p.unit)}</span>,
            /* 적용일 */
            <span style={{ fontSize: 12, color: GRAY_60, whiteSpace: "nowrap" }}>{currentEntry ? currentEntry.applyAt.split(" ")[0] : "—"}</span>,
            /* 액션 */
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button type="button" onClick={() => openDrawer(p)} style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
              <div style={{ position: "relative" }}>
                {openMenuId === p.id && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                <button type="button" onClick={(e) => { if (openMenuId !== p.id) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === p.id ? null : p.id); }}
                  style={{ height: 28, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === p.id ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                  onMouseEnter={e => { if (openMenuId !== p.id) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                  onMouseLeave={e => { if (openMenuId !== p.id) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                  <span style={{ padding: "0 8px 0 10px" }}>관리</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === p.id ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${openMenuId === p.id ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                    <ChevronDown size={11} color={PRIMARY} style={{ transform: openMenuId === p.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </span>
                </button>
                {openMenuId === p.id && menuAnchor && (
                  <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 140, padding: "4px 0" }}>
                    {p.enabled && (
                      pendingEntry
                        ? <button type="button" onClick={() => { openDrawer(p); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>새 버전 수정</button>
                        : <button type="button" onClick={() => { openDrawer(p); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>새 버전 생성</button>
                    )}
                    {p.enabled && <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />}
                    <button type="button" onClick={() => { setPrices(ps => ps.filter(x => x.id !== p.id)); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>삭제</button>
                  </div>
                )}
              </div>
            </div>,
          ]; })}
        />
      </Card>

      {/* Drawer */}
      {draft && (
        <>
          <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 290 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, backgroundColor: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)", zIndex: 300, display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${GRAY_10}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(99,90,220,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Cpu size={14} color={PRIMARY} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{draft.name}</div>
                    <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>VRAM {draft.vram} · 가격 정책 수정</div>
                  </div>
                </div>
                <button type="button" onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: "flex", borderBottom: `1px solid ${GRAY_10}`, paddingLeft: 24 }}>
              {(["edit", "history"] as const).map(t => {
                const hasPending = (histories[draft.id] || []).some(h => new Date(h.applyAt.replace(" ", "T")) > new Date());
                const label = t === "edit" ? (hasPending ? "새 버전 수정" : "새 버전 생성") : `버전 변경 이력 (${(histories[draft.id] || []).length})`;
                return (
                  <button key={t} type="button" onClick={() => setDrawerTab(t)} style={{ padding: "10px 14px", fontSize: 13, fontWeight: drawerTab === t ? 600 : 400, color: drawerTab === t ? PRIMARY : GRAY_60, background: "none", border: "none", borderBottom: `2px solid ${drawerTab === t ? PRIMARY : "transparent"}`, cursor: "pointer", marginBottom: -1, fontFamily: "inherit" }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* 변경 이력 탭 */}
            {drawerTab === "history" && (
              <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                {(histories[draft.id] || []).length === 0
                  ? <div style={{ fontSize: 13, color: GRAY_40, textAlign: "center", marginTop: 40 }}>변경 이력이 없습니다.</div>
                  : (() => {
                    const now = new Date();
                    const isPendingEntry = (h: GpuHistEntry) => new Date(h.applyAt.replace(" ", "T")) > now;
                    const firstActiveIdx = (histories[draft.id] || []).findIndex(e => !isPendingEntry(e));
                    return (histories[draft.id] || []).map((h, i, arr) => {
                      const pending = isPendingEntry(h);
                      const isCurrent = !pending && i === firstActiveIdx;
                      const dotColor = pending ? ORANGE : isCurrent ? PRIMARY : GRAY_30;
                      return (
                        <div key={h.ver} style={{ position: "relative", paddingLeft: 22, paddingBottom: i < arr.length - 1 ? 24 : 0 }}>
                          <div style={{ position: "absolute", left: 0, top: 5, width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor }} />
                          {i < arr.length - 1 && <div style={{ position: "absolute", left: 3, top: 13, bottom: 0, width: 2, backgroundColor: GRAY_10 }} />}
                          {/* 버전 + 상태 */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, backgroundColor: isCurrent ? PRIMARY_10 : GRAY_10, color: isCurrent ? PRIMARY : GRAY_60 }}>v{h.ver}</span>
                            {isCurrent && <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>현재 적용 중</span>}
                            {pending && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: YELLOW_10, borderRadius: 10 }}>
                                <Clock size={10} color={YELLOW} />
                                <span style={{ fontSize: 11, color: YELLOW }}>v{h.ver} 적용 예정일: {h.applyAt.split(" ")[0]}</span>
                              </div>
                            )}
                          </div>
                          {/* 단가 */}
                          <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 6 }}>
                            {h.rate} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>cr / GPU / {unitLabel(h.unit)}</span>
                          </div>
                          {/* 메타 */}
                          <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", rowGap: 3 }}>
                            <span style={{ fontSize: 11, color: GRAY_40 }}>적용일</span>
                            <span style={{ fontSize: 11, color: GRAY_60 }}>{h.applyAt.split(" ")[0]}</span>
                            <span style={{ fontSize: 11, color: GRAY_40 }}>등록 일시</span>
                            <span style={{ fontSize: 11, color: GRAY_60 }}>{h.at}</span>
                            <span style={{ fontSize: 11, color: GRAY_40 }}>등록자</span>
                            <span style={{ fontSize: 11, color: GRAY_60 }}>{h.byName} ({h.by})</span>
                          </div>
                        </div>
                      );
                    });
                  })()
                }
              </div>
            )}

            {/* 편집 탭 */}
            {drawerTab === "edit" && <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {/* 버전명 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>버전명</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_10}`, backgroundColor: GRAY_5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_70 }}>v{(histories[draft.id]?.[0]?.ver ?? 0) + 1}</span>
                  <span style={{ fontSize: 10, color: GRAY_40, backgroundColor: "white", border: `1px solid ${GRAY_10}`, borderRadius: 4, padding: "1px 6px" }}>자동 생성</span>
                </div>
              </div>
              {/* 가격 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>가격</div>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, overflow: "hidden" }}
                  onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; }}
                  onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = GRAY_30; }}>
                  <input type="number" step="0.01" min="0" value={draft.rate}
                    onChange={e => setDraft(d => d ? { ...d, rate: e.target.value } : d)}
                    style={{ flex: 1, height: 42, padding: "0 12px", border: "none", fontSize: 15, fontWeight: 700, outline: "none", minWidth: 0 }}
                  />
                  <div style={{ padding: "0 12px", fontSize: 12, color: GRAY_60, backgroundColor: GRAY_5, height: 42, display: "flex", alignItems: "center", borderLeft: `1px solid ${GRAY_10}`, whiteSpace: "nowrap" }}>
                    cr / GB
                  </div>
                </div>
              </div>

              {/* 과금 단위 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>과금 단위</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["min", "h", "day"] as GpuUnit[]).map(u => (
                    <button type="button" key={u} onClick={() => setDraft(d => d ? { ...d, unit: u } : d)} style={{
                      flex: 1, height: 40, fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                      border: `1.5px solid ${draft.unit === u ? PRIMARY : GRAY_30}`,
                      backgroundColor: draft.unit === u ? "rgba(99,90,220,0.07)" : "white",
                      color: draft.unit === u ? PRIMARY : GRAY_60,
                      fontFamily: "inherit", transition: "all 0.1s",
                    }}>{u === "min" ? "분 (min)" : u === "h" ? "시간 (h)" : "일 (day)"}</button>
                  ))}
                </div>
              </div>

              {/* 변경 적용일 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>변경 적용일</div>
                <div style={{ position: "relative", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, height: 42, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", cursor: "pointer" }}>
                  <span style={{ fontSize: 13, color: applyAt ? GRAY_90 : GRAY_40, pointerEvents: "none", userSelect: "none" }}>
                    {applyAt ? applyAt : "YYYY-MM-DD"}
                  </span>
                  <Calendar size={14} color={GRAY_60} style={{ pointerEvents: "none", flexShrink: 0 }} />
                  <input type="date" value={applyAt} min={tomorrowDate()}
                    onChange={e => setApplyAt(e.target.value)}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                  />
                </div>
              </div>

              {/* 미리보기 */}
              <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 14 }}>미리보기 · GPU 1대 기준</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: GRAY_60 }}>정책명</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>{draft.id}-{draft.vram.toLowerCase()}-policy-v{(histories[draft.id]?.[0]?.ver ?? 0) + 1}</span>
                </div>
                {applyAt && (
                  <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${GRAY_10}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>적용일</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>{applyAt}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>상태</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, backgroundColor: ORANGE_10, color: ORANGE }}>적용 예정</span>
                    </div>
                  </div>
                )}
                {(() => {
                  const r = parseFloat(draft.rate || "0");
                  const perUnit = r;
                  const perDay  = draft.unit === "min" ? r * 1440 : draft.unit === "h" ? r * 24 : r;
                  const perMonth = perDay * 30;
                  return [
                    { label: `1${draft.unit === "min" ? "분" : draft.unit === "h" ? "시간" : "일"}당`, val: perUnit.toFixed(2) },
                    { label: "일당",  val: perDay.toFixed(1) },
                    { label: "30일", val: perMonth.toFixed(0) },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{val} cr</span>
                    </div>
                  ));
                })()}
              </div>

              {/* 버튼 */}
              <div style={{ borderTop: `1px solid ${GRAY_10}`, marginTop: 24, paddingTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <PrimaryBtn size="small" onClick={saveEdit}>저장</PrimaryBtn>
                <PrimaryBtn size="small" variant="secondary" onClick={closeDrawer}>취소</PrimaryBtn>
              </div>
            </div>}
          </div>
        </>
      )}

      {/* Create Drawer */}
      {showCreate && (
        <>
          <div onClick={() => setShowCreate(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 290 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, backgroundColor: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)", zIndex: 300, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${GRAY_10}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ScrollText size={14} color={PRIMARY} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>가격 정책 등록</div>
                    <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>새 GPU 타입 가격 정책을 등록합니다.</div>
                  </div>
                </div>
                <button type="button" onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>GPU 선택</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ position: "relative" }}>
                    <Search size={12} color={GRAY_60} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input type="text" placeholder="검색어를 입력하세요." value={gpuCreateSearch} onChange={e => setGpuCreateSearch(e.target.value)}
                      style={{ width: "100%", height: 32, paddingLeft: 28, paddingRight: 10, borderRadius: 7, border: `1.5px solid ${GRAY_10}`, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                      onFocus={e => { e.target.style.borderColor = PRIMARY; }} onBlur={e => { e.target.style.borderColor = GRAY_10; }} />
                  </div>
                </div>
                <Card style={{ overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: GRAY_5 }}>
                        <th onClick={() => toggleGpuSort("name")} style={{ padding: "7px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: GRAY_60, borderBottom: `1px solid ${GRAY_10}`, cursor: "pointer", userSelect: "none" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>GPU{gpuSortIcon("name")}</div>
                        </th>
                        <th onClick={() => toggleGpuSort("vram")} style={{ padding: "7px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: GRAY_60, borderBottom: `1px solid ${GRAY_10}`, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>VRAM{gpuSortIcon("vram")}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCreatePrices.length === 0 ? (
                        <tr><td colSpan={2} style={{ padding: "20px 14px", textAlign: "center", fontSize: 12, color: GRAY_40 }}>검색 결과가 없습니다.</td></tr>
                      ) : filteredCreatePrices.map((p, idx) => {
                        const sel = createForm.selectedId === p.id;
                        const isLast = idx === filteredCreatePrices.length - 1;
                        return (
                          <tr key={p.id} onClick={() => setCreateForm(f => ({ ...f, selectedId: p.id }))}
                            style={{ cursor: "pointer", backgroundColor: sel ? PRIMARY_10 : "white" }}
                            onMouseEnter={e => { if (!sel) e.currentTarget.style.backgroundColor = GRAY_5; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = sel ? PRIMARY_10 : "white"; }}>
                            <td style={{ padding: "10px 14px", borderBottom: isLast ? "none" : `1px solid ${GRAY_10}` }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: sel ? PRIMARY : GRAY_90 }}>{p.name}</div>
                            </td>
                            <td style={{ padding: "10px 14px", borderBottom: isLast ? "none" : `1px solid ${GRAY_10}`, whiteSpace: "nowrap" }}>
                              <span style={{ fontSize: 12, color: GRAY_60 }}>{p.vram}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>버전명</div>
                <div style={{ height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_10}`, backgroundColor: GRAY_5, display: "flex", alignItems: "center" }}>
                  {(() => {
                    const sel = prices.find(p => p.id === createForm.selectedId);
                    return sel
                      ? <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_70 }}>v{(histories[sel.id]?.[0]?.ver ?? 0) + 1}</span>
                      : <span style={{ fontSize: 13, color: GRAY_40 }}>GPU를 선택하면 자동 생성됩니다.</span>;
                  })()}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>가격</div>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, overflow: "hidden" }}
                  onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; }}
                  onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = GRAY_30; }}>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={createForm.rate}
                    onChange={e => setCreateForm(f => ({ ...f, rate: e.target.value }))}
                    style={{ flex: 1, height: 42, padding: "0 12px", border: "none", fontSize: 15, fontWeight: 700, outline: "none", minWidth: 0 }} />
                  <div style={{ padding: "0 12px", fontSize: 12, color: GRAY_60, backgroundColor: GRAY_5, height: 42, display: "flex", alignItems: "center", borderLeft: `1px solid ${GRAY_10}`, whiteSpace: "nowrap" }}>cr / GPU</div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>과금 단위</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["min", "h", "day"] as GpuUnit[]).map(u => (
                    <button type="button" key={u} onClick={() => setCreateForm(f => ({ ...f, unit: u }))} style={{
                      flex: 1, height: 40, fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                      border: `1.5px solid ${createForm.unit === u ? PRIMARY : GRAY_30}`,
                      backgroundColor: createForm.unit === u ? "rgba(99,90,220,0.07)" : "white",
                      color: createForm.unit === u ? PRIMARY : GRAY_60, fontFamily: "inherit", transition: "all 0.1s",
                    }}>{u === "min" ? "분 (min)" : u === "h" ? "시간 (h)" : "일 (day)"}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>적용일</div>
                <div style={{ position: "relative", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, height: 42, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", cursor: "pointer" }}>
                  <span style={{ fontSize: 13, color: createApplyAt ? GRAY_90 : GRAY_40, pointerEvents: "none", userSelect: "none" }}>
                    {createApplyAt ? `${createApplyAt}` : "YYYY-MM-DD"}
                  </span>
                  <Calendar size={14} color={GRAY_60} style={{ pointerEvents: "none", flexShrink: 0 }} />
                  <input type="date" value={createApplyAt} min={tomorrowDate()}
                    onChange={e => setCreateApplyAt(e.target.value)}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
                </div>
              </div>
              {/* 미리보기 */}
              <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 14 }}>미리보기 · GPU 1대 기준</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: GRAY_60 }}>정책명</span>
                  {(() => {
                    const sel = prices.find(p => p.id === createForm.selectedId);
                    return sel
                      ? <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>{sel.id}-{sel.vram.toLowerCase()}-policy-v{(histories[sel.id]?.[0]?.ver ?? 0) + 1}</span>
                      : <span style={{ fontSize: 12, color: GRAY_40 }}>—</span>;
                  })()}
                </div>
                {createApplyAt && (
                  <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${GRAY_10}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>적용일</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>{createApplyAt}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>상태</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, backgroundColor: ORANGE_10, color: ORANGE }}>적용 예정</span>
                    </div>
                  </div>
                )}
                {(() => {
                  const r = parseFloat(createForm.rate || "0");
                  const perDay = createForm.unit === "min" ? r * 1440 : createForm.unit === "h" ? r * 24 : r;
                  return [
                    { label: `1${createForm.unit === "min" ? "분" : createForm.unit === "h" ? "시간" : "일"}당`, val: r.toFixed(2) },
                    { label: "일당",  val: perDay.toFixed(1) },
                    { label: "30일", val: (perDay * 30).toFixed(0) },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: GRAY_60 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{val} cr</span>
                    </div>
                  ));
                })()}
              </div>
              <div style={{ borderTop: `1px solid ${GRAY_10}`, paddingTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <PrimaryBtn size="small" onClick={saveCreate}>등록</PrimaryBtn>
                <PrimaryBtn size="small" variant="secondary" onClick={() => setShowCreate(false)}>취소</PrimaryBtn>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export function AdminAuditLog() {
  return (
    <PageContainer title="Audit Log" subtitle="시스템 전체 감사 로그를 조회합니다.">
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        flex: 1, gap: 16, padding: "80px 0", color: GRAY_60,
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: GRAY_5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ClipboardList size={26} color={GRAY_40} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_70, marginBottom: 6 }}>화면 구성이 확정되지 않았습니다</div>
          <div style={{ fontSize: 13, color: GRAY_60 }}>Audit Log 기능의 세부 내용은 현재 기획 검토 중입니다.</div>
        </div>
      </div>
    </PageContainer>
  );
}

// ─── GPU Management (Types & Nodes + Pricing) ─────────────────────────────────
export function AdminGPUManagement({ initialTab = "GPU" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const [prices, setPrices] = useState<GpuPrice[]>(INIT_GPU_PRICES);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const [showGpuCreate, setShowGpuCreate] = useState(false);
  return (
    <PageContainer title="GPU Management" subtitle="GPU 유형 및 가격 정책을 통합 관리합니다."
      actions={tab === "GPU Pricing Policy" ? <PrimaryBtn size="small" onClick={() => setShowGpuCreate(true)}><Plus size={14} /> 가격 정책 등록</PrimaryBtn> : undefined}>
      <TabBar tabs={["GPU", "GPU Pricing Policy"]} active={tab} onChange={setTab} />
      {tab === "GPU" && <GPUTypesContent prices={prices} />}
      {tab === "GPU Pricing Policy" && <GPUPricingContent prices={prices} setPrices={setPrices} showCreate={showGpuCreate} setShowCreate={setShowGpuCreate} />}
    </PageContainer>
  );
}

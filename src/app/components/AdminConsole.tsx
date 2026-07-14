import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Server, Users, Layers, Database, Image, Cpu, CreditCard, ReceiptText, Zap,
  BellRing, Settings, Plus, Edit, Trash2, ChevronRight, AlertTriangle, Search, ChevronUp, ChevronDown, Clock, X, TrendingUp,
  Crown, Shield, User, HardDriveUpload, CheckCircle,
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_20, GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, GREEN, BLUE, YELLOW, Badge, StatusDot, Card, PrimaryBtn, Table, PageContainer, MetricCard, TabBar,
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
  { msg: "ML Research Lab의 크레딧 소비가 롤링 기준 대비 200% 초과했습니다.",    time: "42분 전",  level: "critical" },
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
      {/* ── 긴급 알림 배너 ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", backgroundColor: "rgb(254,242,242)", borderRadius: 10, marginBottom: 20 }}>
        <AlertTriangle size={12} color={RED} />
        <span style={{ flex: 1, fontSize: 12, color: GRAY_70, fontWeight: 500 }}>Critical 알림 1건 — <strong>RTX A6000 GPU 타입 전체 점유</strong> 확인이 필요합니다.</span>
        <Badge color="danger">즉시 확인 필요</Badge>
      </div>

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
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const allUsers = [
    { name: "지염염", email: "yeomeyeom.ji@sdt.inc", joined: "2026-01-15", workspaces: 2, workspaceNames: ["My Workspace", "ML Research Lab"], servers: 2, status: "active", lastLogin: "오늘 09:42", usedCr: 12450, totalCr: 45230, role: "owner" },
    { name: "이지현", email: "jihyun.lee@sdt.inc", joined: "2026-02-20", workspaces: 1, workspaceNames: ["Team Alpha"], servers: 5, status: "active", lastLogin: "어제 18:30", usedCr: 28600, totalCr: 120500, role: "admin" },
    { name: "김태민", email: "taemin.kim@sdt.inc", joined: "2026-03-10", workspaces: 1, workspaceNames: ["ML Research Lab"], servers: 1, status: "active", lastLogin: "2일 전", usedCr: 4200, totalCr: 8200, role: "user" },
    { name: "최유진", email: "yujin.choi@sdt.inc", joined: "2026-04-05", workspaces: 1, workspaceNames: ["Old Project"], servers: 0, status: "inactive", lastLogin: "14일 전", usedCr: 0, totalCr: 1000, role: "user" },
    { name: "장민준", email: "minjun.jang@sdt.inc", joined: "2026-05-22", workspaces: 1, workspaceNames: ["My Workspace"], servers: 1, status: "active", lastLogin: "오늘 14:15", usedCr: 3100, totalCr: 9800, role: "user" },
  ];

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const roleOrder: Record<string, number> = { owner: 0, admin: 1, user: 2 };
  const users = [...allUsers]
    .filter(u => filterStatus === "All" || u.status === filterStatus)
    .filter(u => !search || u.name.includes(search) || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      if (sortKey === "name")            { va = a.name;         vb = b.name; }
      else if (sortKey === "role")       { va = roleOrder[a.role] ?? 2; vb = roleOrder[b.role] ?? 2; }
      else if (sortKey === "status")     { va = a.status;       vb = b.status; }
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
            <input type="text" placeholder="이름 또는 이메일 검색" value={search} onChange={e => setSearch(e.target.value)}
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
              <div style={{ display: "flex", gap: 4 }}>
                <PrimaryBtn size="xsmall" variant="secondary">상세</PrimaryBtn>
                {u.status === "active"
                  ? <PrimaryBtn size="xsmall" variant="danger">비활성화</PrimaryBtn>
                  : <PrimaryBtn size="xsmall">활성화</PrimaryBtn>
                }
              </div>,
            ];
          })}
        />
      </Card>
    </PageContainer>
  );
}

// ─── Workspace Management ─────────────────────────────────────────────────────
export function AdminWorkspaceManagement({ onDetail }: { onDetail: () => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const allWorkspaces = [
    { name: "My Workspace",   wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", members: 5, servers: 4,  credits: 45230,  status: "active",   rate: 120, createdAt: "2026-01-15", lastActivity: "오늘 09:42" },
    { name: "Team Alpha",     wsId: "ws-d7e9a1b5", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc",   members: 8, servers: 12, credits: 120500, status: "active",   rate: 480, createdAt: "2026-02-20", lastActivity: "오늘 14:15" },
    { name: "ML Research Lab",wsId: "ws-c2f4d8e3", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc",   members: 3, servers: 2,  credits: 8200,   status: "active",   rate: 48,  createdAt: "2026-03-10", lastActivity: "2일 전" },
    { name: "Old Project",    wsId: "ws-b6a9c7d4", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc",   members: 1, servers: 0,  credits: 1000,   status: "inactive", rate: 0,   createdAt: "2026-04-05", lastActivity: "14일 전" },
  ];

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const workspaces = [...allWorkspaces]
    .filter(w => filterStatus === "All" || w.status === filterStatus)
    .filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.owner.includes(search))
    .sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      if (sortKey === "name")    { va = a.name;    vb = b.name; }
      else if (sortKey === "owner")   { va = a.owner;   vb = b.owner; }
      else if (sortKey === "status")  { va = a.status;  vb = b.status; }
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
            <input type="text" placeholder="워크스페이스명 또는 Owner 검색" value={search} onChange={e => setSearch(e.target.value)}
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
            <SortableHeader k="createdAt" label="Created At" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
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
              <div style={{ display: "flex", gap: 4 }}>
                <PrimaryBtn size="xsmall" variant="secondary" onClick={onDetail}>상세</PrimaryBtn>
                {w.status === "active"
                  ? <PrimaryBtn size="xsmall" variant="danger">비활성화</PrimaryBtn>
                  : <PrimaryBtn size="xsmall">활성화</PrimaryBtn>
                }
              </div>,
            ];
          })}
        />
      </Card>
    </PageContainer>
  );
}


export function AdminWorkspaceDetail({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState("Overview");
  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 1100 }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Workspace Management</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0 }}>My Workspace</h1>
            <div style={{ fontSize: 12, color: GRAY_60, marginTop: 4 }}>owner: 지염염 · 5명 · 활성</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryBtn size="small" variant="secondary">Owner 변경</PrimaryBtn>
            <PrimaryBtn size="small" variant="danger">강제 비활성화</PrimaryBtn>
          </div>
        </div>
        <TabBar tabs={["Overview", "Members", "Wallet", "Notifications", "Actions"]} active={tab} onChange={setTab} />

        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[{ label: "활성 서버", value: "4" }, { label: "크레딧 잔액", value: "45,230 cr" }, { label: "멤버 수", value: "5명" }].map(({ label, value }) => (
              <Card key={label} style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: GRAY_90 }}>{value}</div>
              </Card>
            ))}
          </div>
        )}

        {tab === "Members" && (
          <ListCard>
            <Table
              headers={["멤버", "역할", "이메일"]}
              rows={[
                ["지염염", "workspace.owner", "yeomeyeom.ji@sdt.inc"],
                ["이지현", "workspace.admin", "jihyun.lee@sdt.inc"],
                ["김태민", "workspace.user", "taemin.kim@sdt.inc"],
              ].map(([name, role, email]) => [
                <span style={{ fontWeight: 500 }}>{name}</span>,
                <Badge color={role === "workspace.owner" ? "primary" : role === "workspace.admin" ? "warning" : "neutral"}>{role}</Badge>,
                <span style={{ fontSize: 12, color: GRAY_60 }}>{email}</span>,
              ])}
            />
          </ListCard>
        )}

        {tab === "Wallet" && (
          <SectionCard title="지갑 정보 (조회 전용)" subtitle="카드번호는 마스킹 처리됩니다">
            {[["크레딧 잔액", "45,230 cr"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid rgb(242,242,242)`, fontSize: 13 }}>
                <span style={{ color: GRAY_60 }}>{k}</span><span style={{ fontWeight: 600, color: GRAY_90 }}>{v}</span>
              </div>
            ))}
          </SectionCard>
        )}

        {tab === "Actions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionCard title="Force Owner Change" subtitle="Owner를 강제 변경합니다. 기존/신규 Owner 모두에게 이메일 알림이 발송됩니다.">
              <div style={{ display: "flex", gap: 10 }}>
                <input type="text" placeholder="새 Owner 이메일 입력" style={{ flex: 1, height: 40, padding: "0 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13 }} />
                <PrimaryBtn size="small" variant="danger">변경 실행</PrimaryBtn>
              </div>
            </SectionCard>
            <SectionCard title="Force Deactivate" subtitle="워크스페이스를 강제 비활성화합니다. 모든 서버가 정지되며 Owner에게 이메일이 발송됩니다.">
              <div style={{ display: "flex", gap: 10 }}>
                <input type="text" placeholder="비활성화 사유 입력 (필수)" style={{ flex: 1, height: 40, padding: "0 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13 }} />
                <PrimaryBtn size="small" variant="danger">강제 비활성화</PrimaryBtn>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Server Management ────────────────────────────────────────────────────────
export function AdminServerManagement({ initialTab = "Servers" }: { initialTab?: string }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const allServers = [
    { name: "pytorch-dev-01", workspace: "My Workspace", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", gpu: "RTX A5000 × 2", status: "running" as const, uptime: "5h 32m", uptimeMin: 332, gpuUtil: 75, flag: false, createdAt: "2026-07-10 09:14", lastUsed: null },
    { name: "llm-finetuning", workspace: "Team Alpha", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc", gpu: "H100 SXM5 × 4", status: "running" as const, uptime: "2h 15m", uptimeMin: 135, gpuUtil: 93, flag: false, createdAt: "2026-07-10 11:42", lastUsed: null },
    { name: "abuse-server-01", workspace: "ML Research Lab", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc", gpu: "A100 SXM4 × 8", status: "running" as const, uptime: "72h 11m", uptimeMin: 4331, gpuUtil: 14, flag: true, createdAt: "2026-07-07 22:03", lastUsed: null },
    { name: "stable-diffusion", workspace: "My Workspace", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", gpu: "RTX 4090 × 1", status: "stopped" as const, uptime: "—", uptimeMin: -1, gpuUtil: 0, flag: false, createdAt: "2026-06-28 14:00", lastUsed: "2026-07-09 15:30" },
    { name: "data-preprocess", workspace: "Team Alpha", owner: "장민준", ownerEmail: "minjun.jang@sdt.inc", gpu: "A100 SXM4 × 2", status: "creating" as const, uptime: "—", uptimeMin: -1, gpuUtil: 0, flag: false, createdAt: "2026-07-10 13:05", lastUsed: null },
    { name: "old-analysis-01", workspace: "Old Project", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc", gpu: "RTX 3080 × 1", status: "stopped" as const, uptime: "—", uptimeMin: -1, gpuUtil: 0, flag: false, createdAt: "2026-06-10 10:00", lastUsed: "2026-06-25 17:44" },
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

  const flagged = allServers.filter(s => s.flag);

  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); setView("list"); }, [initialTab]);

  // ── Server Templates state ──
  const [view, setView] = useState<"list" | "create-template" | "edit-template">("list");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState([
    { id: "t1", name: "PyTorch LLM 학습", desc: "LLM 학습에 최적화된 PyTorch 기반 템플릿", image: "PyTorch 2.1 + CUDA 12.1", recVram: "80GB+", tmp: 30, hasLocal: true, local: 100, hasShared: false, shared: "", envVars: "WANDB_API_KEY=\nHF_TOKEN=", status: "Public", used: 312 },
    { id: "t2", name: "Stable Diffusion 생성", desc: "이미지 생성을 위한 Stable Diffusion 템플릿", image: "Stable Diffusion WebUI", recVram: "24GB+", tmp: 20, hasLocal: true, local: 50, hasShared: false, shared: "", envVars: "", status: "Public", used: 198 },
    { id: "t3", name: "LLaMA 파인튜닝", desc: "H100 기반 대규모 LLM 파인튜닝 전용 템플릿", image: "LLaMA Fine-tuning v2", recVram: "80GB+", tmp: 50, hasLocal: true, local: 200, hasShared: false, shared: "", envVars: "HF_TOKEN=\nWANDB_API_KEY=", status: "Public", used: 145 },
    { id: "t4", name: "팀 데이터 분석", desc: "공유 스토리지 연결 팀용 데이터 분석 환경", image: "Data Science Pro", recVram: "24GB+", tmp: 10, hasLocal: true, local: 20, hasShared: true, shared: "team-shared-01", envVars: "", status: "Internal", used: 87 },
  ]);
  const blankTpl = { name: "", desc: "", image: "PyTorch 2.1 + CUDA 12.1", recVram: "80GB+", tmp: 20, hasLocal: false, local: 50, hasShared: false, shared: "", envVars: "", status: "Public" };
  const [tplForm, setTplForm] = useState({ ...blankTpl });

  const IMAGE_NAMES = ["PyTorch 2.1 + CUDA 12.1", "TensorFlow 2.15", "LLaMA Fine-tuning v2", "Stable Diffusion WebUI", "Legacy GPU Image v1"];

  const fldStyle: React.CSSProperties = { width: "100%", height: 40, padding: "0 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" as const, marginBottom: 0, fontFamily: "inherit" };
  const txaStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" as const, resize: "vertical" as const, fontFamily: "inherit" };

  const renderTemplateForm = (isEdit: boolean) => (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 700 }}>
        <button type="button" onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Server Management</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: "0 0 24px" }}>{isEdit ? "서버 템플릿 편집" : "서버 템플릿 생성"}</h1>

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
          <FormRow label="권장 볼륨 스토리지 (GB)">
            <input type="number" style={fldStyle} min={10} step={10} value={tplForm.tmp} onChange={e => setTplForm(f => ({ ...f, tmp: Number(e.target.value) }))} />
          </FormRow>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tplForm.hasLocal ? 10 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>권장 볼륨 스토리지</div>
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
              setTemplates(ts => [...ts, { id: `t${Date.now()}`, ...tplForm, used: 0 }]);
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
    <PageContainer
      title="Server Management"
      subtitle={tab === "Server Templates" ? "서버 배포에 사용할 템플릿을 등록·편집·관리합니다." : "전체 서버 현황을 조회하고 필요 시 강제 종료합니다."}
      actions={tab === "Server Templates" ? <PrimaryBtn size="small" onClick={() => { setTplForm({ ...blankTpl }); setEditingTemplateId(null); setView("create-template"); }}><Plus size={14} /> 템플릿 생성</PrimaryBtn> : undefined}
    >
      <TabBar tabs={["Servers", "Server Templates"]} active={tab} onChange={setTab} />
      {tab === "Servers" && <>
      {/* Abuse alert */}
      {flagged.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", backgroundColor: "rgb(254,242,242)", borderRadius: 10, marginBottom: 14 }}>
          <AlertTriangle size={12} color={RED} />
          <div style={{ flex: 1, fontSize: 12, color: GRAY_70 }}>
            <strong>어뷰징 의심 서버:</strong> abuse-server-01 — 72시간 이상 실행, GPU 점유율 14% (저점유)
          </div>
          <PrimaryBtn size="xsmall" variant="danger">강제 종료</PrimaryBtn>
        </div>
      )}

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
            <SortableHeader k="owner" label="User / Workspace" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
            <SortableHeader k="uptime" label="Uptime" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
            <SortableHeader k="createdAt" label="Created At" sortKey={sortKey} sortDir={sortDir} onSort={handleServerSort} />,
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
              /* User / Workspace */
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{s.owner}</span>
                <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>{s.workspace}</span>
              </div>,
              /* 업타임 */
              <span style={{ fontSize: 13, color: s.uptime === "—" ? GRAY_40 : GRAY_90, whiteSpace: "nowrap" }}>{s.uptime}</span>,
              /* Created */
              <span style={{ fontSize: 13, color: GRAY_70, whiteSpace: "nowrap" }}>{s.createdAt}</span>,
              /* 액션 */
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ visibility: isRunning ? "visible" : "hidden" }}>
                  <PrimaryBtn size="xsmall" variant="danger">강제 종료</PrimaryBtn>
                </span>
                <PrimaryBtn size="xsmall" variant="secondary">상세</PrimaryBtn>
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
            headers={["Template", "Image", "Rec. vRAM", "Rec. Storage", "Uses", "Actions"]}
            rows={templates.map(t => [
              /* Template */
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 280 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: PRIMARY_10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={13} color={PRIMARY} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: GRAY_60 }}>{t.desc}</div>
                </div>
              </div>,
              /* Image */
              <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" }}>{t.image}</span>,
              /* Rec. vRAM */
              <span style={{ fontSize: 12, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{t.recVram}</span>,
              /* Storage */
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, color: GRAY_70, whiteSpace: "nowrap" }}>Tmp <strong style={{ color: GRAY_90 }}>{t.tmp}GB</strong></span>
                {t.hasLocal && <span style={{ fontSize: 11, color: GRAY_70, whiteSpace: "nowrap" }}>Local <strong style={{ color: GRAY_90 }}>{t.local}GB</strong></span>}
              </div>,
              /* Uses */
              <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{t.used.toLocaleString()}</span>,
              /* Actions */
              <div style={{ display: "flex", gap: 4 }}>
                <PrimaryBtn size="xsmall" variant="secondary" onClick={() => { setTplForm({ name: t.name, desc: t.desc, image: t.image, recVram: t.recVram, tmp: t.tmp, hasLocal: t.hasLocal, local: t.local, hasShared: t.hasShared, shared: t.shared, envVars: t.envVars, status: t.status }); setEditingTemplateId(t.id); setView("edit-template"); }}><Edit size={12} /> 편집</PrimaryBtn>
                <PrimaryBtn size="xsmall" variant="danger" onClick={() => setTemplates(ts => ts.filter(x => x.id !== t.id))}><Trash2 size={12} /></PrimaryBtn>
              </div>,
            ])}
          />
        </Card>
      )}

    </PageContainer>
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

  // spacerGaps-style helpers
  const brd = (light?: boolean) => `1px solid ${light ? "rgb(238,238,238)" : GRAY_10}`;
  const thBase: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left", whiteSpace: "nowrap", width: "1px", borderBottom: `1px solid ${GRAY_10}` };
  const thSp: React.CSSProperties = { borderBottom: `1px solid ${GRAY_10}` };
  const tdBase: React.CSSProperties = { fontSize: 13, color: GRAY_90, verticalAlign: "middle", width: "1px", whiteSpace: "nowrap" };
  const td = (pos: "first"|"mid"|"last", light?: boolean, extra?: React.CSSProperties): React.CSSProperties => ({
    ...tdBase,
    padding: pos === "first" ? "14px 0 14px 16px" : pos === "last" ? "14px 16px 14px 0" : "14px 0",
    borderBottom: brd(light), ...extra,
  });
  const sp = (light?: boolean, bg?: string): React.CSSProperties => ({ borderBottom: brd(light), backgroundColor: bg });

  return (
    <Card style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: GRAY_5 }}>
            <th style={{ ...thBase, padding: "10px 0 10px 16px" }}>GPU Type</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>GPU Usage</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>Rate</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>Visibility</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 16px 10px 0" }}>Status</th>
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
                        <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{p.rate} cr / GPU / {p.unit}</span>
                      ) : (
                        <Badge color="neutral">미설정</Badge>
                      )}
                    </td>
                  );
                })()}
                <td style={sp()} />
                {/* Visibility toggle */}
                <td style={{ ...td("mid") }}>
                  <LabelToggle on={gpu.pub} labelOn="Public" labelOff="Private" width={64} onToggle={() => togglePub(gpu.name)} />
                </td>
                <td style={sp()} />
                {/* Status toggle */}
                <td style={{ ...td("last") }}>
                  <LabelToggle on={gpu.on} labelOn="Active" labelOff="Inactive" width={64} onToggle={() => toggleOn(gpu.name)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
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
export function AdminImageManagement({ initialTab = "Image", templates = [] as {id:string;image:string}[] }: { initialTab?: string; templates?: {id:string;image:string}[] }) {
  const [tab, setTab] = useState(initialTab);
  const [view, setView] = useState<"list" | "create-image" | "edit-image">("list");
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  useEffect(() => { setTab(initialTab); setView("list"); }, [initialTab]);

  const syncInfo = { status: "success" as "success" | "failed", lastSyncAt: "2026-07-13 14:30:22", failedAt: null as string | null };
  // 실패 시뮬레이션: { status: "failed", lastSyncAt: "2026-07-13 09:15:44", failedAt: "2026-07-13 09:15:44" }

  const GPU_OPTIONS = ["RTX A5000", "A100 SXM4", "H100 SXM5", "RTX 4090"];
  const [images, setImages] = useState([
    { id: "i1", name: "PyTorch 2.1 + CUDA 12.1", path: "/pytorch:2.1-cuda12.1", tier: "Official", category: "ML/DL", status: "Public", isFeatured: true,  thumb: "🔵", desc: "PyTorch 2.1과 CUDA 12.1이 사전 설치된 공식 딥러닝 개발 환경.", recGpu: "A100 SXM4", recTmp: 30, recLocal: 100, tags: "PyTorch, CUDA 12.1, JupyterLab", packages: "torch==2.1.0\ntorchvision==0.16\ncuda==12.1\njupyterlab==4.0\nwandb\ntensorboard", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "WANDB_API_KEY, HF_TOKEN", used: 847 },
    { id: "i2", name: "TensorFlow 2.15",           path: "/tensorflow:2.15-cuda12.1",          tier: "Official", category: "ML/DL", status: "Public", isFeatured: false, thumb: "🟡", desc: "TensorFlow 2.15 및 Keras를 포함한 완전한 ML 개발 환경.", recGpu: "RTX A5000", recTmp: 20, recLocal: 50, tags: "TensorFlow, Keras, CUDA", packages: "tensorflow==2.15.0\nkeras==2.15\ncuda==12.1\njupyterlab==4.0", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "", used: 623 },
    { id: "i3", name: "LLaMA Fine-tuning v2",       path: "/llama-finetune:v2",                  tier: "Verified", category: "LLM",  status: "Public", isFeatured: true,  thumb: "🟣", desc: "Meta LLaMA 시리즈 모델을 LoRA/QLoRA로 파인튜닝하기 위한 최적화 환경. 4비트 양자화 지원.", recGpu: "H100 SXM5", recTmp: 50, recLocal: 200, tags: "LLaMA, LoRA, QLoRA, bitsandbytes", packages: "transformers==4.38\npeft==0.8\nbitsandbytes\nacccelerate\ntrl\ndatasets", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "HF_TOKEN, WANDB_API_KEY", used: 412 },
    { id: "i4", name: "Stable Diffusion WebUI",     path: "/sdwebui:latest",                     tier: "Verified", category: "CV",   status: "Public", isFeatured: false, thumb: "🟠", desc: "AUTOMATIC1111 Stable Diffusion WebUI + ControlNet, LoRA 지원.", recGpu: "RTX 4090", recTmp: 20, recLocal: 50, tags: "Stable Diffusion, ControlNet, xFormers", packages: "stable-diffusion-webui\ncontrolnet\nxformers\nCLIP", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "", used: 389 },
  ]);

  const CAT_COLORS = ["#635ADC", "#248ED5", "#22C55E", "#FFB144", "#EF4444", "#A855F7", "#EC4899", "#777777"];
  const [categories, setCategories] = useState([
    { id: "c1", name: "ML/DL", desc: "머신러닝·딥러닝 개발 환경", icon: "🧠", color: "#635ADC", imgCnt: 2 },
    { id: "c2", name: "LLM", desc: "대형 언어 모델 학습 및 추론", icon: "💬", color: "#248ED5", imgCnt: 1 },
    { id: "c3", name: "CV", desc: "컴퓨터 비전 및 이미지 처리", icon: "👁", color: "#22C55E", imgCnt: 1 },
    { id: "c4", name: "NLP", desc: "자연어 처리", icon: "📝", color: "#FFB144", imgCnt: 0 },
    { id: "c5", name: "Data Science", desc: "데이터 분석 및 시각화", icon: "📊", color: "#A855F7", imgCnt: 1 },
    { id: "c6", name: "개발환경", desc: "범용 Python·개발 환경", icon: "⚙️", color: "#777777", imgCnt: 1 },
  ]);


  const [tiers, setTiers] = useState([
    { id: "tier-official", name: "Official", color: "#635ADC", desc: "NeuroStack이 직접 관리·검증하는 공식 이미지", imgCnt: 2 },
    { id: "tier-verified", name: "Verified", color: "#22C55E", desc: "커뮤니티 검증을 통과한 신뢰할 수 있는 이미지", imgCnt: 3 },
  ]);
  const TIER_COLORS = ["#635ADC", "#22C55E", "#248ED5", "#FFB144", "#EF4444", "#F97316", "#8B5CF6"];
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
  const [imgUploadFile, setImgUploadFile] = useState<string | null>(null);
  const [imgDragOver, setImgDragOver] = useState(false);
  const [imgThumbFile, setImgThumbFile] = useState<string | null>(null);
  const [imgThumbDragOver, setImgThumbDragOver] = useState(false);

  // ── Category drawer state ──
  const blankCatForm = { name: "", desc: "", icon: "📦", color: PRIMARY };
  const [catDrawer, setCatDrawer] = useState<{ editId: string | null; form: { name: string; desc: string; icon: string; color: string } } | null>(null);
  const openCatCreate = () => setCatDrawer({ editId: null, form: { ...blankCatForm } });
  const openCatEdit = (c: typeof categories[0]) => setCatDrawer({ editId: c.id, form: { name: c.name, desc: c.desc, icon: c.icon, color: c.color } });
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
    setEditingImageId(null);
    setImgUploadFile(null);
    setImgThumbFile(null);
    setView("create-image");
  };

  // ── Image table expand / search / sort state ──
  const [expandedImgs, setExpandedImgs] = useState<Set<string>>(new Set());
  const toggleImg = (id: string) => setExpandedImgs(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleStatus  = (id: string) => setImages(imgs => imgs.map(img => img.id === id ? { ...img, status: img.status === "Public" ? "Private" : "Public" } : img));
  const trendingIds = new Set([...images].sort((a, b) => b.used - a.used).slice(0, 3).map(x => x.id));

  const [imgSearch, setImgSearch] = useState("");
  const [imgSort, setImgSort] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "used", dir: "desc" });
  const [imgFilterTier, setImgFilterTier] = useState("All");
  const [imgFilterCat, setImgFilterCat] = useState("All");
  const [imgFilterStatus, setImgFilterStatus] = useState("All");
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
    padding: pos === "first" ? "12px 0 12px 16px" : pos === "last" ? "12px 16px 12px 0" : "12px 0",
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
            <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0 }}>{isEdit ? "이미지 편집" : "이미지 등록"}</h1>
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
              <input style={fld} placeholder="WANDB_API_KEY, HF_TOKEN, OPENAI_API_KEY" value={imgForm.envKeys} onChange={e => setImgForm(f => ({ ...f, envKeys: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("서버 생성 시 사용자에게 노출될 환경변수 키. 쉼표로 구분.")}
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
              if (isEdit && editingImageId) {
                setImages(imgs => imgs.map(x => x.id === editingImageId ? { ...x, ...imgForm } : x));
              } else {
                setImages(imgs => [...imgs, { id: `i${Date.now()}`, ...imgForm, used: 0 }]);
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
    <PageContainer
      title="Image Management"
      subtitle="서버 이미지·카테고리·티어를 등록·편집·관리합니다."
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
          {/* Image Repository 동기화 상태 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 8, marginBottom: 12, backgroundColor: syncInfo.status === "success" ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${syncInfo.status === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}` }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: syncInfo.status === "success" ? GREEN : RED, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: GRAY_70 }}>Image Repository</span>
            <span style={{ fontSize: 12, color: syncInfo.status === "success" ? GREEN : RED, fontWeight: 600 }}>{syncInfo.status === "success" ? "동기화 정상" : "동기화 실패"}</span>
            <span style={{ fontSize: 11, color: GRAY_60 }}>마지막 동기화: {syncInfo.lastSyncAt}</span>
            {syncInfo.status === "failed" && syncInfo.failedAt && (
              <span style={{ fontSize: 11, color: RED }}>· 발생 시각: {syncInfo.failedAt}</span>
            )}
          </div>
          {(() => {
            const selStyle: React.CSSProperties = { height: 32, padding: "0 10px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", fontFamily: "inherit", color: GRAY_90, backgroundColor: "white", cursor: "pointer" };
            const hasFilter = imgSearch || imgFilterTier !== "All" || imgFilterCat !== "All" || imgFilterStatus !== "All";
            return (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
                <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500, flexShrink: 0 }}>
                  전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{filteredImgs.length}</span>개
                  {hasFilter && <span style={{ color: GRAY_60, fontWeight: 400 }}> / {images.length}개</span>}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input value={imgSearch} onChange={e => setImgSearch(e.target.value)} placeholder="이름, 경로 검색"
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
                  <th style={{ ...imgThBase, padding: "10px 0 10px 16px", width: 32 }} />
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
                  <th style={{ ...imgThBase, padding: "10px 0" }}>Template Status</th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => cycleSort("used")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Used{sortIcon("used")}</span>
                  </th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 16px 10px 0" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredImgs.map((img, idx) => {
                  const isExp = expandedImgs.has(img.id);
                  const isLast = idx === filteredImgs.length - 1;
                  const rowBg = isExp ? PRIMARY_20 : "white";
                  const tplCount = templates.filter(t => t.image === img.name).length;
                  return (
                    <React.Fragment key={img.id}>
                      <tr
                        onClick={() => toggleImg(img.id)}
                        style={{ cursor: "pointer", backgroundColor: rowBg }}
                        onMouseEnter={e => { if (!isExp) e.currentTarget.style.backgroundColor = GRAY_5; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = rowBg; }}
                      >
                        <td style={{ ...imgTd("first", isLast || isExp), backgroundColor: rowBg, width: 32 }}>
                          <ChevronRight size={14} color={GRAY_60} style={{ transform: isExp ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", display: "block" }} />
                        </td>
                        <td style={{ ...imgTd("mid", isLast || isExp), backgroundColor: rowBg, paddingLeft: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flexShrink: 0 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{img.thumb}</div>
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{img.name}</span>
                              </div>
                              <div style={{ fontSize: 11, color: GRAY_60, fontFamily: "'Roboto Mono', monospace", whiteSpace: "nowrap" }}>{img.path}</div>
                            </div>
                          </div>
                        </td>
                        <td style={imgSp(isLast || isExp, rowBg)} />
                        <td style={{ ...imgTd("mid", isLast || isExp), backgroundColor: rowBg }}>
                          <Badge color={img.status === "Public" ? "success" : "neutral"}>
                            {img.status === "Public" ? "Public" : "Private"}
                          </Badge>
                        </td>
                        <td style={imgSp(isLast || isExp, rowBg)} />
                        <td style={{ ...imgTd("mid", isLast || isExp), backgroundColor: rowBg }}>
                          <Badge color={img.tier === "Official" ? "primary" : "success"}>{img.tier}</Badge>
                        </td>
                        <td style={imgSp(isLast || isExp, rowBg)} />
                        <td style={{ ...imgTd("mid", isLast || isExp), backgroundColor: rowBg }}>
                          {colorChip(img.category, catColorMap[img.category] ?? GRAY_60)}
                        </td>
                        <td style={imgSp(isLast || isExp, rowBg)} />
                        <td style={{ ...imgTd("mid", isLast || isExp), backgroundColor: rowBg }} onClick={e => e.stopPropagation()}>
                          {tplCount > 0
                            ? <span style={{ fontSize: 13, color: GRAY_90 }}>Created</span>
                            : <span style={{ fontSize: 13, color: GRAY_40 }}>Not created</span>}
                        </td>
                        <td style={imgSp(isLast || isExp, rowBg)} />
                        <td style={{ ...imgTd("mid", isLast || isExp), backgroundColor: rowBg }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 13, color: GRAY_90 }}>{img.used.toLocaleString()}</span>
                            {trendingIds.has(img.id) && <TrendingUp size={12} color="#22C55E" style={{ flexShrink: 0 }} />}
                          </div>
                        </td>
                        <td style={imgSp(isLast || isExp, rowBg)} />
                        <td style={{ ...imgTd("last", isLast || isExp), backgroundColor: rowBg }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <PrimaryBtn size="xsmall" variant="secondary" onClick={() => { setImgForm({ name: img.name, path: img.path, desc: img.desc, tier: img.tier, category: img.category, status: img.status, thumb: img.thumb, recGpu: img.recGpu, recTmp: img.recTmp, recLocal: img.recLocal, tags: img.tags, packages: img.packages, access: img.access || [], ports: img.ports || "", envKeys: img.envKeys || "" }); setEditingImageId(img.id); setView("edit-image"); }}><Edit size={12} /></PrimaryBtn>
                            {img.status === "Public"
                              ? <PrimaryBtn size="xsmall" variant="danger" onClick={() => toggleStatus(img.id)}>비공개</PrimaryBtn>
                              : <PrimaryBtn size="xsmall" onClick={() => toggleStatus(img.id)}>공개</PrimaryBtn>
                            }
                            <PrimaryBtn size="xsmall" variant="danger" onClick={() => setImages(images.filter(x => x.id !== img.id))}><Trash2 size={12} /></PrimaryBtn>
                          </div>
                        </td>
                      </tr>
                      {isExp && (
                        <tr>
                          <td style={{ borderBottom: `1px solid ${PRIMARY_20}`, backgroundColor: "white" }} />
                          <td colSpan={13} style={{ padding: "16px 20px 18px 12px", borderBottom: `1px solid ${PRIMARY_20}`, backgroundColor: "white" }}>
                            <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
                              {/* Left: description + tags */}
                              <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 10, minWidth: 0, paddingRight: 24, borderRight: `1px solid ${GRAY_10}` }}>
                                <p style={{ margin: 0, fontSize: 12, color: GRAY_70, lineHeight: 1.65 }}>{img.desc}</p>
                                {img.tags && (
                                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                                    {img.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                                      <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, backgroundColor: PRIMARY_20, color: PRIMARY, fontWeight: 500 }}>{t}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Right: Packages / Ports / ENV Keys */}
                              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                                {img.packages && (() => {
                                  const pkgList = img.packages.split("\n").filter(Boolean);
                                  return (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                      <span style={{ fontSize: 11, color: GRAY_60 }}>Packages</span>
                                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <span style={{ fontSize: 12, color: GRAY_90, fontFamily: "'Roboto Mono', monospace" }}>{pkgList.length} packages</span>
                                        <div style={{ position: "relative", display: "inline-flex" }}
                                          onMouseEnter={e => { const t = e.currentTarget.querySelector<HTMLElement>(".pkg-tooltip"); if (t) t.style.display = "block"; }}
                                          onMouseLeave={e => { const t = e.currentTarget.querySelector<HTMLElement>(".pkg-tooltip"); if (t) t.style.display = "none"; }}
                                        >
                                          <span style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: GRAY_10, color: GRAY_60, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default", userSelect: "none" as const }}>i</span>
                                          <div className="pkg-tooltip" style={{ display: "none", position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", backgroundColor: GRAY_90, borderRadius: 8, padding: "10px 12px", zIndex: 400, minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                              {pkgList.map(pkg => (
                                                <span key={pkg} style={{ fontSize: 11, color: "white", fontFamily: "'Roboto Mono', monospace", whiteSpace: "nowrap" }}>{pkg}</span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                                {img.ports && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{ fontSize: 11, color: GRAY_60 }}>Ports</span>
                                    <span style={{ fontSize: 12, color: GRAY_90, fontFamily: "'Roboto Mono', monospace" }}>{img.ports}</span>
                                  </div>
                                )}
                                {img.envKeys && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{ fontSize: 11, color: GRAY_60 }}>ENV Keys</span>
                                    <span style={{ fontSize: 12, color: GRAY_90, fontFamily: "'Roboto Mono', monospace" }}>{img.envKeys}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
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
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{cat.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{cat.name}</span>
                </div>,
                <span style={{ fontSize: 13, color: GRAY_70, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minWidth: 280 }}>{cat.desc}</span>,
                <span style={{ fontSize: 13, color: GRAY_90 }}>{cat.imgCnt}개</span>,
                <div style={{ display: "flex", gap: 6 }}>
                  <PrimaryBtn size="xsmall" variant="secondary" onClick={() => openCatEdit(cat)}><Edit size={12} /> 편집</PrimaryBtn>
                  <PrimaryBtn size="xsmall" variant="danger" onClick={() => setCategories(cats => cats.filter(c => c.id !== cat.id))}><Trash2 size={12} /></PrimaryBtn>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${catDrawer.form.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
                        {catDrawer.form.icon || "📦"}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{catDrawer.editId ? "Category 편집" : "Category 생성"}</div>
                        <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>이미지 카테고리를 {catDrawer.editId ? "수정" : "등록"}합니다.</div>
                      </div>
                    </div>
                    <button type="button" onClick={closeCatDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>아이콘 (이모지)</div>
                    <input
                      value={catDrawer.form.icon}
                      onChange={e => setCatDrawer(d => d ? { ...d, form: { ...d.form, icon: e.target.value } } : d)}
                      placeholder="📦"
                      style={{ width: 70, height: 42, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 20, textAlign: "center", outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
                      onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; }}
                      onBlur={e => { e.currentTarget.style.borderColor = GRAY_30; }}
                    />
                  </div>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: `${catDrawer.form.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        {catDrawer.form.icon || "📦"}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: catDrawer.form.color }}>{catDrawer.form.name || "Category 이름"}</div>
                        <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>{catDrawer.form.desc || "설명 없음"}</div>
                      </div>
                    </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${t.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Layers size={13} color={t.color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{t.name}</span>
                </div>,
                <span style={{ fontSize: 13, color: GRAY_70, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minWidth: 320 }}>{t.desc}</span>,
                <span style={{ fontSize: 13, color: GRAY_90 }}>{t.imgCnt}개</span>,
                <div style={{ display: "flex", gap: 6 }}>
                  <PrimaryBtn size="xsmall" variant="secondary" onClick={() => openTierEdit(t)}><Edit size={12} /> 편집</PrimaryBtn>
                  <PrimaryBtn size="xsmall" variant="danger" onClick={() => setTiers(ts => ts.filter(x => x.id !== t.id))}><Trash2 size={12} /></PrimaryBtn>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${tierDrawer.form.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Layers size={14} color={tierDrawer.form.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{tierDrawer.editId ? "Tier 편집" : "Tier 생성"}</div>
                        <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>이미지 Tier를 {tierDrawer.editId ? "수정" : "등록"}합니다.</div>
                      </div>
                    </div>
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
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${tierDrawer.form.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Layers size={14} color={tierDrawer.form.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: tierDrawer.form.color }}>{tierDrawer.form.name || "Tier 이름"}</div>
                        <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>{tierDrawer.form.desc || "설명 없음"}</div>
                      </div>
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

    </PageContainer>
  );
}

// ─── Credit Management ────────────────────────────────────────────────────────
export function AdminCreditManagement({ initialTab = "Credit" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);

  const wsMap = [
    { name: "My Workspace",    wsId: "ws-a3f8b2c1", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", credits: 45230,  status: "active"   },
    { name: "Team Alpha",      wsId: "ws-d7e9a1b5", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc",   credits: 120500, status: "active"   },
    { name: "ML Research Lab", wsId: "ws-c2f4d8e3", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc",   credits: 8200,   status: "active"   },
    { name: "Old Project",     wsId: "ws-b6a9c7d4", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc",   credits: 1000,   status: "inactive" },
  ];
  const getWs = (wsId: string) => wsMap.find(w => w.wsId === wsId) ?? wsMap[0];

  const allLedger = [
    { id: "l1", date: "2026-07-08 14:23:07", wsId: "ws-a3f8b2c1", type: "지급", amount: 10000, reason: "서비스 장애 보상" },
    { id: "l2", date: "2026-07-07 09:11:42", wsId: "ws-d7e9a1b5", type: "지급", amount: 5000,  reason: "신규 가입 프로모션" },
    { id: "l3", date: "2026-07-05 17:58:30", wsId: "ws-c2f4d8e3", type: "회수", amount: 2000,  reason: "어뷰징 확인" },
    { id: "l4", date: "2026-07-03 11:04:55", wsId: "ws-a3f8b2c1", type: "지급", amount: 20000, reason: "베타 테스트 보상" },
    { id: "l5", date: "2026-07-01 08:30:19", wsId: "ws-b6a9c7d4", type: "회수", amount: 1000,  reason: "서비스 해지 정산" },
  ];

  const [creditSearch, setCreditSearch] = useState("");
  const [creditFilterType, setCreditFilterType] = useState("All");
  const [creditSortKey, setCreditSortKey] = useState("date");
  const [creditSortDir, setCreditSortDir] = useState<"asc" | "desc">("desc");
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

  const handleCreditSort = (key: string) => {
    if (creditSortKey === key) setCreditSortDir(d => d === "asc" ? "desc" : "asc");
    else { setCreditSortKey(key); setCreditSortDir("asc"); }
  };

  const filteredLedger = allLedger
    .filter(l => {
      const ws = getWs(l.wsId);
      if (creditSearch && !ws.name.toLowerCase().includes(creditSearch.toLowerCase()) && !ws.owner.toLowerCase().includes(creditSearch.toLowerCase())) return false;
      if (creditFilterType !== "All" && l.type !== creditFilterType) return false;
      return true;
    })
    .sort((a, b) => {
      let va: string | number = "", vb: string | number = "";
      const wa = getWs(a.wsId), wb = getWs(b.wsId);
      if (creditSortKey === "date")      { va = a.date;     vb = b.date; }
      else if (creditSortKey === "workspace") { va = wa.name;   vb = wb.name; }
      else if (creditSortKey === "owner")     { va = wa.owner;  vb = wb.owner; }
      else if (creditSortKey === "amount")    { va = a.amount;  vb = b.amount; }
      if (va < vb) return creditSortDir === "asc" ? -1 : 1;
      if (va > vb) return creditSortDir === "asc" ? 1 : -1;
      return 0;
    });

  const openCreditDrawer = (type: "지급" | "회수") => setCreditDrawer({ form: { wsId: "ws-a3f8b2c1", type, amount: "", reason: "" } });
  const closeCreditDrawer = () => setCreditDrawer(null);


  const crBrd = (light?: boolean) => `1px solid ${light ? "rgb(238,238,238)" : GRAY_10}`;
  const crThBase: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left", whiteSpace: "nowrap", width: "1px", borderBottom: `1px solid ${GRAY_10}` };
  const crThSp: React.CSSProperties = { borderBottom: `1px solid ${GRAY_10}` };
  const crTdBase: React.CSSProperties = { fontSize: 13, color: GRAY_90, verticalAlign: "middle", width: "1px", whiteSpace: "nowrap" };
  const crTd = (pos: "first" | "mid" | "last", light?: boolean): React.CSSProperties => ({
    ...crTdBase,
    padding: pos === "first" ? "12px 0 12px 16px" : pos === "last" ? "12px 16px 12px 0" : "12px 0",
    borderBottom: crBrd(light),
  });
  const crSp = (light?: boolean, bg?: string): React.CSSProperties => ({ borderBottom: crBrd(light), backgroundColor: bg });
  const crSortIcon = (col: string) => {
    if (creditSortKey !== col) return <ChevronUp size={11} color={GRAY_40} style={{ marginLeft: 3, flexShrink: 0 }} />;
    return creditSortDir === "asc"
      ? <ChevronUp size={11} color={PRIMARY} style={{ marginLeft: 3, flexShrink: 0 }} />
      : <ChevronDown size={11} color={PRIMARY} style={{ marginLeft: 3, flexShrink: 0 }} />;
  };

  // ── Credit History tab state ──
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
    <PageContainer title="Credit Management" subtitle="워크스페이스 크레딧을 관리하고 이력을 조회합니다."
      actions={tab === "Credit" ? <PrimaryBtn size="small" onClick={() => openCreditDrawer("지급")}><Plus size={14} /> 크레딧 관리</PrimaryBtn> : undefined}>
      <TabBar tabs={["Credit", "Credit History"]} active={tab} onChange={setTab} />
      {tab === "Credit" && (
      <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: GRAY_70, fontWeight: 500 }}>
              전체 <span style={{ fontWeight: 700, color: GRAY_90 }}>{filteredLedger.length}</span>건
              {(creditFilterType !== "All" || creditSearch) && (
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}> / {allLedger.length}건 중</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ position: "relative" }}>
                <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="text" placeholder="검색어를 입력하세요." value={creditSearch}
                  onChange={e => setCreditSearch(e.target.value)}
                  style={{ width: 220, height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, outline: "none", boxSizing: "border-box" as const }} />
              </div>
              {[
                { value: creditFilterType, onChange: (v: string) => setCreditFilterType(v), options: [["All", "유형"], ["지급", "지급"], ["회수", "회수"]] },
              ].map(({ value, onChange, options }) => (
                <div key={options[0][1]} style={{ position: "relative" }}>
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
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: GRAY_5 }}>
                  <th style={{ ...crThBase, padding: "10px 0 10px 16px", cursor: "pointer" }} onClick={() => handleCreditSort("date")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>날짜{crSortIcon("date")}</span>
                  </th>
                  <th style={crThSp} />
                  <th style={{ ...crThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => handleCreditSort("workspace")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>워크스페이스{crSortIcon("workspace")}</span>
                  </th>
                  <th style={crThSp} />
                  <th style={{ ...crThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => handleCreditSort("owner")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Owner{crSortIcon("owner")}</span>
                  </th>
                  <th style={crThSp} />
                  <th style={{ ...crThBase, padding: "10px 0" }}>유형</th>
                  <th style={crThSp} />
                  <th style={{ ...crThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => handleCreditSort("amount")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>수량{crSortIcon("amount")}</span>
                  </th>
                  <th style={crThSp} />
                  <th style={{ ...crThBase, padding: "10px 16px 10px 0" }}>사유</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((l, idx) => {
                  const isLast = idx === filteredLedger.length - 1;
                  const ws = getWs(l.wsId);
                  return (
                    <tr key={l.id} style={{ backgroundColor: "white" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
                      <td style={{ ...crTd("first", isLast) }}>
                        <div>
                          <div style={{ fontSize: 12, color: GRAY_90, fontWeight: 500 }}>{l.date.slice(0, 10)}</div>
                          <div style={{ fontSize: 11, color: GRAY_60 }}>{l.date.slice(11)}</div>
                        </div>
                      </td>
                      <td style={crSp(isLast)} />
                      <td style={{ ...crTd("mid", isLast) }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{ws.name}</div>
                          <div style={{ fontSize: 11, color: GRAY_60, marginTop: 1 }}>{ws.wsId}</div>
                        </div>
                      </td>
                      <td style={crSp(isLast)} />
                      <td style={{ ...crTd("mid", isLast) }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{ws.owner}</div>
                          <div style={{ fontSize: 11, color: GRAY_60 }}>{ws.ownerEmail}</div>
                        </div>
                      </td>
                      <td style={crSp(isLast)} />
                      <td style={{ ...crTd("mid", isLast) }}>
                        <Badge color={l.type === "지급" ? "success" : "danger"}>{l.type}</Badge>
                      </td>
                      <td style={crSp(isLast)} />
                      <td style={{ ...crTd("mid", isLast) }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: l.type === "지급" ? GREEN : RED }}>
                          {l.type === "지급" ? "+" : "−"}{l.amount.toLocaleString()} cr
                        </span>
                      </td>
                      <td style={crSp(isLast)} />
                      <td style={{ ...crTd("last", isLast) }}>
                        <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" }}>{l.reason}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
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
                        <input value={wsDrawerSearch} onChange={e => { setWsDrawerSearch(e.target.value); setWsDrawerPage(0); }} placeholder="이름, Owner 검색"
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
      </>
      )}
      {tab === "Credit History" && (
        <>
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
                <SortableHeader k="date"   label="일시"       sortKey={histSortKey} sortDir={histSortDir} onSort={handleHistSort} />,
                <SortableHeader k="ws"     label="워크스페이스" sortKey={histSortKey} sortDir={histSortDir} onSort={handleHistSort} />,
                <SortableHeader k="type"   label="구분"       sortKey={histSortKey} sortDir={histSortDir} onSort={handleHistSort} />,
                "내역",
                "담당자",
                <SortableHeader k="amount" label="크레딧"     sortKey={histSortKey} sortDir={histSortDir} onSort={handleHistSort} />,
              ]}
              rows={histFiltered.map(r => {
                const meta = typeMeta[r.type];
                return [
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, whiteSpace: "nowrap" }}>{r.date}</div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginTop: 1, whiteSpace: "nowrap" }}>{r.time}</div>
                  </div>,
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
                ];
              })}
            />
            {histFiltered.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center" as const, color: GRAY_60, fontSize: 13 }}>검색 결과가 없습니다.</div>
            )}
          </Card>
        </>
      )}
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
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Local" | "Shared" | "Temporary">("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Normal" | "Healthy" | "Warning" | "Error">("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const storages = [
    { name: "pytorch-dev-01-local", type: "Local", workspace: "My Workspace", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", capacity: 10, used: 6.8, status: "Normal", mountServer: "pytorch-dev-01", mountWorkspace: "My Workspace" },
    { name: "llm-finetuning-local", type: "Local", workspace: "Team Alpha", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc", capacity: 100, used: 67.3, status: "Normal", mountServer: "llm-finetuning", mountWorkspace: "Team Alpha" },
    { name: "ml-research-local", type: "Local", workspace: "ML Research Lab", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc", capacity: 50, used: 31.4, status: "Normal", mountServer: "abuse-server-01", mountWorkspace: "ML Research Lab" },
    { name: "old-project-local", type: "Local", workspace: "Old Project", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc", capacity: 10, used: 0, status: "Normal", mountServer: "old-project-01", mountWorkspace: "Old Project" },
    { name: "data-preprocess-local", type: "Local", workspace: "Team Alpha", owner: "장민준", ownerEmail: "minjun.jang@sdt.inc", capacity: 30, used: 8.2, status: "Normal", mountServer: "data-preprocess", mountWorkspace: "Team Alpha" },
    { name: "team-shared-01", type: "Shared", workspace: "My Workspace", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", capacity: 500, used: 287, status: "Normal", mountServer: null, mountWorkspace: null, unmountedAt: "2026-07-10 18:42" },
    { name: "dataset-archive", type: "Shared", workspace: "Team Alpha", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc", capacity: 1000, used: 435, status: "Normal", mountServer: null, mountWorkspace: null, unmountedAt: "2026-06-25 09:11" },
    { name: "pytorch-dev-01-temp", type: "Temporary", workspace: "My Workspace", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", capacity: 20, used: 14.2, status: "Healthy", mountServer: "pytorch-dev-01", mountWorkspace: "My Workspace" },
  ];

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
      else if (sortKey === "capacity") { va = a.capacity; vb = b.capacity; }
      else if (sortKey === "used") { va = a.used; vb = b.used; }
      else { va = a.used / a.capacity; vb = b.used / b.capacity; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <PageContainer title="Storage Management" subtitle={tab === "Storage Policy" ? "서버 생성 시 스토리지 용량 산정 방식을 설정합니다." : "전체 스토리지 목록을 조회하고 관리합니다."}>
      <TabBar tabs={["Storage", "Storage Pricing", "Storage Policy"]} active={tab} onChange={setTab} />
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
                { value: filterType, onChange: (v: string) => setFilterType(v as typeof filterType), options: [["All", "유형"], ["Local", "Local"], ["Shared", "Shared"], ["Temporary", "Temporary"]] },
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
              "User / Workspace",
              <SortableHeader k="usedPct" label="Usage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />,
              "Actions",
            ]}
              rows={filtered.map(s => {
                const pct = Math.round(s.used / s.capacity * 100);
                const pctColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
                const typeColor = s.type === "Local" ? PRIMARY : s.type === "Shared" ? GREEN : BLUE;
                const typeBg = s.type === "Local" ? "rgba(99,90,220,0.1)" : s.type === "Shared" ? "rgba(34,197,94,0.1)" : "rgba(36,142,213,0.1)";
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
                          <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", backgroundColor: "rgb(242,242,242)", borderRadius: 6, fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>
                            마지막 해제: {(s as any).unmountedAt}
                          </div>
                        )}
                      </div>,
                  /* User / Workspace */
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{s.owner}</span>
                    <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>{s.workspace}</span>
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
                    <PrimaryBtn size="xsmall" variant="secondary">상세</PrimaryBtn>
                    {s.type !== "Temporary" && <PrimaryBtn size="xsmall" variant="danger">삭제</PrimaryBtn>}
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
      {tab === "Storage Pricing" && <StoragePricingPolicy />}

      {tab === "Storage Policy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
          <Card style={{ padding: "24px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Storage Policy</div>
            <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>서버 생성 시 스토리지 용량 산정 방식을 설정합니다.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid rgb(242,242,242)` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>Local Storage Buffer</div>
                <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>이미지 최소 용량에 추가되는 여유 공간으로, 전체 서버 생성에 일괄 적용됩니다.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <input
                  type="number"
                  min={1}
                  defaultValue={5}
                  style={{ width: 80, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "right" }}
                />
                <span style={{ fontSize: 13, color: GRAY_60 }}>GB</span>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn size="small">Apply</PrimaryBtn>
            </div>
          </Card>
        </div>
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
  { date: "2026-07-09", time: "10:15:02", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "관리자 지급",      desc: "서비스 장애 보상",              amount:  10000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
  { date: "2026-07-08", time: "23:00:00", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "서버 사용",        desc: "pytorch-dev-01 서버 실행",      amount:   -240, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-08", time: "23:00:00", wsId: "ws-d7e9a1b5", wsName: "Team Alpha",      type: "서버 사용",        desc: "llm-finetuning 서버 실행",      amount:   -576, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-08", time: "23:00:00", wsId: "ws-d7e9a1b5", wsName: "Team Alpha",      type: "서버 사용",        desc: "stable-diffusion 서버 실행",    amount:   -120, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "볼륨 스토리지 사용", desc: "local-vol-01 유지비",            amount:    -32, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "볼륨 스토리지 사용", desc: "pytorch-data 유지비",            amount:    -16, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-d7e9a1b5", wsName: "Team Alpha",      type: "볼륨 스토리지 사용", desc: "local-vol-02 유지비",            amount:    -16, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "공유 스토리지 사용", desc: "shared-team-01 유지비",          amount:    -96, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", wsId: "ws-c2f4d8e3", wsName: "ML Research Lab", type: "서버 사용",        desc: "bert-finetune 서버 실행",        amount:   -480, by: "김태민", byEmail: "taemin.kim@sdt.inc"       },
  { date: "2026-07-06", time: "23:00:00", wsId: "ws-c2f4d8e3", wsName: "ML Research Lab", type: "공유 스토리지 사용", desc: "shared-team-01 유지비",          amount:    -96, by: "김태민", byEmail: "taemin.kim@sdt.inc"       },
  { date: "2026-07-05", time: "17:58:30", wsId: "ws-c2f4d8e3", wsName: "ML Research Lab", type: "관리자 회수",      desc: "어뷰징 확인",                    amount:  -2000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
  { date: "2026-07-03", time: "09:22:11", wsId: "ws-a3f8b2c1", wsName: "My Workspace",    type: "관리자 지급",      desc: "베타 테스트 보상",               amount:  20000, by: "박성민", byEmail: "sungmin.park@sdt.inc"     },
  { date: "2026-07-02", time: "23:00:00", wsId: "ws-d7e9a1b5", wsName: "Team Alpha",      type: "서버 사용",        desc: "data-preprocess 서버 실행",      amount:   -360, by: "최유진", byEmail: "yujin.choi@sdt.inc"       },
  { date: "2026-07-01", time: "08:30:19", wsId: "ws-b6a9c7d4", wsName: "Old Project",     type: "관리자 회수",      desc: "서비스 해지 정산",               amount:  -1000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
];

// ─── Notification List ────────────────────────────────────────────────────────
type NotifLevel = "info" | "warning" | "critical";

const adminNotifications: {
  id: string; date: string; time: string; level: NotifLevel;
  title: string; desc: string; target: string; targetId?: string; channel: "in-app" | "email" | "both";
}[] = [
  { id: "n01", date: "2026-07-09", time: "10:15:02", level: "warning",  title: "크레딧 잔액 부족",           desc: "My Workspace 크레딧 잔액이 5,000 cr 이하로 감소했습니다.",               target: "My Workspace",    targetId: "ws-a3f8b2c1", channel: "both"   },
  { id: "n02", date: "2026-07-08", time: "23:01:05", level: "critical", title: "비정상 사용량 감지",          desc: "ML Research Lab의 크레딧 소비가 롤링 기준 대비 200% 초과했습니다.",       target: "ML Research Lab", targetId: "ws-c2f4d8e3", channel: "both"   },
  { id: "n03", date: "2026-07-08", time: "18:42:31", level: "info",     title: "신규 사용자 가입",            desc: "park.jiwon@sdt.inc 계정이 신규 가입했습니다.",                            target: "System",                           channel: "in-app" },
  { id: "n04", date: "2026-07-07", time: "09:05:14", level: "warning",  title: "클러스터 용량 경고",          desc: "전체 GPU 클러스터 사용률이 85%를 초과했습니다.",                          target: "System",                           channel: "both"   },
  { id: "n05", date: "2026-07-07", time: "08:30:00", level: "info",     title: "신규 워크스페이스 생성",      desc: "새로운 워크스페이스 'Team Beta'가 생성되었습니다.",                       target: "Team Beta",       targetId: "ws-e8f1b3c6", channel: "in-app" },
  { id: "n06", date: "2026-07-06", time: "14:20:55", level: "critical", title: "이미지 레지스트리 동기화 실패", desc: "Image Repository와의 카탈로그 동기화가 실패했습니다. 재시도 중입니다.",    target: "System",                           channel: "both"   },
  { id: "n07", date: "2026-07-05", time: "17:58:30", level: "warning",  title: "서버 장시간 실행 감지",       desc: "abuse-server-01이 72시간 이상 연속 실행 중입니다.",                       target: "ML Research Lab", targetId: "ws-c2f4d8e3", channel: "in-app" },
  { id: "n08", date: "2026-07-04", time: "11:00:00", level: "info",     title: "플랫폼 스토리지 용량 경고",   desc: "플랫폼 전체 스토리지 사용량이 90%를 초과했습니다.",                       target: "System",                           channel: "email"  },
  { id: "n09", date: "2026-07-03", time: "09:22:11", level: "info",     title: "크레딧 대량 지급",            desc: "My Workspace에 20,000 cr이 지급되었습니다. (베타 테스트 보상)",            target: "My Workspace",    targetId: "ws-a3f8b2c1", channel: "in-app" },
  { id: "n10", date: "2026-07-02", time: "16:45:00", level: "warning",  title: "크레딧 잔액 소진 임박",       desc: "Old Project 크레딧 잔액이 1,000 cr 미만입니다.",                          target: "Old Project",     targetId: "ws-b6a9c7d4", channel: "both"   },
  { id: "n11", date: "2026-07-01", time: "08:30:19", level: "info",     title: "워크스페이스 강제 비활성화",  desc: "Old Project가 서비스 해지 정산으로 비활성화 처리되었습니다.",                target: "Old Project",     targetId: "ws-b6a9c7d4", channel: "email"  },
  { id: "n12", date: "2026-06-30", time: "22:10:00", level: "critical", title: "GPU 타입 전체 점유",          desc: "RTX A6000 GPU 타입 전체 슬롯이 점유되어 신규 서버 배포가 불가합니다.",    target: "System",                           channel: "both"   },
];

// ─── Notification Management ──────────────────────────────────────────────────
type AdminAlertKey =
  | "user_new_signup" | "user_inactive" | "user_force_deactivated"
  | "ws_new" | "ws_credit_low" | "ws_credit_exhausted" | "ws_force_deactivated" | "ws_owner_changed"
  | "server_abuse" | "server_creating_stuck" | "server_long_running" | "server_force_stopped"
  | "storage_capacity" | "storage_idle"
  | "registry_sync_fail"
  | "gpu_type_full"
  | "credit_abnormal_spike" | "credit_large_transaction";
type AdminAlertCfg = { threshold: number | null; severity: NotifLevel; channels: { inapp: boolean; email: boolean } };

type AdminAlertDef = { key: AdminAlertKey; label: string; desc: string; hasThreshold: boolean; unit?: string };
const adminAlertGroups: { title: string; defs: AdminAlertDef[] }[] = [
  {
    title: "사용자",
    defs: [
      { key: "user_new_signup",        label: "신규 사용자 가입",               desc: "새로운 사용자가 플랫폼에 가입할 때 발송됩니다.",                                          hasThreshold: false },
      { key: "user_inactive",          label: "장기 미접속 사용자 발생",         desc: "마지막 로그인 이후 설정한 기간 이상 접속하지 않은 사용자가 발생할 때 발송됩니다.",       hasThreshold: true, unit: "일 이상" },
      { key: "user_force_deactivated", label: "사용자 강제 비활성화 처리됨",     desc: "관리자가 사용자를 강제 비활성화 처리했을 때 발송됩니다.",                               hasThreshold: false },
    ],
  },
  {
    title: "워크스페이스",
    defs: [
      { key: "ws_new",               label: "신규 워크스페이스 생성",           desc: "새로운 워크스페이스가 생성될 때 발송됩니다.",                                            hasThreshold: false },
      { key: "ws_credit_low",        label: "크레딧 잔액 임계값 이하 도달",     desc: "워크스페이스의 크레딧 잔액이 설정한 임계값 이하로 떨어질 때 발송됩니다.",               hasThreshold: true, unit: "cr 이하" },
      { key: "ws_credit_exhausted",  label: "크레딧 전액 소진",                desc: "워크스페이스 크레딧이 0에 도달하여 실행 중인 서버가 자동 중지될 때 발송됩니다.",         hasThreshold: false },
      { key: "ws_force_deactivated", label: "워크스페이스 강제 비활성화 처리됨", desc: "관리자가 워크스페이스를 강제 비활성화 처리했을 때 발송됩니다.",                         hasThreshold: false },
      { key: "ws_owner_changed",     label: "Owner 강제 변경 처리됨",           desc: "관리자가 워크스페이스 Owner를 강제 변경했을 때 발송됩니다.",                            hasThreshold: false },
    ],
  },
  {
    title: "서버",
    defs: [
      { key: "server_abuse",           label: "어뷰징 플래그 감지",             desc: "서버의 자원 사용 패턴이 어뷰징으로 판단될 때 발송됩니다. 강제 중지 여부를 검토하세요.", hasThreshold: false },
      { key: "server_creating_stuck",  label: "서버 생성 장기 지연",             desc: "서버가 creating 상태에서 설정한 시간 이상 진행되지 않을 때 발송됩니다.",               hasThreshold: true, unit: "분 이상" },
      { key: "server_long_running",    label: "장기 실행 서버 감지",             desc: "서버가 설정한 기간 이상 연속으로 실행 중일 때 발송됩니다.",                            hasThreshold: true, unit: "일 이상" },
      { key: "server_force_stopped",   label: "서버 강제 중지 처리됨",           desc: "관리자가 서버를 강제 중지 처리했을 때 발송됩니다.",                                     hasThreshold: false },
    ],
  },
  {
    title: "스토리지",
    defs: [
      { key: "storage_capacity", label: "스토리지 용량 임계값 초과",        desc: "특정 스토리지 인스턴스의 사용량이 설정한 임계값을 초과할 때 발송됩니다.",                  hasThreshold: true, unit: "% 이상" },
      { key: "storage_idle",     label: "마운트 없는 스토리지 장기 방치",   desc: "마운트되지 않은 스토리지가 설정한 기간 이상 유지될 때 발송됩니다.",                       hasThreshold: true, unit: "일 이상" },
    ],
  },
  {
    title: "이미지",
    defs: [
      { key: "registry_sync_fail", label: "Image Repository 동기화 실패", desc: "Image Repository와의 카탈로그 동기화가 실패하거나 타임아웃될 때 발송됩니다.", hasThreshold: false },
    ],
  },
  {
    title: "GPU Type",
    defs: [
      { key: "gpu_type_full", label: "GPU 타입 전체 점유", desc: "특정 GPU 타입의 가용 수량이 0이 되어 신규 서버 생성이 불가할 때 발송됩니다.", hasThreshold: false },
    ],
  },
  {
    title: "크레딧",
    defs: [
      { key: "credit_abnormal_spike",    label: "크레딧 이상 소비 급증",          desc: "워크스페이스의 크레딧 소비가 직전 7일 평균 대비 설정한 임계값 이상으로 급증할 때 발송됩니다.", hasThreshold: true, unit: "% 초과" },
      { key: "credit_large_transaction", label: "대규모 크레딧 단건 지급·회수",   desc: "단일 트랜잭션으로 설정한 금액 이상의 크레딧이 지급 또는 회수될 때 발송됩니다.",           hasThreshold: true, unit: "cr 이상" },
    ],
  },
];

export function AdminNotificationManagement({ initialTab = "Notification" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);

  // ── Notification list state ──
  const [notifSearch, setNotifSearch] = useState("");
  const [notifFilterLevel, setNotifFilterLevel] = useState("All");
  const [notifFilterChannel, setNotifFilterChannel] = useState("All");
  const [notifSortKey, setNotifSortKey] = useState<"date" | "level">("date");
  const [notifSortDir, setNotifSortDir] = useState<"asc" | "desc">("desc");

  const levelMeta: Record<NotifLevel, { label: string; color: string; bg: string }> = {
    info:     { label: "Info",     color: BLUE,    bg: "rgba(36,142,213,0.1)"  },
    warning:  { label: "Warning",  color: YELLOW,  bg: "rgba(234,179,8,0.1)"   },
    critical: { label: "Critical", color: RED,     bg: "rgba(239,68,68,0.1)"   },
  };
  const levelOrder: Record<NotifLevel, number> = { info: 0, warning: 1, critical: 2 };

  const notifFiltered = adminNotifications
    .filter(n => {
      if (notifSearch && !n.title.includes(notifSearch) && !n.desc.includes(notifSearch) && !n.target.includes(notifSearch)) return false;
      if (notifFilterLevel !== "All" && n.level !== notifFilterLevel.toLowerCase()) return false;
      if (notifFilterChannel !== "All" && n.channel !== notifFilterChannel) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = notifSortDir === "asc" ? 1 : -1;
      if (notifSortKey === "date") return (`${a.date} ${a.time}` < `${b.date} ${b.time}` ? -1 : 1) * dir;
      return (levelOrder[a.level] - levelOrder[b.level]) * dir;
    });

  const handleNotifSort = (key: "date" | "level") => {
    if (notifSortKey === key) setNotifSortDir(d => d === "asc" ? "desc" : "asc");
    else { setNotifSortKey(key); setNotifSortDir("desc"); }
  };

  const notifTdBase: React.CSSProperties = { padding: "0 12px", height: 48, width: "1px", whiteSpace: "nowrap" };

  // ── Alert settings state ──
  const [alertConfig, setAlertConfig] = useState<Record<AdminAlertKey, AdminAlertCfg>>({
    user_new_signup:          { threshold: null, severity: "info",     channels: { inapp: true,  email: false } },
    user_inactive:            { threshold: 30,   severity: "warning",  channels: { inapp: true,  email: false } },
    user_force_deactivated:   { threshold: null, severity: "warning",  channels: { inapp: true,  email: false } },
    ws_new:                   { threshold: null, severity: "info",     channels: { inapp: true,  email: false } },
    ws_credit_low:            { threshold: 1000, severity: "warning",  channels: { inapp: true,  email: true  } },
    ws_credit_exhausted:      { threshold: null, severity: "critical", channels: { inapp: true,  email: true  } },
    ws_force_deactivated:     { threshold: null, severity: "warning",  channels: { inapp: true,  email: false } },
    ws_owner_changed:         { threshold: null, severity: "info",     channels: { inapp: true,  email: false } },
    server_abuse:             { threshold: null, severity: "critical", channels: { inapp: true,  email: true  } },
    server_creating_stuck:    { threshold: 10,   severity: "warning",  channels: { inapp: true,  email: false } },
    server_long_running:      { threshold: 7,    severity: "warning",  channels: { inapp: true,  email: false } },
    server_force_stopped:     { threshold: null, severity: "info",     channels: { inapp: true,  email: false } },
    storage_capacity:         { threshold: 90,   severity: "warning",  channels: { inapp: true,  email: false } },
    storage_idle:             { threshold: 14,   severity: "info",     channels: { inapp: true,  email: false } },
    registry_sync_fail:       { threshold: null, severity: "critical", channels: { inapp: true,  email: true  } },
    gpu_type_full:            { threshold: null, severity: "critical", channels: { inapp: true,  email: false } },
    credit_abnormal_spike:    { threshold: 200,  severity: "critical", channels: { inapp: true,  email: true  } },
    credit_large_transaction: { threshold: 5000, severity: "warning",  channels: { inapp: true,  email: true  } },
  });
  const toggleChannel = (key: AdminAlertKey, ch: "inapp" | "email") =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], channels: { ...p[key].channels, [ch]: !p[key].channels[ch] } } }));
  const setThreshold = (key: AdminAlertKey, v: number) =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], threshold: v } }));
  const setSeverity = (key: AdminAlertKey, v: NotifLevel) =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], severity: v } }));

  return (
    <PageContainer title="Notification Management" subtitle="알림 이력을 조회하고 발송 설정을 관리합니다.">
      <TabBar tabs={["Notification", "Notification Settings"]} active={tab} onChange={setTab} />

      {tab === "Notification" && (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: GRAY_60 }}>총 {notifFiltered.length}건</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: GRAY_40, pointerEvents: "none" }} />
                <input
                  type="text" placeholder="검색어를 입력하세요."
                  value={notifSearch} onChange={e => setNotifSearch(e.target.value)}
                  style={{ width: 220, height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, outline: "none", color: GRAY_90, boxSizing: "border-box" as const }}
                />
              </div>
              {[
                { value: notifFilterLevel, onChange: (v: string) => setNotifFilterLevel(v), options: [["All", "레벨"], ["Info", "Info"], ["Warning", "Warning"], ["Critical", "Critical"]] as [string, string][] },
                { value: notifFilterChannel, onChange: (v: string) => setNotifFilterChannel(v), options: [["All", "채널"], ["in-app", "Console"], ["email", "Email"], ["both", "Both"]] as [string, string][] },
              ].map(({ value, onChange, options }) => (
                <select key={options[0][1]} value={value} onChange={e => onChange(e.target.value)}
                  style={{ height: 34, paddingLeft: 10, paddingRight: 8, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, color: GRAY_90, outline: "none", cursor: "pointer", boxSizing: "border-box" as const }}>
                  {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              ))}
            </div>
          </div>

          <Card style={{ overflow: "hidden" }}>
            <Table
              spacerGaps
              headers={[
                <SortableHeader k="level" label="Severity"  sortKey={notifSortKey} sortDir={notifSortDir} onSort={handleNotifSort} />,
                <SortableHeader k="date"  label="Timestamp" sortKey={notifSortKey} sortDir={notifSortDir} onSort={handleNotifSort} />,
                "Target",
                "Message",
                "Channel",
              ]}
              rows={notifFiltered.map(n => {
                const meta = levelMeta[n.level];
                const channelLabel = n.channel === "in-app" ? "Console" : n.channel === "email" ? "Email" : "Both";
                return [
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: meta.color, backgroundColor: meta.bg, whiteSpace: "nowrap" }}>
                    {meta.label}
                  </span>,
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{n.date}</span>
                    <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>{n.time}</span>
                  </div>,
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{n.target}</span>
                    {n.targetId && <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>{n.targetId}</span>}
                  </div>,
                  <span style={{ fontSize: 13, color: GRAY_70, display: "inline-block", minWidth: 320 }}>{n.desc}</span>,
                  <span style={{ fontSize: 13, color: GRAY_70, whiteSpace: "nowrap" }}>{channelLabel}</span>,
                ];
              })}
            />
            {notifFiltered.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: GRAY_40 }}>검색 결과가 없습니다.</div>
            )}
          </Card>
        </>
      )}

      {tab === "Notification Settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {adminAlertGroups.map(group => (
            <SectionCard key={group.title} title={group.title} bodyStyle={{ padding: "6px 20px" }}>
              {group.defs.map((def, i) => {
                const cfg = alertConfig[def.key];
                return (
                  <div key={def.key} style={{ padding: "14px 0", borderBottom: i < group.defs.length - 1 ? `1px solid ${GRAY_5}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{def.label}</div>
                        <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>{def.desc}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, minWidth: 130 }}>
                        {def.hasThreshold && cfg.threshold !== null ? (
                          <>
                            <input
                              type="number" min={1}
                              value={cfg.threshold}
                              onChange={e => setThreshold(def.key, Number(e.target.value))}
                              style={{ width: 68, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY_30}`, borderRadius: 6, padding: "3px 6px", textAlign: "center", color: GRAY_90, outline: "none" }}
                            />
                            <span style={{ fontSize: 11, color: GRAY_60 }}>{def.unit}</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: GRAY_40 }}>—</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        {(["info", "warning", "critical"] as NotifLevel[]).map(lv => {
                          const lvMeta = { info: { label: "Info", color: BLUE, bg: "rgba(36,142,213,0.1)" }, warning: { label: "Warning", color: YELLOW, bg: "rgba(234,179,8,0.1)" }, critical: { label: "Critical", color: RED, bg: "rgba(239,68,68,0.1)" } }[lv];
                          const active = cfg.severity === lv;
                          return (
                            <button key={lv} type="button" onClick={() => setSeverity(def.key, lv)}
                              style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${active ? lvMeta.color : GRAY_10}`, color: active ? lvMeta.color : GRAY_40, backgroundColor: active ? lvMeta.bg : "transparent", transition: "all 0.1s" }}>
                              {lvMeta.label}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                        {(["inapp", "email"] as Array<"inapp" | "email">).map(ch => (
                          <div key={ch} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: GRAY_60 }}>{ch === "inapp" ? "Console" : "Email"}</span>
                            <button type="button"
                              onClick={() => toggleChannel(def.key, ch)}
                              style={{ width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", backgroundColor: cfg.channels[ch] ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s" }}>
                              <span style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: cfg.channels[ch] ? 18 : 2 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </SectionCard>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

// ─── System Settings ──────────────────────────────────────────────────────────
export function AdminSystemSettings() {
  return (
    <PageContainer title="System Settings" subtitle="Configure SMTP relay and Image Repository integration for the platform.">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
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
function StoragePricingPolicy() {
  type Unit = "h" | "m" | "d";
  type PolicyRow = { id: string; type: string; color: string; ratePerGB: string; unit: Unit; billingStop: string };
  const [policies, setPolicies] = useState<PolicyRow[]>([
    { id: "tmp",    type: "Local Storage", color: BLUE,    ratePerGB: "0.05", unit: "h", billingStop: "서버 중지 시" },
    { id: "local",  type: "Volume Storage",     color: PRIMARY, ratePerGB: "0.10", unit: "h", billingStop: "없음" },
    { id: "shared", type: "Shared Storage",    color: GREEN,   ratePerGB: "0.15", unit: "h", billingStop: "없음" },
  ]);
  const [draft, setDraft] = useState<PolicyRow | null>(null);

  const openDrawer = (p: PolicyRow) => setDraft({ ...p });
  const closeDrawer = () => setDraft(null);
  const saveEdit = () => {
    if (draft) setPolicies(ps => ps.map(p => p.id === draft.id ? draft : p));
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

  return (
    <>
      {/* Info banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", backgroundColor: "rgb(255,251,235)", borderRadius: 10, marginBottom: 12 }}>
        <AlertTriangle size={12} color={YELLOW} />
        <span style={{ fontSize: 12, color: GRAY_70 }}>가격 정책 변경은 즉시 적용됩니다. 변경 전 충분히 검토하세요.</span>
      </div>

      <Card style={{ overflow: "hidden" }}>
        <Table
          spacerGaps
          headers={["Type", "Rate", "Stop Condition", "Actions"]}
          rows={policies.map(p => [
            /* 유형 */
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: p.id === "tmp" ? "rgba(36,142,213,0.1)" : p.id === "local" ? "rgba(99,90,220,0.1)" : "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Database size={13} color={p.color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{p.type}</span>
            </div>,
            /* 단가 */
            <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{p.ratePerGB} cr / GB / {p.unit}</span>,
            /* 과금 중단 */
            <span style={{ fontSize: 13, color: GRAY_70, whiteSpace: "nowrap" }}>{p.billingStop}</span>,
            /* 액션 */
            <div style={{ display: "flex", gap: 6 }}>
              <PrimaryBtn size="xsmall" variant="secondary" onClick={() => openDrawer(p)}><Edit size={12} /> 편집</PrimaryBtn>
              <PrimaryBtn size="xsmall" variant="danger" onClick={() => setPolicies(ps => ps.filter(x => x.id !== p.id))}><Trash2 size={12} /></PrimaryBtn>
            </div>,
          ])}
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
                    <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>가격 정책 편집</div>
                  </div>
                </div>
                <button type="button" onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

              {/* 단가 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>단가</div>
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

              {/* 과금 중단 조건 */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>과금 중단 조건</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["서버 중지 시", "없음", "서버 삭제 시"] as const).map(opt => (
                    <button type="button" key={opt} onClick={() => setDraft(d => d ? { ...d, billingStop: opt } : d)} style={{
                      flex: 1, height: 40, fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                      border: `1.5px solid ${draft.billingStop === opt ? PRIMARY : GRAY_30}`,
                      backgroundColor: draft.billingStop === opt ? `rgba(99,90,220,0.07)` : "white",
                      color: draft.billingStop === opt ? PRIMARY : GRAY_60,
                      fontFamily: "inherit", transition: "all 0.1s",
                    }}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* 미리보기 */}
              <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 14 }}>미리보기 · 100GB 기준</div>
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
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── GPU Type Pricing ─────────────────────────────────────────────────────────
type GpuUnit = "min" | "h" | "day";
type GpuPrice = { id: string; name: string; vram: string; rate: string; unit: GpuUnit; enabled: boolean };
const INIT_GPU_PRICES: GpuPrice[] = [
  { id: "h100",  name: "H100 SXM5", vram: "80GB", rate: "210.00", unit: "h", enabled: true  },
  { id: "a100",  name: "A100 SXM4", vram: "80GB", rate: "120.00", unit: "h", enabled: true  },
  { id: "a5000", name: "RTX A5000", vram: "24GB", rate: "48.00",  unit: "h", enabled: true  },
  { id: "r4090", name: "RTX 4090",  vram: "24GB", rate: "42.00",  unit: "h", enabled: false },
];

function GPUPricingContent({ prices, setPrices }: { prices: GpuPrice[]; setPrices: React.Dispatch<React.SetStateAction<GpuPrice[]>> }) {
  const toHourly = (rate: string, unit: GpuUnit) => {
    const r = parseFloat(rate) || 0;
    return unit === "min" ? r * 60 : unit === "day" ? r / 24 : r;
  };
  const [draft, setDraft] = useState<GpuPrice | null>(null);

  const openDrawer  = (p: GpuPrice) => setDraft({ ...p });
  const closeDrawer = () => setDraft(null);
  const saveEdit    = () => {
    if (draft) setPrices(ps => ps.map(p => p.id === draft.id ? draft : p));
    closeDrawer();
  };

  const unitLabel = (u: GpuUnit) => u === "min" ? "min" : u === "h" ? "h" : "day";

  return (
    <>
      {/* Info banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", backgroundColor: "rgb(240,248,253)", borderRadius: 10, marginBottom: 12 }}>
        <AlertTriangle size={12} color={BLUE} />
        <span style={{ fontSize: 12, color: GRAY_70 }}>단가 변경은 <strong>신규 서버 생성 시점</strong>부터 적용됩니다. 기존 실행 서버는 다음 정산 주기부터 적용됩니다.</span>
      </div>

      <Card style={{ overflow: "hidden" }}>
        <Table
          spacerGaps
          headers={["GPU Type", "Rate", "Actions"]}
          rows={prices.map(p => [
            /* GPU Type */
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(99,90,220,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Cpu size={13} color={PRIMARY} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: p.enabled ? GRAY_90 : GRAY_40, whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ fontSize: 11, color: GRAY_60, whiteSpace: "nowrap" }}>VRAM {p.vram}</span>
              </div>
            </div>,
            /* Rate */
            <span style={{ fontSize: 13, fontWeight: 600, color: p.enabled ? GRAY_90 : GRAY_40, whiteSpace: "nowrap" }}>{p.rate} cr / GPU / {unitLabel(p.unit)}</span>,
            /* Actions */
            <div style={{ display: "flex", gap: 6 }}>
              <PrimaryBtn size="xsmall" variant="secondary" onClick={() => openDrawer(p)}><Edit size={12} /> 편집</PrimaryBtn>
              <PrimaryBtn size="xsmall" variant="danger" onClick={() => setPrices(ps => ps.filter(x => x.id !== p.id))}><Trash2 size={12} /></PrimaryBtn>
            </div>,
          ])}
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
                    <div style={{ fontSize: 12, color: GRAY_60, marginTop: 1 }}>VRAM {draft.vram} · 가격 정책 편집</div>
                  </div>
                </div>
                <button type="button" onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_10; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {/* 단가 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 8 }}>단가</div>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${GRAY_30}`, borderRadius: 8, overflow: "hidden" }}
                  onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; }}
                  onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = GRAY_30; }}>
                  <input type="number" step="0.01" min="0" value={draft.rate}
                    onChange={e => setDraft(d => d ? { ...d, rate: e.target.value } : d)}
                    style={{ flex: 1, height: 42, padding: "0 12px", border: "none", fontSize: 15, fontWeight: 700, outline: "none", minWidth: 0 }}
                  />
                  <div style={{ padding: "0 12px", fontSize: 12, color: GRAY_60, backgroundColor: GRAY_5, height: 42, display: "flex", alignItems: "center", borderLeft: `1px solid ${GRAY_10}`, whiteSpace: "nowrap" }}>
                    cr / GPU
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

              {/* 미리보기 */}
              <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "16px 18px", marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 14 }}>미리보기 · GPU 1대 기준</div>
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
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── GPU Management (Types & Nodes + Pricing) ─────────────────────────────────
export function AdminGPUManagement({ initialTab = "GPU Type" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const [prices, setPrices] = useState<GpuPrice[]>(INIT_GPU_PRICES);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  return (
    <PageContainer title="GPU Type Management" subtitle="GPU 유형 및 가격 정책을 통합 관리합니다.">
      <TabBar tabs={["GPU Type", "GPU Type Pricing"]} active={tab} onChange={setTab} />
      {tab === "GPU Type" && <GPUTypesContent prices={prices} />}
      {tab === "GPU Type Pricing" && <GPUPricingContent prices={prices} setPrices={setPrices} />}
    </PageContainer>
  );
}

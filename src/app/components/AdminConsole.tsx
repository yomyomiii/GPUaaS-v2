import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Server, Users, Layers, Database, Image, Cpu, CreditCard, ReceiptText, Zap,
  BellRing, Settings, Plus, Edit, Trash2, ChevronRight, AlertTriangle, Search, ChevronUp, ChevronDown, Clock, X, Star, TrendingUp,
  Crown, Shield, User, CloudDownload, HardDriveUpload, CheckCircle, Link2,
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
  { name: "RTX 4090",  occupied: 0,  free: 16, total: 16 },
];

const storageDist = [
  { name: "임시", value: 110, color: BLUE },
  { name: "로컬", value: 498, color: PRIMARY },
  { name: "공유", value: 1700, color: GREEN },
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

const adminAlerts = [
  { type: "Node Error", msg: "gpu-node-07 — GPU #3 error 감지", time: "2분 전", severity: "danger" as const },
  { type: "충전 실패", msg: "team-alpha — 충전 실패 (카드 만료)", time: "18분 전", severity: "danger" as const },
  { type: "강제 종료", msg: "abuse-server-01 강제 종료 완료", time: "1시간 전", severity: "warning" as const },
  { type: "저장소 연동", msg: "Internal Storage 연동 재시도 성공", time: "3시간 전", severity: "info" as const },
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
    <PageContainer title="Admin Dashboard" subtitle="서비스 전체 현황을 실시간 모니터링합니다. · 2026년 7월 8일">
      {/* ── 긴급 알림 배너 ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 18px", marginBottom: 20, borderRadius: 12,
        backgroundColor: "rgb(254,242,242)", border: `1px solid ${RED}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={15} color={RED} />
          <span style={{ fontSize: 13, color: GRAY_90, fontWeight: 500 }}>
            긴급 알림 2건 — <strong>gpu-node-07 GPU 오류</strong>, <strong>team-alpha 충전 실패</strong> 확인이 필요합니다.
          </span>
        </div>
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
        <SectionCard title="GPU 유형별 점유율" subtitle="전체 가용 GPU 144개">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {gpuOccupancy.map(gpu => {
              const pct = Math.round(gpu.occupied / gpu.total * 100);
              const barColor = pct > 90 ? RED : pct > 70 ? YELLOW : gpu.name.startsWith("H100") ? PRIMARY : gpu.name.startsWith("A100") ? BLUE : gpu.name.startsWith("RTX A") ? GREEN : GRAY_40;
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
                      <span style={{ marginLeft: 8, color: GREEN, fontSize: 11 }}>여유 {gpu.free}</span>
                    </div>
                  </div>
                  <div style={{ height: 10, backgroundColor: GRAY_5, borderRadius: 5, overflow: "hidden", display: "flex" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: barColor, borderRadius: 5, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 10, color: GRAY_60 }}>
                    <span>{pct}% 점유</span>
                    <span style={{ color: pct > 90 ? RED : pct > 70 ? YELLOW : GRAY_60 }}>
                      {pct > 90 ? "⚠ 포화 임박" : pct > 70 ? "여유 적음" : pct === 0 ? "비활성" : "여유 있음"}
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
        <ListCard title="최근 어드민 알림" action={<Badge color="danger">2 긴급</Badge>}>
          {adminAlerts.map((a, i) => (
            <div key={i} style={{
              padding: "12px 20px", display: "flex", gap: 12, cursor: "pointer",
              borderBottom: i < adminAlerts.length - 1 ? `1px solid rgb(248,248,248)` : "none",
              backgroundColor: a.severity === "danger" ? "rgb(255,252,252)" : "white",
            }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = GRAY_5)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = a.severity === "danger" ? "rgb(255,252,252)" : "white")}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: a.severity === "danger" ? RED : a.severity === "warning" ? YELLOW : BLUE, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <Badge color={a.severity}>{a.type}</Badge>
                  <span style={{ fontSize: 11, color: GRAY_60 }}>{a.time}</span>
                </div>
                <div style={{ fontSize: 12, color: GRAY_70 }}>{a.msg}</div>
              </div>
            </div>
          ))}
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
            { label: "크레딧 사용", value: "28건", amount: "84,000 cr", color: GREEN, icon: "✓" },
            { label: "충전 실패", value: "2건", amount: "4,200 cr", color: RED, icon: "✗" },
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
            <div style={{ fontSize: 11, color: GRAY_60 }}>이번 달 누적 크레딧 사용</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, marginTop: 2 }}>1,245,000 cr</div>
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
    { name: "My Workspace", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", members: 5, servers: 4, credits: 45230, maxCredits: 80000, status: "active", rate: 120, plan: "Standard" },
    { name: "Team Alpha", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc", members: 8, servers: 12, credits: 120500, maxCredits: 200000, status: "active", rate: 480, plan: "Enterprise" },
    { name: "ML Research Lab", owner: "김태민", ownerEmail: "taemin.kim@sdt.inc", members: 3, servers: 2, credits: 8200, maxCredits: 50000, status: "active", rate: 48, plan: "Standard" },
    { name: "Old Project", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc", members: 1, servers: 0, credits: 1000, maxCredits: 10000, status: "inactive", rate: 0, plan: "Standard" },
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
      else if (sortKey === "credits") { va = a.credits; vb = b.credits; }
      else if (sortKey === "rate")    { va = a.rate;    vb = b.rate; }
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
            "Actions",
          ]}
          rows={workspaces.map(w => {
            const creditPct = Math.round((w.credits / w.maxCredits) * 100);
            const isLow = w.credits < 5000;
            return [
              /* Workspace */
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: w.status === "active" ? PRIMARY_10 : GRAY_10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={13} color={w.status === "active" ? PRIMARY : GRAY_40} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: GRAY_60 }}>{w.plan}</div>
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
              <div style={{ minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: isLow ? RED : GRAY_90, fontWeight: 600 }}>{w.credits.toLocaleString()} cr</span>
                  <span style={{ fontSize: 11, color: GRAY_60 }}>{creditPct}%</span>
                </div>
                <div style={{ height: 5, backgroundColor: GRAY_10, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${creditPct}%`, backgroundColor: isLow ? RED : creditPct < 40 ? YELLOW : PRIMARY, borderRadius: 3 }} />
                </div>
              </div>,
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
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Workspace Management</button>
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
            {[["크레딧 잔액", "45,230 cr"], ["등록 카드", "**** **** **** 4521 (VISA)"], ["이번 달 결제", "724,500원"]].map(([k, v]) => (
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
        <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Server Management</button>
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
                  <button key={v} onClick={() => setTplForm(f => ({ ...f, recVram: v }))} style={{ padding: "6px 14px", borderRadius: 8, border: `2px solid ${tplForm.recVram === v ? PRIMARY : GRAY_30}`, backgroundColor: tplForm.recVram === v ? PRIMARY_10 : "white", color: tplForm.recVram === v ? PRIMARY : GRAY_70, fontSize: 13, fontWeight: tplForm.recVram === v ? 700 : 400, cursor: "pointer" }}>
                    {v}
                  </button>
                ))}
              </div>
              <input style={{ ...fldStyle, width: 120, marginBottom: 0 }} placeholder="직접 입력 (예: 40GB+)" value={tplForm.recVram} onChange={e => setTplForm(f => ({ ...f, recVram: e.target.value }))} />
            </div>
          </FormRow>
          <FormRow label="권장 임시 스토리지 (GB)">
            <input type="number" style={fldStyle} min={10} step={10} value={tplForm.tmp} onChange={e => setTplForm(f => ({ ...f, tmp: Number(e.target.value) }))} />
          </FormRow>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tplForm.hasLocal ? 10 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>권장 로컬 스토리지</div>
              <button onClick={() => setTplForm(f => ({ ...f, hasLocal: !f.hasLocal }))} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: tplForm.hasLocal ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "rgb(255,242,242)", borderRadius: 10, border: `1px solid ${RED}30`, marginBottom: 14 }}>
          <AlertTriangle size={14} color={RED} />
          <div style={{ flex: 1, fontSize: 13, color: GRAY_90 }}>
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
    <button onClick={onToggle} style={{ position: "relative", border: "none", cursor: "pointer", backgroundColor: on ? PRIMARY : GRAY_30, borderRadius: 11, height: 22, width, transition: "background 0.2s", flexShrink: 0, display: "inline-block", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
      <span style={{ position: "absolute", fontSize: 9, fontWeight: 700, color: on ? "white" : GRAY_70, letterSpacing: "0.02em", top: "50%", transform: "translateY(-50%)", left: on ? pad + 2 : undefined, right: on ? undefined : pad + 2, pointerEvents: "none", whiteSpace: "nowrap" }}>
        {on ? labelOn : labelOff}
      </span>
      <div style={{ position: "absolute", top: pad, left: on ? width - pad - thumbSize : pad, width: thumbSize, height: thumbSize, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
    </button>
  );
}

function GPUTypesContent({ prices }: { prices: GpuPrice[] }) {
  const [expanded, setExpanded] = useState<string | null>("H100 SXM5");
  const gpuTypes = [
    {
      name: "H100 SXM5", vram: "80GB", nodeCount: 4, occupied: 24, total: 32, capacity: "High", on: true, pub: true,
      nodes: [
        { name: "gpu-node-01", status: "available",   totalGPU: 8, occupiedGPU: 7, freeGPU: 1, lastUsed: "2026-07-10 14:32" },
        { name: "gpu-node-02", status: "available",   totalGPU: 8, occupiedGPU: 6, freeGPU: 2, lastUsed: "2026-07-10 13:58" },
        { name: "gpu-node-03", status: "available",   totalGPU: 8, occupiedGPU: 6, freeGPU: 2, lastUsed: "2026-07-10 14:11" },
        { name: "gpu-node-04", status: "error",       totalGPU: 8, occupiedGPU: 5, freeGPU: 3, lastUsed: "2026-07-10 09:44", issueTime: "2026-07-10 10:22" },
      ],
    },
    {
      name: "A100 SXM4", vram: "80GB", nodeCount: 6, occupied: 36, total: 48, capacity: "Medium", on: true, pub: true,
      nodes: [
        { name: "gpu-node-05", status: "available",    totalGPU: 8, occupiedGPU: 6, freeGPU: 2, lastUsed: "2026-07-10 14:05" },
        { name: "gpu-node-06", status: "available",    totalGPU: 8, occupiedGPU: 5, freeGPU: 3, lastUsed: "2026-07-10 12:30" },
        { name: "gpu-node-07", status: "maintenance",  totalGPU: 8, occupiedGPU: 0, freeGPU: 8, lastUsed: "2026-07-09 18:00", issueTime: "2026-07-09 18:15" },
      ],
    },
    { name: "RTX A5000", vram: "24GB", nodeCount: 6, occupied: 33, total: 48, capacity: "Low",  on: true,  pub: true,  nodes: [] },
    { name: "RTX 4090",  vram: "24GB", nodeCount: 2, occupied: 0,  total: 16, capacity: "No",   on: false, pub: false, nodes: [] },
  ];

  const nodeBadge = (s: string) => s === "available" ? "success" : s === "maintenance" ? "warning" : "danger";
  const nodeColor = (s: string) => s === "available" ? GREEN : s === "maintenance" ? YELLOW : RED;

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
            <th style={{ ...thBase, padding: "10px 0 10px 16px", width: 32 }} />
            <th style={{ ...thBase, padding: "10px 0 10px 12px" }}>GPU Type</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>GPU Usage</th>
            <th style={thSp} />
            <th style={{ ...thBase, padding: "10px 0" }}>Nodes</th>
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
            const isExpanded = expanded === gpu.name;
            const hasNodes = gpu.nodes.length > 0;
            const rowBg = isExpanded ? "rgba(99,90,220,0.03)" : "white";
            return (
              <React.Fragment key={gpu.name}>
                <tr
                  onClick={() => hasNodes && setExpanded(isExpanded ? null : gpu.name)}
                  style={{ cursor: hasNodes ? "pointer" : "default" }}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = GRAY_5; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = rowBg; }}
                >
                  {/* chevron */}
                  <td style={{ ...td("first"), backgroundColor: rowBg, width: 32 }}>
                    {hasNodes && <ChevronRight size={14} color={GRAY_60} style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", display: "block" }} />}
                  </td>
                  {/* GPU Type — no spacer, left padding only */}
                  <td style={{ ...td("mid"), backgroundColor: rowBg, paddingLeft: 12 }}>
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
                  <td style={sp(false, rowBg)} />
                  {/* GPU Usage */}
                  <td style={{ ...td("mid"), backgroundColor: rowBg, minWidth: 160 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: GRAY_70 }}>{gpu.occupied} / {gpu.total} GPU</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 90 ? RED : pct >= 60 ? YELLOW : GRAY_90 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, backgroundColor: GRAY_10, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct >= 90 ? RED : pct >= 60 ? YELLOW : PRIMARY, borderRadius: 3 }} />
                    </div>
                  </td>
                  <td style={sp(false, rowBg)} />
                  {/* Nodes */}
                  <td style={{ ...td("mid"), backgroundColor: rowBg }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap" }}>
                      {gpu.nodes.length > 0
                        ? gpu.nodes.map(node => <div key={node.name} title={`${node.name} · ${node.status}`} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: nodeColor(node.status), flexShrink: 0 }} />)
                        : Array.from({ length: gpu.nodeCount }).map((_, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: GRAY_30, flexShrink: 0 }} />)
                      }
                    </div>
                  </td>
                  <td style={sp(false, rowBg)} />
                  {/* Rate */}
                  {(() => {
                    const p = prices.find(p => p.name === gpu.name);
                    return (
                      <td style={{ ...td("mid"), backgroundColor: rowBg }}>
                        {p ? (
                          <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{p.rate} cr / GPU / {p.unit}</span>
                        ) : (
                          <Badge color="neutral">미설정</Badge>
                        )}
                      </td>
                    );
                  })()}
                  <td style={sp(false, rowBg)} />
                  {/* Visibility toggle */}
                  <td style={{ ...td("mid"), backgroundColor: rowBg }} onClick={e => e.stopPropagation()}>
                    <LabelToggle on={gpu.pub} labelOn="Public" labelOff="Private" width={64} onToggle={() => togglePub(gpu.name)} />
                  </td>
                  <td style={sp(false, rowBg)} />
                  {/* Status toggle — last, right padding only */}
                  <td style={{ ...td("last"), backgroundColor: rowBg }} onClick={e => e.stopPropagation()}>
                    <LabelToggle on={gpu.on} labelOn="Active" labelOff="Inactive" width={64} onToggle={() => toggleOn(gpu.name)} />
                  </td>
                </tr>

                {/* Node sub-rows */}
                {isExpanded && gpu.nodes.map((node, i) => {
                  const nodePct = Math.round(node.occupiedGPU / node.totalGPU * 100);
                  const light = i < gpu.nodes.length - 1;
                  return (
                    <tr key={node.name} style={{ backgroundColor: GRAY_5 }}>
                      <td style={{ ...td("first", light), backgroundColor: GRAY_5 }} />
                      <td style={{ ...td("mid", light), backgroundColor: GRAY_5, paddingLeft: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: nodeColor(node.status), boxShadow: `0 0 5px ${nodeColor(node.status)}`, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90, whiteSpace: "nowrap" }}>{node.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={sp(light, GRAY_5)} />
                      <td style={{ ...td("mid", light), backgroundColor: GRAY_5, minWidth: 160 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: GRAY_70 }}>{node.occupiedGPU} / {node.totalGPU} GPU</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: nodePct >= 90 ? RED : GRAY_70 }}>{nodePct}%</span>
                        </div>
                        <div style={{ height: 4, backgroundColor: GRAY_10, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${nodePct}%`, backgroundColor: nodePct >= 90 ? RED : PRIMARY, borderRadius: 2 }} />
                        </div>
                      </td>
                      <td style={sp(light, GRAY_5)} />
                      <td style={{ ...td("mid", light), backgroundColor: GRAY_5 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 10, color: GRAY_60, fontWeight: 600 }}>Last Used</span>
                          <span style={{ fontSize: 11, color: GRAY_70, fontFamily: "'Roboto Mono', monospace", whiteSpace: "nowrap" }}>{node.lastUsed}</span>
                        </div>
                      </td>
                      <td style={sp(light, GRAY_5)} />
                      <td style={{ ...td("mid", light), backgroundColor: GRAY_5 }}>
                        {"issueTime" in node && node.issueTime && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <AlertTriangle size={10} color={RED} style={{ flexShrink: 0 }} />
                              <span style={{ fontSize: 10, color: RED, fontWeight: 600 }}>Issue</span>
                            </div>
                            <span style={{ fontSize: 11, color: RED, fontFamily: "'Roboto Mono', monospace", whiteSpace: "nowrap" }}>{node.issueTime}</span>
                          </div>
                        )}
                      </td>
                      <td style={sp(light, GRAY_5)} />
                      <td style={{ ...td("mid", light), backgroundColor: GRAY_5 }} />
                      <td style={sp(light, GRAY_5)} />
                      <td style={{ ...td("last", light), backgroundColor: GRAY_5 }} />
                    </tr>
                  );
                })}
              </React.Fragment>
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

// ─── Image Management ─────────────────────────────────────────────────────────
export function AdminImageManagement({ initialTab = "Image", templates = [] as {id:string;image:string}[] }: { initialTab?: string; templates?: {id:string;image:string}[] }) {
  const [tab, setTab] = useState(initialTab);
  const [view, setView] = useState<"list" | "create-image" | "edit-image">("list");
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  useEffect(() => { setTab(initialTab); setView("list"); }, [initialTab]);

  const GPU_OPTIONS = ["RTX A5000", "A100 SXM4", "H100 SXM5", "RTX 4090"];
  const THUMB_OPTIONS = ["🔵", "🟡", "🟣", "🟠", "🟢", "🔴", "⚪", "⚫", "🟤", "🧠", "💬", "👁", "📊", "🔬"];
  const ACCESS_OPTIONS = ["JupyterLab", "VS Code", "SSH", "Terminal", "복합"];

  const [images, setImages] = useState([
    { id: "i1", name: "PyTorch 2.1 + CUDA 12.1", path: "/pytorch:2.1-cuda12.1", tier: "Official", category: "ML/DL", status: "Public", isDeprecated: false, isFeatured: true,  thumb: "🔵", desc: "PyTorch 2.1과 CUDA 12.1이 사전 설치된 공식 딥러닝 개발 환경. JupyterLab과 VS Code 접속을 지원합니다.", recGpu: "A100 SXM4", recTmp: 30, recLocal: 100, tags: "PyTorch, CUDA 12.1, JupyterLab", packages: "torch==2.1.0\ntorchvision==0.16\ncuda==12.1\njupyterlab==4.0\nwandb\ntensorboard", access: ["JupyterLab", "VS Code"], ports: "8888:JupyterLab, 8080:VS Code", envKeys: "WANDB_API_KEY, HF_TOKEN", used: 847 },
    { id: "i2", name: "TensorFlow 2.15",           path: "/tensorflow:2.15-cuda12.1",          tier: "Official", category: "ML/DL", status: "Public", isDeprecated: false, isFeatured: false, thumb: "🟡", desc: "TensorFlow 2.15 및 Keras를 포함한 완전한 ML 개발 환경.", recGpu: "RTX A5000", recTmp: 20, recLocal: 50, tags: "TensorFlow, Keras, CUDA", packages: "tensorflow==2.15.0\nkeras==2.15\ncuda==12.1\njupyterlab==4.0", access: ["JupyterLab", "VS Code"], ports: "8888:JupyterLab", envKeys: "", used: 623 },
    { id: "i3", name: "LLaMA Fine-tuning v2",       path: "/llama-finetune:v2",                  tier: "Verified", category: "LLM",  status: "Public", isDeprecated: false, isFeatured: true,  thumb: "🟣", desc: "Meta LLaMA 시리즈 모델을 LoRA/QLoRA로 파인튜닝하기 위한 최적화 환경. 4비트 양자화 지원.", recGpu: "H100 SXM5", recTmp: 50, recLocal: 200, tags: "LLaMA, LoRA, QLoRA, bitsandbytes", packages: "transformers==4.38\npeft==0.8\nbitsandbytes\nacccelerate\ntrl\ndatasets", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "HF_TOKEN, WANDB_API_KEY", used: 412 },
    { id: "i4", name: "Stable Diffusion WebUI",     path: "/sdwebui:latest",                     tier: "Verified", category: "CV",   status: "Public", isDeprecated: false, isFeatured: false, thumb: "🟠", desc: "AUTOMATIC1111 Stable Diffusion WebUI + ControlNet, LoRA 지원.", recGpu: "RTX 4090", recTmp: 20, recLocal: 50, tags: "Stable Diffusion, ControlNet, xFormers", packages: "stable-diffusion-webui\ncontrolnet\nxformers\nCLIP", access: ["VS Code", "SSH"], ports: "7860:WebUI", envKeys: "", used: 389 },
    { id: "i5", name: "Legacy GPU Image v1",         path: "/legacy:v1",                          tier: "Verified", category: "개발환경", status: "Deprecated", isDeprecated: true,  isFeatured: false, thumb: "⚫", desc: "구 버전 개발 환경. 신규 이미지 사용을 권장합니다.", recGpu: "RTX A5000", recTmp: 10, recLocal: 20, tags: "Legacy", packages: "python==3.8\ntensorflow==1.15", access: ["SSH"], ports: "22:SSH", envKeys: "", used: 12 },
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
  const blankImg = { name: "", path: "", desc: "", tier: "Official", category: "ML/DL", status: "Public", isDeprecated: false, thumb: "🔵", recGpu: "A100 SXM4", recTmp: 20, recLocal: 50, tags: "", packages: "", access: [] as string[], ports: "", envKeys: "" };
  const [imgForm, setImgForm] = useState({ ...blankImg });
  const [imgSourceMode, setImgSourceMode] = useState<"nexus" | "local">("nexus");
  const [nexusQuery, setNexusQuery] = useState("");
  const [nexusStatus, setNexusStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [imgUploadFile, setImgUploadFile] = useState<string | null>(null);
  const [imgDragOver, setImgDragOver] = useState(false);

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
    setImgForm({ name: "", path: "/", desc: "", tier: "Official", category: "ML/DL", status: "Public", isDeprecated: false, thumb: "🔵", recGpu: "A100 SXM4", recTmp: 20, recLocal: 50, tags: "", packages: "", access: [], ports: "", envKeys: "" });
    setEditingImageId(null);
    setImgSourceMode("nexus");
    setNexusQuery("");
    setNexusStatus("idle");
    setImgUploadFile(null);
    setView("create-image");
  };

  // ── Image table expand / search / sort state ──
  const [expandedImgs, setExpandedImgs] = useState<Set<string>>(new Set());
  const toggleImg = (id: string) => setExpandedImgs(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleFeatured = (id: string) => setImages(imgs => imgs.map(img => img.id === id ? { ...img, isFeatured: !img.isFeatured } : img));
  const [trendingConfig, setTrendingConfig] = useState<{ field: "used"; dir: "asc" | "desc"; count: number }>({ field: "used", dir: "desc", count: 3 });
  const [showImgSettings, setShowImgSettings] = useState(false);
  const trendingIds = new Set([...images].sort((a, b) => trendingConfig.dir === "desc" ? b[trendingConfig.field] - a[trendingConfig.field] : a[trendingConfig.field] - b[trendingConfig.field]).slice(0, trendingConfig.count).map(x => x.id));

  const [imgSearch, setImgSearch] = useState("");
  const [imgSort, setImgSort] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "used", dir: "desc" });
  const [imgFilterTier, setImgFilterTier] = useState("All");
  const [imgFilterCat, setImgFilterCat] = useState("All");
  const [imgFilterAccess, setImgFilterAccess] = useState("All");
  const cycleSort = (col: string) => setImgSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
  const sortIcon = (col: string) => {
    if (imgSort.col !== col) return <ChevronUp size={11} color={GRAY_40} style={{ marginLeft: 3, flexShrink: 0 }} />;
    return imgSort.dir === "asc"
      ? <ChevronUp size={11} color={PRIMARY} style={{ marginLeft: 3, flexShrink: 0 }} />
      : <ChevronDown size={11} color={PRIMARY} style={{ marginLeft: 3, flexShrink: 0 }} />;
  };
  const allTiers = ["All", ...Array.from(new Set(images.map(x => x.tier)))];
  const allCats  = ["All", ...Array.from(new Set(images.map(x => x.category)))];
  const allAccess = ["All", "JupyterLab", "VS Code", "SSH", "Terminal", "복합"];
  const filteredImgs = (() => {
    const q = imgSearch.trim().toLowerCase();
    let list = images.filter(img => {
      if (q && !(img.name.toLowerCase().includes(q) || img.path.toLowerCase().includes(q) || img.tier.toLowerCase().includes(q) || img.category.toLowerCase().includes(q))) return false;
      if (imgFilterTier !== "All" && img.tier !== imgFilterTier) return false;
      if (imgFilterCat  !== "All" && img.category !== imgFilterCat) return false;
      if (imgFilterAccess !== "All" && !(img.access ?? []).includes(imgFilterAccess)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let va: string | number = "", vb: string | number = "";
      if (imgSort.col === "name") { va = a.name; vb = b.name; }
      else if (imgSort.col === "tier") { va = a.tier; vb = b.tier; }
      else if (imgSort.col === "category") { va = a.category; vb = b.category; }
      else if (imgSort.col === "used") { va = a.used; vb = b.used; }
      else if (imgSort.col === "access") { va = (a.access?.[0] ?? ""); vb = (b.access?.[0] ?? ""); }
      if (typeof va === "number") return imgSort.dir === "asc" ? va - (vb as number) : (vb as number) - va;
      return imgSort.dir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
    });
    return [...list.filter(x => x.isFeatured), ...list.filter(x => !x.isFeatured)];
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
    <button onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: on ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
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
    const SecCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
      <div style={{ backgroundColor: "#ffffff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)", marginBottom: 20, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderBottom: `1px solid ${GRAY_10}` }}>
          <div style={{ width: 3, height: 14, borderRadius: 99, backgroundColor: PRIMARY, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>{label}</span>
        </div>
        <div style={{ padding: "20px 24px 4px" }}>{children}</div>
      </div>
    );
    return (
      <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
        <div style={{ maxWidth: 720 }}>
          <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Image Management</button>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0 }}>{isEdit ? "이미지 편집" : "이미지 등록"}</h1>
            <div style={{ fontSize: 13, color: GRAY_60, marginTop: 4 }}>서버 이미지 메타데이터와 접속·환경 정보를 입력하세요.</div>
          </div>

          {/* 이미지 소스 (등록 시에만 표시) */}
          {!isEdit && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)", marginBottom: 20, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderBottom: `1px solid ${GRAY_10}` }}>
                <div style={{ width: 3, height: 14, borderRadius: 99, backgroundColor: PRIMARY, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>이미지 소스</span>
              </div>
              <div style={{ padding: "20px 24px" }}>
                {/* 소스 타입 선택 */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {([
                    { mode: "nexus" as const, icon: <CloudDownload size={14} />, label: "Nexus에서 불러오기" },
                    { mode: "local" as const, icon: <HardDriveUpload size={14} />, label: "로컬 이미지 업로드" },
                  ]).map(({ mode, icon, label }) => {
                    const active = imgSourceMode === mode;
                    return (
                      <button key={mode} onClick={() => setImgSourceMode(mode)} style={{
                        display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10,
                        border: `2px solid ${active ? PRIMARY : GRAY_30}`,
                        backgroundColor: active ? PRIMARY_10 : "white",
                        color: active ? PRIMARY : GRAY_70,
                        fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", transition: "all 0.1s",
                      }}>
                        {icon}{label}
                      </button>
                    );
                  })}
                </div>

                {/* Nexus 패널 */}
                {imgSourceMode === "nexus" && (
                  <div>
                    <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 8 }}>Nexus 이미지 경로</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <Link2 size={13} color={GRAY_60} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                          type="text"
                          placeholder="nexus.internal/repository/docker/image:tag"
                          value={nexusQuery}
                          onChange={e => { setNexusQuery(e.target.value); setNexusStatus("idle"); }}
                          onFocus={onFoc} onBlur={onBlr}
                          style={{ width: "100%", height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, color: GRAY_90, outline: "none", boxSizing: "border-box" as const, backgroundColor: "#fff" }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!nexusQuery.trim()) return;
                          setNexusStatus("loading");
                          setTimeout(() => {
                            if (nexusQuery.includes("/")) {
                              const parts = nexusQuery.split(":").pop() ?? "latest";
                              setNexusStatus("found");
                              setImgForm(f => ({ ...f, path: nexusQuery.trim() }));
                            } else {
                              setNexusStatus("error");
                            }
                          }, 900);
                        }}
                        style={{ height: 40, padding: "0 18px", borderRadius: 8, border: "none", backgroundColor: PRIMARY, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0 }}
                      >불러오기</button>
                    </div>
                    {/* 상태 표시 */}
                    <div style={{ marginTop: 10, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      {nexusStatus === "idle" && <span style={{ color: GRAY_60 }}>Nexus에서 이미지를 불러오면 경로가 자동 입력됩니다.</span>}
                      {nexusStatus === "loading" && <><div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${PRIMARY}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} /><span style={{ color: PRIMARY }}>연결 중...</span></>}
                      {nexusStatus === "found" && <><CheckCircle size={13} color={GREEN} /><span style={{ color: GREEN }}>이미지를 찾았습니다. 경로가 아래 폼에 자동 입력되었습니다.</span></>}
                      {nexusStatus === "error" && <><AlertTriangle size={13} color={RED} /><span style={{ color: RED }}>이미지를 찾을 수 없습니다. 경로를 확인하세요.</span></>}
                    </div>
                  </div>
                )}

                {/* 로컬 업로드 패널 */}
                {imgSourceMode === "local" && (
                  <div
                    onDragOver={e => { e.preventDefault(); setImgDragOver(true); }}
                    onDragLeave={() => setImgDragOver(false)}
                    onDrop={e => {
                      e.preventDefault(); setImgDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) { setImgUploadFile(file.name); setImgForm(f => ({ ...f, name: f.name || file.name.replace(/\.(tar\.gz|tar)$/, "") })); }
                    }}
                    style={{
                      border: `2px dashed ${imgDragOver ? PRIMARY : imgUploadFile ? GREEN : GRAY_30}`,
                      borderRadius: 12, backgroundColor: imgDragOver ? PRIMARY_10 : imgUploadFile ? "rgba(34,197,94,0.05)" : GRAY_5,
                      padding: "32px 24px", textAlign: "center" as const, transition: "all 0.15s", cursor: "pointer",
                    }}
                    onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".tar,.tar.gz"; inp.onchange = (ev: any) => { const f = ev.target.files?.[0]; if (f) { setImgUploadFile(f.name); setImgForm(fm => ({ ...fm, name: fm.name || f.name.replace(/\.(tar\.gz|tar)$/, "") })); } }; inp.click(); }}
                  >
                    {imgUploadFile ? (
                      <>
                        <CheckCircle size={28} color={GREEN} style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: GREEN, marginBottom: 4 }}>{imgUploadFile}</div>
                        <div style={{ fontSize: 12, color: GRAY_60 }}>파일이 선택되었습니다. 다시 클릭하면 변경할 수 있습니다.</div>
                      </>
                    ) : (
                      <>
                        <HardDriveUpload size={28} color={GRAY_40} style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: 14, fontWeight: 500, color: GRAY_70, marginBottom: 4 }}>파일을 여기에 드래그하거나 클릭하여 업로드</div>
                        <div style={{ fontSize: 12, color: GRAY_60 }}>.tar, .tar.gz 포맷 지원</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <SecCard label="기본 정보">
            <FormRow label="이미지명" required>
              <input style={fld} placeholder="예: PyTorch 2.1 + CUDA 12.1" value={imgForm.name} onChange={e => setImgForm(f => ({ ...f, name: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("사용자에게 노출되는 이름. 버전과 주요 특징을 포함하세요.")}
            </FormRow>
            <FormRow label="설명 (마크다운)">
              <textarea style={{ ...txa, minHeight: 100 }} placeholder={"## 이미지 설명\n\n이 이미지에 대한 설명을 마크다운으로 작성하세요.\n\n- 주요 특징\n- 사용 방법"} value={imgForm.desc} onChange={e => setImgForm(f => ({ ...f, desc: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("마크다운 형식으로 작성하면 안전하게 렌더링됩니다.")}
            </FormRow>
            <FormRow label="썸네일 이모지">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 8 }}>
                {THUMB_OPTIONS.map(th => (
                  <button key={th} onClick={() => setImgForm(f => ({ ...f, thumb: th }))} style={{ width: 40, height: 40, borderRadius: 8, border: `2px solid ${imgForm.thumb === th ? PRIMARY : GRAY_30}`, backgroundColor: imgForm.thumb === th ? PRIMARY_10 : "white", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{th}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{imgForm.thumb || "🔵"}</div>
                <span style={{ fontSize: 12, color: GRAY_60 }}>카드 썸네일 미리보기</span>
              </div>
            </FormRow>
          </SecCard>

          <SecCard label="접속 방식">
            <FormRow label="접속 방식" required>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                {ACCESS_OPTIONS.map(a => {
                  const checked = imgForm.access.includes(a);
                  return (
                    <button key={a} onClick={() => setImgForm(f => ({ ...f, access: checked ? f.access.filter(x => x !== a) : [...f.access, a] }))}
                      style={{ padding: "7px 14px", borderRadius: 8, border: `2px solid ${checked ? PRIMARY : GRAY_30}`, backgroundColor: checked ? PRIMARY_10 : "white", color: checked ? PRIMARY : GRAY_70, cursor: "pointer", fontSize: 13, fontWeight: checked ? 600 : 400, transition: "all 0.1s" }}>
                      {a}
                    </button>
                  );
                })}
              </div>
              {hint("접속 UI 결정에 사용됩니다. 복수 선택 가능.")}
            </FormRow>
          </SecCard>

          <SecCard label="분류 및 공개 설정">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormRow label="Tier">
                <div style={{ display: "flex", gap: 8 }}>
                  {tiers.map(t => (
                    <button key={t.id} onClick={() => setImgForm(f => ({ ...f, tier: t.name }))} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `2px solid ${imgForm.tier === t.name ? t.color : GRAY_30}`, backgroundColor: imgForm.tier === t.name ? `${t.color}15` : "white", cursor: "pointer" }}>
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
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormRow label="공개 여부">
                <div style={{ display: "flex", alignItems: "center", gap: 10, height: 40 }}>
                  <Toggle on={imgForm.status === "Public"} onToggle={() => setImgForm(f => ({ ...f, status: f.status === "Public" ? "Internal" : "Public" }))} />
                  <span style={{ fontSize: 13, color: imgForm.status === "Public" ? GREEN : GRAY_60, fontWeight: 500 }}>{imgForm.status === "Public" ? "공개 (사용자 콘솔 노출)" : "비공개 (Internal)"}</span>
                </div>
              </FormRow>

            </div>
            <FormRow label="태그">
              <input style={fld} placeholder="PyTorch, CUDA, JupyterLab" value={imgForm.tags} onChange={e => setImgForm(f => ({ ...f, tags: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("쉼표(,)로 구분. 필터·검색에 활용됩니다.")}
            </FormRow>
          </SecCard>

          <SecCard label="포트 및 환경변수">
            <FormRow label="포트 정보">
              <input style={fld} placeholder="8888:JupyterLab, 8080:VS Code, 22:SSH" value={imgForm.ports} onChange={e => setImgForm(f => ({ ...f, ports: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("이미지 메타에서 자동 파싱. 포트번호:서비스명 형식으로 쉼표 구분.")}
            </FormRow>
            <FormRow label="환경변수 사용자 입력용">
              <input style={fld} placeholder="WANDB_API_KEY, HF_TOKEN, OPENAI_API_KEY" value={imgForm.envKeys} onChange={e => setImgForm(f => ({ ...f, envKeys: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
              {hint("서버 생성 시 사용자에게 노출될 환경변수 키. 쉼표로 구분.")}
            </FormRow>
          </SecCard>

          <SecCard label="주요 패키지">
            <FormRow label="패키지 목록 (줄바꿈으로 구분)">
              <textarea style={{ ...txa, minHeight: 100, fontFamily: "'Roboto Mono', monospace", fontSize: 12 }} placeholder={"torch==2.1.0\ntorchvision==0.16\ncuda==12.1"} value={imgForm.packages} onChange={e => setImgForm(f => ({ ...f, packages: e.target.value }))} onFocus={onFoc} onBlur={onBlr} />
            </FormRow>
          </SecCard>

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
          {(() => {
            const selStyle: React.CSSProperties = { height: 32, padding: "0 10px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, outline: "none", fontFamily: "inherit", color: GRAY_90, backgroundColor: "white", cursor: "pointer" };
            const hasFilter = imgSearch || imgFilterTier !== "All" || imgFilterCat !== "All" || imgFilterAccess !== "All";
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
                  <select value={imgFilterTier} onChange={e => setImgFilterTier(e.target.value)} style={selStyle}>
                    {allTiers.map(t => <option key={t} value={t}>{t === "All" ? "Tier: All" : t}</option>)}
                  </select>
                  <select value={imgFilterCat} onChange={e => setImgFilterCat(e.target.value)} style={selStyle}>
                    {allCats.map(c => <option key={c} value={c}>{c === "All" ? "Category: All" : c}</option>)}
                  </select>
                  <select value={imgFilterAccess} onChange={e => setImgFilterAccess(e.target.value)} style={selStyle}>
                    {allAccess.map(a => <option key={a} value={a}>{a === "All" ? "Access: All" : a}</option>)}
                  </select>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setShowImgSettings(v => !v)}
                      style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1.5px solid ${showImgSettings ? PRIMARY : PRIMARY_20}`, fontSize: 13, fontFamily: "inherit", color: PRIMARY, backgroundColor: showImgSettings ? PRIMARY_20 : PRIMARY_10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, flexShrink: 0 }}
                    >
                      <Settings size={13} />Gallery Setting
                    </button>
                    {showImgSettings && (
                      <div style={{ position: "absolute", right: 0, top: 38, zIndex: 200, backgroundColor: "white", border: `1px solid ${GRAY_10}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", padding: 16, width: 220, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>Trending 설정</div>
                        <div style={{ fontSize: 12, color: GRAY_60, lineHeight: 1.5 }}>
                          Used 높은순 기준 상위 N개를 Trending으로 표시합니다.
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="number" min={1} max={20}
                            value={trendingConfig.count}
                            onChange={e => setTrendingConfig(c => ({ ...c, count: Math.max(1, Math.min(20, Number(e.target.value))) }))}
                            style={{ width: 60, height: 32, padding: "0 10px", borderRadius: 8, border: `1.5px solid ${GRAY_30}`, fontSize: 13, fontFamily: "inherit", color: GRAY_90, outline: "none", textAlign: "center" }}
                          />
                          <span style={{ fontSize: 13, color: GRAY_60 }}>개</span>
                        </div>
                      </div>
                    )}
                  </div>
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
                  <th style={{ ...imgThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => cycleSort("tier")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Tier{sortIcon("tier")}</span>
                  </th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => cycleSort("category")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Category{sortIcon("category")}</span>
                  </th>
                  <th style={imgThSp} />
                  <th style={{ ...imgThBase, padding: "10px 0", cursor: "pointer" }} onClick={() => cycleSort("access")}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>Access{sortIcon("access")}</span>
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
                  const rowBg = isExp ? PRIMARY_20 : img.isFeatured ? PRIMARY_10 : "white";
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
                                {img.isFeatured && <Star size={12} color={PRIMARY} style={{ fill: PRIMARY, flexShrink: 0 }} />}
                              </div>
                              <div style={{ fontSize: 11, color: GRAY_60, fontFamily: "'Roboto Mono', monospace", whiteSpace: "nowrap" }}>{img.path}</div>
                            </div>
                          </div>
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
                        <td style={{ ...imgTd("mid", isLast || isExp), backgroundColor: rowBg }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {img.access?.map(a => <React.Fragment key={a}>{colorChip(a, accessColorMap[a] ?? GRAY_60)}</React.Fragment>)}
                          </div>
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
                            <button onClick={() => toggleFeatured(img.id)} title={img.isFeatured ? "Featured 해제" : "Featured 설정"}
                              style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${img.isFeatured ? PRIMARY : GRAY_30}`, backgroundColor: img.isFeatured ? PRIMARY_10 : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                              <Star size={12} color={img.isFeatured ? PRIMARY : GRAY_40} style={img.isFeatured ? { fill: PRIMARY } : {}} />
                            </button>
                            <PrimaryBtn size="xsmall" variant="secondary" onClick={() => { setImgForm({ name: img.name, path: img.path, desc: img.desc, tier: img.tier, category: img.category, status: img.status, isDeprecated: img.isDeprecated, thumb: img.thumb, recGpu: img.recGpu, recTmp: img.recTmp, recLocal: img.recLocal, tags: img.tags, packages: img.packages, access: img.access || [], ports: img.ports || "", envKeys: img.envKeys || "" }); setEditingImageId(img.id); setView("edit-image"); }}><Edit size={12} /></PrimaryBtn>
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
                    <button onClick={closeCatDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
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
                        <button key={c} onClick={() => setCatDrawer(d => d ? { ...d, form: { ...d.form, color: c } } : d)}
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
                    <button onClick={closeTierDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
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
                        <button key={c} onClick={() => setTierDrawer(d => d ? { ...d, form: { ...d.form, color: c } } : d)}
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
export function AdminCreditManagement({ initialTab = "크레딧 지급/회수" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const ledger = [
    { date: "2026-07-08", workspace: "My Workspace", owner: "지염염", type: "지급", amount: "+10,000 cr", reason: "서비스 장애 보상" },
    { date: "2026-07-07", workspace: "Team Alpha", owner: "이지현", type: "지급", amount: "+5,000 cr", reason: "신규 가입 프로모션" },
    { date: "2026-07-05", workspace: "ML Research Lab", owner: "김태민", type: "회수", amount: "-2,000 cr", reason: "어뷰징 확인" },
  ];
  const products = [
    { name: "기본 패키지", credits: 10000, price: "100,000원", bonus: "0 cr", status: "판매중" },
    { name: "스타터 패키지", credits: 50000, price: "480,000원", bonus: "+5,000 cr", status: "판매중" },
    { name: "프로 패키지", credits: 100000, price: "900,000원", bonus: "+15,000 cr", status: "판매중" },
    { name: "(구) 소규모 패키지", credits: 5000, price: "50,000원", bonus: "0 cr", status: "판매중지" },
  ];
  return (
    <PageContainer title="Credit Management" subtitle="크레딧 지급·회수 및 상품을 관리합니다.">
      <TabBar tabs={["크레딧 지급/회수", "크레딧 상품"]} active={tab} onChange={setTab} />
      {tab === "크레딧 지급/회수" && (
        <div>
          <Card style={{ padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 16 }}>크레딧 수동 지급 · 회수</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>워크스페이스</div>
                <select style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13 }}>
                  <option>My Workspace (지염염)</option>
                  <option>Team Alpha (이지현)</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>유형</div>
                <select style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13 }}>
                  <option>크레딧 지급</option>
                  <option>크레딧 회수</option>
                  <option>포인트 지급</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>수량 (cr)</div>
                <input type="number" placeholder="0" style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>사유 (필수)</div>
                <input type="text" placeholder="사유를 입력하세요" style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn size="small">지급 실행</PrimaryBtn>
            </div>
          </Card>
          <Card style={{ overflow: "hidden" }}>
            <Table headers={["날짜", "워크스페이스", "Owner", "유형", "수량", "사유"]}
              rows={ledger.map(l => [
                <span style={{ fontSize: 12, color: GRAY_60 }}>{l.date}</span>,
                <span>{l.workspace}</span>,
                <span style={{ fontSize: 12, color: GRAY_60 }}>{l.owner}</span>,
                <Badge color={l.type === "지급" ? "success" : "danger"}>{l.type}</Badge>,
                <span style={{ fontWeight: 700, color: l.type === "지급" ? GREEN : RED, fontFamily: "'Roboto Mono', monospace" }}>{l.amount}</span>,
                <span style={{ fontSize: 12, color: GRAY_70 }}>{l.reason}</span>,
              ])}
            />
          </Card>
        </div>
      )}
      {tab === "크레딧 상품" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <PrimaryBtn size="small"><Plus size={14} /> 상품 등록</PrimaryBtn>
          </div>
          <Card style={{ overflow: "hidden" }}>
            <Table headers={["상품명", "크레딧", "판매가", "보너스", "상태", "액션"]}
              rows={products.map(p => [
                <span style={{ fontWeight: 600 }}>{p.name}</span>,
                <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{p.credits.toLocaleString()} cr</span>,
                <span style={{ fontWeight: 600 }}>{p.price}</span>,
                <span style={{ color: GREEN, fontWeight: 600 }}>{p.bonus}</span>,
                <Badge color={p.status === "판매중" ? "success" : "neutral"}>{p.status}</Badge>,
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ fontSize: 11, color: PRIMARY, background: PRIMARY_10, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>편집</button>
                  <button style={{ fontSize: 11, color: RED, background: "rgb(254,242,242)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>삭제</button>
                </div>,
              ])}
            />
          </Card>
        </div>
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
    <button onClick={() => onSort(k)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 600, color: active ? PRIMARY : GRAY_60 }}>
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
    { name: "old-project-local", type: "Local", workspace: "Old Project", owner: "최유진", ownerEmail: "yujin.choi@sdt.inc", capacity: 10, used: 0, status: "Normal", mountServer: null, mountWorkspace: null },
    { name: "data-preprocess-local", type: "Local", workspace: "Team Alpha", owner: "장민준", ownerEmail: "minjun.jang@sdt.inc", capacity: 30, used: 8.2, status: "Normal", mountServer: "data-preprocess", mountWorkspace: "Team Alpha" },
    { name: "team-shared-01", type: "Shared", workspace: "My Workspace", owner: "지염염", ownerEmail: "yeomeyeom.ji@sdt.inc", capacity: 500, used: 287, status: "Normal", mountServer: null, mountWorkspace: null },
    { name: "dataset-archive", type: "Shared", workspace: "Team Alpha", owner: "이지현", ownerEmail: "jihyun.lee@sdt.inc", capacity: 1000, used: 435, status: "Normal", mountServer: null, mountWorkspace: null },
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
    <PageContainer title="Storage Management" subtitle="전체 스토리지 목록을 조회하고 관리합니다.">
      <TabBar tabs={["Storage", "Storage Pricing"]} active={tab} onChange={setTab} />
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
                const pctColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GRAY_90;
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
                    : <span style={{ fontSize: 13, color: GRAY_40, whiteSpace: "nowrap" }}>—</span>,
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
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct >= 90 ? RED : pct >= 70 ? YELLOW : PRIMARY, borderRadius: 3, transition: "width 0.3s ease" }} />
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
    </PageContainer>
  );
}

// ─── Payment History ──────────────────────────────────────────────────────────
export function AdminPaymentHistory({ initialTab = "결제 내역" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const payments = [
    { date: "2026-07-08 14:22", workspace: "Team Alpha", owner: "이지현", product: "프로 패키지 (100,000 cr)", amount: "900,000원", status: "성공" },
    { date: "2026-07-08 11:05", workspace: "My Workspace", owner: "지염염", product: "스타터 패키지 (50,000 cr)", amount: "480,000원", status: "성공" },
    { date: "2026-07-07 18:30", workspace: "ML Research Lab", owner: "김태민", product: "기본 패키지 (10,000 cr)", amount: "100,000원", status: "실패" },
    { date: "2026-07-07 09:11", workspace: "Team Alpha", owner: "이지현", product: "스타터 패키지 (50,000 cr)", amount: "480,000원", status: "환불" },
  ];
  const refunds = [
    { date: "2026-07-07 21:00", workspace: "Team Alpha", owner: "이지현", amount: "480,000원", reason: "이중 결제 확인", status: "처리 완료" },
    { date: "2026-07-05 13:44", workspace: "Old Project", owner: "최유진", amount: "100,000원", reason: "서비스 불만족", status: "검토 중" },
  ];
  return (
    <PageContainer title="Payment History" subtitle="전체 결제 및 환불 내역을 관리합니다.">
      <TabBar tabs={["결제 내역", "환불 관리"]} active={tab} onChange={setTab} />
      {tab === "결제 내역" && (
        <Card style={{ overflow: "hidden" }}>
          <Table headers={["일시", "워크스페이스", "Owner", "상품", "결제금액", "상태"]}
            rows={payments.map(p => [
              <span style={{ fontSize: 12, color: GRAY_60, fontFamily: "'Roboto Mono', monospace" }}>{p.date}</span>,
              <span>{p.workspace}</span>,
              <span style={{ fontSize: 12, color: GRAY_60 }}>{p.owner}</span>,
              <span style={{ fontSize: 12 }}>{p.product}</span>,
              <span style={{ fontWeight: 600, fontFamily: "'Roboto Mono', monospace" }}>{p.amount}</span>,
              <Badge color={p.status === "성공" ? "success" : p.status === "실패" ? "danger" : "warning"}>{p.status}</Badge>,
            ])}
          />
        </Card>
      )}
      {tab === "환불 관리" && (
        <Card style={{ overflow: "hidden" }}>
          <Table headers={["신청일", "워크스페이스", "Owner", "환불금액", "사유", "상태", "액션"]}
            rows={refunds.map(r => [
              <span style={{ fontSize: 12, color: GRAY_60, fontFamily: "'Roboto Mono', monospace" }}>{r.date}</span>,
              <span>{r.workspace}</span>,
              <span style={{ fontSize: 12, color: GRAY_60 }}>{r.owner}</span>,
              <span style={{ fontWeight: 600, fontFamily: "'Roboto Mono', monospace" }}>{r.amount}</span>,
              <span style={{ fontSize: 12, color: GRAY_70 }}>{r.reason}</span>,
              <Badge color={r.status === "처리 완료" ? "success" : "warning"}>{r.status}</Badge>,
              r.status === "검토 중"
                ? <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ fontSize: 11, color: GREEN, background: "rgb(240,253,244)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>승인</button>
                    <button style={{ fontSize: 11, color: RED, background: "rgb(254,242,242)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>거절</button>
                  </div>
                : <span style={{ fontSize: 12, color: GRAY_40 }}>—</span>,
            ])}
          />
        </Card>
      )}
    </PageContainer>
  );
}

// ─── Notification Management ──────────────────────────────────────────────────
type AdminAlertKey = "credit_low" | "gpu_util_high" | "storage_high" | "gpu_node_error" | "server_force_stop";
type AdminAlertCfg = { threshold: number | null; channels: { inapp: boolean; email: boolean } };

const adminAlertDefs: { key: AdminAlertKey; label: string; desc: string; hasThreshold: boolean; unit?: string }[] = [
  { key: "credit_low",        label: "Low Credit Balance",       desc: "Sent when a workspace's credit balance falls below the configured threshold.",  hasThreshold: true,  unit: "% below" },
  { key: "gpu_util_high",     label: "High GPU Utilization",     desc: "Sent when overall platform GPU utilization exceeds the configured threshold.",  hasThreshold: true,  unit: "% above" },
  { key: "storage_high",      label: "High Storage Usage",       desc: "Sent when overall platform storage usage exceeds the configured threshold.",    hasThreshold: true,  unit: "% above" },
  { key: "gpu_node_error",    label: "GPU Node Error",           desc: "Sent when a hardware fault is detected on a GPU node.",                        hasThreshold: false },
  { key: "server_force_stop", label: "Server Force-Stopped",     desc: "Sent to the affected workspace when an admin force-stops a server.",           hasThreshold: false },
];

export function AdminNotificationManagement() {
  const [alertConfig, setAlertConfig] = useState<Record<AdminAlertKey, AdminAlertCfg>>({
    credit_low:        { threshold: 20,   channels: { inapp: true,  email: true  } },
    gpu_util_high:     { threshold: 85,   channels: { inapp: true,  email: false } },
    storage_high:      { threshold: 90,   channels: { inapp: true,  email: false } },
    gpu_node_error:    { threshold: null, channels: { inapp: true,  email: true  } },
    server_force_stop: { threshold: null, channels: { inapp: true,  email: false } },
  });
  const toggleChannel = (key: AdminAlertKey, ch: "inapp" | "email") =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], channels: { ...p[key].channels, [ch]: !p[key].channels[ch] } } }));
  const setThreshold = (key: AdminAlertKey, v: number) =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], threshold: v } }));

  return (
    <PageContainer title="Notification Management" subtitle="Configure system alert thresholds and delivery channels.">
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
        <SectionCard title="Alert Settings" bodyStyle={{ padding: "6px 20px" }}>
          {adminAlertDefs.map((def, i) => {
            const cfg = alertConfig[def.key];
            return (
              <div key={def.key} style={{ padding: "14px 0", borderBottom: i < adminAlertDefs.length - 1 ? `1px solid ${GRAY_5}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{def.label}</div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>{def.desc}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, minWidth: 120 }}>
                    {def.hasThreshold && cfg.threshold !== null ? (
                      <>
                        <input
                          type="number" min={1} max={99}
                          value={cfg.threshold}
                          onChange={e => setThreshold(def.key, Number(e.target.value))}
                          style={{ width: 46, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY_30}`, borderRadius: 6, padding: "3px 6px", textAlign: "center", color: GRAY_90, outline: "none" }}
                        />
                        <span style={{ fontSize: 11, color: GRAY_60 }}>{def.unit}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: GRAY_40 }}>—</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    {(["inapp", "email"] as Array<"inapp" | "email">).map(ch => (
                      <div key={ch} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: GRAY_60 }}>{ch === "inapp" ? "Console" : "Email"}</span>
                        <button
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
      </div>
    </PageContainer>
  );
}

// ─── System Settings ──────────────────────────────────────────────────────────
export function AdminSystemSettings() {
  const [authItems, setAuthItems] = useState([
    { key: "email-verify", label: "Email Verification on Sign-up", enabled: true },
    { key: "google-login", label: "Google Social Login", enabled: false },
    { key: "github-login", label: "GitHub Social Login", enabled: false },
  ]);
  const toggleAuth = (key: string) => setAuthItems(prev => prev.map(a => a.key === key ? { ...a, enabled: !a.enabled } : a));

  return (
    <PageContainer title="System Settings" subtitle="Manage authentication, email delivery, and storage integration settings.">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Authentication</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>Configure sign-up and login methods available to users.</div>
          {authItems.map((s, idx) => (
            <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: idx < authItems.length - 1 ? `1px solid rgb(242,242,242)` : "none" }}>
              <span style={{ fontSize: 14, color: s.enabled ? GRAY_90 : GRAY_40, fontWeight: 500 }}>{s.label}</span>
              <LabelToggle on={s.enabled} labelOn="On" labelOff="Off" width={52} onToggle={() => toggleAuth(s.key)} />
            </div>
          ))}
        </Card>

        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Email Delivery</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>SMTP configuration used for all outbound system notifications.</div>
          {[
            { label: "Sender Name",  value: "NeuroStack GPUaaS" },
            { label: "Sender Email", value: "noreply@neurostack.sdt.inc" },
            { label: "SMTP Host",    value: "smtp.sdt.inc" },
            { label: "SMTP Port",    value: "587" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid rgb(242,242,242)` }}>
              <div style={{ fontSize: 13, color: GRAY_60, width: 140 }}>{label}</div>
              <input type="text" defaultValue={value} style={{ flex: 1, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13 }} />
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <PrimaryBtn size="small" variant="secondary">Send Test Email</PrimaryBtn>
            <PrimaryBtn size="small">Save Changes</PrimaryBtn>
          </div>
        </Card>

        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>Internal Storage Integration</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>Connect to the internal storage system for automatic image discovery and registration.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>API Endpoint</div>
              <input type="text" defaultValue="https://internal-storage.sdt.inc/api/v1" style={{ width: "100%", height: 40, padding: "0 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <PrimaryBtn size="small">Save Changes</PrimaryBtn>
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
    { id: "tmp",    type: "Temporary Storage", color: BLUE,    ratePerGB: "0.05", unit: "h", billingStop: "서버 중지 시" },
    { id: "local",  type: "Local Storage",     color: PRIMARY, ratePerGB: "0.10", unit: "h", billingStop: "없음" },
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "rgb(218,235,255)", borderRadius: 10, marginBottom: 12 }}>
        <AlertTriangle size={14} color={BLUE} />
        <span style={{ fontSize: 13, color: GRAY_90 }}>가격 정책 변경은 즉시 적용됩니다. 변경 전 충분히 검토하세요.</span>
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
                <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
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
                    <button key={u} onClick={() => setDraft(d => d ? { ...d, unit: u } : d)} style={{
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
                    <button key={opt} onClick={() => setDraft(d => d ? { ...d, billingStop: opt } : d)} style={{
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "rgb(218,235,255)", borderRadius: 10, marginBottom: 12 }}>
        <AlertTriangle size={14} color={BLUE} />
        <span style={{ fontSize: 13, color: GRAY_90 }}>단가 변경은 <strong>신규 서버 생성 시점</strong>부터 적용됩니다. 기존 실행 서버는 다음 결제 주기부터 적용됩니다.</span>
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
                <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: GRAY_60, display: "flex", borderRadius: 6 }}
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
                    <button key={u} onClick={() => setDraft(d => d ? { ...d, unit: u } : d)} style={{
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

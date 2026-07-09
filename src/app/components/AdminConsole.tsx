import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Server, Users, Layers, Database, Image, Cpu, CreditCard, ReceiptText, Zap,
  BellRing, Settings, Plus, Edit, Trash2, ChevronRight, AlertTriangle,
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, GRAY_5, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
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

const revenueTrend = [
  { day: "7/1", revenue: 5200000, refund: 100000 }, { day: "7/2", revenue: 6800000, refund: 0 },
  { day: "7/3", revenue: 4900000, refund: 210000 }, { day: "7/4", revenue: 7200000, refund: 0 },
  { day: "7/5", revenue: 8100000, refund: 420000 }, { day: "7/6", revenue: 7600000, refund: 0 },
  { day: "7/7", revenue: 8400000, refund: 210000 },
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
  { type: "결제 실패", msg: "team-alpha — 카드 결제 실패 (만료)", time: "18분 전", severity: "danger" as const },
  { type: "강제 종료", msg: "abuse-server-01 강제 종료 완료", time: "1시간 전", severity: "warning" as const },
  { type: "저장소 연동", msg: "Internal Storage 연동 재시도 성공", time: "3시간 전", severity: "info" as const },
];

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: `1px solid ${GRAY_30}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: GRAY_60, marginBottom: 4 }}>{label}</div>
      <div style={{ color: GREEN, fontWeight: 700 }}>매출: {(payload[0]?.value / 10000).toFixed(0)}만원</div>
      {payload[1]?.value > 0 && <div style={{ color: RED, fontWeight: 600 }}>환불: {(payload[1]?.value / 10000).toFixed(0)}만원</div>}
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
            긴급 알림 2건 — <strong>gpu-node-07 GPU 오류</strong>, <strong>team-alpha 결제 실패</strong> 확인이 필요합니다.
          </span>
        </div>
        <Badge color="danger">즉시 확인 필요</Badge>
      </div>

      {/* ── KPI 4종 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <MetricCard label="활성 서버" value="47" sub="전일 대비 +3개" icon={<Server size={18} />} color={PRIMARY} trend={{ up: true, text: "+3 전일" }} />
        <MetricCard label="GPU 점유율" value="73%" sub="128개 중 93개 점유" icon={<Cpu size={18} />} color={BLUE} />
        <MetricCard label="오늘 매출" value="8,400만" sub="환불 21만원 포함" icon={<CreditCard size={18} />} color={GREEN} trend={{ up: true, text: "+10% 전일" }} />
        <MetricCard label="활성 사용자" value="284" sub="총 등록 사용자 512명" icon={<Users size={18} />} color={YELLOW} />
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

        {/* 매출 추이 */}
        <SectionCard title="일별 매출 추이" subtitle="최근 7일 결제 매출 및 환불">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={revenueTrend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} />
              <Tooltip content={<RevenueTooltip />} />
              <Bar dataKey="revenue" fill={GREEN} radius={[4, 4, 0, 0]} name="매출" />
              <Bar dataKey="refund" fill={RED} radius={[4, 4, 0, 0]} opacity={0.7} name="환불" />
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

        {/* 오늘 결제 현황 */}
        <SectionCard title="오늘 결제 현황">
          {[
            { label: "결제 성공", value: "28건", amount: "8,400만원", color: GREEN, icon: "✓" },
            { label: "결제 실패", value: "2건", amount: "420만원", color: RED, icon: "✗" },
            { label: "환불 요청", value: "1건", amount: "210만원", color: YELLOW, icon: "↩" },
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
            <div style={{ fontSize: 11, color: GRAY_60 }}>이번 달 누적 매출</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, marginTop: 2 }}>1억 2,450만원</div>
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}

// ─── User Management ──────────────────────────────────────────────────────────
export function AdminUserManagement() {
  const [search, setSearch] = useState("");
  const users = [
    { name: "박선욱", email: "sunwook.park@sdt.inc", joined: "2026-01-15", workspaces: 2, servers: 2, status: "active", lastLogin: "오늘 09:42", usedCr: 12450, totalCr: 45230, role: "owner" },
    { name: "이지현", email: "jihyun.lee@sdt.inc", joined: "2026-02-20", workspaces: 1, servers: 5, status: "active", lastLogin: "어제 18:30", usedCr: 28600, totalCr: 120500, role: "admin" },
    { name: "김태민", email: "taemin.kim@sdt.inc", joined: "2026-03-10", workspaces: 1, servers: 1, status: "active", lastLogin: "2일 전", usedCr: 4200, totalCr: 8200, role: "user" },
    { name: "최유진", email: "yujin.choi@sdt.inc", joined: "2026-04-05", workspaces: 1, servers: 0, status: "inactive", lastLogin: "14일 전", usedCr: 0, totalCr: 1000, role: "user" },
    { name: "장민준", email: "minjun.jang@sdt.inc", joined: "2026-05-22", workspaces: 1, servers: 1, status: "active", lastLogin: "오늘 14:15", usedCr: 3100, totalCr: 9800, role: "user" },
  ];
  const filtered = users.filter(u =>
    !search || u.name.includes(search) || u.email.toLowerCase().includes(search.toLowerCase())
  );
  const active = users.filter(u => u.status === "active").length;
  const totalServers = users.reduce((s, u) => s + u.servers, 0);

  return (
    <PageContainer title="User Management" subtitle="전체 사용자 목록을 조회하고 관리합니다.">
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "전체 사용자", value: users.length, color: GRAY_90 },
          { label: "활성", value: active, color: GREEN },
          { label: "비활성", value: users.length - active, color: GRAY_40 },
          { label: "총 활성 서버", value: totalServers, color: PRIMARY },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: GRAY_60 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <input type="text" placeholder="이름 또는 이메일로 검색..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", height: 42, paddingLeft: 40, paddingRight: 16, borderRadius: 10, border: `1.5px solid ${search ? PRIMARY : GRAY_30}`, backgroundColor: "white", fontSize: 14, color: GRAY_90, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }} />
        <Users size={16} color={GRAY_60} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      </div>

      {/* User cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(u => {
          const usagePct = Math.round((u.usedCr / Math.max(u.totalCr, 1)) * 100);
          const creditWarning = u.totalCr < 5000;
          return (
            <Card key={u.email} hover style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: u.status === "active" ? PRIMARY_10 : GRAY_5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: u.status === "active" ? PRIMARY : GRAY_40 }}>{u.name[0]}</div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", backgroundColor: u.status === "active" ? GREEN : GRAY_30, border: "2px solid white" }} />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: GRAY_90 }}>{u.name}</span>
                    <Badge color={u.status === "active" ? "success" : "neutral"}>{u.status === "active" ? "활성" : "비활성"}</Badge>
                    {creditWarning && <Badge color="warning">크레딧 부족</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 8 }}>{u.email} · 가입 {u.joined} · 최근 {u.lastLogin}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_70 }}>
                      <Layers size={11} color={GRAY_60} /> 워크스페이스 <strong style={{ color: GRAY_90 }}>{u.workspaces}개</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_70 }}>
                      <Server size={11} color={u.servers > 0 ? GREEN : GRAY_40} /> 서버 <strong style={{ color: u.servers > 0 ? GREEN : GRAY_60 }}>{u.servers}개</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_70 }}>
                      <CreditCard size={11} color={creditWarning ? RED : PRIMARY} /> 크레딧 <strong style={{ color: creditWarning ? RED : GRAY_90 }}>{u.totalCr.toLocaleString()} cr</strong>
                    </div>
                  </div>
                  {/* Usage bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 5, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${usagePct}%`, backgroundColor: PRIMARY, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: GRAY_60, flexShrink: 0 }}>이달 {u.usedCr.toLocaleString()} cr 사용</span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button style={{ fontSize: 11, color: PRIMARY, background: PRIMARY_10, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>상세</button>
                  {u.status === "active"
                    ? <button style={{ fontSize: 11, color: RED, background: "rgb(254,242,242)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>비활성화</button>
                    : <button style={{ fontSize: 11, color: GREEN, background: "rgb(240,253,244)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>활성화</button>
                  }
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

// ─── Workspace Management ─────────────────────────────────────────────────────
export function AdminWorkspaceManagement({ onDetail }: { onDetail: () => void }) {
  const workspaces = [
    { name: "My Workspace", owner: "박선욱", members: 5, servers: 4, credits: 45230, maxCredits: 80000, status: "active", rate: 120, plan: "Standard" },
    { name: "Team Alpha", owner: "이지현", members: 8, servers: 12, credits: 120500, maxCredits: 200000, status: "active", rate: 480, plan: "Enterprise" },
    { name: "ML Research Lab", owner: "김태민", members: 3, servers: 2, credits: 8200, maxCredits: 50000, status: "active", rate: 48, plan: "Standard" },
    { name: "Old Project", owner: "최유진", members: 1, servers: 0, credits: 1000, maxCredits: 10000, status: "inactive", rate: 0, plan: "Standard" },
  ];
  return (
    <PageContainer title="Workspace Management" subtitle="전체 워크스페이스를 조회하고 관리합니다.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "전체 워크스페이스", value: workspaces.length, color: GRAY_90 },
          { label: "활성", value: workspaces.filter(w => w.status === "active").length, color: GREEN },
          { label: "크레딧 위험", value: workspaces.filter(w => w.credits < 5000).length, color: RED },
          { label: "총 활성 서버", value: workspaces.reduce((s, w) => s + w.servers, 0), color: PRIMARY },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: GRAY_60 }}>{label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {workspaces.map(w => {
          const creditPct = Math.round((w.credits / w.maxCredits) * 100);
          const isLow = w.credits < 5000;
          return (
            <Card key={w.name} hover style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Icon */}
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: w.status === "active" ? PRIMARY_10 : GRAY_5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Layers size={18} color={w.status === "active" ? PRIMARY : GRAY_40} />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{w.name}</span>
                    <Badge color={w.status === "active" ? "success" : "neutral"}>{w.status === "active" ? "활성" : "비활성"}</Badge>
                    <Badge color="neutral">{w.plan}</Badge>
                    {isLow && <Badge color="danger">크레딧 위험</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 10 }}>Owner: {w.owner} · 멤버 {w.members}명</div>
                  <div style={{ display: "flex", gap: 20, fontSize: 12, marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_70 }}>
                      <Server size={11} color={w.servers > 0 ? GREEN : GRAY_40} /> 서버 <strong style={{ color: w.servers > 0 ? GREEN : GRAY_60 }}>{w.servers}개</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_70 }}>
                      <CreditCard size={11} color={isLow ? RED : PRIMARY} /> 잔액 <strong style={{ color: isLow ? RED : PRIMARY }}>{w.credits.toLocaleString()} cr</strong>
                    </div>
                    {w.rate > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_70 }}>
                        <Zap size={11} color={PRIMARY} /> <strong style={{ color: PRIMARY }}>{w.rate} cr/h</strong> 소비 중
                      </div>
                    )}
                  </div>
                  {/* Credit bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${creditPct}%`, backgroundColor: isLow ? RED : creditPct < 40 ? YELLOW : PRIMARY, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: GRAY_60, flexShrink: 0 }}>{creditPct}%</span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={onDetail} style={{ fontSize: 11, color: PRIMARY, background: PRIMARY_10, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>상세</button>
                  {w.status === "active"
                    ? <button style={{ fontSize: 11, color: RED, background: "rgb(254,242,242)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>비활성화</button>
                    : <button style={{ fontSize: 11, color: GREEN, background: "rgb(240,253,244)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>활성화</button>
                  }
                </div>
              </div>
            </Card>
          );
        })}
      </div>
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
            <div style={{ fontSize: 12, color: GRAY_60, marginTop: 4 }}>owner: 박선욱 · 5명 · 활성</div>
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
                ["박선욱", "workspace.owner", "sunwook.park@sdt.inc"],
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
export function AdminServerManagement() {
  const servers = [
    { name: "pytorch-dev-01", workspace: "My Workspace", owner: "박선욱", gpu: "RTX A5000 × 2", status: "running" as const, uptime: "5h 32m", gpuUtil: 75, rate: 24, flag: false },
    { name: "llm-finetuning", workspace: "Team Alpha", owner: "이지현", gpu: "H100 SXM5 × 4", status: "running" as const, uptime: "2h 15m", gpuUtil: 93, rate: 208, flag: false },
    { name: "abuse-server-01", workspace: "ML Research Lab", owner: "김태민", gpu: "A100 SXM4 × 8", status: "running" as const, uptime: "72h 11m", gpuUtil: 14, rate: 192, flag: true },
    { name: "stable-diffusion", workspace: "My Workspace", owner: "박선욱", gpu: "RTX 4090 × 1", status: "stopped" as const, uptime: "—", gpuUtil: 0, rate: 0, flag: false },
    { name: "data-preprocess", workspace: "Team Alpha", owner: "장민준", gpu: "A100 SXM4 × 2", status: "creating" as const, uptime: "—", gpuUtil: 0, rate: 48, flag: false },
  ];
  const running = servers.filter(s => s.status === "running");
  const flagged = servers.filter(s => s.flag);

  return (
    <PageContainer title="Server Management" subtitle="전체 서버 현황을 조회하고 필요 시 강제 종료합니다.">
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "전체 서버", value: servers.length, color: GRAY_90 },
          { label: "Running", value: running.length, color: GREEN },
          { label: "생성 중", value: servers.filter(s => s.status === "creating").length, color: BLUE },
          { label: "어뷰징 의심", value: flagged.length, color: RED },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: GRAY_60 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Abuse alert */}
      {flagged.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "rgb(255,242,242)", borderRadius: 10, border: `1px solid ${RED}30`, marginBottom: 14 }}>
          <AlertTriangle size={14} color={RED} />
          <div style={{ flex: 1, fontSize: 13, color: GRAY_90 }}>
            <strong>어뷰징 의심 서버:</strong> abuse-server-01 — 72시간 이상 실행, GPU 점유율 14% (저점유)
          </div>
          <button style={{ padding: "5px 12px", borderRadius: 8, border: "none", backgroundColor: RED, color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>강제 종료</button>
        </div>
      )}

      {/* Server cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {servers.map(s => {
          const isRunning = s.status === "running";
          const isHighUtil = s.gpuUtil > 85;
          const isLowUtil = s.gpuUtil > 0 && s.gpuUtil < 20;
          return (
            <Card key={s.name} style={{ padding: "18px 20px", border: s.flag ? `1.5px solid ${RED}40` : undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Status indicator */}
                <div style={{ position: "relative", width: 12, height: 12, marginTop: 4, flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: isRunning ? (s.flag ? RED : GREEN) : s.status === "creating" ? BLUE : GRAY_30 }} />
                  {isRunning && !s.flag && (
                    <div style={{ position: "absolute", inset: -2, borderRadius: "50%", border: `2px solid ${GREEN}`, animation: "pulse 2s infinite", opacity: 0.4 }} />
                  )}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: "Roboto Mono, monospace", fontSize: 13, fontWeight: 700, color: GRAY_90 }}>{s.name}</span>
                    <Badge color={isRunning ? (s.flag ? "danger" : "success") : s.status === "creating" ? "info" : "neutral"}>
                      {s.status}
                    </Badge>
                    {s.flag && <Badge color="danger">어뷰징 의심</Badge>}
                    {isLowUtil && isRunning && <Badge color="warning">저점유</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: isRunning ? 10 : 0 }}>
                    {s.workspace} · {s.owner} · {s.gpu} · Uptime {s.uptime}
                  </div>
                  {isRunning && (
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRAY_60, marginBottom: 3 }}>
                          <span>GPU 점유율</span>
                          <span style={{ fontWeight: 700, color: isHighUtil ? RED : isLowUtil ? YELLOW : GRAY_90 }}>{s.gpuUtil}%</span>
                        </div>
                        <div style={{ height: 6, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${s.gpuUtil}%`, backgroundColor: isHighUtil ? RED : isLowUtil ? YELLOW : PRIMARY, borderRadius: 3 }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: PRIMARY, fontWeight: 600, flexShrink: 0 }}>
                        {s.rate} cr/h
                      </div>
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {isRunning && (
                    <button style={{ fontSize: 11, color: RED, background: "rgb(254,242,242)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>강제 종료</button>
                  )}
                  <button style={{ fontSize: 11, color: GRAY_70, background: GRAY_5, border: `1px solid ${GRAY_30}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>상세</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

// ─── GPU Type Management ──────────────────────────────────────────────────────
export function AdminGPUTypeManagement() {
  const [expanded, setExpanded] = useState<string | null>("H100 SXM5");
  const gpuTypes = [
    {
      name: "H100 SXM5", vram: "80GB", nodeCount: 4, occupied: 24, total: 32, capacity: "High", on: true, pub: true,
      nodes: [
        { name: "gpu-node-01", status: "available", totalGPU: 8, occupiedGPU: 7, freeGPU: 1 },
        { name: "gpu-node-02", status: "available", totalGPU: 8, occupiedGPU: 6, freeGPU: 2 },
        { name: "gpu-node-03", status: "available", totalGPU: 8, occupiedGPU: 6, freeGPU: 2 },
        { name: "gpu-node-04", status: "error", totalGPU: 8, occupiedGPU: 5, freeGPU: 3 },
      ]
    },
    {
      name: "A100 SXM4", vram: "80GB", nodeCount: 6, occupied: 36, total: 48, capacity: "Medium", on: true, pub: true,
      nodes: [
        { name: "gpu-node-05", status: "available", totalGPU: 8, occupiedGPU: 6, freeGPU: 2 },
        { name: "gpu-node-06", status: "available", totalGPU: 8, occupiedGPU: 5, freeGPU: 3 },
        { name: "gpu-node-07", status: "maintenance", totalGPU: 8, occupiedGPU: 0, freeGPU: 8 },
      ]
    },
    {
      name: "RTX A5000", vram: "24GB", nodeCount: 6, occupied: 33, total: 48, capacity: "Low", on: true, pub: true, nodes: []
    },
    {
      name: "RTX 4090", vram: "24GB", nodeCount: 2, occupied: 0, total: 16, capacity: "No", on: false, pub: false, nodes: []
    },
  ];

  const capacityColor = (cap: string) => {
    if (cap === "High") return GREEN;
    if (cap === "Medium") return BLUE;
    if (cap === "Low") return YELLOW;
    return RED;
  };

  const nodeStatusColor = (s: string) => {
    if (s === "available") return GREEN;
    if (s === "unavailable") return GRAY_40;
    if (s === "maintenance") return YELLOW;
    return RED;
  };

  return (
    <PageContainer title="GPU Type Management" subtitle="GPU 유형 및 노드 현황을 통합 관리합니다.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {gpuTypes.map(gpu => (
          <Card key={gpu.name} style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={() => setExpanded(expanded === gpu.name ? null : gpu.name)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <ChevronRight size={16} color={GRAY_60} style={{ transform: expanded === gpu.name ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{gpu.name}</div>
                  <Badge color="neutral">VRAM {gpu.vram}</Badge>
                  <Badge color={gpu.capacity === "High" ? "success" : gpu.capacity === "Medium" ? "info" : gpu.capacity === "Low" ? "warning" : "danger"}>
                    {gpu.capacity} Capacity
                  </Badge>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: gpu.on ? GREEN : GRAY_40 }} />
                  <span style={{ fontSize: 12, color: GRAY_60 }}>{gpu.on ? "ON" : "OFF"}</span>
                  {gpu.pub && <Badge color="primary" variant="outline">Public</Badge>}
                </div>
                <div style={{ fontSize: 12, color: GRAY_60, marginTop: 4 }}>
                  노드 {gpu.nodeCount}개 · GPU {gpu.occupied}/{gpu.total} 점유
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <PrimaryBtn size="xsmall" variant="secondary"><Edit size={12} /> 편집</PrimaryBtn>
              </div>
            </div>

            {/* Node List */}
            {expanded === gpu.name && gpu.nodes.length > 0 && (
              <div style={{ borderTop: `1px solid rgb(242,242,242)`, backgroundColor: GRAY_5 }}>
                {gpu.nodes.map(node => (
                  <div key={node.name} style={{ display: "flex", alignItems: "center", padding: "12px 20px 12px 52px", gap: 14, borderBottom: `1px solid rgb(242,242,242)`, cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgb(245,245,245)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: nodeStatusColor(node.status), flexShrink: 0 }} />
                    <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, fontFamily: "Roboto Mono, monospace", minWidth: 120 }}>{node.name}</div>
                    <Badge color={node.status === "available" ? "success" : node.status === "maintenance" ? "warning" : "danger"}>{node.status}</Badge>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: GRAY_60, marginLeft: "auto" }}>
                      <span>총 <strong style={{ color: GRAY_90 }}>{node.totalGPU}</strong> GPU</span>
                      <span>점유 <strong style={{ color: RED }}>{node.occupiedGPU}</strong> GPU</span>
                      <span>여유 <strong style={{ color: GREEN }}>{node.freeGPU}</strong> GPU</span>
                    </div>
                    <button style={{ fontSize: 11, color: PRIMARY, background: PRIMARY_10, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>노드 상세</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </PageContainer>
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
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 5 }}>
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
export function AdminImageManagement({ initialTab = "Server Images" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const [view, setView] = useState<"list" | "create-image" | "edit-image" | "create-category" | "create-template" | "edit-template">("list");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  useEffect(() => { setTab(initialTab); setView("list"); }, [initialTab]);

  const GPU_OPTIONS = ["RTX A5000", "A100 SXM4", "H100 SXM5", "RTX 4090"];
  const THUMB_OPTIONS = ["🔵", "🟡", "🟣", "🟠", "🟢", "🔴", "⚪", "⚫", "🟤", "🧠", "💬", "👁", "📊", "🔬"];
  const PRESET_COLORS = [PRIMARY, BLUE, GREEN, YELLOW, RED, "rgb(168,85,247)", "rgb(236,72,153)", GRAY_60];
  const ACCESS_OPTIONS = ["JupyterLab", "VS Code", "SSH", "Terminal", "복합"];

  const [images, setImages] = useState([
    { id: "i1", name: "PyTorch 2.1 + CUDA 12.1", path: "registry.internal/pytorch:2.1-cuda12.1", tier: "Official", category: "ML/DL", status: "Public", isDeprecated: false, thumb: "🔵", desc: "PyTorch 2.1과 CUDA 12.1이 사전 설치된 공식 딥러닝 개발 환경. JupyterLab과 VS Code 접속을 지원합니다.", recGpu: "A100 SXM4", recTmp: 30, recLocal: 100, tags: "PyTorch, CUDA 12.1, JupyterLab", packages: "torch==2.1.0\ntorchvision==0.16\ncuda==12.1\njupyterlab==4.0\nwandb\ntensorboard", access: ["JupyterLab", "VS Code"], ports: "8888:JupyterLab, 8080:VS Code", envKeys: "WANDB_API_KEY, HF_TOKEN", used: 847 },
    { id: "i2", name: "TensorFlow 2.15", path: "registry.internal/tensorflow:2.15-cuda12.1", tier: "Official", category: "ML/DL", status: "Public", isDeprecated: false, thumb: "🟡", desc: "TensorFlow 2.15 및 Keras를 포함한 완전한 ML 개발 환경.", recGpu: "RTX A5000", recTmp: 20, recLocal: 50, tags: "TensorFlow, Keras, CUDA", packages: "tensorflow==2.15.0\nkeras==2.15\ncuda==12.1\njupyterlab==4.0", access: ["JupyterLab", "VS Code"], ports: "8888:JupyterLab", envKeys: "", used: 623 },
    { id: "i3", name: "LLaMA Fine-tuning v2", path: "registry.internal/llama-finetune:v2", tier: "Verified", category: "LLM", status: "Public", isDeprecated: false, thumb: "🟣", desc: "Meta LLaMA 시리즈 모델을 LoRA/QLoRA로 파인튜닝하기 위한 최적화 환경. 4비트 양자화 지원.", recGpu: "H100 SXM5", recTmp: 50, recLocal: 200, tags: "LLaMA, LoRA, QLoRA, bitsandbytes", packages: "transformers==4.38\npeft==0.8\nbitsandbytes\nacccelerate\ntrl\ndatasets", access: ["JupyterLab"], ports: "8888:JupyterLab", envKeys: "HF_TOKEN, WANDB_API_KEY", used: 412 },
    { id: "i4", name: "Stable Diffusion WebUI", path: "registry.internal/sdwebui:latest", tier: "Verified", category: "CV", status: "Public", isDeprecated: false, thumb: "🟠", desc: "AUTOMATIC1111 Stable Diffusion WebUI + ControlNet, LoRA 지원.", recGpu: "RTX 4090", recTmp: 20, recLocal: 50, tags: "Stable Diffusion, ControlNet, xFormers", packages: "stable-diffusion-webui\ncontrolnet\nxformers\nCLIP", access: ["VS Code", "SSH"], ports: "7860:WebUI", envKeys: "", used: 389 },
    { id: "i5", name: "Legacy GPU Image v1", path: "registry.internal/legacy:v1", tier: "Verified", category: "개발환경", status: "Deprecated", isDeprecated: true, thumb: "⚫", desc: "구 버전 개발 환경. 신규 이미지 사용을 권장합니다.", recGpu: "RTX A5000", recTmp: 10, recLocal: 20, tags: "Legacy", packages: "python==3.8\ntensorflow==1.15", access: ["SSH"], ports: "22:SSH", envKeys: "", used: 12 },
  ]);

  const [categories, setCategories] = useState([
    { id: "c1", name: "ML/DL", desc: "머신러닝·딥러닝 개발 환경", icon: "🧠", color: PRIMARY, imgCnt: 2 },
    { id: "c2", name: "LLM", desc: "대형 언어 모델 학습 및 추론", icon: "💬", color: BLUE, imgCnt: 1 },
    { id: "c3", name: "CV", desc: "컴퓨터 비전 및 이미지 처리", icon: "👁", color: GREEN, imgCnt: 1 },
    { id: "c4", name: "NLP", desc: "자연어 처리", icon: "📝", color: YELLOW, imgCnt: 0 },
    { id: "c5", name: "Data Science", desc: "데이터 분석 및 시각화", icon: "📊", color: "rgb(168,85,247)", imgCnt: 1 },
    { id: "c6", name: "개발환경", desc: "범용 Python·개발 환경", icon: "⚙️", color: GRAY_60, imgCnt: 1 },
  ]);

  const [templates, setTemplates] = useState([
    { id: "t1", name: "PyTorch LLM 학습", desc: "LLM 학습에 최적화된 PyTorch 기반 템플릿", image: "PyTorch 2.1 + CUDA 12.1", recVram: "80GB+", tmp: 30, local: 100, hasLocal: true, hasShared: false, shared: "", envVars: "WANDB_API_KEY=\nHF_TOKEN=", status: "Public", used: 312 },
    { id: "t2", name: "Stable Diffusion 생성", desc: "이미지 생성을 위한 Stable Diffusion 템플릿", image: "Stable Diffusion WebUI", recVram: "24GB+", tmp: 20, local: 50, hasLocal: true, hasShared: false, shared: "", envVars: "", status: "Public", used: 198 },
    { id: "t3", name: "LLaMA 파인튜닝", desc: "H100 기반 대규모 LLM 파인튜닝 전용 템플릿", image: "LLaMA Fine-tuning v2", recVram: "80GB+", tmp: 50, local: 200, hasLocal: true, hasShared: false, shared: "", envVars: "HF_TOKEN=\nWANDB_API_KEY=", status: "Public", used: 145 },
    { id: "t4", name: "팀 데이터 분석", desc: "공유 스토리지 연결 팀용 데이터 분석 환경", image: "Data Science Pro", recVram: "24GB+", tmp: 10, local: 20, hasLocal: true, hasShared: true, shared: "team-shared-01", envVars: "", status: "Internal", used: 87 },
  ]);

  const [tiers, setTiers] = useState([
    { id: "tier-official", name: "Official", color: PRIMARY, desc: "NeuroStack이 직접 관리·검증하는 공식 이미지", imgCnt: 2 },
    { id: "tier-verified", name: "Verified", color: GREEN, desc: "커뮤니티 검증을 통과한 신뢰할 수 있는 이미지", imgCnt: 3 },
  ]);
  const [newTier, setNewTier] = useState({ name: "", desc: "", color: PRIMARY });
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [tierDraft, setTierDraft] = useState({ name: "", desc: "", color: PRIMARY });

  // ── Image form state ──
  const blankImg = { name: "", path: "", desc: "", tier: "Official", category: "ML/DL", status: "Public", isDeprecated: false, thumb: "🔵", recGpu: "A100 SXM4", recTmp: 20, recLocal: 50, tags: "", packages: "", access: [] as string[], ports: "", envKeys: "" };
  const [imgForm, setImgForm] = useState({ ...blankImg });

  // ── Category form state ──
  const blankCat = { name: "", desc: "", icon: "📦", color: PRIMARY };
  const [catForm, setCatForm] = useState({ ...blankCat });
  const [catEditForm, setCatEditForm] = useState({ name: "", desc: "", icon: "", color: PRIMARY });

  // ── Template form state ──
  const blankTpl = { name: "", desc: "", image: "PyTorch 2.1 + CUDA 12.1", recVram: "80GB+", tmp: 20, hasLocal: false, local: 50, hasShared: false, shared: "", envVars: "", status: "Public" };
  const [tplForm, setTplForm] = useState({ ...blankTpl });

  const openCreate = (type: "image" | "category" | "template") => {
    setImgForm({ ...blankImg });
    setCatForm({ ...blankCat });
    setTplForm({ ...blankTpl });
    setEditingImageId(null);
    setEditingTemplateId(null);
    setView(type === "image" ? "create-image" : type === "category" ? "create-category" : "create-template");
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: on ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: on ? 21 : 3 }} />
    </button>
  );

  // ── Full-page Image Form ──
  const renderImageForm = (isEdit: boolean) => {
    const catOptions = categories.map(c => c.name);
    return (
      <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
        <div style={{ maxWidth: 800 }}>
          <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Image Management</button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0 }}>{isEdit ? "이미지 편집" : "이미지 등록"}</h1>
              <div style={{ fontSize: 13, color: GRAY_60, marginTop: 4 }}>서버 이미지 메타데이터와 접속·환경 정보를 입력하세요.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
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

          <Card style={{ padding: "28px 32px" }}>
            <SectionDivider label="식별 정보" />
            <FormRow label="이미지 경로" required>
              <input style={fldStyle} placeholder="registry.internal/my-image:tag" value={imgForm.path} onChange={e => setImgForm(f => ({ ...f, path: e.target.value }))} />
              <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>내부 저장소에 적재된 이미지만 사용 가능합니다. (registry.internal/...)</div>
            </FormRow>
            <FormRow label="이미지명" required>
              <input style={fldStyle} placeholder="예: PyTorch 2.1 + CUDA 12.1" value={imgForm.name} onChange={e => setImgForm(f => ({ ...f, name: e.target.value }))} />
              <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>사용자에게 노출되는 이름. 버전과 주요 특징을 포함하세요.</div>
            </FormRow>

            <SectionDivider label="접속 방식" />
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
              <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>접속 UI 결정에 사용됩니다. 복수 선택 가능.</div>
            </FormRow>

            <SectionDivider label="설명 및 시각화" />
            <FormRow label="설명 (마크다운)">
              <textarea style={{ ...txaStyle, minHeight: 100 }} placeholder={"## 이미지 설명\n\n이 이미지에 대한 설명을 마크다운으로 작성하세요.\n\n- 주요 특징\n- 사용 방법"} value={imgForm.desc} onChange={e => setImgForm(f => ({ ...f, desc: e.target.value }))} />
              <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>마크다운 형식으로 작성하면 안전하게 렌더링됩니다.</div>
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

            <SectionDivider label="분류 및 공개 설정" />
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
                <select style={{ ...fldStyle, cursor: "pointer" }} value={imgForm.category} onChange={e => setImgForm(f => ({ ...f, category: e.target.value }))}>
                  {catOptions.map(c => <option key={c}>{c}</option>)}
                </select>
              </FormRow>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormRow label="공개 여부">
                <div style={{ display: "flex", alignItems: "center", gap: 10, height: 36 }}>
                  <Toggle on={imgForm.status === "Public"} onToggle={() => setImgForm(f => ({ ...f, status: f.status === "Public" ? "Internal" : "Public" }))} />
                  <span style={{ fontSize: 13, color: imgForm.status === "Public" ? GREEN : GRAY_60, fontWeight: 500 }}>{imgForm.status === "Public" ? "공개 (사용자 콘솔 노출)" : "비공개 (Internal)"}</span>
                </div>
              </FormRow>
              <FormRow label="Deprecated 여부">
                <div style={{ display: "flex", alignItems: "center", gap: 10, height: 36 }}>
                  <Toggle on={imgForm.isDeprecated} onToggle={() => setImgForm(f => ({ ...f, isDeprecated: !f.isDeprecated, status: !f.isDeprecated ? "Deprecated" : "Public" }))} />
                  <span style={{ fontSize: 13, color: imgForm.isDeprecated ? YELLOW : GRAY_60, fontWeight: 500 }}>{imgForm.isDeprecated ? "Deprecated (경고 배지 및 모달 표시)" : "정상"}</span>
                </div>
              </FormRow>
            </div>
            <FormRow label="태그">
              <input style={fldStyle} placeholder="PyTorch, CUDA, JupyterLab" value={imgForm.tags} onChange={e => setImgForm(f => ({ ...f, tags: e.target.value }))} />
              <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>쉼표(,)로 구분. 필터·검색에 활용됩니다.</div>
            </FormRow>

            <SectionDivider label="리소스 권장 사양" />
            <FormRow label="권장 GPU 유형">
              <select style={{ ...fldStyle, cursor: "pointer" }} value={imgForm.recGpu} onChange={e => setImgForm(f => ({ ...f, recGpu: e.target.value }))}>
                {GPU_OPTIONS.map(g => <option key={g}>{g}</option>)}
              </select>
            </FormRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormRow label="권장 임시 스토리지 (GB)">
                <input type="number" style={fldStyle} min={10} step={10} value={imgForm.recTmp} onChange={e => setImgForm(f => ({ ...f, recTmp: Number(e.target.value) }))} />
              </FormRow>
              <FormRow label="권장 로컬 스토리지 (GB)">
                <input type="number" style={fldStyle} min={10} step={10} value={imgForm.recLocal} onChange={e => setImgForm(f => ({ ...f, recLocal: Number(e.target.value) }))} />
              </FormRow>
            </div>

            <SectionDivider label="포트 및 환경변수" />
            <FormRow label="포트 정보">
              <input style={fldStyle} placeholder="8888:JupyterLab, 8080:VS Code, 22:SSH" value={imgForm.ports} onChange={e => setImgForm(f => ({ ...f, ports: e.target.value }))} />
              <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>이미지 메타에서 자동 파싱. 포트번호:서비스명 형식으로 쉼표 구분.</div>
            </FormRow>
            <FormRow label="환경변수 사용자 입력용">
              <input style={fldStyle} placeholder="WANDB_API_KEY, HF_TOKEN, OPENAI_API_KEY" value={imgForm.envKeys} onChange={e => setImgForm(f => ({ ...f, envKeys: e.target.value }))} />
              <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>서버 생성 시 사용자에게 노출될 환경변수 키. 쉼표로 구분.</div>
            </FormRow>

            <SectionDivider label="주요 패키지" />
            <FormRow label="패키지 목록 (줄바꿈으로 구분)">
              <textarea style={{ ...txaStyle, minHeight: 100, fontFamily: "Roboto Mono, monospace", fontSize: 12 }} placeholder={"torch==2.1.0\ntorchvision==0.16\ncuda==12.1"} value={imgForm.packages} onChange={e => setImgForm(f => ({ ...f, packages: e.target.value }))} />
            </FormRow>
          </Card>
        </div>
      </div>
    );
  };

  // ── Full-page Category Form ──
  const renderCategoryForm = () => (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 600 }}>
        <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Image Management</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0 }}>카테고리 생성</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <PrimaryBtn variant="secondary" onClick={() => setView("list")}>취소</PrimaryBtn>
            <PrimaryBtn onClick={() => { setCategories(cats => [...cats, { id: `c${Date.now()}`, ...catForm, imgCnt: 0 }]); setView("list"); }}>카테고리 생성</PrimaryBtn>
          </div>
        </div>
        <Card style={{ padding: "28px 32px" }}>
          <SectionDivider label="카테고리 정보" />
          <FormRow label="카테고리 이름" required>
            <input style={fldStyle} placeholder="예: ML/DL" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
          </FormRow>
          <FormRow label="설명">
            <input style={fldStyle} placeholder="카테고리에 대한 간단한 설명" value={catForm.desc} onChange={e => setCatForm(f => ({ ...f, desc: e.target.value }))} />
          </FormRow>
          <SectionDivider label="시각 설정" />
          <FormRow label="아이콘 (이모지)">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input style={{ ...fldStyle, width: 70, fontSize: 22, textAlign: "center" }} value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} />
              <span style={{ fontSize: 12, color: GRAY_60 }}>이모지를 직접 입력하거나 붙여넣으세요.</span>
            </div>
          </FormRow>
          <FormRow label="색상">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setCatForm(f => ({ ...f, color: c }))} style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: c, border: catForm.color === c ? `3px solid ${GRAY_90}` : "3px solid transparent", cursor: "pointer", outline: "none" }} />
              ))}
            </div>
          </FormRow>
          <div style={{ marginTop: 20, padding: "16px 18px", backgroundColor: GRAY_5, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 10 }}>미리보기</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: `${catForm.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{catForm.icon || "📦"}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90 }}>{catForm.name || "카테고리 이름"}</div>
                <div style={{ fontSize: 11, color: GRAY_60 }}>{catForm.desc || "설명"}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // ── Full-page Template Form ──
  const renderTemplateForm = (isEdit: boolean) => (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 700 }}>
        <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Image Management</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0 }}>{isEdit ? "서버 템플릿 편집" : "서버 템플릿 생성"}</h1>
          <div style={{ display: "flex", gap: 10 }}>
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
        <Card style={{ padding: "28px 32px" }}>
          <SectionDivider label="기본 정보" />
          <FormRow label="템플릿 이름" required>
            <input style={fldStyle} placeholder="예: PyTorch LLM 학습" value={tplForm.name} onChange={e => setTplForm(f => ({ ...f, name: e.target.value }))} />
          </FormRow>
          <FormRow label="설명">
            <textarea style={{ ...txaStyle, minHeight: 64 }} placeholder="이 템플릿의 용도를 간단히 설명하세요." value={tplForm.desc} onChange={e => setTplForm(f => ({ ...f, desc: e.target.value }))} />
          </FormRow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormRow label="기반 이미지" required>
              <select style={{ ...fldStyle, cursor: "pointer" }} value={tplForm.image} onChange={e => setTplForm(f => ({ ...f, image: e.target.value }))}>
                {images.map(img => <option key={img.id}>{img.name}</option>)}
              </select>
            </FormRow>
            <FormRow label="공개 상태">
              <select style={{ ...fldStyle, cursor: "pointer" }} value={tplForm.status} onChange={e => setTplForm(f => ({ ...f, status: e.target.value }))}>
                <option>Public</option><option>Internal</option>
              </select>
            </FormRow>
          </div>
          <SectionDivider label="리소스 구성" />
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
            <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>사용자가 GPU 선택 시 참고할 vRAM 권장 사양입니다. GPU 유형/개수는 사용자가 직접 선택합니다.</div>
          </FormRow>
          <FormRow label="임시 스토리지 (GB)">
            <input type="number" style={fldStyle} min={10} step={10} value={tplForm.tmp} onChange={e => setTplForm(f => ({ ...f, tmp: Number(e.target.value) }))} />
          </FormRow>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tplForm.hasLocal ? 10 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>로컬 스토리지</div>
              <button onClick={() => setTplForm(f => ({ ...f, hasLocal: !f.hasLocal }))} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: tplForm.hasLocal ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: tplForm.hasLocal ? 21 : 3 }} />
              </button>
            </div>
            {tplForm.hasLocal && <input type="number" style={fldStyle} min={10} step={10} placeholder="용량 (GB)" value={tplForm.local} onChange={e => setTplForm(f => ({ ...f, local: Number(e.target.value) }))} />}
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tplForm.hasShared ? 10 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70 }}>공유 스토리지 연결</div>
              <button onClick={() => setTplForm(f => ({ ...f, hasShared: !f.hasShared }))} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: tplForm.hasShared ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: tplForm.hasShared ? 21 : 3 }} />
              </button>
            </div>
            {tplForm.hasShared && <input style={fldStyle} placeholder="공유 스토리지 이름 (예: team-shared-01)" value={tplForm.shared} onChange={e => setTplForm(f => ({ ...f, shared: e.target.value }))} />}
          </div>
          <SectionDivider label="환경변수 프리셋" />
          <FormRow label="환경변수 (KEY=VALUE, 줄바꿈 구분)">
            <textarea style={{ ...txaStyle, minHeight: 90, fontFamily: "Roboto Mono, monospace", fontSize: 12 }} placeholder={"WANDB_API_KEY=\nHF_TOKEN="} value={tplForm.envVars} onChange={e => setTplForm(f => ({ ...f, envVars: e.target.value }))} />
          </FormRow>
        </Card>
      </div>
    </div>
  );

  if (view === "create-image") return renderImageForm(false);
  if (view === "edit-image") return renderImageForm(true);
  if (view === "create-category") return renderCategoryForm();
  if (view === "create-template") return renderTemplateForm(false);
  if (view === "edit-template") return renderTemplateForm(true);

  return (
    <PageContainer
      title="Image Management"
      subtitle="서버 이미지·카테고리·서버 템플릿을 등록·편집·관리합니다."
      actions={
        tab === "Server Images" ? <PrimaryBtn size="small" onClick={() => openCreate("image")}><Plus size={14} /> 이미지 등록</PrimaryBtn>
        : tab === "카테고리" ? <PrimaryBtn size="small" onClick={() => openCreate("category")}><Plus size={14} /> 카테고리 생성</PrimaryBtn>
        : tab === "Server Templates" ? <PrimaryBtn size="small" onClick={() => openCreate("template")}><Plus size={14} /> 템플릿 생성</PrimaryBtn>
        : null
      }
    >
      <TabBar tabs={["Server Images", "카테고리", "Server Templates"]} active={tab} onChange={setTab} />

      {/* ── Server Images ── */}
      {tab === "Server Images" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {images.map(img => (
            <Card key={img.id} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{img.thumb}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{img.name}</span>
                    <Badge color={img.tier === "Official" ? "primary" : "success"}>{img.tier}</Badge>
                    <Badge color="neutral">{img.category}</Badge>
                    <Badge color={img.status === "Public" ? "success" : img.status === "Deprecated" ? "warning" : "neutral"}>{img.status}</Badge>
                    {img.access?.map(a => <Badge key={a} color="neutral">{a}</Badge>)}
                  </div>
                  <div style={{ fontSize: 11, color: GRAY_60, fontFamily: "Roboto Mono, monospace", marginBottom: 4 }}>{img.path}</div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 8, lineHeight: 1.5 }}>{img.desc}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: GRAY_60, flexWrap: "wrap" as const, marginBottom: 8 }}>
                    <span>권장 GPU: <strong style={{ color: GRAY_90 }}>{img.recGpu}</strong></span>
                    <span>임시: <strong style={{ color: GRAY_90 }}>{img.recTmp}GB</strong></span>
                    <span>로컬: <strong style={{ color: GRAY_90 }}>{img.recLocal}GB</strong></span>
                    {img.ports && <span>포트: <strong style={{ color: GRAY_90 }}>{img.ports}</strong></span>}
                    <span>사용 횟수: <strong style={{ color: PRIMARY }}>{img.used.toLocaleString()}</strong></span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                    {img.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, backgroundColor: GRAY_5, color: GRAY_70, border: `1px solid ${GRAY_30}` }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <PrimaryBtn size="xsmall" variant="secondary" onClick={() => { setImgForm({ name: img.name, path: img.path, desc: img.desc, tier: img.tier, category: img.category, status: img.status, isDeprecated: img.isDeprecated, thumb: img.thumb, recGpu: img.recGpu, recTmp: img.recTmp, recLocal: img.recLocal, tags: img.tags, packages: img.packages, access: img.access || [], ports: img.ports || "", envKeys: img.envKeys || "" }); setEditingImageId(img.id); setView("edit-image"); }}><Edit size={12} /> 편집</PrimaryBtn>
                  <PrimaryBtn size="xsmall" variant="danger" onClick={() => setImages(images.filter(x => x.id !== img.id))}><Trash2 size={12} /></PrimaryBtn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── 카테고리 ── */}
      {tab === "카테고리" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {categories.map(cat => (
            <Card key={cat.id} style={{ padding: "20px" }}>
              {editingCat === cat.id ? (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, marginBottom: 12 }}>카테고리 편집</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input style={fldStyle} defaultValue={cat.name} placeholder="카테고리 이름" onChange={e => setCatEditForm(f => ({ ...f, name: e.target.value }))} />
                    <input style={fldStyle} defaultValue={cat.desc} placeholder="설명" onChange={e => setCatEditForm(f => ({ ...f, desc: e.target.value }))} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input style={{ ...fldStyle, width: 70 }} defaultValue={cat.icon} placeholder="아이콘" onChange={e => setCatEditForm(f => ({ ...f, icon: e.target.value }))} />
                      <div style={{ display: "flex", gap: 5, flex: 1, alignItems: "center", flexWrap: "wrap" as const }}>
                        {PRESET_COLORS.map(c => (
                          <button key={c} onClick={() => setCatEditForm(f => ({ ...f, color: c }))} style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: c, border: catEditForm.color === c ? `2px solid ${GRAY_90}` : `2px solid transparent`, cursor: "pointer" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <PrimaryBtn size="xsmall" onClick={() => { setCategories(cats => cats.map(c => c.id === cat.id ? { ...c, ...catEditForm } : c)); setEditingCat(null); }}>저장</PrimaryBtn>
                    <PrimaryBtn size="xsmall" variant="ghost" onClick={() => setEditingCat(null)}>취소</PrimaryBtn>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: `${cat.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{cat.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90 }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: GRAY_60 }}>이미지 {cat.imgCnt}개</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setCatEditForm({ name: cat.name, desc: cat.desc, icon: cat.icon, color: cat.color }); setEditingCat(cat.id); }} style={{ fontSize: 11, color: PRIMARY, background: PRIMARY_10, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>편집</button>
                      <button onClick={() => setCategories(cats => cats.filter(c => c.id !== cat.id))} style={{ fontSize: 11, color: RED, background: "rgb(254,242,242)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>삭제</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: GRAY_70, marginBottom: 12 }}>{cat.desc}</div>
                  <div style={{ height: 4, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (cat.imgCnt / 5) * 100)}%`, backgroundColor: cat.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 10, color: GRAY_60, marginTop: 4 }}>이미지 등록 수 기준</div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── Server Templates ── */}
      {tab === "Server Templates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {templates.map(t => (
            <Card key={t.id} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Layers size={22} color={PRIMARY} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t.name}</span>
                    <Badge color={t.status === "Public" ? "success" : "neutral"}>{t.status}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 8 }}>{t.desc}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "4px 16px", fontSize: 12, color: GRAY_60 }}>
                    <span>이미지: <strong style={{ color: GRAY_90 }}>{t.image}</strong></span>
                    <span>권장 vRAM: <strong style={{ color: GRAY_90 }}>{t.recVram}</strong></span>
                    <span>임시 스토리지: <strong style={{ color: GRAY_90 }}>{t.tmp}GB</strong></span>
                    {t.hasLocal && <span>로컬 스토리지: <strong style={{ color: GRAY_90 }}>{t.local}GB</strong></span>}
                    {t.hasShared && <span>공유 스토리지: <strong style={{ color: BLUE }}>{t.shared}</strong></span>}
                    <span>사용 횟수: <strong style={{ color: PRIMARY }}>{t.used.toLocaleString()}</strong></span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <PrimaryBtn size="xsmall" variant="secondary" onClick={() => { setTplForm({ name: t.name, desc: t.desc, image: t.image, recVram: t.recVram, tmp: t.tmp, hasLocal: t.hasLocal, local: t.local, hasShared: t.hasShared, shared: t.shared, envVars: t.envVars, status: t.status }); setEditingTemplateId(t.id); setView("edit-template"); }}><Edit size={12} /> 편집</PrimaryBtn>
                  <PrimaryBtn size="xsmall" variant="danger" onClick={() => setTemplates(ts => ts.filter(x => x.id !== t.id))}><Trash2 size={12} /></PrimaryBtn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </PageContainer>
  );
}

// ─── Credit Management ────────────────────────────────────────────────────────
export function AdminCreditManagement({ initialTab = "크레딧 지급/회수" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const ledger = [
    { date: "2026-07-08", workspace: "My Workspace", owner: "박선욱", type: "지급", amount: "+10,000 cr", reason: "서비스 장애 보상" },
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
                  <option>My Workspace (박선욱)</option>
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
                <span style={{ fontWeight: 700, color: l.type === "지급" ? GREEN : RED, fontFamily: "Roboto Mono, monospace" }}>{l.amount}</span>,
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
                <span style={{ fontFamily: "Roboto Mono, monospace" }}>{p.credits.toLocaleString()} cr</span>,
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
export function AdminStorageManagement({ initialTab = "All Storages" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const storages = [
    { name: "pytorch-dev-01-local", type: "Local", workspace: "My Workspace", owner: "박선욱", capacity: 10, used: 6.8, status: "Normal" },
    { name: "llm-finetuning-local", type: "Local", workspace: "Team Alpha", owner: "이지현", capacity: 100, used: 67.3, status: "Normal" },
    { name: "team-shared-01", type: "Shared", workspace: "My Workspace", owner: "박선욱", capacity: 500, used: 287, status: "Normal" },
    { name: "dataset-archive", type: "Shared", workspace: "Team Alpha", owner: "이지현", capacity: 1000, used: 435, status: "Normal" },
    { name: "pytorch-dev-01-temp", type: "Temporary", workspace: "My Workspace", owner: "박선욱", capacity: 20, used: 14.2, status: "Healthy" },
  ];
  return (
    <PageContainer title="Storage Management" subtitle="전체 스토리지 목록을 조회하고 관리합니다.">
      <TabBar tabs={["All Storages", "Pricing Policy"]} active={tab} onChange={setTab} />
      {tab === "All Storages" && (
        <Card style={{ overflow: "hidden" }}>
          <Table headers={["이름", "유형", "워크스페이스", "소유자", "용량", "사용량", "상태", "액션"]}
            rows={storages.map(s => [
              <span style={{ fontFamily: "Roboto Mono, monospace", fontSize: 12, fontWeight: 500 }}>{s.name}</span>,
              <Badge color={s.type === "Local" ? "primary" : s.type === "Shared" ? "success" : "info"}>{s.type}</Badge>,
              <span style={{ fontSize: 12 }}>{s.workspace}</span>,
              <span style={{ fontSize: 12, color: GRAY_60 }}>{s.owner}</span>,
              <span style={{ fontSize: 12 }}>{s.capacity} GB</span>,
              <span style={{ fontSize: 12 }}>{s.used} GB ({Math.round(s.used / s.capacity * 100)}%)</span>,
              <Badge color={s.status === "Normal" || s.status === "Healthy" ? "success" : "danger"}>{s.status}</Badge>,
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ fontSize: 11, color: PRIMARY, background: PRIMARY_10, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>상세</button>
                {s.type !== "Temporary" && <button style={{ fontSize: 11, color: RED, background: "rgb(254,242,242)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>삭제</button>}
              </div>,
            ])}
          />
        </Card>
      )}
      {tab === "Pricing Policy" && <StoragePricingPolicy />}
    </PageContainer>
  );
}

// ─── Payment History ──────────────────────────────────────────────────────────
export function AdminPaymentHistory({ initialTab = "결제 내역" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const payments = [
    { date: "2026-07-08 14:22", workspace: "Team Alpha", owner: "이지현", product: "프로 패키지 (100,000 cr)", amount: "900,000원", status: "성공" },
    { date: "2026-07-08 11:05", workspace: "My Workspace", owner: "박선욱", product: "스타터 패키지 (50,000 cr)", amount: "480,000원", status: "성공" },
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
              <span style={{ fontSize: 12, color: GRAY_60, fontFamily: "Roboto Mono, monospace" }}>{p.date}</span>,
              <span>{p.workspace}</span>,
              <span style={{ fontSize: 12, color: GRAY_60 }}>{p.owner}</span>,
              <span style={{ fontSize: 12 }}>{p.product}</span>,
              <span style={{ fontWeight: 600, fontFamily: "Roboto Mono, monospace" }}>{p.amount}</span>,
              <Badge color={p.status === "성공" ? "success" : p.status === "실패" ? "danger" : "warning"}>{p.status}</Badge>,
            ])}
          />
        </Card>
      )}
      {tab === "환불 관리" && (
        <Card style={{ overflow: "hidden" }}>
          <Table headers={["신청일", "워크스페이스", "Owner", "환불금액", "사유", "상태", "액션"]}
            rows={refunds.map(r => [
              <span style={{ fontSize: 12, color: GRAY_60, fontFamily: "Roboto Mono, monospace" }}>{r.date}</span>,
              <span>{r.workspace}</span>,
              <span style={{ fontSize: 12, color: GRAY_60 }}>{r.owner}</span>,
              <span style={{ fontWeight: 600, fontFamily: "Roboto Mono, monospace" }}>{r.amount}</span>,
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
export function AdminNotificationManagement({ initialTab = "알림 템플릿" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const templates = [
    { id: "NOTI_001", name: "서버 생성 완료", trigger: "서버 상태 → Running", channel: "이메일", enabled: true },
    { id: "NOTI_002", name: "서버 강제 종료", trigger: "어드민 강제 종료", channel: "이메일", enabled: true },
    { id: "NOTI_003", name: "크레딧 잔액 부족", trigger: "잔액 < 임계치", channel: "이메일 + 인앱", enabled: true },
    { id: "NOTI_004", name: "결제 실패", trigger: "결제 실패 이벤트", channel: "이메일", enabled: true },
    { id: "NOTI_005", name: "워크스페이스 Owner 변경", trigger: "Owner 변경 완료", channel: "이메일", enabled: false },
  ];
  const thresholds = [
    { name: "크레딧 잔액 경고", value: 10000, unit: "cr" },
    { name: "크레딧 잔액 위험", value: 3000, unit: "cr" },
    { name: "스토리지 사용률 경고", value: 80, unit: "%" },
    { name: "스토리지 사용률 위험", value: 95, unit: "%" },
  ];
  return (
    <PageContainer title="Notification Management" subtitle="알림 템플릿·임계치·이메일 발신 설정을 관리합니다.">
      <TabBar tabs={["알림 템플릿", "임계치 설정", "이메일 발신 설정"]} active={tab} onChange={setTab} />
      {tab === "알림 템플릿" && (
        <Card style={{ overflow: "hidden" }}>
          <Table headers={["템플릿 ID", "알림명", "트리거 조건", "채널", "활성화", "액션"]}
            rows={templates.map(t => [
              <span style={{ fontFamily: "Roboto Mono, monospace", fontSize: 12, color: GRAY_60 }}>{t.id}</span>,
              <span style={{ fontWeight: 600 }}>{t.name}</span>,
              <span style={{ fontSize: 12, color: GRAY_70 }}>{t.trigger}</span>,
              <Badge color="neutral">{t.channel}</Badge>,
              <div style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: t.enabled ? PRIMARY : GRAY_30, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 3, left: t.enabled ? 21 : 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s" }} />
              </div>,
              <button style={{ fontSize: 11, color: PRIMARY, background: PRIMARY_10, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>편집</button>,
            ])}
          />
        </Card>
      )}
      {tab === "임계치 설정" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {thresholds.map((t, i) => (
            <Card key={i} style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>{t.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="number" defaultValue={t.value} style={{ width: 90, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 14, textAlign: "center" }} />
                <span style={{ fontSize: 14, color: GRAY_60 }}>{t.unit}</span>
                <PrimaryBtn size="xsmall">저장</PrimaryBtn>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab === "이메일 발신 설정" && (
        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 16 }}>SMTP 설정</div>
          {[
            { label: "발신자 이름", value: "NeuroStack GPUaaS" },
            { label: "발신 이메일", value: "noreply@neurostack.sdt.inc" },
            { label: "SMTP Host", value: "smtp.sdt.inc" },
            { label: "SMTP Port", value: "587" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid rgb(242,242,242)` }}>
              <div style={{ fontSize: 13, color: GRAY_60, width: 140 }}>{label}</div>
              <input type="text" defaultValue={value} style={{ flex: 1, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13 }} />
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <PrimaryBtn size="small" variant="secondary">발송 테스트</PrimaryBtn>
            <PrimaryBtn size="small">설정 저장</PrimaryBtn>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}

// ─── System Settings ──────────────────────────────────────────────────────────
export function AdminSystemSettings() {
  return (
    <PageContainer title="System Settings" subtitle="회원가입·로그인·약관 등 시스템 설정을 관리합니다.">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 16 }}>Auth Settings</div>
          {[
            { label: "이메일 인증 회원가입", enabled: true },
            { label: "이메일/비밀번호 로그인", enabled: true },
            { label: "Google 소셜 로그인", enabled: false },
            { label: "GitHub 소셜 로그인", enabled: false },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid rgb(242,242,242)` }}>
              <span style={{ fontSize: 14, color: GRAY_90 }}>{s.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge color={s.enabled ? "success" : "neutral"}>{s.enabled ? "활성" : "비활성"}</Badge>
                <PrimaryBtn size="xsmall" variant="secondary">{s.enabled ? "비활성화" : "활성화"}</PrimaryBtn>
              </div>
            </div>
          ))}
        </Card>
        <Card style={{ padding: "24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 16 }}>Internal Storage Integration</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>API Endpoint</div>
              <input type="text" defaultValue="https://internal-storage.sdt.inc/api/v1" style={{ width: "100%", height: 40, padding: "0 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <div>
                <div style={{ fontSize: 14, color: GRAY_90, fontWeight: 500 }}>자동 스캔 연동</div>
                <div style={{ fontSize: 12, color: GRAY_60 }}>내부 저장소에서 이미지 자동 감지·등록</div>
              </div>
              <Badge color="neutral">비활성 (미확정)</Badge>
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <PrimaryBtn size="small">설정 저장</PrimaryBtn>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

// ─── Storage Pricing Policy (inline edit) ─────────────────────────────────────
function StoragePricingPolicy() {
  type PolicyRow = { id: string; type: string; color: string; ratePerGB: string; unit: string; note: string; billingStop: string };
  const [policies, setPolicies] = useState<PolicyRow[]>([
    { id: "tmp", type: "임시 스토리지 (Temporary Storage)", color: BLUE, ratePerGB: "0.05", unit: "시간 (h)", note: "서버 중지 시 자동 과금 중단", billingStop: "중지 시" },
    { id: "local", type: "로컬 스토리지 (Local Storage)", color: PRIMARY, ratePerGB: "0.10", unit: "시간 (h)", note: "서버 정지 중에도 과금 지속", billingStop: "항상" },
    { id: "shared", type: "공유 스토리지 (Shared Storage)", color: GREEN, ratePerGB: "0.15", unit: "시간 (h)", note: "정지 중에도 과금 지속 · 프리미엄 배율 적용", billingStop: "항상" },
  ]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<PolicyRow | null>(null);

  const startEdit = (p: PolicyRow) => { setDraft({ ...p }); setEditing(p.id); };
  const cancelEdit = () => { setEditing(null); setDraft(null); };
  const saveEdit = () => {
    if (draft) setPolicies(ps => ps.map(p => p.id === draft.id ? draft : p));
    cancelEdit();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Info banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "rgb(218,235,255)", borderRadius: 10 }}>
        <AlertTriangle size={14} color={BLUE} />
        <span style={{ fontSize: 13, color: GRAY_90 }}>가격 정책 변경은 즉시 적용됩니다. 변경 전 충분히 검토하세요.</span>
      </div>

      {policies.map(p => (
        <Card key={p.id} style={{ padding: "20px 24px" }}>
          {editing === p.id && draft ? (
            /* Inline edit mode */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: p.color }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: GRAY_90 }}>{p.type}</span>
                <Badge color="warning">편집 중</Badge>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>단가 (cr/GB)</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="number" step="0.01" min="0" value={draft.ratePerGB} onChange={e => setDraft(d => d ? { ...d, ratePerGB: e.target.value } : d)}
                      style={{ width: 90, height: 36, padding: "0 10px", borderRadius: 8, border: `2px solid ${PRIMARY}`, fontSize: 15, fontWeight: 700, fontFamily: "Roboto Mono, monospace", textAlign: "right", outline: "none" }} />
                    <span style={{ fontSize: 12, color: GRAY_60 }}>cr/GB</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>과금 단위</div>
                  <select value={draft.unit} onChange={e => setDraft(d => d ? { ...d, unit: e.target.value } : d)}
                    style={{ height: 36, padding: "0 10px", borderRadius: 8, border: `2px solid ${PRIMARY}`, fontSize: 13, outline: "none", cursor: "pointer" }}>
                    <option>시간 (h)</option><option>분 (m)</option><option>일 (d)</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>과금 중단 조건</div>
                  <select value={draft.billingStop} onChange={e => setDraft(d => d ? { ...d, billingStop: e.target.value } : d)}
                    style={{ height: 36, padding: "0 10px", borderRadius: 8, border: `2px solid ${PRIMARY}`, fontSize: 13, outline: "none", cursor: "pointer" }}>
                    <option>중지 시</option><option>항상</option><option>삭제 시</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>비고 / 안내 문구</div>
                <input value={draft.note} onChange={e => setDraft(d => d ? { ...d, note: e.target.value } : d)}
                  style={{ width: "100%", height: 36, padding: "0 11px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              {/* 시간당·월간 환산 preview */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "시간당 100GB", val: (parseFloat(draft.ratePerGB) * 100).toFixed(2) },
                  { label: "일당 100GB", val: (parseFloat(draft.ratePerGB) * 100 * 24).toFixed(1) },
                  { label: "월간 100GB", val: (parseFloat(draft.ratePerGB) * 100 * 24 * 30).toFixed(0) },
                ].map(({ label, val }) => (
                  <div key={label} style={{ flex: 1, padding: "10px 14px", backgroundColor: GRAY_5, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, fontFamily: "Roboto Mono, monospace" }}>{val} cr</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <PrimaryBtn size="small" onClick={saveEdit}>저장</PrimaryBtn>
                <PrimaryBtn size="small" variant="ghost" onClick={cancelEdit}>취소</PrimaryBtn>
              </div>
            </div>
          ) : (
            /* Display mode */
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: p.color }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: GRAY_90 }}>{p.type}</span>
                </div>
                <div style={{ fontSize: 12, color: YELLOW, marginBottom: 10 }}>{p.note}</div>
                <div style={{ display: "flex", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 2 }}>단가</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: p.color, fontFamily: "Roboto Mono, monospace" }}>{p.ratePerGB} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>cr/GB/{p.unit === "시간 (h)" ? "h" : p.unit}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 2 }}>과금 중단</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: GRAY_90 }}>{p.billingStop}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 2 }}>월간 100GB 환산</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: GRAY_90, fontFamily: "Roboto Mono, monospace" }}>{(parseFloat(p.ratePerGB) * 100 * 24 * 30).toFixed(0)} cr</div>
                  </div>
                </div>
              </div>
              <PrimaryBtn size="xsmall" variant="secondary" onClick={() => startEdit(p)}><Edit size={12} /> 편집</PrimaryBtn>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── GPU Type Pricing ─────────────────────────────────────────────────────────
export function AdminGPUPricing() {
  type GpuPrice = { id: string; name: string; vram: string; rate: string; unit: "min" | "h" | "day"; enabled: boolean };

  function toHourly(rate: string, unit: "min" | "h" | "day"): number {
    const r = parseFloat(rate);
    if (unit === "min") return r * 60;
    if (unit === "day") return r / 24;
    return r;
  }

  const [prices, setPrices] = useState<GpuPrice[]>([
    { id: "h100", name: "H100 SXM5", vram: "80GB", rate: "210.00", unit: "h" as const, enabled: true },
    { id: "a100", name: "A100 SXM4", vram: "80GB", rate: "120.00", unit: "h" as const, enabled: true },
    { id: "a5000", name: "RTX A5000", vram: "24GB", rate: "48.00", unit: "h" as const, enabled: true },
    { id: "r4090", name: "RTX 4090", vram: "24GB", rate: "42.00", unit: "h" as const, enabled: false },
  ]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<GpuPrice | null>(null);

  const startEdit = (p: GpuPrice) => { setEditing(p.id); setDraft({ ...p }); };
  const cancelEdit = () => { setEditing(null); setDraft(null); };
  const saveEdit = () => {
    if (draft) setPrices(ps => ps.map(p => p.id === draft.id ? draft : p));
    cancelEdit();
  };

  const unitOptions: { value: "min" | "h" | "day"; label: string }[] = [
    { value: "min", label: "분 (min)" },
    { value: "h", label: "시 (h)" },
    { value: "day", label: "일 (day)" },
  ];

  function getConversionBoxes(rate: string, unit: "min" | "h" | "day") {
    const r = parseFloat(rate) || 0;
    let perMin: number, perHour: number, perDay: number;
    if (unit === "min") {
      perMin = r;
      perHour = r * 60;
      perDay = r * 1440;
    } else if (unit === "h") {
      perMin = r / 60;
      perHour = r;
      perDay = r * 24;
    } else {
      perMin = r / 1440;
      perHour = r / 24;
      perDay = r;
    }
    return [
      { label: "분당", val: perMin.toFixed(4), unit: "cr/GPU/min" },
      { label: "시간당", val: perHour.toFixed(2), unit: "cr/GPU/h" },
      { label: "일당", val: perDay.toFixed(2), unit: "cr/GPU/day" },
    ];
  }

  function getConversionPreviewText(rate: string, unit: "min" | "h" | "day"): string {
    const r = parseFloat(rate) || 0;
    if (unit === "min") {
      return `× 60 = ${(r * 60).toFixed(2)} cr/h,  × 1440 = ${(r * 1440).toFixed(2)} cr/day`;
    } else if (unit === "h") {
      return `× 24 = ${(r * 24).toFixed(2)} cr/day,  × 720 = ${(r * 720).toFixed(0)} cr/month`;
    } else {
      return `÷ 24 = ${(r / 24).toFixed(4)} cr/h`;
    }
  }

  return (
    <PageContainer title="GPU Type Pricing" subtitle="GPU 유형별 과금 단가를 설정합니다. 변경 사항은 저장 즉시 반영됩니다.">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "rgb(218,235,255)", borderRadius: 10, marginBottom: 16 }}>
        <AlertTriangle size={14} color={BLUE} />
        <span style={{ fontSize: 13, color: GRAY_90 }}>단가 변경은 <strong>신규 서버 생성 시점</strong>부터 적용됩니다. 기존 실행 서버는 다음 결제 주기부터 적용됩니다.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {prices.map(p => {
          const ratePerHour = toHourly(p.rate, p.unit);
          return (
            <Card key={p.id} style={{ padding: "20px 24px" }}>
              {editing === p.id && draft ? (
                /* Edit mode */
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{draft.name}</span>
                    <Badge color="neutral">VRAM {draft.vram}</Badge>
                    <Badge color="warning">편집 중</Badge>
                  </div>

                  {/* Enabled toggle */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 6 }}>판매 상태</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => setDraft(d => d ? { ...d, enabled: !d.enabled } : d)}
                        style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: draft.enabled ? GREEN : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                      >
                        <span style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: draft.enabled ? 21 : 3 }} />
                      </button>
                      <span style={{ fontSize: 13, color: draft.enabled ? GREEN : GRAY_40, fontWeight: 500 }}>{draft.enabled ? "판매중" : "판매중지"}</span>
                    </div>
                  </div>

                  {/* Billing unit selector */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 8 }}>과금 단위</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {unitOptions.map(opt => {
                        const selected = draft.unit === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setDraft(d => d ? { ...d, unit: opt.value } : d)}
                            style={{
                              padding: "6px 18px",
                              borderRadius: 8,
                              border: selected ? `2px solid ${PRIMARY}` : `2px solid ${GRAY_30}`,
                              backgroundColor: selected ? PRIMARY_10 : "white",
                              color: selected ? PRIMARY : GRAY_70,
                              fontWeight: selected ? 700 : 500,
                              fontSize: 13,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rate input */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 6 }}>
                      단가 (cr/GPU/{draft.unit === "min" ? "min" : draft.unit === "h" ? "h" : "day"})
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={draft.rate}
                        onChange={e => setDraft(d => d ? { ...d, rate: e.target.value } : d)}
                        style={{ width: 160, height: 40, padding: "0 12px", borderRadius: 8, border: `2px solid ${PRIMARY}`, fontSize: 18, fontWeight: 700, fontFamily: "Roboto Mono, monospace", textAlign: "right", outline: "none" }}
                      />
                      <span style={{ fontSize: 13, color: GRAY_60 }}>
                        cr/GPU/{draft.unit === "min" ? "min" : draft.unit === "h" ? "h" : "day"}
                      </span>
                    </div>
                  </div>

                  {/* Auto-conversion preview boxes */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    {getConversionBoxes(draft.rate, draft.unit).map(({ label, val, unit: boxUnit }) => (
                      <div key={label} style={{ flex: 1, padding: "10px 14px", backgroundColor: GRAY_5, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, fontFamily: "Roboto Mono, monospace" }}>
                          {val} <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>{boxUnit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <PrimaryBtn size="small" onClick={saveEdit}>저장</PrimaryBtn>
                    <PrimaryBtn size="small" variant="ghost" onClick={cancelEdit}>취소</PrimaryBtn>
                  </div>
                </div>
              ) : (
                /* Display mode */
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", opacity: p.enabled ? 1 : 0.65 }}>
                  <div>
                    {/* GPU name + badges + enabled status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{p.name}</span>
                      <Badge color="neutral">VRAM {p.vram}</Badge>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, backgroundColor: p.enabled ? "rgb(240,253,244)" : GRAY_5, color: p.enabled ? GREEN : GRAY_40, fontWeight: 600 }}>
                        {p.enabled ? "판매중" : "판매중지"}
                      </span>
                    </div>

                    {/* Prominent hourly rate */}
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 2 }}>시간당 환산</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, fontFamily: "Roboto Mono, monospace" }}>
                        {ratePerHour.toFixed(2)} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>cr/GPU/h</span>
                      </div>
                    </div>

                    {/* Conversion preview */}
                    <div style={{ fontSize: 11, color: GRAY_60, fontFamily: "Roboto Mono, monospace" }}>
                      {getConversionPreviewText(p.rate, p.unit)}
                    </div>
                  </div>

                  {/* Edit button */}
                  <PrimaryBtn size="xsmall" variant="secondary" onClick={() => startEdit(p)}><Edit size={12} /> 편집</PrimaryBtn>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary table — single hourly row */}
      <Card style={{ marginTop: 20, padding: "20px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: GRAY_90, marginBottom: 14 }}>단가 비교표 (시간당 환산)</div>
        <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${prices.length}, 1fr)`, gap: 0 }}>
          <div style={{ fontSize: 11, color: GRAY_60, padding: "0 0 10px" }} />
          {prices.map(p => (
            <div key={p.id} style={{ fontSize: 12, fontWeight: 600, color: GRAY_90, padding: "0 12px 10px", textAlign: "center" }}>
              {p.name.split(" ")[0]}<br /><span style={{ fontSize: 10, fontWeight: 400, color: GRAY_60 }}>{p.name.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: GRAY_70, padding: "9px 0", borderTop: `1px solid ${GRAY_5}` }}>시간당</div>
          {prices.map(p => (
            <div key={p.id} style={{ fontSize: 13, fontWeight: 600, color: PRIMARY, fontFamily: "Roboto Mono, monospace", padding: "9px 12px", borderTop: `1px solid ${GRAY_5}`, textAlign: "center" }}>
              {toHourly(p.rate, p.unit).toFixed(2)} cr
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}

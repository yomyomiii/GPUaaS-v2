import { useState, useEffect } from "react";
import {
  Plus, Crown, Shield, User, CreditCard, AlertTriangle, Mail, Smartphone,
  Server, Zap, TrendingUp, Activity, Bell, ChevronRight, MoreHorizontal, Clock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  PRIMARY, PRIMARY_10, GRAY_5, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90, RED, GREEN, BLUE, YELLOW,
  Badge, Card, PrimaryBtn, Table, PageContainer, TabBar,
} from "./ConsoleLayout";

// ─── Mock data ────────────────────────────────────────────────────────────────
const members = [
  { name: "박선욱", email: "sunwook.park@sdt.inc", role: "workspace.owner", avatar: "박", joined: "2026-01-15", online: true, servers: 2, usedCr: 5200 },
  { name: "이지현", email: "jihyun.lee@sdt.inc", role: "workspace.admin", avatar: "이", joined: "2026-02-20", online: true, servers: 1, usedCr: 3100 },
  { name: "김태민", email: "taemin.kim@sdt.inc", role: "workspace.user", avatar: "김", joined: "2026-03-10", online: false, servers: 0, usedCr: 1800 },
  { name: "최유진", email: "yujin.choi@sdt.inc", role: "workspace.user", avatar: "최", joined: "2026-04-05", online: true, servers: 1, usedCr: 1620 },
  { name: "장민준", email: "minjun.jang@sdt.inc", role: "workspace.user", avatar: "장", joined: "2026-05-22", online: false, servers: 0, usedCr: 730 },
];

const paymentHistory = [
  { date: "2026-07-05", desc: "크레딧 50,000 구매", amount: "500,000원", credits: "+50,000 cr", status: "완료" },
  { date: "2026-06-28", desc: "크레딧 20,000 구매", amount: "200,000원", credits: "+20,000 cr", status: "완료" },
  { date: "2026-06-15", desc: "크레딧 10,000 구매", amount: "100,000원", credits: "+10,000 cr", status: "완료" },
];

const usageHistory = [
  { date: "2026-07-08", desc: "pytorch-dev-01 서버 실행", credits: "-240 cr", type: "서버" },
  { date: "2026-07-08", desc: "llm-finetuning 서버 실행", credits: "-576 cr", type: "서버" },
  { date: "2026-07-07", desc: "stable-diffusion 서버 실행", credits: "-120 cr", type: "서버" },
  { date: "2026-07-07", desc: "local-storage-01 유지비", credits: "-48 cr", type: "스토리지" },
  { date: "2026-07-06", desc: "shared-storage-team 유지비", credits: "-96 cr", type: "스토리지" },
];

const notifications = [
  { time: "2026-07-08 14:32", type: "서버", msg: "llm-finetuning 서버가 Running 상태로 전환되었습니다.", read: false },
  { time: "2026-07-08 10:15", type: "크레딧", msg: "크레딧 잔액이 50,000cr 미만입니다. 현재 잔액: 45,230cr", read: false },
  { time: "2026-07-07 22:41", type: "서버", msg: "stable-diffusion 서버가 Stopped 상태로 전환되었습니다.", read: true },
  { time: "2026-07-07 16:00", type: "멤버", msg: "장민준 님이 워크스페이스에 참여했습니다.", read: true },
  { time: "2026-07-06 09:30", type: "결제", msg: "크레딧 20,000cr 구매가 완료되었습니다.", read: true },
];

const creditTrend = [
  { day: "7/2", cr: 58000 }, { day: "7/3", cr: 55400 }, { day: "7/4", cr: 52100 },
  { day: "7/5", cr: 57200 }, { day: "7/6", cr: 53800 }, { day: "7/7", cr: 49300 },
  { day: "7/8", cr: 45230 },
];

const CREDIT_MAX = 60000;
const CREDIT_NOW = 45230;
const CREDIT_PCT = Math.round((CREDIT_NOW / CREDIT_MAX) * 100);

const roleColor: Record<string, "primary" | "warning" | "neutral"> = {
  "workspace.owner": "primary",
  "workspace.admin": "warning",
  "workspace.user": "neutral",
};

function roleLabel(role: string) {
  if (role === "workspace.owner") return "Owner";
  if (role === "workspace.admin") return "Admin";
  return "User";
}

const roleIcon = (role: string) => {
  if (role === "workspace.owner") return <Crown size={12} />;
  if (role === "workspace.admin") return <Shield size={12} />;
  return <User size={12} />;
};

// ─── Ring gauge ───────────────────────────────────────────────────────────────
function CreditRing({ pct }: { pct: number }) {
  const size = 130;
  const r = 50;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct < 20 ? RED : pct < 40 ? YELLOW : PRIMARY;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={GRAY_5} strokeWidth={14} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={14}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.5s" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</div>
        <div style={{ fontSize: 10, color: GRAY_60, marginTop: 2 }}>잔액</div>
      </div>
    </div>
  );
}

// ─── Activity item ────────────────────────────────────────────────────────────
function ActivityItem({ icon, title, sub, time, color }: { icon: React.ReactNode; title: string; sub: string; time: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0" }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: 11, color: GRAY_60 }}>{sub}</div>
      </div>
      <span style={{ fontSize: 11, color: GRAY_60, flexShrink: 0 }}>{time}</span>
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ m, isOwner }: { m: typeof members[0]; isOwner: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const usagePct = Math.round((m.usedCr / 12450) * 100);

  return (
    <Card hover style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            backgroundColor: m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(255,232,186)" : GRAY_5,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700,
            color: m.role === "workspace.owner" ? "white" : m.role === "workspace.admin" ? "rgb(180,80,0)" : GRAY_70,
          }}>{m.avatar}</div>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", backgroundColor: m.online ? GREEN : GRAY_30, border: "2px solid white" }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: GRAY_90 }}>{m.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, backgroundColor: m.role === "workspace.owner" ? PRIMARY_10 : m.role === "workspace.admin" ? "rgb(255,246,230)" : GRAY_5, color: m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(180,80,0)" : GRAY_60, fontSize: 11, fontWeight: 600 }}>
              {roleIcon(m.role)} {roleLabel(m.role)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 10 }}>{m.email}</div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_70 }}>
              <Server size={11} color={m.servers > 0 ? GREEN : GRAY_40} />
              서버 <strong style={{ color: m.servers > 0 ? GREEN : GRAY_60 }}>{m.servers}개</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_70 }}>
              <Zap size={11} color={PRIMARY} />
              이달 <strong style={{ color: PRIMARY }}>{m.usedCr.toLocaleString()} cr</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: GRAY_60 }}>
              <Clock size={11} /> {m.joined}
            </div>
          </div>

          {/* Usage bar */}
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 4, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${usagePct}%`, backgroundColor: PRIMARY, borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 10, color: GRAY_60, marginTop: 3 }}>이달 팀 사용량 기여도 {usagePct}%</div>
          </div>
        </div>

        {/* Actions */}
        {!isOwner && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${GRAY_30}`, backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MoreHorizontal size={14} color={GRAY_60} />
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", right: 0, top: 34, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 140 }}>
                {m.role !== "workspace.owner" && m.role !== "workspace.admin" && (
                  <button onClick={() => setMenuOpen(false)} style={{ width: "100%", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, borderBottom: `1px solid ${GRAY_5}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = GRAY_5}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    Admin으로 권한 상향
                  </button>
                )}
                <button onClick={() => setMenuOpen(false)} style={{ width: "100%", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgb(255,242,242)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  멤버 삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Workspace Page ───────────────────────────────────────────────────────────
export function WorkspacePage({ initialTab = "Overview", onTabChange }: { initialTab?: string; onTabChange?: (tab: string) => void }) {
  const [tab, setTab] = useState(initialTab);
  const [notifSettings, setNotifSettings] = useState({ server: true, credit: true, member: false, payment: true });
  const [readAll, setReadAll] = useState(false);
  const [notifs, setNotifs] = useState(notifications);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  const handleTabChange = (t: string) => { setTab(t); onTabChange?.(t); };
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <PageContainer title="Workspace" subtitle="My Workspace — 워크스페이스 현황·멤버·크레딧을 한눈에 관리합니다.">
      <TabBar tabs={["Overview", "Members", "Wallet", "Notifications"]} active={tab} onChange={handleTabChange} />

      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Top row: Credit + Server summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {/* Credit ring card */}
            <Card style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 18 }}>
              <CreditRing pct={CREDIT_PCT} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>크레딧 현황</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: PRIMARY, marginBottom: 2 }}>
                  {CREDIT_NOW.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>cr</span>
                </div>
                <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 12 }}>≈ 452,300원</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: GRAY_60 }}>이달 사용</span>
                    <span style={{ fontWeight: 600, color: GRAY_90 }}>12,450 cr</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: GRAY_60 }}>소비 속도</span>
                    <span style={{ fontWeight: 600, color: PRIMARY }}>120 cr/h</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: GRAY_60 }}>예상 잔여</span>
                    <span style={{ fontWeight: 600, color: GREEN }}>약 377h</span>
                  </div>
                </div>
                <PrimaryBtn size="xsmall" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
                  크레딧 충전
                </PrimaryBtn>
              </div>
            </Card>

            {/* Server status */}
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Server size={15} color={PRIMARY} />
                <span style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>서버 현황</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Running", value: 2, color: GREEN },
                  { label: "Stopped", value: 1, color: GRAY_40 },
                  { label: "Creating", value: 1, color: BLUE },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center", padding: "10px 6px", backgroundColor: GRAY_5, borderRadius: 10 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 2 }}>{value}</div>
                    <div style={{ fontSize: 10, color: GRAY_60 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: GRAY_70, marginBottom: 5 }}>GPU 현재 점유율</div>
              {[
                { name: "pytorch-dev-01", util: 75 },
                { name: "llm-finetuning", util: 93 },
              ].map(s => (
                <div key={s.name} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRAY_60, marginBottom: 3 }}>
                    <span style={{ fontFamily: "Roboto Mono, monospace" }}>{s.name}</span>
                    <span style={{ fontWeight: 600, color: s.util > 90 ? RED : GRAY_90 }}>{s.util}%</span>
                  </div>
                  <div style={{ height: 5, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.util}%`, backgroundColor: s.util > 90 ? RED : PRIMARY, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </Card>

            {/* Workspace info */}
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 14 }}>워크스페이스 정보</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "이름", value: "My Workspace" },
                  { label: "Owner", value: "박선욱" },
                  { label: "플랜", value: "Standard" },
                  { label: "멤버", value: `${members.length}명` },
                  { label: "생성일", value: "2026-01-15" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${GRAY_5}` }}>
                    <span style={{ color: GRAY_60 }}>{label}</span>
                    <span style={{ fontWeight: 600, color: GRAY_90 }}>{value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => handleTabChange("Members")} style={{ display: "flex", alignItems: "center", gap: 4, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontSize: 12, marginTop: 10, fontWeight: 600 }}>
                멤버 관리 <ChevronRight size={12} />
              </button>
            </Card>
          </div>

          {/* Credit trend chart + Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <TrendingUp size={14} color={PRIMARY} />
                <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>크레딧 잔액 추이</span>
              </div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 14 }}>최근 7일</div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={creditTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="crGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={PRIMARY} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} cr`, "잔액"]} />
                  <Area type="monotone" dataKey="cr" stroke={PRIMARY} strokeWidth={2.5} fill="url(#crGrad)" dot={{ fill: PRIMARY, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Activity size={14} color={PRIMARY} />
                <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>최근 활동</span>
              </div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 10 }}>워크스페이스 이벤트 피드</div>
              <div style={{ display: "flex", flexDirection: "column", divideColor: GRAY_5 }}>
                {[
                  { icon: <Server size={14} />, title: "llm-finetuning 서버 시작됨", sub: "박선욱 · Running", time: "14:32", color: GREEN },
                  { icon: <Zap size={14} />, title: "크레딧 50,000 충전 완료", sub: "결제 500,000원", time: "어제", color: PRIMARY },
                  { icon: <User size={14} />, title: "장민준 님 참여", sub: "workspace.user", time: "5/22", color: BLUE },
                  { icon: <Server size={14} />, title: "stable-diffusion 정지됨", sub: "최유진 · Stopped", time: "7/7", color: GRAY_40 },
                ].map((item, i) => (
                  <div key={i} style={{ borderBottom: i < 3 ? `1px solid ${GRAY_5}` : "none" }}>
                    <ActivityItem {...item} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Credit warning */}
          {CREDIT_PCT < 80 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", backgroundColor: "rgb(255,251,235)", borderRadius: 12, border: `1px solid ${YELLOW}40` }}>
              <AlertTriangle size={16} color={YELLOW} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, marginBottom: 2 }}>크레딧 잔액 경고</div>
                <div style={{ fontSize: 12, color: GRAY_70 }}>현재 {CREDIT_PCT}% 잔액 · 현재 소비 속도로 약 15일 후 임계값(20%)에 도달합니다.</div>
              </div>
              <PrimaryBtn size="xsmall">지금 충전</PrimaryBtn>
            </div>
          )}
        </div>
      )}

      {tab === "Members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "전체 멤버", value: members.length, color: GRAY_90 },
              { label: "온라인", value: members.filter(m => m.online).length, color: GREEN },
              { label: "이달 팀 총 사용", value: "12,450 cr", color: PRIMARY },
              { label: "활성 서버", value: members.reduce((s, m) => s + m.servers, 0), color: BLUE },
            ].map(({ label, value, color }) => (
              <Card key={label} style={{ padding: "14px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>{label}</div>
              </Card>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <PrimaryBtn size="small"><Plus size={14} /> 멤버 초대</PrimaryBtn>
          </div>

          {/* Member cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {members.map(m => (
              <MemberCard key={m.email} m={m} isOwner={m.role === "workspace.owner"} />
            ))}
          </div>
        </div>
      )}

      {tab === "Wallet" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Credit cards */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>크레딧 + 포인트 잔액</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: PRIMARY, lineHeight: 1, marginBottom: 4 }}>{CREDIT_NOW.toLocaleString()} cr</div>
                  <div style={{ fontSize: 12, color: GRAY_60 }}>크레딧 44,230 cr + 포인트 1,000 cr</div>
                </div>
                <PrimaryBtn size="small">크레딧 충전</PrimaryBtn>
              </div>

              {/* Progress bar toward depletion */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRAY_60, marginBottom: 5 }}>
                  <span>잔액 {CREDIT_PCT}%</span>
                  <span>최대 {CREDIT_MAX.toLocaleString()} cr 기준</span>
                </div>
                <div style={{ height: 8, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${CREDIT_PCT}%`, backgroundColor: CREDIT_PCT < 20 ? RED : CREDIT_PCT < 40 ? YELLOW : PRIMARY, borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: PRIMARY_10, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <CreditCard size={15} color={PRIMARY} />
                <span style={{ fontSize: 12, color: GRAY_70, fontWeight: 500 }}>등록 카드: **** **** **** 4521 (VISA)</span>
                <span style={{ fontSize: 11, color: GRAY_60, marginLeft: "auto" }}>workspace.owner 전용</span>
              </div>
            </Card>

            <Card style={{ padding: "22px 24px" }}>
              <div style={{ fontSize: 13, color: GRAY_60, marginBottom: 6 }}>이번 달 사용</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: GRAY_90, marginBottom: 2 }}>12,450 cr</div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>≈ 124,500원</div>
              {[
                { label: "서버 사용", amount: 10890, color: PRIMARY },
                { label: "스토리지", amount: 1560, color: BLUE },
              ].map(({ label, amount, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
                  <span style={{ flex: 1, fontSize: 12, color: GRAY_70 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{amount.toLocaleString()} cr</span>
                </div>
              ))}
              <div style={{ height: 6, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                <div style={{ height: "100%", width: `${(10890 / 12450) * 100}%`, backgroundColor: PRIMARY, borderRadius: 3 }} />
              </div>
            </Card>
          </div>

          {/* Payment History */}
          <Card style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid rgb(242,242,242)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>결제 이력</div>
              <Badge color="neutral">workspace.owner / admin만 조회</Badge>
            </div>
            <Table
              headers={["날짜", "내역", "금액", "크레딧", "상태"]}
              rows={paymentHistory.map(p => [
                <span style={{ fontSize: 12, color: GRAY_60 }}>{p.date}</span>,
                <span>{p.desc}</span>,
                <span style={{ fontWeight: 600 }}>{p.amount}</span>,
                <span style={{ color: GREEN, fontWeight: 700, fontFamily: "Roboto Mono, monospace" }}>{p.credits}</span>,
                <Badge color="success">{p.status}</Badge>,
              ])}
            />
          </Card>

          {/* Usage History */}
          <Card style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid rgb(242,242,242)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>크레딧 사용 이력</div>
              <Badge color="info">모든 멤버 조회 가능</Badge>
            </div>
            <Table
              headers={["날짜", "내역", "구분", "차감"]}
              rows={usageHistory.map(u => [
                <span style={{ fontSize: 12, color: GRAY_60 }}>{u.date}</span>,
                <span>{u.desc}</span>,
                <Badge color={u.type === "서버" ? "primary" : "info"}>{u.type}</Badge>,
                <span style={{ color: RED, fontWeight: 700, fontFamily: "Roboto Mono, monospace" }}>{u.credits}</span>,
              ])}
            />
          </Card>
        </div>
      )}

      {tab === "Notifications" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid rgb(242,242,242)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bell size={15} color={PRIMARY} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>알림 센터</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {unreadCount > 0 && <Badge color="danger">{unreadCount} 미읽음</Badge>}
                  <button onClick={() => setNotifs(notifs.map(n => ({ ...n, read: true })))} style={{ fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer" }}>모두 읽음</button>
                </div>
              </div>
              <div>
                {notifs.map((n, i) => (
                  <div key={i} onClick={() => setNotifs(notifs.map((x, j) => j === i ? { ...x, read: true } : x))} style={{
                    padding: "14px 20px", borderBottom: i < notifs.length - 1 ? `1px solid rgb(248,248,248)` : "none",
                    backgroundColor: !n.read ? "rgb(250,249,255)" : "white",
                    display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = GRAY_5}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = !n.read ? "rgb(250,249,255)" : "white"}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: !n.read ? PRIMARY : "transparent", marginTop: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <Badge color={n.type === "서버" ? "primary" : n.type === "크레딧" ? "warning" : n.type === "결제" ? "success" : "neutral"}>{n.type}</Badge>
                        <span style={{ fontSize: 11, color: GRAY_60 }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: !n.read ? GRAY_90 : GRAY_70, lineHeight: 1.5 }}>{n.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>알림 임계값 설정</div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>workspace.owner/admin 전용</div>
              {[
                { label: "크레딧 잔액 경고", sub: "잔액 20% 미만 시", key: "credit" },
                { label: "서버 오류 알림", sub: "Error/OOMKilled 발생 시", key: "server" },
                { label: "결제 실패 알림", sub: "카드 결제 실패 시", key: "payment" },
                { label: "멤버 변동 알림", sub: "초대/삭제 발생 시", key: "member" },
              ].map(item => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid rgb(248,248,248)` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: GRAY_60 }}>{item.sub}</div>
                  </div>
                  <button
                    onClick={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                    style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: notifSettings[item.key as keyof typeof notifSettings] ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s" }}>
                    <span style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: notifSettings[item.key as keyof typeof notifSettings] ? 21 : 3 }} />
                  </button>
                </div>
              ))}
            </Card>

            <Card style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 14 }}>알림 채널</div>
              {[
                { icon: <Smartphone size={14} />, label: "인앱 알림", desc: "콘솔 내 알림 센터", enabled: true },
                { icon: <Mail size={14} />, label: "이메일 알림", desc: "admin@sdt.inc", enabled: true },
              ].map((ch, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i === 0 ? `1px solid ${GRAY_5}` : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>{ch.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>{ch.label}</div>
                    <div style={{ fontSize: 11, color: GRAY_60 }}>{ch.desc}</div>
                  </div>
                  <Badge color={ch.enabled ? "success" : "neutral"}>{ch.enabled ? "ON" : "OFF"}</Badge>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

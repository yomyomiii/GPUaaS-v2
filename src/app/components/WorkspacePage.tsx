import { useState, useEffect } from "react";
import {
  Plus, Crown, Shield, User, CreditCard, Mail, Smartphone,
  Server, Zap, Layers, MoreHorizontal, Clock,
  UserPlus, Settings, Database, Info,
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90, RED, GREEN, BLUE, YELLOW,
  Badge, Card, PrimaryBtn, Table, PageContainer, TabBar, SectionCard, ListCard,
} from "./ConsoleLayout";

// ─── Mock data ────────────────────────────────────────────────────────────────
const members = [
  { name: "지염염", email: "yeomeyeom.ji@sdt.inc", role: "workspace.owner", avatar: "지", joined: "2026-01-15", online: true, usedCr: 5200, activeServers: ["pytorch-dev-01", "llm-finetuning"], localStorages: ["local-vol-01", "pytorch-data"], sharedStorages: ["shared-team-01"] },
  { name: "이지현", email: "jihyun.lee@sdt.inc", role: "workspace.admin", avatar: "이", joined: "2026-02-20", online: true, usedCr: 3100, activeServers: ["stable-diffusion"], localStorages: ["local-vol-02"], sharedStorages: ["shared-team-01"] },
  { name: "김태민", email: "taemin.kim@sdt.inc", role: "workspace.user", avatar: "김", joined: "2026-03-10", online: false, usedCr: 1800, activeServers: [], localStorages: ["local-vol-03"], sharedStorages: [] },
  { name: "최유진", email: "yujin.choi@sdt.inc", role: "workspace.user", avatar: "최", joined: "2026-04-05", online: true, usedCr: 1620, activeServers: ["data-preprocess"], localStorages: [], sharedStorages: ["shared-team-01"] },
  { name: "장민준", email: "minjun.jang@sdt.inc", role: "workspace.user", avatar: "장", joined: "2026-05-22", online: false, usedCr: 730, activeServers: [], localStorages: [], sharedStorages: [] },
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

const CREDIT_MAX = 60000;
const CREDIT_NOW = 45230;
const CREDIT_PCT = Math.round((CREDIT_NOW / CREDIT_MAX) * 100);

const memberHistory = [
  { date: "2026-07-07", name: "장민준", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-05-22", name: "최유진", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-03-10", name: "김태민", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-02-20", name: "이지현", role: "workspace.admin", action: "Admin 권한 승격", tag: "역할변경" as const },
  { date: "2026-01-15", name: "지염염", role: "workspace.owner", action: "워크스페이스 생성", tag: "생성" as const },
];

const SPEND_TOTAL = 12450;
const SPEND_PREV = 11100;

const settingsHistory = [
  { date: "2026-07-01", desc: "크레딧 잔액 경고 알림 활성화", by: "지염염", type: "임계값" },
  { date: "2026-06-20", desc: "이메일 알림 채널 등록", by: "지염염", type: "채널" },
  { date: "2026-05-10", desc: "멤버 변동 알림 비활성화", by: "이지현", type: "임계값" },
  { date: "2026-02-15", desc: "결제 실패 알림 활성화", by: "지염염", type: "임계값" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type AlertKey = "credit" | "gpu_usage" | "gpu_vram" | "storage_temp" | "storage_local" | "storage_shared";
type AlertCfg = {
  enabled: boolean;
  threshold: number;
  channels: { inapp: boolean; email: boolean };
  recipients: { owner: boolean; admin: boolean; user: boolean };
};
type MemberSortField = "name" | "email" | "role" | "servers" | "local" | "shared" | "credits" | "joined" | null;

const alertDefs: { key: AlertKey; label: string; desc: string; hasThreshold: boolean; unit: string }[] = [
  { key: "credit",         label: "Low Credit Balance",    desc: "Sent when the credit balance falls below the configured threshold.",          hasThreshold: true, unit: "% below" },
  { key: "gpu_usage",      label: "High GPU Usage",        desc: "Sent when GPU utilization exceeds the configured threshold.",                hasThreshold: true, unit: "% above" },
  { key: "gpu_vram",       label: "High GPU vRAM Usage",   desc: "Sent when vRAM utilization exceeds the configured threshold.",               hasThreshold: true, unit: "% above" },
  { key: "storage_temp",   label: "Low Temporary Storage", desc: "Sent when temporary storage utilization exceeds the configured threshold.",  hasThreshold: true, unit: "% above" },
  { key: "storage_local",  label: "Low Local Storage",     desc: "Sent when local storage utilization exceeds the configured threshold.",      hasThreshold: true, unit: "% above" },
  { key: "storage_shared", label: "Low Shared Storage",    desc: "Sent when shared storage utilization exceeds the configured threshold.",     hasThreshold: true, unit: "% above" },
];

// ─── InfoTooltip ──────────────────────────────────────────────────────────────
function InfoTooltip({ items, emptyLabel }: { items: string[]; emptyLabel?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", flexShrink: 0, cursor: "default" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={12} color={GRAY_40} />
      {show && (
        <div style={{ position: "absolute", bottom: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)", backgroundColor: GRAY_90, color: "white", fontSize: 11, padding: "7px 11px", borderRadius: 8, zIndex: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", pointerEvents: "none", minWidth: 140 }}>
          {items.length === 0 ? (
            <span style={{ color: "rgba(255,255,255,0.45)" }}>{emptyLabel ?? "없음"}</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>▸</span>
                  <span style={{ fontFamily: "Roboto Mono, monospace", fontSize: 11 }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ m, isOwner }: { m: typeof members[0]; isOwner: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarBg = m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(255,232,186)" : GRAY_5;
  const avatarColor = m.role === "workspace.owner" ? "white" : m.role === "workspace.admin" ? "rgb(180,80,0)" : GRAY_70;
  const roleBg = m.role === "workspace.owner" ? PRIMARY_10 : m.role === "workspace.admin" ? "rgb(255,246,230)" : GRAY_5;
  const roleTextColor = m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(180,80,0)" : GRAY_60;

  return (
    <Card hover style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: avatarColor }}>
            {m.avatar}
          </div>
        </div>

        {/* Name + Role */}
        <div style={{ width: 160, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: GRAY_90 }}>{m.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 999, backgroundColor: roleBg, color: roleTextColor, fontSize: 11, fontWeight: 600 }}>
              {roleIcon(m.role)} {roleLabel(m.role)}
            </div>
          </div>
          <div style={{ fontSize: 11, color: GRAY_60 }}>{m.email}</div>
        </div>

        {/* Stats — 5-col grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8, alignItems: "center" }}>
          {/* 활성 서버 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Server size={11} color={m.activeServers.length > 0 ? GREEN : GRAY_40} />
              <span style={{ fontSize: 13, fontWeight: 700, color: m.activeServers.length > 0 ? GREEN : GRAY_60 }}>{m.activeServers.length}개</span>
              <InfoTooltip items={m.activeServers} emptyLabel="실행 중인 서버 없음" />
            </div>
          </div>
          {/* 활성 로컬 스토리지 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Database size={11} color={m.localStorages.length > 0 ? BLUE : GRAY_40} />
              <span style={{ fontSize: 13, fontWeight: 700, color: m.localStorages.length > 0 ? BLUE : GRAY_60 }}>{m.localStorages.length}개</span>
              <InfoTooltip items={m.localStorages} emptyLabel="할당된 로컬 스토리지 없음" />
            </div>
          </div>
          {/* 활성 공유 스토리지 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Database size={11} color={m.sharedStorages.length > 0 ? GREEN : GRAY_40} />
              <span style={{ fontSize: 13, fontWeight: 700, color: m.sharedStorages.length > 0 ? GREEN : GRAY_60 }}>{m.sharedStorages.length}개</span>
              <InfoTooltip items={m.sharedStorages} emptyLabel="참여 중인 공유 스토리지 없음" />
            </div>
          </div>
          {/* 이달 소비 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Zap size={11} color={PRIMARY} />
              <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{m.usedCr.toLocaleString()} cr</span>
            </div>
          </div>
          {/* 참여일 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Clock size={11} color={GRAY_60} />
              <span style={{ fontSize: 12, fontWeight: 500, color: GRAY_70 }}>{m.joined}</span>
            </div>
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
        {isOwner && <div style={{ width: 28, flexShrink: 0 }} />}
      </div>
    </Card>
  );
}

// ─── Chip Toggle ──────────────────────────────────────────────────────────────
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "2px 10px", borderRadius: 999,
      border: `1px solid ${active ? PRIMARY : GRAY_30}`,
      backgroundColor: active ? PRIMARY_10 : "white",
      color: active ? PRIMARY : GRAY_60,
      fontSize: 11, fontWeight: active ? 600 : 400,
      cursor: "pointer", transition: "all 0.12s",
    }}>{children}</button>
  );
}

// ─── Workspace Page ───────────────────────────────────────────────────────────
export function WorkspacePage({ initialTab = "Overview", onTabChange }: { initialTab?: string; onTabChange?: (tab: string) => void }) {
  const [tab, setTab] = useState(initialTab);

  const [alertConfig, setAlertConfig] = useState<Record<AlertKey, AlertCfg>>({
    credit:         { enabled: true,  threshold: 20, channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: false } },
    gpu_usage:      { enabled: true,  threshold: 80, channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: true  } },
    gpu_vram:       { enabled: true,  threshold: 90, channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: true  } },
    storage_temp:   { enabled: false, threshold: 90, channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: false } },
    storage_local:  { enabled: false, threshold: 90, channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: false } },
    storage_shared: { enabled: false, threshold: 90, channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: false } },
  });

  const [sortField, setSortField] = useState<MemberSortField>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [notifRecipients, setNotifRecipients] = useState({ owner: true, admin: true, user: false });

  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const handleTabChange = (t: string) => { setTab(t); onTabChange?.(t); };

  // ── Alert helpers ──
  const toggleAlert = (key: AlertKey) =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], enabled: !p[key].enabled } }));
  const toggleChannel = (key: AlertKey, ch: "inapp" | "email") =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], channels: { ...p[key].channels, [ch]: !p[key].channels[ch] } } }));
  const toggleRecipient = (key: AlertKey, r: "owner" | "admin" | "user") =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], recipients: { ...p[key].recipients, [r]: !p[key].recipients[r] } } }));
  const setThreshold = (key: AlertKey, v: number) =>
    setAlertConfig(p => ({ ...p, [key]: { ...p[key], threshold: v } }));
  const toggleNotifRecipient = (r: "owner" | "admin" | "user") =>
    setNotifRecipients(p => ({ ...p, [r]: !p[r] }));

  // ── Sort helpers ──
  const handleSort = (field: MemberSortField) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortField(null); setSortDir("asc"); }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };
  const sortIndicator = (field: MemberSortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : " ⇅";

  const roleOrder: Record<string, number> = { "workspace.owner": 0, "workspace.admin": 1, "workspace.user": 2 };
  const sortedMembers = [...members].sort((a, b) => {
    if (!sortField) return 0;
    let va: string | number = 0, vb: string | number = 0;
    if (sortField === "name")    { va = a.name; vb = b.name; }
    else if (sortField === "email")   { va = a.email; vb = b.email; }
    else if (sortField === "role")    { va = roleOrder[a.role] ?? 2; vb = roleOrder[b.role] ?? 2; }
    else if (sortField === "servers") { va = a.activeServers.length; vb = b.activeServers.length; }
    else if (sortField === "local")   { va = a.localStorages.length; vb = b.localStorages.length; }
    else if (sortField === "shared")  { va = a.sharedStorages.length; vb = b.sharedStorages.length; }
    else if (sortField === "credits") { va = a.usedCr; vb = b.usedCr; }
    else if (sortField === "joined")  { va = a.joined; vb = b.joined; }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  // ── Sort button (used in Members header) ──
  const SortBtn = ({ field, label, justify = "center" }: { field: MemberSortField; label: string; justify?: string }) => (
    <button onClick={() => handleSort(field)} style={{
      background: "none", border: "none", cursor: "pointer",
      padding: "2px 5px", borderRadius: 4,
      fontSize: 11,
      color: sortField === field ? PRIMARY : GRAY_60,
      fontWeight: sortField === field ? 700 : 400,
      display: "flex", alignItems: "center", justifyContent: justify, gap: 1,
      whiteSpace: "nowrap",
    }}>
      {label}<span style={{ fontSize: 8, opacity: 0.75 }}>{sortIndicator(field)}</span>
    </button>
  );

  return (
    <PageContainer title="Workspace" subtitle="My Workspace — 워크스페이스 현황·멤버·크레딧을 한눈에 관리합니다.">
      <TabBar tabs={["Overview", `Members (${members.length})`, "Credit", "Settings"]} active={tab === "Members" ? `Members (${members.length})` : tab} onChange={t => handleTabChange(t.replace(/ \(\d+\)$/, ""))} />

      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 워크스페이스 기본 정보 */}
          <Card style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Layers size={22} color={PRIMARY} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: GRAY_90 }}>My Workspace</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
                  {[
                    { label: "Owner", value: "지염염" },
                    { label: "멤버", value: `${members.length}명` },
                    { label: "생성일", value: "2026-01-15" },
                    { label: "크레딧 잔액", value: `${CREDIT_NOW.toLocaleString()} cr` },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} style={{ paddingRight: 20, borderRight: i < arr.length - 1 ? `1px solid ${GRAY_10}` : "none", paddingLeft: i > 0 ? 20 : 0 }}>
                      <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: label === "크레딧 잔액" ? PRIMARY : GRAY_90 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 인사이트 6종 (3×2) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

            {/* [Row 1-1] 크레딧 잔액 및 소비 현황 */}
            <SectionCard title="크레딧 잔액 및 소비 현황" headerStyle={{ minHeight: 52 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 5 }}>현재 잔액</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: PRIMARY, lineHeight: 1 }}>
                    {CREDIT_NOW.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400, color: GRAY_60 }}>cr</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: GRAY_60, marginBottom: 5 }}>
                    <span>잔액 {CREDIT_PCT}%</span>
                    <span>최대 {CREDIT_MAX.toLocaleString()} cr</span>
                  </div>
                  <div style={{ height: 7, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", width: `${CREDIT_PCT}%`, backgroundColor: CREDIT_PCT < 20 ? RED : CREDIT_PCT < 40 ? YELLOW : PRIMARY, borderRadius: 4 }} />
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: "20%", width: 1.5, backgroundColor: RED, opacity: 0.5 }} />
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${GRAY_5}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { label: "이달 소비", value: `${SPEND_TOTAL.toLocaleString()} cr`, note: `전월 대비 +${Math.round((SPEND_TOTAL - SPEND_PREV) / SPEND_PREV * 100)}%`, noteColor: YELLOW },
                    { label: "일 평균", value: `${Math.round(SPEND_TOTAL / 8).toLocaleString()} cr`, note: null, noteColor: "" },
                  ].map(({ label, value, note, noteColor }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                      <span style={{ color: GRAY_60 }}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {note && <span style={{ fontSize: 10, color: noteColor, fontWeight: 600 }}>{note}</span>}
                        <span style={{ fontWeight: 700, color: GRAY_90 }}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* [Row 1-2] 크레딧 런웨이 */}
            <SectionCard title="크레딧 런웨이" headerStyle={{ minHeight: 52 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 5 }}>임계값(20%) 도달까지</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: YELLOW, lineHeight: 1 }}>약 11일</div>
                  <div style={{ fontSize: 11, color: GRAY_60, marginTop: 5 }}>소비 속도 120 cr/h 기준</div>
                </div>
                <div style={{ borderTop: `1px solid ${GRAY_5}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { label: "완전 소진까지", value: "약 16일", color: GRAY_70 },
                    { label: "임계 잔액(20%)", value: `${(CREDIT_MAX * 0.2).toLocaleString()} cr`, color: RED },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: GRAY_60 }}>{label}</span>
                      <span style={{ fontWeight: 600, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* [Row 1-3] 멤버별 이달 소비 */}
            <SectionCard title="멤버별 이달 소비" subtitle={`팀 합계 ${members.reduce((s, m) => s + m.usedCr, 0).toLocaleString()} cr`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[...members].sort((a, b) => b.usedCr - a.usedCr).slice(0, 3).map(m => {
                  const teamTotal = members.reduce((s, x) => s + x.usedCr, 0);
                  const pct = Math.round((m.usedCr / teamTotal) * 100);
                  const barColor = m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(255,149,0)" : GRAY_30;
                  const avatarBg = m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(255,149,0)" : GRAY_40;
                  return (
                    <div key={m.email}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>{m.avatar}</div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{m.name}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: GRAY_60 }}>{m.usedCr.toLocaleString()} cr</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: GRAY_70, width: 30, textAlign: "right" }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 6, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: barColor, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* [Row 2-1] 멤버 변동 이력 */}
            <SectionCard title="멤버 변동 이력">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {memberHistory.slice(0, 5).map((ev, i, arr) => {
                  const tagColor = ev.tag === "신규" ? GREEN : ev.tag === "역할변경" ? "rgb(180,100,0)" : PRIMARY;
                  const tagBg = ev.tag === "신규" ? "rgb(230,248,237)" : ev.tag === "역할변경" ? "rgb(255,246,224)" : PRIMARY_10;
                  const Icon = ev.tag === "신규" ? UserPlus : ev.tag === "역할변경" ? Shield : Crown;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${GRAY_5}` : "none" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: tagBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={12} color={tagColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{ev.name}</div>
                        <div style={{ fontSize: 11, color: GRAY_60 }}>{ev.action}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, backgroundColor: tagBg, color: tagColor, fontWeight: 600, display: "inline-block", marginBottom: 2 }}>{ev.tag}</div>
                        <div style={{ fontSize: 10, color: GRAY_60 }}>{ev.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* [Row 2-2] 결제 및 소비 이력 */}
            <SectionCard title="결제 및 소비 이력">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  ...paymentHistory.map(p => ({ icon: "payment" as const, date: p.date, title: p.desc, sub: p.amount, value: p.credits, valueColor: GREEN })),
                  ...usageHistory.filter(u => u.type === "서버").map(u => ({ icon: "usage" as const, date: u.date, title: u.desc, sub: u.type, value: u.credits, valueColor: RED })),
                ].slice(0, 5).map((row, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${GRAY_5}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: row.icon === "payment" ? "rgb(230,248,237)" : PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {row.icon === "payment" ? <CreditCard size={12} color={GREEN} /> : <Server size={11} color={PRIMARY} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.title}</div>
                      <div style={{ fontSize: 10, color: GRAY_60 }}>{row.sub} · {row.date}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: row.valueColor, flexShrink: 0, fontFamily: "Roboto Mono, monospace" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* [Row 2-3] 설정 변동 이력 */}
            <SectionCard title="설정 변동 이력">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {settingsHistory.slice(0, 5).map((s, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${GRAY_5}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: GRAY_5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Settings size={12} color={GRAY_60} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: GRAY_90 }}>{s.desc}</div>
                      <div style={{ fontSize: 10, color: GRAY_60 }}>{s.by} · {s.type}</div>
                    </div>
                    <div style={{ fontSize: 10, color: GRAY_60, flexShrink: 0 }}>{s.date}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

          </div>
        </div>
      )}

      {tab === "Members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: GRAY_90 }}>멤버</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: GRAY_60, backgroundColor: GRAY_5, border: `1px solid ${GRAY_10}`, borderRadius: 999, padding: "1px 8px" }}>{members.length}명</span>
            </div>
            <PrimaryBtn size="small"><Plus size={14} /> 멤버 초대</PrimaryBtn>
          </div>

          {/* Column header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 20px", paddingLeft: 78 }}>
            <div style={{ width: 160, flexShrink: 0 }}>
              <SortBtn field="name" label="이름 / 역할" justify="flex-start" />
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
              <SortBtn field="servers" label="활성/비활성 서버" />
              <SortBtn field="local" label="로컬 스토리지" />
              <SortBtn field="shared" label="공유 스토리지" />
              <SortBtn field="credits" label="이달 소비" />
              <SortBtn field="joined" label="참여일" />
            </div>
            <div style={{ width: 28, flexShrink: 0 }} />
          </div>

          {/* Member cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedMembers.map(m => (
              <MemberCard key={m.email} m={m} isOwner={m.role === "workspace.owner"} />
            ))}
          </div>
        </div>
      )}

      {tab === "Credit" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Credit summary */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_60 }}>크레딧 포인트 잔액</span>
                <PrimaryBtn size="small">크레딧 충전</PrimaryBtn>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: GRAY_90, marginBottom: 2 }}>{CREDIT_NOW.toLocaleString()} cr</div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>크레딧 + 포인트 합산</div>
              {[
                { label: "크레딧", amount: 44230, color: PRIMARY },
                { label: "포인트", amount: 1000, color: YELLOW },
              ].map(({ label, amount, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: GRAY_70 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{amount.toLocaleString()} cr</span>
                </div>
              ))}
              <div style={{ height: 6, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                <div style={{ height: "100%", width: `${(44230 / 45230) * 100}%`, backgroundColor: PRIMARY, borderRadius: 3 }} />
              </div>
            </Card>

            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_60 }}>이번 달 사용</span>
                <PrimaryBtn size="small" style={{ visibility: "hidden" }}>크레딧 충전</PrimaryBtn>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: GRAY_90, marginBottom: 2 }}>12,450 cr</div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>≈ 124,500원</div>
              {[
                { label: "서버 사용", amount: 10890, color: PRIMARY },
                { label: "스토리지", amount: 1560, color: BLUE },
              ].map(({ label, amount, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: GRAY_70 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{amount.toLocaleString()} cr</span>
                </div>
              ))}
              <div style={{ height: 6, backgroundColor: GRAY_5, borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                <div style={{ height: "100%", width: `${(10890 / 12450) * 100}%`, backgroundColor: PRIMARY, borderRadius: 3 }} />
              </div>
            </Card>
          </div>

          {/* 크레딧 충전 및 차감 이력 */}
          {(() => {
            const chargeRows = paymentHistory.map(p => ({
              date: p.date, desc: p.desc, credits: p.credits, isCharge: true,
            }));
            const useRows = usageHistory.map(u => ({
              date: u.date, desc: u.desc, credits: u.credits, isCharge: false,
            }));
            const merged = [...chargeRows, ...useRows].sort((a, b) => b.date.localeCompare(a.date));
            return (
              <ListCard title="크레딧 충전 및 차감 이력">
                <Table
                  headers={["날짜", "내역", "구분", "크레딧"]}
                  rows={merged.map(r => [
                    <span style={{ fontSize: 12, color: GRAY_60 }}>{r.date}</span>,
                    <span>{r.desc}</span>,
                    <Badge color={r.isCharge ? "success" : "danger"}>{r.isCharge ? "충전" : "차감"}</Badge>,
                    <span style={{ color: r.isCharge ? GREEN : RED, fontWeight: 700, fontFamily: "Roboto Mono, monospace" }}>{r.credits}</span>,
                  ])}
                />
              </ListCard>
            );
          })()}
        </div>
      )}

      {tab === "Settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
          <SectionCard title="Alert Settings" bodyStyle={{ padding: "6px 20px" }}>
            {alertDefs.map((def, i) => {
              const cfg = alertConfig[def.key];
              return (
                <div key={def.key} style={{ padding: "14px 0", borderBottom: i < alertDefs.length - 1 ? `1px solid ${GRAY_5}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{def.label}</div>
                      <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>{def.desc}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <input
                        type="number" min={1} max={99}
                        value={cfg.threshold}
                        onChange={e => setThreshold(def.key, Number(e.target.value))}
                        style={{ width: 46, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY_30}`, borderRadius: 6, padding: "3px 6px", textAlign: "center", color: GRAY_90, outline: "none" }}
                      />
                      <span style={{ fontSize: 11, color: GRAY_60 }}>{def.unit}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                      {(["inapp", "email"] as Array<"inapp" | "email">).map(ch => (
                        <div key={ch} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: GRAY_60 }}>{ch === "inapp" ? "Console" : "Email"}</span>
                          <button
                            onClick={() => toggleChannel(def.key, ch)}
                            style={{
                              width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                              backgroundColor: cfg.channels[ch] ? PRIMARY : GRAY_40,
                              position: "relative", transition: "background 0.2s",
                            }}>
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

          <SectionCard title="Notification Recipients" bodyStyle={{ padding: "6px 20px" }}>
            {(() => {
              const byRole = (role: string) => members.filter(m => m.role === role);
              const emailDesc = (list: typeof members) =>
                list.length === 0 ? "None"
                : list.length === 1 ? list[0].email
                : `${list[0].email} +${list.length - 1} more`;
              return ([
                { key: "owner" as const, label: "Owner", desc: emailDesc(byRole("workspace.owner")), icon: <Crown size={13} />, bg: PRIMARY_10, color: PRIMARY },
                { key: "admin" as const, label: "Admin", desc: emailDesc(byRole("workspace.admin")), icon: <Shield size={13} />, bg: "rgb(255,246,230)", color: "rgb(180,80,0)" },
                { key: "user"  as const, label: "User",  desc: emailDesc(byRole("workspace.user")),  icon: <User  size={13} />, bg: GRAY_5,     color: GRAY_60 },
              ] as const).map((r, i) => (
              <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < 2 ? `1px solid ${GRAY_5}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: r.bg, display: "flex", alignItems: "center", justifyContent: "center", color: r.color, flexShrink: 0 }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: GRAY_60 }}>{r.desc}</div>
                </div>
                <button
                  onClick={() => toggleNotifRecipient(r.key)}
                  style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", backgroundColor: notifRecipients[r.key] ? PRIMARY : GRAY_40, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", left: notifRecipients[r.key] ? 21 : 3 }} />
                </button>
              </div>
            ));
            })()}
          </SectionCard>
        </div>
      )}
    </PageContainer>
  );
}

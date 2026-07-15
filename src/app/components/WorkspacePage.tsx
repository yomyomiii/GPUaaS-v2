import { useState, useEffect } from "react";
import {
  Plus, Crown, Shield, User, CreditCard, Mail, Smartphone,
  Server, Zap, Layers, MoreHorizontal, Clock,
  UserPlus, Settings, Database, Info, ChevronUp, ChevronDown, Search, X,
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_20, GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90, RED, GREEN, BLUE, YELLOW,
  Badge, Card, PrimaryBtn, Table, PageContainer, TabBar, SectionCard, ListCard,
} from "./ConsoleLayout";

// ─── Mock data ────────────────────────────────────────────────────────────────
const members = [
  { name: "지염염", email: "yeomeyeom.ji@sdt.inc", role: "workspace.owner", avatar: "지", joined: "2026-01-15", online: true, usedCr: 5200, activeServers: ["pytorch-dev-01", "llm-finetuning"], inactiveServers: ["old-exp-01"], localStorages: ["local-vol-01", "pytorch-data"], sharedStorages: ["shared-team-01"] },
  { name: "이지현", email: "jihyun.lee@sdt.inc", role: "workspace.admin", avatar: "이", joined: "2026-02-20", online: true, usedCr: 3100, activeServers: ["stable-diffusion"], inactiveServers: ["resnet-test", "bert-finetune"], localStorages: ["local-vol-02"], sharedStorages: ["shared-team-01"] },
  { name: "김태민", email: "taemin.kim@sdt.inc", role: "workspace.user", avatar: "김", joined: "2026-03-10", online: false, usedCr: 1800, activeServers: [], inactiveServers: ["abuse-server-01"], localStorages: ["local-vol-03"], sharedStorages: [] },
  { name: "최유진", email: "yujin.choi@sdt.inc", role: "workspace.user", avatar: "최", joined: "2026-04-05", online: true, usedCr: 1620, activeServers: ["data-preprocess"], inactiveServers: [], localStorages: [], sharedStorages: ["shared-team-01"] },
  { name: "장민준", email: "minjun.jang@sdt.inc", role: "workspace.user", avatar: "장", joined: "2026-05-22", online: false, usedCr: 730, activeServers: [], inactiveServers: ["data-analysis-01"], localStorages: [], sharedStorages: [] },
];

type CreditType = "관리자 지급" | "관리자 회수" | "서버 사용" | "볼륨 스토리지 사용" | "공유 스토리지 사용";

const creditHistory: { date: string; time: string; desc: string; type: CreditType; amount: number; by: string; byEmail?: string }[] = [
  { date: "2026-07-09", time: "10:15:02", desc: "서비스 크레딧 장애 보상",            type: "관리자 지급",       amount:  10000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
  { date: "2026-07-08", time: "23:00:00", desc: "pytorch-dev-01 컴퓨팅 청구",       type: "서버 사용",        amount:   -240, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-08", time: "23:00:00", desc: "llm-finetuning 컴퓨팅 청구",       type: "서버 사용",        amount:   -576, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", desc: "stable-diffusion 컴퓨팅 청구",     type: "서버 사용",        amount:   -120, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", desc: "local-vol-01 볼륨 스토리지 청구",  type: "볼륨 스토리지 사용", amount:    -32, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", desc: "pytorch-data 볼륨 스토리지 청구",  type: "볼륨 스토리지 사용", amount:    -16, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", desc: "local-vol-02 볼륨 스토리지 청구",  type: "볼륨 스토리지 사용", amount:    -16, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-06", time: "23:00:00", desc: "shared-team-01 공유 스토리지 청구", type: "공유 스토리지 사용", amount:    -96, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-03", time: "09:22:11", desc: "프로모션 크레딧 베타 참여 보상",    type: "관리자 지급",       amount:  20000, by: "박성민", byEmail: "sungmin.park@sdt.inc"     },
  { date: "2026-06-30", time: "14:05:33", desc: "정책 위반 크레딧 회수",             type: "관리자 회수",       amount:  -2000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
];

const CREDIT_NOW = 45230;


const memberHistory = [
  { date: "2026-07-07 14:23:11", name: "장민준", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-05-22 10:08:45", name: "최유진", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-03-10 09:15:30", name: "김태민", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-02-20 14:05:47", name: "이지현", role: "workspace.admin", action: "Admin 권한 승격", tag: "역할변경" as const },
  { date: "2026-01-15 10:30:22", name: "지염염", role: "workspace.owner", action: "워크스페이스 생성", tag: "생성" as const },
];

const SPEND_TOTAL = 12450;
const SPEND_PREV = 11100;

const settingsHistory = [
  { date: "2026-07-01 09:15:30", desc: "크레딧 잔액 경고 알림 활성화", by: "지염염", type: "임계값" },
  { date: "2026-06-20 16:42:08", desc: "이메일 알림 채널 등록", by: "지염염", type: "채널" },
  { date: "2026-05-10 11:30:55", desc: "멤버 변동 알림 비활성화", by: "이지현", type: "임계값" },
  { date: "2026-02-15 14:20:33", desc: "크레딧 부족 알림 활성화", by: "지염염", type: "임계값" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type AlertKey = "credit" | "gpu_usage" | "gpu_vram" | "storage_temp" | "storage_local" | "storage_shared";
type AlertCfg = {
  enabled: boolean;
  threshold: number;
  channels: { inapp: boolean; email: boolean };
  recipients: { owner: boolean; admin: boolean; user: boolean };
};
type MemberSortField = "name" | "email" | "role" | "servers" | "inactive" | "local" | "shared" | "credits" | "joined" | null;

const alertDefs: { key: AlertKey; label: string; desc: string; hasThreshold: boolean; unit: string }[] = [
  { key: "credit",         label: "크레딧 잔액 부족",           desc: "크레딧 잔액이 설정한 수치 이하로 떨어지면 알림을 전송합니다.",          hasThreshold: true, unit: "cr 이하" },
  { key: "gpu_usage",      label: "GPU 사용률 초과",            desc: "GPU 사용률이 설정한 임계값을 초과하면 알림을 전송합니다.",              hasThreshold: true, unit: "% 이상" },
  { key: "gpu_vram",       label: "GPU vRAM 사용률 초과",       desc: "GPU vRAM 사용률이 설정한 임계값을 초과하면 알림을 전송합니다.",          hasThreshold: true, unit: "% 이상" },
  { key: "storage_temp",   label: "임시 스토리지 잔량 부족",     desc: "임시 스토리지 잔량이 설정한 수치 이하로 떨어지면 알림을 전송합니다.",   hasThreshold: true, unit: "GB 이하" },
  { key: "storage_local",  label: "볼륨 스토리지 잔량 부족",     desc: "볼륨 스토리지 잔량이 설정한 수치 이하로 떨어지면 알림을 전송합니다.",   hasThreshold: true, unit: "GB 이하" },
  { key: "storage_shared", label: "공유 스토리지 잔량 부족",     desc: "공유 스토리지 잔량이 설정한 수치 이하로 떨어지면 알림을 전송합니다.",   hasThreshold: true, unit: "GB 이하" },
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
function MemberCard({ m, isOwner, menuOpen, onMenuToggle, onDetail, onDeleteRequest }: { m: typeof members[0]; isOwner: boolean; menuOpen: boolean; onMenuToggle: () => void; onDetail: () => void; onDeleteRequest: () => void }) {
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);
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

        {/* Name */}
        <div style={{ width: 140, flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>{m.name}</div>
          <div style={{ fontSize: 11, color: GRAY_60 }}>{m.email}</div>
        </div>

        {/* Role */}
        <div style={{ width: 90, flexShrink: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 999, backgroundColor: roleBg, color: roleTextColor, fontSize: 11, fontWeight: 600 }}>
            {roleIcon(m.role)} {roleLabel(m.role)}
          </div>
        </div>

        {/* Stats — 5-col grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8, alignItems: "center" }}>
          {/* 활성/비활성 서버 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Server size={11} color={m.activeServers.length > 0 ? GRAY_70 : GRAY_40} />
              <span style={{ fontSize: 13, fontWeight: 700, color: m.activeServers.length > 0 ? GRAY_70 : GRAY_40 }}>{m.activeServers.length}</span>
              {m.activeServers.length > 0 && <InfoTooltip items={m.activeServers} />}
              <span style={{ fontSize: 11, color: GRAY_30, margin: "0 1px" }}>/</span>
              <Server size={11} color={GRAY_40} />
              <span style={{ fontSize: 13, fontWeight: 700, color: m.inactiveServers.length > 0 ? GRAY_70 : GRAY_40 }}>{m.inactiveServers.length}</span>
              {m.inactiveServers.length > 0 && <InfoTooltip items={m.inactiveServers} />}
            </div>
          </div>
          {/* 활성 볼륨 스토리지 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Database size={11} color={m.localStorages.length > 0 ? GRAY_70 : GRAY_40} />
              <span style={{ fontSize: 13, fontWeight: 700, color: m.localStorages.length > 0 ? GRAY_70 : GRAY_40 }}>{m.localStorages.length}개</span>
              {m.localStorages.length > 0 && <InfoTooltip items={m.localStorages} />}
            </div>
          </div>
          {/* 활성 공유 스토리지 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Database size={11} color={m.sharedStorages.length > 0 ? GRAY_70 : GRAY_40} />
              <span style={{ fontSize: 13, fontWeight: 700, color: m.sharedStorages.length > 0 ? GRAY_70 : GRAY_40 }}>{m.sharedStorages.length}개</span>
              {m.sharedStorages.length > 0 && <InfoTooltip items={m.sharedStorages} />}
            </div>
          </div>
          {/* 이달 크레딧 사용 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Zap size={11} color={m.usedCr > 0 ? GRAY_70 : GRAY_40} />
              <span style={{ fontSize: 13, fontWeight: 700, color: m.usedCr > 0 ? GRAY_70 : GRAY_40 }}>{m.usedCr.toLocaleString()} cr</span>
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
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0, width: 160 }}>
          <button type="button" onClick={onDetail}
            style={{ height: 32, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
            상세 보기
          </button>
          {!isOwner && (
            <div style={{ position: "relative" }}>
              {menuOpen && <div onClick={onMenuToggle} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
              <button type="button" onClick={(e) => { if (!menuOpen) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } onMenuToggle(); }}
                style={{ height: 32, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: menuOpen ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 0, padding: 0, overflow: "hidden" }}
                onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                <span style={{ padding: "0 10px 0 12px" }}>관리</span>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: menuOpen ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 8px", borderLeft: `1px solid ${menuOpen ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                  <ChevronDown size={12} color={PRIMARY} style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </span>
              </button>
              {menuOpen && menuAnchor && (
                <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 140, padding: "4px 0" }}>
                  {m.role === "workspace.user" && (
                    <button type="button" onClick={onMenuToggle} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      Admin으로 변경
                    </button>
                  )}
                  {m.role === "workspace.admin" && (
                    <button type="button" onClick={onMenuToggle} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      User로 변경
                    </button>
                  )}
                  <button type="button" onClick={onMenuToggle} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                    Owner로 변경
                  </button>
                  <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                  <button type="button" onClick={() => { onMenuToggle(); onDeleteRequest(); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                    멤버 삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Member Detail Drawer ─────────────────────────────────────────────────────
function MemberDetailDrawer({ m, onClose }: { m: typeof members[0]; onClose: () => void }) {
  const badgeBg = m.role === "workspace.owner" ? PRIMARY_10 : m.role === "workspace.admin" ? "rgb(255,246,225)" : GRAY_10;
  const badgeColor = m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(180,80,0)" : GRAY_60;

  type ResRowProps = { icon: React.ReactNode; iconBg: string; iconColor: string; label: string; items: string[]; chipBg: string; chipColor: string; last?: boolean };
  const ResourceRow = ({ icon, iconBg, iconColor, label, items, chipBg, chipColor, last }: ResRowProps) => (
    <div style={{ padding: "14px 0", borderBottom: last ? "none" : `1px solid ${GRAY_10}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, flexShrink: 0, marginTop: 1 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: items.length > 0 ? 8 : 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_70 }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: items.length > 0 ? GRAY_70 : GRAY_30, backgroundColor: items.length > 0 ? GRAY_5 : "transparent", padding: "1px 7px", borderRadius: 999 }}>{items.length}개</span>
          </div>
          {items.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {items.map(name => (
                <span key={name} style={{ fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 6, backgroundColor: chipBg, color: chipColor, whiteSpace: "nowrap" }}>
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: GRAY_30, fontStyle: "italic" }}>아직 자원 없음</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />

      {/* Drawer panel */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{m.name} 상세 정보</span>
          <button type="button" onClick={onClose} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
            닫기
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* 기본 정보 — card */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>기본 정보</div>
            <div style={{ backgroundColor: GRAY_5, borderRadius: 12, padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 16, columnGap: 20 }}>
              {[
                { label: "이름", value: m.name },
                { label: "이메일", value: m.email },
                { label: "역할", value: <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, backgroundColor: badgeBg, color: badgeColor, fontSize: 11, fontWeight: 600 }}>{roleIcon(m.role)} {roleLabel(m.role)}</span> },
                { label: "상태", value: <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: m.online ? GREEN : GRAY_40 }}><span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: m.online ? GREEN : GRAY_40, display: "inline-block", flexShrink: 0 }} />{m.online ? "온라인" : "오프라인"}</span> },
                { label: "참여일", value: m.joined },
                { label: "이달 사용 크레딧", value: `${m.usedCr.toLocaleString()} cr` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 자원 현황 */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 10 }}>자원 현황</div>
            <div>
              <ResourceRow icon={<Server size={14} />} iconBg="rgba(34,197,94,0.12)" iconColor="rgb(22,163,74)" label="실행 중인 서버" items={m.activeServers} chipBg="rgba(34,197,94,0.12)" chipColor="rgb(22,163,74)" />
              <ResourceRow icon={<Server size={14} />} iconBg={GRAY_5} iconColor={GRAY_40} label="정지된 서버" items={m.inactiveServers} chipBg={GRAY_5} chipColor={GRAY_60} />
              <ResourceRow icon={<Database size={14} />} iconBg={PRIMARY_10} iconColor={PRIMARY} label="볼륨 스토리지" items={m.localStorages} chipBg={PRIMARY_10} chipColor={PRIMARY} />
              <ResourceRow icon={<Database size={14} />} iconBg="rgba(36,142,213,0.1)" iconColor="rgb(36,142,213)" label="공유 스토리지" items={m.sharedStorages} chipBg="rgba(36,142,213,0.1)" chipColor="rgb(36,142,213)" last />
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "white", borderRadius: 14, padding: "28px 32px", width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: GRAY_90, marginBottom: 16 }}>{title}</div>
        <div style={{ height: 1, backgroundColor: GRAY_10, marginBottom: 20 }} />
        <div style={{ fontSize: 14, color: GRAY_70, lineHeight: 1.7, marginBottom: 28 }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onCancel}
            style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY_30}`, backgroundColor: "white", color: GRAY_70, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
            취소
          </button>
          <button type="button" onClick={onConfirm}
            style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", backgroundColor: RED, color: "white", cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Donut ───────────────────────────────────────────────────────────────
function RoleDonut({ data, total, size }: { data: { name: string; value: number; color: string }[]; total: number; size: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.37, sw = size * 0.14;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map(d => {
    const len = (d.value / total) * circ;
    const seg = { ...d, dashOffset: offset, dashLen: Math.max(0, len - 2) };
    offset += len;
    return seg;
  });
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
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
        <div style={{ fontSize: size * 0.10, color: GRAY_60 }}>총 멤버</div>
        <div style={{ fontSize: size * 0.16, fontWeight: 800, color: GRAY_90, lineHeight: 1.2 }}>{total}</div>
        <div style={{ fontSize: size * 0.09, color: GRAY_60 }}>명</div>
      </div>
    </div>
  );
}

// ─── Mini Donut Chart ─────────────────────────────────────────────────────────
function MiniDonut({ segments, size = 64 }: { segments: { value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, g) => s + g.value, 0);
  const r = (size - 10) / 2;
  const cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;
  const paths = segments.map(({ value, color }) => {
    const sweep = (value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return <path key={color} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={color} />;
  });
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      {paths}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
    </svg>
  );
}

// ─── Credit Line Chart ────────────────────────────────────────────────────────
const creditDailyData = [
  { day:  1, server:  850, storage: 120 },
  { day:  2, server:  920, storage: 120 },
  { day:  3, server:  780, storage: 120 },
  { day:  4, server: 1100, storage: 130 },
  { day:  5, server:  960, storage: 120 },
  { day:  6, server:  840, storage: 120 },
  { day:  7, server: 1050, storage: 130 },
  { day:  8, server:  890, storage: 120 },
  { day:  9, server: 1020, storage: 120 },
  { day: 10, server:  750, storage: 130 },
  { day: 11, server:  880, storage: 120 },
  { day: 12, server:  940, storage: 120 },
  { day: 13, server:  910, storage: 120 },
];

function CreditLineChart() {
  const VW = 500, VH = 96;
  const pad = { t: 8, r: 4, b: 20, l: 4 };
  const W = VW - pad.l - pad.r, H = VH - pad.t - pad.b;
  const n = creditDailyData.length;
  const maxVal = Math.max(...creditDailyData.map(d => d.server));
  const base = pad.t + H;
  const px = (i: number) => pad.l + (i / (n - 1)) * W;
  const py = (v: number) => pad.t + H * (1 - v / maxVal);
  const sPts = creditDailyData.map((d, i) => `${px(i).toFixed(1)},${py(d.server).toFixed(1)}`).join(" ");
  const stPts = creditDailyData.map((d, i) => `${px(i).toFixed(1)},${py(d.storage).toFixed(1)}`).join(" ");
  const sArea = `${px(0)},${base} ${sPts} ${px(n - 1)},${base}`;
  const stArea = `${px(0)},${base} ${stPts} ${px(n - 1)},${base}`;
  const tickDays = [1, 4, 7, 10, 13];
  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ display: "block", marginTop: 10 }}>
      {[0.33, 0.66, 1].map(r => (
        <line key={r} x1={pad.l} y1={pad.t + H * (1 - r)} x2={VW - pad.r} y2={pad.t + H * (1 - r)}
          stroke={GRAY_10} strokeWidth={1} />
      ))}
      <polygon points={sArea}  fill={PRIMARY} opacity={0.07} />
      <polygon points={stArea} fill={BLUE}    opacity={0.15} />
      <polyline points={sPts}  fill="none" stroke={PRIMARY} strokeWidth={2}   strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={stPts} fill="none" stroke={BLUE}    strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3" />
      <line x1={pad.l} y1={base} x2={VW - pad.r} y2={base} stroke={GRAY_10} strokeWidth={1} />
      {tickDays.map(day => {
        const idx = creditDailyData.findIndex(d => d.day === day);
        return idx === -1 ? null : (
          <text key={day} x={px(idx)} y={VH - 4} fontSize={9} fill={GRAY_40} textAnchor="middle">7/{day}</text>
        );
      })}
    </svg>
  );
}

// ─── Chip Toggle ──────────────────────────────────────────────────────────────
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{
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
export function WorkspacePage({ initialTab = "Overview", onTabChange, hideTabs, onBack }: { initialTab?: string; onTabChange?: (tab: string) => void; hideTabs?: string[]; onBack?: () => void }) {
  const [tab, setTab] = useState(initialTab);

  const [alertConfig, setAlertConfig] = useState<Record<AlertKey, AlertCfg>>({
    credit:         { enabled: true,  threshold: 5000,  channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: false } },
    gpu_usage:      { enabled: true,  threshold: 80,    channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: true  } },
    gpu_vram:       { enabled: true,  threshold: 90,    channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: true  } },
    storage_temp:   { enabled: false, threshold: 10,    channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: false } },
    storage_local:  { enabled: false, threshold: 10,    channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: false } },
    storage_shared: { enabled: false, threshold: 50,    channels: { inapp: true,  email: false }, recipients: { owner: true,  admin: true,  user: false } },
  });

  const [sortField, setSortField] = useState<MemberSortField>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [notifRecipients, setNotifRecipients] = useState({ owner: true, admin: true, user: false });
  const [creditTypeFilter, setCreditTypeFilter] = useState<CreditType | "전체">("전체");
  const [creditSearch, setCreditSearch] = useState("");
  const [openMemberMenu, setOpenMemberMenu] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"전체" | "Owner" | "Admin" | "User">("전체");
  const [detailMember, setDetailMember] = useState<typeof members[0] | null>(null);
  const [deletingMember, setDeletingMember] = useState<typeof members[0] | null>(null);
  const [deletedEmails, setDeletedEmails] = useState<Set<string>>(new Set());

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
  const sortedMembers = [...members].filter(m => !deletedEmails.has(m.email)).sort((a, b) => {
    if (!sortField) return 0;
    let va: string | number = 0, vb: string | number = 0;
    if (sortField === "name")    { va = a.name; vb = b.name; }
    else if (sortField === "email")   { va = a.email; vb = b.email; }
    else if (sortField === "role")    { va = roleOrder[a.role] ?? 2; vb = roleOrder[b.role] ?? 2; }
    else if (sortField === "servers")  { va = a.activeServers.length; vb = b.activeServers.length; }
    else if (sortField === "inactive") { va = a.inactiveServers.length; vb = b.inactiveServers.length; }
    else if (sortField === "local")   { va = a.localStorages.length; vb = b.localStorages.length; }
    else if (sortField === "shared")  { va = a.sharedStorages.length; vb = b.sharedStorages.length; }
    else if (sortField === "credits") { va = a.usedCr; vb = b.usedCr; }
    else if (sortField === "joined")  { va = a.joined; vb = b.joined; }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const roleFilterMap: Record<string, string> = { Owner: "workspace.owner", Admin: "workspace.admin", User: "workspace.user" };
  const filteredMembers = sortedMembers
    .filter(m => memberRoleFilter === "전체" || m.role === roleFilterMap[memberRoleFilter])
    .filter(m => !memberSearch || m.name.includes(memberSearch) || m.email.toLowerCase().includes(memberSearch.toLowerCase()));

  // ── Sort button (used in Members header) ──
  const SortBtn = ({ field }: { field: MemberSortField }) => (
    <span onClick={() => handleSort(field)} style={{ cursor: "pointer", userSelect: "none", fontSize: 10, color: sortField === field ? PRIMARY : GRAY_40 }}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const allTabs = ["Overview", `Members (${members.length})`, "Credit", "Settings"];
  const visibleTabs = hideTabs ? allTabs.filter(t => !hideTabs.some(h => t === h || t.startsWith(h + " ("))) : allTabs;

  return (
    <>
    <PageContainer
      title="Workspace"
      subtitle="My Workspace — 워크스페이스 현황·멤버·크레딧을 한눈에 관리합니다."
      backNav={onBack && (
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0 }}>
          ← Workspace Management
        </button>
      )}
    >
      <TabBar tabs={visibleTabs} active={tab === "Members" ? `Members (${members.length})` : tab} onChange={t => handleTabChange(t.replace(/ \(\d+\)$/, ""))} />

      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 워크스페이스 기본 정보 */}
          <Card style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <Layers size={22} color={PRIMARY} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: GRAY_90 }}>My Workspace</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
                  {[
                    { label: "Owner", value: "지염염", sub: "yeomeyeom.ji@sdt.inc" },
                    { label: "멤버", value: `${members.length}명` },
                    { label: "생성 일시", value: "2026-01-15 10:30:22" },
                    { label: "크레딧 잔액", value: `${CREDIT_NOW.toLocaleString()} cr` },
                  ].map(({ label, value, sub }, i, arr) => (
                    <div key={label} style={{ paddingRight: 20, borderRight: i < arr.length - 1 ? `1px solid ${GRAY_10}` : "none", paddingLeft: i > 0 ? 20 : 0 }}>
                      <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{label}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: label === "크레딧 잔액" ? PRIMARY : GRAY_90 }}>{value}</span>
                        {sub && <span style={{ fontSize: 11, color: GRAY_60 }}>({sub})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 인사이트 (2×2) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* [Row 1-1] 크레딧 잔액 + 런웨이 통합 */}
            {(() => {
              const dailySpend  = Math.round(SPEND_TOTAL / 13);
              const runwayDays  = Math.floor(CREDIT_NOW / dailySpend);
              const runwayColor = runwayDays <= 7 ? RED : runwayDays <= 14 ? YELLOW : GREEN;
              const runwayLabel = runwayDays <= 7 ? "잔액 부족 · 충전이 필요합니다" : runwayDays <= 14 ? "잔액이 얼마 남지 않았습니다" : "잔액이 충분합니다";
              const spendChange = Math.round((SPEND_TOTAL - SPEND_PREV) / SPEND_PREV * 100);
              const MAX_DAYS    = 30;
              const markerPct   = Math.min(97, (Math.min(runwayDays, MAX_DAYS) / MAX_DAYS) * 100);
              return (
                <SectionCard title="크레딧 현황" headerStyle={{ minHeight: 52 }} bodyStyle={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                    {/* 상단 3-col: 잔액 | 이달 사용 | 일 평균 — flex:1 으로 남은 높이 흡수 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, flex: 1 }}>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>현재 잔액</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: PRIMARY, lineHeight: 1, letterSpacing: "-0.5px" }}>
                          {CREDIT_NOW.toLocaleString()}
                          <span style={{ fontSize: 12, fontWeight: 500, color: GRAY_60, marginLeft: 5 }}>cr</span>
                        </div>
                      </div>
                      <div style={{ backgroundColor: GRAY_5, borderRadius: 8, padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: 10, color: GRAY_60, marginBottom: 4 }}>이달 크레딧 사용</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{SPEND_TOTAL.toLocaleString()} cr</div>
                      </div>
                      <div style={{ backgroundColor: GRAY_5, borderRadius: 8, padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: 10, color: GRAY_60, marginBottom: 4 }}>일 평균 크레딧 사용</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>
                          {dailySpend.toLocaleString()} cr
                          <span style={{ fontSize: 10, fontWeight: 400, color: GRAY_60, marginLeft: 4 }}>/ 일</span>
                        </div>
                      </div>
                    </div>
                    {/* 런웨이 — 텍스트 행 + 바 행 */}
                    <div style={{ borderRadius: 8, padding: "8px 12px", border: `1px solid ${GRAY_10}` }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 7 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                          <span style={{ fontSize: 11, color: GRAY_60 }}>소진까지</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: runwayColor, letterSpacing: "-0.3px" }}>
                            {runwayDays > MAX_DAYS ? `${MAX_DAYS}일+` : `약 ${runwayDays}일`}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: runwayColor }}>{runwayLabel}</span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <div style={{ height: 4, borderRadius: 99, overflow: "hidden", display: "flex" }}>
                          <div style={{ width: `${(7 / MAX_DAYS) * 100}%`, backgroundColor: "rgba(239,68,68,0.30)" }} />
                          <div style={{ width: `${(7 / MAX_DAYS) * 100}%`, backgroundColor: "rgba(255,177,68,0.30)" }} />
                          <div style={{ flex: 1, backgroundColor: "rgba(34,197,94,0.30)" }} />
                        </div>
                        <div style={{
                          position: "absolute", top: "50%", left: `${markerPct}%`,
                          transform: "translate(-50%, -50%)",
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor: runwayColor, border: "1.5px solid white",
                          boxShadow: `0 0 0 1px ${runwayColor}`,
                          pointerEvents: "none",
                        }} />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              );
            })()}

            {/* [Row 1-2] 서버 · 스토리지 현황 */}
            {(() => {
              const allActive   = [...new Set(members.flatMap(m => m.activeServers))];
              const allInactive = [...new Set(members.flatMap(m => m.inactiveServers))];
              const allVolumes  = [...new Set(members.flatMap(m => m.localStorages))];
              const allShared   = [...new Set(members.flatMap(m => m.sharedStorages))];
              const WS_SHARED_TOTAL = 2;
              const rows: { icon: React.ReactNode; bg: string; label: string; active: number; total: number | null; color: string }[] = [
                { icon: <Server size={13} color={GREEN} />,     bg: "rgba(34,197,94,0.1)",  label: "활성 서버",          active: allActive.length,  total: allActive.length + allInactive.length, color: GREEN },
                { icon: <Database size={13} color={YELLOW} />,  bg: "rgba(255,177,0,0.1)",  label: "활성 로컬 스토리지",  active: allActive.length,  total: null,              color: YELLOW },
                { icon: <Database size={13} color={PRIMARY} />, bg: PRIMARY_10,              label: "활성 볼륨 스토리지",  active: allVolumes.length, total: null,              color: PRIMARY },
                { icon: <Database size={13} color={BLUE} />,    bg: "rgba(36,142,213,0.1)", label: "활성 공유 스토리지",  active: allShared.length,  total: WS_SHARED_TOTAL,   color: BLUE },
              ];
              return (
                <SectionCard title="서버 및 스토리지 현황" headerStyle={{ minHeight: 52 }} bodyStyle={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
                    {rows.map(({ icon, bg, label, active, total, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: GRAY_5, borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 3 }}>{label}</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{active}</span>
                            {total !== null
                              ? <span style={{ fontSize: 11, color: GRAY_60 }}>/{total}개</span>
                              : <span style={{ fontSize: 11, color: GRAY_60 }}>개</span>
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            })()}

            {/* [Row 1-3] 멤버 역할 구성 */}
            {(() => {
              const roleDefs = [
                { key: "workspace.owner", label: "Owner",  color: PRIMARY,          icon: <Crown size={14} color={PRIMARY} />,          bg: PRIMARY_10 },
                { key: "workspace.admin", label: "Admin",  color: "rgb(255,149,0)", icon: <Shield size={14} color="rgb(255,149,0)" />, bg: "rgba(255,149,0,0.1)" },
                { key: "workspace.user",  label: "Member", color: GRAY_60,          icon: <User size={14} color={GRAY_60} />,           bg: "rgba(120,120,128,0.1)" },
              ];
              return (
                <SectionCard title="멤버 역할 구성" headerStyle={{ minHeight: 52 }} bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, width: "100%" }}>
                    <RoleDonut
                      size={110}
                      total={members.length}
                      data={roleDefs.map(({ key, label, color }) => ({ name: label, value: members.filter(m => m.role === key).length, color }))}
                    />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      {roleDefs.map(({ key, label, color, icon, bg }) => {
                        const count = members.filter(m => m.role === key).length;
                        const pct = members.length > 0 ? Math.round((count / members.length) * 100) : 0;
                        return (
                          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                                <span style={{ fontSize: 11, color: GRAY_60 }}>{label}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color }}>{count}명 <span style={{ fontSize: 10, fontWeight: 400, color: GRAY_40 }}>{pct}%</span></span>
                              </div>
                              <div style={{ height: 3, borderRadius: 99, backgroundColor: GRAY_10, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: 99 }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </SectionCard>
              );
            })()}

            {/* [Row 2-1] 크레딧 이력 */}
            <SectionCard title="크레딧 이력">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {creditHistory.slice(0, 3).map((r, i, arr) => {
                  const meta = {
                    "관리자 지급":      { bg: "rgb(230,248,237)", color: GREEN,   node: <CreditCard size={12} color={GREEN} />   },
                    "관리자 회수":      { bg: "rgb(254,242,242)", color: RED,     node: <CreditCard size={12} color={RED} />     },
                    "서버 사용":       { bg: PRIMARY_10,          color: PRIMARY, node: <Server size={11} color={PRIMARY} />     },
                    "볼륨 스토리지 사용": { bg: "rgb(235,245,255)", color: BLUE,    node: <Database size={11} color={BLUE} />      },
                    "공유 스토리지 사용": { bg: "rgb(255,251,235)", color: YELLOW,  node: <Database size={11} color={YELLOW} />    },
                  }[r.type];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, borderBottom: i < arr.length - 1 ? `1px solid ${GRAY_10}` : "none" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: meta.color, backgroundColor: meta.bg, padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>{r.type}</span>
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: r.amount > 0 ? GREEN : RED, flexShrink: 0 }}>{r.amount > 0 ? "+" : ""}{r.amount.toLocaleString()} cr</span>
                      <span style={{ fontSize: 11, color: GRAY_60, flexShrink: 0 }}>{r.date} {r.time}</span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

          </div>
        </div>
      )}

      {tab === "Members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>전체 {filteredMembers.length}개</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <Search size={12} color={GRAY_60} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="검색어를 입력하세요."
                  style={{ height: 32, paddingLeft: 28, paddingRight: 10, border: `1px solid ${GRAY_30}`, borderRadius: 8, fontSize: 12, width: 180, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", backgroundColor: GRAY_10, borderRadius: 10, padding: 3, gap: 2 }}>
                {(["전체", "Owner", "Admin", "User"] as const).map(f => (
                  <button key={f} type="button" onClick={() => setMemberRoleFilter(f)}
                    style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: memberRoleFilter === f ? 600 : 400, backgroundColor: memberRoleFilter === f ? "white" : "transparent", color: memberRoleFilter === f ? GRAY_90 : GRAY_60, boxShadow: memberRoleFilter === f ? "0 1px 3px rgba(0,0,0,0.10)" : "none", transition: "all 0.15s" }}>
                    {f}
                  </button>
                ))}
              </div>
              <PrimaryBtn size="small"><Plus size={14} /> 멤버 초대</PrimaryBtn>
            </div>
          </div>

          {/* Column header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", fontSize: 12, fontWeight: 600, color: GRAY_60, backgroundColor: GRAY_10, borderRadius: 10 }}>
            <div style={{ width: 44, flexShrink: 0 }} />
            <div style={{ width: 140, flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
              Name / Email <SortBtn field="name" />
            </div>
            <div style={{ width: 90, flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
              Role <SortBtn field="role" />
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>Active <SortBtn field="servers" /></span>
                <span style={{ color: GRAY_40 }}>/</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>Inactive <SortBtn field="inactive" /></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>Volume <SortBtn field="local" /></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>Shared <SortBtn field="shared" /></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>Credits <SortBtn field="credits" /></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>Joined <SortBtn field="joined" /></div>
            </div>
            <div style={{ width: 160, flexShrink: 0 }}>Actions</div>
          </div>

          {/* Member cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredMembers.map(m => (
              <MemberCard
                key={m.email}
                m={m}
                isOwner={m.role === "workspace.owner"}
                menuOpen={openMemberMenu === m.email}
                onMenuToggle={() => setOpenMemberMenu(openMemberMenu === m.email ? null : m.email)}
                onDetail={() => setDetailMember(m)}
                onDeleteRequest={() => setDeletingMember(m)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 멤버 삭제 확인 모달 */}
      {deletingMember && (
        <ConfirmModal
          title="멤버 삭제 확인"
          message={
            <span>
              <strong style={{ color: GRAY_90 }}>{deletingMember.name}</strong> 님의 워크스페이스 멤버십을 삭제하시겠습니까?<br /><br />
              삭제 즉시 이 워크스페이스에 접근할 수 없게 되며, 보유 중인 서버 및 스토리지는 비활성화됩니다. 이 작업은 되돌릴 수 없습니다.
            </span>
          }
          confirmLabel="삭제"
          onConfirm={() => {
            setDeletedEmails(prev => new Set([...prev, deletingMember.email]));
            setDeletingMember(null);
          }}
          onCancel={() => setDeletingMember(null)}
        />
      )}

      {tab === "Credit" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Credit summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
            {/* Card 1: 잔액 */}
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_60 }}>크레딧 포인트 잔액</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: GRAY_90, marginBottom: 2 }}>{CREDIT_NOW.toLocaleString()} cr</div>
              <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>크레딧 + 포인트 합산</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <MiniDonut segments={[{ value: 44230, color: PRIMARY }, { value: 1000, color: YELLOW }]} />
                <div style={{ flex: 1 }}>
                  {[
                    { label: "크레딧", amount: 44230, color: PRIMARY },
                    { label: "포인트", amount: 1000, color: YELLOW },
                  ].map(({ label, amount, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: GRAY_70 }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{amount.toLocaleString()} cr</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Card 2: 이번달 사용 + 라인 차트 */}
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_60 }}>이번 달 사용</span>
                  <div style={{ fontSize: 28, fontWeight: 800, color: GRAY_90, marginTop: 4, marginBottom: 2 }}>12,450 cr</div>
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 2 }}>
                  {([
                    { label: "서버 사용", amount: 10890, color: PRIMARY, dashed: false },
                    { label: "스토리지", amount: 1560, color: BLUE, dashed: true },
                  ] as const).map(({ label, amount, color, dashed }) => (
                    <div key={label} style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 3 }}>
                        <svg width={16} height={8} style={{ flexShrink: 0 }}>
                          <line x1={0} y1={4} x2={16} y2={4} stroke={color} strokeWidth={dashed ? 1.5 : 2}
                            strokeDasharray={dashed ? "4 2" : undefined} strokeLinecap="round" />
                        </svg>
                        <span style={{ fontSize: 11, color: GRAY_60 }}>{label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{amount.toLocaleString()} cr</span>
                    </div>
                  ))}
                </div>
              </div>
              <CreditLineChart />
            </Card>
          </div>

          {/* 크레딧 이력 */}
          {(() => {
            const typeFilters: (CreditType | "전체")[] = ["전체", "관리자 지급", "관리자 회수", "서버 사용", "볼륨 스토리지 사용", "공유 스토리지 사용"];
            const typeMeta: Record<CreditType, { bg: string; color: string; icon: React.ReactNode }> = {
              "관리자 지급":      { bg: "rgb(230,248,237)", color: GREEN,   icon: <CreditCard size={12} color={GREEN} />   },
              "관리자 회수":      { bg: "rgb(254,242,242)", color: RED,     icon: <CreditCard size={12} color={RED} />     },
              "서버 사용":       { bg: PRIMARY_10,          color: PRIMARY, icon: <Server size={12} color={PRIMARY} />     },
              "볼륨 스토리지 사용":       { bg: "rgb(235,245,255)", color: BLUE,    icon: <Database size={12} color={BLUE} />      },
              "공유 스토리지 사용": { bg: "rgb(255,251,235)", color: YELLOW,  icon: <Database size={12} color={YELLOW} />    },
            };
            const isAdmin = (type: CreditType) => type === "관리자 지급" || type === "관리자 회수";
            const filtered = creditHistory
              .filter(r => creditTypeFilter === "전체" || r.type === creditTypeFilter)
              .filter(r => !creditSearch || r.desc.includes(creditSearch) || r.by.includes(creditSearch));
            const thBase: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left", whiteSpace: "nowrap", borderBottom: `1px solid ${GRAY_10}`, backgroundColor: GRAY_5, width: "1px" };
            const tdBase: React.CSSProperties = { fontSize: 13, color: GRAY_90, verticalAlign: "middle", borderBottom: `1px solid ${GRAY_10}`, whiteSpace: "nowrap", width: "1px" };
            return (
              <Card style={{ overflow: "hidden" }}>
                {/* 필터 바 */}
                <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderBottom: `1px solid ${GRAY_10}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, flexShrink: 0 }}>크레딧 이력</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ position: "relative" }}>
                      <Search size={12} color={GRAY_60} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input value={creditSearch} onChange={e => setCreditSearch(e.target.value)} placeholder="검색어를 입력하세요."
                        style={{ height: 32, paddingLeft: 28, paddingRight: 10, border: `1px solid ${GRAY_30}`, borderRadius: 8, fontSize: 12, width: 160, outline: "none", fontFamily: "inherit" }} />
                    </div>
                    <div style={{ display: "flex", backgroundColor: GRAY_10, borderRadius: 10, padding: 3, gap: 2 }}>
                      {typeFilters.map(f => (
                        <button key={f} type="button" onClick={() => setCreditTypeFilter(f)}
                          style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: creditTypeFilter === f ? 600 : 400, backgroundColor: creditTypeFilter === f ? "white" : "transparent", color: creditTypeFilter === f ? GRAY_90 : GRAY_60, boxShadow: creditTypeFilter === f ? "0 1px 3px rgba(0,0,0,0.10)" : "none", transition: "all 0.15s" }}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...thBase, padding: "10px 0 10px 16px", width: 130 }}>Type</th>
                      <th style={{ ...thBase, padding: "10px 12px 10px 0" }}>Details</th>
                      <th style={{ ...thBase, padding: "10px 12px 10px 0", width: 140 }}>User</th>
                      <th style={{ ...thBase, padding: "10px 12px 10px 0", width: 110 }}>Amount</th>
                      <th style={{ ...thBase, padding: "10px 16px 10px 0", width: 160 }}>일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: GRAY_40 }}>이력이 없습니다</td></tr>
                    ) : filtered.map((r, idx) => {
                      const isLast = idx === filtered.length - 1;
                      const brd = isLast ? "none" : `1px solid ${GRAY_10}`;
                      return (
                        <tr key={idx} style={{ backgroundColor: "white" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
                          {/* Type */}
                          <td style={{ ...tdBase, padding: "12px 0 12px 16px", borderBottom: brd }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, backgroundColor: typeMeta[r.type].bg }}>
                              {typeMeta[r.type].icon}
                              <span style={{ fontSize: 11, fontWeight: 600, color: typeMeta[r.type].color }}>{r.type}</span>
                            </div>
                          </td>
                          {/* Description */}
                          <td style={{ ...tdBase, padding: "12px 12px 12px 0", borderBottom: brd }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>{r.desc}</span>
                          </td>
                          {/* Actor */}
                          <td style={{ ...tdBase, padding: "12px 12px 12px 0", borderBottom: brd }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: typeMeta[r.type].bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {isAdmin(r.type) ? <Shield size={11} color={typeMeta[r.type].color} /> : <User size={11} color={typeMeta[r.type].color} />}
                              </div>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{r.by}</div>
                                {r.byEmail && <div style={{ fontSize: 11, color: GRAY_60 }}>{r.byEmail}</div>}
                              </div>
                            </div>
                          </td>
                          {/* Amount */}
                          <td style={{ ...tdBase, padding: "12px 12px 12px 0", borderBottom: brd }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: r.amount > 0 ? GREEN : RED }}>
                              {r.amount > 0 ? "+" : ""}{r.amount.toLocaleString()}
                            </span>
                            <span style={{ fontSize: 11, color: GRAY_60, marginLeft: 3 }}>cr</span>
                          </td>
                          {/* Timestamp */}
                          <td style={{ ...tdBase, padding: "12px 16px 12px 0", borderBottom: brd }}>
                            <span style={{ fontSize: 12, color: GRAY_70, whiteSpace: "nowrap" }}>{r.date} {r.time}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
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
                        type="number"
                        min={def.key === "credit" ? 100 : def.key.startsWith("storage") ? 1 : 1}
                        max={def.key === "credit" ? 9999999 : def.key.startsWith("storage") ? 9999 : 99}
                        step={def.key === "credit" ? 100 : 1}
                        value={cfg.threshold}
                        onChange={e => setThreshold(def.key, Number(e.target.value))}
                        style={{ width: def.key === "credit" ? 72 : 54, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY_30}`, borderRadius: 6, padding: "3px 6px", textAlign: "center", color: GRAY_90, outline: "none" }}
                      />
                      <span style={{ fontSize: 11, color: GRAY_60 }}>{def.unit}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                      {(["inapp", "email"] as Array<"inapp" | "email">).map(ch => (
                        <div key={ch} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: GRAY_60 }}>{ch === "inapp" ? "Console" : "Email"}</span>
                          <button type="button"
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
                <button type="button"
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
    {detailMember && <MemberDetailDrawer m={detailMember} onClose={() => setDetailMember(null)} />}
    </>
  );
}

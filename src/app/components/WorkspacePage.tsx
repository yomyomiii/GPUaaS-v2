import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Plus, Crown, Shield, User, CreditCard, Mail, Smartphone,
  Server, Zap, Layers, MoreHorizontal, Clock, Calendar,
  UserPlus, Database, Info, ChevronUp, ChevronDown, Search, X,
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_20, GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90, RED, GREEN, BLUE, YELLOW,
  Badge, Card, PrimaryBtn, Table, PageContainer, TabBar, SectionCard, ListCard,
} from "./ConsoleLayout";

// ─── Mock data ────────────────────────────────────────────────────────────────
const members = [
  { name: "지염염", email: "yeomeyeom.ji@sdt.inc", role: "workspace.owner", avatar: "지", joined: "2026-01-15 10:30:22", online: true, usedCr: 5200, activeServers: ["pytorch-dev-01", "llm-finetuning"], inactiveServers: ["old-exp-01"], localStorages: ["local-vol-01", "pytorch-data"], sharedStorages: ["shared-team-01"] },
  { name: "이지현", email: "jihyun.lee@sdt.inc", role: "workspace.admin", avatar: "이", joined: "2026-02-20 14:05:47", online: true, usedCr: 3100, activeServers: ["stable-diffusion"], inactiveServers: ["resnet-test", "bert-finetune"], localStorages: ["local-vol-02"], sharedStorages: ["shared-team-01"] },
  { name: "김태민", email: "taemin.kim@sdt.inc", role: "workspace.user", avatar: "김", joined: "2026-03-10 09:15:30", online: false, usedCr: 1800, activeServers: [], inactiveServers: ["abuse-server-01"], localStorages: ["local-vol-03"], sharedStorages: [] },
  { name: "최유진", email: "yujin.choi@sdt.inc", role: "workspace.user", avatar: "최", joined: "2026-04-05 16:48:09", online: true, usedCr: 1620, activeServers: ["data-preprocess"], inactiveServers: [], localStorages: [], sharedStorages: ["shared-team-01"] },
  { name: "장민준", email: "minjun.jang@sdt.inc", role: "workspace.user", avatar: "장", joined: "2026-05-22 10:08:45", online: false, usedCr: 730, activeServers: [], inactiveServers: ["data-analysis-01"], localStorages: [], sharedStorages: [] },
];

type CreditType = "adminGrant" | "adminRevoke" | "creditExpiry" | "serverUsage" | "volumeUsage" | "sharedUsage" | "localUsage";

const creditHistory: { date: string; time: string; desc: string; type: CreditType; amount: number; by: string; byEmail?: string; expiryDate?: string }[] = [
  { date: "2026-07-09", time: "10:15:02", desc: "서비스 크레딧 장애 보상",             type: "adminGrant",   amount:  10000, by: "이지수", byEmail: "jisu.lee@sdt.inc",     expiryDate: "2026-12-31 23:59:59" },
  { date: "2026-07-08", time: "23:00:00", desc: "pytorch-dev-01 컴퓨팅 청구",        type: "serverUsage",  amount:   -240, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-08", time: "23:00:00", desc: "llm-finetuning 컴퓨팅 청구",        type: "serverUsage",  amount:   -576, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", desc: "stable-diffusion 컴퓨팅 청구",      type: "serverUsage",  amount:   -120, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", desc: "local-vol-01 볼륨 스토리지 청구",   type: "volumeUsage",  amount:    -32, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", desc: "pytorch-data 볼륨 스토리지 청구",   type: "volumeUsage",  amount:    -16, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", desc: "local-vol-02 볼륨 스토리지 청구",   type: "volumeUsage",  amount:    -16, by: "이지현", byEmail: "jihyun.lee@sdt.inc"       },
  { date: "2026-07-07", time: "23:00:00", desc: "shared-team-01 공유 스토리지 청구",  type: "sharedUsage",  amount:    -96, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-07", time: "23:00:00", desc: "pytorch-dev-01 로컬 스토리지 청구",  type: "localUsage",   amount:     -5, by: "지염염", byEmail: "yeomeyeom.ji@sdt.inc"     },
  { date: "2026-07-03", time: "09:22:11", desc: "프로모션 크레딧 베타 참여 보상",     type: "adminGrant",   amount:  20000, by: "박성민", byEmail: "sungmin.park@sdt.inc",   expiryDate: "2026-08-31 23:59:59" },
  { date: "2026-06-30", time: "14:05:33", desc: "정책 위반 크레딧 회수",              type: "adminRevoke",  amount:  -2000, by: "이지수", byEmail: "jisu.lee@sdt.inc"         },
  { date: "2026-06-15", time: "23:59:59", desc: "사전 오픈 베타 크레딧 만료",         type: "creditExpiry", amount:  -5000, by: "시스템" },
];

const CREDIT_NOW = 45230;

const creditLots: { id: string; grantAmount: number; grantDate: string; expiryDate: string; balance: number; desc: string }[] = [
  { id: "lot-1", grantAmount: 20000, grantDate: "2026-07-03 09:22:11", expiryDate: "2026-08-31 23:59:59", balance: 18230, desc: "프로모션 크레딧 베타 참여 보상" },
  { id: "lot-2", grantAmount: 30000, grantDate: "2026-07-09 10:15:02", expiryDate: "2026-12-31 23:59:59", balance: 27000, desc: "서비스 크레딧 장애 보상" },
];


const memberHistory = [
  { date: "2026-07-07 14:23:11", name: "장민준", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-05-22 10:08:45", name: "최유진", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-03-10 09:15:30", name: "김태민", role: "workspace.user", action: "워크스페이스 참여", tag: "신규" as const },
  { date: "2026-02-20 14:05:47", name: "이지현", role: "workspace.admin", action: "관리자 권한 승격", tag: "역할변경" as const },
  { date: "2026-01-15 10:30:22", name: "지염염", role: "workspace.owner", action: "워크스페이스 생성", tag: "생성" as const },
];

const SPEND_TOTAL = 12450;
const SPEND_PREV = 11100;


// ─── Types ────────────────────────────────────────────────────────────────────
type MemberSortField = "name" | "email" | "role" | "servers" | "inactive" | "local" | "shared" | "credits" | "joined" | null;

// ─── InfoTooltip ──────────────────────────────────────────────────────────────
function InfoTooltip({ items, emptyLabel }: { items: string[]; emptyLabel?: string }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", flexShrink: 0, cursor: "default" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={12} color={GRAY_40} />
      {show && (
        <div style={{ position: "absolute", bottom: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)", backgroundColor: GRAY_90, color: "white", fontSize: 11, padding: "7px 11px", borderRadius: 8, zIndex: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", pointerEvents: "none", minWidth: 140 }}>
          {items.length === 0 ? (
            <span style={{ color: "rgba(255,255,255,0.45)" }}>{emptyLabel ?? t('common.table.noResults')}</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>▸</span>
                  <span style={{ fontSize: 11 }}>{item}</span>
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

function roleLabel(role: string, t: (key: string) => string) {
  if (role === "workspace.owner") return t('workspace.member.role.owner');
  if (role === "workspace.admin") return t('workspace.member.role.admin');
  return t('workspace.member.role.member');
}

const roleIcon = (role: string) => {
  if (role === "workspace.owner") return <Crown size={12} />;
  if (role === "workspace.admin") return <Shield size={12} />;
  return <User size={12} />;
};

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ m, isOwner, menuOpen, onMenuToggle, onDetail, onDeleteRequest }: { m: typeof members[0]; isOwner: boolean; menuOpen: boolean; onMenuToggle: () => void; onDetail: () => void; onDeleteRequest: () => void }) {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);
  const avatarBg = m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(255,232,186)" : GRAY_5;
  const avatarColor = m.role === "workspace.owner" ? "white" : m.role === "workspace.admin" ? "rgb(180,80,0)" : GRAY_70;
  const roleBg = m.role === "workspace.owner" ? PRIMARY_10 : m.role === "workspace.admin" ? "rgb(255,246,230)" : GRAY_5;
  const roleTextColor = m.role === "workspace.owner" ? PRIMARY : m.role === "workspace.admin" ? "rgb(180,80,0)" : GRAY_60;

  return (
    <Card hover style={{ padding: "16px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "208px 90px 120px 60px 60px 90px 1fr auto", gap: 24, alignItems: "center" }}>

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: avatarColor, flexShrink: 0 }}>
            {m.avatar}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>{m.name}</div>
            <div style={{ fontSize: 11, color: GRAY_60 }}>{m.email}</div>
          </div>
        </div>

        {/* Role */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 999, backgroundColor: roleBg, color: roleTextColor, fontSize: 11, fontWeight: 600 }}>
            {roleIcon(m.role)} {roleLabel(m.role, t)}
          </div>
        </div>

        {/* 활성/비활성 서버 */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Server size={11} color={m.activeServers.length > 0 ? GRAY_70 : GRAY_40} />
          <span style={{ fontSize: 13, fontWeight: 700, color: m.activeServers.length > 0 ? GRAY_70 : GRAY_40 }}>{m.activeServers.length}</span>
          {m.activeServers.length > 0 && <InfoTooltip items={m.activeServers} />}
          <span style={{ fontSize: 11, color: GRAY_30, margin: "0 1px" }}>/</span>
          <Server size={11} color={GRAY_40} />
          <span style={{ fontSize: 13, fontWeight: 700, color: m.inactiveServers.length > 0 ? GRAY_70 : GRAY_40 }}>{m.inactiveServers.length}</span>
          {m.inactiveServers.length > 0 && <InfoTooltip items={m.inactiveServers} />}
        </div>

        {/* 활성 볼륨 스토리지 */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Database size={11} color={m.localStorages.length > 0 ? GRAY_70 : GRAY_40} />
          <span style={{ fontSize: 13, fontWeight: 700, color: m.localStorages.length > 0 ? GRAY_70 : GRAY_40 }}>{m.localStorages.length}{t('workspace.unit.item')}</span>
          {m.localStorages.length > 0 && <InfoTooltip items={m.localStorages} />}
        </div>

        {/* 활성 공유 스토리지 */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Database size={11} color={m.sharedStorages.length > 0 ? GRAY_70 : GRAY_40} />
          <span style={{ fontSize: 13, fontWeight: 700, color: m.sharedStorages.length > 0 ? GRAY_70 : GRAY_40 }}>{m.sharedStorages.length}{t('workspace.unit.item')}</span>
          {m.sharedStorages.length > 0 && <InfoTooltip items={m.sharedStorages} />}
        </div>

        {/* 이달 크레딧 사용 */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Zap size={11} color={m.usedCr > 0 ? GRAY_70 : GRAY_40} />
          <span style={{ fontSize: 13, fontWeight: 700, color: m.usedCr > 0 ? GRAY_70 : GRAY_40 }}>{m.usedCr.toLocaleString()} cr</span>
        </div>

        {/* 참여일 */}
        <div>
          <span style={{ fontSize: 12, fontWeight: 500, color: GRAY_70 }}>{m.joined}</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
          <button type="button" onClick={onDetail}
            style={{ height: 32, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
            {t('common.action.viewDetail')}
          </button>
          {!isOwner && (
            <div style={{ position: "relative" }}>
              {menuOpen && <div onClick={onMenuToggle} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
              <button type="button" onClick={(e) => { if (!menuOpen) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } onMenuToggle(); }}
                style={{ height: 32, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: menuOpen ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", gap: 0, padding: 0, overflow: "hidden" }}
                onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                <span style={{ padding: "0 10px 0 12px" }}>{t('common.action.manage')}</span>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: menuOpen ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 8px", borderLeft: `1px solid ${menuOpen ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                  <ChevronDown size={12} color={PRIMARY} style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </span>
              </button>
              {menuOpen && menuAnchor && (
                <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 140, padding: "4px 0" }}>
                  {m.role === "workspace.user" && (
                    <button type="button" onClick={onMenuToggle} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      {t('workspace.member.changeToAdmin')}
                    </button>
                  )}
                  {m.role === "workspace.admin" && (
                    <button type="button" onClick={onMenuToggle} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      {t('workspace.member.changeToUser')}
                    </button>
                  )}
                  <button type="button" onClick={onMenuToggle} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                    {t('workspace.member.changeToOwner')}
                  </button>
                  <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                  <button type="button" onClick={() => { onMenuToggle(); onDeleteRequest(); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                    {t('workspace.member.remove')}
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
  const { t } = useTranslation();
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
            <span style={{ fontSize: 11, fontWeight: 600, color: items.length > 0 ? GRAY_70 : GRAY_30, backgroundColor: items.length > 0 ? GRAY_5 : "transparent", padding: "1px 7px", borderRadius: 999 }}>{items.length}{t('workspace.unit.item')}</span>
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
            <span style={{ fontSize: 12, color: GRAY_30, fontStyle: "italic" }}>{t('common.table.noResults')}</span>
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
          <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{m.name} {t('workspace.member.drawer.title')}</span>
          <button type="button" onClick={onClose} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
            {t('common.action.close')}
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* 기본 정보 — card */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 12 }}>{t('workspace.member.drawer.info')}</div>
            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 16, columnGap: 20 }}>
              {[
                { label: t('workspace.member.drawer.name'), key: "name", value: m.name },
                { label: t('workspace.member.drawer.email'), key: "email", value: m.email },
                { label: t('workspace.member.drawer.role'), key: "role", value: <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, backgroundColor: badgeBg, color: badgeColor, fontSize: 11, fontWeight: 600 }}>{roleIcon(m.role)} {roleLabel(m.role, t)}</span> },
                { label: t('workspace.member.drawer.status'), key: "status", value: <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: m.online ? GREEN : GRAY_40 }}><span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: m.online ? GREEN : GRAY_40, display: "inline-block", flexShrink: 0 }} />{m.online ? t('common.status.active') : t('common.status.inactive')}</span> },
                { label: t('workspace.member.drawer.joinedAt'), key: "joined", value: m.joined },
                { label: t('workspace.member.drawer.monthlyUsage'), key: "monthlyUsage", value: `${m.usedCr.toLocaleString()} cr` },
              ].map(({ label, key, value }) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: GRAY_40, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 자원 현황 */}
          <section>
            <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_60, marginBottom: 10 }}>{t('workspace.member.drawer.resources')}</div>
            <div>
              <ResourceRow icon={<Server size={14} />} iconBg="rgba(34,197,94,0.12)" iconColor="rgb(22,163,74)" label={t('workspace.member.drawer.servers')} items={m.activeServers} chipBg="rgba(34,197,94,0.12)" chipColor="rgb(22,163,74)" />
              <ResourceRow icon={<Server size={14} />} iconBg={GRAY_5} iconColor={GRAY_40} label={t('workspace.member.drawer.servers')} items={m.inactiveServers} chipBg={GRAY_5} chipColor={GRAY_60} />
              <ResourceRow icon={<Database size={14} />} iconBg={PRIMARY_10} iconColor={PRIMARY} label={t('workspace.member.drawer.storage')} items={m.localStorages} chipBg={PRIMARY_10} chipColor={PRIMARY} />
              <ResourceRow icon={<Database size={14} />} iconBg="rgba(36,142,213,0.1)" iconColor="rgb(36,142,213)" label={t('workspace.member.drawer.storage')} items={m.sharedStorages} chipBg="rgba(36,142,213,0.1)" chipColor="rgb(36,142,213)" last />
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

// ─── Credit Detail Drawer ─────────────────────────────────────────────────────
function CreditDetailDrawer({ lots, onClose }: { lots: typeof creditLots; onClose: () => void }) {
  const { t } = useTranslation();
  const today = new Date("2026-07-15");

  const dDayColor = (expiryDate: string) => {
    const diff = Math.floor((new Date(expiryDate.replace(' ', 'T')).getTime() - today.getTime()) / 86400000);
    if (diff <= 7) return RED;
    if (diff <= 30) return YELLOW;
    return GREEN;
  };
  const dDayLabel = (expiryDate: string) => {
    const diff = Math.floor((new Date(expiryDate.replace(' ', 'T')).getTime() - today.getTime()) / 86400000);
    return diff <= 0 ? "D-Day" : `D-${diff}`;
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 400 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, backgroundColor: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", zIndex: 401, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "0 24px", height: 56, borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={16} color={PRIMARY} />
            <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{t('workspace.credit.detailDrawerTitle')}</span>
          </div>
          <button type="button" onClick={onClose}
            style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_10}`, cursor: "pointer", backgroundColor: "white", color: GRAY_60, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
            {t('common.action.close')}
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {lots.length === 0 ? (
            <div style={{ fontSize: 13, color: GRAY_40, textAlign: "center", marginTop: 40 }}>
              {t('workspace.credit.lot.empty')}
            </div>
          ) : lots.map((lot, i) => {
            const color = dDayColor(lot.expiryDate);
            const label = dDayLabel(lot.expiryDate);
            return (
              <div key={lot.id} style={{ position: "relative", paddingLeft: 22, paddingBottom: i < lots.length - 1 ? 24 : 0 }}>
                <div style={{ position: "absolute", left: 0, top: 5, width: 8, height: 8, borderRadius: "50%", backgroundColor: color }} />
                {i < lots.length - 1 && <div style={{ position: "absolute", left: 3, top: 13, bottom: 0, width: 2, backgroundColor: GRAY_10 }} />}
                {/* D-day 태그 */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4, backgroundColor: color, color: "white" }}>{label}</span>
                </div>
                {/* 잔액 — 메인 값 */}
                <div style={{ fontSize: 18, fontWeight: 800, color: GRAY_90, marginBottom: 6 }}>
                  {lot.balance.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>cr</span>
                </div>
                {/* 메타 */}
                <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", rowGap: 5, columnGap: 16 }}>
                  <span style={{ fontSize: 11, color: GRAY_40 }}>{t('workspace.credit.lot.reason')}</span>
                  <span style={{ fontSize: 11, color: GRAY_60 }}>{lot.desc}</span>
                  <span style={{ fontSize: 11, color: GRAY_40 }}>{t('workspace.credit.lot.expiryDate')}</span>
                  <span style={{ fontSize: 11, color, fontWeight: 600 }}>{lot.expiryDate}</span>
                </div>
              </div>
            );
          })}
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
  const { t } = useTranslation();
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
            {t('common.action.cancel')}
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
  const { t } = useTranslation();
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
        <div style={{ fontSize: size * 0.09, color: GRAY_60 }}>{t('workspace.section.members')}</div>
        <div style={{ fontSize: size * 0.16, fontWeight: 800, color: GRAY_90, lineHeight: 1.2 }}>{total}</div>
        <div style={{ fontSize: size * 0.09, color: GRAY_60 }}>{t('workspace.credit.runwayUnit')}</div>
      </div>
    </div>
  );
}

// ─── Mini Donut Chart ─────────────────────────────────────────────────────────
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
  const { t } = useTranslation();
  const creditTypeLabel = (type: CreditType): string => {
    if (type === "adminGrant")   return t('workspace.creditType.adminGrant');
    if (type === "adminRevoke")  return t('workspace.creditType.adminRevoke');
    if (type === "serverUsage")  return t('workspace.creditType.serverUsage');
    if (type === "volumeUsage")  return t('workspace.creditType.volumeUsage');
    if (type === "sharedUsage")  return t('workspace.creditType.sharedUsage');
    if (type === "localUsage")   return t('workspace.creditType.localUsage');
    if (type === "creditExpiry") return t('workspace.creditType.creditExpiry');
    return type;
  };
  const [tab, setTab] = useState(initialTab);

  const [sortField, setSortField] = useState<MemberSortField>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [creditTypeFilter, setCreditTypeFilter] = useState<CreditType | "all">("all");
  const [creditSearch, setCreditSearch] = useState("");
  const [openMemberMenu, setOpenMemberMenu] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"all" | "Owner" | "Admin" | "User">("all");
  const [detailMember, setDetailMember] = useState<typeof members[0] | null>(null);
  const [deletingMember, setDeletingMember] = useState<typeof members[0] | null>(null);
  const [deletedEmails, setDeletedEmails] = useState<Set<string>>(new Set());
  const [showCreditDetail, setShowCreditDetail] = useState(false);

  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const handleTabChange = (t: string) => { setTab(t); onTabChange?.(t); };

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
    .filter(m => memberRoleFilter === "all" || m.role === roleFilterMap[memberRoleFilter])
    .filter(m => !memberSearch || m.name.includes(memberSearch) || m.email.toLowerCase().includes(memberSearch.toLowerCase()));

  // ── Sort button (used in Members header) ──
  const SortBtn = ({ field }: { field: MemberSortField }) => (
    <span onClick={() => handleSort(field)} style={{ cursor: "pointer", userSelect: "none", fontSize: 10, color: sortField === field ? PRIMARY : GRAY_40 }}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const tabKeyToLabel = (key: string) => {
    if (key === "Overview") return t('workspace.tab.overview');
    if (key === "Members")  return `${t('workspace.tab.members')} (${members.length})`;
    if (key === "Credit")   return t('workspace.tab.credit');
    return key;
  };
  const tabLabelToKey = (label: string) => {
    if (label === t('workspace.tab.overview')) return "Overview";
    if (label.startsWith(t('workspace.tab.members'))) return "Members";
    if (label === t('workspace.tab.credit')) return "Credit";
    return label;
  };
  const allTabKeys = ["Overview", "Members", "Credit"];
  const visibleTabKeys = hideTabs ? allTabKeys.filter(k => !hideTabs.some(h => k === h || k === h.replace(/ \(\d+\)$/, ""))) : allTabKeys;
  const visibleTabs = visibleTabKeys.map(tabKeyToLabel);

  return (
    <>
    <PageContainer
      title={t('gnb.lnb.workspace')}
      subtitle={`My Workspace — ${t('workspace.section.overview')}`}
      backNav={onBack && (
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0 }}>
          ← {t('admin.workspace.pageTitle')}
        </button>
      )}
    >
      <TabBar tabs={visibleTabs} active={tabKeyToLabel(tab)} onChange={label => handleTabChange(tabLabelToKey(label))} />

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
                    { key: "owner",   label: t('workspace.member.role.owner'), value: "지염염",                              sub: "yeomeyeom.ji@sdt.inc", isCredit: false },
                    { key: "members", label: t('workspace.section.members'), value: `${members.length}${t('workspace.unit.person')}`, sub: undefined, isCredit: false },
                    { key: "created", label: t('workspace.createdAt'),         value: "2026-01-15 10:30:22",                sub: undefined, isCredit: false },
                    { key: "credit",  label: t('workspace.credit.balance'),  value: `${CREDIT_NOW.toLocaleString()} cr`, sub: undefined, isCredit: true },
                  ].map(({ key, label, value, sub, isCredit }, i, arr) => (
                    <div key={key} style={{ paddingRight: 20, borderRight: i < arr.length - 1 ? `1px solid ${GRAY_10}` : "none", paddingLeft: i > 0 ? 20 : 0 }}>
                      <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{label}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: isCredit ? PRIMARY : GRAY_90 }}>{value}</span>
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
              const runwayLabel = runwayDays <= 7 ? t('workspace.credit.runwayCritical') : runwayDays <= 14 ? t('workspace.credit.runwayWarn', { days: runwayDays }) : t('workspace.credit.runwayOk');
              const spendChange = Math.round((SPEND_TOTAL - SPEND_PREV) / SPEND_PREV * 100);
              const MAX_DAYS    = 30;
              const markerPct   = Math.min(97, (Math.min(runwayDays, MAX_DAYS) / MAX_DAYS) * 100);
              return (
                <SectionCard title={t('workspace.section.overview')} headerStyle={{ minHeight: 52 }} bodyStyle={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                    {/* 상단 3-col: 잔액 | 이달 사용 | 일 평균 — flex:1 으로 남은 높이 흡수 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, flex: 1 }}>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{t('workspace.credit.balance')}</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: PRIMARY, lineHeight: 1, letterSpacing: "-0.5px" }}>
                          {CREDIT_NOW.toLocaleString()}
                          <span style={{ fontSize: 12, fontWeight: 500, color: GRAY_60, marginLeft: 5 }}>cr</span>
                        </div>
                      </div>
                      <div style={{ backgroundColor: GRAY_5, borderRadius: 8, padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: 10, color: GRAY_60, marginBottom: 4 }}>{t('workspace.credit.used')}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>{SPEND_TOTAL.toLocaleString()} cr</div>
                      </div>
                      <div style={{ backgroundColor: GRAY_5, borderRadius: 8, padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: 10, color: GRAY_60, marginBottom: 4 }}>{t('workspace.credit.runway')}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>
                          {dailySpend.toLocaleString()} cr
                          <span style={{ fontSize: 10, fontWeight: 400, color: GRAY_60, marginLeft: 4 }}>/ {t('workspace.credit.runwayUnit')}</span>
                        </div>
                      </div>
                    </div>
                    {/* 런웨이 — 텍스트 행 + 바 행 */}
                    <div style={{ borderRadius: 8, padding: "8px 12px", border: `1px solid ${GRAY_10}` }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 7 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                          <span style={{ fontSize: 11, color: GRAY_60 }}>{t('workspace.credit.runway')}</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: runwayColor, letterSpacing: "-0.3px" }}>
                            {runwayDays > MAX_DAYS ? `${MAX_DAYS}${t('workspace.credit.runwayUnit')}+` : `${runwayDays}${t('workspace.credit.runwayUnit')}`}
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
              const rows: { id: string; icon: React.ReactNode; bg: string; label: string; active: number; total: number | null; color: string }[] = [
                { id: "servers",        icon: <Server size={13} color={GREEN} />,     bg: "rgba(34,197,94,0.1)",  label: t('workspace.resource.servers'),  active: allActive.length,  total: allActive.length + allInactive.length, color: GREEN },
                { id: "temp-storage",   icon: <Database size={13} color={YELLOW} />,  bg: "rgba(255,177,0,0.1)",  label: t('workspace.resource.storage'),  active: allActive.length,  total: null,              color: YELLOW },
                { id: "local-storage",  icon: <Database size={13} color={PRIMARY} />, bg: PRIMARY_10,              label: t('workspace.resource.storage'),  active: allVolumes.length, total: null,              color: PRIMARY },
                { id: "shared-storage", icon: <Database size={13} color={BLUE} />,    bg: "rgba(36,142,213,0.1)", label: t('workspace.resource.storage'),  active: allShared.length,  total: WS_SHARED_TOTAL,   color: BLUE },
              ];
              return (
                <SectionCard title={`${t('workspace.resource.servers')} & ${t('workspace.resource.storage')}`} headerStyle={{ minHeight: 52 }} bodyStyle={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
                    {rows.map(({ id, icon, bg, label, active, total, color }) => (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: GRAY_5, borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 3 }}>{label}</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{active}</span>
                            {total !== null
                              ? <span style={{ fontSize: 11, color: GRAY_60 }}>/{total}{t('workspace.unit.item')}</span>
                              : <span style={{ fontSize: 11, color: GRAY_60 }}>{t('workspace.unit.item')}</span>
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
                { key: "workspace.owner", label: t('workspace.member.role.owner'),  color: PRIMARY,          icon: <Crown size={14} color={PRIMARY} />,          bg: PRIMARY_10 },
                { key: "workspace.admin", label: t('workspace.member.role.admin'),  color: "rgb(255,149,0)", icon: <Shield size={14} color="rgb(255,149,0)" />, bg: "rgba(255,149,0,0.1)" },
                { key: "workspace.user",  label: t('workspace.member.role.member'), color: GRAY_60,          icon: <User size={14} color={GRAY_60} />,           bg: "rgba(120,120,128,0.1)" },
              ];
              return (
                <SectionCard title={t('workspace.section.members')} headerStyle={{ minHeight: 52 }} bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
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
                                <span style={{ fontSize: 12, fontWeight: 700, color }}>{count}{t('workspace.unit.person')} <span style={{ fontSize: 10, fontWeight: 400, color: GRAY_40 }}>{pct}%</span></span>
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
            <SectionCard title={t('workspace.section.creditHistory')}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {creditHistory.slice(0, 3).map((r, i, arr) => {
                  const meta = {
                    "adminGrant":   { bg: "rgb(230,248,237)", color: GREEN,      node: <CreditCard size={12} color={GREEN} />        },
                    "adminRevoke":  { bg: "rgb(254,242,242)", color: RED,        node: <CreditCard size={12} color={RED} />          },
                    "creditExpiry": { bg: "rgb(250,245,255)", color: "#7c3aed",  node: <Clock size={11} color="#7c3aed" />           },
                    "serverUsage":  { bg: PRIMARY_10,          color: PRIMARY,    node: <Server size={11} color={PRIMARY} />          },
                    "volumeUsage":  { bg: "rgb(235,245,255)", color: BLUE,       node: <Database size={11} color={BLUE} />           },
                    "sharedUsage":  { bg: "rgb(255,251,235)", color: YELLOW,     node: <Database size={11} color={YELLOW} />         },
                    "localUsage":   { bg: "rgb(236,252,250)", color: "#0d9488",  node: <Database size={11} color="#0d9488" />        },
                  }[r.type];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, borderBottom: i < arr.length - 1 ? `1px solid ${GRAY_10}` : "none" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: meta.color, backgroundColor: meta.bg, padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>{creditTypeLabel(r.type)}</span>
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
            <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{t('common.status.all')} {filteredMembers.length}{t('workspace.unit.person')}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <Search size={12} color={GRAY_60} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder={t('common.searchPlaceholder')}
                  style={{ height: 32, paddingLeft: 28, paddingRight: 10, border: `1px solid ${GRAY_30}`, borderRadius: 8, fontSize: 12, width: 180, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", backgroundColor: GRAY_10, borderRadius: 10, padding: 3, gap: 2 }}>
                {(["all", "Owner", "Admin", "User"] as const).map(f => (
                  <button key={f} type="button" onClick={() => setMemberRoleFilter(f)}
                    style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: memberRoleFilter === f ? 600 : 400, backgroundColor: memberRoleFilter === f ? "white" : "transparent", color: memberRoleFilter === f ? GRAY_90 : GRAY_60, boxShadow: memberRoleFilter === f ? "0 1px 3px rgba(0,0,0,0.10)" : "none", transition: "all 0.15s" }}>
                    {f === "all" ? t('common.status.all') : f === "Owner" ? t('workspace.member.role.owner') : f === "Admin" ? t('workspace.member.role.admin') : t('workspace.member.role.member')}
                  </button>
                ))}
              </div>
              <PrimaryBtn size="small"><Plus size={14} /> {t('workspace.member.invite')}</PrimaryBtn>
            </div>
          </div>

          {/* Column header */}
          <div style={{ display: "grid", gridTemplateColumns: "208px 90px 120px 60px 60px 90px 1fr auto", gap: 24, alignItems: "center", padding: "10px 20px", fontSize: 12, fontWeight: 600, color: GRAY_60, backgroundColor: GRAY_10, borderRadius: 10 }}>
            <div style={{ paddingLeft: 56 }}>
              {t('admin.user.col.nameEmail')} <SortBtn field="name" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {t('common.field.role')} <SortBtn field="role" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{t('workspace.member.col.active')} <SortBtn field="servers" /></span>
              <span style={{ color: GRAY_40 }}>/</span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{t('workspace.member.col.inactive')} <SortBtn field="inactive" /></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>{t('workspace.member.col.volume')} <SortBtn field="local" /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>{t('workspace.member.col.shared')} <SortBtn field="shared" /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>{t('workspace.member.col.credits')} <SortBtn field="credits" /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>{t('workspace.member.col.joined')} <SortBtn field="joined" /></div>
            <div>{t('workspace.member.col.actions')}</div>
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
          title={t('workspace.member.removeConfirmTitle')}
          message={
            <span>
              {t('workspace.member.removeConfirmMsg', { name: deletingMember.name, email: deletingMember.email })}<br /><br />
              {t('workspace.settings.deleteConfirmMsg')}
            </span>
          }
          confirmLabel={t('common.action.delete')}
          onConfirm={() => {
            setDeletedEmails(prev => new Set([...prev, deletingMember.email]));
            setDeletingMember(null);
          }}
          onCancel={() => setDeletingMember(null)}
        />
      )}

      {tab === "Credit" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 상단 통합 카드 */}
          {(() => {
            const today = new Date("2026-07-15");
            const monthUsed = creditHistory
              .filter(r => r.date.startsWith("2026-07") && r.amount < 0 && r.type !== "adminRevoke" && r.type !== "creditExpiry")
              .reduce((s, r) => s + Math.abs(r.amount), 0);
            const nearestLot = [...creditLots].sort((a, b) =>
              new Date(a.expiryDate.replace(' ', 'T')).getTime() - new Date(b.expiryDate.replace(' ', 'T')).getTime()
            )[0];
            const nearestDiff = nearestLot
              ? Math.floor((new Date(nearestLot.expiryDate.replace(' ', 'T')).getTime() - today.getTime()) / 86400000)
              : null;
            const nearestColor = nearestDiff !== null ? (nearestDiff <= 7 ? RED : nearestDiff <= 30 ? YELLOW : GREEN) : GRAY_60;
            return (
              <Card style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 0 }}>
                {/* 잔액 */}
                <div style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{t('workspace.credit.balance')}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: PRIMARY, lineHeight: 1 }}>
                      {CREDIT_NOW.toLocaleString()}
                      <span style={{ fontSize: 12, fontWeight: 500, color: GRAY_60, marginLeft: 5 }}>cr</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowCreditDetail(true)}
                    style={{ height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid ${GRAY_30}`, backgroundColor: "white", color: GRAY_70, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
                    {t('workspace.credit.detailBtn')}
                  </button>
                </div>
                {/* 구분선 */}
                <div style={{ width: 1, alignSelf: "stretch", backgroundColor: GRAY_10 }} />
                {/* 이달 사용 */}
                <div style={{ flex: 1, padding: "0 24px" }}>
                  <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{t('workspace.credit.used')}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: RED, lineHeight: 1 }}>
                    −{monthUsed.toLocaleString()}
                    <span style={{ fontSize: 12, fontWeight: 500, color: GRAY_60, marginLeft: 4 }}>cr</span>
                  </div>
                </div>
                {/* 구분선 */}
                <div style={{ width: 1, alignSelf: "stretch", backgroundColor: GRAY_10 }} />
                {/* 가장 빠른 만료 */}
                {nearestLot && nearestDiff !== null && (
                  <div style={{ flex: 1, paddingLeft: 24 }}>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{t('workspace.credit.nearestExpiryLabel')}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, lineHeight: 1 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: nearestColor }}>
                        {nearestLot.balance.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: GRAY_60 }}>cr</span>
                      <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
                        onMouseEnter={e => { const t = e.currentTarget.querySelector<HTMLElement>(".expiry-tooltip"); if (t) t.style.display = "block"; }}
                        onMouseLeave={e => { const t = e.currentTarget.querySelector<HTMLElement>(".expiry-tooltip"); if (t) t.style.display = "none"; }}>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: GRAY_10, border: `1px solid ${GRAY_30}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: GRAY_60, cursor: "default", userSelect: "none" as const }}>i</span>
                        <div className="expiry-tooltip" style={{ display: "none", position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", backgroundColor: GRAY_90, color: "white", fontSize: 11, fontWeight: 500, padding: "5px 9px", borderRadius: 6, whiteSpace: "nowrap" as const, zIndex: 10, pointerEvents: "none" }}>
                          {nearestLot.expiryDate} {t('workspace.credit.expirySuffix')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })()}

          {/* 크레딧 이력 */}
          {(() => {
            const typeFilters: (CreditType | "all")[] = ["all", "adminGrant", "adminRevoke", "creditExpiry", "serverUsage", "volumeUsage", "sharedUsage", "localUsage"];
            const typeMeta: Record<CreditType, { bg: string; color: string; icon: React.ReactNode }> = {
              "adminGrant":   { bg: "rgb(230,248,237)", color: GREEN,      icon: <CreditCard size={12} color={GREEN} />        },
              "adminRevoke":  { bg: "rgb(254,242,242)", color: RED,        icon: <CreditCard size={12} color={RED} />          },
              "creditExpiry": { bg: "rgb(250,245,255)", color: "#7c3aed",  icon: <Clock size={12} color="#7c3aed" />           },
              "serverUsage":  { bg: PRIMARY_10,          color: PRIMARY,    icon: <Server size={12} color={PRIMARY} />          },
              "volumeUsage":  { bg: "rgb(235,245,255)", color: BLUE,       icon: <Database size={12} color={BLUE} />           },
              "sharedUsage":  { bg: "rgb(255,251,235)", color: YELLOW,     icon: <Database size={12} color={YELLOW} />         },
              "localUsage":   { bg: "rgb(236,252,250)", color: "#0d9488",  icon: <Database size={12} color="#0d9488" />        },
            };
            const isAdmin = (type: CreditType) => type === "adminGrant" || type === "adminRevoke" || type === "creditExpiry";
            const filtered = creditHistory
              .filter(r => creditTypeFilter === "all" || r.type === creditTypeFilter)
              .filter(r => !creditSearch || r.desc.includes(creditSearch) || r.by.includes(creditSearch));
            const thBase: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left", whiteSpace: "nowrap", borderBottom: `1px solid ${GRAY_10}`, backgroundColor: GRAY_5, width: "1px" };
            const tdBase: React.CSSProperties = { fontSize: 13, color: GRAY_90, verticalAlign: "middle", borderBottom: `1px solid ${GRAY_10}`, whiteSpace: "nowrap", width: "1px" };
            return (
              <Card style={{ overflow: "hidden" }}>
                {/* 필터 바 */}
                <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderBottom: `1px solid ${GRAY_10}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, flexShrink: 0 }}>{t('workspace.section.creditHistory')}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ position: "relative" }}>
                      <Search size={12} color={GRAY_60} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input value={creditSearch} onChange={e => setCreditSearch(e.target.value)} placeholder={t('common.searchPlaceholder')}
                        style={{ height: 32, paddingLeft: 28, paddingRight: 10, border: `1px solid ${GRAY_30}`, borderRadius: 8, fontSize: 12, width: 160, outline: "none", fontFamily: "inherit" }} />
                    </div>
                    <div style={{ display: "flex", backgroundColor: GRAY_10, borderRadius: 10, padding: 3, gap: 2 }}>
                      {typeFilters.map(f => (
                        <button key={f} type="button" onClick={() => setCreditTypeFilter(f)}
                          style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: creditTypeFilter === f ? 600 : 400, backgroundColor: creditTypeFilter === f ? "white" : "transparent", color: creditTypeFilter === f ? GRAY_90 : GRAY_60, boxShadow: creditTypeFilter === f ? "0 1px 3px rgba(0,0,0,0.10)" : "none", transition: "all 0.15s" }}>
                          {f === "all" ? t('workspace.creditType.all') : creditTypeLabel(f as CreditType)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...thBase, padding: "10px 0 10px 16px", width: 130 }}>{t('workspace.creditCol.type')}</th>
                      <th style={{ ...thBase, padding: "10px 12px 10px 0" }}>{t('workspace.creditCol.details')}</th>
                      <th style={{ ...thBase, padding: "10px 12px 10px 0", width: 140 }}>{t('workspace.creditCol.user')}</th>
                      <th style={{ ...thBase, padding: "10px 12px 10px 0", width: 110 }}>{t('workspace.creditCol.amount')}</th>
                      <th style={{ ...thBase, padding: "10px 16px 10px 0", width: 160 }}>{t('workspace.creditTable.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: GRAY_40 }}>{t('common.table.noResults')}</td></tr>
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
                              <span style={{ fontSize: 11, fontWeight: 600, color: typeMeta[r.type].color }}>{creditTypeLabel(r.type)}</span>
                            </div>
                          </td>
                          {/* Description */}
                          <td style={{ ...tdBase, padding: "12px 12px 12px 0", borderBottom: brd }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>{r.desc}</span>
                            {r.type === "adminGrant" && r.expiryDate && (
                              <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>{t('workspace.credit.lot.expiryDate')}: {r.expiryDate}</div>
                            )}
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

    </PageContainer>
    {detailMember && <MemberDetailDrawer m={detailMember} onClose={() => setDetailMember(null)} />}
    {showCreditDetail && <CreditDetailDrawer lots={creditLots} onClose={() => setShowCreditDetail(false)} />}
    </>
  );
}

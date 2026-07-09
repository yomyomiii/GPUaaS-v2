import { useState } from "react";
import {
  Bell, HelpCircle, ChevronDown, LayoutDashboard, Server, FolderOpen,
  Database, Layers, Users, CreditCard, Settings, Activity, Image,
  Cpu, LogOut, User, Globe, ChevronRight, Wallet, BellRing, Package,
  ReceiptText, ShieldCheck, Mail, BarChart3
} from "lucide-react";

const PRIMARY = "#635ADC";
const PRIMARY_10 = "rgb(243,242,255)";
const PRIMARY_80 = "rgb(62,57,160)";
const GRAY_5 = "rgb(249,249,249)";
const GRAY_30 = "rgb(221,221,221)";
const GRAY_40 = "rgb(204,204,204)";
const GRAY_60 = "rgb(119,119,119)";
const GRAY_70 = "rgb(80,80,80)";
const GRAY_90 = "rgb(42,42,42)";
const RED = "rgb(239,68,68)";
const GREEN = "rgb(34,197,94)";
const BLUE = "rgb(36,142,213)";
const YELLOW = "rgb(255,177,68)";

export { PRIMARY, PRIMARY_10, PRIMARY_80, GRAY_5, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90, RED, GREEN, BLUE, YELLOW };

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  color?: "primary" | "success" | "danger" | "warning" | "info" | "neutral";
  variant?: "filled" | "outline";
  children: React.ReactNode;
}
export function Badge({ color = "neutral", variant = "filled", children }: BadgeProps) {
  const colorMap = {
    primary: { bg: PRIMARY_10, text: PRIMARY, border: PRIMARY },
    success: { bg: "rgb(240,253,244)", text: GREEN, border: GREEN },
    danger: { bg: "rgb(254,242,242)", text: RED, border: RED },
    warning: { bg: "rgb(255,251,235)", text: YELLOW, border: YELLOW },
    info: { bg: "rgb(211,232,247)", text: BLUE, border: BLUE },
    neutral: { bg: "rgb(249,249,249)", text: GRAY_70, border: GRAY_40 },
  };
  const c = colorMap[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      height: 22, padding: "0 8px", borderRadius: 9999,
      fontSize: 12, fontWeight: 500, lineHeight: 1,
      backgroundColor: variant === "filled" ? c.bg : "transparent",
      color: c.text,
      border: variant === "outline" ? `1px solid ${c.border}` : "none",
    }}>{children}</span>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
export function StatusDot({ status }: { status: "running" | "stopped" | "creating" | "error" }) {
  const colorMap = { running: GREEN, stopped: GRAY_40, creating: BLUE, error: RED };
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      backgroundColor: colorMap[status], marginRight: 6, flexShrink: 0,
    }} />
  );
}

// ─── GNB ──────────────────────────────────────────────────────────────────────
interface GNBProps {
  isAdmin?: boolean;
  workspace?: string;
  creditBalance?: number;
  onSwitchMode?: () => void;
  notifCount?: number;
}
export function GNB({ isAdmin, workspace = "My Workspace", creditBalance = 45230, onSwitchMode, notifCount = 3 }: GNBProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div style={{
      height: 40, backgroundColor: PRIMARY, display: "flex", alignItems: "center",
      padding: "0 20px", gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "white", fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>N</span>
        </div>
        <span style={{ color: "white", fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>NeuroStack</span>
      </div>

      {/* Admin badge */}
      {isAdmin && (
        <div style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 4, padding: "2px 8px", display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={12} color="white" />
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: 500 }}>Admin Console</span>
        </div>
      )}

      {/* Workspace switcher (user only) */}
      {!isAdmin && (
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          backgroundColor: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6,
          padding: "4px 10px", cursor: "pointer", color: "white",
        }}>
          <Layers size={14} color="rgba(255,255,255,0.8)" />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{workspace}</span>
          <ChevronDown size={13} color="rgba(255,255,255,0.7)" />
        </button>
      )}

      <div style={{ flex: 1 }} />

      {/* Credit balance (user only) */}
      {!isAdmin && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "3px 10px" }}>
          <CreditCard size={13} color="rgba(255,255,255,0.8)" />
          <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: 600 }}>
            {creditBalance.toLocaleString()} cr
          </span>
        </div>
      )}

      {/* Notification bell */}
      <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}>
        <Bell size={18} color="rgba(255,255,255,0.85)" />
        {notifCount > 0 && (
          <span style={{
            position: "absolute", top: 1, right: 1, width: 14, height: 14, borderRadius: "50%",
            backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color: "white",
          }}>{notifCount}</span>
        )}
      </button>

      {/* Help */}
      <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}>
        <HelpCircle size={18} color="rgba(255,255,255,0.85)" />
      </button>

      {/* Language */}
      <button style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
        <Globe size={14} color="rgba(255,255,255,0.8)" />
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 500 }}>KO</span>
      </button>

      {/* Avatar */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={14} color="white" />
          </div>
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 500 }}>admin@sdt.inc</span>
          <ChevronDown size={12} color="rgba(255,255,255,0.7)" />
        </button>
        {showUserMenu && (
          <div style={{
            position: "absolute", right: 0, top: 34, backgroundColor: "white", borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.14)", minWidth: 180, zIndex: 200, overflow: "hidden",
            border: "1px solid rgb(242,242,242)",
          }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgb(242,242,242)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>박선욱</div>
              <div style={{ fontSize: 12, color: GRAY_60 }}>admin@sdt.inc</div>
            </div>
            {[
              { icon: <User size={14} />, label: "내 프로필" },
              { icon: <Layers size={14} />, label: "내 워크스페이스" },
              { icon: <BellRing size={14} />, label: "알림 설정" },
            ].map(item => (
              <button key={item.label} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 14px",
                background: "none", border: "none", cursor: "pointer", fontSize: 13, color: GRAY_90,
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = GRAY_5)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span style={{ color: GRAY_60 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            {onSwitchMode && (
              <button onClick={onSwitchMode} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 14px",
                background: "none", border: "none", cursor: "pointer", fontSize: 13, color: PRIMARY,
                borderTop: "1px solid rgb(242,242,242)",
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = PRIMARY_10)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Settings size={14} />
                {isAdmin ? "사용자 콘솔로 전환" : "어드민 콘솔로 전환"}
              </button>
            )}
            <button style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 14px",
              background: "none", border: "none", cursor: "pointer", fontSize: 13, color: RED,
              borderTop: "1px solid rgb(242,242,242)",
            }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgb(254,242,242)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── User LNB ─────────────────────────────────────────────────────────────────
type UserScreen = "dashboard" | "workspace-overview" | "workspace-members" | "workspace-wallet"
  | "workspace-notifications" | "gallery" | "server-list" | "server-detail"
  | "storage-overview" | "storage-temp" | "storage-local" | "storage-shared";

interface UserLNBProps {
  active: UserScreen;
  onNav: (screen: UserScreen) => void;
}
export function UserLNB({ active, onNav }: UserLNBProps) {
  const [wsExpanded, setWsExpanded] = useState(true);
  const [storageExpanded, setStorageExpanded] = useState(true);

  const isWorkspaceActive = active.startsWith("workspace");
  const isStorageActive = active.startsWith("storage");

  const topItems = [
    { id: "dashboard" as UserScreen, icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  ];

  const workspaceSubs = [
    { id: "workspace-overview" as UserScreen, label: "Overview" },
    { id: "workspace-members" as UserScreen, label: "Members" },
    { id: "workspace-wallet" as UserScreen, label: "Wallet" },
    { id: "workspace-notifications" as UserScreen, label: "Notifications" },
  ];

  const storageSubs = [
    { id: "storage-overview" as UserScreen, label: "Overview" },
    { id: "storage-temp" as UserScreen, label: "Temporary Storage" },
    { id: "storage-local" as UserScreen, label: "Local Storage" },
    { id: "storage-shared" as UserScreen, label: "Shared Storage" },
  ];

  const navItemStyle = (isActive: boolean) => ({
    display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 12px",
    borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? PRIMARY_10 : "transparent",
    color: isActive ? PRIMARY : GRAY_90,
    border: "none", textAlign: "left" as const, transition: "background 0.1s ease",
  });

  const subItemStyle = (isActive: boolean) => ({
    display: "block", width: "100%", padding: "7px 12px 7px 36px",
    borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? PRIMARY_10 : "transparent",
    color: isActive ? PRIMARY : GRAY_70,
    border: "none", textAlign: "left" as const, transition: "background 0.1s ease",
  });

  return (
    <div style={{
      width: 220, backgroundColor: "white", borderRight: `1px solid rgb(242,242,242)`,
      display: "flex", flexDirection: "column", padding: "12px 8px", gap: 2, flexShrink: 0,
      overflowY: "auto",
    }}>
      {topItems.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} style={navItemStyle(active === item.id)}
          onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.backgroundColor = GRAY_5; }}
          onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.backgroundColor = "transparent"; }}>
          <span style={{ color: active === item.id ? PRIMARY : GRAY_60 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* Workspace */}
      <div
        onClick={() => setWsExpanded(!wsExpanded)}
        style={{ ...navItemStyle(false), justifyContent: "space-between", cursor: "default" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = GRAY_5; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ color: isWorkspaceActive ? PRIMARY : GRAY_60 }}><Layers size={16} /></span>
          <span style={{ color: isWorkspaceActive ? PRIMARY : GRAY_90, fontWeight: isWorkspaceActive ? 600 : 400 }}>Workspace</span>
        </span>
        <ChevronDown size={13} color={GRAY_60} style={{ transform: wsExpanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
      </div>
      {wsExpanded && workspaceSubs.map(sub => (
        <button key={sub.id} onClick={() => onNav(sub.id)} style={subItemStyle(active === sub.id)}
          onMouseEnter={e => { if (active !== sub.id) e.currentTarget.style.backgroundColor = GRAY_5; }}
          onMouseLeave={e => { if (active !== sub.id) e.currentTarget.style.backgroundColor = "transparent"; }}>
          {sub.label}
        </button>
      ))}

      {/* Gallery */}
      <button onClick={() => onNav("gallery")} style={navItemStyle(active === "gallery")}
        onMouseEnter={e => { if (active !== "gallery") e.currentTarget.style.backgroundColor = GRAY_5; }}
        onMouseLeave={e => { if (active !== "gallery") e.currentTarget.style.backgroundColor = "transparent"; }}>
        <span style={{ color: active === "gallery" ? PRIMARY : GRAY_60 }}><Image size={16} /></span>
        Gallery
      </button>

      {/* Server */}
      <button onClick={() => onNav(active === "server-detail" ? "server-detail" : "server-list")} style={navItemStyle(active === "server-list" || active === "server-detail")}
        onMouseEnter={e => { if (active !== "server-list" && active !== "server-detail") e.currentTarget.style.backgroundColor = GRAY_5; }}
        onMouseLeave={e => { if (active !== "server-list" && active !== "server-detail") e.currentTarget.style.backgroundColor = "transparent"; }}>
        <span style={{ color: (active === "server-list" || active === "server-detail") ? PRIMARY : GRAY_60 }}><Server size={16} /></span>
        Server
      </button>

      {/* Storage */}
      <div
        onClick={() => setStorageExpanded(!storageExpanded)}
        style={{ ...navItemStyle(false), justifyContent: "space-between", cursor: "default" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = GRAY_5; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ color: isStorageActive ? PRIMARY : GRAY_60 }}><Database size={16} /></span>
          <span style={{ color: isStorageActive ? PRIMARY : GRAY_90, fontWeight: isStorageActive ? 600 : 400 }}>Storage</span>
        </span>
        <ChevronDown size={13} color={GRAY_60} style={{ transform: storageExpanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
      </div>
      {storageExpanded && storageSubs.map(sub => (
        <button key={sub.id} onClick={() => onNav(sub.id)} style={subItemStyle(active === sub.id)}
          onMouseEnter={e => { if (active !== sub.id) e.currentTarget.style.backgroundColor = GRAY_5; }}
          onMouseLeave={e => { if (active !== sub.id) e.currentTarget.style.backgroundColor = "transparent"; }}>
          {sub.label}
        </button>
      ))}
    </div>
  );
}

// ─── Admin LNB ────────────────────────────────────────────────────────────────
type AdminScreen = "admin-dashboard" | "admin-users" | "admin-workspaces" | "admin-servers"
  | "admin-storage" | "admin-storage-pricing" | "admin-images" | "admin-categories"
  | "admin-templates" | "admin-tiers" | "admin-gpu-types" | "admin-gpu-pricing"
  | "admin-credits" | "admin-credit-products" | "admin-payments" | "admin-refunds"
  | "admin-notif-templates" | "admin-notif-thresholds" | "admin-notif-email"
  | "admin-settings-auth" | "admin-settings-terms" | "admin-settings-storage-integration";

export type { UserScreen, AdminScreen };

interface AdminLNBProps {
  active: AdminScreen;
  onNav: (screen: AdminScreen) => void;
}

export function AdminLNB({ active, onNav }: AdminLNBProps) {
  const [storageExp, setStorageExp] = useState(true);
  const [imageExp, setImageExp] = useState(false);
  const [gpuExp, setGpuExp] = useState(false);
  const [creditExp, setCreditExp] = useState(false);
  const [paymentExp, setPaymentExp] = useState(false);
  const [notifExp, setNotifExp] = useState(false);
  const [settingsExp, setSettingsExp] = useState(false);

  const navItemStyle = (isActive: boolean) => ({
    display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 12px",
    borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? PRIMARY_10 : "transparent",
    color: isActive ? PRIMARY : GRAY_90,
    border: "none", textAlign: "left" as const, transition: "background 0.1s ease",
  });

  const subItemStyle = (isActive: boolean) => ({
    display: "block", width: "100%", padding: "6px 12px 6px 32px",
    borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? PRIMARY_10 : "transparent",
    color: isActive ? PRIMARY : GRAY_70,
    border: "none", textAlign: "left" as const, transition: "background 0.1s ease",
  });

  const SectionHeader = ({ icon, label, active: isAct, expanded, onClick }: any) => (
    <div onClick={onClick} style={{ ...navItemStyle(false), justifyContent: "space-between", cursor: "default" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = GRAY_5; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
      <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ color: isAct ? PRIMARY : GRAY_60 }}>{icon}</span>
        <span style={{ color: isAct ? PRIMARY : GRAY_90, fontWeight: isAct ? 600 : 400 }}>{label}</span>
      </span>
      <ChevronDown size={12} color={GRAY_60} style={{ transform: expanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
    </div>
  );

  const NavItem = ({ id, icon, label }: { id: AdminScreen; icon: React.ReactNode; label: string }) => (
    <button onClick={() => onNav(id)} style={navItemStyle(active === id)}
      onMouseEnter={e => { if (active !== id) e.currentTarget.style.backgroundColor = GRAY_5; }}
      onMouseLeave={e => { if (active !== id) e.currentTarget.style.backgroundColor = "transparent"; }}>
      <span style={{ color: active === id ? PRIMARY : GRAY_60 }}>{icon}</span>
      {label}
    </button>
  );

  const SubItem = ({ id, label }: { id: AdminScreen; label: string }) => (
    <button onClick={() => onNav(id)} style={subItemStyle(active === id)}
      onMouseEnter={e => { if (active !== id) e.currentTarget.style.backgroundColor = GRAY_5; }}
      onMouseLeave={e => { if (active !== id) e.currentTarget.style.backgroundColor = "transparent"; }}>
      {label}
    </button>
  );

  return (
    <div style={{
      width: 220, backgroundColor: "white", borderRight: `1px solid rgb(242,242,242)`,
      display: "flex", flexDirection: "column", padding: "12px 8px", gap: 1, flexShrink: 0,
      overflowY: "auto",
    }}>
      <NavItem id="admin-dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
      <NavItem id="admin-users" icon={<Users size={16} />} label="User Management" />
      <NavItem id="admin-workspaces" icon={<Layers size={16} />} label="Workspace Management" />
      <NavItem id="admin-servers" icon={<Server size={16} />} label="Server Management" />

      {/* Storage Management */}
      <SectionHeader icon={<Database size={16} />} label="Storage Management"
        active={active.startsWith("admin-storage")} expanded={storageExp}
        onClick={() => { setStorageExp(!storageExp); }} />
      {storageExp && <>
        <SubItem id="admin-storage" label="All Storages" />
        <SubItem id="admin-storage-pricing" label="Pricing Policy" />
      </>}

      {/* Image Management */}
      <SectionHeader icon={<Image size={16} />} label="Image Management"
        active={active.startsWith("admin-images") || active.startsWith("admin-categories") || active.startsWith("admin-templates") || active === "admin-tiers"}
        expanded={imageExp} onClick={() => setImageExp(!imageExp)} />
      {imageExp && <>
        <SubItem id="admin-images" label="Server Images" />
        <SubItem id="admin-categories" label="Categories" />
        <SubItem id="admin-templates" label="Server Templates" />
        <SubItem id="admin-tiers" label="Tier 관리" />
      </>}

      {/* GPU Type Management */}
      <SectionHeader icon={<Cpu size={16} />} label="GPU Type Management"
        active={active.startsWith("admin-gpu")} expanded={gpuExp}
        onClick={() => setGpuExp(!gpuExp)} />
      {gpuExp && <>
        <SubItem id="admin-gpu-types" label="GPU Type & Nodes" />
        <SubItem id="admin-gpu-pricing" label="GPU Type Pricing" />
      </>}

      {/* Credit Management */}
      <SectionHeader icon={<CreditCard size={16} />} label="Credit Management"
        active={active.startsWith("admin-credit")} expanded={creditExp}
        onClick={() => setCreditExp(!creditExp)} />
      {creditExp && <>
        <SubItem id="admin-credits" label="Credit Grants" />
        <SubItem id="admin-credit-products" label="Credit Products" />
      </>}

      {/* Payment History */}
      <SectionHeader icon={<ReceiptText size={16} />} label="Payment History"
        active={active.startsWith("admin-payment") || active.startsWith("admin-refund")}
        expanded={paymentExp} onClick={() => setPaymentExp(!paymentExp)} />
      {paymentExp && <>
        <SubItem id="admin-payments" label="History" />
        <SubItem id="admin-refunds" label="Refund Management" />
      </>}

      {/* Notification Management */}
      <SectionHeader icon={<BellRing size={16} />} label="Notification Mgmt"
        active={active.startsWith("admin-notif")} expanded={notifExp}
        onClick={() => setNotifExp(!notifExp)} />
      {notifExp && <>
        <SubItem id="admin-notif-templates" label="Template Management" />
        <SubItem id="admin-notif-thresholds" label="Threshold Management" />
        <SubItem id="admin-notif-email" label="Email Sender Settings" />
      </>}

      {/* System Settings */}
      <SectionHeader icon={<Settings size={16} />} label="System Settings"
        active={active.startsWith("admin-settings")} expanded={settingsExp}
        onClick={() => setSettingsExp(!settingsExp)} />
      {settingsExp && <>
        <SubItem id="admin-settings-auth" label="Auth Settings" />
        <SubItem id="admin-settings-terms" label="Terms Management" />
        <SubItem id="admin-settings-storage-integration" label="Internal Storage Integration" />
      </>}
    </div>
  );
}

// ─── Page Container ───────────────────────────────────────────────────────────
export function PageContainer({ title, subtitle, actions, children }: {
  title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: GRAY_90, margin: 0, lineHeight: 1.4 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 14, color: GRAY_60, margin: "4px 0 0", lineHeight: 1.5 }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick, hover }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; hover?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "white", borderRadius: 14,
        boxShadow: hovered && hover ? "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)" : "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.15s ease",
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, size = "medium", variant = "primary", style: extraStyle }: {
  children: React.ReactNode; onClick?: () => void;
  size?: "medium" | "small" | "xsmall";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const sizeMap = {
    medium: { height: 44, padding: "0 20px", fontSize: 14, radius: 12, fontWeight: 600 },
    small: { height: 36, padding: "0 16px", fontSize: 13, radius: 10, fontWeight: 600 },
    xsmall: { height: 28, padding: "0 12px", fontSize: 12, radius: 8, fontWeight: 500 },
  };
  const s = sizeMap[size];
  const variantMap = {
    primary: { bg: hovered ? PRIMARY_80 : PRIMARY, color: "white", border: "none" },
    secondary: { bg: hovered ? "rgb(242,242,242)" : "white", color: GRAY_90, border: `1px solid ${GRAY_30}` },
    ghost: { bg: hovered ? GRAY_5 : "transparent", color: GRAY_70, border: "none" },
    danger: { bg: hovered ? "rgb(220,38,38)" : RED, color: "white", border: "none" },
  };
  const v = variantMap[variant];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: s.height, padding: s.padding, fontSize: s.fontSize, fontWeight: s.fontWeight,
        borderRadius: s.radius, backgroundColor: v.bg, color: v.color, border: v.border,
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
        transition: "background 0.1s ease", fontFamily: "inherit", whiteSpace: "nowrap",
        ...extraStyle,
      }}>
      {children}
    </button>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, icon, color = PRIMARY, trend }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
  color?: string; trend?: { up: boolean; text: string };
}) {
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: GRAY_60, fontWeight: 500 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: GRAY_60, marginTop: 6 }}>{sub}</div>}
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: trend.up ? GREEN : RED, fontWeight: 500 }}>
            {trend.up ? "↑" : "↓"} {trend.text}
          </span>
        </div>
      )}
    </Card>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────────
export function Table({ headers, rows, onRowClick }: {
  headers: string[];
  rows: React.ReactNode[][];
  onRowClick?: (i: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: GRAY_5 }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left", borderBottom: `1px solid rgb(242,242,242)`, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}
              onClick={() => onRowClick?.(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                backgroundColor: hovered === i ? "rgba(99,90,220,0.025)" : "white",
                cursor: onRowClick ? "pointer" : "default",
                transition: "background 0.1s",
              }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "12px 16px", fontSize: 13, color: GRAY_90, borderBottom: `1px solid rgb(242,242,242)` }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }: {
  tabs: string[]; active: string; onChange: (tab: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid rgb(242,242,242)`, marginBottom: 24 }}>
      {tabs.map(tab => {
        const isActive = tab === active;
        return (
          <button key={tab} onClick={() => onChange(tab)} style={{
            padding: "10px 16px", fontSize: 14, fontWeight: isActive ? 600 : 400,
            color: isActive ? PRIMARY : GRAY_60, background: "none", border: "none",
            borderBottom: isActive ? `2px solid ${PRIMARY}` : "2px solid transparent",
            cursor: "pointer", transition: "color 0.1s, border-color 0.1s", marginBottom: -1,
          }}>
            {tab}
          </button>
        );
      })}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import {
  Bell, HelpCircle, ChevronDown, LayoutDashboard, Server, FolderOpen,
  Database, Layers, Users, CreditCard, Settings, Activity, Image,
  Cpu, LogOut, User, Globe, ChevronRight, Wallet, BellRing, Package,
  ReceiptText, ShieldCheck, Mail, BarChart3, ArrowLeftRight
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_20, PRIMARY_80,
  GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, GREEN, BLUE, YELLOW,
  RADIUS_CARD, RADIUS_LG, RADIUS_XL, RADIUS_MD, RADIUS_SM, RADIUS_FULL,
  SHADOW_CARD, SHADOW_CARD_HOVER, SHADOW_DROPDOWN,
  TRANSITION_FAST, TRANSITION_NORMAL,
  GNB_HEIGHT, LNB_WIDTH, PAGE_MAX_WIDTH, PAGE_PADDING,
  BTN_SIZES, Z_GNB, Z_DROPDOWN,
} from "../../styles/tokens";

export {
  PRIMARY, PRIMARY_10, PRIMARY_20, PRIMARY_80,
  GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, GREEN, BLUE, YELLOW,
};

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeColor = "primary" | "success" | "danger" | "warning" | "info" | "neutral";
interface BadgeProps {
  color?: BadgeColor;
  variant?: "filled" | "outline";
  children: React.ReactNode;
}
export function Badge({ color = "neutral", variant = "filled", children }: BadgeProps) {
  const colorMap = {
    primary: { bg: PRIMARY_10, text: PRIMARY, border: PRIMARY },
    success: { bg: "rgb(240,253,244)", text: GREEN, border: GREEN },
    danger:  { bg: "rgb(254,242,242)", text: RED, border: RED },
    warning: { bg: "rgb(255,251,235)", text: YELLOW, border: YELLOW },
    info:    { bg: "rgb(211,232,247)", text: BLUE, border: BLUE },
    neutral: { bg: "rgb(249,249,249)", text: GRAY_70, border: GRAY_40 },
  };
  const c = colorMap[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      height: 20, padding: "0 7px", borderRadius: 99,
      fontSize: 11, fontWeight: 600, lineHeight: 1,
      backgroundColor: variant === "filled" ? c.bg : "transparent",
      color: c.text,
      border: `1px solid ${variant === "outline" ? c.border : c.border + "40"}`,
      whiteSpace: "nowrap" as const,
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);

  return (
    <div style={{
      height: GNB_HEIGHT, backgroundColor: PRIMARY, display: "flex", alignItems: "center",
      padding: "0 20px", gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: Z_GNB,
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
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={14} color="white" />
          </div>
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 500 }}>yeomeyeom.ji@sdt.inc</span>
          <ChevronDown size={12} color="rgba(255,255,255,0.7)" />
        </button>
        {showUserMenu && (
          <div style={{
            position: "absolute", right: 0, top: "100%", marginTop: 6, backgroundColor: "white", borderRadius: RADIUS_LG,
            boxShadow: SHADOW_DROPDOWN, minWidth: 200, zIndex: Z_DROPDOWN, overflow: "hidden",
            border: `1px solid ${GRAY_10}`,
          }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${GRAY_10}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>지염염</div>
              <div style={{ fontSize: 12, color: GRAY_60 }}>yeomeyeom.ji@sdt.inc</div>
            </div>
            {[
              { icon: <User size={14} />, label: "내 프로필" },
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
                borderTop: `1px solid ${GRAY_10}`,
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
              borderTop: `1px solid ${GRAY_10}`,
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
type UserScreen = "dashboard" | "workspace-overview" | "workspace-members" | "workspace-credit"
  | "workspace-settings" | "server-list" | "server-detail"
  | "storage"
  | "notifications";

interface UserLNBProps {
  active: UserScreen;
  onNav: (screen: UserScreen) => void;
  unreadCount?: number;
  onSwitchMode?: () => void;
}
export function UserLNB({ active, onNav, unreadCount = 0, onSwitchMode }: UserLNBProps) {
  const [wsExpanded, setWsExpanded] = useState(true);

  const isWorkspaceActive = active.startsWith("workspace");
  const isStorageActive = active === "storage";

  const topItems = [
    { id: "dashboard" as UserScreen, icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  ];

  const workspaceSubs = [
    { id: "workspace-overview" as UserScreen, label: "Overview" },
    { id: "workspace-members" as UserScreen, label: "Members" },
    { id: "workspace-credit" as UserScreen, label: "Credit" },
    { id: "workspace-settings" as UserScreen, label: "Settings" },
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
      width: LNB_WIDTH, backgroundColor: "white", borderRight: `1px solid ${GRAY_10}`,
      display: "flex", flexDirection: "column", padding: "12px 8px", gap: 2, flexShrink: 0,
      overflowY: "auto",
    }}>
      {/* 워크스페이스 전환 */}
      <button style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "12px 12px", borderRadius: 10, marginBottom: 10,
        border: `1px solid ${GRAY_10}`, backgroundColor: GRAY_5,
        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; e.currentTarget.style.borderColor = PRIMARY; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = GRAY_5; e.currentTarget.style.borderColor = GRAY_10; }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, backgroundColor: PRIMARY_10,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Layers size={16} color={PRIMARY} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: GRAY_60, fontWeight: 500, marginBottom: 2 }}>현재 워크스페이스</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>My Workspace</div>
        </div>
        <ChevronDown size={14} color={GRAY_60} />
      </button>

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



      {/* Server */}
      <button onClick={() => onNav(active === "server-detail" ? "server-detail" : "server-list")} style={navItemStyle(active === "server-list" || active === "server-detail")}
        onMouseEnter={e => { if (active !== "server-list" && active !== "server-detail") e.currentTarget.style.backgroundColor = GRAY_5; }}
        onMouseLeave={e => { if (active !== "server-list" && active !== "server-detail") e.currentTarget.style.backgroundColor = "transparent"; }}>
        <span style={{ color: (active === "server-list" || active === "server-detail") ? PRIMARY : GRAY_60 }}><Server size={16} /></span>
        Server
      </button>

      {/* Storage */}
      <button onClick={() => onNav("storage")} style={navItemStyle(isStorageActive)}
        onMouseEnter={e => { if (!isStorageActive) e.currentTarget.style.backgroundColor = GRAY_5; }}
        onMouseLeave={e => { if (!isStorageActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
        <span style={{ color: isStorageActive ? PRIMARY : GRAY_60 }}><Database size={16} /></span>
        Storage
      </button>

      {/* Notifications */}
      <button onClick={() => onNav("notifications")} style={navItemStyle(active === "notifications")}
        onMouseEnter={e => { if (active !== "notifications") e.currentTarget.style.backgroundColor = GRAY_5; }}
        onMouseLeave={e => { if (active !== "notifications") e.currentTarget.style.backgroundColor = "transparent"; }}>
        <span style={{ color: active === "notifications" ? PRIMARY : GRAY_60 }}><BellRing size={16} /></span>
        <span style={{ flex: 1 }}>Notifications</span>
        {unreadCount > 0 && (
          <span style={{
            backgroundColor: "rgb(220,38,38)", color: "white", fontSize: 10, fontWeight: 700,
            borderRadius: 999, padding: "1px 6px", lineHeight: "16px", minWidth: 18, textAlign: "center",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 하단 프로필 + 콘솔 전환 */}
      <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${GRAY_10}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <User size={13} color={PRIMARY} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>이지연</div>
            <div style={{ fontSize: 11, color: GRAY_60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>sjlee@sdt.inc</div>
          </div>
        </div>
        {onSwitchMode && (
          <button onClick={onSwitchMode} style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
            borderRadius: 8, border: "none", backgroundColor: "transparent",
            cursor: "pointer", fontSize: 12, fontWeight: 500, color: GRAY_60, transition: "all 0.1s",
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; e.currentTarget.style.color = GRAY_90; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GRAY_60; }}>
            <ArrowLeftRight size={13} />
            <span>Admin Console로 전환</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Admin LNB ────────────────────────────────────────────────────────────────
type AdminScreen = "admin-dashboard" | "admin-users" | "admin-workspaces" | "admin-servers"
  | "admin-storage" | "admin-storage-pricing" | "admin-storage-policy" | "admin-images" | "admin-categories"
  | "admin-templates" | "admin-tiers" | "admin-gpu-types" | "admin-gpu-pricing"
  | "admin-credits" | "admin-credit-history"
  | "admin-notif" | "admin-notif-settings"
  | "admin-settings-auth" | "admin-settings-terms" | "admin-settings-storage-integration";

export type { UserScreen, AdminScreen };

interface AdminLNBProps {
  active: AdminScreen;
  onNav: (screen: AdminScreen) => void;
  onSwitchMode?: () => void;
  disabledMenus?: Set<string>;
}

export function AdminLNB({ active, onNav, onSwitchMode, disabledMenus = new Set() }: AdminLNBProps) {
  const [storageExp, setStorageExp] = useState(true);
  const [serverExp, setServerExp] = useState(false);
  const [imageExp, setImageExp] = useState(false);
  const [gpuExp, setGpuExp] = useState(false);
  const [creditExp, setCreditExp] = useState(active.startsWith("admin-credit"));
  const [notifExp, setNotifExp] = useState(active.startsWith("admin-notif"));


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
      width: LNB_WIDTH, backgroundColor: "white", borderRight: `1px solid ${GRAY_10}`,
      display: "flex", flexDirection: "column", padding: "12px 8px", gap: 1, flexShrink: 0,
      overflowY: "auto",
    }}>
      <NavItem id="admin-dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
      {/* User Management */}
      <div style={{ opacity: disabledMenus.has("admin-users") ? 0.35 : 1, pointerEvents: disabledMenus.has("admin-users") ? "none" : "auto" }}>
        <NavItem id="admin-users" icon={<Users size={16} />} label="User Management" />
      </div>
      {/* Workspace Management */}
      <div style={{ opacity: disabledMenus.has("admin-workspaces") ? 0.35 : 1, pointerEvents: disabledMenus.has("admin-workspaces") ? "none" : "auto" }}>
        <NavItem id="admin-workspaces" icon={<Layers size={16} />} label="Workspace Management" />
      </div>
      {/* Server Management */}
      <div style={{ opacity: disabledMenus.has("admin-servers") ? 0.35 : 1, pointerEvents: disabledMenus.has("admin-servers") ? "none" : "auto" }}>
        <SectionHeader icon={<Server size={16} />} label="Server Management"
          active={active === "admin-servers" || active === "admin-templates"}
          expanded={serverExp} onClick={() => setServerExp(!serverExp)} />
        {serverExp && <>
          <SubItem id="admin-servers" label="Servers" />
          <SubItem id="admin-templates" label="Server Templates" />
        </>}

      </div>
      {/* Storage Management */}
      <div style={{ opacity: disabledMenus.has("admin-storage") ? 0.35 : 1, pointerEvents: disabledMenus.has("admin-storage") ? "none" : "auto" }}>
        <SectionHeader icon={<Database size={16} />} label="Storage Management"
          active={active.startsWith("admin-storage")} expanded={storageExp}
          onClick={() => { setStorageExp(!storageExp); }} />
        {storageExp && <>
          <SubItem id="admin-storage" label="Storage" />
          <SubItem id="admin-storage-pricing" label="Storage Pricing" />
          <SubItem id="admin-storage-policy" label="Storage Policy" />
        </>}
      </div>
      {/* Image Management */}
      <div style={{ opacity: disabledMenus.has("admin-images") ? 0.35 : 1, pointerEvents: disabledMenus.has("admin-images") ? "none" : "auto" }}>
        <SectionHeader icon={<Image size={16} />} label="Image Management"
          active={active.startsWith("admin-images") || active.startsWith("admin-categories") || active === "admin-tiers"}
          expanded={imageExp} onClick={() => setImageExp(!imageExp)} />
        {imageExp && <>
          <SubItem id="admin-images" label="Image" />
          <SubItem id="admin-categories" label="Category" />
          <SubItem id="admin-tiers" label="Tier" />
        </>}
      </div>
      {/* GPU Type Management */}
      <div style={{ opacity: disabledMenus.has("admin-gpu") ? 0.35 : 1, pointerEvents: disabledMenus.has("admin-gpu") ? "none" : "auto" }}>
        <SectionHeader icon={<Cpu size={16} />} label="GPU Type Management"
          active={active.startsWith("admin-gpu")} expanded={gpuExp}
          onClick={() => setGpuExp(!gpuExp)} />
        {gpuExp && <>
          <SubItem id="admin-gpu-types" label="GPU Type" />
          <SubItem id="admin-gpu-pricing" label="GPU Type Pricing" />
        </>}
      </div>
      {/* Credit */}
      <div style={{ opacity: disabledMenus.has("admin-credits") ? 0.35 : 1, pointerEvents: disabledMenus.has("admin-credits") ? "none" : "auto" }}>
        <SectionHeader icon={<CreditCard size={16} />} label="Credit Management"
          active={active.startsWith("admin-credit")} expanded={creditExp}
          onClick={() => setCreditExp(!creditExp)} />
        {creditExp && <>
          <SubItem id="admin-credits"        label="Credit" />
          <SubItem id="admin-credit-history" label="Credit History" />
        </>}
      </div>
      {/* Notification Management */}
      <div style={{ opacity: disabledMenus.has("admin-notif") ? 0.35 : 1, pointerEvents: disabledMenus.has("admin-notif") ? "none" : "auto" }}>
        <SectionHeader icon={<BellRing size={16} />} label="Notification Management"
          active={active.startsWith("admin-notif")} expanded={notifExp}
          onClick={() => setNotifExp(!notifExp)} />
        {notifExp && <>
          <SubItem id="admin-notif"          label="Notification" />
          <SubItem id="admin-notif-settings" label="Notification Settings" />
        </>}
      </div>
      {/* System Settings */}
      <NavItem id="admin-settings-auth" icon={<Settings size={16} />} label="System Settings" />

      {/* 하단 프로필 + 콘솔 전환 */}
      <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${GRAY_10}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <User size={13} color={PRIMARY} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>지염염</div>
            <div style={{ fontSize: 11, color: GRAY_60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>yeomeyeom.ji@sdt.inc</div>
          </div>
        </div>
        {onSwitchMode && (
          <button onClick={onSwitchMode} style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
            borderRadius: 8, border: "none", backgroundColor: "transparent",
            cursor: "pointer", fontSize: 12, fontWeight: 500, color: GRAY_60, transition: "all 0.1s",
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; e.currentTarget.style.color = GRAY_90; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GRAY_60; }}>
            <ArrowLeftRight size={13} />
            <span>User Console로 전환</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page Container ───────────────────────────────────────────────────────────
export function PageContainer({ title, subtitle, actions, children }: {
  title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: PAGE_PADDING }}>
      <div style={{ maxWidth: PAGE_MAX_WIDTH }}>
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
export function Card({ children, style, onClick, hover }: {
  children: React.ReactNode; style?: React.CSSProperties;
  onClick?: () => void; hover?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "white", borderRadius: RADIUS_CARD,
        boxShadow: hovered && hover ? SHADOW_CARD_HOVER : SHADOW_CARD,
        cursor: onClick ? "pointer" : "default",
        transition: `box-shadow ${TRANSITION_NORMAL}`,
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
  const sizeMap = BTN_SIZES;
  const s = sizeMap[size];
  const variantMap = {
    primary:   { bg: hovered ? PRIMARY_80 : PRIMARY, color: "white", border: "none" },
    secondary: { bg: hovered ? "rgb(242,242,242)" : "white", color: GRAY_90, border: `1px solid ${GRAY_30}` },
    ghost:     { bg: hovered ? GRAY_5 : "transparent", color: GRAY_70, border: "none" },
    danger:    { bg: hovered ? "rgb(220,38,38)" : RED, color: "white", border: "none" },
  };
  const v = variantMap[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: s.height, padding: s.padding, fontSize: s.fontSize, fontWeight: s.fontWeight,
        borderRadius: s.radius, backgroundColor: v.bg, color: v.color, border: v.border,
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
        transition: `background ${TRANSITION_FAST}`, fontFamily: "inherit", whiteSpace: "nowrap",
        ...extraStyle,
      }}>
      {children}
    </button>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, icon, color = PRIMARY, trend }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
  color?: string; trend?: { up: boolean; text: string };
}) {
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: GRAY_60, fontWeight: 500 }}>{label}</span>
        <div style={{ position: "relative", width: 36, height: 36, borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: color, opacity: 0.12 }} />
          <span style={{ color, position: "relative" }}>{icon}</span>
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

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ headers, rows, onRowClick, colWidths, spacerGaps }: {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  onRowClick?: (i: number) => void;
  colWidths?: string[];
  spacerGaps?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const n = headers.length;

  if (spacerGaps) {
    const thStyle = (i: number): React.CSSProperties => ({
      width: "1px", whiteSpace: "nowrap",
      padding: i === 0 ? "10px 0 10px 16px" : i === n - 1 ? "10px 16px 10px 0" : "10px 0",
      fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left",
      borderBottom: `1px solid ${GRAY_10}`,
    });
    const tdStyle = (j: number): React.CSSProperties => ({
      width: "1px",
      padding: j === 0 ? "12px 0 12px 16px" : j === n - 1 ? "12px 16px 12px 0" : "12px 0",
      fontSize: 13, color: GRAY_90, borderBottom: `1px solid ${GRAY_10}`,
    });
    const spacerThStyle: React.CSSProperties = { borderBottom: `1px solid ${GRAY_10}` };
    const spacerTdStyle = (i: number): React.CSSProperties => ({
      borderBottom: `1px solid ${GRAY_10}`,
      backgroundColor: hovered === i ? "rgba(99,90,220,0.025)" : "white",
    });
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: GRAY_5 }}>
              {headers.map((h, i) => (
                <React.Fragment key={i}>
                  <th style={thStyle(i)}>{h}</th>
                  {i < n - 1 && <th style={spacerThStyle} />}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}
                onClick={() => onRowClick?.(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: onRowClick ? "pointer" : "default", transition: "background 0.1s" }}>
                {row.map((cell, j) => (
                  <React.Fragment key={j}>
                    <td style={{ ...tdStyle(j), backgroundColor: hovered === i ? "rgba(99,90,220,0.025)" : "white" }}>{cell}</td>
                    {j < n - 1 && <td style={spacerTdStyle(i)} />}
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: colWidths && colWidths.length === headers.length ? "fixed" : "auto" }}>
        {colWidths && (
          <colgroup>
            {headers.map((_, i) => <col key={i} style={i < colWidths.length ? { width: colWidths[i] } : {}} />)}
          </colgroup>
        )}
        <thead>
          <tr style={{ backgroundColor: GRAY_5 }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: i === 0 ? "10px 12px 10px 16px" : i === headers.length - 1 ? "10px 16px 10px 20px" : "10px 12px", ...(i === headers.length - 1 ? { width: "1px", whiteSpace: "nowrap" as const } : {}), fontSize: 12, fontWeight: 600, color: GRAY_60, textAlign: "left", borderBottom: `1px solid ${GRAY_10}`, whiteSpace: "nowrap" }}>
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
                <td key={j} style={{ padding: j === 0 ? "12px 12px 12px 16px" : j === row.length - 1 ? "12px 16px 12px 20px" : "12px 12px", fontSize: 13, color: GRAY_90, borderBottom: `1px solid ${GRAY_10}` }}>
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

// ─── Card Variants ────────────────────────────────────────────────────────────
// SectionCard: titled card with header separator + padded body
export function SectionCard({ title, subtitle, action, children, style, bodyStyle, headerStyle }: {
  title?: string; subtitle?: string; action?: React.ReactNode;
  children: React.ReactNode; style?: React.CSSProperties; bodyStyle?: React.CSSProperties; headerStyle?: React.CSSProperties;
}) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%", ...style }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: `1px solid ${GRAY_10}`, flexShrink: 0, ...headerStyle,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: GRAY_90 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: "20px 24px", flex: 1, ...bodyStyle }}>{children}</div>
    </Card>
  );
}

// ListCard: table/feed card — header only, children fill full width (no body padding)
export function ListCard({ title, action, children, style }: {
  title?: string; action?: React.ReactNode;
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <Card style={{ overflow: "hidden", ...style }}>
      {(title || action) && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: `1px solid ${GRAY_10}`,
        }}>
          {title && <div style={{ fontSize: 14, fontWeight: 600, color: GRAY_90 }}>{title}</div>}
          {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
        </div>
      )}
      {children}
    </Card>
  );
}

// StatCard: compact KPI/number card
export function StatCard({ label, value, sub, color, icon, style }: {
  label: string; value: string | number; sub?: string;
  color?: string; icon?: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <Card style={{ padding: "16px 20px", ...style }}>
      {icon && <div style={{ marginBottom: 8 }}>{icon}</div>}
      <div style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: GRAY_60, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color ?? PRIMARY, marginTop: 3, fontWeight: 500 }}>{sub}</div>}
    </Card>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }: {
  tabs: string[]; active: string; onChange: (tab: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${GRAY_10}`, marginBottom: 24 }}>
      {tabs.map(tab => {
        const isActive = tab === active;
        return (
          <button key={tab} onClick={() => onChange(tab)} style={{
            padding: "10px 16px", fontSize: 14, fontWeight: isActive ? 600 : 400,
            color: isActive ? PRIMARY : GRAY_60, background: "none", border: "none",
            borderBottom: isActive ? `2px solid ${PRIMARY}` : "2px solid transparent",
            cursor: "pointer", transition: `color ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}`, marginBottom: -1,
          }}>
            {tab}
          </button>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { GNB, UserLNB, AdminLNB, type UserScreen, type AdminScreen } from "./components/ConsoleLayout";
import { UserDashboard } from "./components/UserDashboard";
import { WorkspacePage } from "./components/WorkspacePage";
import { ServerPage } from "./components/ServerPage";
import { StoragePage } from "./components/StoragePage";
import {
  AdminDashboard,
  AdminUserManagement,
  AdminWorkspaceManagement,
  AdminWorkspaceDetail,
  AdminServerManagement,
  AdminGPUManagement,
  AdminImageManagement,
  AdminCreditManagement,
  AdminStorageManagement,
  AdminSystemSettings,
  AdminAuditLog,
} from "./components/AdminConsole";
import "../styles/fonts.css";

export default function App() {
  const [mode, setMode] = useState<"user" | "admin">("user");

  // ─── User Console State ────────────────────────────────────────────────────
  const [userScreen, setUserScreen] = useState<UserScreen>("dashboard");
  const [workspaceTab, setWorkspaceTab] = useState("Overview");

  // ─── Admin Console State ───────────────────────────────────────────────────
  const [adminScreen, setAdminScreen] = useState<AdminScreen>("admin-dashboard");
  const [adminWsDetailVisible, setAdminWsDetailVisible] = useState(false);
  const [disabledMenus, setDisabledMenus] = useState<Set<string>>(new Set());

  // ─── User nav mapper ───────────────────────────────────────────────────────
  const handleUserNav = (screen: UserScreen) => {
    if (screen.startsWith("workspace")) {
      const tabMap: Record<string, string> = {
        "workspace-overview": "Overview",
        "workspace-members": "Members",
        "workspace-credit": "Credit",
        "workspace-settings": "Settings",
      };
      setWorkspaceTab(tabMap[screen] ?? "Overview");
    }
    setUserScreen(screen);
  };

  // ─── Admin nav mapper ──────────────────────────────────────────────────────
  const handleAdminNav = (screen: AdminScreen) => {
    setAdminWsDetailVisible(false);
    setAdminScreen(screen);
  };

  const toggleMenu = (key: string) => {
    setDisabledMenus(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Resolve active LNB item for workspace/storage sub-screens
  const lnbActive: UserScreen = userScreen;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Pretendard Variable, Pretendard, -apple-system, sans-serif" }}>
      <GNB
        isAdmin={mode === "admin"}
        onSwitchMode={() => setMode(m => m === "user" ? "admin" : "user")}
        onAuditLog={() => handleAdminNav("admin-audit-log")}
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {mode === "user" ? (
          <>
            <UserLNB active={lnbActive} onNav={handleUserNav} onSwitchMode={() => setMode("admin")} />
            <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
              {userScreen === "dashboard" && (
                <UserDashboard
                  onNavigate={(screen) => handleUserNav(screen as UserScreen)}
                />
              )}
              {userScreen.startsWith("workspace") && (
                <WorkspacePage
                  initialTab={workspaceTab}
                  onTabChange={(tab) => {
                    const reverseMap: Record<string, UserScreen> = {
                      "Overview": "workspace-overview",
                      "Members": "workspace-members",
                      "Credit": "workspace-credit",
                      "Settings": "workspace-settings",
                    };
                    const screen = reverseMap[tab];
                    if (screen) setUserScreen(screen);
                  }}
                />
              )}
              {(userScreen === "server-list" || userScreen === "server-create" || userScreen === "server-detail") && (
                <ServerPage />
              )}
              {userScreen === "storage" && (
                <StoragePage />
              )}
            </div>
          </>
        ) : (
          <>
            <AdminLNB active={adminScreen} onNav={handleAdminNav} onSwitchMode={() => setMode("user")} disabledMenus={disabledMenus} />
            <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
              {adminScreen === "admin-dashboard" && <AdminDashboard />}
              {adminScreen === "admin-users" && <AdminUserManagement />}
              {adminScreen === "admin-workspaces" && (
                adminWsDetailVisible
                  ? <AdminWorkspaceDetail onBack={() => setAdminWsDetailVisible(false)} />
                  : <AdminWorkspaceManagement onDetail={() => setAdminWsDetailVisible(true)} />
              )}
              {(adminScreen === "admin-servers" || adminScreen === "admin-templates") && (
                <AdminServerManagement initialTab={adminScreen === "admin-templates" ? "Server Templates" : "Servers"} />
              )}
              {(adminScreen === "admin-storage" || adminScreen === "admin-storage-pricing" || adminScreen === "admin-storage-policy") && (
                <AdminStorageManagement
                  initialTab={adminScreen === "admin-storage-pricing" ? "Storage Pricing Policy" : adminScreen === "admin-storage-policy" ? "Storage Settings" : "Storage"}
                />
              )}
              {(adminScreen === "admin-images" || adminScreen === "admin-categories" || adminScreen === "admin-tiers") && (
                <AdminImageManagement
                  initialTab={
                    adminScreen === "admin-categories" ? "Category"
                    : adminScreen === "admin-tiers" ? "Tier"
                    : "Image"
                  }
                />
              )}
              {(adminScreen === "admin-gpu-types" || adminScreen === "admin-gpu-pricing") && (
                <AdminGPUManagement
                  initialTab={adminScreen === "admin-gpu-pricing" ? "GPU Pricing Policy" : "GPU"}
                />
              )}
              {adminScreen === "admin-credits" && (
                <AdminCreditManagement />
              )}
              {adminScreen === "admin-settings-auth" && (
                <AdminSystemSettings />
              )}
              {adminScreen === "admin-audit-log" && (
                <AdminAuditLog />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

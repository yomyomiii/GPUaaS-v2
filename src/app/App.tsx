import { useState } from "react";
import { GNB, UserLNB, AdminLNB, type UserScreen, type AdminScreen } from "./components/ConsoleLayout";
import { UserDashboard } from "./components/UserDashboard";
import { WorkspacePage } from "./components/WorkspacePage";
import { NotificationsPage } from "./components/NotificationsPage";
import { GalleryPage } from "./components/GalleryPage";
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
  AdminPaymentHistory,
  AdminNotificationManagement,
  AdminSystemSettings,
} from "./components/AdminConsole";
import "../styles/fonts.css";

export default function App() {
  const [mode, setMode] = useState<"user" | "admin">("user");

  // ─── User Console State ────────────────────────────────────────────────────
  const [userScreen, setUserScreen] = useState<UserScreen>("dashboard");
  const [workspaceTab, setWorkspaceTab] = useState("Overview");
  const [storageTab, setStorageTab] = useState("Overview");

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
    if (screen.startsWith("storage")) {
      const tabMap: Record<string, string> = {
        "storage-overview": "Overview",
        "storage-temp": "Temporary Storage",
        "storage-local": "Local Storage",
        "storage-shared": "Shared Storage",
      };
      setStorageTab(tabMap[screen] ?? "Overview");
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
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {mode === "user" ? (
          <>
            <UserLNB active={lnbActive} onNav={handleUserNav} unreadCount={2} onSwitchMode={() => setMode("admin")} />
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
              {userScreen === "notifications" && <NotificationsPage />}
              {userScreen === "gallery" && <GalleryPage onServerCreate={() => handleUserNav("server-list")} />}
              {(userScreen === "server-list" || userScreen === "server-create" || userScreen === "server-detail") && (
                <ServerPage />
              )}
              {userScreen.startsWith("storage") && (
                <StoragePage
                  initialTab={storageTab}
                  onTabChange={(tab) => {
                    const reverseMap: Record<string, UserScreen> = {
                      "Overview": "storage-overview",
                      "Temporary Storage": "storage-temp",
                      "Local Storage": "storage-local",
                      "Shared Storage": "storage-shared",
                    };
                    const screen = reverseMap[tab];
                    if (screen) setUserScreen(screen);
                  }}
                />
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
              {(adminScreen === "admin-storage" || adminScreen === "admin-storage-pricing") && (
                <AdminStorageManagement
                  initialTab={adminScreen === "admin-storage-pricing" ? "Storage Pricing" : "Storage"}
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
                  initialTab={adminScreen === "admin-gpu-pricing" ? "GPU Type Pricing" : "GPU Type"}
                />
              )}
              {(adminScreen === "admin-credits" || adminScreen === "admin-credit-products") && (
                <AdminCreditManagement
                  initialTab={adminScreen === "admin-credit-products" ? "크레딧 상품" : "크레딧 지급/회수"}
                />
              )}
              {(adminScreen === "admin-payments" || adminScreen === "admin-refunds") && (
                <AdminPaymentHistory
                  initialTab={adminScreen === "admin-refunds" ? "환불 관리" : "결제 내역"}
                />
              )}
              {adminScreen === "admin-notif" && (
                <AdminNotificationManagement />
              )}
              {adminScreen === "admin-settings-auth" && (
                <AdminSystemSettings />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

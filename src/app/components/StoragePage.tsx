import React, { useState } from "react";
import { Plus, AlertTriangle, ChevronUp, ChevronDown, Trash2, Info, Server, Search, HardDrive, Database, Share2, Clock } from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_20, GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, RED_10, GREEN, BLUE, YELLOW, YELLOW_10, ORANGE, ORANGE_10,
  Card, PrimaryBtn, PageContainer,
} from "./ConsoleLayout";

// 관리자 콘솔 System Settings에서 설정 가능한 값
const MIN_STORAGE_GB = 10;
const TEMP_RATE_PER_GB = 0.05;
const VOLUME_RATE_PER_GB = 0.10;
const SHARED_RATE_PER_GB = 0.15;

const MEMBERS: Record<string, { email: string }> = {
  "지염염": { email: "jyy@sdt.inc" },
  "이지현": { email: "ljh@sdt.inc" },
};

const tempStorages = [
  { server: "pytorch-dev-01", status: "Healthy" as const, used: 14.2, total: 20, creator: "지염염", createdAt: "2026-05-12 09:30:17" },
  { server: "llm-finetuning",  status: "Healthy" as const, used: 38.5, total: 50, creator: "지염염", createdAt: "2026-06-01 14:22:03" },
];

const localStorages = [
  { name: "pytorch-dev-01-local",  server: "pytorch-dev-01", creator: "지염염", createdAt: "2026-05-12 09:31:44", capacity: 10,  used: 6.8,  status: "Normal" as const, stopped: false, cost: parseFloat((10  * VOLUME_RATE_PER_GB).toFixed(2)) },
  { name: "llm-finetuning-local",  server: "llm-finetuning",  creator: "지염염", createdAt: "2026-06-01 14:23:58", capacity: 100, used: 67.3, status: "Normal" as const, stopped: false, cost: parseFloat((100 * VOLUME_RATE_PER_GB).toFixed(2)) },
  { name: "old-experiment-local",  server: "(정지됨)",          creator: "이지현", createdAt: "2026-04-20 11:05:29", capacity: 30,  used: 29.5, status: "Full"   as const, stopped: true,  cost: parseFloat((30  * VOLUME_RATE_PER_GB).toFixed(2)) },
];

const sharedStorages = [
  { name: "team-shared-01",   capacity: 500,  used: 287, mounts: 2, mountedServers: ["llm-finetuning", "data-preprocess"], status: "Normal" as const, creator: "지염염", createdAt: "2026-03-15 10:00:51", cost: parseFloat((500  * SHARED_RATE_PER_GB).toFixed(2)), unmountedAt: null as string | null },
  { name: "dataset-archive",  capacity: 1000, used: 435, mounts: 0, mountedServers: [] as string[],                         status: "Normal" as const, creator: "이지현", createdAt: "2026-02-08 16:44:07", cost: parseFloat((1000 * SHARED_RATE_PER_GB).toFixed(2)), unmountedAt: "2026-06-25 09:11:23" as string | null },
  { name: "model-checkpoint", capacity: 200,  used: 198, mounts: 1, mountedServers: ["stable-diffusion"],                   status: "Full"   as const, creator: "지염염", createdAt: "2026-06-20 08:17:36", cost: parseFloat((200  * SHARED_RATE_PER_GB).toFixed(2)), unmountedAt: null as string | null },
];

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: {
  title: string; message: React.ReactNode; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "white", borderRadius: 14, padding: "28px 32px", width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: GRAY_90, marginBottom: 16 }}>{title}</div>
        <div style={{ height: 1, backgroundColor: GRAY_10, marginBottom: 20 }} />
        <div style={{ fontSize: 14, color: GRAY_70, lineHeight: 1.7, marginBottom: 28 }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onCancel} style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY_30}`, backgroundColor: "white", color: GRAY_70, cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>취소</button>
          <button type="button" onClick={onConfirm} style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", backgroundColor: RED, color: "white", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Storage Gauge (linear) ───────────────────────────────────────────────────
function StorageGauge({ used, total, showText = true }: { used: number; total: number; showText?: boolean }) {
  const pct = Math.min(100, (used / total) * 100);
  const gaugeColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
  return (
    <div>
      {showText && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: GRAY_70, marginBottom: 5 }}>
          <span>{used.toFixed(1)} GB / {total} GB</span>
          <span style={{ color: gaugeColor, fontWeight: 700 }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height: 8, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: gaugeColor, borderRadius: 4, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

// ─── Mount Badge ──────────────────────────────────────────────────────────────
function MountBadge({ servers }: { servers: string[] }) {
  const [show, setShow] = useState(false);
  if (servers.length === 1) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Server size={11} color={GRAY_70} />
        <span style={{ fontSize: 12, color: GRAY_70 }}>{servers[0]}</span>
      </div>
    );
  }
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Server size={11} color={servers.length > 0 ? GRAY_70 : GRAY_40} />
      <span style={{ fontSize: 12, color: servers.length > 0 ? GRAY_70 : GRAY_40 }}>
        {servers.length}개 서버 마운트
      </span>
      {servers.length > 1 && (
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "default" }}
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        <Info size={11} color={GRAY_40} />
        {show && (
          <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", backgroundColor: GRAY_90, color: "white", fontSize: 11, padding: "7px 11px", borderRadius: 8, zIndex: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", pointerEvents: "none", minWidth: 140, whiteSpace: "nowrap" }}>
            {servers.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, lineHeight: 1.8 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>▸</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

// ─── Type meta ────────────────────────────────────────────────────────────────
const TYPE_META = {
  Local:  { badgeBg: "rgb(240,248,255)", badgeColor: BLUE,    label: "Local",  icon: HardDrive },
  Volume: { badgeBg: PRIMARY_10,         badgeColor: PRIMARY, label: "Volume", icon: Database  },
  Shared: { badgeBg: "rgb(242,254,246)", badgeColor: GREEN,   label: "Shared", icon: Share2    },
};

function TypeTag({ meta }: { meta: typeof TYPE_META[keyof typeof TYPE_META] }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <meta.icon size={12} color={meta.badgeColor} />
      <span style={{ fontSize: 12, fontWeight: 600, color: meta.badgeColor }}>{meta.label}</span>
    </div>
  );
}

export function StoragePage({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const [drawer, setDrawer] = useState<
    | null
    | { type: "create" }
    | { type: "upgrade"; name: string; currentCapacity: number; ratePerGB: number }
  >(null);
  const [newCapacity, setNewCapacity] = useState(100);
  const [createForm, setCreateForm] = useState({ name: "", capacity: 100 });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"전체" | "Local" | "Volume" | "Shared">("전체");
  const [statusFilter, setStatusFilter] = useState<"전체" | "경고">("전체");
  type SortKey = "type" | "name" | "mount" | "used" | "total" | "usage" | "cost" | "createdAt";
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ name: string; type: string } | null>(null);
  const [deletedItemNames, setDeletedItemNames] = useState<Set<string>>(new Set());

  const toggleSort = (key: SortKey) =>
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const SortBtn = ({ k }: { k: SortKey }) => (
    <span onClick={() => toggleSort(k)} style={{ cursor: "pointer", userSelect: "none", fontSize: 10, color: sort.key === k ? PRIMARY : GRAY_40 }}>
      {sort.key === k ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const closeDrawer = () => setDrawer(null);
  const openUpgrade = (name: string, currentCapacity: number, ratePerGB: number) => {
    setNewCapacity(currentCapacity + 1);
    setDrawer({ type: "upgrade", name, currentCapacity, ratePerGB });
  };

  // ── Unified item list ──────────────────────────────────────────────────────
  const allItems = ([
    ...tempStorages.map(t => ({
      type: "Local" as const,
      name: t.server, used: t.used, total: t.total,
      cost: parseFloat((t.total * TEMP_RATE_PER_GB).toFixed(2)),
      status: t.status, server: t.server, creator: t.creator, creatorEmail: MEMBERS[t.creator]?.email ?? "", createdAt: t.createdAt,
      stopped: false, mountedServers: undefined as string[] | undefined,
      mounts: undefined as number | undefined, unmountedAt: undefined as string | null | undefined,
    })),
    ...localStorages.map(l => ({
      type: "Volume" as const,
      name: l.name, used: l.used, total: l.capacity, cost: l.cost,
      status: l.status, server: l.server, creator: l.creator, creatorEmail: MEMBERS[l.creator]?.email ?? "", createdAt: l.createdAt,
      stopped: l.stopped, mountedServers: undefined as string[] | undefined,
      mounts: undefined as number | undefined, unmountedAt: undefined as string | null | undefined,
    })),
    ...sharedStorages.map(s => ({
      type: "Shared" as const,
      name: s.name, used: s.used, total: s.capacity, cost: s.cost,
      status: s.status, server: undefined as string | undefined, creator: s.creator, creatorEmail: MEMBERS[s.creator]?.email ?? "", createdAt: s.createdAt,
      stopped: false, mountedServers: s.mountedServers, mounts: s.mounts, unmountedAt: s.unmountedAt,
    })),
  ]).filter(item => !deletedItemNames.has(item.name));

  const filtered = allItems
    .filter(item => typeFilter === "전체" || item.type === typeFilter)
    .filter(item => statusFilter === "전체" || item.status === "Full" || item.stopped)
    .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const mul = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "type")  return mul * a.type.localeCompare(b.type);
      if (sort.key === "mount") return mul * ((a.mounts ?? (a.stopped ? 0 : 1)) - (b.mounts ?? (b.stopped ? 0 : 1)));
      if (sort.key === "used")  return mul * (a.used - b.used);
      if (sort.key === "total") return mul * (a.total - b.total);
      if (sort.key === "usage") return mul * ((a.used / a.total) - (b.used / b.total));
      if (sort.key === "cost")      return mul * (a.cost - b.cost);
      if (sort.key === "createdAt") return mul * a.createdAt.localeCompare(b.createdAt);
      return mul * a.name.localeCompare(b.name);
    });

  return (
    <>
    <PageContainer
      title="Storage"
      subtitle="로컬·볼륨·공유 스토리지를 통합 관리하고 용량과 과금을 확인하세요."
      actions={
        <PrimaryBtn size="small" onClick={() => { setCreateForm({ name: "", capacity: 100 }); setDrawer({ type: "create" }); }}>
          <Plus size={14} /> 공유 스토리지 생성
        </PrimaryBtn>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Controls ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, flexShrink: 0 }}>전체 {filtered.length}개</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: GRAY_40, pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 220, height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, boxSizing: "border-box", outline: "none", color: GRAY_90 }}
            />
          </div>
          {/* Type filter — segmented control */}
          <div style={{ display: "flex", backgroundColor: GRAY_10, borderRadius: 10, padding: 3, gap: 2 }}>
            {(["전체", "Local", "Volume", "Shared"] as const).map(t => (
              <button key={t} type="button" onClick={() => setTypeFilter(t)} style={{
                padding: "5px 12px", borderRadius: 7, fontSize: 12, border: "none", cursor: "pointer",
                fontWeight: typeFilter === t ? 600 : 400,
                backgroundColor: typeFilter === t ? "white" : "transparent",
                color: typeFilter === t ? GRAY_90 : GRAY_60,
                boxShadow: typeFilter === t ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
                transition: "all 0.15s",
              }}>{t}</button>
            ))}
          </div>
          {/* Status filter — segmented control */}
          <div style={{ display: "flex", backgroundColor: GRAY_10, borderRadius: 10, padding: 3 }}>
            <button type="button" onClick={() => setStatusFilter(s => s === "경고" ? "전체" : "경고")} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 7, fontSize: 12, border: "none", cursor: "pointer",
              fontWeight: statusFilter === "경고" ? 600 : 400,
              backgroundColor: statusFilter === "경고" ? "white" : "transparent",
              color: statusFilter === "경고" ? RED : GRAY_60,
              boxShadow: statusFilter === "경고" ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
              transition: "all 0.15s",
            }}>
              <AlertTriangle size={11} /> 경고만
            </button>
          </div>
        </div>
      </div>

      {/* ── Column header ── */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", fontSize: 12, fontWeight: 600, color: GRAY_60, backgroundColor: GRAY_10, borderRadius: 10 }}>
          <div style={{ width: 88, flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
            타입 <SortBtn k="type" />
          </div>
          <div style={{ width: 200, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>Storage <SortBtn k="name" /></span>
            <span style={{ color: GRAY_30 }}>/</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>Mount <SortBtn k="mount" /></span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>Used <SortBtn k="used" /></span>
            <span style={{ color: GRAY_30 }}>/</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>Total <SortBtn k="total" /></span>
            <span style={{ color: GRAY_30 }}>/</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>Usage <SortBtn k="usage" /></span>
          </div>
          <div style={{ width: 120, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
            Cost/h <SortBtn k="cost" />
          </div>
          <div style={{ width: 160, flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
            생성 일시 <SortBtn k="createdAt" />
          </div>
          <div style={{ width: 210, flexShrink: 0 }}>Actions</div>
        </div>
      )}

      {/* ── Card list ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", fontSize: 13, color: GRAY_60 }}>
            조건에 맞는 스토리지가 없습니다.
          </div>
        ) : filtered.map(item => {
          const meta = TYPE_META[item.type];
          return (
            <Card hover key={`${item.type}-${item.name}`} style={{ padding: "16px 20px" }}>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Type tag */}
                <div style={{ width: 88, flexShrink: 0 }}>
                  <TypeTag meta={meta} />
                </div>

                {/* Name + mount */}
                <div style={{ width: 200, flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>{item.name}</div>
                  <div>
                    {item.type === "Local" && <MountBadge servers={[item.server!]} />}
                    {item.type === "Volume" && <MountBadge servers={item.stopped ? [] : [item.server!]} />}
                    {item.type === "Shared" && item.mountedServers && (
                      <>
                        <MountBadge servers={item.mountedServers} />
                        {item.mounts === 0 && item.unmountedAt && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: YELLOW_10, borderRadius: 10, fontSize: 11, color: YELLOW, marginTop: 3 }}>
                            <Clock size={10} color={YELLOW} />
                            해제 일시: {item.unmountedAt}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 사용 중 / 최대 / 사용률 */}
                <div style={{ flex: 1 }}>
                  <StorageGauge used={item.used} total={item.total} />
                </div>

                {/* Cost */}
                <div style={{ width: 120, flexShrink: 0, textAlign: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>{item.cost.toFixed(2)}</span>
                  <span style={{ fontSize: 11, color: GRAY_60 }}> cr/h</span>
                </div>

                {/* Created at */}
                <div style={{ width: 160, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: GRAY_60 }}>{item.createdAt}</span>
                </div>

                {/* Actions */}
                <div style={{ width: 210, flexShrink: 0, display: "flex", gap: 6, alignItems: "center" }}>
                  <button type="button" style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>상세 보기</button>
                  {(item.type === "Volume" || item.type === "Shared") && (
                    <div style={{ position: "relative" }}>
                      {openMenuId === item.name && <div onClick={() => setOpenMenuId(null)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                      <button type="button" onClick={(e) => { if (openMenuId !== item.name) { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); } setOpenMenuId(openMenuId === item.name ? null : item.name); }}
                        style={{ height: 28, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: openMenuId === item.name ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                        onMouseEnter={e => { if (openMenuId !== item.name) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                        onMouseLeave={e => { if (openMenuId !== item.name) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                        <span style={{ padding: "0 8px 0 10px" }}>관리</span>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: openMenuId === item.name ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${openMenuId === item.name ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                          <ChevronDown size={11} color={PRIMARY} style={{ transform: openMenuId === item.name ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                        </span>
                      </button>
                      {openMenuId === item.name && menuAnchor && (
                        <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 130, padding: "4px 0" }}>
                          <button type="button" onClick={() => { openUpgrade(item.name, item.total, item.type === "Volume" ? VOLUME_RATE_PER_GB : SHARED_RATE_PER_GB); setOpenMenuId(null); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: GRAY_90, fontFamily: "inherit", whiteSpace: "nowrap" }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                            용량 상향
                          </button>
                          <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                          <button type="button" onClick={() => { setOpenMenuId(null); setDeletingItem({ name: item.name, type: item.type }); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      </div>
    </PageContainer>

    {/* ── Right Drawer overlay ── */}
    {drawer !== null && (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}
        onClick={closeDrawer}>
        <div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} />
        <div style={{ width: 400, height: "100%", backgroundColor: "white", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column" }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${GRAY_30}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: GRAY_90 }}>
                {drawer.type === "create" ? "공유 스토리지 생성" : "용량 상향"}
              </div>
              <button type="button" onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", color: GRAY_60, fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
            {drawer.type === "create" ? (
              <>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 6 }}>스토리지 이름</div>
                  <input
                    type="text"
                    placeholder="예: team-shared-02"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 6 }}>용량 (GB)</div>
                  <input
                    type="number"
                    min={MIN_STORAGE_GB}
                    value={createForm.capacity}
                    onChange={e => setCreateForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                    style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ padding: "14px 16px", backgroundColor: GRAY_5, borderRadius: 10, fontSize: 12, color: GRAY_70, lineHeight: 1.8 }}>
                  <div>예상 비용: <strong style={{ color: GRAY_90 }}>{(createForm.capacity * SHARED_RATE_PER_GB).toFixed(2)} cr/h</strong></div>
                  <div style={{ color: GRAY_60 }}>월 {(createForm.capacity * SHARED_RATE_PER_GB * 24 * 30).toFixed(0)} cr (30일 기준)</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 6 }}>스토리지</div>
                  <div style={{ height: 40, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, backgroundColor: GRAY_5, display: "flex", alignItems: "center", color: GRAY_70 }}>
                    {drawer.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 6 }}>현재 용량</div>
                  <div style={{ height: 40, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, backgroundColor: GRAY_5, display: "flex", alignItems: "center", color: GRAY_70 }}>
                    {drawer.currentCapacity} GB
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_70, marginBottom: 6 }}>새 용량 (GB)</div>
                  <input
                    type="number"
                    min={drawer.currentCapacity + 1}
                    value={newCapacity}
                    onChange={e => setNewCapacity(Number(e.target.value))}
                    style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ padding: "14px 16px", backgroundColor: GRAY_5, borderRadius: 10, fontSize: 12, color: GRAY_70, lineHeight: 1.8 }}>
                  <div>현재: {drawer.currentCapacity} GB → 변경: {newCapacity} GB</div>
                  <div>추가 과금: <strong style={{ color: GRAY_90 }}>{((newCapacity - drawer.currentCapacity) * drawer.ratePerGB).toFixed(2)} cr/h</strong></div>
                </div>
                <div style={{ padding: "8px 14px", backgroundColor: ORANGE_10, borderRadius: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={13} color={ORANGE} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: ORANGE }}>용량 축소는 불가합니다. 신청 후 즉시 적용됩니다.</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 28px", borderTop: `1px solid ${GRAY_30}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <PrimaryBtn size="small" variant="ghost" onClick={closeDrawer}>취소</PrimaryBtn>
            {drawer.type === "create"
              ? <PrimaryBtn size="small" disabled={!createForm.name} onClick={closeDrawer}>생성</PrimaryBtn>
              : <PrimaryBtn size="small" disabled={newCapacity <= drawer.currentCapacity} onClick={closeDrawer}>상향 신청</PrimaryBtn>
            }
          </div>
        </div>
      </div>
    )}

    {deletingItem && (
      <ConfirmModal
        title="스토리지 삭제 확인"
        message={<span>스토리지 <strong style={{ color: GRAY_90 }}>{deletingItem.name}</strong>을(를) 삭제하시겠습니까?<br /><br />{deletingItem.type === "Shared" ? "마운트된 서버에서 즉시 언마운트되며, 저장된 모든 데이터가 영구 삭제됩니다." : "저장된 모든 데이터가 영구 삭제됩니다."} 이 작업은 되돌릴 수 없습니다.</span>}
        confirmLabel="삭제"
        onConfirm={() => { setDeletedItemNames(prev => new Set([...prev, deletingItem.name])); setDeletingItem(null); }}
        onCancel={() => setDeletingItem(null)}
      />
    )}
    </>
  );
}

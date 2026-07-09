import { useState, useEffect } from "react";
import { Plus, AlertTriangle, Database, ChevronUp, Trash2, Info, Server, Zap, TrendingUp } from "lucide-react";
import {
  PRIMARY, PRIMARY_10, GRAY_5, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90, RED, GREEN, BLUE, YELLOW,
  Badge, Card, PrimaryBtn, Table, PageContainer, TabBar, SectionCard, ListCard,
} from "./ConsoleLayout";

const tempStorages = [
  { server: "pytorch-dev-01", status: "Healthy" as const, used: 14.2, total: 20, creator: "박선욱", running: true },
  { server: "llm-finetuning", status: "Healthy" as const, used: 38.5, total: 50, creator: "박선욱", running: true },
  { server: "data-preprocess", status: "Healthy" as const, used: 5.1, total: 40, creator: "이지현", running: false },
];

const localStorages = [
  { name: "pytorch-dev-01-local", server: "pytorch-dev-01", creator: "박선욱", capacity: 10, used: 6.8, status: "Normal" as const, stopped: false, cost: 1.0 },
  { name: "llm-finetuning-local", server: "llm-finetuning", creator: "박선욱", capacity: 100, used: 67.3, status: "Normal" as const, stopped: false, cost: 10.0 },
  { name: "old-experiment-local", server: "(정지됨)", creator: "이지현", capacity: 30, used: 29.5, status: "Full" as const, stopped: true, cost: 3.0 },
];

const sharedStorages = [
  { name: "team-shared-01", capacity: 500, used: 287, mounts: 2, mountedServers: ["llm-finetuning", "data-preprocess"], status: "Normal" as const, creator: "박선욱", cost: 75.0 },
  { name: "dataset-archive", capacity: 1000, used: 435, mounts: 0, mountedServers: [] as string[], status: "Normal" as const, creator: "이지현", cost: 150.0 },
  { name: "model-checkpoint", capacity: 200, used: 198, mounts: 1, mountedServers: ["stable-diffusion"], status: "Full" as const, creator: "박선욱", cost: 30.0 },
];

// ─── Ring Chart (pure SVG — no recharts clipping issues) ─────────────────────
function RingChart({ used, total, color, size = 100 }: { used: number; total: number; color: string; size?: number }) {
  const pct = Math.min(100, (used / total) * 100);
  const gaugeColor = pct > 90 ? RED : pct > 75 ? YELLOW : color;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const sw = size * 0.13;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={GRAY_5} strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={gaugeColor} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.5s" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ fontSize: size * 0.18, fontWeight: 800, color: gaugeColor, lineHeight: 1 }}>{Math.round(pct)}%</div>
        <div style={{ fontSize: size * 0.1, color: GRAY_60, marginTop: 2 }}>사용</div>
      </div>
    </div>
  );
}

// ─── Storage Gauge (linear) ───────────────────────────────────────────────────
function StorageGauge({ used, total, color = PRIMARY, showText = true }: { used: number; total: number; color?: string; showText?: boolean }) {
  const pct = Math.min(100, (used / total) * 100);
  const gaugeColor = pct > 90 ? RED : pct > 75 ? YELLOW : color;
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

// ─── Mount Badge with hover tooltip ──────────────────────────────────────────
function MountBadge({ servers }: { servers: string[] }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4, cursor: "default" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Server size={11} color={servers.length > 0 ? GRAY_70 : GRAY_40} />
      <span style={{ fontSize: 12, color: servers.length > 0 ? GRAY_70 : GRAY_40 }}>
        {servers.length}개 서버 마운트
      </span>
      {show && servers.length > 0 && (
        <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: 0, backgroundColor: GRAY_90, color: "white", fontSize: 11, padding: "7px 11px", borderRadius: 8, zIndex: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", pointerEvents: "none", minWidth: 140, whiteSpace: "nowrap" }}>
          {servers.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, lineHeight: 1.8 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>▸</span>
              <span style={{ fontFamily: "Roboto Mono, monospace" }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Status badges ────────────────────────────────────────────────────────────
function statusColor(s: string): "success" | "danger" | "warning" {
  if (s === "Normal" || s === "Healthy") return "success";
  if (s === "Full") return "danger";
  return "warning";
}

export function StoragePage({ initialTab = "Overview", onTabChange }: { initialTab?: string; onTabChange?: (tab: string) => void }) {
  const [tab, setTab] = useState(initialTab);
  const [expandUpgrade, setExpandUpgrade] = useState<string | null>(null);
  const [newCapacity, setNewCapacity] = useState(100);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  const handleTabChange = (t: string) => {
    const base = t.replace(/ \(\d+\)$/, "");
    setTab(base);
    onTabChange?.(base);
  };

  const totalTemp = tempStorages.reduce((s, t) => s + t.total, 0);
  const usedTemp = tempStorages.reduce((s, t) => s + t.used, 0);
  const totalLocal = localStorages.reduce((s, l) => s + l.capacity, 0);
  const usedLocal = localStorages.reduce((s, l) => s + l.used, 0);
  const totalShared = sharedStorages.reduce((s, sh) => s + sh.capacity, 0);
  const usedShared = sharedStorages.reduce((s, sh) => s + sh.used, 0);
  const stoppedLocalCost = localStorages.filter(l => l.stopped).reduce((s, l) => s + l.cost, 0);
  const monthLocalCost = localStorages.reduce((s, l) => s + l.cost * 24 * 30, 0);
  const monthSharedCost = sharedStorages.reduce((s, sh) => s + sh.cost * 24 * 30, 0);

  return (
    <PageContainer
      title="Storage"
      subtitle="워크스페이스의 스토리지 3종을 통합 관리합니다."
    >
      <TabBar
        tabs={["Overview", `Temporary Storage (${tempStorages.length})`, `Local Storage (${localStorages.length})`, `Shared Storage (${sharedStorages.length})`]}
        active={tab === "Overview" ? "Overview" : `${tab} (${tab === "Temporary Storage" ? tempStorages.length : tab === "Local Storage" ? localStorages.length : sharedStorages.length})`}
        onChange={handleTabChange}
      />

      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Storage type cards with ring charts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {/* Temp */}
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgb(220,237,255)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Database size={15} color={BLUE} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>임시 스토리지</div>
                      <div style={{ fontSize: 11, color: GRAY_60 }}>Ephemeral · 모니터링 전용</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: GRAY_90 }}>{usedTemp.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>/ {totalTemp} GB</span></div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 8 }}>{tempStorages.length}개 서버</div>
                    <StorageGauge used={usedTemp} total={totalTemp} color={BLUE} showText={false} />
                  </div>
                  {usedTemp / totalTemp > 0.8
                    ? <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: YELLOW }}><AlertTriangle size={11} /> 임시 스토리지 {Math.round(usedTemp / totalTemp * 100)}% 사용 중</div>
                    : <div style={{ marginTop: 10, fontSize: 11, color: GRAY_60 }}>무료 · 서버 중지 시 소멸</div>
                  }
                </div>
                <RingChart used={usedTemp} total={totalTemp} color={BLUE} size={84} />
              </div>
            </Card>

            {/* Local */}
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Database size={15} color={PRIMARY} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>로컬 스토리지</div>
                      <div style={{ fontSize: 11, color: GRAY_60 }}>Persistent PVC · 정지 중 과금</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: GRAY_90 }}>{usedLocal.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>/ {totalLocal} GB</span></div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 8 }}>{localStorages.length}개 볼륨 · {localStorages.filter(l => !l.stopped).length}개 마운트</div>
                    <StorageGauge used={usedLocal} total={totalLocal} color={PRIMARY} showText={false} />
                  </div>
                  {stoppedLocalCost > 0 && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: YELLOW }}>
                      <AlertTriangle size={11} /> 정지 서버 {stoppedLocalCost} cr/h 과금 중
                    </div>
                  )}
                </div>
                <RingChart used={usedLocal} total={totalLocal} color={PRIMARY} size={84} />
              </div>
            </Card>

            {/* Shared */}
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgb(236,253,240)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Database size={15} color={GREEN} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>공유 스토리지</div>
                      <div style={{ fontSize: 11, color: GRAY_60 }}>Persistent PVC · Ceph RWX</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: GRAY_90 }}>{usedShared} <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>/ {totalShared} GB</span></div>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 8 }}>{sharedStorages.length}개 볼륨 · {sharedStorages.reduce((s, sh) => s + sh.mounts, 0)}개 마운트</div>
                    <StorageGauge used={usedShared} total={totalShared} color={GREEN} showText={false} />
                  </div>
                  {sharedStorages.some(s => s.status === "Full")
                    ? <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: RED }}><AlertTriangle size={11} /> Full 볼륨 {sharedStorages.filter(s => s.status === "Full").length}개 용량 초과</div>
                    : <div style={{ marginTop: 10, fontSize: 11, color: GRAY_60 }}>용량 여유 있음</div>
                  }
                </div>
                <RingChart used={usedShared} total={totalShared} color={GREEN} size={84} />
              </div>
            </Card>
          </div>

          {/* Alert: Full storages */}
          {(sharedStorages.some(s => s.status === "Full") || localStorages.some(l => l.status === "Full")) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "rgb(255,242,242)", borderRadius: 10, border: `1px solid ${RED}20` }}>
              <AlertTriangle size={15} color={RED} />
              <div style={{ fontSize: 13, color: GRAY_90 }}>
                <strong>용량 경고:</strong> model-checkpoint, old-experiment-local가 거의 가득 찼습니다. 용량 상향이나 불필요한 파일 정리를 권장합니다.
              </div>
              <PrimaryBtn size="xsmall" variant="danger" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>지금 관리</PrimaryBtn>
            </div>
          )}

          {/* Cost overview */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <SectionCard title="실시간 과금 현황">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "임시 스토리지", rate: "0.05 cr/GB/h", hourly: 2.9, color: BLUE, note: "서버 실행 시만" },
                  { label: "로컬 스토리지", rate: "0.1 cr/GB/h", hourly: 14.0, color: PRIMARY, note: "정지 중도 과금" },
                  { label: "공유 스토리지", rate: "0.15 cr/GB/h", hourly: 255.0, color: GREEN, note: "항상 과금" },
                ].map(({ label, rate, hourly, color, note }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", backgroundColor: GRAY_5, borderRadius: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{label}</div>
                      <div style={{ fontSize: 11, color: GRAY_60 }}>{rate} · {note}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color }}>{hourly} <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>cr/h</span></div>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${GRAY_30}`, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>합계</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: PRIMARY }}>271.9 <span style={{ fontSize: 12, fontWeight: 400, color: GRAY_60 }}>cr/h</span></span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="이번 달 누계">
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: GRAY_90 }}>1,560</span>
                <span style={{ fontSize: 13, color: GRAY_60 }}>cr</span>
                <span style={{ fontSize: 11, color: GRAY_60, marginLeft: 4 }}>/ 2,100 cr 예상</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, marginBottom: 14, overflow: "hidden", display: "flex", backgroundColor: GRAY_5 }}>
                <div style={{ width: `${320/2100*100}%`, backgroundColor: BLUE }} />
                <div style={{ width: `${780/2100*100}%`, backgroundColor: PRIMARY }} />
                <div style={{ width: `${460/2100*100}%`, backgroundColor: GREEN }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "임시 스토리지", amount: 320, color: BLUE },
                  { label: "로컬 스토리지 (정지 포함)", amount: 780, color: PRIMARY },
                  { label: "공유 스토리지", amount: 460, color: GREEN },
                ].map(({ label, amount, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", backgroundColor: GRAY_5, borderRadius: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{amount.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>cr</span></span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "10px 14px", backgroundColor: "rgb(255,251,235)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={12} color={YELLOW} />
                <span style={{ fontSize: 11, color: GRAY_70 }}>이달 말 예상: <strong style={{ color: YELLOW }}>약 2,100 cr</strong> (현재 페이스 기준)</span>
              </div>
            </SectionCard>
          </div>

          {/* Volume summary */}
          <SectionCard title="볼륨 요약">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "임시 볼륨", value: tempStorages.length, icon: <Database size={14} color={BLUE} />, sub: "서버에 귀속" },
                { label: "로컬 볼륨", value: localStorages.length, icon: <Database size={14} color={PRIMARY} />, sub: `${localStorages.filter(l => l.stopped).length}개 정지 서버` },
                { label: "공유 볼륨", value: sharedStorages.length, icon: <Database size={14} color={GREEN} />, sub: `${sharedStorages.reduce((s, sh) => s + sh.mounts, 0)}개 마운트` },
                { label: "용량 경고", value: [...localStorages, ...sharedStorages].filter(v => v.status === "Full").length, icon: <AlertTriangle size={14} color={RED} />, sub: "즉시 확인 필요" },
              ].map(({ label, value, icon, sub }) => (
                <div key={label} style={{ padding: "14px 16px", backgroundColor: GRAY_5, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: GRAY_90 }}>{value}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_70 }}>{label}</div>
                    <div style={{ fontSize: 10, color: GRAY_60 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "Temporary Storage" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "rgb(218,235,255)", borderRadius: 10 }}>
            <Info size={14} color={BLUE} />
            <span style={{ fontSize: 13, color: GRAY_90 }}>임시 스토리지는 모니터링만 가능합니다. 서버 정지 시 데이터가 소멸됩니다. 중요 데이터는 로컬 또는 공유 스토리지에 저장하세요.</span>
          </div>
          {tempStorages.map(t => {
            const pct = (t.used / t.total) * 100;
            return (
              <Card key={t.server} style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgb(218,235,255)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Server size={16} color={BLUE} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "Roboto Mono, monospace", fontSize: 14, fontWeight: 700, color: GRAY_90 }}>{t.server}</div>
                    </div>
                  </div>
                </div>
                <StorageGauge used={t.used} total={t.total} color={BLUE} />
                <div style={{ marginTop: 8 }}>
                  <MountBadge servers={[t.server]} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "Local Storage" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", backgroundColor: PRIMARY_10, borderRadius: 8, fontSize: 12, color: GRAY_70 }}>
              <Info size={13} color={PRIMARY} />
              로컬 스토리지는 서버 생성 시 옵션으로 추가됩니다. 서버 정지 중에도 과금이 발생합니다 (0.1 cr/GB/h).
            </div>
          </div>
          {localStorages.map(l => (
            <Card key={l.name} style={{ padding: "20px 24px", border: l.stopped ? `1.5px solid ${YELLOW}40` : undefined }}>
              {l.stopped && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", backgroundColor: "rgb(255,251,235)", borderRadius: 8, marginBottom: 14 }}>
                  <AlertTriangle size={13} color={YELLOW} />
                  <span style={{ fontSize: 12, color: GRAY_70 }}>서버 정지 중에도 <strong>{l.cost} cr/h</strong> 과금이 발생합니다.</span>
                  <PrimaryBtn size="xsmall" variant="danger" style={{ marginLeft: "auto" }}>삭제로 과금 중단</PrimaryBtn>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <RingChart used={l.used} total={l.capacity} color={PRIMARY} size={56} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, fontFamily: "Roboto Mono, monospace" }}>{l.name}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: PRIMARY, whiteSpace: "nowrap" }}>0.1 cr/GB/h = {l.cost} cr/h</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <PrimaryBtn size="xsmall" variant="secondary" onClick={() => setExpandUpgrade(expandUpgrade === l.name ? null : l.name)}>
                      <ChevronUp size={12} /> 용량 상향
                    </PrimaryBtn>
                    <PrimaryBtn size="xsmall" variant="danger">
                      <Trash2 size={12} /> 삭제
                    </PrimaryBtn>
                  </div>
                </div>
              </div>
              <StorageGauge used={l.used} total={l.capacity} color={PRIMARY} />
              <div style={{ marginTop: 8 }}>
                <MountBadge servers={l.stopped ? [] : [l.server]} />
              </div>

              {expandUpgrade === l.name && (
                <div style={{ marginTop: 16, padding: "16px", backgroundColor: GRAY_5, borderRadius: 10, border: `1px solid ${GRAY_30}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: GRAY_90, marginBottom: 12 }}>용량 상향 신청 (축소 불가)</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, color: GRAY_70 }}>현재: {l.capacity} GB →</span>
                    <input type="number" value={newCapacity} onChange={e => setNewCapacity(Number(e.target.value))} min={l.capacity + 10} style={{ width: 90, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 14, textAlign: "center" }} />
                    <span style={{ fontSize: 13, color: GRAY_70 }}>GB</span>
                    <div style={{ fontSize: 12, color: YELLOW, backgroundColor: "rgb(255,251,235)", padding: "6px 12px", borderRadius: 8 }}>
                      추가 과금: {((newCapacity - l.capacity) * 0.1).toFixed(0)} cr/h
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <PrimaryBtn size="xsmall" onClick={() => setExpandUpgrade(null)}>확인</PrimaryBtn>
                    <PrimaryBtn size="xsmall" variant="ghost" onClick={() => setExpandUpgrade(null)}>취소</PrimaryBtn>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "Shared Storage" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", backgroundColor: PRIMARY_10, borderRadius: 8, fontSize: 12, color: GRAY_70 }}>
            <Info size={13} color={PRIMARY} />
            워크스페이스 Owner/Admin만 공유 스토리지를 생성·관리할 수 있습니다. (워크스페이스당 최대 10개)
          </div>

          {sharedStorages.map(s => (
            <Card key={s.name} style={{ padding: "20px 24px", border: s.status === "Full" ? `1.5px solid ${RED}40` : undefined }}>
              {s.status === "Full" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", backgroundColor: "rgb(255,242,242)", borderRadius: 8, marginBottom: 14 }}>
                  <AlertTriangle size={13} color={RED} />
                  <span style={{ fontSize: 12, color: GRAY_70 }}>스토리지가 거의 가득 찼습니다. 용량 상향 또는 파일 정리를 권장합니다.</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <RingChart used={s.used} total={s.capacity} color={GREEN} size={60} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, fontFamily: "Roboto Mono, monospace" }}>{s.name}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: GREEN, whiteSpace: "nowrap" }}>0.15 cr/GB/h = {s.cost} cr/h</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <PrimaryBtn size="xsmall" variant="secondary"><ChevronUp size={12} /> 용량 상향</PrimaryBtn>
                    <PrimaryBtn size="xsmall" variant="danger"><Trash2 size={12} /> 삭제</PrimaryBtn>
                  </div>
                </div>
              </div>
              <StorageGauge used={s.used} total={s.capacity} color={GREEN} />
              <div style={{ marginTop: 8 }}>
                <MountBadge servers={s.mountedServers} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

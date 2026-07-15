import { useTranslation } from 'react-i18next';
import {
  ComposedChart, Bar, Cell, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Server, CreditCard, Plus, ChevronRight, Zap, AlertTriangle, ArrowUpRight, Database, BellRing, LayoutDashboard, Layers, Users } from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_80, GRAY_5, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, GREEN, BLUE, YELLOW, ORANGE, ORANGE_10, Badge, StatusDot, Card, PrimaryBtn, MetricCard, PageContainer, SectionCard, ListCard,
} from "./ConsoleLayout";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const servers = [
  { name: "pytorch-dev-01", status: "running" as const, gpu: "RTX A5000 ×2", utilization: 78, rate: 24 },
  { name: "llm-finetuning", status: "running" as const, gpu: "H100 SXM5 ×4", utilization: 94, rate: 96 },
  { name: "inference-api",    status: "running" as const, gpu: "RTX 4090 ×1", utilization: 42, rate: 24 },
  { name: "stable-diffusion", status: "stopped" as const, gpu: "RTX 4090 ×1", utilization: 0, rate: 0 },
  { name: "data-preprocess", status: "creating" as const, gpu: "A100 SXM4 ×2", utilization: 0, rate: 48 },
];

const creditTrend = [
  { day: "6/25", total: 890,  server: 720,  storage: 170 },
  { day: "6/26", total: 1050, server: 860,  storage: 190 },
  { day: "6/27", total: 780,  server: 610,  storage: 170 },
  { day: "6/28", total: 1230, server: 1020, storage: 210 },
  { day: "6/29", total: 1400, server: 1180, storage: 220 },
  { day: "6/30", total: 1560, server: 1320, storage: 240 },
  { day: "7/1",  total: 980,  server: 800,  storage: 180 },
  { day: "7/2",  total: 1340, server: 1110, storage: 230 },
  { day: "7/3",  total: 1120, server: 920,  storage: 200 },
  { day: "7/4",  total: 1580, server: 1330, storage: 250 },
  { day: "7/5",  total: 1820, server: 1560, storage: 260 },
  { day: "7/6",  total: 2140, server: 1870, storage: 270 },
  { day: "7/7",  total: 2000, server: 1740, storage: 260 },
  { day: "7/8",  total: 2000, server: 1745, storage: 255 },
];

const costBreakdown = [
  { name: "GPU (서버)",      value: 9840, color: PRIMARY },
  { name: "Volume Storage", value: 780,  color: PRIMARY },
  { name: "Shared Storage", value: 460,  color: GREEN },
  { name: "Local Storage",  value: 320,  color: BLUE },
];

const storageUsage = [
  { name: "Local Storage",  used: 57.8, total: 110,  color: BLUE },
  { name: "Volume Storage", used: 103.6, total: 140, color: PRIMARY },
  { name: "Shared Storage", used: 920, total: 1700,  color: GREEN },
];

// ─── SVG Donut chart (replaces recharts PieChart — no clipping) ───────────────
function CostDonut({ data, total, size }: { data: { name: string; value: number; color: string }[]; total: number; size: number }) {
  const { t } = useTranslation();
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.37;
  const sw = size * 0.14;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map(d => {
    const pct = d.value / total;
    const len = pct * circ;
    const seg = { ...d, dashOffset: offset, dashLen: len - 2 };
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
        <div style={{ fontSize: size * 0.09, color: GRAY_60 }}>{t('dashboard.chart.creditUsed')}</div>
        <div style={{ fontSize: size * 0.14, fontWeight: 800, color: PRIMARY, lineHeight: 1.2 }}>{(total / 1000).toFixed(1)}K</div>
        <div style={{ fontSize: size * 0.09, color: GRAY_60 }}>cr</div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CreditTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const find = (k: string) => payload.find((p: any) => p.dataKey === k)?.value;
  return (
    <div style={{ background: "white", border: `1px solid ${GRAY_30}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: GRAY_60, marginBottom: 6 }}>{label}</div>
      <div style={{ color: GRAY_70, fontWeight: 600 }}>{t('dashboard.chart.creditUsed')}: {find("total")?.toLocaleString()} cr</div>
      <div style={{ color: PRIMARY, fontWeight: 600 }}>{t('dashboard.section.serverUsage')}: {find("server")?.toLocaleString()} cr</div>
      <div style={{ color: GREEN, fontWeight: 600 }}>{t('dashboard.section.resourceOverview')}: {find("storage")?.toLocaleString()} cr</div>
    </div>
  );
};

export function UserDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { t } = useTranslation();
  const totalCost = costBreakdown.reduce((s, c) => s + c.value, 0);
  const creditBalance = 45230;
  const isLow = creditBalance < 10000;

  const runningServers = servers.filter(s => s.status === "running").length;
  const stoppedServers = servers.filter(s => s.status === "stopped").length;
  const creatingServers = servers.filter(s => s.status === "creating").length;
  const highLoadServers = servers.filter(s => s.status === "running" && s.utilization > 80).length;
  const normalServers = servers.filter(s => s.status === "running" && s.utilization <= 80).length;

  return (
    <PageContainer
      title={t('gnb.lnb.dashboard')}
      subtitle={t('gnb.lnb.myWorkspace')}
      actions={
        <span style={{ fontSize: 12, color: GRAY_60 }}>{t('dashboard.lastUpdated', '마지막 업데이트 · 2026년 7월 13일 14:32')}</span>
      }
    >
      {/* ── 크레딧 경고 배너 (잔액 30% 미만 시) ── */}
      {isLow && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", backgroundColor: ORANGE_10, borderRadius: 10, marginBottom: 14 }}>
          <AlertTriangle size={12} color={ORANGE} />
          <span style={{ fontSize: 12, color: GRAY_70 }}>{t('dashboard.creditLowWarning', { balance: creditBalance.toLocaleString(), days: 32 })}</span>
        </div>
      )}

      {/* ── KPI 4종 ── */}
      {(() => {
        const cardStyle: React.CSSProperties = {
          padding: "16px 18px", backgroundColor: "white", borderRadius: 12,
          border: "1px solid rgb(240,240,240)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          display: "flex", flexDirection: "column",
        };
        const headerStyle: React.CSSProperties = {
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
        };
        const iconBoxStyle = (color: string): React.CSSProperties => ({
          width: 30, height: 30, borderRadius: 8, backgroundColor: `${color}15`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        });
        const valueRowStyle: React.CSSProperties = {
          display: "flex", alignItems: "baseline", gap: 6,
        };
        const statusRowStyle: React.CSSProperties = {
          display: "flex", alignItems: "center", gap: 5, marginTop: 8, flexWrap: "wrap" as const,
        };

        const serverStatusItems = [
          { label: t('dashboard.status.running'), count: runningServers, color: GREEN },
          { label: t('dashboard.status.stopped'), count: stoppedServers, color: GRAY_40 },
        ];

        const storageStatusItems = [
          { label: t('common.status.active'), count: storageUsage.filter(s => s.used > 0).length, color: BLUE },
          { label: t('common.status.inactive'), count: storageUsage.filter(s => s.used === 0).length, color: GRAY_40 },
        ];

        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>

            {/* 활성 서버 */}
            <div style={cardStyle}>
              <div style={headerStyle}>
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 500 }}>{t('dashboard.kpi.activeServers')}</span>
                <div style={iconBoxStyle(PRIMARY)}><Server size={16} color={PRIMARY} /></div>
              </div>
              <div style={valueRowStyle}>
                <span style={{ fontSize: 24, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>{runningServers}</span>
                <span style={{ fontSize: 11, color: GRAY_60 }}>/{servers.length}개</span>
              </div>
              <div style={statusRowStyle}>
                <span style={{ fontSize: 11, color: GRAY_60 }}>
                  {highLoadServers > 0 && <><span style={{ color: RED, fontWeight: 600 }}>{t('dashboard.highLoad')} <strong style={{ color: RED, fontWeight: 600 }}>{highLoadServers}</strong>개</span><span style={{ color: GRAY_60 }}> · </span></>}
                  {t('dashboard.status.creating')} <strong style={{ color: GRAY_90, fontWeight: 600 }}>{creatingServers}</strong>개
                </span>
              </div>
            </div>

            {/* 활성 스토리지 */}
            <div style={cardStyle}>
              <div style={headerStyle}>
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 500 }}>{t('dashboard.kpi.activeStorage')}</span>
                <div style={iconBoxStyle(BLUE)}><Database size={16} color={BLUE} /></div>
              </div>
              <div style={valueRowStyle}>
                <span style={{ fontSize: 24, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>{storageUsage.filter(s => s.used > 0).length}</span>
                <span style={{ fontSize: 11, color: GRAY_60 }}>/{storageUsage.length}개</span>
              </div>
              <div style={statusRowStyle}>
<span style={{ fontSize: 11, color: GRAY_60 }}>{t('dashboard.totalUsage')} <strong style={{ color: GRAY_90, fontWeight: 600 }}>{((storageUsage.reduce((a, s) => a + s.used, 0)) / 1000).toFixed(1)}</strong> TB</span>
              </div>
            </div>

            {/* 크레딧 잔액 */}
            <div style={cardStyle}>
              <div style={headerStyle}>
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 500 }}>{t('dashboard.kpi.creditBalance')}</span>
                <div style={iconBoxStyle(GREEN)}><CreditCard size={16} color={GREEN} /></div>
              </div>
              <div style={valueRowStyle}>
                <span style={{ fontSize: 24, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>45,230</span>
                <span style={{ fontSize: 11, color: GRAY_60 }}>cr</span>
              </div>
              <div style={statusRowStyle}>
                <span style={{ fontSize: 11, color: GRAY_60 }}>{t('dashboard.daysRemaining', { n: 32 })}</span>
              </div>
            </div>

            {/* 오늘의 사용 */}
            <div style={cardStyle}>
              <div style={headerStyle}>
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 500 }}>{t('dashboard.kpi.todayUsage')}</span>
                <div style={iconBoxStyle(YELLOW)}><Zap size={16} color={YELLOW} /></div>
              </div>
              <div style={valueRowStyle}>
                <span style={{ fontSize: 24, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>2,000</span>
                <span style={{ fontSize: 11, color: GRAY_60 }}>cr</span>
              </div>
              <div style={statusRowStyle}>
                <span style={{ fontSize: 11, color: GRAY_60 }}>{t('dashboard.section.serverUsage')} <strong style={{ color: GRAY_90, fontWeight: 600 }}>1,740</strong> cr · {t('dashboard.kpi.activeStorage')} <strong style={{ color: GRAY_90, fontWeight: 600 }}>260</strong> cr</span>
              </div>
            </div>

          </div>
        );
      })()}

      {/* ── Row 1: 크레딧 사용 추이 + [중요 알림 / 빠른 이동] ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <SectionCard title={t('dashboard.section.creditUsage')} subtitle={t('dashboard.creditTrendSubtitle', '최근 14일 서버 및 스토리지 크레딧 사용 현황')}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, fontSize: 12, marginBottom: 16 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: GRAY_40, display: "inline-block" }} />{t('dashboard.chart.creditUsed')}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: PRIMARY, display: "inline-block" }} />{t('dashboard.section.serverUsage')}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: GREEN, display: "inline-block" }} />{t('dashboard.kpi.activeStorage')}</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={creditTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} width={36} />
              <Tooltip content={<CreditTooltip />} />
              <Bar dataKey="total" fill={GRAY_40} opacity={0.4} radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="server" stroke={PRIMARY} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="storage" stroke={GREEN} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* 중요 알림 */}
        <SectionCard title={t('dashboard.notifications.title', '주요 알림')} subtitle={t('dashboard.notifications.unread', { n: 2 })} action={
          <button type="button" onClick={() => onNavigate("workspace-overview")} style={{ fontSize: 11, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 2 }}>
            {t('dashboard.notifications.viewAll', '전체')} <ChevronRight size={12} />
          </button>
        }>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { time: "18:30", type: t('dashboard.notification.storage', '스토리지'), msg: t('dashboard.notification.storageMsg', "model-checkpoint 공유 스토리지 사용량이 99% (198 / 200 GB)에 도달했습니다."), typeColor: PRIMARY, read: false },
              { time: "11:02", type: t('dashboard.notification.credit', '크레딧'),   msg: t('dashboard.notification.creditMsg', "크레딧 잔액이 설정한 임계값(50,000cr) 미만입니다. 현재 잔액: 45,230cr"), typeColor: PRIMARY, read: false },
              { time: "7/12",  type: "GPU",      msg: t('dashboard.notification.gpuMsg', "llm-finetuning 서버의 GPU 점유율이 95%를 초과했습니다."), typeColor: PRIMARY, read: true },
            ].map((n, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid rgb(248,248,248)` : "none" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: n.read ? "transparent" : n.typeColor, marginTop: 4, flexShrink: 0, display: "inline-block" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: n.read ? GRAY_60 : n.typeColor, backgroundColor: n.read ? GRAY_5 : `${n.typeColor}15`, padding: "1px 5px", borderRadius: 4 }}>{n.type}</span>
                    <span style={{ fontSize: 10, color: GRAY_60 }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: n.read ? GRAY_60 : GRAY_90, lineHeight: 1.5 }}>{n.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Row 2: 서버 GPU 점유율 + 스토리지 현황 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <SectionCard title={t('dashboard.section.serverUsage')} subtitle={t('dashboard.gpuUsageSubtitle', '실행 중인 서버의 실시간 GPU 점유율')} action={
          <button type="button" onClick={() => onNavigate("server-list")} style={{ fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>{t('dashboard.manage', '관리')} <ChevronRight size={13} /></button>
        }>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {servers.filter(s => s.status === "running").map(s => {
              const pct = s.utilization;
              const barColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
              return (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: s.status === "running" ? `${barColor}15` : GRAY_5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Server size={13} color={s.status === "running" ? barColor : GRAY_40} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: GRAY_60, marginTop: 1 }}>{s.gpu}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.status === "running" ? barColor : GRAY_40 }}>
                        {s.status === "running" ? `${pct}%` : s.status === "creating" ? "—" : "—"}
                      </span>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s.status === "running" ? barColor : s.status === "creating" ? BLUE : GRAY_40, flexShrink: 0 }} />
                    </div>
                  </div>
                  <div style={{ height: 7, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, backgroundColor: barColor, background: s.status === "running" ? `linear-gradient(90deg, ${barColor}, ${barColor}bb)` : GRAY_30, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title={t('dashboard.section.resourceOverview')} subtitle={t('dashboard.storageSubtitle', '유형별 용량 및 사용률')} action={
          <button type="button" onClick={() => onNavigate("storage")} style={{ fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>{t('dashboard.manage', '관리')} <ChevronRight size={13} /></button>
        }>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {storageUsage.map(s => {
              const pct = Math.round(s.used / s.total * 100);
              return (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Database size={12} color={s.color} />
                      <span style={{ color: GRAY_90, fontWeight: 500 }}>{s.name}</span>
                    </div>
                    <span style={{ color: pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN, fontWeight: 600 }}>
                      {s.used >= 1000 ? `${(s.used / 1000).toFixed(1)} TB` : `${s.used} GB`} / {s.total >= 1000 ? `${(s.total / 1000).toFixed(1)} TB` : `${s.total} GB`}
                    </span>
                  </div>
                  <div style={{ height: 7, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 10, color: pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN, marginTop: 2, textAlign: "right" }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* ── Row 3: 이번 달 비용 구성 + 빠른 액션 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SectionCard title={t('dashboard.section.creditUsage')} subtitle={`총 ${totalCost.toLocaleString()} cr 사용`}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <CostDonut data={costBreakdown} total={totalCost} size={130} />
            <div style={{ flex: 1 }}>
              {costBreakdown.map(item => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid rgb(245,245,245)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: item.color }} />
                    <span style={{ fontSize: 12, color: GRAY_70 }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{item.value.toLocaleString()} cr</div>
                    <div style={{ fontSize: 10, color: GRAY_60 }}>{Math.round(item.value / totalCost * 100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t('dashboard.section.quickActions', '빠른 실행')}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { id: "create-server",  icon: <Server size={18} />,     label: t('dashboard.quickAction.createServer'),  desc: t('dashboard.quickAction.createServerDesc', 'GPU 서버 즉시 시작'),               screen: "server-create",     color: PRIMARY },
              { id: "create-storage", icon: <Database size={18} />,   label: t('dashboard.quickAction.createStorage'), desc: t('dashboard.quickAction.createStorageDesc', '멤버와 함께 쓰는 스토리지 만들기'),  screen: "storage",           color: BLUE },
              { id: "manage-members", icon: <Users size={18} />,      label: t('dashboard.quickAction.manageMembers'), desc: t('dashboard.quickAction.manageMembersDesc', '멤버를 워크스페이스에 초대하기'),    screen: "workspace-members", color: GREEN },
              { id: "view-billing",   icon: <CreditCard size={18} />, label: t('dashboard.quickAction.viewBilling'),   desc: t('dashboard.quickAction.viewBillingDesc', '크레딧을 어디에 얼마나 썼는지 확인'),  screen: "workspace-credit",  color: YELLOW },
            ].map(action => (
              <button type="button" key={action.id} onClick={() => onNavigate(action.screen)} style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
                padding: "14px 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`,
                backgroundColor: "white", cursor: "pointer", textAlign: "left", transition: "all 0.1s",
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${action.color}08`; e.currentTarget.style.borderColor = action.color; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.borderColor = GRAY_30; }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: `${action.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{action.label}</div>
                  <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>{action.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

    </PageContainer>
  );
}

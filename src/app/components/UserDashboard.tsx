import {
  ComposedChart, Bar, Cell, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Server, CreditCard, Plus, Image, ChevronRight, Zap, AlertTriangle, ArrowUpRight, Database, BellRing, LayoutDashboard, Layers } from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_80, GRAY_5, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, GREEN, BLUE, YELLOW, Badge, StatusDot, Card, PrimaryBtn, MetricCard, PageContainer, SectionCard, ListCard,
} from "./ConsoleLayout";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const servers = [
  { name: "pytorch-dev-01", status: "running" as const, gpu: "RTX A5000 ×2", utilization: 78, rate: 24 },
  { name: "llm-finetuning", status: "running" as const, gpu: "H100 SXM5 ×4", utilization: 94, rate: 96 },
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
  { name: "GPU (서버)", value: 9840, color: PRIMARY },
  { name: "로컬 스토리지", value: 780, color: BLUE },
  { name: "공유 스토리지", value: 460, color: GREEN },
  { name: "임시 스토리지", value: 320, color: YELLOW },
];

const storageUsage = [
  { name: "임시", used: 57.8, total: 110, color: BLUE },
  { name: "로컬", used: 103.6, total: 140, color: PRIMARY },
  { name: "공유", used: 920, total: 1700, color: GREEN },
];

// ─── SVG Donut chart (replaces recharts PieChart — no clipping) ───────────────
function CostDonut({ data, total, size }: { data: { name: string; value: number; color: string }[]; total: number; size: number }) {
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
        <div style={{ fontSize: size * 0.11, color: GRAY_60 }}>총 소비</div>
        <div style={{ fontSize: size * 0.14, fontWeight: 800, color: PRIMARY, lineHeight: 1.2 }}>{(total / 1000).toFixed(1)}K</div>
        <div style={{ fontSize: size * 0.09, color: GRAY_60 }}>cr</div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CreditTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const find = (k: string) => payload.find((p: any) => p.dataKey === k)?.value;
  return (
    <div style={{ background: "white", border: `1px solid ${GRAY_30}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: GRAY_60, marginBottom: 6 }}>{label}</div>
      <div style={{ color: GRAY_70, fontWeight: 600 }}>총 소비: {find("total")?.toLocaleString()} cr</div>
      <div style={{ color: PRIMARY, fontWeight: 600 }}>서버: {find("server")?.toLocaleString()} cr</div>
      <div style={{ color: GREEN, fontWeight: 600 }}>스토리지: {find("storage")?.toLocaleString()} cr</div>
    </div>
  );
};

export function UserDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const totalCost = costBreakdown.reduce((s, c) => s + c.value, 0);
  const creditBalance = 45230;
  const creditMax = 60000;
  const creditPct = Math.round(creditBalance / creditMax * 100);
  const isLow = creditPct < 30;

  const runningServers = servers.filter(s => s.status === "running").length;
  const stoppedServers = servers.filter(s => s.status === "stopped").length;
  const creatingServers = servers.filter(s => s.status === "creating").length;
  const highLoadServers = servers.filter(s => s.status === "running" && s.utilization > 80).length;
  const normalServers = servers.filter(s => s.status === "running" && s.utilization <= 80).length;

  return (
    <PageContainer
      title="Dashboard"
      subtitle="My Workspace · 오늘 2026년 7월 8일"
    >
      {/* ── 크레딧 경고 배너 (잔액 30% 미만 시) ── */}
      {isLow && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px", marginBottom: 14, borderRadius: 12,
          backgroundColor: "rgb(255,251,235)", border: `1px solid ${YELLOW}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={16} color={YELLOW} />
            <span style={{ fontSize: 13, color: GRAY_90, fontWeight: 500 }}>
              크레딧 잔액이 <strong style={{ color: YELLOW }}>{creditPct}%</strong> 남았습니다. 현재 소비 속도로 약 <strong>32일</strong> 사용 가능합니다.
            </span>
          </div>
          <button onClick={() => onNavigate("workspace-wallet")} style={{
            fontSize: 12, fontWeight: 600, color: "white", background: YELLOW, border: "none",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap",
          }}>크레딧 충전 →</button>
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

        // 서버 상태 목록 (정상/고부하/생성중/중지)
        const serverStatusItems = [
          { label: "정상", count: normalServers, color: GREEN },
          { label: "고부하", count: highLoadServers, color: RED },
          { label: "생성중", count: creatingServers, color: YELLOW },
          { label: "중지", count: stoppedServers, color: GRAY_40 },
        ].filter(i => i.count > 0);

        // 스토리지 상태 계산 (storageUsage 기반)
        const storageStatusItems = [
          { label: "정상", count: storageUsage.filter(s => s.used / s.total < 0.75).length, color: GREEN },
          { label: "주의", count: storageUsage.filter(s => s.used / s.total >= 0.75 && s.used / s.total < 0.9).length, color: YELLOW },
          { label: "위험", count: storageUsage.filter(s => s.used / s.total >= 0.9 || s.used > s.total).length, color: RED },
        ].filter(i => i.count > 0);

        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>

            {/* 활성 서버 */}
            <div style={cardStyle}>
              <div style={headerStyle}>
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 500 }}>활성 서버</span>
                <div style={iconBoxStyle(PRIMARY)}><Server size={16} color={PRIMARY} /></div>
              </div>
              <div style={valueRowStyle}>
                <span style={{ fontSize: 24, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>{runningServers}</span>
                <span style={{ fontSize: 11, color: GRAY_60 }}>/ {servers.length}개 실행 중</span>
              </div>
              <div style={statusRowStyle}>
                {serverStatusItems.map((item, i) => (
                  <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {i > 0 && <span style={{ fontSize: 11, color: GRAY_40 }}>·</span>}
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: GRAY_70 }}>{item.label} {item.count}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 활성 스토리지 */}
            <div style={cardStyle}>
              <div style={headerStyle}>
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 500 }}>활성 스토리지</span>
                <div style={iconBoxStyle(BLUE)}><Database size={16} color={BLUE} /></div>
              </div>
              <div style={valueRowStyle}>
                <span style={{ fontSize: 24, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>5</span>
                <span style={{ fontSize: 11, color: GRAY_60 }}>로컬 2 · 공유 3</span>
              </div>
              <div style={statusRowStyle}>
                {storageStatusItems.map((item, i) => (
                  <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {i > 0 && <span style={{ fontSize: 11, color: GRAY_40 }}>·</span>}
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: GRAY_70 }}>{item.label} {item.count}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 크레딧 잔액 */}
            <div style={cardStyle}>
              <div style={headerStyle}>
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 500 }}>크레딧 잔액</span>
                <div style={iconBoxStyle(GREEN)}><CreditCard size={16} color={GREEN} /></div>
              </div>
              <div style={valueRowStyle}>
                <span style={{ fontSize: 24, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>45,230</span>
                <span style={{ fontSize: 11, color: GRAY_60 }}>cr</span>
              </div>
              <div style={statusRowStyle}>
                <span style={{ fontSize: 11, color: GRAY_60 }}>현재 속도로 약 <strong style={{ color: GRAY_90, fontWeight: 600 }}>32일</strong> 사용 가능</span>
              </div>
            </div>

            {/* 오늘의 소비 */}
            <div style={cardStyle}>
              <div style={headerStyle}>
                <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 500 }}>오늘의 소비</span>
                <div style={iconBoxStyle(YELLOW)}><Zap size={16} color={YELLOW} /></div>
              </div>
              <div style={valueRowStyle}>
                <span style={{ fontSize: 24, fontWeight: 700, color: GRAY_90, lineHeight: 1 }}>2,000</span>
                <span style={{ fontSize: 11, color: GRAY_60 }}>cr</span>
              </div>
              <div style={statusRowStyle}>
                <span style={{ fontSize: 11, color: GRAY_60 }}>서버 <strong style={{ color: GRAY_90, fontWeight: 600 }}>1,740</strong> · 스토리지 <strong style={{ color: GRAY_90, fontWeight: 600 }}>260</strong></span>
              </div>
            </div>

          </div>
        );
      })()}

      {/* ── Row 1: 크레딧 소비 추이 + [중요 알림 / 빠른 이동] ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <SectionCard title="크레딧 소비 추이" subtitle="최근 2주 일별 소비량 · 서버 및 스토리지 분류">
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, fontSize: 12, marginBottom: 16 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: GRAY_40, display: "inline-block" }} />총 소비</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: PRIMARY, display: "inline-block" }} />서버</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: GREEN, display: "inline-block" }} />스토리지</span>
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
        <SectionCard title="중요 알림" subtitle="미확인 2건" action={
          <button onClick={() => onNavigate("notifications")} style={{ fontSize: 11, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 2 }}>
            전체 <ChevronRight size={12} />
          </button>
        }>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { time: "14:32", type: "서버", msg: "llm-finetuning이 Running으로 전환됨", typeColor: PRIMARY },
              { time: "10:15", type: "크레딧", msg: "크레딧 잔액 50,000cr 미만 (45,230cr)", typeColor: "rgb(180,80,0)" },
            ].map((n, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid rgb(248,248,248)` : "none" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: PRIMARY, marginTop: 4, flexShrink: 0, display: "inline-block" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: n.typeColor, backgroundColor: `${n.typeColor}15`, padding: "1px 5px", borderRadius: 4 }}>{n.type}</span>
                    <span style={{ fontSize: 10, color: GRAY_60 }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: GRAY_90, lineHeight: 1.5 }}>{n.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Row 2: 서버 GPU 점유율 + 스토리지 현황 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <SectionCard title="서버별 GPU 점유율" subtitle="실행 중인 서버의 실시간 GPU 사용률" action={
          <button onClick={() => onNavigate("server-list")} style={{ fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>관리 <ChevronRight size={13} /></button>
        }>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {servers.slice(0, 3).map(s => {
              const pct = s.utilization;
              const barColor = pct > 90 ? RED : pct > 70 ? YELLOW : PRIMARY;
              return (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: s.status === "running" ? `${barColor}15` : GRAY_5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Server size={13} color={s.status === "running" ? barColor : GRAY_40} />
                      </div>
                      <div>
                        <div style={{ fontFamily: "Roboto Mono, monospace", fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: GRAY_60, marginTop: 1 }}>{s.gpu}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.status === "running" ? barColor : GRAY_40 }}>
                        {s.status === "running" ? `${pct}%` : s.status === "creating" ? "—" : "—"}
                      </span>
                      <StatusDot status={s.status} />
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

        <SectionCard title="스토리지 현황" subtitle="유형별 사용률" action={
          <button onClick={() => onNavigate("storage-overview")} style={{ fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>관리 <ChevronRight size={13} /></button>
        }>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {storageUsage.map(s => {
              const pct = Math.round(s.used / s.total * 100);
              return (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Database size={12} color={s.color} />
                      <span style={{ color: GRAY_90, fontWeight: 500 }}>{s.name} 스토리지</span>
                    </div>
                    <span style={{ color: pct > 90 ? RED : GRAY_70, fontWeight: 600 }}>
                      {s.used >= 1000 ? `${(s.used / 1000).toFixed(1)} TB` : `${s.used} GB`} / {s.total >= 1000 ? `${(s.total / 1000).toFixed(1)} TB` : `${s.total} GB`}
                    </span>
                  </div>
                  <div style={{ height: 7, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct > 90 ? RED : s.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 10, color: pct > 90 ? RED : GRAY_60, marginTop: 2, textAlign: "right" }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* ── Row 3: 이번 달 비용 구성 + 빠른 액션 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SectionCard title="이번 달 비용 구성" subtitle={`총 ${totalCost.toLocaleString()} cr 소비`}>
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

        <SectionCard title="빠른 액션">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: <Plus size={18} />, label: "새 서버 생성", desc: "GPU 서버 즉시 시작", screen: "server-list", color: PRIMARY },
              { icon: <Image size={18} />, label: "Gallery 탐색", desc: "이미지·템플릿 검색", screen: "gallery", color: BLUE },
              { icon: <CreditCard size={18} />, label: "크레딧 충전", desc: "잔액을 보충하세요", screen: "workspace-wallet", color: GREEN },
              { icon: <Zap size={18} />, label: "스토리지 관리", desc: "볼륨 용량 확인", screen: "storage-overview", color: YELLOW },
            ].map(action => (
              <button key={action.label} onClick={() => onNavigate(action.screen)} style={{
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

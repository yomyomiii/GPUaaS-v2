import {
  ComposedChart, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Server, CreditCard, Clock, TrendingUp, Plus, Image, ChevronRight, Zap, AlertTriangle, ArrowUpRight, Database, Cpu } from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_80, GRAY_5, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, GREEN, BLUE, YELLOW, Badge, StatusDot, Card, PrimaryBtn, MetricCard, PageContainer,
} from "./ConsoleLayout";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const servers = [
  { name: "pytorch-dev-01", status: "running" as const, gpu: "RTX A5000 ×2", utilization: 78, rate: 24 },
  { name: "llm-finetuning", status: "running" as const, gpu: "H100 SXM5 ×4", utilization: 94, rate: 96 },
  { name: "stable-diffusion", status: "stopped" as const, gpu: "RTX 4090 ×1", utilization: 0, rate: 0 },
  { name: "data-preprocess", status: "creating" as const, gpu: "A100 SXM4 ×2", utilization: 0, rate: 48 },
];

const creditTrend = [
  { day: "7/1", used: 980, balance: 55230 },
  { day: "7/2", used: 1340, balance: 53890 },
  { day: "7/3", used: 1120, balance: 52770 },
  { day: "7/4", used: 1580, balance: 51190 },
  { day: "7/5", used: 1820, balance: 49370 },
  { day: "7/6", used: 2140, balance: 47230 },
  { day: "7/7", used: 2000, balance: 45230 },
];

const costBreakdown = [
  { name: "GPU (서버)", value: 9840, color: PRIMARY },
  { name: "로컬 스토리지", value: 780, color: BLUE },
  { name: "공유 스토리지", value: 460, color: GREEN },
  { name: "임시 스토리지", value: 320, color: YELLOW },
];

const hourlyUsage = [
  { h: "00", cr: 180 }, { h: "02", cr: 120 }, { h: "04", cr: 60 },
  { h: "06", cr: 80 }, { h: "08", cr: 310 }, { h: "10", cr: 420 },
  { h: "12", cr: 390 }, { h: "14", cr: 440 }, { h: "16", cr: 410 },
  { h: "18", cr: 350 }, { h: "20", cr: 290 }, { h: "22", cr: 220 },
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
  return (
    <div style={{ background: "white", border: `1px solid ${GRAY_30}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: GRAY_60, marginBottom: 4 }}>{label}</div>
      <div style={{ color: PRIMARY, fontWeight: 700 }}>잔액: {payload[0]?.value?.toLocaleString()} cr</div>
      <div style={{ color: RED, fontWeight: 600 }}>소비: {payload[1]?.value?.toLocaleString()} cr</div>
    </div>
  );
};

const HourlyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: `1px solid ${GRAY_30}`, borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: GRAY_60 }}>{label}시</div>
      <div style={{ color: PRIMARY, fontWeight: 700 }}>{payload[0]?.value} cr</div>
    </div>
  );
};

export function UserDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const totalCost = costBreakdown.reduce((s, c) => s + c.value, 0);
  const creditBalance = 45230;
  const creditMax = 60000;
  const creditPct = Math.round(creditBalance / creditMax * 100);
  const isLow = creditPct < 30;

  return (
    <PageContainer
      title="Dashboard"
      subtitle="My Workspace · 오늘 2026년 7월 8일"
      actions={
        <PrimaryBtn size="small" onClick={() => onNavigate("server-list")}>
          <Plus size={14} /> 서버 생성
        </PrimaryBtn>
      }
    >
      {/* ── 크레딧 경고 배너 (잔액 30% 미만 시) ── */}
      {isLow && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px", marginBottom: 20, borderRadius: 12,
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <MetricCard label="활성 서버" value="2" sub="전체 4개 중 2개 실행 중" icon={<Server size={18} />} color={PRIMARY} trend={{ up: true, text: "+1 전일 대비" }} />
        <MetricCard label="크레딧 잔액" value="45,230" sub="≈ 452,300원 / 약 32일" icon={<CreditCard size={18} />} color={GREEN} />
        <MetricCard label="이번 달 소비" value="11,400" sub="cr · 전월 9,200 cr 대비 +24%" icon={<TrendingUp size={18} />} color={BLUE} trend={{ up: false, text: "+24% 전월 대비" }} />
        <MetricCard label="오늘 소비" value="2,000" sub="cr · 시간당 평균 280 cr" icon={<Clock size={18} />} color={YELLOW} />
      </div>

      {/* ── Row 1: 크레딧 트렌드 + 빠른 액션 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* 크레딧 잔액 & 소비 추이 */}
        <Card style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>크레딧 잔액 추이</div>
              <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>최근 7일 잔액 변화 및 일별 소비량</div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: PRIMARY, display: "inline-block" }} />잔액</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: RED, display: "inline-block" }} />소비</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={creditTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CreditTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="balance" stroke={PRIMARY} strokeWidth={2} fill="url(#balanceGrad)" />
              <Bar yAxisId="right" dataKey="used" fill={RED} opacity={0.6} radius={[3, 3, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* 빠른 액션 */}
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 14 }}>빠른 액션</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: <Plus size={15} />, label: "새 서버 생성", desc: "GPU 서버를 즉시 시작", screen: "server-list", color: PRIMARY },
              { icon: <Image size={15} />, label: "Gallery 탐색", desc: "이미지·템플릿 검색", screen: "gallery", color: BLUE },
              { icon: <CreditCard size={15} />, label: "크레딧 충전", desc: "잔액을 보충하세요", screen: "workspace-wallet", color: GREEN },
              { icon: <Zap size={15} />, label: "스토리지 관리", desc: "볼륨 용량 확인", screen: "storage-overview", color: YELLOW },
            ].map(action => (
              <button key={action.label} onClick={() => onNavigate(action.screen)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10, border: `1px solid ${GRAY_30}`, backgroundColor: "white",
                cursor: "pointer", textAlign: "left", transition: "all 0.1s",
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; e.currentTarget.style.borderColor = action.color; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.borderColor = GRAY_30; }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${action.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{action.label}</div>
                  <div style={{ fontSize: 11, color: GRAY_60 }}>{action.desc}</div>
                </div>
                <ArrowUpRight size={14} color={GRAY_40} style={{ marginLeft: "auto" }} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Row 2: 서버 GPU 점유율 + 이번 달 비용 구성 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* 서버 GPU 점유율 */}
        <Card style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>서버별 GPU 점유율</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>실행 중인 서버의 실시간 GPU 사용률</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {servers.map(s => {
              const pct = s.utilization;
              const barColor = pct > 90 ? RED : pct > 70 ? YELLOW : PRIMARY;
              return (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontFamily: "Roboto Mono, monospace", fontSize: 12, fontWeight: 600, color: GRAY_90 }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: GRAY_60, marginLeft: 8 }}>{s.gpu}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {s.status === "running" && s.rate > 0 && (
                        <span style={{ fontSize: 11, color: PRIMARY, fontWeight: 600 }}>{s.rate} cr/h</span>
                      )}
                      <StatusDot status={s.status} />
                    </div>
                  </div>
                  <div style={{ height: 8, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`, borderRadius: 4,
                      backgroundColor: barColor,
                      background: s.status === "running" ? `linear-gradient(90deg, ${barColor}, ${barColor}bb)` : GRAY_30,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                    <span style={{ fontSize: 10, color: GRAY_60 }}>
                      {s.status === "running" ? `${pct}% 사용 중` : s.status === "creating" ? "생성 중..." : "정지됨"}
                    </span>
                    {s.status === "running" && (
                      <span style={{ fontSize: 10, color: pct > 90 ? RED : GRAY_60 }}>
                        {pct > 90 ? "⚠ 고부하" : pct > 70 ? "양호" : "여유"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 이번 달 비용 구성 */}
        <Card style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>이번 달 비용 구성</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 8 }}>총 {totalCost.toLocaleString()} cr 소비</div>
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
        </Card>
      </div>

      {/* ── Row 3: 오늘 시간대별 소비 + 스토리지 현황 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14 }}>
        {/* 시간대별 크레딧 소비 */}
        <Card style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90, marginBottom: 4 }}>오늘 시간대별 크레딧 소비</div>
          <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 16 }}>시간당 평균 280 cr</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={hourlyUsage} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" vertical={false} />
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} />
              <YAxis tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} />
              <Tooltip content={<HourlyTooltip />} />
              <Bar dataKey="cr" radius={[4, 4, 0, 0]}>
                {hourlyUsage.map((entry, i) => (
                  <Cell key={i} fill={entry.cr === Math.max(...hourlyUsage.map(h => h.cr)) ? PRIMARY : `${PRIMARY}66`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 스토리지 현황 */}
        <Card style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>스토리지 현황</div>
              <div style={{ fontSize: 12, color: GRAY_60, marginTop: 2 }}>유형별 사용률</div>
            </div>
            <button onClick={() => onNavigate("storage-overview")} style={{
              fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 3,
            }}>관리 <ChevronRight size={13} /></button>
          </div>
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
        </Card>
      </div>
    </PageContainer>
  );
}

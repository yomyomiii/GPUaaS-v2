import { useState } from "react";
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Plus, Play, Square, Trash2, ExternalLink, AlertTriangle, ChevronRight, ChevronUp,
  Terminal, Cpu, Database, HardDrive, Share2, Zap, Clock, Calendar, CreditCard, LayoutGrid, List, Search, Star, Layers,
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_80, GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, GREEN, BLUE, YELLOW, Badge, StatusDot, Card, PrimaryBtn, TabBar, PageContainer, SectionCard, ListCard,
} from "./ConsoleLayout";

const PURPLE = "rgb(124, 58, 237)";
const PURPLE_10 = "rgb(237, 233, 254)";

// 관리자 콘솔에서 설정 가능한 로컬 스토리지 여유 용량 (이미지 최소 요구량 + 이 값이 기본값)
const LOCAL_STORAGE_BUFFER_GB = 5;

// ─── Mock data ────────────────────────────────────────────────────────────────
const servers = [
  {
    id: "s1", name: "pytorch-dev-01", status: "running" as const,
    gpu: "RTX A5000", gpuCnt: 2, vram: "48GB", vramUsedPct: 61,
    gpuUtil: [78, 72], image: "PyTorch 2.1 + CUDA 12.1",
    uptime: "5h 32m", uptimeSec: 19934, rate: 24, remaining: 1884,
    localStorage: "10GB", sharedStorage: "none", tmpStorage: "20GB",
    tmpUsed: 14.2, localUsed: 6.8, created: "2026-07-08 09:00:00", stoppedAt: null as string | null,
    jupyterUrl: "https://pytorch-dev-01.jupyter.neurostack.io",
    vscodeUrl: "https://pytorch-dev-01.vscode.neurostack.io",
  },
  {
    id: "s2", name: "llm-finetuning", status: "running" as const,
    gpu: "H100 SXM5", gpuCnt: 4, vram: "320GB", vramUsedPct: 83,
    gpuUtil: [94, 91, 89, 96], image: "LLaMA Fine-tuning v2",
    uptime: "2h 15m", uptimeSec: 8103, rate: 96, remaining: 471,
    localStorage: "100GB", sharedStorage: "team-shared-01", tmpStorage: "50GB",
    tmpUsed: 38.5, localUsed: 67.3, created: "2026-07-08 12:17:44", stoppedAt: null as string | null,
    jupyterUrl: "https://llm-finetuning.jupyter.neurostack.io",
    vscodeUrl: "https://llm-finetuning.vscode.neurostack.io",
  },
  {
    id: "s3", name: "stable-diffusion", status: "stopped" as const,
    gpu: "RTX 4090", gpuCnt: 1, vram: "24GB", vramUsedPct: 0,
    gpuUtil: [0], image: "Stable Diffusion WebUI",
    uptime: "—", uptimeSec: 0, rate: 0, remaining: 0,
    localStorage: "none", sharedStorage: "none", tmpStorage: "30GB",
    tmpUsed: 0, localUsed: 0, created: "2026-07-05 14:22:09", stoppedAt: "2026-07-10 18:45:33" as string | null,
    jupyterUrl: "", vscodeUrl: "",
  },
  {
    id: "s4", name: "data-preprocess", status: "creating" as const,
    gpu: "A100 SXM4", gpuCnt: 2, vram: "80GB", vramUsedPct: 0,
    gpuUtil: [0, 0], image: "TensorFlow 2.15",
    uptime: "—", uptimeSec: 0, rate: 48, remaining: 943,
    localStorage: "50GB", sharedStorage: "team-shared-01", tmpStorage: "40GB",
    tmpUsed: 0, localUsed: 0, created: "2026-07-08 14:30:05", stoppedAt: null as string | null,
    jupyterUrl: "", vscodeUrl: "",
  },
];

const gpuHistory = [
  { t: "5m",  util: 65, mem: 55, ram: 72, cpu: 45 },
  { t: "10m", util: 72, mem: 58, ram: 68, cpu: 52 },
  { t: "15m", util: 80, mem: 60, ram: 71, cpu: 58 },
  { t: "20m", util: 75, mem: 59, ram: 74, cpu: 50 },
  { t: "25m", util: 90, mem: 62, ram: 70, cpu: 63 },
  { t: "30m", util: 78, mem: 61, ram: 69, cpu: 55 },
];

// ─── Server Create catalogs ───────────────────────────────────────────────────
const SC_IMAGE_CATALOG = [
  { id: "i1", name: "PyTorch 2.1 + CUDA 12.1", tier: "Official" as const, category: "ML/DL", thumb: "🔵",
    desc: "PyTorch 2.1과 CUDA 12.1이 사전 설치된 공식 딥러닝 개발 환경.", access: ["JupyterLab"], tags: ["PyTorch", "CUDA", "JupyterLab"], used: 847, rating: 4.9 },
  { id: "i2", name: "TensorFlow 2.15", tier: "Official" as const, category: "ML/DL", thumb: "🟡",
    desc: "TensorFlow 2.15 및 Keras를 포함한 완전한 ML 개발 환경.", access: ["JupyterLab"], tags: ["TensorFlow", "Keras"], used: 623, rating: 4.7 },
  { id: "i3", name: "LLaMA Fine-tuning v2", tier: "Verified" as const, category: "LLM", thumb: "🟣",
    desc: "Meta LLaMA 시리즈 모델을 LoRA/QLoRA로 파인튜닝하기 위한 최적화 환경.", access: ["JupyterLab"], tags: ["LLaMA", "LoRA", "QLoRA"], used: 412, rating: 4.8 },
  { id: "i4", name: "Stable Diffusion WebUI", tier: "Verified" as const, category: "CV", thumb: "🟠",
    desc: "AUTOMATIC1111 Stable Diffusion WebUI와 ControlNet을 지원합니다.", access: ["JupyterLab"], tags: ["Stable Diffusion", "ControlNet"], used: 389, rating: 4.6 },
  { id: "i5", name: "NLP Toolkit", tier: "Verified" as const, category: "NLP", thumb: "🟤",
    desc: "HuggingFace Transformers, Datasets, Tokenizers가 사전 설치된 NLP 환경.", access: ["JupyterLab"], tags: ["HuggingFace", "BERT", "GPT"], used: 278, rating: 4.5 },
  { id: "i6", name: "Data Science Pro", tier: "Official" as const, category: "Data Science", thumb: "🟢",
    desc: "데이터 분석·시각화·머신러닝을 위한 올인원 데이터 과학 환경.", access: ["JupyterLab"], tags: ["Pandas", "Scikit-learn"], used: 356, rating: 4.8 },
];

const SC_GPU_OPTIONS = [
  { name: "RTX A5000", vram: "24GB", available: 6, ratePerGpu: 12, desc: "일반 학습·추론·개발에 적합" },
  { name: "A100 SXM4", vram: "80GB", available: 4, ratePerGpu: 24, desc: "대규모 모델 학습에 최적" },
  { name: "H100 SXM5", vram: "80GB", available: 8, ratePerGpu: 52, desc: "최신 대형 LLM 학습·추론" },
  { name: "RTX 4090", vram: "24GB", available: 3, ratePerGpu: 21, desc: "이미지 생성·추론에 적합" },
];

// Template per image — 1:1 relationship. Templates specify recommended settings, NOT specific GPU.
const IMAGE_TEMPLATES: Record<string, { name: string; recVram: string; recTmp: number; hasLocal: boolean; localGB: number; hasShared: boolean; envVars: string; desc: string }> = {
  "i1": { name: "PyTorch LLM 학습 환경", recVram: "80GB+", recTmp: 30, hasLocal: true, localGB: 100, hasShared: false, envVars: "WANDB_API_KEY=\nHF_TOKEN=", desc: "LLM 학습에 최적화된 PyTorch 기반 사전 구성" },
  "i3": { name: "LLaMA 파인튜닝 환경", recVram: "80GB+", recTmp: 50, hasLocal: true, localGB: 200, hasShared: false, envVars: "HF_TOKEN=\nWANDB_API_KEY=", desc: "H100 권장 LLM 파인튜닝 전용 사전 구성" },
  "i4": { name: "SD WebUI 이미지 생성", recVram: "24GB+", recTmp: 20, hasLocal: true, localGB: 50, hasShared: false, envVars: "", desc: "이미지 생성을 위한 SD WebUI 사전 구성" },
  "i6": { name: "팀 데이터 분석 환경", recVram: "24GB+", recTmp: 10, hasLocal: true, localGB: 20, hasShared: true, envVars: "", desc: "공유 스토리지 연결 팀용 데이터 분석 환경" },
};

type SCImage = typeof SC_IMAGE_CATALOG[0];
type SCGpu = typeof SC_GPU_OPTIONS[0];

// ─── Util bar ─────────────────────────────────────────────────────────────────
function UtilBar({ pct, height = 6 }: { pct: number; color?: string; height?: number }) {
  const c = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
  return (
    <div style={{ height, backgroundColor: GRAY_5, borderRadius: height, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: c, borderRadius: height, transition: "width 0.3s" }} />
    </div>
  );
}

// ─── Access button ────────────────────────────────────────────────────────────
function AccessBtn({ label, icon, url, enabled }: { label: string; icon: React.ReactNode; url: string; enabled: boolean }) {
  return (
    <button type="button"
      onClick={() => enabled && window.open(url, "_blank")}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
        borderRadius: 8, border: `1px solid ${enabled ? PRIMARY : GRAY_30}`,
        backgroundColor: enabled ? PRIMARY_10 : GRAY_5,
        color: enabled ? PRIMARY : GRAY_40,
        cursor: enabled ? "pointer" : "default",
        fontSize: 12, fontWeight: 600, transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (enabled) e.currentTarget.style.backgroundColor = "rgb(230,228,255)"; }}
      onMouseLeave={e => { if (enabled) e.currentTarget.style.backgroundColor = PRIMARY_10; }}
      title={enabled ? url : "서버 실행 중에만 접속 가능"}
    >
      {icon}
      {label}
      {enabled && <ExternalLink size={11} />}
    </button>
  );
}

// ─── Section number circle ────────────────────────────────────────────────────
const SectionNum = ({ n }: { n: number }) => (
  <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: PRIMARY, color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    {n}
  </div>
);

// ─── Image Gallery Picker ─────────────────────────────────────────────────────
function ImageGalleryPicker({ images, selectedId, onSelect }: {
  images: SCImage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("전체");
  const [tierFilter, setTierFilter] = useState("전체");
  const [sort, setSort] = useState<"used" | "rating" | "name">("used");

  const cats = ["전체", "ML/DL", "LLM", "CV", "NLP", "Data Science"];
  const tiers = ["전체", "Official", "Verified"];

  const filtered = images
    .filter(img => {
      const matchCat = catFilter === "전체" || img.category === catFilter;
      const matchTier = tierFilter === "전체" || img.tier === tierFilter;
      const matchSearch = !search ||
        img.name.toLowerCase().includes(search.toLowerCase()) ||
        img.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchTier && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.used - a.used;
    });

  return (
    <div>
      {/* Search + Sort */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={13} color={GRAY_60} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input type="text" placeholder="이름, 태그 검색" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", height: 36, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, outline: "none", boxSizing: "border-box", color: GRAY_90 }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          style={{ height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_70, cursor: "pointer", outline: "none", backgroundColor: "white" }}>
          <option value="used">사용 많은순</option>
          <option value="rating">평점순</option>
          <option value="name">이름순</option>
        </select>
      </div>
      {/* Category + Tier filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
          {cats.map(cat => (
            <button type="button" key={cat} onClick={() => setCatFilter(cat)} style={{
              padding: "3px 10px", borderRadius: 999, border: `1px solid ${catFilter === cat ? PRIMARY : GRAY_30}`,
              backgroundColor: catFilter === cat ? PRIMARY_10 : "white",
              color: catFilter === cat ? PRIMARY : GRAY_70,
              fontSize: 11, fontWeight: catFilter === cat ? 700 : 400, cursor: "pointer",
            }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 2, backgroundColor: GRAY_5, padding: "3px", borderRadius: 8, flexShrink: 0 }}>
          {tiers.map(t => (
            <button type="button" key={t} onClick={() => setTierFilter(t)} style={{
              padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 500,
              backgroundColor: tierFilter === t ? PRIMARY : "transparent",
              color: tierFilter === t ? "white" : GRAY_70,
            }}>{t}</button>
          ))}
        </div>
      </div>
      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: GRAY_60, fontSize: 13 }}>검색 결과가 없습니다.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {filtered.map(img => {
            const isSel = selectedId === img.id;
            const hasTemplate = Boolean(IMAGE_TEMPLATES[img.id]);
            return (
              <button type="button" key={img.id} onClick={() => onSelect(img.id)} style={{
                padding: "12px", borderRadius: 10, textAlign: "left",
                border: `2px solid ${isSel ? PRIMARY : GRAY_30}`,
                backgroundColor: isSel ? PRIMARY_10 : "white",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: isSel ? `0 0 0 3px ${PRIMARY}18` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: isSel ? "white" : GRAY_5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{img.thumb}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: GRAY_90, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</div>
                    <div style={{ display: "flex", gap: 3 }}>
                      <Badge color={img.tier === "Official" ? "primary" : "success"}>{img.tier}</Badge>
                      <Badge color="neutral">{img.category}</Badge>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: GRAY_60, lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{img.desc}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {img.tags.slice(0, 2).map(t => (
                      <span key={t} style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, backgroundColor: isSel ? "white" : GRAY_5, color: GRAY_60, border: `1px solid ${GRAY_30}` }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6, fontSize: 10, color: GRAY_60, flexShrink: 0, marginLeft: 4 }}>
                    <span>⭐ {img.rating}</span>
                    {hasTemplate && <span style={{ color: PRIMARY, fontWeight: 600 }}>🚀</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── GPU Picker ────────────────────────────────────────────────────────────────
function GPUPicker({ options, selectedName, onSelect, gpuCount, onCountChange }: {
  options: SCGpu[];
  selectedName: string;
  onSelect: (name: string) => void;
  gpuCount: number;
  onCountChange: (count: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [vramFilter, setVramFilter] = useState("전체");
  const [sort, setSort] = useState<"price" | "vram" | "avail">("price");

  const vrams = ["전체", "80GB", "24GB"];

  const filtered = options
    .filter(gpu => {
      const matchVram = vramFilter === "전체" || gpu.vram === vramFilter;
      const matchSearch = !search || gpu.name.toLowerCase().includes(search.toLowerCase());
      return matchVram && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "vram") return parseInt(b.vram) - parseInt(a.vram);
      if (sort === "avail") return b.available - a.available;
      return a.ratePerGpu - b.ratePerGpu;
    });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={12} color={GRAY_60} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input type="text" placeholder="GPU 이름 검색" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", height: 32, paddingLeft: 26, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, outline: "none", boxSizing: "border-box", color: GRAY_90 }} />
        </div>
        <div style={{ display: "flex", gap: 2, backgroundColor: GRAY_5, padding: "3px", borderRadius: 8 }}>
          {vrams.map(v => (
            <button type="button" key={v} onClick={() => setVramFilter(v)} style={{
              padding: "2px 8px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 500,
              backgroundColor: vramFilter === v ? PRIMARY : "transparent",
              color: vramFilter === v ? "white" : GRAY_70,
            }}>{v}</button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          style={{ height: 32, padding: "0 8px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 11, color: GRAY_70, cursor: "pointer", outline: "none", backgroundColor: "white" }}>
          <option value="price">가격순</option>
          <option value="vram">vRAM순</option>
          <option value="avail">가용순</option>
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {filtered.map(gpu => {
          const isSel = selectedName === gpu.name;
          return (
            <button type="button" key={gpu.name} onClick={() => onSelect(gpu.name)} style={{
              padding: "12px 14px", borderRadius: 10, textAlign: "left",
              border: `2px solid ${isSel ? PRIMARY : GRAY_30}`,
              backgroundColor: isSel ? PRIMARY_10 : "white",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: GRAY_90 }}>{gpu.name}</span>
                <Badge color="neutral">VRAM {gpu.vram}</Badge>
              </div>
              <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 6 }}>{gpu.desc}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>{gpu.ratePerGpu} cr/GPU/h</span>
                <Badge color={gpu.available > 4 ? "success" : "warning"}>가용 {gpu.available}개</Badge>
              </div>
              {isSel && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${GRAY_30}` }}>
                  <span style={{ fontSize: 11, color: GRAY_60, flex: 1 }}>수량</span>
                  <button type="button" onClick={e => { e.stopPropagation(); onCountChange(Math.max(1, gpuCount - 1)); }} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${GRAY_30}`, backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, lineHeight: 1 }}>−</button>
                  <span style={{ width: 24, textAlign: "center", fontWeight: 700, color: PRIMARY, fontSize: 14 }}>{gpuCount}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); onCountChange(Math.min(gpu.available, gpuCount + 1)); }} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${GRAY_30}`, backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, lineHeight: 1 }}>+</button>
                  <span style={{ fontSize: 11, color: PRIMARY, fontWeight: 600, minWidth: 60, textAlign: "right" }}>{gpu.ratePerGpu * gpuCount} cr/h</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Server Card (list item) ──────────────────────────────────────────────────
function ServerCard({ s, onDetail }: { s: typeof servers[0]; onDetail: () => void }) {
  const avgUtil = s.gpuUtil.length ? Math.round(s.gpuUtil.reduce((a, b) => a + b, 0) / s.gpuUtil.length) : 0;
  const isRunning = s.status === "running";
  const isHigh = avgUtil > 90;
  const [gpuOpen, setGpuOpen] = useState(true);

  return (
    <Card hover style={{ padding: 0, overflow: "hidden" }}>

      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: (isRunning || s.status === "creating" || s.status === "stopped") ? 16 : 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    backgroundColor: isRunning ? (isHigh ? RED : GREEN) : s.status === "creating" ? PURPLE : GRAY_30,
                    boxShadow: isHigh ? `0 0 0 3px ${RED}25, 0 0 10px 3px ${RED}45` : "none",
                  }} />
                  {isHigh && (
                    <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `2px solid ${RED}`, animation: "pulse 2s infinite", opacity: 0.8 }} />
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: GRAY_90 }}>{s.name}</span>
                {isHigh && <Badge color="danger">⚠ 고부하</Badge>}
                {s.status === "creating" && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: PURPLE, backgroundColor: PURPLE_10, borderRadius: 9999, padding: "2px 8px" }}>생성 중...</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: GRAY_60, paddingLeft: 18 }}>{s.image} &nbsp;·&nbsp; {s.gpu} × {s.gpuCnt} &nbsp;·&nbsp; VRAM {s.vram}</div>
              {s.status === "stopped" && s.stoppedAt && (
                <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", backgroundColor: "rgb(242,242,242)", borderRadius: 6, fontSize: 11, color: GRAY_60, marginLeft: 18, marginTop: 4 }}>
                  {s.stoppedAt} 중지됨
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 12 }}>
            <AccessBtn label="접속" icon={<Terminal size={12} />} url={s.jupyterUrl} enabled={isRunning} />
            <button type="button" onClick={onDetail} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, backgroundColor: "white", color: GRAY_70, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
              상세 <ChevronRight size={12} />
            </button>
            {isRunning && (
              <button type="button" style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, backgroundColor: "white", color: GRAY_70, cursor: "pointer", fontSize: 12 }}>
                <Square size={12} /> 중지
              </button>
            )}
            {s.status === "stopped" && (
              <>
                <button type="button" style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid ${GREEN}`, backgroundColor: "rgb(240,253,244)", color: GREEN, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  <Play size={12} /> 시작
                </button>
                <button type="button" style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid rgb(220,38,38)`, backgroundColor: "rgb(255,242,242)", color: "rgb(220,38,38)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  <Trash2 size={12} /> 삭제
                </button>
              </>
            )}
          </div>
        </div>

        {isRunning && (
          <div style={{ marginBottom: 16, padding: "12px 16px", backgroundColor: "rgba(0,0,0,0.018)", borderRadius: 10 }}>
            <div
              onClick={() => setGpuOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: gpuOpen ? 12 : 0 }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: GRAY_60, letterSpacing: "0.04em" }}>GPU 모니터링</span>
              <ChevronUp size={13} color={GRAY_60} style={{ transform: gpuOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.15s" }} />
            </div>
            {gpuOpen && (
              <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                {s.gpuUtil.map((u, i) => {
                  const uColor = u > 90 ? RED : u > 75 ? YELLOW : PRIMARY;
                  const vramPct = Math.min(100, Math.max(0, s.vramUsedPct + (i % 2 === 0 ? 2 : -2)));
                  const vColor = vramPct > 90 ? RED : vramPct > 75 ? YELLOW : BLUE;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 0 }}>
                      {i > 0 && <div style={{ width: 32, flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: GRAY_60, marginBottom: 8, letterSpacing: "0.04em" }}>GPU {i}</div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRAY_60, marginBottom: 4 }}>
                            <span>점유율</span><span style={{ fontWeight: 700, color: uColor }}>{u}%</span>
                          </div>
                          <UtilBar pct={u} color={uColor} height={7} />
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRAY_60, marginBottom: 4 }}>
                            <span>VRAM</span><span style={{ fontWeight: 700, color: vColor }}>{vramPct}%</span>
                          </div>
                          <UtilBar pct={vramPct} color={vColor} height={7} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(isRunning || s.status === "creating" || s.status === "stopped") && (
          <div style={{ display: "flex", gap: 28, fontSize: 12 }}>
            {isRunning ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Calendar size={12} color={GRAY_60} /><span>Created At <strong style={{ color: GRAY_90 }}>{s.created}</strong></span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Clock size={12} color={GRAY_60} /><span>Uptime <strong style={{ color: GRAY_90 }}>{s.uptime}</strong></span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Zap size={12} color={PRIMARY} /><span>소비 속도 <strong style={{ color: PRIMARY }}>{s.rate} cr/h</strong></span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><HardDrive size={12} color={GRAY_60} /><span>Local <strong>{s.tmpUsed}GB</strong> / {s.tmpStorage}</span></div>
                {s.localStorage !== "none" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Database size={12} color={BLUE} /><span>Volume <strong>{s.localUsed}GB</strong> / {s.localStorage}</span></div>
                )}
                {s.sharedStorage !== "none" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Share2 size={12} color={GREEN} /><span>Shared · <strong>{s.sharedStorage}</strong></span></div>
                )}
              </>
            ) : s.status === "creating" ? (
              <div style={{ fontSize: 12, color: PURPLE }}>서버를 준비하고 있습니다. 약 2~5분 소요됩니다...</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Calendar size={12} color={GRAY_60} /><span>Created At <strong style={{ color: GRAY_90 }}>{s.created}</strong></span></div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Server Detail ────────────────────────────────────────────────────────────
function ServerDetail({ server, onBack }: { server: typeof servers[0]; onBack: () => void }) {
  const [tab, setTab] = useState("Monitoring");
  const [upgradeLocal, setUpgradeLocal] = useState(false);
  const [newLocalGB, setNewLocalGB] = useState(100);
  const isRunning = server.status === "running";

  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 1100 }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>
          ← 서버 목록
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0, fontFamily: "Roboto Mono, monospace" }}>{server.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <StatusDot status={server.status} />
                <Badge color={isRunning ? "success" : server.status === "creating" ? "info" : "neutral"}>
                  {server.status === "running" ? "Running" : server.status === "stopped" ? "Stopped" : "Creating"}
                </Badge>
              </div>
            </div>
            <div style={{ fontSize: 13, color: GRAY_60 }}>{server.image} &nbsp;·&nbsp; {server.gpu} × {server.gpuCnt} &nbsp;·&nbsp; VRAM {server.vram}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {server.status === "stopped" && <PrimaryBtn size="small"><Play size={13} /> 시작</PrimaryBtn>}
            {isRunning && <PrimaryBtn size="small" variant="secondary"><Square size={13} /> 정지</PrimaryBtn>}
            <PrimaryBtn size="small" variant="danger"><Trash2 size={13} /> 삭제</PrimaryBtn>
          </div>
        </div>

        {/* 통합 서버 정보 카드 */}
        <div style={{ backgroundColor: "white", borderRadius: 14, marginBottom: 20, border: `1px solid ${GRAY_30}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ display: "flex", padding: "16px 24px" }}>
            {[
              { label: "이미지", value: server.image },
              { label: "GPU", value: `${server.gpu} × ${server.gpuCnt}` },
              { label: "VRAM", value: server.vram },
              { label: "로컬 스토리지", value: server.tmpStorage },
              ...(server.localStorage !== "none" ? [{ label: "볼륨 스토리지", value: server.localStorage }] : []),
              ...(server.sharedStorage !== "none" ? [{ label: "공유 스토리지", value: server.sharedStorage }] : []),
              { label: "생성일", value: server.created },
            ].map(({ label, value }, i, arr) => (
              <div key={label} style={{
                flex: 1, minWidth: 0,
                paddingLeft: i > 0 ? 20 : 0,
                paddingRight: i < arr.length - 1 ? 20 : 0,
                borderRight: i < arr.length - 1 ? `1px solid ${GRAY_10}` : "none",
              }}>
                <div style={{ fontSize: 10, color: GRAY_60, fontWeight: 500, marginBottom: 5, letterSpacing: "0.02em" }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${GRAY_10}`, padding: "10px 24px", backgroundColor: GRAY_5, display: "flex", alignItems: "center", gap: 10 }}>
            <AccessBtn label="접속" icon={<Terminal size={13} />} url={server.jupyterUrl} enabled={isRunning} />
            {isRunning ? (
              <>
                <div style={{ width: 1, height: 16, backgroundColor: GRAY_30, margin: "0 6px" }} />
                <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Clock size={11} color={GRAY_60} /><span>Uptime <strong style={{ color: GRAY_90 }}>{server.uptime}</strong></span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Zap size={11} color={PRIMARY} /><span>소비 <strong style={{ color: PRIMARY }}>{server.rate} cr/h</strong></span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><HardDrive size={11} color={GRAY_60} /><span>Local <strong>{server.tmpUsed}GB</strong> / {server.tmpStorage}</span></div>
                  {server.localStorage !== "none" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Database size={11} color={BLUE} /><span>Volume <strong>{server.localUsed}GB</strong> / {server.localStorage}</span></div>
                  )}
                  {server.sharedStorage !== "none" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Share2 size={11} color={GREEN} /><span>Shared · <strong>{server.sharedStorage}</strong></span></div>
                  )}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: GREEN }} />
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Running</span>
                </div>
              </>
            ) : (
              <span style={{ fontSize: 12, color: GRAY_40, marginLeft: 4 }}>서버 실행 중에만 접속 가능합니다.</span>
            )}
          </div>
        </div>

        <TabBar tabs={["Monitoring", "Access"]} active={tab} onChange={setTab} />

        {tab === "Monitoring" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* GPU 모니터링 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <SectionCard title="GPU 사용량 / vRAM 사용량" subtitle="점유율 (%)">
                <ResponsiveContainer width="100%" height={150}>
                  <ComposedChart data={gpuHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip formatter={(v: number, name: string) => [`${v}%`, name === "util" ? "GPU 사용량" : "vRAM 사용량"]} />
                    <Line type="monotone" dataKey="util" stroke={PRIMARY} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="mem" stroke={BLUE} strokeWidth={2} dot={false} strokeDasharray="5 3" />
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: GRAY_60 }}>
                    <div style={{ width: 18, height: 2, backgroundColor: PRIMARY, borderRadius: 1 }} />
                    GPU 사용량
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: GRAY_60 }}>
                    <div style={{ width: 18, height: 2, backgroundColor: BLUE, borderRadius: 1 }} />
                    vRAM 사용량
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="GPU / RAM" subtitle="점유율 (%)">
                <ResponsiveContainer width="100%" height={150}>
                  <ComposedChart data={gpuHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip formatter={(v: number, name: string) => [`${v}%`, name === "util" ? "GPU" : "RAM"]} />
                    <Line type="monotone" dataKey="util" stroke={PRIMARY} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ram" stroke={GREEN} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: GRAY_60 }}>
                    <div style={{ width: 18, height: 2, backgroundColor: PRIMARY, borderRadius: 1 }} />
                    GPU
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: GRAY_60 }}>
                    <div style={{ width: 18, height: 2, backgroundColor: GREEN, borderRadius: 1 }} />
                    RAM
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Storage 모니터링 */}
            <SectionCard title="로컬 스토리지" subtitle={`서버 중지 시 데이터 소멸 · 0.05 cr/GB/h · ${(parseInt(server.tmpStorage) * 0.05).toFixed(2)} cr/h`}>
              <UtilBar pct={server.tmpUsed / parseInt(server.tmpStorage) * 100} color={BLUE} height={10} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: GRAY_70 }}>
                <span>{server.tmpUsed}GB 사용 중 / {server.tmpStorage}</span>
                <span style={{ color: GRAY_60 }}>{Math.round(server.tmpUsed / parseInt(server.tmpStorage) * 100)}%</span>
              </div>
            </SectionCard>
            {server.localStorage !== "none" && (
              <SectionCard title="볼륨 스토리지" subtitle="정지 중도 과금 · 0.1 cr/GB/h" action={<div style={{ display: "flex", gap: 8 }}><PrimaryBtn size="xsmall" variant="secondary" onClick={() => setUpgradeLocal(!upgradeLocal)}>용량 상향</PrimaryBtn><PrimaryBtn size="xsmall" variant="danger"><Trash2 size={12} /></PrimaryBtn></div>}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", backgroundColor: "rgb(240,248,253)", borderRadius: 10, marginBottom: 12 }}>
                  <AlertTriangle size={12} color={BLUE} />
                  <span style={{ fontSize: 12, color: GRAY_70 }}>서버 정지 중에도 볼륨 스토리지 요금이 발생합니다.</span>
                </div>
                <UtilBar pct={server.localUsed / parseInt(server.localStorage) * 100} height={10} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: GRAY_70 }}>
                  <span>{server.localUsed}GB / {server.localStorage}</span>
                  <span style={{ color: GRAY_60 }}>{Math.round(server.localUsed / parseInt(server.localStorage) * 100)}%</span>
                </div>
                {upgradeLocal && (
                  <div style={{ marginTop: 14, padding: "14px 16px", backgroundColor: GRAY_5, borderRadius: 10, border: `1px solid ${GRAY_30}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, marginBottom: 10 }}>용량 상향 신청 (축소 불가)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: GRAY_60 }}>현재 {server.localStorage} →</span>
                      <input type="number" value={newLocalGB} onChange={e => setNewLocalGB(Number(e.target.value))} min={parseInt(server.localStorage) + 10} style={{ width: 80, height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "center" }} />
                      <span style={{ fontSize: 13, color: GRAY_70 }}>GB</span>
                      <div style={{ fontSize: 12, color: YELLOW, backgroundColor: "rgb(255,251,235)", padding: "5px 10px", borderRadius: 8 }}>
                        추가 과금: {((newLocalGB - parseInt(server.localStorage)) * 0.1).toFixed(1)} cr/h
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <PrimaryBtn size="xsmall" onClick={() => setUpgradeLocal(false)}>확인</PrimaryBtn>
                      <PrimaryBtn size="xsmall" variant="ghost" onClick={() => setUpgradeLocal(false)}>취소</PrimaryBtn>
                    </div>
                  </div>
                )}
              </SectionCard>
            )}
            {server.sharedStorage !== "none" && (
              <SectionCard title={`공유 스토리지 — ${server.sharedStorage}`} subtitle="Persistent PVC · 워크스페이스 공유">
                <UtilBar pct={57} color={BLUE} height={10} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: GRAY_70 }}>
                  <span>287GB / 500GB 사용 중</span>
                  <span style={{ color: GRAY_60 }}>57%</span>
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {tab === "Access" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isRunning && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", backgroundColor: "rgb(240,248,253)", borderRadius: 10 }}>
                <AlertTriangle size={12} color={BLUE} />
                <span style={{ flex: 1, fontSize: 12, color: GRAY_70 }}>서버가 실행 중이지 않습니다. 접속하려면 서버를 시작하세요.</span>
                <PrimaryBtn size="xsmall" style={{ marginLeft: "auto" }}><Play size={11} /> 서버 시작</PrimaryBtn>
              </div>
            )}
            {[
              { label: "JupyterLab", desc: "브라우저 기반 Jupyter 노트북 및 터미널", icon: "📓", url: server.jupyterUrl, port: "8888" },
            ].map(access => (
              <Card key={access.label} style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{access.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{access.label}</span>
                      <Badge color={isRunning ? "success" : "neutral"}>{isRunning ? "접속 가능" : "오프라인"}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>{access.desc} · Port {access.port}</div>
                    <code style={{ fontSize: 12, color: isRunning ? GRAY_90 : GRAY_40, fontFamily: "Roboto Mono, monospace", backgroundColor: GRAY_5, padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>
                      {isRunning ? access.url : "서버 시작 후 URL이 생성됩니다"}
                    </code>
                  </div>
                  <PrimaryBtn size="small" variant={isRunning ? "primary" : "secondary"} onClick={() => isRunning && window.open(access.url, "_blank")}>
                    <ExternalLink size={13} /> {isRunning ? "접속하기" : "오프라인"}
                  </PrimaryBtn>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Storage form section ──────────────────────────────────────────────────────
function StorageSection({
  n, tmpGB, setTmpGB, hasLocal, setHasLocal, localGB, setLocalGB, hasShared, setHasShared, useTemplate, recTmp,
}: {
  n: number; tmpGB: number; setTmpGB: (v: number) => void;
  hasLocal: boolean; setHasLocal: (v: boolean) => void;
  localGB: number; setLocalGB: (v: number) => void;
  hasShared: boolean; setHasShared: (v: boolean) => void;
  useTemplate: boolean; recTmp?: number;
}) {
  const [sharedMode, setSharedMode] = useState<"existing" | "create">("existing");
  const [newSharedName, setNewSharedName] = useState("");
  const [newSharedCapacity, setNewSharedCapacity] = useState(100);

  const handleSharedSelect = (v: string) => {
    if (v === "__create__") setSharedMode("create");
    else setSharedMode("existing");
  };

  const handleSharedToggle = () => {
    setHasShared(!hasShared);
    setSharedMode("existing");
    setNewSharedName("");
  };

  return (
    <Card style={{ padding: "22px 24px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <SectionNum n={n} />
        <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>스토리지</span>
        {useTemplate && <Badge color="primary">템플릿 자동 설정</Badge>}
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${GRAY_30}`, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, marginBottom: 3 }}>
              Local Storage
            </div>
            <div style={{ fontSize: 11, color: GRAY_60 }}>Ephemeral · 중지·삭제 시 데이터 소멸</div>
            {recTmp !== undefined && (
              <div style={{ fontSize: 11, color: PRIMARY, marginTop: 4 }}>
                이미지 최소 {recTmp}GB + 여유 {LOCAL_STORAGE_BUFFER_GB}GB 기준으로 자동 설정되었습니다.
              </div>
            )}
          </div>
          <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>{(tmpGB * 0.05).toFixed(2)} cr/h</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number" min={(recTmp ?? 10) + LOCAL_STORAGE_BUFFER_GB} value={tmpGB}
            onChange={e => setTmpGB(Math.max((recTmp ?? 10) + LOCAL_STORAGE_BUFFER_GB, Number(e.target.value)))}
            style={{ width: 90, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 14, textAlign: "center" }}
          />
          <span style={{ fontSize: 13, color: GRAY_70 }}>GB (최소 {(recTmp ?? 10) + LOCAL_STORAGE_BUFFER_GB}GB)</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${hasLocal ? PRIMARY : GRAY_30}`, backgroundColor: hasLocal ? PRIMARY_10 : "white", marginBottom: 8, transition: "all 0.1s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => setHasLocal(!hasLocal)} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${hasLocal ? PRIMARY : GRAY_40}`, backgroundColor: hasLocal ? PRIMARY : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {hasLocal && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, marginBottom: 3 }}>Volume Storage <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>(옵션)</span></div>
            <div style={{ fontSize: 11, color: GRAY_60 }}>Persistent PVC · 정지 중에도 데이터 유지 · 정지 중도 과금</div>
          </div>
          {hasLocal && <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 600 }}>{(localGB * 0.1).toFixed(0)} cr/h</span>}
        </div>
        {hasLocal && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <input type="number" value={localGB} onChange={e => setLocalGB(Number(e.target.value))} min={10} max={2000} style={{ width: 90, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 14, textAlign: "center" }} />
            <span style={{ fontSize: 13, color: GRAY_70 }}>GB (최소 10GB)</span>
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${hasShared ? PRIMARY : GRAY_30}`, backgroundColor: hasShared ? PRIMARY_10 : "white", transition: "all 0.1s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={handleSharedToggle} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${hasShared ? PRIMARY : GRAY_40}`, backgroundColor: hasShared ? PRIMARY : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {hasShared && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, marginBottom: 3 }}>Shared Storage <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>(옵션)</span></div>
            <div style={{ fontSize: 11, color: GRAY_60 }}>Persistent PVC · 멤버 공유 · 서버 삭제 후에도 데이터 유지</div>
          </div>
        </div>
        {hasShared && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <select
              value={sharedMode === "create" ? "__create__" : "existing"}
              onChange={e => handleSharedSelect(e.target.value)}
              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: `1px solid ${sharedMode === "create" ? PRIMARY : GRAY_30}`, fontSize: 13, backgroundColor: "white" }}
            >
              <option value="team-shared-01">team-shared-01 (500GB · 2서버 마운트 중)</option>
              <option value="dataset-archive">dataset-archive (1TB · 0서버 마운트 중)</option>
              <option value="__create__">+ 새 공유 스토리지 생성 후 마운트</option>
            </select>

            {sharedMode === "create" && (
              <div style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${PRIMARY}`, backgroundColor: PRIMARY_10, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>새 공유 스토리지 생성</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>스토리지 이름</div>
                    <input
                      type="text"
                      placeholder="예: team-shared-02"
                      value={newSharedName}
                      onChange={e => setNewSharedName(e.target.value)}
                      style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, backgroundColor: "white", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ width: 110 }}>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>용량</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="number"
                        min={10}
                        value={newSharedCapacity}
                        onChange={e => setNewSharedCapacity(Math.max(10, Number(e.target.value)))}
                        style={{ width: 70, height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "center", backgroundColor: "white" }}
                      />
                      <span style={{ fontSize: 12, color: GRAY_60 }}>GB</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: GRAY_60 }}>
                  예상 과금: <strong style={{ color: GREEN }}>{(newSharedCapacity * 0.15).toFixed(2)} cr/h</strong> (0.15 cr/GB/h · 서버 삭제 후에도 과금 지속)
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Shared cost summary panel ─────────────────────────────────────────────────
function CostPanel({
  selectedImage, useTemplate, imageTemplate, gpuType, gpuCount, tmpGB, hasLocal, localGB, hasShared, onSubmit, serverName,
}: {
  selectedImage: SCImage | null; useTemplate: boolean;
  imageTemplate: typeof IMAGE_TEMPLATES[string] | null;
  gpuType: string; gpuCount: number; tmpGB: number;
  hasLocal: boolean; localGB: number; hasShared: boolean;
  onSubmit: () => void; serverName: string;
}) {
  const gpuObj = SC_GPU_OPTIONS.find(g => g.name === gpuType) ?? SC_GPU_OPTIONS[0];
  const totalRate = gpuObj.ratePerGpu * gpuCount;
  const localRate = hasLocal ? localGB * 0.1 : 0;
  const BALANCE = 45230;

  return (
    <Card style={{ padding: "20px 22px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 14 }}>생성 요약 · 예상 비용</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ fontSize: 12, color: GRAY_60, fontWeight: 600, marginBottom: 8 }}>구성</div>
        {[
          { label: "이미지", value: selectedImage?.name ?? "선택 안 됨" },
          { label: "설정 방식", value: useTemplate && imageTemplate ? `🚀 ${imageTemplate.name}` : "⚙️ 직접 설정" },
          { label: "GPU", value: `${gpuType} × ${gpuCount}` },
          { label: "로컬 스토리지", value: `${tmpGB} GB` },
          { label: "볼륨 스토리지", value: hasLocal ? `${localGB} GB` : "없음" },
          { label: "공유 스토리지", value: hasShared ? "마운트" : "없음" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: `1px solid rgb(248,248,248)` }}>
            <span style={{ color: GRAY_60 }}>{label}</span>
            <span style={{ color: GRAY_90, fontWeight: 500, textAlign: "right", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "14px", backgroundColor: PRIMARY_10, borderRadius: 10 }}>
        <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 4 }}>예상 시간당 비용</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: PRIMARY }}>{(totalRate + localRate).toFixed(0)} <span style={{ fontSize: 13, fontWeight: 400 }}>cr/h</span></div>
        <div style={{ fontSize: 11, color: GRAY_60, marginTop: 4 }}>
          GPU {totalRate} cr/h{hasLocal ? ` + 스토리지 ${localRate.toFixed(0)} cr/h` : ""}
        </div>
        <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>
          잔액 {BALANCE.toLocaleString()} cr 기준 약 <strong style={{ color: PRIMARY }}>{Math.floor(BALANCE / Math.max(totalRate + localRate, 1))}h</strong> 사용 가능
        </div>
      </div>
      <PrimaryBtn disabled={!serverName || !selectedImage} onClick={onSubmit} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
        서버 생성하기
      </PrimaryBtn>
    </Card>
  );
}

// ─── Template / 직접설정 toggle cards ─────────────────────────────────────────
function ModeToggle({ imageTemplate, useTemplate, onSelectTemplate, onSelectManual }: {
  imageTemplate: typeof IMAGE_TEMPLATES[string] | null;
  useTemplate: boolean;
  onSelectTemplate: () => void;
  onSelectManual: () => void;
}) {
  return (
    <Card style={{ padding: "22px 24px", marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, marginBottom: 12 }}>설정 방식</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button type="button"
          onClick={() => imageTemplate && onSelectTemplate()}
          disabled={!imageTemplate}
          style={{
            padding: "16px", borderRadius: 10, textAlign: "left",
            border: `2px solid ${useTemplate ? PRIMARY : GRAY_30}`,
            backgroundColor: useTemplate ? PRIMARY_10 : (!imageTemplate ? GRAY_5 : "white"),
            cursor: imageTemplate ? "pointer" : "not-allowed",
            opacity: imageTemplate ? 1 : 0.6,
            transition: "all 0.15s",
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>🚀</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>템플릿 사용</div>
          {imageTemplate ? (
            <div style={{ fontSize: 11, color: GRAY_60, lineHeight: 1.5 }}>
              <strong style={{ color: PRIMARY }}>{imageTemplate.name}</strong><br />
              권장 vRAM: {imageTemplate.recVram} · 임시: {imageTemplate.recTmp}GB
              {imageTemplate.hasLocal ? ` · 로컬: ${imageTemplate.localGB}GB` : ""}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: GRAY_40 }}>이 이미지에는 템플릿이 없습니다</div>
          )}
        </button>
        <button type="button"
          onClick={onSelectManual}
          style={{
            padding: "16px", borderRadius: 10, textAlign: "left",
            border: `2px solid ${!useTemplate ? PRIMARY : GRAY_30}`,
            backgroundColor: !useTemplate ? PRIMARY_10 : "white",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>⚙️</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>직접 설정</div>
          <div style={{ fontSize: 11, color: GRAY_60, lineHeight: 1.5 }}>GPU 유형 및 수량, 스토리지, 환경변수를 직접 설정합니다.</div>
        </button>
      </div>
    </Card>
  );
}

// ─── Server Create — Step mode (2 steps) ──────────────────────────────────────
function ServerCreateStep({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);
  const [serverName, setServerName] = useState("");
  const [gpuType, setGpuType] = useState("RTX A5000");
  const [gpuCount, setGpuCount] = useState(1);
  const [tmpGB, setTmpGB] = useState(10 + LOCAL_STORAGE_BUFFER_GB);
  const [hasLocal, setHasLocal] = useState(false);
  const [localGB, setLocalGB] = useState(50);
  const [hasShared, setHasShared] = useState(false);
  const [envVars, setEnvVars] = useState("");

  const selectedImage = SC_IMAGE_CATALOG.find(i => i.id === selectedImageId) ?? null;
  const imageTemplate = selectedImageId ? (IMAGE_TEMPLATES[selectedImageId] ?? null) : null;

  const goToStep2 = () => {
    const tpl = selectedImageId ? IMAGE_TEMPLATES[selectedImageId] : null;
    if (tpl) {
      setTmpGB(tpl.recTmp + LOCAL_STORAGE_BUFFER_GB);
      setHasLocal(tpl.hasLocal);
      setLocalGB(tpl.localGB);
      setHasShared(tpl.hasShared);
      setEnvVars(tpl.envVars);
      setUseTemplate(true);
    } else {
      setTmpGB(10 + LOCAL_STORAGE_BUFFER_GB); setHasLocal(false); setLocalGB(50); setHasShared(false); setEnvVars("");
      setUseTemplate(false);
    }
    setStep(2);
  };

  const applyTemplate = () => {
    if (!imageTemplate) return;
    setTmpGB(imageTemplate.recTmp + LOCAL_STORAGE_BUFFER_GB);
    setHasLocal(imageTemplate.hasLocal);
    setLocalGB(imageTemplate.localGB);
    setHasShared(imageTemplate.hasShared);
    setEnvVars(imageTemplate.envVars);
    setUseTemplate(true);
  };

  const clearTemplate = () => {
    setTmpGB(10 + LOCAL_STORAGE_BUFFER_GB); setHasLocal(false); setLocalGB(50); setHasShared(false); setEnvVars("");
    setUseTemplate(false);
  };

  const StepDot = ({ n, label }: { n: 1 | 2; label: string }) => {
    const done = step > n;
    const active = step === n;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, backgroundColor: done ? GREEN : active ? PRIMARY : GRAY_30, color: (done || active) ? "white" : GRAY_60 }}>
          {done ? "✓" : n}
        </div>
        <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? GRAY_90 : done ? GRAY_70 : GRAY_40 }}>{label}</span>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 960 }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← 서버 목록</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, marginBottom: 20 }}>새 서버 생성 <span style={{ fontSize: 13, fontWeight: 400, color: GRAY_60, marginLeft: 8 }}>단계별 생성</span></h1>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24, backgroundColor: "white", borderRadius: 12, padding: "14px 22px", border: `1px solid ${GRAY_30}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <StepDot n={1} label="이미지 선택" />
          <div style={{ flex: 1, height: 1, backgroundColor: step > 1 ? PRIMARY : GRAY_30, margin: "0 16px", transition: "background 0.3s" }} />
          <StepDot n={2} label="서버 설정" />
        </div>

        {/* Step 1: Image gallery */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 14, color: GRAY_60, marginBottom: 14 }}>서버에 사용할 이미지를 선택하세요.</div>
            <Card style={{ padding: "20px 24px", marginBottom: 16 }}>
              <ImageGalleryPicker
                images={SC_IMAGE_CATALOG}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
              />
            </Card>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn disabled={!selectedImageId} onClick={goToStep2}>다음 단계 →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* Step 2: Config */}
        {step === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
            <div>
              <button type="button" onClick={() => setStep(1)} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← 이미지 선택</button>

              {selectedImage && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>{selectedImage.thumb}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{selectedImage.name}</span>
                    <span style={{ fontSize: 12, color: GRAY_60, marginLeft: 8 }}>선택된 이미지</span>
                  </div>
                  <button type="button" onClick={() => { setStep(1); setSelectedImageId(null); setUseTemplate(false); }} style={{ fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer" }}>변경</button>
                </div>
              )}

              {/* Mode toggle */}
              <ModeToggle
                imageTemplate={imageTemplate}
                useTemplate={useTemplate}
                onSelectTemplate={applyTemplate}
                onSelectManual={clearTemplate}
              />

              {/* Server name */}
              <Card style={{ padding: "22px 24px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <SectionNum n={1} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>서버 이름</span>
                </div>
                <input type="text" placeholder="my-server-01" value={serverName} onChange={e => setServerName(e.target.value)}
                  style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, border: `1.5px solid ${serverName ? PRIMARY : GRAY_30}`, fontSize: 14, color: GRAY_90, outline: "none", boxSizing: "border-box", fontFamily: "Roboto Mono, monospace", transition: "border-color 0.15s" }} />
                <div style={{ fontSize: 11, color: GRAY_60, marginTop: 6 }}>영문 소문자, 숫자, 하이픈만 사용 가능. 최대 40자</div>
              </Card>

              {/* GPU */}
              <Card style={{ padding: "22px 24px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <SectionNum n={2} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>GPU 유형 및 수량</span>
                  {useTemplate && imageTemplate && (
                    <Badge color="info">권장 vRAM: {imageTemplate.recVram}</Badge>
                  )}
                </div>
                <GPUPicker
                  options={SC_GPU_OPTIONS}
                  selectedName={gpuType}
                  onSelect={(name) => { setGpuType(name); setGpuCount(1); }}
                  gpuCount={gpuCount}
                  onCountChange={setGpuCount}
                />
              </Card>

              {/* Storage */}
              <StorageSection
                n={3}
                tmpGB={tmpGB} setTmpGB={setTmpGB}
                hasLocal={hasLocal} setHasLocal={setHasLocal}
                localGB={localGB} setLocalGB={setLocalGB}
                hasShared={hasShared} setHasShared={setHasShared}
                useTemplate={useTemplate}
                recTmp={imageTemplate?.recTmp}
              />

              {/* Env vars */}
              <Card style={{ padding: "22px 24px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <SectionNum n={4} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>환경변수</span>
                  {useTemplate && envVars && <Badge color="primary">템플릿 자동 설정</Badge>}
                  <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}>선택</span>
                </div>
                <textarea value={envVars} onChange={e => setEnvVars(e.target.value)} rows={4}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, fontFamily: "Roboto Mono, monospace", backgroundColor: GRAY_5, resize: "vertical", boxSizing: "border-box", outline: "none" }} />
                <div style={{ fontSize: 11, color: GRAY_60, marginTop: 4 }}>KEY=VALUE 형식으로 한 줄에 하나씩 입력하세요.</div>
              </Card>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <PrimaryBtn variant="secondary" onClick={onBack}>취소</PrimaryBtn>
                <PrimaryBtn disabled={!serverName} onClick={onBack}>서버 생성하기</PrimaryBtn>
              </div>
            </div>

            {/* Sticky cost panel */}
            <div style={{ position: "sticky", top: 28, height: "fit-content" }}>
              <CostPanel
                selectedImage={selectedImage}
                useTemplate={useTemplate}
                imageTemplate={imageTemplate}
                gpuType={gpuType}
                gpuCount={gpuCount}
                tmpGB={tmpGB}
                hasLocal={hasLocal}
                localGB={localGB}
                hasShared={hasShared}
                serverName={serverName}
                onSubmit={onBack}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Server Create — One-page mode ─────────────────────────────────────────────
function ServerCreateOnePage({ onBack }: { onBack: () => void }) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);
  const [serverName, setServerName] = useState("");
  const [gpuType, setGpuType] = useState("RTX A5000");
  const [gpuCount, setGpuCount] = useState(1);
  const [tmpGB, setTmpGB] = useState(10 + LOCAL_STORAGE_BUFFER_GB);
  const [hasLocal, setHasLocal] = useState(false);
  const [localGB, setLocalGB] = useState(50);
  const [hasShared, setHasShared] = useState(false);
  const [envVars, setEnvVars] = useState("");

  const selectedImage = SC_IMAGE_CATALOG.find(i => i.id === selectedImageId) ?? null;
  const imageTemplate = selectedImageId ? (IMAGE_TEMPLATES[selectedImageId] ?? null) : null;

  const handleImageSelect = (id: string) => {
    setSelectedImageId(id);
    // Auto-apply template if exists
    const tpl = IMAGE_TEMPLATES[id];
    if (tpl) {
      setTmpGB(tpl.recTmp + LOCAL_STORAGE_BUFFER_GB); setHasLocal(tpl.hasLocal); setLocalGB(tpl.localGB);
      setHasShared(tpl.hasShared); setEnvVars(tpl.envVars); setUseTemplate(true);
    } else {
      setTmpGB(10 + LOCAL_STORAGE_BUFFER_GB); setHasLocal(false); setLocalGB(50); setHasShared(false); setEnvVars(""); setUseTemplate(false);
    }
  };

  const applyTemplate = () => {
    if (!imageTemplate) return;
    setTmpGB(imageTemplate.recTmp + LOCAL_STORAGE_BUFFER_GB); setHasLocal(imageTemplate.hasLocal); setLocalGB(imageTemplate.localGB);
    setHasShared(imageTemplate.hasShared); setEnvVars(imageTemplate.envVars); setUseTemplate(true);
  };

  const clearTemplate = () => {
    setTmpGB(10 + LOCAL_STORAGE_BUFFER_GB); setHasLocal(false); setLocalGB(50); setHasShared(false); setEnvVars(""); setUseTemplate(false);
  };

  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← 서버 목록</button>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, marginBottom: 24 }}>서버 생성</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
        {/* Left: all sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Section 1: Image */}
          <Card style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <SectionNum n={1} />
              <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>이미지 선택</span>
              {selectedImage && (
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: PRIMARY, fontWeight: 600 }}>
                  <span style={{ fontSize: 14 }}>{selectedImage.thumb}</span>
                  {selectedImage.name}
                </div>
              )}
            </div>
            <ImageGalleryPicker
              images={SC_IMAGE_CATALOG}
              selectedId={selectedImageId}
              onSelect={handleImageSelect}
            />
          </Card>

          {/* Section 2: Mode toggle (visible after image selected) */}
          {selectedImage && (
            <ModeToggle
              imageTemplate={imageTemplate}
              useTemplate={useTemplate}
              onSelectTemplate={applyTemplate}
              onSelectManual={clearTemplate}
            />
          )}

          {/* Section 3: Server name */}
          <Card style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <SectionNum n={selectedImage ? 3 : 2} />
              <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>서버 이름</span>
            </div>
            <input type="text" placeholder="my-server-01" value={serverName} onChange={e => setServerName(e.target.value)}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, border: `1.5px solid ${serverName ? PRIMARY : GRAY_30}`, fontSize: 14, color: GRAY_90, outline: "none", boxSizing: "border-box", fontFamily: "Roboto Mono, monospace", transition: "border-color 0.15s" }} />
            <div style={{ fontSize: 11, color: GRAY_60, marginTop: 6 }}>영문 소문자, 숫자, 하이픈만 사용 가능. 최대 40자</div>
          </Card>

          {/* Section 4: GPU */}
          <Card style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <SectionNum n={selectedImage ? 4 : 3} />
              <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>GPU 유형 및 수량</span>
              {useTemplate && imageTemplate && <Badge color="info">권장 vRAM: {imageTemplate.recVram}</Badge>}
            </div>
            <GPUPicker
              options={SC_GPU_OPTIONS}
              selectedName={gpuType}
              onSelect={(name) => { setGpuType(name); setGpuCount(1); }}
              gpuCount={gpuCount}
              onCountChange={setGpuCount}
            />
          </Card>

          {/* Section 5: Storage */}
          <StorageSection
            n={selectedImage ? 5 : 4}
            tmpGB={tmpGB} setTmpGB={setTmpGB}
            hasLocal={hasLocal} setHasLocal={setHasLocal}
            localGB={localGB} setLocalGB={setLocalGB}
            hasShared={hasShared} setHasShared={setHasShared}
            useTemplate={useTemplate}
            recTmp={imageTemplate?.recTmp}
          />

          {/* Section 6: Env vars */}
          <Card style={{ padding: "22px 24px", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <SectionNum n={selectedImage ? 6 : 5} />
              <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>환경변수</span>
              {useTemplate && envVars && <Badge color="primary">템플릿 자동 설정</Badge>}
              <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}>선택</span>
            </div>
            <textarea value={envVars} onChange={e => setEnvVars(e.target.value)} rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, fontFamily: "Roboto Mono, monospace", backgroundColor: GRAY_5, resize: "vertical", boxSizing: "border-box", outline: "none" }} />
            <div style={{ fontSize: 11, color: GRAY_60, marginTop: 4 }}>KEY=VALUE 형식으로 한 줄에 하나씩 입력하세요.</div>
          </Card>
        </div>

        {/* Right: sticky cost panel */}
        <div style={{ position: "sticky", top: 28 }}>
          <CostPanel
            selectedImage={selectedImage}
            useTemplate={useTemplate}
            imageTemplate={imageTemplate}
            gpuType={gpuType}
            gpuCount={gpuCount}
            tmpGB={tmpGB}
            hasLocal={hasLocal}
            localGB={localGB}
            hasShared={hasShared}
            serverName={serverName}
            onSubmit={onBack}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Server Page (list) ───────────────────────────────────────────────────────
export function ServerPage() {
  const [view, setView] = useState<"list" | "detail" | "create-step" | "create-onepage">("list");
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"전체" | "running" | "stopped" | "creating">("전체");

  if (view === "create-step") return <ServerCreateStep onBack={() => setView("list")} />;
  if (view === "create-onepage") return <ServerCreateOnePage onBack={() => setView("list")} />;
  if (view === "detail") return <ServerDetail server={selectedServer} onBack={() => setView("list")} />;

  const running = servers.filter(s => s.status === "running");
  const totalRate = running.reduce((s, sv) => s + sv.rate, 0);

  const filtered = servers
    .filter(s => statusFilter === "전체" || s.status === statusFilter)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.image.toLowerCase().includes(search.toLowerCase()));

  const STATUS_LABELS: Record<string, string> = { "전체": "전체", "running": "Running", "stopped": "Stopped", "creating": "Creating" };

  return (
    <PageContainer
      title="Server"
      subtitle="GPU 서버를 생성·관리하고 개발 환경에 바로 접속하세요."
      actions={
        <PrimaryBtn size="small" onClick={() => setView("create-onepage")}>
          <Plus size={14} /> 서버 생성
        </PrimaryBtn>
      }
    >
      {/* Controls bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, flexShrink: 0 }}>전체 {filtered.length}개</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={GRAY_40} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="text" placeholder="서버명, 이미지 검색" value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30, paddingRight: 10, height: 32, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, outline: "none", width: 180 }}
            />
          </div>
          <div style={{ display: "flex", backgroundColor: GRAY_10, borderRadius: 10, padding: 3, gap: 2 }}>
            {(["전체", "running", "stopped", "creating"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                backgroundColor: statusFilter === s ? "white" : "transparent",
                color: statusFilter === s ? GRAY_90 : GRAY_60,
                boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
              }}>{STATUS_LABELS[s]}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Server cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", fontSize: 13, color: GRAY_60 }}>조건에 맞는 서버가 없습니다.</div>
        ) : filtered.map(s => (
          <ServerCard
            key={s.id}
            s={s}
            onDetail={() => { setSelectedServer(s); setView("detail"); }}
          />
        ))}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.5); opacity: 0; } }`}</style>
    </PageContainer>
  );
}

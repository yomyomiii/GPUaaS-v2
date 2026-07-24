import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Plus, Play, Square, Trash2, ExternalLink, AlertTriangle, ChevronRight, ChevronUp, ChevronDown,
  Terminal, Cpu, Database, HardDrive, Share2, Zap, Clock, Calendar, CreditCard, LayoutGrid, List, Search, Star, Layers,
} from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_20, PRIMARY_80, GRAY_5, GRAY_10, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  RED, RED_10, GREEN, BLUE, YELLOW, YELLOW_10, ORANGE, ORANGE_10, Badge, StatusDot, Card, PrimaryBtn, TabBar, PageContainer, SectionCard, ListCard,
} from "./ConsoleLayout";

const PURPLE = "rgb(124, 58, 237)";
const PURPLE_10 = "rgb(237, 233, 254)";

const GPU_LINE_COLORS = [PRIMARY, ORANGE, GREEN, PURPLE];

function CustomGpuTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const groups: Record<number, { util?: number; vram?: number }> = {};
  for (const { dataKey, value } of payload) {
    if (dataKey.startsWith("gpu")) {
      const i = parseInt(dataKey.slice(3));
      groups[i] = { ...groups[i], util: value };
    } else if (dataKey.startsWith("vram")) {
      const i = parseInt(dataKey.slice(4));
      groups[i] = { ...groups[i], vram: value };
    }
  }
  return (
    <div style={{ background: "white", border: `1px solid ${GRAY_10}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
      <div style={{ color: GRAY_60, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {Object.entries(groups).map(([idx, { util, vram }], pos, arr) => {
        const i = parseInt(idx);
        const color = GPU_LINE_COLORS[i];
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: pos < arr.length - 1 ? 4 : 0 }}>
            <span style={{ width: 38, color, fontWeight: 700 }}>GPU {i}</span>
            <span style={{ color: GRAY_60 }}>사용률 <strong style={{ color }}>{util}%</strong></span>
            <span style={{ color: GRAY_60 }}>VRAM <strong style={{ color }}>{vram}%</strong></span>
          </div>
        );
      })}
    </div>
  );
}

const SERVER_STATUS = {
  running:  { label: "running",  dotColor: GREEN,   msg: null },
  stopped:  { label: "stopped",  dotColor: GRAY_30, msg: null },
  creating: { label: "creating", dotColor: PURPLE,  msg: "creating" },
} satisfies Record<string, { label: string; dotColor: string; msg: string | null }>;

// 관리자 콘솔에서 설정 가능한 로컬 스토리지 여유 용량 (이미지 최소 요구량 + 이 값이 기본값)
const LOCAL_STORAGE_BUFFER_GB = 5;

// ─── Mock data ────────────────────────────────────────────────────────────────
const servers = [
  {
    id: "s1", name: "pytorch-dev-01", status: "running" as const,
    gpu: "RTX A5000", gpuCnt: 2, vram: "48GB", vramUsedPct: 61, ramGB: 128,
    gpuUtil: [78, 72], image: "PyTorch 2.1 + CUDA 12.1",
    uptime: "5h 32m", uptimeSec: 19934, rate: 24, remaining: 1884,
    localStorage: "10GB", sharedStorage: "none", tmpStorage: "20GB",
    tmpUsed: 14.2, localUsed: 6.8, created: "2026-07-08 09:00:00", stoppedAt: null as string | null,
    jupyterUrl: "https://pytorch-dev-01.jupyter.neurostack.io",
    vscodeUrl: "https://pytorch-dev-01.vscode.neurostack.io",
  },
  {
    id: "s2", name: "llm-finetuning", status: "running" as const,
    gpu: "H100 SXM5", gpuCnt: 4, vram: "320GB", vramUsedPct: 83, ramGB: 512,
    gpuUtil: [94, 91, 89, 96], image: "LLaMA Fine-tuning v2",
    uptime: "2h 15m", uptimeSec: 8103, rate: 96, remaining: 471,
    localStorage: "100GB", sharedStorage: "team-shared-01", tmpStorage: "50GB",
    tmpUsed: 38.5, localUsed: 67.3, created: "2026-07-08 12:17:44", stoppedAt: null as string | null,
    jupyterUrl: "https://llm-finetuning.jupyter.neurostack.io",
    vscodeUrl: "https://llm-finetuning.vscode.neurostack.io",
  },
  {
    id: "s3", name: "stable-diffusion", status: "stopped" as const,
    gpu: "RTX 4090", gpuCnt: 1, vram: "24GB", vramUsedPct: 0, ramGB: 64,
    gpuUtil: [0], image: "Stable Diffusion WebUI",
    uptime: "—", uptimeSec: 0, rate: 0, remaining: 0,
    localStorage: "none", sharedStorage: "none", tmpStorage: "30GB",
    tmpUsed: 0, localUsed: 0, created: "2026-07-05 14:22:09", stoppedAt: "2026-07-10 18:45:33" as string | null,
    jupyterUrl: "", vscodeUrl: "",
  },
  {
    id: "s4", name: "data-preprocess", status: "creating" as const,
    gpu: "A100 SXM4", gpuCnt: 2, vram: "80GB", vramUsedPct: 0, ramGB: 256,
    gpuUtil: [0, 0], image: "TensorFlow 2.15",
    uptime: "—", uptimeSec: 0, rate: 48, remaining: 943,
    localStorage: "50GB", sharedStorage: "team-shared-01", tmpStorage: "40GB",
    tmpUsed: 0, localUsed: 0, created: "2026-07-08 14:30:05", stoppedAt: null as string | null,
    jupyterUrl: "", vscodeUrl: "",
  },
];

const gpuHistory = [
  { t: "5m",  gpu0: 68, gpu1: 62, gpu2: 65, gpu3: 61, vram0: 55, vram1: 53, vram2: 57, vram3: 52, ram: 72, cpu: 45 },
  { t: "10m", gpu0: 75, gpu1: 69, gpu2: 72, gpu3: 70, vram0: 58, vram1: 56, vram2: 60, vram3: 55, ram: 68, cpu: 52 },
  { t: "15m", gpu0: 82, gpu1: 78, gpu2: 80, gpu3: 79, vram0: 60, vram1: 58, vram2: 62, vram3: 57, ram: 71, cpu: 58 },
  { t: "20m", gpu0: 77, gpu1: 73, gpu2: 74, gpu3: 76, vram0: 59, vram1: 57, vram2: 61, vram3: 56, ram: 74, cpu: 50 },
  { t: "25m", gpu0: 90, gpu1: 87, gpu2: 85, gpu3: 92, vram0: 62, vram1: 60, vram2: 63, vram3: 59, ram: 70, cpu: 63 },
  { t: "30m", gpu0: 78, gpu1: 72, gpu2: 75, gpu3: 73, vram0: 61, vram1: 59, vram2: 62, vram3: 58, ram: 69, cpu: 55 },
];

// ─── Server Create catalogs ───────────────────────────────────────────────────
const SC_IMAGE_CATALOG = [
  { id: "i1", name: "PyTorch 2.1 + CUDA 12.1", tier: "Official" as const, category: "ML/DL", thumb: "🔵",
    desc: "Official deep learning environment with PyTorch 2.1 and CUDA 12.1 pre-installed.", access: ["JupyterLab"], tags: ["PyTorch", "CUDA", "JupyterLab"], used: 847, rating: 4.9 },
  { id: "i2", name: "TensorFlow 2.15", tier: "Official" as const, category: "ML/DL", thumb: "🟡",
    desc: "Complete ML development environment with TensorFlow 2.15 and Keras.", access: ["JupyterLab"], tags: ["TensorFlow", "Keras"], used: 623, rating: 4.7 },
  { id: "i3", name: "LLaMA Fine-tuning v2", tier: "Verified" as const, category: "LLM", thumb: "🟣",
    desc: "Optimized environment for fine-tuning Meta LLaMA models with LoRA/QLoRA.", access: ["JupyterLab"], tags: ["LLaMA", "LoRA", "QLoRA"], used: 412, rating: 4.8 },
  { id: "i4", name: "Stable Diffusion WebUI", tier: "Verified" as const, category: "CV", thumb: "🟠",
    desc: "Supports AUTOMATIC1111 Stable Diffusion WebUI and ControlNet.", access: ["JupyterLab"], tags: ["Stable Diffusion", "ControlNet"], used: 389, rating: 4.6 },
  { id: "i5", name: "NLP Toolkit", tier: "Verified" as const, category: "NLP", thumb: "🟤",
    desc: "NLP environment with HuggingFace Transformers, Datasets, and Tokenizers pre-installed.", access: ["JupyterLab"], tags: ["HuggingFace", "BERT", "GPT"], used: 278, rating: 4.5 },
  { id: "i6", name: "Data Science Pro", tier: "Official" as const, category: "Data Science", thumb: "🟢",
    desc: "All-in-one data science environment for analysis, visualization, and machine learning.", access: ["JupyterLab"], tags: ["Pandas", "Scikit-learn"], used: 356, rating: 4.8 },
];

const SC_GPU_OPTIONS = [
  { name: "RTX A5000", vram: "24GB", available: 6, ratePerGpu: 12, desc: "Suitable for general training, inference, and development" },
  { name: "A100 SXM4", vram: "80GB", available: 4, ratePerGpu: 24, desc: "Optimized for large-scale model training" },
  { name: "H100 SXM5", vram: "80GB", available: 8, ratePerGpu: 52, desc: "Latest large LLM training and inference" },
  { name: "RTX 4090", vram: "24GB", available: 3, ratePerGpu: 21, desc: "Suitable for image generation and inference" },
];

// Template per image — 1:1 relationship. Templates specify recommended settings, NOT specific GPU.
const IMAGE_TEMPLATES: Record<string, { name: string; recVram: string; recTmp: number; hasLocal: boolean; localGB: number; hasShared: boolean; envVars: string; desc: string }> = {
  "i1": { name: "PyTorch LLM Training", recVram: "80GB+", recTmp: 30, hasLocal: true, localGB: 100, hasShared: false, envVars: "WANDB_API_KEY=\nHF_TOKEN=", desc: "PyTorch-based pre-configuration optimized for LLM training" },
  "i3": { name: "LLaMA Fine-tuning", recVram: "80GB+", recTmp: 50, hasLocal: true, localGB: 200, hasShared: false, envVars: "HF_TOKEN=\nWANDB_API_KEY=", desc: "Dedicated LLM fine-tuning pre-configuration, H100 recommended" },
  "i4": { name: "SD WebUI Image Generation", recVram: "24GB+", recTmp: 20, hasLocal: true, localGB: 50, hasShared: false, envVars: "", desc: "SD WebUI pre-configuration for image generation" },
  "i6": { name: "Team Data Analysis", recVram: "24GB+", recTmp: 10, hasLocal: true, localGB: 20, hasShared: true, envVars: "", desc: "Team data analysis environment with shared storage" },
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
  const { t } = useTranslation();
  return (
    <button type="button"
      onClick={() => enabled && window.open(url, "_blank")}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
        borderRadius: 8, border: "none",
        backgroundColor: enabled ? PRIMARY_10 : GRAY_5,
        color: enabled ? PRIMARY : GRAY_40,
        cursor: enabled ? "pointer" : "default",
        fontSize: 12, fontWeight: 600, transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (enabled) e.currentTarget.style.backgroundColor = "rgb(230,228,255)"; }}
      onMouseLeave={e => { if (enabled) e.currentTarget.style.backgroundColor = PRIMARY_10; }}
      title={enabled ? url : t('server.detail.access.serverStopped')}
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
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sort, setSort] = useState<"used" | "rating" | "name">("used");

  const cats = ["all", "ML/DL", "LLM", "CV", "NLP", "Data Science"];
  const tiers = ["all", "Official", "Verified"];

  const filtered = images
    .filter(img => {
      const matchCat = catFilter === "all" || img.category === catFilter;
      const matchTier = tierFilter === "all" || img.tier === tierFilter;
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
          <input type="text" placeholder={t('common.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", height: 36, paddingLeft: 30, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, outline: "none", boxSizing: "border-box", color: GRAY_90 }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          style={{ height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_70, cursor: "pointer", outline: "none", backgroundColor: "white" }}>
          <option value="used">{t('server.image.sort.used')}</option>
          <option value="rating">{t('server.image.sort.rating')}</option>
          <option value="name">{t('server.sort.nameAsc')}</option>
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
            }}>{cat === "all" ? t('server.image.cat.all') : cat}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 2, backgroundColor: GRAY_5, padding: "3px", borderRadius: 8, flexShrink: 0 }}>
          {tiers.map(tier => (
            <button type="button" key={tier} onClick={() => setTierFilter(tier)} style={{
              padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 500,
              backgroundColor: tierFilter === tier ? PRIMARY : "transparent",
              color: tierFilter === tier ? "white" : GRAY_70,
            }}>{tier === "all" ? t('server.image.tier.all') : tier === "Official" ? t('server.image.tier.official') : t('server.image.tier.verified')}</button>
          ))}
        </div>
      </div>
      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: GRAY_60, fontSize: 13 }}>{t('common.table.noResults')}</div>
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
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [vramFilter, setVramFilter] = useState("all");
  const [sort, setSort] = useState<"price" | "vram" | "avail">("price");

  const vrams = ["all", "80GB", "24GB"];

  const filtered = options
    .filter(gpu => {
      const matchVram = vramFilter === "all" || gpu.vram === vramFilter;
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
          <input type="text" placeholder={t('common.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", height: 32, paddingLeft: 26, paddingRight: 10, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, outline: "none", boxSizing: "border-box", color: GRAY_90 }} />
        </div>
        <div style={{ display: "flex", gap: 2, backgroundColor: GRAY_5, padding: "3px", borderRadius: 8 }}>
          {vrams.map(v => (
            <button type="button" key={v} onClick={() => setVramFilter(v)} style={{
              padding: "2px 8px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 500,
              backgroundColor: vramFilter === v ? PRIMARY : "transparent",
              color: vramFilter === v ? "white" : GRAY_70,
            }}>{v === "all" ? t('common.status.all') : v}</button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          style={{ height: 32, padding: "0 8px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 11, color: GRAY_70, cursor: "pointer", outline: "none", backgroundColor: "white" }}>
          <option value="price">{t('server.gpu.sort.price')}</option>
          <option value="vram">{t('server.gpu.sort.vram')}</option>
          <option value="avail">{t('server.gpu.sort.avail')}</option>
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
                <Badge color={gpu.available > 4 ? "success" : "warning"}>{t('server.gpu.available', { count: gpu.available })}</Badge>
              </div>
              {isSel && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${GRAY_30}` }}>
                  <span style={{ fontSize: 11, color: GRAY_60, flex: 1 }}>{t('server.gpu.quantity')}</span>
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

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: {
  title: string; message: React.ReactNode; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "white", borderRadius: 14, padding: "28px 32px", width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: GRAY_90, marginBottom: 16 }}>{title}</div>
        <div style={{ height: 1, backgroundColor: GRAY_10, marginBottom: 20 }} />
        <div style={{ fontSize: 14, color: GRAY_70, lineHeight: 1.7, marginBottom: 28 }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onCancel} style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY_30}`, backgroundColor: "white", color: GRAY_70, cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>{t('common.action.cancel')}</button>
          <button type="button" onClick={onConfirm} style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", backgroundColor: RED, color: "white", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Server Card (list item) ──────────────────────────────────────────────────
function ServerCard({ s, onDetail, onDeleteRequest }: { s: typeof servers[0]; onDetail: () => void; onDeleteRequest: () => void }) {
  const { t } = useTranslation();
  const avgUtil = s.gpuUtil.length ? Math.round(s.gpuUtil.reduce((a, b) => a + b, 0) / s.gpuUtil.length) : 0;
  const isRunning = s.status === "running";
  const isHigh = avgUtil > 90;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);

  return (
    <Card hover style={{ padding: 0, overflow: "hidden" }}>

      <div style={{ padding: "20px 24px" }}>
        {s.status === "creating" && SERVER_STATUS.creating.msg && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: PRIMARY_10, borderRadius: 10, fontSize: 12, color: PRIMARY, width: "100%", marginBottom: 16, boxSizing: "border-box" }}>
            <AlertTriangle size={12} color={PRIMARY} style={{ flexShrink: 0 }} />
            {t('server.creating')}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: (isRunning || s.status === "stopped") ? 16 : 0 }}>
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
                {isHigh && <Badge color="danger">⚠ {t('server.status.highLoad')}</Badge>}
                {s.status === "creating" && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: PURPLE, backgroundColor: PURPLE_10, borderRadius: 9999, padding: "2px 8px" }}>{t('server.status.creating')}...</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: GRAY_60, paddingLeft: 18 }}>{s.image} &nbsp;·&nbsp; {s.gpu} × {s.gpuCnt} &nbsp;·&nbsp; VRAM {s.vram}</div>
              {s.status === "stopped" && s.stoppedAt && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: YELLOW_10, borderRadius: 10, fontSize: 11, color: YELLOW, marginLeft: 18, marginTop: 4 }}>
                  <Clock size={10} color={YELLOW} />
                  {t('server.status.stoppedAt', { date: s.stoppedAt })}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 12 }}>
            <button type="button" onClick={onDetail} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "none", backgroundColor: PRIMARY_10, color: PRIMARY, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", transition: "background 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_20; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
              {t('server.action.detail')} <ChevronRight size={12} />
            </button>
            {isRunning && <AccessBtn label={t('server.action.connect')} icon={<Terminal size={12} />} url={s.jupyterUrl} enabled={isRunning} />}
            {(s.status === "stopped" || isRunning) && (
              <div style={{ position: "relative" }}>
                {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
                <button type="button" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setMenuAnchor({ top: r.bottom + 4, right: window.innerWidth - r.right }); setMenuOpen(o => !o); }}
                  style={{ height: 32, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: menuOpen ? PRIMARY_20 : PRIMARY_10, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.15s", display: "inline-flex", alignItems: "center", padding: 0, overflow: "hidden" }}
                  onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.backgroundColor = PRIMARY_20; }}
                  onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.backgroundColor = PRIMARY_10; }}>
                  <span style={{ padding: "0 8px 0 10px" }}>{t('server.action.manage')}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: menuOpen ? "rgb(207,204,255)" : PRIMARY_20, alignSelf: "stretch", padding: "0 6px", borderLeft: `1px solid ${menuOpen ? "rgb(190,186,255)" : PRIMARY_20}`, transition: "background 0.15s" }}>
                    <ChevronDown size={11} color={PRIMARY} style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </span>
                </button>
                {menuOpen && menuAnchor && (
                  <div style={{ position: "fixed", top: menuAnchor.top, right: menuAnchor.right, backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 130, padding: "4px 0" }}>
                    {s.status === "stopped" && (
                      <button type="button" onClick={() => { setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: PRIMARY, fontFamily: "inherit", whiteSpace: "nowrap" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = GRAY_5; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                        {t('server.action.start')}
                      </button>
                    )}
                    {isRunning && (
                      <button type="button" onClick={() => { setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                        {t('server.action.stop')}
                      </button>
                    )}
                    {s.status === "stopped" && (
                      <>
                        <div style={{ height: 1, backgroundColor: GRAY_10, margin: "4px 0" }} />
                        <button type="button" onClick={() => { setMenuOpen(false); onDeleteRequest(); }} style={{ display: "block", width: "100%", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: RED, fontFamily: "inherit", whiteSpace: "nowrap" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                          {t('server.action.delete')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isRunning && (
          <div style={{ marginBottom: 16, padding: "12px 16px", backgroundColor: "rgba(0,0,0,0.018)", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              {s.gpuUtil.map((u, i) => {
                const uColor = u >= 90 ? RED : u >= 70 ? YELLOW : GREEN;
                const vramPct = Math.min(100, Math.max(0, s.vramUsedPct + (i % 2 === 0 ? 2 : -2)));
                const vColor = vramPct >= 90 ? RED : vramPct >= 70 ? YELLOW : GREEN;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 0 }}>
                    {i > 0 && <div style={{ width: 32, flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: GRAY_60, marginBottom: 8, letterSpacing: "0.04em" }}>GPU {i}</div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRAY_60, marginBottom: 4 }}>
                          <span>{t('server.monitoring.utilization')}</span><span style={{ fontWeight: 700, color: uColor }}>{u}%</span>
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
          </div>
        )}

        {(isRunning || s.status === "stopped") && (
          <div style={{ display: "flex", gap: 28, fontSize: 12 }}>
            {isRunning ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Calendar size={12} color={GRAY_60} /><span>{t('common.field.createdAt')} <strong style={{ color: GRAY_90 }}>{s.created}</strong></span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Clock size={12} color={GRAY_60} /><span>{t('server.card.uptime')} <strong style={{ color: GRAY_90 }}>{s.uptime}</strong></span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Zap size={12} color={GRAY_60} /><span>{t('server.card.cost')} <strong style={{ color: GRAY_90 }}>{s.rate} cr/h</strong></span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><HardDrive size={12} color={GRAY_60} /><span>{t('server.card.local')} <strong>{s.tmpUsed}GB</strong> / {s.tmpStorage}</span></div>
                {s.localStorage !== "none" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Database size={12} color={BLUE} /><span>{t('server.card.volume')} <strong>{s.localUsed}GB</strong> / {s.localStorage}</span></div>
                )}
                {s.sharedStorage !== "none" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Share2 size={12} color={GREEN} /><span>{t('server.card.shared')} · <strong>{s.sharedStorage}</strong></span></div>
                )}
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Calendar size={12} color={GRAY_60} /><span>{t('common.field.createdAt')} <strong style={{ color: GRAY_90 }}>{s.created}</strong></span></div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Server Detail ────────────────────────────────────────────────────────────
function ServerDetail({ server, onBack, onDeleteRequest }: { server: typeof servers[0]; onBack: () => void; onDeleteRequest: () => void }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"Monitoring" | "Access">("Monitoring");
  const [upgradeLocal, setUpgradeLocal] = useState(false);
  const [newLocalGB, setNewLocalGB] = useState(100);
  const isRunning = server.status === "running";
  const bc = (p: number) => p >= 90 ? RED : p >= 70 ? YELLOW : GREEN;
  const tmpPct = Math.round(server.tmpUsed / parseInt(server.tmpStorage) * 100);
  const latest = gpuHistory[gpuHistory.length - 1];
  const gpuUtilLatest = [latest.gpu0, latest.gpu1, latest.gpu2, latest.gpu3];
  const vramUtilLatest = [latest.vram0, latest.vram1, latest.vram2, latest.vram3];
  const vramPerGpu = parseInt(server.vram);
  const vramUsedGB = vramUtilLatest.map(pct => Math.round(vramPerGpu * pct / 100));
  const ramUsedGB = Math.round(server.ramGB * latest.ram / 100);
  const localPct = server.localStorage !== "none" ? Math.round(server.localUsed / parseInt(server.localStorage) * 100) : 0;
  const sharedPct = 57;

  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 1100 }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>
          {t('server.backBtn')}
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: 0 }}>{server.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <StatusDot status={server.status} />
                <Badge color={isRunning ? "success" : server.status === "creating" ? "info" : "neutral"}>
                  {server.status === "running" ? t('server.status.running') : server.status === "stopped" ? t('server.status.stopped') : t('server.status.creating')}
                </Badge>
              </div>
            </div>
            <div style={{ fontSize: 13, color: GRAY_60 }}>{server.image} &nbsp;·&nbsp; {server.gpu} × {server.gpuCnt} &nbsp;·&nbsp; VRAM {server.vram}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {server.status === "stopped" && <PrimaryBtn size="small"><Play size={13} /> {t('server.action.start')}</PrimaryBtn>}
            {isRunning && <PrimaryBtn size="small" variant="secondary"><Square size={13} /> {t('server.action.stop')}</PrimaryBtn>}
            <PrimaryBtn size="small" variant="danger" onClick={onDeleteRequest}><Trash2 size={13} /> {t('server.action.delete')}</PrimaryBtn>
          </div>
        </div>

        {/* 통합 서버 정보 카드 */}
        <div style={{ backgroundColor: "white", borderRadius: 14, marginBottom: 20, border: `1px solid ${GRAY_30}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ display: "flex", padding: "16px 24px" }}>
            {[
              { label: t('server.detail.overview.image'), value: server.image },
              { label: t('server.detail.overview.gpu'), value: `${server.gpu} × ${server.gpuCnt}` },
              { label: t('server.detail.overview.vram'), value: server.vram },
              { label: t('server.create.localStorage'), value: server.tmpStorage },
              ...(server.localStorage !== "none" ? [{ label: t('server.create.volumeStorage'), value: server.localStorage }] : []),
              ...(server.sharedStorage !== "none" ? [{ label: t('server.detail.storage.sharedTitle'), value: server.sharedStorage }] : []),
              { label: t('server.detail.overview.createdAt'), value: server.created },
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
            {isRunning && <AccessBtn label={t('server.action.connect')} icon={<Terminal size={13} />} url={server.jupyterUrl} enabled={isRunning} />}
            {isRunning ? (
              <>
                <div style={{ width: 1, height: 16, backgroundColor: GRAY_30, margin: "0 6px" }} />
                <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Clock size={11} color={GRAY_60} /><span>{t('server.card.uptime')} <strong style={{ color: GRAY_90 }}>{server.uptime}</strong></span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Zap size={11} color={GRAY_60} /><span>{t('server.card.cost')} <strong style={{ color: GRAY_90 }}>{server.rate} cr/h</strong></span></div>

                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><HardDrive size={11} color={GRAY_60} /><span>{t('server.card.local')} <strong>{server.tmpUsed}GB</strong> / {server.tmpStorage}</span></div>
                  {server.localStorage !== "none" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Database size={11} color={BLUE} /><span>{t('server.card.volume')} <strong>{server.localUsed}GB</strong> / {server.localStorage}</span></div>
                  )}
                  {server.sharedStorage !== "none" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: GRAY_70 }}><Share2 size={11} color={GREEN} /><span>{t('server.card.shared')} · <strong>{server.sharedStorage}</strong></span></div>
                  )}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: GREEN }} />
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{t('server.status.running')}</span>
                </div>
              </>
            ) : (
              <span style={{ fontSize: 12, color: GRAY_40, marginLeft: 4 }}>{t('server.detail.access.serverStopped')}</span>
            )}
          </div>
        </div>

        <TabBar
          tabs={[t('server.detail.tab.monitoring'), t('server.detail.tab.access')]}
          active={tab === "Access" ? t('server.detail.tab.access') : t('server.detail.tab.monitoring')}
          onChange={label => setTab(label === t('server.detail.tab.access') ? "Access" : "Monitoring")}
        />

        {tab === "Monitoring" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* GPU 모니터링 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <SectionCard title={`${t('server.detail.monitoring.gpuUsage')} / ${t('server.detail.monitoring.memoryUsage')}`} subtitle={t('server.detail.monitoring.utilPct')}>
                <ResponsiveContainer width="100%" height={150}>
                  <ComposedChart data={gpuHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip content={<CustomGpuTooltip />} />
                    {Array.from({ length: server.gpuCnt }, (_, i) => (
                      <Line key={`gpu${i}`} type="monotone" dataKey={`gpu${i}`} stroke={GPU_LINE_COLORS[i]} strokeWidth={2} dot={false} />
                    ))}
                    {Array.from({ length: server.gpuCnt }, (_, i) => (
                      <Line key={`vram${i}`} type="monotone" dataKey={`vram${i}`} stroke={GPU_LINE_COLORS[i]} strokeWidth={2} dot={false} strokeDasharray="5 3" />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 12, marginTop: 10, overflowX: "auto", paddingBottom: 2 }}>
                  {Array.from({ length: server.gpuCnt }, (_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: GRAY_60, flexShrink: 0, whiteSpace: "nowrap" }}>
                      <div style={{ width: 16, height: 2, backgroundColor: GPU_LINE_COLORS[i], borderRadius: 1, flexShrink: 0 }} />
                      <span>GPU {i}</span>
                      <span style={{ fontWeight: 700, color: GPU_LINE_COLORS[i] }}>{gpuUtilLatest[i]}%</span>
                    </div>
                  ))}
                  {Array.from({ length: server.gpuCnt }, (_, i) => (
                    <div key={`vram-legend-${i}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: GRAY_60, flexShrink: 0, whiteSpace: "nowrap" }}>
                      <svg width="16" height="4" style={{ flexShrink: 0 }}>
                        <line x1="0" y1="2" x2="16" y2="2" stroke={GPU_LINE_COLORS[i]} strokeWidth="2" strokeDasharray="5 3" />
                      </svg>
                      <span>VRAM {i}</span>
                      <span style={{ fontWeight: 700, color: GPU_LINE_COLORS[i] }}>{vramUtilLatest[i]}%</span>
                      <span style={{ color: GRAY_60 }}>({vramUsedGB[i]}GB/{vramPerGpu}GB)</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title={t('server.detail.monitoring.gpuRam')} subtitle={t('server.detail.monitoring.utilPct')}>
                <ResponsiveContainer width="100%" height={150}>
                  <ComposedChart data={gpuHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(242,242,242)" />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: GRAY_60 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip formatter={(v: number, name: string) => [`${v}%`, name === "cpu" ? t('server.detail.monitoring.cpuLegend') : t('server.detail.monitoring.ramLegend')]} />
                    <Line type="monotone" dataKey="cpu" stroke={PRIMARY} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ram" stroke={GREEN} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: GRAY_60 }}>
                    <div style={{ width: 18, height: 2, backgroundColor: PRIMARY, borderRadius: 1 }} />
                    {t('server.detail.monitoring.cpuLegend')}
                    <span style={{ fontWeight: 700, color: PRIMARY }}>{latest.cpu}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: GRAY_60 }}>
                    <div style={{ width: 18, height: 2, backgroundColor: GREEN, borderRadius: 1 }} />
                    {t('server.detail.monitoring.ramLegend')}
                    <span style={{ fontWeight: 700, color: GREEN }}>{latest.ram}%</span>
                    <span style={{ color: GRAY_60 }}>({ramUsedGB}GB / {server.ramGB}GB)</span>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Storage 모니터링 */}
            <SectionCard title={t('server.detail.storage.local')} subtitle={t('server.detail.storage.localCost', { rate: "0.05", cost: (parseInt(server.tmpStorage) * 0.05).toFixed(2) })}>
              <UtilBar pct={tmpPct} color={BLUE} height={10} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: GRAY_70 }}>
                <span>{server.tmpUsed}{t('server.detail.storage.inUse')}{server.tmpStorage}</span>
                <span style={{ color: bc(tmpPct) }}>{tmpPct}%</span>
              </div>
            </SectionCard>
            {server.localStorage !== "none" && (
              <SectionCard title={t('server.detail.storage.volume')} subtitle={t('server.detail.storage.volumeCost', { rate: "0.1" })} action={<div style={{ display: "flex", gap: 8 }}><PrimaryBtn size="xsmall" variant="secondary" onClick={() => setUpgradeLocal(!upgradeLocal)}>{t('server.detail.storage.expandBtn')}</PrimaryBtn><PrimaryBtn size="xsmall" variant="danger"><Trash2 size={12} /></PrimaryBtn></div>}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: PRIMARY_10, borderRadius: 10, marginBottom: 12 }}>
                  <AlertTriangle size={12} color={PRIMARY} />
                  <span style={{ fontSize: 12, color: PRIMARY }}>{t('server.detail.storage.volumeWarning')}</span>
                </div>
                <UtilBar pct={localPct} height={10} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: GRAY_70 }}>
                  <span>{server.localUsed}GB / {server.localStorage}</span>
                  <span style={{ color: bc(localPct) }}>{localPct}%</span>
                </div>
                {upgradeLocal && (
                  <div style={{ marginTop: 14, padding: "14px 16px", backgroundColor: GRAY_5, borderRadius: 10, border: `1px solid ${GRAY_30}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, marginBottom: 10 }}>{t('server.detail.storage.expandTitle')}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: GRAY_60 }}>{t('server.detail.storage.currentPrefix')}{server.localStorage} →</span>
                      <input type="number" value={newLocalGB} onChange={e => setNewLocalGB(Number(e.target.value))} min={parseInt(server.localStorage) + 10} style={{ width: 80, height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, textAlign: "center" }} />
                      <span style={{ fontSize: 13, color: GRAY_70 }}>GB</span>
                      <div style={{ fontSize: 12, color: ORANGE, backgroundColor: ORANGE_10, padding: "5px 10px", borderRadius: 8 }}>
                        {t('server.detail.storage.additionalCost', { cost: ((newLocalGB - parseInt(server.localStorage)) * 0.1).toFixed(1) })}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <PrimaryBtn size="xsmall" onClick={() => setUpgradeLocal(false)}>{t('common.action.save')}</PrimaryBtn>
                      <PrimaryBtn size="xsmall" variant="ghost" onClick={() => setUpgradeLocal(false)}>{t('common.action.cancel')}</PrimaryBtn>
                    </div>
                  </div>
                )}
              </SectionCard>
            )}
            {server.sharedStorage !== "none" && (
              <SectionCard title={`${t('server.detail.storage.sharedTitle')} — ${server.sharedStorage}`} subtitle={t('server.detail.storage.sharedSubtitle')}>
                <UtilBar pct={sharedPct} color={BLUE} height={10} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: GRAY_70 }}>
                  <span>287{t('server.detail.storage.inUse')}500GB</span>
                  <span style={{ color: bc(sharedPct) }}>57%</span>
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {tab === "Access" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isRunning && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: PRIMARY_10, borderRadius: 10 }}>
                <AlertTriangle size={12} color={PRIMARY} />
                <span style={{ flex: 1, fontSize: 12, color: PRIMARY }}>{t('server.detail.access.serverStopped')}</span>
                <PrimaryBtn size="xsmall" style={{ marginLeft: "auto" }}><Play size={11} /> {t('server.action.start')}</PrimaryBtn>
              </div>
            )}
            {[
              { label: t('server.detail.access.jupyterlab'), desc: t('server.detail.access.jupyterlabDesc'), icon: "📓", url: server.jupyterUrl, port: "8888" },
            ].map(access => (
              <Card key={access.label} style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{access.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{access.label}</span>
                      <Badge color={isRunning ? "success" : "neutral"}>{isRunning ? t('server.detail.access.online') : t('server.detail.access.offline')}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 6 }}>{access.desc} · Port {access.port}</div>
                    <code style={{ fontSize: 12, color: isRunning ? GRAY_90 : GRAY_40, fontFamily: "Roboto Mono, monospace", backgroundColor: GRAY_5, padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>
                      {isRunning ? access.url : t('server.detail.access.urlPending')}
                    </code>
                  </div>
                  <PrimaryBtn size="small" variant={isRunning ? "primary" : "secondary"} onClick={() => isRunning && window.open(access.url, "_blank")}>
                    <ExternalLink size={13} /> {isRunning ? t('server.detail.access.openJupyterLab') : t('server.detail.access.offlineBtn')}
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
  const { t } = useTranslation();
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
        <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.create.storage')}</span>
        {useTemplate && <Badge color="primary">{t('server.create.templateAutoSet')}</Badge>}
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${GRAY_30}`, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, marginBottom: 3 }}>
              {t('server.detail.storage.local')}
            </div>
            <div style={{ fontSize: 11, color: GRAY_60 }}>{t('server.detail.storage.localDesc')}</div>
            {recTmp !== undefined && (
              <div style={{ fontSize: 11, color: PRIMARY, marginTop: 4 }}>
                {t('server.detail.storage.autoSet', { min: recTmp, buffer: LOCAL_STORAGE_BUFFER_GB })}
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
          <span style={{ fontSize: 13, color: GRAY_70 }}>{t('server.detail.storage.minHint', { min: (recTmp ?? 10) + LOCAL_STORAGE_BUFFER_GB })}</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${hasLocal ? PRIMARY : GRAY_30}`, backgroundColor: hasLocal ? PRIMARY_10 : "white", marginBottom: 8, transition: "all 0.1s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => setHasLocal(!hasLocal)} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${hasLocal ? PRIMARY : GRAY_40}`, backgroundColor: hasLocal ? PRIMARY : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {hasLocal && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, marginBottom: 3 }}>{t('server.detail.storage.volume')} <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>{t('server.detail.storage.optional')}</span></div>
            <div style={{ fontSize: 11, color: GRAY_60 }}>{t('server.detail.storage.volumeDesc')}</div>
          </div>
          {hasLocal && <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 600 }}>{(localGB * 0.1).toFixed(0)} cr/h</span>}
        </div>
        {hasLocal && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <input type="number" value={localGB} onChange={e => setLocalGB(Number(e.target.value))} min={10} max={2000} style={{ width: 90, height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 14, textAlign: "center" }} />
            <span style={{ fontSize: 13, color: GRAY_70 }}>{t('server.detail.storage.minHint', { min: 10 })}</span>
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${hasShared ? PRIMARY : GRAY_30}`, backgroundColor: hasShared ? PRIMARY_10 : "white", transition: "all 0.1s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={handleSharedToggle} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${hasShared ? PRIMARY : GRAY_40}`, backgroundColor: hasShared ? PRIMARY : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {hasShared && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: GRAY_90, marginBottom: 3 }}>{t('server.detail.storage.sharedTitle')} <span style={{ fontSize: 11, fontWeight: 400, color: GRAY_60 }}>{t('server.detail.storage.optional')}</span></div>
            <div style={{ fontSize: 11, color: GRAY_60 }}>{t('server.detail.storage.sharedDesc')}</div>
          </div>
        </div>
        {hasShared && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <select
              value={sharedMode === "create" ? "__create__" : "existing"}
              onChange={e => handleSharedSelect(e.target.value)}
              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: `1px solid ${sharedMode === "create" ? PRIMARY : GRAY_30}`, fontSize: 13, backgroundColor: "white" }}
            >
              <option value="team-shared-01">team-shared-01 (500GB · 2 servers)</option>
              <option value="dataset-archive">dataset-archive (1TB · 0 servers)</option>
              <option value="__create__">{t('server.detail.storage.createShared')}</option>
            </select>

            {sharedMode === "create" && (
              <div style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${PRIMARY}`, backgroundColor: PRIMARY_10, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>{t('server.storage.createNew')}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{t('server.storage.name')}</div>
                    <input
                      type="text"
                      placeholder={t('server.detail.storage.sharedPlaceholder')}
                      value={newSharedName}
                      onChange={e => setNewSharedName(e.target.value)}
                      style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 13, backgroundColor: "white", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ width: 110 }}>
                    <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 4 }}>{t('server.detail.storage.size')}</div>
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
                  {t('server.detail.storage.costEstimate', { cost: (newSharedCapacity * 0.15).toFixed(2) })}
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
  const { t } = useTranslation();
  const gpuObj = SC_GPU_OPTIONS.find(g => g.name === gpuType) ?? SC_GPU_OPTIONS[0];
  const totalRate = gpuObj.ratePerGpu * gpuCount;
  const localRate = hasLocal ? localGB * 0.1 : 0;
  const BALANCE = 45230;

  return (
    <Card style={{ padding: "20px 22px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 14 }}>{t('server.cost.title')}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ fontSize: 12, color: GRAY_60, fontWeight: 600, marginBottom: 8 }}>{t('server.cost.config')}</div>
        {[
          { label: t('server.create.image'), value: selectedImage?.name ?? t('server.cost.noImage') },
          { label: t('server.create.configMode'), value: useTemplate && imageTemplate ? `🚀 ${imageTemplate.name}` : `⚙️ ${t('server.create.manualConfig')}` },
          { label: t('server.card.gpu'), value: `${gpuType} × ${gpuCount}` },
          { label: t('server.create.localStorage'), value: `${tmpGB} GB` },
          { label: t('server.create.volumeStorage'), value: hasLocal ? `${localGB} GB` : t('server.cost.noStorage') },
          { label: t('server.create.sharedStorage'), value: hasShared ? t('server.cost.mount') : t('server.cost.noStorage') },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: `1px solid rgb(248,248,248)` }}>
            <span style={{ color: GRAY_60 }}>{label}</span>
            <span style={{ color: GRAY_90, fontWeight: 500, textAlign: "right", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "14px", backgroundColor: PRIMARY_10, borderRadius: 10 }}>
        <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 4 }}>{t('server.detail.overview.costPerHour')}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: PRIMARY }}>{(totalRate + localRate).toFixed(0)} <span style={{ fontSize: 13, fontWeight: 400 }}>cr/h</span></div>
        <div style={{ fontSize: 11, color: GRAY_60, marginTop: 4 }}>
          GPU {totalRate} cr/h{hasLocal ? ` + ${t('server.card.storage')} ${localRate.toFixed(0)} cr/h` : ""}
        </div>
        <div style={{ fontSize: 11, color: GRAY_60, marginTop: 2 }}>
          {t('server.cost.available', { balance: BALANCE.toLocaleString(), hours: Math.floor(BALANCE / Math.max(totalRate + localRate, 1)) })}
        </div>
      </div>
      <PrimaryBtn disabled={!serverName || !selectedImage} onClick={onSubmit} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
        {t('server.create.confirm')}
      </PrimaryBtn>
    </Card>
  );
}

// ─── Template / 직접설정 toggle cards ─────────────────────────────────────────
function ModeToggle({ n, imageTemplate, useTemplate, onSelectTemplate, onSelectManual }: {
  n: number;
  imageTemplate: typeof IMAGE_TEMPLATES[string] | null;
  useTemplate: boolean;
  onSelectTemplate: () => void;
  onSelectManual: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card style={{ padding: "22px 24px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <SectionNum n={n} />
        <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.create.configMode')}</span>
      </div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>{t('server.create.useTemplate')}</div>
          {imageTemplate ? (
            <div style={{ fontSize: 11, color: GRAY_60, lineHeight: 1.5 }}>
              <strong style={{ color: PRIMARY }}>{imageTemplate.name}</strong><br />
              {t('server.cost.recInfo', { vram: imageTemplate.recVram, tmp: imageTemplate.recTmp })}
              {imageTemplate.hasLocal ? ` · ${t('server.card.volume')}: ${imageTemplate.localGB}GB` : ""}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: GRAY_40 }}>{t('server.create.noTemplate')}</div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 4 }}>{t('server.create.manualConfig')}</div>
          <div style={{ fontSize: 11, color: GRAY_60, lineHeight: 1.5 }}>{t('server.create.manualConfigDesc')}</div>
        </button>
      </div>
    </Card>
  );
}

// ─── Server Create — Step mode (2 steps) ──────────────────────────────────────
function ServerCreateStep({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
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
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>{t('server.backBtn')}</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, marginBottom: 20 }}>{t('server.create.title')} <span style={{ fontSize: 13, fontWeight: 400, color: GRAY_60, marginLeft: 8 }}>{t('server.create.stepSubtitle')}</span></h1>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24, backgroundColor: "white", borderRadius: 12, padding: "14px 22px", border: `1px solid ${GRAY_30}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <StepDot n={1} label={t('server.step.selectImage')} />
          <div style={{ flex: 1, height: 1, backgroundColor: step > 1 ? PRIMARY : GRAY_30, margin: "0 16px", transition: "background 0.3s" }} />
          <StepDot n={2} label={t('server.step.serverConfig')} />
        </div>

        {/* Step 1: Image gallery */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 14, color: GRAY_60, marginBottom: 14 }}>{t('server.create.imageInstruction')}</div>

            <Card style={{ padding: "20px 24px", marginBottom: 16 }}>
              <ImageGalleryPicker
                images={SC_IMAGE_CATALOG}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
              />
            </Card>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn disabled={!selectedImageId} onClick={goToStep2}>{t('server.create.nextStep')}</PrimaryBtn>
            </div>
          </div>
        )}

        {/* Step 2: Config */}
        {step === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
            <div>
              <button type="button" onClick={() => setStep(1)} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← {t('server.step.selectImage')}</button>

              {selectedImage && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", backgroundColor: "white", borderRadius: 10, border: `1px solid ${GRAY_30}`, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>{selectedImage.thumb}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{selectedImage.name}</span>
                    <span style={{ fontSize: 12, color: GRAY_60, marginLeft: 8 }}>{t('server.create.selectedImage')}</span>
                  </div>
                  <button type="button" onClick={() => { setStep(1); setSelectedImageId(null); setUseTemplate(false); }} style={{ fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer" }}>{t('server.create.changeImage')}</button>

                </div>
              )}

              {/* Mode toggle */}
              <ModeToggle
                n={1}
                imageTemplate={imageTemplate}
                useTemplate={useTemplate}
                onSelectTemplate={applyTemplate}
                onSelectManual={clearTemplate}
              />

              {/* Server name */}
              <Card style={{ padding: "22px 24px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <SectionNum n={2} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.create.serverName')}</span>
                </div>
                <input type="text" placeholder="my-server-01" value={serverName} onChange={e => setServerName(e.target.value)}
                  style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, border: `1.5px solid ${serverName ? PRIMARY : GRAY_30}`, fontSize: 14, color: GRAY_90, outline: "none", boxSizing: "border-box", fontFamily: "Roboto Mono, monospace", transition: "border-color 0.15s" }} />
                <div style={{ fontSize: 11, color: GRAY_60, marginTop: 6 }}>{t('server.create.nameConstraint')}</div>
              </Card>

              {/* GPU */}
              <Card style={{ padding: "22px 24px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <SectionNum n={3} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.create.gpu')}</span>
                  {useTemplate && imageTemplate && (
                    <Badge color="info">{t('server.upgrade.gpuSelect')}: {imageTemplate.recVram}</Badge>
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
                n={4}
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
                  <SectionNum n={5} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.create.envVars')}</span>
                  {useTemplate && envVars && <Badge color="primary">{t('server.create.templateAutoSet')}</Badge>}
                  <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}>{t('server.create.optional')}</span>
                </div>
                <textarea value={envVars} onChange={e => setEnvVars(e.target.value)} rows={4}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, fontFamily: "Roboto Mono, monospace", backgroundColor: GRAY_5, resize: "vertical", boxSizing: "border-box", outline: "none" }} />
                <div style={{ fontSize: 11, color: GRAY_60, marginTop: 4 }}>{t('server.create.envVarHint')}</div>
              </Card>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <PrimaryBtn variant="secondary" onClick={onBack}>{t('common.action.cancel')}</PrimaryBtn>
                <PrimaryBtn disabled={!serverName} onClick={onBack}>{t('server.create.confirm')}</PrimaryBtn>
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
  const { t } = useTranslation();
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
      <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>{t('server.backBtn')}</button>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, marginBottom: 24 }}>{t('server.create.title')}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
        {/* Left: all sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Section 1: Image */}
          <Card style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <SectionNum n={1} />
              <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.step.selectImage')}</span>
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
              n={2}
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
              <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.create.serverName')}</span>
            </div>
            <input type="text" placeholder="my-server-01" value={serverName} onChange={e => setServerName(e.target.value)}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, border: `1.5px solid ${serverName ? PRIMARY : GRAY_30}`, fontSize: 14, color: GRAY_90, outline: "none", boxSizing: "border-box", fontFamily: "Roboto Mono, monospace", transition: "border-color 0.15s" }} />
            <div style={{ fontSize: 11, color: GRAY_60, marginTop: 6 }}>{t('server.create.nameConstraint')}</div>
          </Card>

          {/* Section 4: GPU */}
          <Card style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <SectionNum n={selectedImage ? 4 : 3} />
              <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.create.gpu')}</span>
              {useTemplate && imageTemplate && <Badge color="info">{t('server.upgrade.gpuSelect')}: {imageTemplate.recVram}</Badge>}
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
              <span style={{ fontSize: 15, fontWeight: 600, color: GRAY_90 }}>{t('server.create.envVars')}</span>

              {useTemplate && envVars && <Badge color="primary">{t('server.create.templateAutoSet')}</Badge>}
              <span style={{ fontSize: 12, color: GRAY_60, fontWeight: 400 }}>{t('server.create.optional')}</span>
            </div>
            <textarea value={envVars} onChange={e => setEnvVars(e.target.value)} rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, fontFamily: "Roboto Mono, monospace", backgroundColor: GRAY_5, resize: "vertical", boxSizing: "border-box", outline: "none" }} />
            <div style={{ fontSize: 11, color: GRAY_60, marginTop: 4 }}>{t('server.create.envVarHint')}</div>
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
  const { t } = useTranslation();
  const [view, setView] = useState<"list" | "detail" | "create-step" | "create-onepage">("list");
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "running" | "stopped" | "creating">("all");
  const [deletingServer, setDeletingServer] = useState<typeof servers[0] | null>(null);
  const [deletedServerIds, setDeletedServerIds] = useState<Set<string>>(new Set());

  if (view === "create-step") return <ServerCreateStep onBack={() => setView("list")} />;
  if (view === "create-onepage") return <ServerCreateOnePage onBack={() => setView("list")} />;
  if (view === "detail") return (
    <>
      <ServerDetail server={selectedServer} onBack={() => setView("list")} onDeleteRequest={() => setDeletingServer(selectedServer)} />
      {deletingServer && (
        <ConfirmModal
          title={t('server.delete.title')}
          message={<span>{t('server.delete.message', { name: deletingServer.name })}<br /><br />{t('server.delete.warning')}</span>}
          confirmLabel={t('common.action.delete')}
          onConfirm={() => { setDeletedServerIds(prev => new Set([...prev, deletingServer.id])); setDeletingServer(null); setView("list"); }}
          onCancel={() => setDeletingServer(null)}
        />
      )}
    </>
  );

  const visibleServers = servers.filter(s => !deletedServerIds.has(s.id));
  const running = visibleServers.filter(s => s.status === "running");
  const totalRate = running.reduce((s, sv) => s + sv.rate, 0);

  const filtered = visibleServers
    .filter(s => statusFilter === "all" || s.status === statusFilter)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.image.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageContainer
      title={t('gnb.lnb.server')}
      subtitle={t('server.subtitle')}
      actions={
        <PrimaryBtn size="small" onClick={() => setView("create-onepage")}>
          <Plus size={14} /> {t('server.action.createNew')}
        </PrimaryBtn>
      }
    >
      {/* Controls bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, flexShrink: 0 }}>{t('server.totalCount', { n: filtered.length })}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={GRAY_40} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="text" placeholder={t('common.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30, paddingRight: 10, height: 32, borderRadius: 8, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_90, outline: "none", width: 180 }}
            />
          </div>
          <div style={{ display: "flex", backgroundColor: GRAY_10, borderRadius: 10, padding: 3, gap: 2 }}>
            {(["all", "running", "stopped", "creating"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                backgroundColor: statusFilter === s ? "white" : "transparent",
                color: statusFilter === s ? GRAY_90 : GRAY_60,
                boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
              }}>{s === "all" ? t('common.status.all') : t(`server.status.${s}`)}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Server cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", fontSize: 13, color: GRAY_60 }}>{t('server.noServers')}</div>
        ) : filtered.map(s => (
          <ServerCard
            key={s.id}
            s={s}
            onDetail={() => { setSelectedServer(s); setView("detail"); }}
            onDeleteRequest={() => setDeletingServer(s)}
          />
        ))}
      </div>

      {deletingServer && (
        <ConfirmModal
          title={t('server.delete.title')}
          message={<span>{t('server.delete.message', { name: deletingServer.name })}<br /><br />{t('server.delete.warning')}</span>}
          confirmLabel={t('common.action.delete')}
          onConfirm={() => { setDeletedServerIds(prev => new Set([...prev, deletingServer.id])); setDeletingServer(null); }}
          onCancel={() => setDeletingServer(null)}
        />
      )}

      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.5); opacity: 0; } }`}</style>
    </PageContainer>
  );
}

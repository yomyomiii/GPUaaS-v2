import { useState } from "react";
import { Search, Cpu, Flame, Star, ArrowRight, ExternalLink, ChevronRight, Zap, Users, TrendingUp } from "lucide-react";
import {
  PRIMARY, PRIMARY_10, PRIMARY_80, GRAY_5, GRAY_30, GRAY_40, GRAY_60, GRAY_70, GRAY_90, GREEN, BLUE, YELLOW,
  Badge, Card, PrimaryBtn, PageContainer, SectionCard, ListCard,
} from "./ConsoleLayout";

const categories = ["전체", "ML/DL", "LLM", "CV", "NLP", "Data Science", "개발환경"];
const tierOptions = ["전체", "Official", "Verified"];

const images = [
  {
    id: "img1", name: "PyTorch 2.1 + CUDA 12.1", tier: "Official" as const, category: "ML/DL",
    tags: ["PyTorch", "CUDA 12.1", "Python 3.11", "JupyterLab", "VS Code"],
    desc: "PyTorch 2.1과 CUDA 12.1이 사전 설치된 공식 딥러닝 개발 환경. JupyterLab과 VS Code 접속을 지원합니다.",
    gpuTypes: ["RTX A5000", "A100", "H100"], thumb: "🔵", templates: 1, used: 847,
    featured: true, trending: true, rating: 4.9, reviewCount: 142,
    recGpu: "A100", recTmp: 30, recLocal: 100,
    packages: ["torch==2.1.0", "torchvision==0.16", "cuda==12.1", "jupyterlab==4.0", "wandb", "tensorboard"],
  },
  {
    id: "img2", name: "TensorFlow 2.15 + CUDA 12.1", tier: "Official" as const, category: "ML/DL",
    tags: ["TensorFlow", "Keras", "CUDA", "Python 3.11"],
    desc: "TensorFlow 2.15 및 Keras를 포함한 완전한 ML 개발 환경.",
    gpuTypes: ["RTX A5000", "A100"], thumb: "🟡", templates: 1, used: 623,
    featured: false, trending: false, rating: 4.7, reviewCount: 89,
    recGpu: "RTX A5000", recTmp: 20, recLocal: 50,
    packages: ["tensorflow==2.15.0", "keras==2.15", "cuda==12.1", "jupyterlab==4.0"],
  },
  {
    id: "img3", name: "LLaMA Fine-tuning v2", tier: "Verified" as const, category: "LLM",
    tags: ["LLaMA", "LoRA", "PEFT", "bitsandbytes", "QLoRA"],
    desc: "Meta LLaMA 시리즈 모델을 LoRA/QLoRA로 파인튜닝하기 위한 최적화 환경. 4비트 양자화 지원.",
    gpuTypes: ["A100", "H100"], thumb: "🟣", templates: 1, used: 412,
    featured: true, trending: true, rating: 4.8, reviewCount: 67,
    recGpu: "H100", recTmp: 50, recLocal: 200,
    packages: ["transformers==4.38", "peft==0.8", "bitsandbytes", "accelerate", "trl", "datasets"],
  },
  {
    id: "img4", name: "Stable Diffusion WebUI", tier: "Verified" as const, category: "CV",
    tags: ["Stable Diffusion", "ControlNet", "WebUI", "xFormers"],
    desc: "AUTOMATIC1111 Stable Diffusion WebUI + ControlNet, LoRA 지원.",
    gpuTypes: ["RTX 4090", "RTX A5000"], thumb: "🟠", templates: 1, used: 389,
    featured: false, trending: true, rating: 4.6, reviewCount: 55,
    recGpu: "RTX 4090", recTmp: 20, recLocal: 50,
    packages: ["stable-diffusion-webui", "controlnet", "xformers", "CLIP"],
  },
  {
    id: "img5", name: "NLP Toolkit (HuggingFace)", tier: "Verified" as const, category: "NLP",
    tags: ["HuggingFace", "Transformers", "BERT", "Tokenizers"],
    desc: "HuggingFace Transformers, Datasets, Tokenizers 포함.",
    gpuTypes: ["RTX A5000", "A100"], thumb: "🟤", templates: 1, used: 278,
    featured: false, trending: false, rating: 4.5, reviewCount: 41,
    recGpu: "RTX A5000", recTmp: 20, recLocal: 50,
    packages: ["transformers==4.38", "datasets", "tokenizers", "evaluate", "accelerate"],
  },
  {
    id: "img6", name: "Data Science Pro", tier: "Official" as const, category: "Data Science",
    tags: ["Pandas", "Scikit-learn", "XGBoost", "Plotly", "Spark"],
    desc: "데이터 분석·시각화·머신러닝을 위한 올인원 환경.",
    gpuTypes: ["RTX A5000"], thumb: "🟢", templates: 1, used: 356,
    featured: true, trending: false, rating: 4.8, reviewCount: 78,
    recGpu: "RTX A5000", recTmp: 10, recLocal: 20,
    packages: ["pandas==2.1", "scikit-learn==1.3", "xgboost", "plotly", "pyspark"],
  },
  {
    id: "img7", name: "OpenCV + YOLO v8", tier: "Verified" as const, category: "CV",
    tags: ["OpenCV", "YOLO", "Object Detection", "Ultralytics"],
    desc: "실시간 객체 탐지를 위한 YOLOv8 환경.",
    gpuTypes: ["RTX 4090", "RTX A5000", "A100"], thumb: "🔴", templates: 1, used: 201,
    featured: false, trending: false, rating: 4.4, reviewCount: 32,
    recGpu: "RTX A5000", recTmp: 20, recLocal: 30,
    packages: ["ultralytics==8.0", "opencv-python==4.8", "torch", "pillow"],
  },
  {
    id: "img8", name: "Python 개발 환경", tier: "Official" as const, category: "개발환경",
    tags: ["Python 3.11", "Poetry", "VS Code", "pre-commit"],
    desc: "범용 Python 개발 환경. VS Code Server, Poetry 패키지 관리 포함.",
    gpuTypes: ["RTX A5000"], thumb: "⚪", templates: 1, used: 195,
    featured: false, trending: false, rating: 4.3, reviewCount: 27,
    recGpu: "RTX A5000", recTmp: 10, recLocal: 20,
    packages: ["python==3.11", "poetry", "pre-commit", "black", "ruff"],
  },
];

// Template per image — 1:1 relationship (all images must have a template)
const GALLERY_TEMPLATES: Record<string, { name: string; recVram: string; recTmp: number; localGB: number; hasShared: boolean; desc: string }> = {
  "img1": { name: "PyTorch LLM 학습 환경", recVram: "80GB+", recTmp: 30, localGB: 100, hasShared: false, desc: "LLM 학습에 최적화된 PyTorch 기반 사전 구성" },
  "img2": { name: "TensorFlow ML 개발 환경", recVram: "24GB+", recTmp: 20, localGB: 50, hasShared: false, desc: "TensorFlow/Keras 기반 ML 개발 사전 구성" },
  "img3": { name: "LLaMA 파인튜닝 환경", recVram: "80GB+", recTmp: 50, localGB: 200, hasShared: false, desc: "H100 권장 LLM 파인튜닝 전용 사전 구성" },
  "img4": { name: "SD WebUI 이미지 생성", recVram: "24GB+", recTmp: 20, localGB: 50, hasShared: false, desc: "이미지 생성을 위한 SD WebUI 사전 구성" },
  "img5": { name: "HuggingFace NLP 환경", recVram: "24GB+", recTmp: 20, localGB: 50, hasShared: false, desc: "Transformers 기반 NLP 개발 사전 구성" },
  "img6": { name: "팀 데이터 분석 환경", recVram: "24GB+", recTmp: 10, localGB: 20, hasShared: true, desc: "공유 스토리지 연결 팀용 데이터 분석 환경" },
  "img7": { name: "YOLO 객체 탐지 환경", recVram: "24GB+", recTmp: 20, localGB: 30, hasShared: false, desc: "실시간 객체 탐지 YOLOv8 전용 사전 구성" },
  "img8": { name: "Python 범용 개발 환경", recVram: "24GB+", recTmp: 10, localGB: 20, hasShared: false, desc: "VS Code Server + Poetry 기반 범용 Python 사전 구성" },
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} fill={i <= Math.round(rating) ? YELLOW : "none"} color={i <= Math.round(rating) ? YELLOW : GRAY_30} />
      ))}
      <span style={{ fontSize: 11, color: GRAY_60, marginLeft: 3 }}>{rating}</span>
    </div>
  );
}

// ─── Usage bar ───────────────────────────────────────────────────────────────
function PopularityBar({ value, max }: { value: number; max: number }) {
  return (
    <div style={{ height: 4, backgroundColor: GRAY_5, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, backgroundColor: PRIMARY, borderRadius: 4 }} />
    </div>
  );
}

// ─── Image Card ──────────────────────────────────────────────────────────────
function ImageCard({ img, onSelect, maxUsed }: { img: typeof images[0]; onSelect: () => void; maxUsed: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "white", borderRadius: 14, overflow: "hidden",
        border: `1.5px solid ${hovered ? PRIMARY : GRAY_30}`,
        boxShadow: hovered ? `0 8px 24px rgba(99,90,220,0.12), 0 0 0 1px ${PRIMARY}` : "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "pointer", transition: "all 0.18s", transform: hovered ? "translateY(-2px)" : "none",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Thumbnail */}
      <div style={{
        height: 96, background: `linear-gradient(135deg, ${PRIMARY_10}, rgb(220,218,255))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <div style={{ fontSize: 38, filter: hovered ? "none" : "grayscale(10%)", transition: "filter 0.2s" }}>{img.thumb}</div>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5 }}>
          <Badge color={img.tier === "Official" ? "primary" : "success"}>{img.tier}</Badge>
          {img.trending && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 999, backgroundColor: "rgb(255,231,212)", fontSize: 10, color: "rgb(220,80,0)", fontWeight: 600 }}>
              <Flame size={10} /> Hot
            </div>
          )}
        </div>
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 999, fontSize: 10, color: GRAY_70 }}>
            <Users size={9} /> {img.used.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginBottom: 4, lineHeight: 1.4 }}>{img.name}</div>
        <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", flex: 1 }}>
          {img.desc}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
          {img.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: 10, color: GRAY_70, backgroundColor: GRAY_5, padding: "2px 7px", borderRadius: 4, border: `1px solid ${GRAY_30}` }}>{tag}</span>
          ))}
          {img.tags.length > 3 && <span style={{ fontSize: 10, color: GRAY_40 }}>+{img.tags.length - 3}</span>}
        </div>

        {/* Stars */}
        <div style={{ marginBottom: 10 }}>
          <Stars rating={img.rating} />
          <div style={{ marginTop: 5 }}>
            <PopularityBar value={img.used} max={maxUsed} />
          </div>
        </div>

        {/* GPU types */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Cpu size={11} color={GRAY_60} />
          <span style={{ fontSize: 10, color: GRAY_60 }}>{img.gpuTypes.join(", ")}</span>
          {GALLERY_TEMPLATES[img.id] && (
            <span style={{ marginLeft: "auto", fontSize: 10, color: PRIMARY, fontWeight: 600 }}>🚀 템플릿</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Featured Card (horizontal) ──────────────────────────────────────────────
function FeaturedCard({ img, onSelect }: { img: typeof images[0]; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "white", borderRadius: 14,
        border: `1.5px solid ${hovered ? PRIMARY : GRAY_30}`,
        boxShadow: hovered ? `0 6px 20px rgba(99,90,220,0.12)` : "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "pointer", transition: "all 0.15s",
        display: "flex", overflow: "hidden",
      }}
    >
      <div style={{
        width: 90, flexShrink: 0,
        background: `linear-gradient(160deg, ${PRIMARY_10}, rgb(218,215,255))`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
      }}>{img.thumb}</div>
      <div style={{ padding: "14px 16px", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <Badge color={img.tier === "Official" ? "primary" : "success"}>{img.tier}</Badge>
          {img.trending && <Flame size={12} color="rgb(220,80,0)" />}
          <span style={{ fontSize: 12, fontWeight: 700, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</span>
        </div>
        <div style={{ fontSize: 11, color: GRAY_60, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{img.desc}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Stars rating={img.rating} />
          <span style={{ fontSize: 10, color: GRAY_60 }}>{img.used.toLocaleString()} uses</span>
          {GALLERY_TEMPLATES[img.id] && (
            <span style={{ marginLeft: "auto", fontSize: 10, color: PRIMARY, fontWeight: 600 }}>🚀 템플릿 있음</span>
          )}
          <ChevronRight size={14} color={GRAY_40} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}

// ─── README Content ───────────────────────────────────────────────────────────
function ReadmeContent({ img }: { img: typeof images[0] }) {
  const H = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: GRAY_90, marginTop: 16, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${GRAY_30}` }}>{children}</div>
  );
  const Code = ({ children }: { children: React.ReactNode }) => (
    <pre style={{ margin: "8px 0 0", backgroundColor: "rgb(18,18,28)", borderRadius: 8, padding: "12px 16px", fontFamily: "Roboto Mono, monospace", fontSize: 11.5, lineHeight: 1.7, color: "rgb(180,200,255)", overflowX: "auto", whiteSpace: "pre" }}>
      {children}
    </pre>
  );
  const Li = ({ children }: { children: React.ReactNode }) => (
    <li style={{ fontSize: 13, color: GRAY_70, lineHeight: 1.8 }}>{children}</li>
  );

  const featureMap: Record<string, string[]> = {
    "img1": [
      "PyTorch 2.1 + CUDA 12.1 사전 구성, GPU 즉시 사용 가능",
      "JupyterLab 4.0 / VS Code Server 동시 지원",
      "Weights & Biases, TensorBoard 통합 모니터링",
      "DDP / FSDP 분산 학습 환경 사전 설정",
      "AutoAWQ, GPTQ, bitsandbytes 양자화 도구 포함",
      "Triton 커스텀 커널 개발 지원",
    ],
    "img2": [
      "TensorFlow 2.15 + Keras 3.0 완전 통합",
      "tf.data 고성능 데이터 파이프라인 최적화",
      "TensorBoard Profiler로 성능 병목 분석",
      "tf.distribute.MirroredStrategy 멀티-GPU 학습",
      "TFLite, ONNX Export 추론 배포 지원",
      "Keras Tuner 자동 하이퍼파라미터 최적화",
    ],
    "img3": [
      "Meta LLaMA 2 / 3 시리즈 전용 최적화",
      "LoRA / QLoRA 4비트 양자화 파인튜닝",
      "DeepSpeed ZeRO-2 / ZeRO-3 분산 학습",
      "Flash Attention 2 메모리 효율 최적화",
      "HuggingFace TRL SFT / RLHF 학습 파이프라인",
      "vLLM 고속 추론 서빙 지원",
    ],
    "img4": [
      "AUTOMATIC1111 WebUI (최신 릴리즈) 기본 탑재",
      "ControlNet v1.1 전 모델 사전 설치",
      "LoRA, LyCORIS, Textual Inversion, Hypernetwork 지원",
      "xFormers 메모리 최적화로 고해상도 생성 가능",
      "REST API 모드 활성화, 외부 연동 가능",
      "img2img, inpainting, outpainting 전 기능 지원",
    ],
    "img5": [
      "HuggingFace Transformers 4.38 최신 버전",
      "Sentence Transformers 임베딩 및 유사도 검색",
      "BERT, RoBERTa, DeBERTa 사전학습 모델 즉시 사용",
      "텍스트 분류 / NER / QA / 요약 파이프라인",
      "ONNX Runtime 추론 최적화 및 양자화",
      "datasets, evaluate 라이브러리 통합",
    ],
    "img6": [
      "Pandas 2.1 + Polars 고속 데이터프레임 처리",
      "Scikit-learn 1.3 / XGBoost / LightGBM ML 라이브러리",
      "Plotly Express + Dash 인터랙티브 시각화",
      "Apache Spark 3.5 분산 데이터 처리",
      "SQLAlchemy + DuckDB 임베디드 분석 쿼리",
      "MLflow 실험 추적 및 모델 레지스트리",
    ],
    "img7": [
      "Ultralytics YOLOv8 전 모델 (n/s/m/l/x) 포함",
      "OpenCV 4.8 실시간 영상 처리 및 스트리밍",
      "TensorRT 최적화로 실시간 추론 가속",
      "SAM (Segment Anything Model) 통합",
      "ONNX Export 및 Triton 서빙 지원",
      "다중 카메라 스트리밍 파이프라인 구성 가능",
    ],
    "img8": [
      "Python 3.11 + Poetry 의존성 관리 도구",
      "VS Code Server + GitHub Copilot 지원",
      "pre-commit, Black, Ruff 코드 품질 자동화",
      "pytest + coverage 테스트 환경 사전 구성",
      "mypy 타입 체킹, bandit 보안 스캔",
      "Docker-in-Docker 지원 (컨테이너 빌드 가능)",
    ],
  };

  const quickstartMap: Record<string, string> = {
    "img1": `import torch

# GPU 확인
print(torch.__version__)          # 2.1.0
print(torch.cuda.is_available())  # True
print(torch.cuda.device_count())  # GPU 수

# 모델 학습 기본 패턴
device = torch.device("cuda")
model = MyModel().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-4)

for epoch in range(10):
    for batch in dataloader:
        loss = model(batch.to(device))
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()`,
    "img2": `import tensorflow as tf

# GPU 전략 설정
strategy = tf.distribute.MirroredStrategy()
print(f"GPU 수: {strategy.num_replicas_in_sync}")

with strategy.scope():
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dense(10, activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="categorical_crossentropy")

model.fit(train_ds, epochs=10, validation_data=val_ds)`,
    "img3": `from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model

# QLoRA 4비트 로드
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    load_in_4bit=True,
    device_map="auto",
)

# LoRA 적용
lora_config = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj", "v_proj"])
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # trainable: 0.10%`,
    "img4": `# JupyterLab 터미널에서 WebUI 실행
cd /workspace/stable-diffusion-webui
python launch.py --xformers --api --listen --port 7860

# API를 통한 이미지 생성 예시
import requests, base64

response = requests.post("http://localhost:7860/sdapi/v1/txt2img", json={
    "prompt": "a beautiful sunset over the ocean, photorealistic",
    "negative_prompt": "blurry, low quality",
    "width": 768, "height": 512, "steps": 30,
})
image_b64 = response.json()["images"][0]`,
    "img5": `from transformers import pipeline

# 텍스트 분류 파이프라인
clf = pipeline("text-classification", model="snunlp/KR-FinBert-SC")
print(clf("이 분기 실적이 매우 좋습니다"))
# [{'label': 'positive', 'score': 0.987}]

# 임베딩 생성 (Sentence Transformers)
from sentence_transformers import SentenceTransformer
encoder = SentenceTransformer("jhgan/ko-sroberta-multitask")
embeddings = encoder.encode(["안녕하세요", "반갑습니다"])
similarity = (embeddings[0] @ embeddings[1]) / (...)`,
    "img6": `import pandas as pd
import plotly.express as px
from sklearn.ensemble import GradientBoostingClassifier

# 데이터 로드 및 분석
df = pd.read_parquet("/local_storage/dataset.parquet")
print(df.describe())

# 시각화
fig = px.scatter(df, x="feature_1", y="target", color="category",
                 title="Feature Distribution")
fig.write_html("output.html")

# 모델 학습
X, y = df.drop("target", axis=1), df["target"]
model = GradientBoostingClassifier(n_estimators=200)
model.fit(X, y)`,
    "img7": `from ultralytics import YOLO
import cv2

# YOLOv8 모델 로드 (n/s/m/l/x 선택)
model = YOLO("yolov8m.pt")

# 이미지 추론
results = model.predict("image.jpg", device="cuda", conf=0.5)
results[0].show()
results[0].save("output.jpg")

# 실시간 스트리밍 추론
cap = cv2.VideoCapture(0)
while cap.isOpened():
    ret, frame = cap.read()
    results = model(frame, stream=True)
    annotated = results[0].plot()`,
    "img8": `# 프로젝트 초기화
poetry new my-project && cd my-project
poetry add requests pandas numpy

# 코드 품질 설정
pre-commit install
cat .pre-commit-config.yaml
# repos: [black, ruff, mypy, bandit]

# 테스트 실행
pytest tests/ -v --cov=src --cov-report=html

# 타입 체킹
mypy src/ --strict`,
  };

  const accessMap: Record<string, string[]> = {
    "img1": ["📓 JupyterLab — Port 8888", "💻 VS Code Server — Port 8080", "🔑 SSH — Port 22"],
    "img2": ["📓 JupyterLab — Port 8888", "💻 VS Code Server — Port 8080", "🔑 SSH — Port 22"],
    "img3": ["📓 JupyterLab — Port 8888", "🔑 SSH — Port 22"],
    "img4": ["🌐 WebUI — Port 7860", "💻 VS Code Server — Port 8080", "🔑 SSH — Port 22"],
    "img5": ["📓 JupyterLab — Port 8888", "🔑 SSH — Port 22"],
    "img6": ["📓 JupyterLab — Port 8888", "💻 VS Code Server — Port 8080", "🔑 SSH — Port 22"],
    "img7": ["💻 VS Code Server — Port 8080", "🔑 SSH — Port 22"],
    "img8": ["💻 VS Code Server — Port 8080", "🔑 SSH — Port 22"],
  };

  const features = featureMap[img.id] ?? [];
  const quickstart = quickstartMap[img.id] ?? "";
  const accessMethods = accessMap[img.id] ?? [];

  return (
    <div>
      <H>✅ 주요 기능</H>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {features.map((f, i) => <Li key={i}>{f}</Li>)}
      </ul>

      <H>🚀 빠른 시작</H>
      <Code>{quickstart}</Code>

      <H>📡 접속 방법</H>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {accessMethods.map((method, i) => (
          <div key={i} style={{ padding: "8px 12px", borderRadius: 8, backgroundColor: GRAY_5, border: `1px solid ${GRAY_30}`, fontSize: 12, color: GRAY_70 }}>
            {method}
          </div>
        ))}
      </div>

      <H>⚙️ 시스템 요구사항</H>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { label: "권장 GPU", value: img.recGpu },
          { label: "임시 스토리지", value: `${img.recTmp}GB 이상` },
          { label: "권장 로컬 스토리지", value: img.recLocal > 0 ? `${img.recLocal}GB 권장` : "선택 사항" },
          { label: "Python", value: "3.11" },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "8px 12px", backgroundColor: GRAY_5, borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: GRAY_60, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90 }}>{value}</div>
          </div>
        ))}
      </div>

      <H>📝 참고사항</H>
      <div style={{ fontSize: 12, color: GRAY_70, lineHeight: 1.8, padding: "10px 14px", backgroundColor: "rgb(255,251,235)", borderRadius: 8, border: `1px solid rgb(254,215,170)` }}>
        <strong>데이터 보존:</strong> 임시 스토리지(NVMe)는 서버 중지 시 데이터가 소멸됩니다. 체크포인트 및 중요 결과물은 로컬 스토리지 또는 공유 스토리지에 저장하세요.<br />
        <br />
        <strong>GPU 선택:</strong> 권장 GPU보다 낮은 VRAM을 선택하면 OOM(Out of Memory) 오류가 발생할 수 있습니다. 배치 크기를 줄이거나 그라디언트 체크포인팅을 활성화하세요.<br />
        <br />
        <strong>비용 최적화:</strong> 모델 학습이 완료된 후에는 서버를 정지하면 GPU 비용이 중단됩니다. 로컬 스토리지는 정지 중에도 과금됩니다.
      </div>
    </div>
  );
}

// ─── Image Detail ─────────────────────────────────────────────────────────────
function ImageDetail({ img, onBack, onUseTemplate }: { img: typeof images[0]; onBack: () => void; onUseTemplate: () => void }) {
  const template = GALLERY_TEMPLATES[img.id] ?? null;

  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 1000 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: GRAY_60, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>
          ← Gallery로 돌아가기
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <Card style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: PRIMARY_10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, flexShrink: 0 }}>
                  {img.thumb}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Badge color={img.tier === "Official" ? "primary" : "success"}>{img.tier}</Badge>
                    <Badge color="neutral">{img.category}</Badge>
                    {img.trending && <Badge color="warning">🔥 Trending</Badge>}
                    {img.featured && <Badge color="info">⭐ Featured</Badge>}
                  </div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: GRAY_90, margin: "0 0 6px" }}>{img.name}</h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Stars rating={img.rating} />
                    <span style={{ fontSize: 12, color: GRAY_60 }}>리뷰 {img.reviewCount}개</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: GRAY_60 }}>
                      <Users size={12} /> {img.used.toLocaleString()} uses
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {img.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 12, color: PRIMARY, backgroundColor: PRIMARY_10, padding: "3px 10px", borderRadius: 6 }}>{tag}</span>
                ))}
              </div>
            </Card>

            {/* README description */}
            <SectionCard title="📖 상세 설명" subtitle={img.desc}>
              <ReadmeContent img={img} />
            </SectionCard>

            {/* Packages */}
            <SectionCard title="사전 설치 패키지">
              <div style={{ backgroundColor: "rgb(18,18,28)", borderRadius: 10, padding: "16px 20px" }}>
                <pre style={{ margin: 0, fontFamily: "Roboto Mono, monospace", fontSize: 12, lineHeight: 1.8, color: "rgb(180,200,255)" }}>
                  {img.packages.map((p, i) => (
                    <div key={i}><span style={{ color: "rgb(100,200,140)" }}>$</span> <span style={{ color: "rgb(220,220,170)" }}>pip install</span> <span style={{ color: "rgb(200,220,255)" }}>{p}</span></div>
                  ))}
                </pre>
              </div>
            </SectionCard>

            {/* GPU support */}
            <SectionCard title="지원 GPU">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {img.gpuTypes.map(gpu => (
                  <div key={gpu} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", backgroundColor: GRAY_5, borderRadius: 10 }}>
                    <Cpu size={14} color={PRIMARY} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: GRAY_90 }}>{gpu}</span>
                    <Badge color={gpu === img.recGpu ? "primary" : "neutral"}>{gpu === img.recGpu ? "권장" : "지원"}</Badge>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Unified server creation card */}
            <Card style={{ padding: "20px 22px", border: `2px solid ${PRIMARY}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: GRAY_90, marginBottom: 14 }}>서버 생성</div>

              {/* Primary CTA */}
              <PrimaryBtn onClick={onUseTemplate} style={{ width: "100%", justifyContent: "center" }}>
                <Zap size={14} /> 이 이미지로 서버 생성
              </PrimaryBtn>
              <div style={{ fontSize: 11, color: GRAY_60, textAlign: "center", marginTop: 8 }}>
                GPU 선택 및 스토리지 설정은 다음 화면에서
              </div>

              {/* Template section */}
              {template && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 12px" }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: GRAY_30 }} />
                    <span style={{ fontSize: 11, color: GRAY_40, flexShrink: 0 }}>또는 템플릿 사용</span>
                    <div style={{ flex: 1, height: 1, backgroundColor: GRAY_30 }} />
                  </div>
                  <div style={{ padding: "14px", borderRadius: 10, backgroundColor: PRIMARY_10, border: `1px solid ${PRIMARY}30` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span>🚀</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>{template.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 10, lineHeight: 1.5 }}>{template.desc}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, fontSize: 11, color: GRAY_70 }}>
                      <span style={{ padding: "2px 8px", backgroundColor: "white", borderRadius: 4, border: `1px solid ${GRAY_30}` }}>vRAM: {template.recVram}</span>
                      <span style={{ padding: "2px 8px", backgroundColor: "white", borderRadius: 4, border: `1px solid ${GRAY_30}` }}>임시: {template.recTmp}GB</span>
                      {template.localGB > 0 && <span style={{ padding: "2px 8px", backgroundColor: "white", borderRadius: 4, border: `1px solid ${GRAY_30}` }}>로컬: {template.localGB}GB</span>}
                      {template.hasShared && <span style={{ padding: "2px 8px", backgroundColor: "white", borderRadius: 4, border: `1px solid ${BLUE}30`, color: BLUE }}>공유 스토리지</span>}
                    </div>
                    <button onClick={onUseTemplate} style={{
                      width: "100%", padding: "8px 0", borderRadius: 8,
                      backgroundColor: PRIMARY, border: "none", color: "white",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    }}>
                      이 템플릿으로 생성 <ArrowRight size={11} />
                    </button>
                  </div>
                </>
              )}
            </Card>

            {/* Stats */}
            <SectionCard title="사용 통계">
              {[
                { label: "총 사용 횟수", value: `${img.used.toLocaleString()} 회` },
                { label: "평균 평점", value: `${img.rating} / 5.0` },
                { label: "리뷰 수", value: `${img.reviewCount}건` },
                { label: "서버 템플릿", value: template ? "1개 사용 가능" : "없음" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${GRAY_5}`, fontSize: 12 }}>
                  <span style={{ color: GRAY_60 }}>{label}</span>
                  <span style={{ color: GRAY_90, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Page ─────────────────────────────────────────────────────────────
export function GalleryPage({ onServerCreate }: { onServerCreate: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedTier, setSelectedTier] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<typeof images[0] | null>(null);
  const [templateFilter, setTemplateFilter] = useState(false);

  if (selectedImage) {
    return (
      <ImageDetail
        img={selectedImage}
        onBack={() => setSelectedImage(null)}
        onUseTemplate={() => { setSelectedImage(null); onServerCreate(); }}
      />
    );
  }

  const maxUsed = Math.max(...images.map(i => i.used));

  const filtered = images.filter(img => {
    const matchCategory = selectedCategory === "전체" || img.category === selectedCategory;
    const matchTier = selectedTier === "전체" || img.tier === selectedTier;
    const matchTemplate = !templateFilter || Boolean(GALLERY_TEMPLATES[img.id]);
    const matchSearch = !searchQuery ||
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      img.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchTier && matchTemplate && matchSearch;
  });

  const featuredImages = images.filter(i => i.featured);
  const trendingImages = images.filter(i => i.trending);

  return (
    <div style={{ flex: 1, overflow: "auto", backgroundColor: GRAY_5, padding: 28 }}>
      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: GRAY_90, margin: "0 0 4px" }}>Gallery</h1>
          <p style={{ fontSize: 13, color: GRAY_60, margin: 0 }}>검증된 서버 이미지를 탐색하고 서버를 생성하세요.</p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search size={16} color={GRAY_60} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="이미지 이름, 프레임워크, 태그로 검색... (예: PyTorch, LLaMA, ControlNet)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", height: 46, paddingLeft: 42, paddingRight: 16,
              borderRadius: 12, border: `1.5px solid ${searchQuery ? PRIMARY : GRAY_30}`,
              backgroundColor: "white", fontSize: 14, color: GRAY_90,
              outline: "none", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "border-color 0.15s",
            }}
          />
        </div>

        {/* Featured / Trending (shown when no search/filter) */}
        {!searchQuery && selectedCategory === "전체" && selectedTier === "전체" && !templateFilter && (
          <>
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Star size={15} color={PRIMARY} fill={PRIMARY} />
                <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>Featured</span>
                <span style={{ fontSize: 12, color: GRAY_60 }}>큐레이션 이미지</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {featuredImages.map(img => (
                  <FeaturedCard key={img.id} img={img} onSelect={() => setSelectedImage(img)} />
                ))}
              </div>
            </section>

            <section style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Flame size={15} color="rgb(220,80,0)" />
                <span style={{ fontSize: 15, fontWeight: 700, color: GRAY_90 }}>Trending</span>
                <span style={{ fontSize: 12, color: GRAY_60 }}>이번 주 인기 급상승</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {trendingImages.map(img => (
                  <button key={img.id} onClick={() => setSelectedImage(img)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                    backgroundColor: "white", borderRadius: 12, border: `1px solid ${GRAY_30}`,
                    cursor: "pointer", textAlign: "left", transition: "all 0.1s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = `0 4px 12px rgba(99,90,220,0.1)`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = GRAY_30; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ fontSize: 26, flexShrink: 0 }}>{img.thumb}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GRAY_90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</div>
                      <Stars rating={img.rating} />
                    </div>
                    <ChevronRight size={14} color={GRAY_40} style={{ marginLeft: "auto", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                padding: "5px 14px", borderRadius: 999, border: `1px solid ${selectedCategory === cat ? PRIMARY : GRAY_30}`,
                backgroundColor: selectedCategory === cat ? PRIMARY_10 : "white",
                color: selectedCategory === cat ? PRIMARY : GRAY_70,
                fontSize: 12, fontWeight: selectedCategory === cat ? 700 : 400,
                cursor: "pointer", transition: "all 0.1s",
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, backgroundColor: "white", padding: "4px", borderRadius: 10, border: `1px solid ${GRAY_30}`, flexShrink: 0 }}>
            {tierOptions.map(t => (
              <button key={t} onClick={() => setSelectedTier(t)} style={{
                padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 500, transition: "all 0.1s",
                backgroundColor: selectedTier === t ? PRIMARY : "transparent",
                color: selectedTier === t ? "white" : GRAY_70,
              }}>{t}</button>
            ))}
          </div>
          <button onClick={() => setTemplateFilter(!templateFilter)} style={{
            padding: "5px 13px", borderRadius: 999, flexShrink: 0,
            border: `1px solid ${templateFilter ? PRIMARY : GRAY_30}`,
            backgroundColor: templateFilter ? PRIMARY_10 : "white",
            color: templateFilter ? PRIMARY : GRAY_70,
            fontSize: 12, fontWeight: templateFilter ? 700 : 400,
            cursor: "pointer", transition: "all 0.1s",
          }}>🚀 템플릿 있음</button>
        </div>

        {/* Grid */}
        <div style={{ fontSize: 12, color: GRAY_60, marginBottom: 12 }}>
          {searchQuery || selectedCategory !== "전체" || selectedTier !== "전체" || templateFilter
            ? `검색 결과 ${filtered.length}개`
            : `전체 ${images.length}개`}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: GRAY_60, fontSize: 14 }}>
            검색 결과가 없습니다.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {filtered.map(img => (
              <ImageCard key={img.id} img={img} maxUsed={maxUsed} onSelect={() => setSelectedImage(img)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

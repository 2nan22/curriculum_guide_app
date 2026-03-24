/**
 * @fileoverview 직무/레벨 2단계 선택 페이지
 *
 * 흐름: role-selection → level-selection → config → (generating) → roadmap
 *
 * sample.jsx의 전체 페이지 전환 패턴(step state)을 따릅니다.
 * 각 단계는 독립적인 화면으로 렌더링되며, step 상태로 전환합니다.
 */

import { useState } from 'react'
import {
  Layout,
  Terminal,
  Brain,
  Database,
  Smartphone,
  Server,
  GraduationCap,
  Layers,
  Award,
  ChevronLeft,
  ArrowRight,
  Cpu,
  Zap,
  BookOpen,
} from 'lucide-react'

import { CenteredLayout } from '../common/Layout.jsx'
import Button from '../common/Button.jsx'
import RoleCard from './RoleCard.jsx'
import LevelCard from './LevelCard.jsx'
import { useSelection } from '../../context/SelectionContext.jsx'

// ── 데이터 상수 ───────────────────────────────────────

/** @type {import('./RoleCard.jsx').RoleConfig[]} */
const ROLES = [
  {
    id: 'Frontend',
    title: 'Frontend Architect',
    icon: Layout,
    desc: 'Modern UI/UX, React, Performance, WebAssembly',
    badge: 'React · TypeScript · CSS · WebGL',
  },
  {
    id: 'Backend',
    title: 'Backend Engineer',
    icon: Terminal,
    desc: 'Microservices, Scalability, Distributed Systems',
    badge: 'Java · Python · Node · SQL',
  },
  {
    id: 'AI/ML',
    title: 'AI Developer',
    icon: Brain,
    desc: 'LLM Fine-tuning, RAG, PyTorch, Vector DB',
    badge: 'PyTorch · LangChain · CUDA · HuggingFace',
  },
  {
    id: 'Data Engineering',
    title: 'Data Scientist',
    icon: Database,
    desc: 'ETL Pipelines, ML Ops, Statistical Analysis',
    badge: 'Spark · Airflow · dbt · Pandas',
  },
  {
    id: 'DevOps',
    title: 'DevOps / SRE',
    icon: Server,
    desc: 'CI/CD, Kubernetes, Observability, IaC',
    badge: 'Docker · K8s · Terraform · Prometheus',
  },
  {
    id: 'Mobile',
    title: 'Mobile Developer',
    icon: Smartphone,
    desc: 'iOS, Android, React Native, Flutter',
    badge: 'Swift · Kotlin · RN · Flutter',
  },
]

/** @type {import('./LevelCard.jsx').LevelConfig[]} */
const LEVELS = [
  {
    id: 'Junior',
    title: 'Junior',
    icon: GraduationCap,
    yearRange: '0 – 2년',
    desc: '기초 문법과 핵심 도구를 탄탄히 다지는 단계',
    traits: ['기초 문법', '툴 숙달', '코드 리딩'],
  },
  {
    id: 'Mid',
    title: 'Mid-Level',
    icon: Layers,
    yearRange: '2 – 5년',
    desc: '아키텍처 설계와 실무 성능 최적화를 익히는 단계',
    traits: ['설계 패턴', '성능 최적화', '코드 리뷰'],
  },
  {
    id: 'Senior',
    title: 'Senior / Lead',
    icon: Award,
    yearRange: '5년 +',
    desc: '시스템 확장성, 보안, 팀 리딩을 다루는 단계',
    traits: ['시스템 설계', '기술 리딩', '아키텍처'],
  },
]

const LLM_PROVIDERS = {
  OLLAMA: { name: 'Ollama (Local)', icon: Cpu },
  UPSTAGE: { name: 'Upstage (Cloud)', icon: Zap },
}

// ── 단계별 뷰 컴포넌트 ────────────────────────────────

/** 역할 선택 뷰 */
function RoleSelectionView({ selectedRole, onSelect }) {
  return (
    <CenteredLayout>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-slate-900 p-2.5 rounded-2xl">
          <BookOpen size={22} className="text-white" />
        </div>
        <span className="font-black text-xl tracking-tight">AI Path</span>
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
        커리어 패스를 선택하세요
      </h1>
      <p className="text-slate-500 mb-12">
        전문가로 성장하기 위한 첫 걸음을 떼어보세요.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {ROLES.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={selectedRole?.id === role.id}
            onSelect={() => onSelect(role)}
          />
        ))}
      </div>
    </CenteredLayout>
  )
}

/** 레벨 선택 뷰 */
function LevelSelectionView({ selectedRole, selectedLevel, onSelect, onBack }) {
  return (
    <CenteredLayout>
      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors"
      >
        <ChevronLeft size={20} />
        뒤로 가기
      </button>

      <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
        {selectedRole.title} 선택 완료
      </p>
      <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
        현재 숙련도는 어느 정도인가요?
      </h1>
      <p className="text-slate-500 mb-12">
        수준에 맞는 최적화된 로드맵을 생성합니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {LEVELS.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
            selected={selectedLevel?.id === level.id}
            onSelect={() => onSelect(level)}
          />
        ))}
      </div>
    </CenteredLayout>
  )
}

/** LLM 프로바이더 설정 + 생성 시작 뷰 */
function ConfigView({ selectedRole, selectedLevel, provider, onProviderChange, onStart, onBack, loading }) {
  return (
    <CenteredLayout>
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-xl border border-slate-100">
        {/* 선택 요약 헤더 */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white">
              <selectedRole.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                {selectedLevel.title} Level
              </p>
              <h2 className="text-2xl font-black text-slate-900">
                {selectedRole.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-400 hover:text-slate-900 underline underline-offset-4"
          >
            조건 변경
          </button>
        </div>

        {/* LLM 프로바이더 선택 */}
        <div className="mb-8">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            LLM Provider
          </p>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(LLM_PROVIDERS).map(([key, cfg]) => {
              const Icon = cfg.icon
              const active = provider === key
              return (
                <button
                  key={key}
                  onClick={() => onProviderChange(key)}
                  className={[
                    'p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2',
                    active
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-100 text-slate-400 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <Icon size={24} />
                  <span className="text-xs font-black">{cfg.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 생성 시작 버튼 */}
        <Button
          fullWidth
          size="lg"
          loading={loading}
          onClick={onStart}
          className="group"
        >
          로드맵 시각화 시작
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </CenteredLayout>
  )
}

/** 생성 중 로딩 뷰 */
function GeneratingView({ selectedLevel }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="relative mb-10">
        <div className="w-40 h-40 border-[6px] border-slate-50 border-t-blue-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain size={48} className="text-blue-600 animate-pulse" />
        </div>
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
        {selectedLevel.title} 레벨 분석 중...
      </h2>
      <p className="text-slate-500 mt-3">LLM이 최적의 로드맵을 설계하고 있습니다</p>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────

/**
 * 선택 → 설정 → 생성 전체 흐름을 관리하는 컨테이너 컴포넌트
 *
 * @param {object} props
 * @param {(roadmapData: object) => void} props.onRoadmapReady - 생성 완료 시 콜백
 */
export default function SelectionPage({ onRoadmapReady }) {
  const { state, dispatch } = useSelection()
  const [step, setStep] = useState('role-selection')
  const [provider, setProvider] = useState('OLLAMA')
  const [loading, setLoading] = useState(false)

  const selectedRole = ROLES.find((r) => r.id === state.role) ?? null
  const selectedLevel = LEVELS.find((l) => l.id === state.level) ?? null

  async function handleStart() {
    setStep('generating')
    setLoading(true)
    try {
      // apiService는 Session 2에서 실제 LLM 연동으로 교체됩니다.
      // 현재는 더미 데이터로 레이아웃만 검증합니다.
      await new Promise((r) => setTimeout(r, 1500))
      const dummyData = buildDummyRoadmap(state.role, state.level)
      onRoadmapReady(dummyData)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'role-selection') {
    return (
      <RoleSelectionView
        selectedRole={selectedRole}
        onSelect={(role) => {
          dispatch({ type: 'SET_ROLE', payload: role.id })
          setStep('level-selection')
        }}
      />
    )
  }

  if (step === 'level-selection') {
    return (
      <LevelSelectionView
        selectedRole={selectedRole}
        selectedLevel={selectedLevel}
        onSelect={(level) => {
          dispatch({ type: 'SET_LEVEL', payload: level.id })
          setStep('config')
        }}
        onBack={() => setStep('role-selection')}
      />
    )
  }

  if (step === 'config') {
    return (
      <ConfigView
        selectedRole={selectedRole}
        selectedLevel={selectedLevel}
        provider={provider}
        onProviderChange={setProvider}
        onStart={handleStart}
        onBack={() => setStep('level-selection')}
        loading={loading}
      />
    )
  }

  return <GeneratingView selectedLevel={selectedLevel} />
}

// ── 더미 데이터 생성기 (Session 2 LLM 연동 전 임시) ────

function buildDummyRoadmap(role, level) {
  return {
    root: {
      id: 'root',
      label: `${role} — ${level}`,
      children: [
        {
          id: 'branch_1',
          label: '핵심 언어 & 도구',
          children: [
            { id: 'leaf_1_1', label: '언어 기초 & 타입 시스템', description: '기본 문법, 타입 시스템 이해', estimatedWeeks: 3, status: 'available' },
            { id: 'leaf_1_2', label: '패키지 매니저 & 빌드 도구', description: '의존성 관리 및 빌드 자동화', estimatedWeeks: 1, status: 'locked' },
          ],
        },
        {
          id: 'branch_2',
          label: '아키텍처 & 설계',
          children: [
            { id: 'leaf_2_1', label: '디자인 패턴', description: 'SOLID, GoF 패턴 실무 적용', estimatedWeeks: 4, status: 'locked' },
            { id: 'leaf_2_2', label: '시스템 설계 기초', description: 'CAP 이론, 확장성 전략', estimatedWeeks: 6, status: 'locked' },
          ],
        },
        {
          id: 'branch_3',
          label: '인프라 & 운영',
          children: [
            { id: 'leaf_3_1', label: 'Docker & 컨테이너', description: '이미지 빌드, 네트워크 구성', estimatedWeeks: 2, status: 'locked' },
            { id: 'leaf_3_2', label: 'CI/CD 파이프라인', description: 'GitHub Actions, 자동 배포', estimatedWeeks: 2, status: 'locked' },
          ],
        },
      ],
    },
  }
}

/**
 * @fileoverview 직무/레벨 2단계 선택 페이지
 *
 * 흐름: role-selection → level-selection → config → (generating) → roadmap
 *
 * sample.jsx의 전체 페이지 전환 패턴(step state)을 따릅니다.
 * 각 단계는 독립적인 화면으로 렌더링되며, step 상태로 전환합니다.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { hasRoadmap, loadRoadmap } from '../../services/storageService.js'

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
function RoleSelectionView({ selectedRole, onSelect, onBack }) {
  return (
    <CenteredLayout>
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={20} />
          홈으로
        </button>
      )}
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
function ConfigView({ selectedRole, selectedLevel, provider, onProviderChange, onStart, onBack, loading, error, onRestoreRoadmap }) {
  const hasCached = hasRoadmap(selectedRole.id, selectedLevel.id)

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

        {/* API 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* 이전 로드맵 복원 버튼 */}
        {hasCached && (
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={onRestoreRoadmap}
            className="mb-3"
          >
            이전 로드맵 불러오기
          </Button>
        )}

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
/**
 * @param {object} props
 * @param {(roadmapData: object) => void} props.onRoadmapReady - 생성 완료 시 콜백
 * @param {(role: string, level: string) => Promise<object>} props.generate - 로드맵 생성 함수
 * @param {boolean} props.loading - 로딩 상태
 */
export default function SelectionPage({ onRoadmapReady, generate, loading, onBack }) {
  const { state, dispatch } = useSelection()
  const [step, setStep] = useState('role-selection')
  const [provider, setProvider] = useState('OLLAMA')
  const [apiError, setApiError] = useState(null)

  const selectedRole = ROLES.find((r) => r.id === state.role) ?? null
  const selectedLevel = LEVELS.find((l) => l.id === state.level) ?? null

  function handleRestore() {
    const cached = loadRoadmap(state.role, state.level)
    if (cached) onRoadmapReady(cached)
  }

  async function handleStart() {
    setApiError(null)
    try {
      const data = await generate(state.role, state.level)
      onRoadmapReady(data)
    } catch (err) {
      setApiError(err.message ?? '로드맵 생성에 실패했습니다.')
      setStep('config')
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit:    { opacity: 0, y: -16, transition: { duration: 0.2 } },
  }

  return (
    <AnimatePresence mode="wait">
      {step === 'role-selection' && (
        <motion.div key="role" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <RoleSelectionView
            selectedRole={selectedRole}
            onSelect={(role) => {
              dispatch({ type: 'SET_ROLE', payload: role.id })
              setStep('level-selection')
            }}
            onBack={onBack}
          />
        </motion.div>
      )}

      {step === 'level-selection' && (
        <motion.div key="level" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <LevelSelectionView
            selectedRole={selectedRole}
            selectedLevel={selectedLevel}
            onSelect={(level) => {
              dispatch({ type: 'SET_LEVEL', payload: level.id })
              setStep('config')
            }}
            onBack={() => setStep('role-selection')}
          />
        </motion.div>
      )}

      {step === 'config' && (
        <motion.div key="config" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <ConfigView
            selectedRole={selectedRole}
            selectedLevel={selectedLevel}
            provider={provider}
            onProviderChange={setProvider}
            onStart={handleStart}
            onBack={() => setStep('level-selection')}
            loading={loading}
            error={apiError}
            onRestoreRoadmap={handleRestore}
          />
        </motion.div>
      )}

    </AnimatePresence>
  )
}


/**
 * @fileoverview 대시보드 홈 화면
 *
 * 저장된 로드맵 목록과 진행률을 카드로 표시합니다.
 */

import { useState } from 'react'
import { BookOpen, Plus, Brain, X } from 'lucide-react'
import { listSavedRoadmaps, getRoadmapProgress, deleteRoadmap } from '../../services/storageService.js'

const ROLE_COLORS = {
  Frontend:           { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100' },
  Backend:            { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100' },
  'AI/ML':            { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  DevOps:             { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  Mobile:             { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-100' },
  'Data Engineering': { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-100' },
}

const LEVEL_LABELS = {
  Junior: '주니어',
  Mid: '미드',
  Senior: '시니어',
}

// ── 로드맵 카드 ───────────────────────────────────────

function RoadmapCard({ role, level, onContinue, onDelete }) {
  const { completed, total } = getRoadmapProgress(role, level)
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0
  const color = ROLE_COLORS[role] ?? ROLE_COLORS['Frontend']

  function handleDelete(e) {
    e.stopPropagation()
    if (window.confirm(`${role} ${LEVEL_LABELS[level]} 로드맵을 삭제할까요?\n진행률도 함께 삭제됩니다.`)) {
      onDelete()
    }
  }

  return (
    <div className="relative bg-white border border-slate-100 rounded-[2rem] p-7 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col gap-5">
      {/* 삭제 버튼 */}
      <button
        onClick={handleDelete}
        className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 transition-colors"
        title="삭제"
      >
        <X size={14} />
      </button>
      {/* 배지 */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-black ${color.bg} ${color.text} border ${color.border}`}>
          {role}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600">
          {LEVEL_LABELS[level]}
        </span>
      </div>

      {/* 진행률 */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-slate-500">진행률</span>
          <span className="text-2xl font-black text-slate-900">{rate}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${rate}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">{completed} / {total} 노드 완료</p>
      </div>

      {/* 버튼 */}
      <button
        onClick={onContinue}
        className="w-full py-3 bg-slate-900 hover:bg-black text-white text-sm font-black rounded-2xl transition-colors"
      >
        이어서 학습
      </button>
    </div>
  )
}

// ── 빈 상태 ───────────────────────────────────────────

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center gap-6 py-20">
      <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center">
        <Brain size={40} className="text-slate-300" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">저장된 로드맵이 없습니다</h2>
        <p className="text-slate-400 text-sm">커리어 패스를 선택해 첫 번째 로드맵을 생성해보세요.</p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-colors"
      >
        <Plus size={18} />
        새 로드맵 만들기
      </button>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────

/**
 * @param {object} props
 * @param {() => void} props.onNew          - 새 로드맵 만들기 클릭
 * @param {(role: string, level: string) => void} props.onContinue - 이어서 학습 클릭
 */
export default function DashboardPage({ onNew, onContinue }) {
  const [savedRoadmaps, setSavedRoadmaps] = useState(() => listSavedRoadmaps())

  function handleDelete(role, level) {
    deleteRoadmap(role, level)
    setSavedRoadmaps((prev) => prev.filter((r) => !(r.role === role && r.level === level)))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 헤더 */}
      <nav className="h-16 border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-2xl">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">AI Path</span>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-black transition-colors"
        >
          <Plus size={16} />
          새 로드맵 만들기
        </button>
      </nav>

      {/* 본문 */}
      <main className="flex-1 flex flex-col px-6 md:px-10 py-10 max-w-5xl mx-auto w-full">
        {savedRoadmaps.length === 0 ? (
          <EmptyState onNew={onNew} />
        ) : (
          <>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">내 학습 현황</h1>
            <p className="text-slate-400 text-sm mb-8">저장된 로드맵을 이어서 학습하거나 새로운 경로를 만들어 보세요.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedRoadmaps.map(({ role, level }) => (
                <RoadmapCard
                  key={`${role}_${level}`}
                  role={role}
                  level={level}
                  onContinue={() => onContinue(role, level)}
                  onDelete={() => handleDelete(role, level)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

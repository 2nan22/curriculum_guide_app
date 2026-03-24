/**
 * @fileoverview 로드맵 메인 페이지
 *
 * 레이아웃: 헤더 + 좌(마인드맵/리스트) + 우(노드 상세)
 * sample.jsx의 3-panel 레이아웃을 따릅니다.
 *
 * 세션별 확장 예정:
 *   Session 2: 더미 데이터 → 실제 LLM 생성 데이터 교체
 *   Session 3: 우측 패널에 NodeDetailPanel, AI Tutor 추가
 *   Session 4: 진행률 바, 줌/팬 인터랙션 추가
 */

import { useState } from 'react'
import { BookOpen, Target, Layout, Brain, RefreshCw } from 'lucide-react'
import { FullLayout } from '../common/Layout.jsx'
import { useSelection } from '../../context/SelectionContext.jsx'
import MindmapLayout from './MindmapLayout.jsx'
import ListView from './ListView.jsx'
import ViewToggle from './ViewToggle.jsx'

// ── 노드 상세 플레이스홀더 ────────────────────────────

/**
 * 노드가 선택되지 않았을 때 표시하는 빈 상태 패널
 */
function EmptyDetailPanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-8">
        <Layout size={40} className="opacity-20" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-3">
        탐험할 노드를 선택하세요
      </h3>
      <p className="text-slate-400 text-sm">
        마인드맵 또는 리스트에서 학습 항목을 클릭하면<br />상세 내용이 여기에 표시됩니다.
      </p>
    </div>
  )
}

/**
 * 선택된 노드의 기본 정보를 표시하는 패널 (Session 3에서 NodeDetailPanel로 교체)
 *
 * @param {{ node: object }} props
 */
function NodeSummaryPanel({ node }) {
  const missions = node.missions ?? ['개념 이해 및 문서 학습', '실습 예제 구현', '실무 케이스 스터디']

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 노드 헤더 */}
      <div className="p-10 bg-slate-50/50 border-b">
        <div className="flex items-center gap-3 mb-6">
          <span
            className={[
              'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest',
              node.status === 'completed' ? 'bg-green-100 text-green-700' :
              node.status === 'available' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-500',
            ].join(' ')}
          >
            {node.status ?? 'locked'}
          </span>
          {node.estimatedWeeks && (
            <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100">
              예상 {node.estimatedWeeks}주
            </span>
          )}
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
          {node.label}
        </h1>
        {node.description && (
          <p className="text-slate-500 font-medium leading-relaxed">{node.description}</p>
        )}
      </div>

      {/* 학습 미션 목록 */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <h4 className="flex items-center gap-2 font-black text-slate-900 mb-6 uppercase tracking-wider text-sm">
          <Target size={18} className="text-blue-600" />
          Learning Missions
        </h4>
        <div className="space-y-4">
          {missions.map((mission, i) => (
            <div
              key={i}
              className="flex items-start gap-5 p-6 bg-white rounded-3xl border border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group"
            >
              <div className="mt-0.5 w-5 h-5 rounded-lg border-2 border-slate-200 group-hover:border-blue-500 flex items-center justify-center transition-all shrink-0">
                <div className="w-2 h-2 rounded-sm bg-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                {mission}
              </span>
            </div>
          ))}
        </div>

        {/* AI Tutor 플레이스홀더 (Session 3에서 구현) */}
        <div className="mt-10 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
            Coming in Session 3
          </p>
          <h4 className="text-lg font-black mb-2">AI Master Tutor</h4>
          <p className="text-slate-400 text-sm">
            현재 노드의 맥락을 기억하는 AI 튜터와 퀵 퀴즈 기능이 추가될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── 로딩 / 에러 상태 ──────────────────────────────────

function LoadingView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
      <div className="relative mb-8">
        <div className="w-24 h-24 border-[5px] border-slate-100 border-t-blue-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain size={32} className="text-blue-600 animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">로드맵 생성 중...</h2>
      <p className="text-slate-400 mt-2 text-sm">LLM이 최적의 커리큘럼을 설계하고 있습니다</p>
    </div>
  )
}

function ErrorView({ message, onRetry }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white gap-6">
      <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center">
        <RefreshCw size={36} className="text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2">생성 실패</h2>
        <p className="text-slate-500 text-sm max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-colors"
      >
        <RefreshCw size={16} />
        다시 시도
      </button>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────

/**
 * @param {object}       props
 * @param {object|null}  props.data     - 로드맵 트리 데이터 (`{ root: {...} }`)
 * @param {boolean}      [props.loading] - 생성 중 여부
 * @param {string|null}  [props.error]   - 에러 메시지
 * @param {() => void}   props.onReset  - 처음으로 돌아가기
 * @param {() => void}   [props.onRetry] - 재시도 콜백
 */
export default function RoadmapPage({ data, loading = false, error = null, onReset, onRetry }) {
  const { state } = useSelection()
  const [viewMode, setViewMode] = useState('mindmap')
  const [activeNode, setActiveNode] = useState(null)

  if (loading) {
    return (
      <FullLayout>
        <LoadingView />
      </FullLayout>
    )
  }

  if (error) {
    return (
      <FullLayout>
        <ErrorView message={error} onRetry={onRetry ?? onReset} />
      </FullLayout>
    )
  }

  const root = data?.root ?? data

  return (
    <FullLayout>
      {/* ── 헤더 ─────────────────────────────────────── */}
      <nav className="h-20 border-b flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="bg-slate-900 p-2.5 rounded-2xl shadow-lg shadow-slate-200 hover:bg-black transition-colors"
            title="처음으로"
          >
            <BookOpen size={22} className="text-white" />
          </button>
          <div>
            <span className="font-black text-xl tracking-tight">AI Path</span>
            {state.role && (
              <span className="ml-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {state.role} · {state.level}
              </span>
            )}
          </div>
        </div>

        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </nav>

      {/* ── 본문 2-panel ────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌: 마인드맵 / 리스트 */}
        <section className="flex-[1.4] p-10 flex flex-col overflow-hidden bg-slate-50/30">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {viewMode === 'mindmap' ? '인터랙티브 마인드맵' : '커리큘럼 리스트'}
            </h2>
            <p className="text-slate-500 mt-1 font-medium text-sm">
              핵심(Core)에서 심화(Leaf)로 기술을 확장하세요.
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            {viewMode === 'mindmap' ? (
              <MindmapLayout
                data={root}
                activeNodeId={activeNode?.id ?? null}
                onNodeClick={setActiveNode}
              />
            ) : (
              <ListView
                data={root}
                activeId={activeNode?.id ?? null}
                onSelect={setActiveNode}
              />
            )}
          </div>
        </section>

        {/* 우: 노드 상세 */}
        <section className="flex-1 border-l bg-white flex flex-col overflow-hidden">
          {activeNode ? (
            <NodeSummaryPanel node={activeNode} />
          ) : (
            <EmptyDetailPanel />
          )}
        </section>
      </div>
    </FullLayout>
  )
}

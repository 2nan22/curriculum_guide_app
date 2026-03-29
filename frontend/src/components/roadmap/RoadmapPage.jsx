/**
 * @fileoverview 로드맵 메인 페이지
 *
 * 레이아웃: 헤더 + 좌(마인드맵/리스트) + 우(노드 상세)
 */

import { useState, useMemo } from 'react'
import { BookOpen, Layout, Brain, RefreshCw } from 'lucide-react'
import { FullLayout } from '../common/Layout.jsx'
import { useSelection } from '../../context/SelectionContext.jsx'
import { useProgress } from '../../hooks/useProgress.js'
import MindmapLayout from './MindmapLayout.jsx'
import ListView from './ListView.jsx'
import ViewToggle from './ViewToggle.jsx'
import NodeDetailPanel from './NodeDetailPanel.jsx'
import AiTutorChat from './AiTutorChat.jsx'
import ProgressBar from './ProgressBar.jsx'

// ── 빈 상태 패널 ──────────────────────────────────────

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
 * @param {object|null}  props.data     - 로드맵 트리 데이터
 * @param {boolean}      [props.loading]
 * @param {string|null}  [props.error]
 * @param {() => void}   props.onReset
 * @param {() => void}   [props.onRetry]
 * @param {string}       [props.role]   - URL 파라미터에서 전달된 role (Context보다 우선)
 * @param {string}       [props.level]  - URL 파라미터에서 전달된 level (Context보다 우선)
 */
export default function RoadmapPage({ data, loading = false, error = null, onReset, onRetry, role: roleProp, level: levelProp }) {
  const { state } = useSelection()
  const [viewMode, setViewMode] = useState('mindmap')
  const [activeNode, setActiveNode] = useState(null)

  const role = roleProp ?? state.role
  const level = levelProp ?? state.level

  const root = data?.root ?? data

  const { completedNodes, toggleComplete, getCompletionRate, getBranchRate } = useProgress(
    role,
    level,
  )

  const [tutorMessage, setTutorMessage] = useState(null)

  function sendToTutor(text) {
    setTutorMessage({ text, id: Date.now() })
  }

  const allNodes = useMemo(() => {
    if (!root) return []
    const result = []
    function walk(node, level) {
      result.push({ ...node, treeLevel: level })
      ;(node.children ?? []).forEach((c) => walk(c, level + 1))
    }
    walk(root, 0)
    return result
  }, [root])

  const completionRate = getCompletionRate(allNodes)

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

  return (
    <FullLayout>
      {/* ── 헤더 ─────────────────────────────────────── */}
      <nav className="h-16 border-b flex items-center justify-between px-6 md:px-10 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onReset}
            className="bg-slate-900 p-2.5 rounded-2xl shadow-lg shadow-slate-200 hover:bg-black transition-colors"
            title="처음으로"
          >
            <BookOpen size={20} className="text-white" />
          </button>
          <div>
            <span className="font-black text-lg md:text-xl tracking-tight">AI Path</span>
            {role && (
              <span className="ml-2 md:ml-3 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">
                {role} · {level}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 전체 진행률 — 헤더 우측 */}
          <div className="hidden sm:block">
            <ProgressBar.Header rate={completionRate} />
          </div>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </nav>

      {/* ── 본문 2-panel ────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* 좌: 마인드맵 / 리스트 */}
        <section className="flex-[1.4] p-4 md:p-10 flex flex-col overflow-hidden bg-slate-50/30 md:min-h-0 min-h-[40vh]">
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
              {viewMode === 'mindmap' ? '인터랙티브 마인드맵' : '커리큘럼 리스트'}
            </h2>
            <p className="text-slate-500 mt-1 font-medium text-sm hidden md:block">
              핵심(Core)에서 심화(Leaf)로 기술을 확장하세요.
            </p>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            {viewMode === 'mindmap' ? (
              <MindmapLayout
                data={root}
                activeNodeId={activeNode?.id ?? null}
                onNodeClick={setActiveNode}
                completedNodes={completedNodes}
                getBranchRate={getBranchRate}
              />
            ) : (
              <ListView
                data={root}
                activeId={activeNode?.id ?? null}
                onSelect={setActiveNode}
                completedNodes={completedNodes}
              />
            )}
          </div>
        </section>

        {/* 우: 노드 상세 */}
        <section className="flex-1 border-l border-t md:border-t-0 bg-white flex flex-col overflow-hidden md:min-h-0">
          {activeNode ? (
            <NodeDetailPanel
              node={activeNode}
              role={role}
              level={level}
              visible={!!activeNode}
              completedNodes={completedNodes}
              onToggleComplete={toggleComplete}
              onAskTutor={sendToTutor}
            />
          ) : (
            <EmptyDetailPanel />
          )}
        </section>
      </div>

      {/* AI 튜터 플로팅 채팅창 */}
      <AiTutorChat
        activeNode={activeNode}
        role={role}
        level={level}
        pendingMessage={tutorMessage}
      />
    </FullLayout>
  )
}

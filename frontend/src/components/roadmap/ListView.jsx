/**
 * @fileoverview 마인드맵 데이터를 아코디언 목록으로 표시하는 뷰
 *
 * MindmapLayout과 동일한 데이터 구조를 받아 다른 방식으로 렌더링합니다.
 * Branch는 아코디언 토글, Leaf는 클릭 시 activeNode 선택.
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Circle, Lock } from 'lucide-react'

// ── 상태 아이콘 맵 ────────────────────────────────────

/** status에 따른 아이콘 렌더러 */
function StatusIcon({ status, isActive }) {
  const activeClass = isActive ? 'text-white' : ''
  if (status === 'completed')
    return <CheckCircle size={16} className={isActive ? 'text-white' : 'text-green-500'} />
  if (status === 'available')
    return <Circle size={16} className={`${isActive ? 'text-white' : 'text-blue-500'} animate-pulse`} />
  return <Lock size={14} className={isActive ? 'text-white/60' : 'text-slate-300'} />
}

// ── 재귀 노드 컴포넌트 ────────────────────────────────

/**
 * 트리 노드를 재귀적으로 렌더링합니다.
 *
 * @param {object} props
 * @param {object} props.node       - 로드맵 노드
 * @param {number} [props.depth=0] - 들여쓰기 깊이
 * @param {string|null} props.activeId
 * @param {(node: object) => void} props.onSelect
 */
function ListNode({ node, depth = 0, activeId, onSelect, completedNodes }) {
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = node.children?.length > 0
  const isActive = activeId === node.id

  const indent = depth * 20

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        className={[
          'flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all select-none',
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
            : 'hover:bg-slate-100 text-slate-700',
        ].join(' ')}
        style={{ marginLeft: `${indent}px` }}
        onClick={() => {
          onSelect(node)
          if (hasChildren) setIsOpen((v) => !v)
        }}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(node)}
      >
        {/* 폴드 토글 아이콘 */}
        <span className="w-4 shrink-0">
          {hasChildren ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : null}
        </span>

        <StatusIcon status={completedNodes.has(node.id) ? 'completed' : node.status} isActive={isActive} />

        <span className="font-bold text-sm tracking-tight flex-1 truncate">
          {node.label}
        </span>

        {node.estimatedWeeks && (
          <span
            className={[
              'text-[10px] font-black shrink-0',
              isActive ? 'text-white/70' : 'text-slate-400',
            ].join(' ')}
          >
            {node.estimatedWeeks}주
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="mt-1 space-y-0.5">
          {node.children.map((child) => (
            <ListNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
              completedNodes={completedNodes}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────

/**
 * @param {object} props
 * @param {object} props.data           - 로드맵 루트 노드
 * @param {string|null} props.activeId
 * @param {(node: object) => void} props.onSelect
 */
export default function ListView({ data, activeId, onSelect, completedNodes = new Set() }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-inner h-full overflow-y-auto p-8 custom-scrollbar">
      <ListNode node={data} activeId={activeId} onSelect={onSelect} completedNodes={completedNodes} />
    </div>
  )
}

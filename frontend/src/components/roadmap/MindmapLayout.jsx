/**
 * @fileoverview SVG 마인드맵 레이아웃 엔진
 *
 * 노드 배치 알고리즘: 왼쪽(Root) → 오른쪽(Branch → Leaf) 방향 트리
 *
 * 열(column) 기반 배치:
 *   Col 0 (x=120): Root 노드, y=캔버스 중앙
 *   Col 1 (x=360): Branch 노드, y=균등 분배
 *   Col 2 (x=620): Leaf 노드, y=소속 Branch 기준 균등 분배
 *
 * 연결선: 수평 Bezier Curve (cubic)
 *   M x1,y1 C midX,y1 midX,y2 x2,y2
 *
 * 줌/팬: 마우스 휠(0.5x~2.5x) + 드래그, "전체 보기" 버튼으로 리셋
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import MindmapNode from './MindmapNode.jsx'
import ProgressBar from './ProgressBar.jsx'

// ── 레이아웃 상수 ─────────────────────────────────────

const CANVAS = { width: 900, height: 560 }
const COL_X = { root: 110, branch: 340, leaf: 600 }
const PADDING = { top: 60, bottom: 60 }
const LEAF_SPACING = 72   // leaf 노드 간 최소 간격(px)
const BRANCH_MIN_H = 100  // branch 노드 간 최소 간격(px)

const SCALE_MIN = 0.5
const SCALE_MAX = 2.5

// ── 위치 계산 유틸 ────────────────────────────────────

function distributeY(count, minY, maxY, minGap) {
  if (count === 1) return [(minY + maxY) / 2]
  const available = maxY - minY
  const step = Math.max(available / (count - 1), minGap)
  const totalH = step * (count - 1)
  const startY = (minY + maxY) / 2 - totalH / 2
  return Array.from({ length: count }, (_, i) => startY + i * step)
}

function computeLayout(root) {
  const nodes = []
  const edges = []

  const branches = root.children ?? []
  const rootY = CANVAS.height / 2

  nodes.push({ ...root, x: COL_X.root, y: rootY, treeLevel: 0 })

  const branchYs = distributeY(
    branches.length,
    PADDING.top,
    CANVAS.height - PADDING.bottom,
    BRANCH_MIN_H,
  )

  branches.forEach((branch, bi) => {
    const bx = COL_X.branch
    const by = branchYs[bi]

    nodes.push({ ...branch, x: bx, y: by, treeLevel: 1 })
    edges.push({ id: `e-root-${branch.id}`, x1: COL_X.root, y1: rootY, x2: bx, y2: by })

    const leaves = branch.children ?? []
    const leafYs = distributeY(
      leaves.length,
      by - (leaves.length - 1) * LEAF_SPACING * 0.6,
      by + (leaves.length - 1) * LEAF_SPACING * 0.6,
      LEAF_SPACING,
    )

    leaves.forEach((leaf, li) => {
      const lx = COL_X.leaf
      const ly = leafYs[li]
      nodes.push({ ...leaf, x: lx, y: ly, treeLevel: 2 })
      edges.push({ id: `e-${branch.id}-${leaf.id}`, x1: bx, y1: by, x2: lx, y2: ly })
    })
  })

  return { nodes, edges }
}

// ── 연결선 컴포넌트 ───────────────────────────────────

function Edge({ id, x1, y1, x2, y2 }) {
  const midX = (x1 + x2) / 2
  const d = `M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`
  return (
    <path
      key={id}
      d={d}
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="1.5"
      strokeDasharray="5 3"
    />
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────

/**
 * @param {object} props
 * @param {object} props.data           - 로드맵 루트 노드
 * @param {string|null} props.activeNodeId
 * @param {(node: object) => void} props.onNodeClick
 * @param {Set<string>} [props.completedNodes]  - 완료된 노드 ID Set
 * @param {(branch: object) => number} [props.getBranchRate] - 브랜치 완료율 함수
 */
export default function MindmapLayout({ data, activeNodeId, onNodeClick, completedNodes = new Set(), getBranchRate }) {
  const { nodes, edges } = useMemo(() => computeLayout(data), [data])

  // ── 오버레이 상태 ───────────────────────────────────
  const [allRendered, setAllRendered] = useState(false)
  const renderedCount = useRef(0)

  useEffect(() => {
    setAllRendered(false)
    renderedCount.current = 0
  }, [data])

  function handleNodeAnimationComplete() {
    renderedCount.current += 1
    if (renderedCount.current >= nodes.length) {
      setAllRendered(true)
    }
  }

  // ── 줌/팬 상태 ─────────────────────────────────────
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 })
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const svgRef = useRef(null)

  const resetView = useCallback(() => {
    setTransform({ scale: 1, tx: 0, ty: 0 })
  }, [])

  function handleWheel(e) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform((prev) => {
      const next = Math.max(SCALE_MIN, Math.min(SCALE_MAX, prev.scale * delta))
      return { ...prev, scale: next }
    })
  }

  function handleMouseDown(e) {
    if (e.button !== 0) return
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  function handleMouseMove(e) {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setTransform((prev) => ({ ...prev, tx: prev.tx + dx, ty: prev.ty + dy }))
  }

  function handleMouseUp() {
    isDragging.current = false
  }

  // 브랜치별 완료율 오버레이 위치 계산
  const branchNodes = nodes.filter((n) => n.treeLevel === 1)

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner overflow-hidden">
      {!allRendered && (
        <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-[2.5rem] pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400">마인드맵 구성 중...</p>
          </div>
        </div>
      )}
      {/* 전체 보기 버튼 */}
      <button
        onClick={resetView}
        title="전체 보기"
        className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Maximize2 size={16} className="text-slate-600" />
      </button>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
        className="w-full h-full"
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        aria-label="커리큘럼 마인드맵"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${transform.tx}, ${transform.ty}) scale(${transform.scale})`}>
          {/* 연결선 먼저 렌더 */}
          <g>
            {edges.map((e) => (
              <Edge key={e.id} {...e} />
            ))}
          </g>

          {/* 노드 — stagger 등장 애니메이션 */}
          <g>
            {nodes.map((node, i) => (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.25, ease: 'easeOut' }}
                onAnimationComplete={handleNodeAnimationComplete}
              >
                <MindmapNode
                  x={node.x}
                  y={node.y}
                  label={node.label}
                  status={node.status ?? 'locked'}
                  treeLevel={node.treeLevel}
                  isActive={activeNodeId === node.id}
                  isCompleted={completedNodes.has(node.id)}
                  onClick={() => onNodeClick(node)}
                />
              </motion.g>
            ))}
          </g>

          {/* 브랜치 완료율 원형 인디케이터 */}
          {getBranchRate && branchNodes.map((branch) => {
            const rate = getBranchRate(
              // 원본 트리에서 children 포함 branch 찾기
              (data.children ?? []).find((b) => b.id === branch.id) ?? branch,
            )
            return (
              <g key={`progress-${branch.id}`} transform={`translate(${branch.x - 90}, ${branch.y})`}>
                <ProgressBar.Branch rate={rate} />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

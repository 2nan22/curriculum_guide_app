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
 */

import { useMemo } from 'react'
import MindmapNode from './MindmapNode.jsx'

// ── 레이아웃 상수 ─────────────────────────────────────

const CANVAS = { width: 900, height: 560 }
const COL_X = { root: 110, branch: 340, leaf: 600 }
const PADDING = { top: 60, bottom: 60 }
const LEAF_SPACING = 72   // leaf 노드 간 최소 간격(px)
const BRANCH_MIN_H = 100  // branch 노드 간 최소 간격(px)

// ── 위치 계산 유틸 ────────────────────────────────────

/**
 * 균등 간격 Y 좌표 배열을 계산합니다.
 *
 * @param {number} count    - 노드 수
 * @param {number} minY     - 상단 패딩 Y
 * @param {number} maxY     - 하단 패딩 Y
 * @param {number} minGap   - 최소 간격
 * @returns {number[]}
 */
function distributeY(count, minY, maxY, minGap) {
  if (count === 1) return [(minY + maxY) / 2]
  const available = maxY - minY
  const step = Math.max(available / (count - 1), minGap)
  const totalH = step * (count - 1)
  const startY = (minY + maxY) / 2 - totalH / 2
  return Array.from({ length: count }, (_, i) => startY + i * step)
}

/**
 * 로드맵 트리 데이터를 SVG 좌표 배열로 변환합니다.
 *
 * @param {object} root - 로드맵 루트 노드
 * @returns {{ nodes: object[], edges: object[] }}
 */
function computeLayout(root) {
  const nodes = []
  const edges = []

  const branches = root.children ?? []
  const rootY = CANVAS.height / 2

  // Root 노드
  nodes.push({ ...root, x: COL_X.root, y: rootY, treeLevel: 0 })

  // Branch 노드 Y 좌표 계산
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

/**
 * 두 노드를 잇는 Cubic Bezier Curve 선
 *
 * @param {{ id: string, x1: number, y1: number, x2: number, y2: number }} props
 */
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
 * @param {object} props.data         - 로드맵 루트 노드 (`roadmapData.root`)
 * @param {string|null} props.activeNodeId
 * @param {(node: object) => void} props.onNodeClick
 */
export default function MindmapLayout({ data, activeNodeId, onNodeClick }) {
  // data가 바뀔 때만 레이아웃 재계산
  const { nodes, edges } = useMemo(() => computeLayout(data), [data])

  return (
    <div className="w-full h-full bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner overflow-hidden">
      <svg
        viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
        className="w-full h-full"
        aria-label="커리큘럼 마인드맵"
      >
        {/* 연결선 먼저 렌더 (노드 아래에 위치) */}
        <g>
          {edges.map((e) => (
            <Edge key={e.id} {...e} />
          ))}
        </g>

        {/* 노드 */}
        <g>
          {nodes.map((node) => (
            <MindmapNode
              key={node.id}
              x={node.x}
              y={node.y}
              label={node.label}
              status={node.status ?? 'locked'}
              treeLevel={node.treeLevel}
              isActive={activeNodeId === node.id}
              onClick={() => onNodeClick(node)}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

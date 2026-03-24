/**
 * @fileoverview SVG 마인드맵 개별 노드 컴포넌트
 *
 * 트리 깊이(treeLevel)에 따라 모양이 달라집니다:
 *   0 (root)  → 큰 원
 *   1 (branch)→ 둥근 사각형 (rx=14)
 *   2 (leaf)  → 작은 타원 (rx=22)
 *
 * status에 따른 색상:
 *   completed → green-500
 *   available → blue-600  (활성/선택)
 *   locked    → slate-200 (잠금)
 */

/** @type {Record<string, {bg: string, text: string, stroke: string}>} */
const STATUS_COLORS = {
  completed: { bg: '#22c55e', text: '#ffffff', stroke: '#16a34a' },
  available:  { bg: '#3b82f6', text: '#ffffff', stroke: '#2563eb' },
  locked:     { bg: '#ffffff', text: '#94a3b8', stroke: '#e2e8f0' },
}

/** 트리 레벨별 노드 크기 */
const NODE_SIZES = {
  0: { rx: 40, ry: 28, width: 140, height: 56, fontSize: 13 },  // root
  1: { rx: 14, ry: 14, width: 150, height: 44, fontSize: 12 },  // branch
  2: { rx: 22, ry: 22, width: 140, height: 40, fontSize: 11 },  // leaf
}

/**
 * @param {object} props
 * @param {number} props.x            - SVG 중심 X 좌표
 * @param {number} props.y            - SVG 중심 Y 좌표
 * @param {string} props.label        - 노드 텍스트
 * @param {'completed'|'available'|'locked'} props.status
 * @param {number} [props.treeLevel=2] - 트리 깊이 (0=root, 1=branch, 2=leaf)
 * @param {boolean} [props.isActive=false] - 현재 선택된 노드 여부
 * @param {() => void} [props.onClick]
 */
export default function MindmapNode({
  x,
  y,
  label,
  status = 'locked',
  treeLevel = 2,
  isActive = false,
  onClick,
}) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.locked
  const size = NODE_SIZES[treeLevel] ?? NODE_SIZES[2]

  const halfW = size.width / 2
  const halfH = size.height / 2

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label={label}
    >
      {/* 선택 시 외부 글로우 링 */}
      {isActive && (
        <rect
          x={-(halfW + 4)}
          y={-(halfH + 4)}
          width={size.width + 8}
          height={size.height + 8}
          rx={size.rx + 4}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          opacity="0.4"
        />
      )}

      {/* 노드 본체 */}
      <rect
        x={-halfW}
        y={-halfH}
        width={size.width}
        height={size.height}
        rx={size.rx}
        ry={size.ry}
        fill={colors.bg}
        stroke={isActive ? '#3b82f6' : colors.stroke}
        strokeWidth={isActive ? 3 : 1.5}
        style={{ filter: isActive ? 'drop-shadow(0 4px 12px rgba(59,130,246,0.35))' : 'none' }}
      />

      {/* 레이블 텍스트 (20자 초과 시 말줄임) */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size.fontSize}
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        fill={colors.text}
        className="select-none pointer-events-none"
      >
        {label.length > 16 ? `${label.slice(0, 15)}…` : label}
      </text>
    </g>
  )
}

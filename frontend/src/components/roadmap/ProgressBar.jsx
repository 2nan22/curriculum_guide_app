/**
 * @fileoverview 학습 진행률 표시 컴포넌트
 *
 * 두 가지 사용 형태:
 *   1. <ProgressBar.Header rate={42} /> — 헤더 우측 전체 진행률 표시
 *   2. <ProgressBar.Branch rate={75} label="React" /> — 마인드맵 브랜치 옆 미니 표시
 */

// ── 헤더 전체 진행률 ───────────────────────────────────

function Header({ rate = 0 }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
        <span>진행률</span>
        <span className="text-slate-900 text-sm">{rate}%</span>
      </div>
      <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  )
}

// ── 브랜치 미니 진행률 ────────────────────────────────

function Branch({ rate = 0 }) {
  const color =
    rate === 100
      ? '#22c55e' // green
      : rate > 0
        ? '#3b82f6' // blue
        : '#e2e8f0' // slate

  const radius = 8
  const circumference = 2 * Math.PI * radius
  const dash = (rate / 100) * circumference

  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      {/* 배경 원 */}
      <circle cx="11" cy="11" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="3" />
      {/* 진행 원호 */}
      <circle
        cx="11"
        cy="11"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={circumference * 0.25}
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
    </svg>
  )
}

const ProgressBar = { Header, Branch }
export default ProgressBar

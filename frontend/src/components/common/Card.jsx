/**
 * @fileoverview 공통 Card 컴포넌트
 *
 * 선택 가능 상태(selected)와 호버 효과를 지원합니다.
 * sample.jsx의 `rounded-[2rem] border-2 hover:border-blue-500 hover:shadow-2xl` 패턴을 재사용합니다.
 */

/**
 * @param {object} props
 * @param {boolean} [props.selected=false] - 선택된 상태 (파란 테두리 + 배경)
 * @param {boolean} [props.interactive=true] - 호버/클릭 효과 활성화
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 * @param {() => void} [props.onClick]
 */
export default function Card({
  selected = false,
  interactive = true,
  className = '',
  children,
  onClick,
}) {
  const base = 'bg-white rounded-[2rem] border-2 transition-all duration-200'

  const stateClasses = selected
    ? 'border-blue-500 shadow-2xl shadow-blue-500/10 bg-blue-50/30'
    : interactive
    ? 'border-transparent hover:border-blue-500 hover:shadow-2xl'
    : 'border-slate-100'

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={[base, stateClasses, onClick ? 'cursor-pointer' : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {children}
    </div>
  )
}

/**
 * @fileoverview 페이지 기본 레이아웃 래퍼
 *
 * 전체 화면 높이를 채우고, 중앙 정렬 컨테이너를 제공합니다.
 * 선택 페이지(centered)와 로드맵 페이지(full-height split) 두 모드를 지원합니다.
 */

/**
 * 선택/온보딩 화면용 — 수직 중앙 정렬, bg-slate-50
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function CenteredLayout({ children, className = '' }) {
  return (
    <div
      className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * 로드맵 화면용 — 전체 높이, overflow-hidden (내부 스크롤)
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function FullLayout({ children, className = '' }) {
  return (
    <div className={`h-screen bg-white flex flex-col overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/**
 * @fileoverview 공통 Button 컴포넌트
 *
 * variant, size, 로딩 상태를 지원하는 재사용 버튼입니다.
 * sample.jsx의 디자인 언어를 따릅니다 (rounded-2xl, font-black, hover 전환).
 */

/** @type {Record<string, string>} variant별 Tailwind 클래스 */
const VARIANT_CLASSES = {
  primary:
    'bg-slate-900 text-white hover:bg-black shadow-xl',
  secondary:
    'bg-white text-slate-900 border border-slate-200 hover:border-blue-500 hover:shadow-xl',
  ghost:
    'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
  danger:
    'bg-red-500 text-white hover:bg-red-600 shadow-lg',
}

/** @type {Record<string, string>} size별 Tailwind 클래스 */
const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-5 text-base',
}

/**
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.loading=false] - 스피너 표시 여부
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.className] - 추가 Tailwind 클래스
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-black rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <button
      className={[
        base,
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

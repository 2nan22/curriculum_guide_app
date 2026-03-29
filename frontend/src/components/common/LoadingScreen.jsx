import { useState, useEffect } from 'react'
import useLoadingQuotes from '../../hooks/useLoadingQuotes'

/**
 * 로드맵 생성 대기 중 표시되는 로딩 화면
 *
 * @param {object} props
 * @param {string} props.role  - 역할 (quotes 선택 및 타이틀 표시에 사용)
 * @param {string} props.level - 레벨 (타이틀 표시에 사용)
 */
function LoadingScreen({ role, level }) {
  const { currentQuote } = useLoadingQuotes(role)
  const [visible, setVisible] = useState(true)
  const [displayedQuote, setDisplayedQuote] = useState(currentQuote)

  // 문장 변경 시 페이드 아웃 → 텍스트 교체 → 페이드 인
  useEffect(() => {
    setVisible(false)
    const timer = setTimeout(() => {
      setDisplayedQuote(currentQuote)
      setVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [currentQuote])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* 스피너 */}
      <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-8" />

      {/* 타이틀 */}
      <h2 className="text-2xl font-semibold text-slate-800 mb-3 text-center">
        {role} {level} 로드맵을 생성하고 있습니다
      </h2>

      {/* 안내 문구 */}
      <p className="text-slate-500 text-sm mb-12 text-center">
        AI가 최적의 학습 경로를 분석 중입니다. 약 1~3분 소요될 수 있습니다.
      </p>

      {/* 지식 문장 (페이드 전환) */}
      <div className="max-w-lg text-center">
        <p
          className="text-slate-600 text-base leading-relaxed transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {displayedQuote}
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen

/**
 * @fileoverview 앱 루트 컴포넌트
 *
 * 전체 흐름:
 *   selection (SelectionPage) → roadmap (RoadmapPage)
 *
 * SelectionProvider로 전역 선택 상태를 제공합니다.
 * RoadmapPage는 Session 2에서 LLM 연동 후 완성됩니다.
 */

import { useState } from 'react'
import { SelectionProvider, useSelection } from './context/SelectionContext.jsx'
import SelectionPage from './components/selection/SelectionPage.jsx'
import RoadmapPage from './components/roadmap/RoadmapPage.jsx'

// ── 내부 라우팅 컨텍스트 ──────────────────────────────

/**
 * Provider 내부에서 페이지 전환을 처리하는 컴포넌트.
 * (react-router 없이 간단한 state 기반 라우팅 — Session 4에서 교체 예정)
 */
function AppRouter() {
  const [roadmapData, setRoadmapData] = useState(null)
  const { dispatch } = useSelection()

  function handleRoadmapReady(data) {
    setRoadmapData(data)
  }

  function handleReset() {
    dispatch({ type: 'RESET' })
    setRoadmapData(null)
  }

  if (roadmapData) {
    return <RoadmapPage data={roadmapData} onReset={handleReset} />
  }

  return <SelectionPage onRoadmapReady={handleRoadmapReady} />
}

// ── 루트 컴포넌트 ─────────────────────────────────────

export default function App() {
  return (
    <SelectionProvider>
      <AppRouter />
    </SelectionProvider>
  )
}

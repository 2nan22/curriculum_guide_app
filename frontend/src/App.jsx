/**
 * @fileoverview 앱 루트 컴포넌트
 *
 * 라우팅:
 *   /          → SelectionPage
 *   /roadmap   → RoadmapPage (URL: /roadmap?role=Backend&level=Mid)
 */

import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import { SelectionProvider, useSelection } from './context/SelectionContext.jsx'
import SelectionPage from './components/selection/SelectionPage.jsx'
import RoadmapPage from './components/roadmap/RoadmapPage.jsx'
import LoadingScreen from './components/common/LoadingScreen.jsx'
import { useRoadmapGeneration } from './hooks/useRoadmapGeneration.js'

// ── SelectionPage 래퍼 ────────────────────────────────

function SelectionRoute() {
  const navigate = useNavigate()
  const { state } = useSelection()
  const { generate, loading, loadingRole, loadingLevel } = useRoadmapGeneration()

  function handleRoadmapReady(data) {
    // 생성된 데이터를 location state로 전달
    navigate(`/roadmap?role=${encodeURIComponent(state.role)}&level=${encodeURIComponent(state.level)}`, {
      state: { roadmapData: data },
    })
  }

  if (loading) {
    return <LoadingScreen role={loadingRole} level={loadingLevel} />
  }

  return <SelectionPage onRoadmapReady={handleRoadmapReady} generate={generate} loading={loading} />
}

// ── RoadmapPage 래퍼 ──────────────────────────────────

function RoadmapRoute() {
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const { dispatch } = useSelection()

  // location.state 에서 roadmapData 꺼내기
  const locationState = window.history.state?.usr ?? {}
  const [data] = useState(locationState.roadmapData ?? null)

  function handleReset() {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  // 직접 URL 접근 시 데이터 없으면 선택 화면으로
  if (!data) {
    navigate('/')
    return null
  }

  return <RoadmapPage data={data} onReset={handleReset} />
}

// ── 루트 컴포넌트 ─────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <SelectionProvider>
        <Routes>
          <Route path="/" element={<SelectionRoute />} />
          <Route path="/roadmap" element={<RoadmapRoute />} />
        </Routes>
      </SelectionProvider>
    </BrowserRouter>
  )
}

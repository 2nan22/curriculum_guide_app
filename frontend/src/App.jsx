/**
 * @fileoverview 앱 루트 컴포넌트
 *
 * 라우팅:
 *   /          → DashboardPage
 *   /new       → SelectionPage
 *   /roadmap   → RoadmapPage (URL: /roadmap?role=Backend&level=Mid)
 */

import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { SelectionProvider, useSelection } from './context/SelectionContext.jsx'
import SelectionPage from './components/selection/SelectionPage.jsx'
import RoadmapPage from './components/roadmap/RoadmapPage.jsx'
import DashboardPage from './components/dashboard/DashboardPage.jsx'
import LoadingScreen from './components/common/LoadingScreen.jsx'
import { useRoadmapGeneration } from './hooks/useRoadmapGeneration.js'
import { saveRoadmap, loadRoadmap } from './services/storageService.js'

// ── DashboardPage 래퍼 ────────────────────────────────

function DashboardRoute() {
  const navigate = useNavigate()
  const { dispatch } = useSelection()

  function handleNew() {
    dispatch({ type: 'RESET' })
    navigate('/new')
  }

  function handleContinue(role, level) {
    const data = loadRoadmap(role, level)
    if (!data) return
    dispatch({ type: 'SET_ROLE', payload: role })
    dispatch({ type: 'SET_LEVEL', payload: level })
    navigate(`/roadmap?role=${encodeURIComponent(role)}&level=${encodeURIComponent(level)}`, {
      state: { roadmapData: data },
    })
  }

  return <DashboardPage onNew={handleNew} onContinue={handleContinue} />
}

// ── SelectionPage 래퍼 ────────────────────────────────

function SelectionRoute() {
  const navigate = useNavigate()
  const { state } = useSelection()
  const { generate, loading, loadingRole, loadingLevel } = useRoadmapGeneration()

  function handleRoadmapReady(data) {
    saveRoadmap(state.role, state.level, data)
    navigate(`/roadmap?role=${encodeURIComponent(state.role)}&level=${encodeURIComponent(state.level)}`, {
      state: { roadmapData: data },
    })
  }

  if (loading) {
    return <LoadingScreen role={loadingRole} level={loadingLevel} />
  }

  return <SelectionPage onRoadmapReady={handleRoadmapReady} generate={generate} loading={loading} onBack={() => navigate('/')} />
}

// ── RoadmapPage 래퍼 ──────────────────────────────────

function RoadmapRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { dispatch } = useSelection()

  // location.state 에서 roadmapData 꺼내기, 없으면 URL 파라미터로 localStorage 복원
  const role = searchParams.get('role')
  const level = searchParams.get('level')
  const [data] = useState(location.state?.roadmapData ?? loadRoadmap(role, level) ?? null)

  useEffect(() => {
    if (role && level) {
      dispatch({ type: 'SET_ROLE', payload: role })
      dispatch({ type: 'SET_LEVEL', payload: level })
    }
  }, [role, level])

  function handleReset() {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  // 직접 URL 접근 시 데이터 없으면 대시보드로
  if (!data) {
    navigate('/')
    return null
  }

  return <RoadmapPage data={data} role={role} level={level} onReset={handleReset} />
}

// ── 루트 컴포넌트 ─────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <SelectionProvider>
        <Routes>
          <Route path="/" element={<DashboardRoute />} />
          <Route path="/new" element={<SelectionRoute />} />
          <Route path="/roadmap" element={<RoadmapRoute />} />
        </Routes>
      </SelectionProvider>
    </BrowserRouter>
  )
}

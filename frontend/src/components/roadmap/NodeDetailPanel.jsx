/**
 * @fileoverview 노드 상세 패널
 *
 * 슬라이드인 애니메이션으로 우측에서 등장하며
 * 학습 미션 / 핵심 개념 / 추천 서적·강의 탭을 제공합니다.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Tag, BookOpen, Play, CheckCircle, Circle, ExternalLink } from 'lucide-react'
import { useNodeDetail } from '../../hooks/useNodeDetail.js'
import { useMissionGuide } from '../../hooks/useMissionGuide.js'
import { getRecommendations } from '../../utils/recommendationEngine.js'
import QuickQuiz from './QuickQuiz.jsx'

// ── 탭 상수 ───────────────────────────────────────────
const TABS = [
  { id: 'missions', label: '미션', icon: Target },
  { id: 'concepts', label: '개념', icon: Tag },
  { id: 'books', label: '서적', icon: BookOpen },
  { id: 'lectures', label: '강의', icon: Play },
  { id: 'docs', label: '공식문서', icon: ExternalLink },
]

// ── 미션 체크리스트 ────────────────────────────────────
function MissionList({ missions, loading, nodeLabel, role, level, onAskTutor }) {
  const [checked, setChecked] = useState({})
  const [openMission, setOpenMission] = useState(null)
  const { guide, loading: guideLoading, load: loadGuide } = useMissionGuide(nodeLabel, role, level)

  function toggle(i) {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }))
  }

  function handleMissionClick(mission, i) {
    toggle(i)
    if (openMission === mission) {
      setOpenMission(null)
    } else {
      setOpenMission(mission)
      loadGuide(mission)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {missions.map((mission, i) => (
        <div key={i}>
          <button
            onClick={() => handleMissionClick(mission, i)}
            className={[
              'w-full flex items-start gap-4 p-5 rounded-3xl border text-left transition-all',
              checked[i]
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5',
            ].join(' ')}
          >
            {checked[i] ? (
              <CheckCircle size={20} className="shrink-0 mt-0.5 text-green-500" />
            ) : (
              <Circle size={20} className="shrink-0 mt-0.5 text-slate-300" />
            )}
            <span className={`text-sm font-semibold leading-relaxed ${checked[i] ? 'line-through opacity-60' : ''}`}>
              {mission}
            </span>
          </button>

          {openMission === mission && (
            <div className="mt-2 ml-2 p-5 bg-slate-50 border border-slate-200 rounded-3xl">
              {guideLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : guide ? (
                <>
                  <ol className="space-y-4">
                    {guide.steps.map((step, j) => (
                      <li key={j} className="flex gap-4">
                        <span className="shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center mt-0.5">
                          {j + 1}
                        </span>
                        <div>
                          <p className="text-sm font-black text-slate-900 mb-1">{step.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {onAskTutor && (
                    <button
                      onClick={() => onAskTutor(`${nodeLabel} - ${openMission} 미션을 수행하는 방법을 자세히 알려주세요.`)}
                      className="mt-4 w-full py-2.5 text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl transition-colors"
                    >
                      AI 튜터에게 자세히 물어보기
                    </button>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── 핵심 개념 태그 ────────────────────────────────────
function ConceptTags({ concepts, loading }) {
  const [openTerm, setOpenTerm] = useState(null)

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-slate-100 rounded-full animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {concepts.map((concept, i) => {
        const isOpen = openTerm === concept.term
        return (
          <div key={i} className="flex flex-col">
            <button
              onClick={() => setOpenTerm(isOpen ? null : concept.term)}
              className={[
                'px-4 py-2 text-sm font-bold rounded-full border transition-all',
                isOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
              ].join(' ')}
            >
              {concept.term}
            </button>
            {isOpen && (
              <div className="mt-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700 leading-relaxed max-w-full max-h-36 overflow-y-auto">
                {concept.description}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function yes24SearchUrl(title) {
  return `https://www.yes24.com/Product/Search?query=${encodeURIComponent(title)}`
}

function inflearnSearchUrl(title) {
  return `https://www.inflearn.com/courses?s=${encodeURIComponent(title)}`
}

function lectureSearchUrl(lec) {
  if (lec.platform === '인프런') return inflearnSearchUrl(lec.title)
  return `https://www.udemy.com/courses/search/?q=${encodeURIComponent(lec.title)}`
}

// ── 서적 목록 ─────────────────────────────────────────
function BookList({ llmBooks, staticBooks, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    )
  }

  const isLlm = llmBooks.length > 0
  const books = isLlm ? llmBooks : staticBooks

  if (books.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-10">매칭된 서적 추천이 없습니다.</p>
  }
  return (
    <div className="space-y-3">
      {books.map((book, i) => (
        <a
          key={i}
          href={yes24SearchUrl(book.title)}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-md transition-all"
        >
          <p className="font-black text-slate-900 text-sm">{book.title}</p>
          <p className="text-slate-400 text-xs mt-1">{book.author}</p>
          {book.description && (
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{book.description}</p>
          )}
          {book.level && (
            <div className="flex gap-1 mt-2">
              {book.level.map((lv) => (
                <span key={lv} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                  {lv}
                </span>
              ))}
            </div>
          )}
        </a>
      ))}
    </div>
  )
}

// ── 강의 목록 ─────────────────────────────────────────
function LectureList({ llmLectures, staticLectures, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    )
  }

  const isLlm = llmLectures.length > 0
  const lectures = isLlm ? llmLectures : staticLectures

  if (lectures.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-10">매칭된 강의 추천이 없습니다.</p>
  }
  return (
    <div className="space-y-3">
      {lectures.map((lec, i) => (
        <a
          key={i}
          href={lectureSearchUrl(lec)}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-black text-slate-900 text-sm">{lec.title}</p>
            {lec.free && (
              <span className="shrink-0 text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                FREE
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            {lec.platform}
            {lec.instructor && ` · ${lec.instructor}`}
          </p>
          {lec.description && (
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{lec.description}</p>
          )}
        </a>
      ))}
    </div>
  )
}

// ── 공식 문서 목록 ────────────────────────────────────
function DocList({ docs }) {
  if (docs.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-10">공식 문서 정보가 없습니다.</p>
  }
  return (
    <div className="space-y-3">
      {docs.map((doc, i) => (
        <a
          key={i}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-black text-slate-900 text-sm">{doc.title}</p>
            <ExternalLink size={14} className="shrink-0 text-slate-300" />
          </div>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{doc.description}</p>
        </a>
      ))}
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────

/**
 * @param {object}   props
 * @param {object}   props.node         - 선택된 노드 객체 ({ id, label, ... })
 * @param {string}   props.role         - 현재 역할 (예: "Backend")
 * @param {string}   props.level        - 현재 레벨 (예: "Junior")
 * @param {boolean}  props.visible      - 패널 표시 여부 (슬라이드인 제어)
 * @param {Set<string>} props.completedNodes - 완료된 노드 ID Set
 * @param {(id: string) => void} props.onToggleComplete - 완료 토글 콜백
 */
export default function NodeDetailPanel({ node, role, level, visible, completedNodes = new Set(), onToggleComplete, onAskTutor }) {
  const [activeTab, setActiveTab] = useState('missions')
  const [recs, setRecs] = useState({ books: [], lectures: [], matchedKeyword: null })

  const { detail, resources, loading, error, load } = useNodeDetail(role, level)

  // 노드가 바뀌면 상세 정보 + 추천 로드
  useEffect(() => {
    if (!node) return
    setActiveTab('missions')
    load(node.label)

    getRecommendations(node.label, level)
      .then(setRecs)
      .catch(() => setRecs({ books: [], lectures: [], matchedKeyword: null }))
  }, [node?.id, role, level])

  const missions = detail?.missions ?? node?.missions ?? []
  const concepts = detail?.concepts ?? []

  return (
    <motion.div
      className="flex flex-1 flex-col overflow-hidden"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* 헤더 */}
      <div className="p-8 bg-slate-50/50 border-b shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <span
            className={[
              'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
              node?.status === 'completed' ? 'bg-green-100 text-green-700' :
              node?.status === 'available' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-500',
            ].join(' ')}
          >
            {node?.status ?? 'locked'}
          </span>
          {node?.estimatedWeeks && (
            <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
              예상 {node.estimatedWeeks}주
            </span>
          )}
          {recs.matchedKeyword && (
            <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              {recs.matchedKeyword}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-2">
          {node?.label}
        </h1>
        {node?.description && (
          <p className="text-slate-500 text-sm leading-relaxed">{node.description}</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full inline-block">
            상세 정보 로드 실패 (기본 데이터 표시 중)
          </p>
        )}

        {/* 학습 완료 토글 */}
        {node && onToggleComplete && (
          <button
            onClick={() => onToggleComplete(node.id)}
            className={[
              'mt-4 flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 text-sm font-black transition-all',
              completedNodes.has(node.id)
                ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                : 'bg-white border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-600',
            ].join(' ')}
          >
            {completedNodes.has(node.id) ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <Circle size={16} />
            )}
            {completedNodes.has(node.id) ? '학습 완료!' : '학습 완료로 표시'}
          </button>
        )}
      </div>

      {/* 탭 바 */}
      <div className="flex border-b bg-white shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-black uppercase tracking-widest transition-all',
              activeTab === id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-700',
            ].join(' ')}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'missions' && (
          <>
            <MissionList
              missions={missions}
              loading={loading}
              nodeLabel={node?.label}
              role={role}
              level={level}
              onAskTutor={onAskTutor}
            />
            <QuickQuiz
              node={node}
              role={role}
              level={level}
              onToggleComplete={onToggleComplete}
              isCompleted={completedNodes.has(node?.id)}
            />
          </>
        )}
        {activeTab === 'concepts' && (
          <ConceptTags concepts={concepts} loading={loading} />
        )}
        {activeTab === 'books' && (
          <BookList llmBooks={resources.books} staticBooks={recs.books} loading={loading} />
        )}
        {activeTab === 'lectures' && (
          <LectureList llmLectures={resources.lectures} staticLectures={recs.lectures} loading={loading} />
        )}
        {activeTab === 'docs' && (
          <DocList docs={resources.docs} />
        )}
      </div>
    </motion.div>
  )
}

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
import { getRecommendations } from '../../utils/recommendationEngine.js'
import QuickQuiz from './QuickQuiz.jsx'
import MissionList from './MissionList.jsx'
import ConceptTags from './ConceptTags.jsx'
import BookList from './BookList.jsx'
import LectureList from './LectureList.jsx'
import DocList from './DocList.jsx'

// ── 탭 상수 ───────────────────────────────────────────
const TABS = [
  { id: 'missions', label: '미션', icon: Target },
  { id: 'concepts', label: '개념', icon: Tag },
  { id: 'books', label: '서적', icon: BookOpen },
  { id: 'lectures', label: '강의', icon: Play },
  { id: 'docs', label: '공식문서', icon: ExternalLink },
]

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
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'missions' && (
              <>
                <MissionList
                  missions={missions}
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
              <ConceptTags concepts={concepts} />
            )}
            {activeTab === 'books' && (
              <BookList llmBooks={resources.books} staticBooks={recs.books} />
            )}
            {activeTab === 'lectures' && (
              <LectureList llmLectures={resources.lectures} staticLectures={recs.lectures} />
            )}
            {activeTab === 'docs' && (
              <DocList docs={resources.docs} />
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

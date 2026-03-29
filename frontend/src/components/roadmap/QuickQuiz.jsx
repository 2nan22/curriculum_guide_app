/**
 * @fileoverview 퀵 퀴즈 컴포넌트
 *
 * "퀴즈 생성" 버튼 → /api/node/quiz 호출
 * OX/객관식 3문제 표시, 정답 제출 후 해설 표시
 */

import { useState, useEffect } from 'react'
import { Zap, CheckCircle, XCircle, RotateCcw, Loader2 } from 'lucide-react'
import { fetchNodeQuiz } from '../../services/apiService.js'

// ── 단일 문제 컴포넌트 ────────────────────────────────

function QuizQuestion({ question, index, submitted, onSelect, selected }) {
  const isOx = question.type === 'ox'

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
      <p className="font-bold text-slate-800 text-sm leading-relaxed">
        <span className="text-blue-500 font-black mr-2">Q{index + 1}.</span>
        {question.question}
      </p>

      <div className={`grid gap-2 ${isOx ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = opt.correct

          let style = 'border-slate-100 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50'
          if (submitted && isCorrect) style = 'border-green-400 bg-green-50 text-green-800'
          else if (submitted && isSelected && !isCorrect) style = 'border-red-400 bg-red-50 text-red-700'
          else if (!submitted && isSelected) style = 'border-blue-500 bg-blue-50 text-blue-800'

          return (
            <button
              key={i}
              onClick={() => !submitted && onSelect(i)}
              disabled={submitted}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold text-left transition-all ${style}`}
            >
              {submitted && isCorrect && <CheckCircle size={15} className="shrink-0 text-green-500" />}
              {submitted && isSelected && !isCorrect && <XCircle size={15} className="shrink-0 text-red-500" />}
              {(!submitted || (!isCorrect && !isSelected)) && (
                <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center shrink-0 text-[10px] font-black">
                  {isOx ? opt.text : String.fromCharCode(65 + i)}
                </span>
              )}
              {!isOx && <span>{opt.text}</span>}
            </button>
          )
        })}
      </div>

      {submitted && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
          <span className="font-black">해설: </span>{question.explanation}
        </div>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────

/**
 * @param {object} props
 * @param {object} props.node  - 현재 선택된 노드
 * @param {string} props.role
 * @param {string} props.level
 */
export default function QuickQuiz({ node, role, level, onToggleComplete, isCompleted }) {
  const [questions, setQuestions] = useState(null)
  const [selections, setSelections] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generate() {
    setLoading(true)
    setError(null)
    setQuestions(null)
    setSelections({})
    setSubmitted(false)

    try {
      const data = await fetchNodeQuiz({ node_label: node.label, role, level })
      setQuestions(data.questions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reset()
  }, [node?.id])

  function reset() {
    setQuestions(null)
    setSelections({})
    setSubmitted(false)
    setError(null)
  }

  const score = questions
    ? questions.filter((q, i) => {
        const sel = selections[i]
        return sel !== undefined && q.options[sel]?.correct
      }).length
    : 0

  return (
    <div className="mt-6 border border-slate-100 rounded-[2rem] overflow-hidden">
      {/* 퀴즈 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="font-black text-sm">Quick Quiz</span>
        </div>
        {questions && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw size={12} />
            다시 만들기
          </button>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-6 space-y-4">
        {!questions && !loading && !error && (
          <div className="text-center py-2">
            <p className="text-sm text-slate-400 mb-4">
              <span className="font-bold text-slate-600">{node?.label}</span> 노드의 이해도를 확인해보세요.
            </p>
            <button
              onClick={generate}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-black transition-colors"
            >
              퀴즈 생성
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">퀴즈 생성 중...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button onClick={generate} className="text-sm text-blue-600 font-bold hover:underline">
              재시도
            </button>
          </div>
        )}

        {questions && questions.map((q, i) => (
          <QuizQuestion
            key={i}
            question={q}
            index={i}
            submitted={submitted}
            selected={selections[i]}
            onSelect={(sel) => setSelections((prev) => ({ ...prev, [i]: sel }))}
          />
        ))}

        {questions && !submitted && (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(selections).length < questions.length}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm rounded-2xl transition-all"
          >
            제출하기
          </button>
        )}

        {submitted && (
          <div className="text-center py-2 space-y-3">
            <div>
              <p className="text-2xl font-black text-slate-900">
                {score} / {questions.length}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {score === questions.length
                  ? '완벽해요! 🎉'
                  : score >= questions.length / 2
                  ? '잘 하고 있어요!'
                  : '조금 더 복습해 보세요.'}
              </p>
            </div>

            {score === questions.length && onToggleComplete && !isCompleted && (
              <button
                onClick={() => onToggleComplete(node.id)}
                className="w-full py-2.5 text-sm font-black text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-2xl transition-colors"
              >
                ✓ 학습 완료로 표시하기
              </button>
            )}

            {score === questions.length && isCompleted && (
              <p className="text-xs font-bold text-green-600 bg-green-50 py-2 rounded-2xl">
                학습 완료 노드입니다
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

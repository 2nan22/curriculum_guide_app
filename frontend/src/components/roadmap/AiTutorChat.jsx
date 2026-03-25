/**
 * @fileoverview AI 튜터 플로팅 채팅창
 *
 * - 우측 하단 고정, 최소화/최대화 토글
 * - SSE 스트리밍 응답으로 실시간 텍스트 표시
 * - 노드 변경 시 컨텍스트 안내 메시지 자동 삽입
 * - 메시지 히스토리 세션 유지
 */

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Minimize2, Send, Bot, User } from 'lucide-react'
import { streamChat } from '../../services/apiService.js'

// ── 메시지 버블 ───────────────────────────────────────

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  const isSystem = msg.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
          {msg.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={[
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          isUser ? 'bg-slate-900' : 'bg-blue-600',
        ].join(' ')}
      >
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
      </div>
      <div
        className={[
          'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-slate-900 text-white rounded-tr-sm'
            : 'bg-slate-100 text-slate-800 rounded-tl-sm',
        ].join(' ')}
      >
        {msg.content}
        {msg.streaming && <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 rounded-sm animate-pulse align-middle" />}
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────

/**
 * @param {object}      props
 * @param {object|null} props.activeNode - 현재 선택된 노드
 * @param {string}      props.role       - 현재 역할
 * @param {string}      props.level      - 현재 레벨
 */
export default function AiTutorChat({ activeNode, role, level }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef(null)
  const prevNodeId = useRef(null)

  // 노드가 바뀌면 컨텍스트 안내 메시지 삽입
  useEffect(() => {
    if (!activeNode) return
    if (activeNode.id === prevNodeId.current) return
    prevNodeId.current = activeNode.id

    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        content: `현재 '${activeNode.label}'을(를) 학습 중이시군요!`,
        id: Date.now(),
      },
    ])
  }, [activeNode?.id])

  // 새 메시지 올 때마다 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMsg = { role: 'user', content: text, id: Date.now() }
    const assistantId = Date.now() + 1
    const assistantMsg = { role: 'assistant', content: '', id: assistantId, streaming: true }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setStreaming(true)

    const history = [...messages, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map(({ role, content }) => ({ role, content }))

    const nodeCtx = activeNode
      ? { label: activeNode.label, role, level }
      : { label: '일반 학습', role, level }

    try {
      await streamChat(
        { messages: history, node_context: nodeCtx },
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m,
            ),
          )
        },
        () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false } : m,
            ),
          )
          setStreaming(false)
        },
      )
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `오류: ${err.message}`, streaming: false }
            : m,
        ),
      )
      setStreaming(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center transition-all hover:scale-110"
          title="AI 튜터 열기"
        >
          <MessageCircle size={24} />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {messages.filter((m) => m.role !== 'system').length > 9
                ? '9+'
                : messages.filter((m) => m.role !== 'system').length}
            </span>
          )}
        </button>
      )}

      {/* 채팅창 */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 border border-slate-100 flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div>
                <p className="text-sm font-black">AI Master Tutor</p>
                {activeNode && (
                  <p className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]">
                    {activeNode.label}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={() => { setOpen(false); setMessages([]) }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-red-500/80 flex items-center justify-center transition-colors"
                title="채팅 닫기 및 초기화"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-400">
                <Bot size={36} className="opacity-20" />
                <p className="text-sm font-medium">
                  {activeNode
                    ? `'${activeNode.label}' 학습을 도와드릴게요.`
                    : '노드를 선택하면 맞춤 학습을 도와드립니다.'}
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="p-4 border-t bg-slate-50">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="궁금한 점을 물어보세요..."
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={!input.trim() || streaming}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-2xl flex items-center justify-center transition-all shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">Enter로 전송, Shift+Enter로 줄바꿈</p>
          </div>
        </div>
      )}
    </>
  )
}

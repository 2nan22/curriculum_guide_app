/**
 * @fileoverview FastAPI 백엔드 통신 서비스
 *
 * 모든 HTTP 요청을 이 모듈에서 중앙 관리합니다.
 * Session 2에서 LLM 로드맵 생성 함수가 추가됩니다.
 *
 * @example
 * import { checkHealth, generateRoadmap } from '../services/apiService.js'
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// ── 공통 fetch 래퍼 ───────────────────────────────────

/**
 * fetch 래퍼. 비-2xx 응답을 자동으로 Error로 변환합니다.
 *
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${response.status}`)
  }
  return response.json()
}

// ── API 함수 ──────────────────────────────────────────

/**
 * 백엔드 헬스체크 (LLM 프로바이더 연결 확인용)
 *
 * @returns {Promise<{ status: string, provider: string, model: string }>}
 */
export async function checkHealth() {
  return request('/health')
}

/**
 * 로드맵 JSON 생성 요청
 *
 * @param {{ role: string, level: string, use_guideline?: boolean }} params
 * @returns {Promise<object>} 로드맵 트리 JSON
 */
export async function generateRoadmap({ role, level, use_guideline = true }) {
  return request('/api/roadmap/generate', {
    method: 'POST',
    body: JSON.stringify({ role, level, use_guideline }),
  })
}

/**
 * 노드 상세 정보 (미션 + 핵심 개념) 요청
 *
 * @param {{ node_label: string, role: string, level: string }} params
 * @returns {Promise<{ missions: string[], concepts: string[] }>}
 */
export async function fetchNodeDetail({ node_label, role, level }, signal) {
  return request('/api/node/detail', {
    method: 'POST',
    body: JSON.stringify({ node_label, role, level }),
    signal,
  })
}

/**
 * 노드 퀴즈 생성 요청
 *
 * @param {{ node_label: string, role: string, level: string }} params
 * @returns {Promise<{ questions: object[] }>}
 */
export async function fetchNodeQuiz({ node_label, role, level }) {
  return request('/api/node/quiz', {
    method: 'POST',
    body: JSON.stringify({ node_label, role, level }),
  })
}

/**
 * AI 튜터 SSE 스트리밍 채팅.
 *
 * @param {{ messages: {role:string,content:string}[], node_context: {label:string,role:string,level:string} }} params
 * @param {(token: string) => void} onChunk
 * @param {() => void} onDone
 * @returns {Promise<void>}
 */
export async function streamChat({ messages, node_context }, onChunk, onDone) {
  const response = await fetch(`${BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, node_context }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') {
        onDone()
        return
      }
      try {
        const parsed = JSON.parse(payload)
        if (parsed.error) throw new Error(parsed.error)
        if (parsed.token) onChunk(parsed.token)
      } catch (err) {
        throw err instanceof SyntaxError ? new Error('스트림 파싱 오류') : err
      }
    }
  }
}

/**
 * 로드맵 SSE 스트리밍 요청.
 * 서버에서 토큰이 도착할 때마다 onChunk 콜백을 호출하고,
 * 스트림이 완료되면 onDone 콜백을 호출합니다.
 *
 * @param {{ role: string, level: string, use_guideline?: boolean }} params
 * @param {(token: string) => void} onChunk  - 토큰 수신 콜백
 * @param {() => void}              onDone   - 스트림 완료 콜백
 * @returns {Promise<void>}
 */
export async function generateRoadmapStream(
  { role, level, use_guideline = true },
  onChunk,
  onDone,
) {
  const response = await fetch(`${BASE_URL}/api/roadmap/generate/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, level, use_guideline }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') {
        onDone()
        return
      }
      try {
        const parsed = JSON.parse(payload)
        if (parsed.error) throw new Error(parsed.error)
        if (parsed.token) onChunk(parsed.token)
      } catch (err) {
        throw err instanceof SyntaxError ? new Error('스트림 파싱 오류') : err
      }
    }
  }
}

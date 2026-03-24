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
 * 로드맵 JSON 생성 요청 (Session 2에서 실제 사용)
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

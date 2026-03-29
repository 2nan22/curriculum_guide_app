/**
 * @fileoverview 로드맵 생성 API 상태 관리 훅
 *
 * @example
 * const { data, loading, error, generate } = useRoadmapGeneration()
 * await generate('Backend', 'Junior')
 */

import { useState } from 'react'
import { generateRoadmap } from '../services/apiService.js'
import { saveRoadmap } from '../services/storageService.js'

/**
 * 로드맵 생성 요청 상태를 관리하는 훅.
 *
 * @returns {{
 *   data: object | null,
 *   loading: boolean,
 *   error: string | null,
 *   generate: (role: string, level: string) => Promise<object>
 * }}
 */
export function useRoadmapGeneration() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingRole, setLoadingRole] = useState(null)
  const [loadingLevel, setLoadingLevel] = useState(null)

  /**
   * 로드맵 생성을 요청합니다.
   *
   * @param {string} role  - 직무 (예: 'Backend')
   * @param {string} level - 숙련도 (예: 'Junior')
   * @returns {Promise<object>} 생성된 로드맵 데이터
   * @throws {Error} API 호출 실패 시
   */
  async function generate(role, level) {
    setLoading(true)
    setLoadingRole(role)
    setLoadingLevel(level)
    setError(null)
    try {
      const result = await generateRoadmap({ role, level })
      setData(result)
      saveRoadmap(role, level, result)
      return result
    } catch (err) {
      setError(err.message ?? '알 수 없는 오류가 발생했습니다.')
      throw err
    } finally {
      setLoading(false)
      setLoadingRole(null)
      setLoadingLevel(null)
    }
  }

  return { data, loading, error, generate, loadingRole, loadingLevel }
}

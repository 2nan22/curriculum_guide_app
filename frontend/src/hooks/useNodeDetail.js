/**
 * @fileoverview 노드 상세 정보 패치 훅 (인메모리 캐시 포함)
 *
 * 같은 노드 재클릭 시 API 재호출 없이 캐시에서 즉시 반환합니다.
 */

import { useState, useCallback, useRef } from 'react'
import { fetchNodeDetail } from '../services/apiService.js'

/**
 * @param {string} role
 * @param {string} level
 * @returns {{ detail: object|null, loading: boolean, error: string|null, load: (nodeLabel: string) => void }}
 */
export function useNodeDetail(role, level) {
  const cache = useRef(new Map())
  const abortRef = useRef(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(
    async (nodeLabel) => {
      const key = `${role}_${level}_${nodeLabel}`

      if (cache.current.has(key)) {
        setDetail(cache.current.get(key))
        setError(null)
        return
      }

      // 이전 요청 취소
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)
      try {
        const data = await fetchNodeDetail({ node_label: nodeLabel, role, level }, controller.signal)
        cache.current.set(key, data)
        setDetail(data)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [role, level],
  )

  const resources = detail?.resources ?? { books: [], lectures: [], docs: [] }
  return { detail, resources, loading, error, load }
}

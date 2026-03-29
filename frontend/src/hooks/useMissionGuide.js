import { useState, useCallback, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function fetchMissionGuide({ mission, node_label, role, level }) {
  const res = await fetch(`${API_BASE}/api/node/mission-guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission, node_label, role, level }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

/**
 * @param {string} nodeLabel
 * @param {string} role
 * @param {string} level
 */
export function useMissionGuide(nodeLabel, role, level) {
  const cache = useRef(new Map())
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(
    async (mission) => {
      const key = `${role}_${level}_${nodeLabel}_${mission}`

      if (cache.current.has(key)) {
        setGuide(cache.current.get(key))
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await fetchMissionGuide({ mission, node_label: nodeLabel, role, level })
        cache.current.set(key, data)
        setGuide(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [nodeLabel, role, level],
  )

  function clear() {
    setGuide(null)
    setError(null)
  }

  return { guide, loading, error, load, clear }
}

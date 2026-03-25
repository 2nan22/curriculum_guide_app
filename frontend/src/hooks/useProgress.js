/**
 * @fileoverview 노드 학습 완료 상태 및 진행률 관리 훅
 *
 * - completedNodes: 완료된 노드 ID의 Set
 * - toggleComplete: 완료 토글
 * - getCompletionRate: 전체 완료율(%)
 * - getBranchRate: 브랜치별 완료율(%)
 */

import { useState, useCallback } from 'react'
import { save, load } from '../services/storageService.js'

/**
 * @param {string} role
 * @param {string} level
 */
export function useProgress(role, level) {
  const [completedNodes, setCompletedNodes] = useState(() => {
    if (!role || !level) return new Set()
    return load(role, level)
  })

  const toggleComplete = useCallback(
    (nodeId) => {
      setCompletedNodes((prev) => {
        const next = new Set(prev)
        if (next.has(nodeId)) {
          next.delete(nodeId)
        } else {
          next.add(nodeId)
        }
        save(role, level, next)
        return next
      })
    },
    [role, level],
  )

  /**
   * 전체 완료율(%) 계산
   *
   * @param {object[]} nodes - 레이아웃 노드 배열 (treeLevel 포함)
   * @returns {number} 0-100
   */
  const getCompletionRate = useCallback(
    (nodes) => {
      // root 노드(treeLevel 0) 제외한 leaf/branch만 카운트
      const learnable = nodes.filter((n) => n.treeLevel > 0)
      if (learnable.length === 0) return 0
      const done = learnable.filter((n) => completedNodes.has(n.id)).length
      return Math.round((done / learnable.length) * 100)
    },
    [completedNodes],
  )

  /**
   * 브랜치별 완료율(%) 계산
   *
   * @param {{ id: string, children?: object[] }} branch - 브랜치 노드 (children = leaf 배열)
   * @returns {number} 0-100
   */
  const getBranchRate = useCallback(
    (branch) => {
      const leaves = branch.children ?? []
      if (leaves.length === 0) return completedNodes.has(branch.id) ? 100 : 0
      const done = leaves.filter((l) => completedNodes.has(l.id)).length
      return Math.round((done / leaves.length) * 100)
    },
    [completedNodes],
  )

  return { completedNodes, toggleComplete, getCompletionRate, getBranchRate }
}

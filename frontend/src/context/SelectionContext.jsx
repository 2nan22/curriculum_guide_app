/**
 * @fileoverview 직무/레벨 선택 전역 상태 관리
 *
 * useReducer 패턴으로 선택 흐름을 단방향 데이터 흐름으로 관리합니다.
 * React 19의 use() 훅과 호환되는 Context 구조입니다.
 *
 * @example
 * const { state, dispatch } = useSelection()
 * dispatch({ type: 'SET_ROLE', payload: 'Backend' })
 */

import { createContext, useContext, useReducer } from 'react'

// ── 초기 상태 ────────────────────────────────────────

/** @typedef {{ role: string|null, level: string|null }} SelectionState */

/** @type {SelectionState} */
const INITIAL_STATE = {
  role: null,
  level: null,
}

// ── 리듀서 ────────────────────────────────────────────

/**
 * @param {SelectionState} state
 * @param {{ type: 'SET_ROLE'|'SET_LEVEL'|'RESET', payload?: string }} action
 * @returns {SelectionState}
 */
function selectionReducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      // 역할 변경 시 레벨 초기화 (일관성 보장)
      return { role: action.payload, level: null }
    case 'SET_LEVEL':
      return { ...state, level: action.payload }
    case 'RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────

const SelectionContext = createContext(null)

/**
 * 선택 상태를 하위 컴포넌트에 제공하는 Provider
 *
 * @param {{ children: React.ReactNode }} props
 */
export function SelectionProvider({ children }) {
  const [state, dispatch] = useReducer(selectionReducer, INITIAL_STATE)
  return (
    <SelectionContext value={{ state, dispatch }}>
      {children}
    </SelectionContext>
  )
}

/**
 * 선택 상태 및 dispatch 훅
 *
 * @returns {{ state: SelectionState, dispatch: React.Dispatch }}
 * @throws {Error} SelectionProvider 외부에서 사용 시
 */
export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) {
    throw new Error('useSelection은 SelectionProvider 내부에서만 사용할 수 있습니다.')
  }
  return ctx
}

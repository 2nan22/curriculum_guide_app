/**
 * @fileoverview localStorage 기반 학습 진척도 저장 서비스
 *
 * 키 형식: `aipath_{role}_{level}`
 * 값 형식: JSON 직렬화된 완료 노드 ID 배열
 */

const KEY_PREFIX = 'aipath'
const ROADMAP_KEY_PREFIX = 'aipath_roadmap'

function makeKey(role, level) {
  return `${KEY_PREFIX}_${role}_${level}`
}

function makeRoadmapKey(role, level) {
  return `${ROADMAP_KEY_PREFIX}_${role}_${level}`
}

/**
 * 완료된 노드 ID Set을 저장합니다.
 *
 * @param {string} role
 * @param {string} level
 * @param {Set<string>} completedNodes
 */
export function save(role, level, completedNodes) {
  try {
    const key = makeKey(role, level)
    const arr = Array.from(completedNodes)
    localStorage.setItem(key, JSON.stringify(arr))
  } catch {
    // localStorage 접근 불가 시 무시
  }
}

/**
 * 저장된 완료 노드 ID Set을 불러옵니다.
 *
 * @param {string} role
 * @param {string} level
 * @returns {Set<string>}
 */
export function load(role, level) {
  try {
    const key = makeKey(role, level)
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

/**
 * 저장된 진척도를 초기화합니다.
 *
 * @param {string} role
 * @param {string} level
 */
export function clear(role, level) {
  try {
    localStorage.removeItem(makeKey(role, level))
  } catch {
    // 무시
  }
}

/**
 * 로드맵 데이터를 localStorage에 저장합니다.
 *
 * @param {string} role
 * @param {string} level
 * @param {object} roadmapData
 */
export function saveRoadmap(role, level, roadmapData) {
  try {
    localStorage.setItem(makeRoadmapKey(role, level), JSON.stringify(roadmapData))
  } catch {
    // localStorage 접근 불가 시 무시
  }
}

/**
 * 저장된 로드맵 데이터를 불러옵니다.
 *
 * @param {string} role
 * @param {string} level
 * @returns {object|null}
 */
export function loadRoadmap(role, level) {
  try {
    const raw = localStorage.getItem(makeRoadmapKey(role, level))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * 저장된 로드맵 데이터를 삭제합니다.
 *
 * @param {string} role
 * @param {string} level
 */
export function clearRoadmap(role, level) {
  try {
    localStorage.removeItem(makeRoadmapKey(role, level))
  } catch {
    // 무시
  }
}

/**
 * 저장된 로드맵 데이터 존재 여부를 반환합니다.
 *
 * @param {string} role
 * @param {string} level
 * @returns {boolean}
 */
export function hasRoadmap(role, level) {
  try {
    return localStorage.getItem(makeRoadmapKey(role, level)) !== null
  } catch {
    return false
  }
}

/**
 * @fileoverview 키워드 기반 서적/강의 추천 엔진
 *
 * recommendations.json에서 데이터를 로드한 뒤
 * 노드 레이블로 퍼지 매칭(부분 문자열)하여 추천 항목을 반환합니다.
 */

let _data = null

async function loadData() {
  if (_data) return _data
  const res = await fetch('/data/recommendations.json')
  if (!res.ok) throw new Error('추천 데이터 로드 실패')
  _data = await res.json()
  return _data
}

/**
 * 노드 레이블에 매칭되는 서적/강의 추천 목록 반환.
 * 부분 문자열(대소문자 무시)로 퍼지 매칭하며 레벨 필터를 적용합니다.
 *
 * @param {string} nodeLabel  - 노드 레이블 (예: "Spring Boot", "JPA 기초")
 * @param {string} level      - 현재 레벨 (예: "Junior", "Mid", "Senior")
 * @returns {Promise<{ books: object[], lectures: object[], matchedKeyword: string|null }>}
 */
export async function getRecommendations(nodeLabel, level) {
  const data = await loadData()
  const keywords = data.keywords ?? {}
  const labelLower = nodeLabel.toLowerCase()

  // 1) 키워드가 노드 레이블에 포함되거나 노드 레이블이 키워드를 포함하는 경우
  let matchedKeyword = null
  let matchedEntry = null

  for (const [kw, entry] of Object.entries(keywords)) {
    if (
      labelLower.includes(kw.toLowerCase()) ||
      kw.toLowerCase().includes(labelLower)
    ) {
      matchedKeyword = kw
      matchedEntry = entry
      break
    }
  }

  if (!matchedEntry) {
    return { books: [], lectures: [], matchedKeyword: null }
  }

  // 2) 레벨 필터 (level 배열이 없으면 모든 레벨에 노출)
  const filterByLevel = (items) =>
    items.filter((item) => !item.level || item.level.includes(level))

  return {
    books: filterByLevel(matchedEntry.books ?? []),
    lectures: filterByLevel(matchedEntry.lectures ?? []),
    matchedKeyword,
  }
}

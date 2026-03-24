/**
 * @fileoverview 마인드맵 ↔ 리스트뷰 전환 토글
 *
 * sample.jsx의 세그먼트 컨트롤 패턴:
 * `bg-slate-100` 컨테이너 안에 활성 탭만 `bg-white shadow-sm` 적용
 */

import { GitBranch, List } from 'lucide-react'

/** @typedef {'mindmap'|'list'} ViewMode */

/**
 * @param {object} props
 * @param {ViewMode} props.mode          - 현재 뷰 모드
 * @param {(mode: ViewMode) => void} props.onChange
 */
export default function ViewToggle({ mode, onChange }) {
  const tabs = [
    { value: 'mindmap', label: 'Mind Map', icon: GitBranch },
    { value: 'list',    label: 'List View', icon: List },
  ]

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
      {tabs.map(({ value, label, icon: Icon }) => {
        const active = mode === value
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={[
              'flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl transition-all',
              active
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            <Icon size={13} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

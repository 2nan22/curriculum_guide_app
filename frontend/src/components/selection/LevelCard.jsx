/**
 * @fileoverview 숙련도(Level) 선택 카드 컴포넌트
 *
 * Junior / Mid / Senior 3단계를 큰 카드로 표시합니다.
 */

import Card from '../common/Card.jsx'

/**
 * @typedef {object} LevelConfig
 * @property {string} id
 * @property {string} title
 * @property {React.ComponentType} icon
 * @property {string} yearRange    - 경력 연차 범위
 * @property {string} desc
 * @property {string[]} traits     - 해당 레벨의 특징 키워드
 */

/**
 * @param {object} props
 * @param {LevelConfig} props.level
 * @param {boolean} props.selected
 * @param {() => void} props.onSelect
 */
export default function LevelCard({ level, selected, onSelect }) {
  const Icon = level.icon

  return (
    <Card selected={selected} onClick={onSelect} className="p-10 flex flex-col items-center text-center group">
      {/* 아이콘 원형 배경 */}
      <div
        className={[
          'w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-200',
          selected
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
        ].join(' ')}
      >
        <Icon size={40} />
      </div>

      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
        {level.yearRange}
      </span>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
        {level.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-4">{level.desc}</p>

      {/* 특징 태그 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {level.traits.map((trait) => (
          <span
            key={trait}
            className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-full"
          >
            {trait}
          </span>
        ))}
      </div>
    </Card>
  )
}

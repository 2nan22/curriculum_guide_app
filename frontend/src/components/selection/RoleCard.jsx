/**
 * @fileoverview 직무(Role) 선택 카드 컴포넌트
 *
 * sample.jsx의 카드 디자인 패턴을 따릅니다:
 * 아이콘 영역이 hover 시 bg-blue-600으로 전환, 테두리 강조.
 */

import Card from '../common/Card.jsx'

/**
 * @typedef {object} RoleConfig
 * @property {string} id
 * @property {string} title
 * @property {React.ComponentType} icon  - lucide-react 아이콘
 * @property {string} desc
 * @property {string} badge              - 기술 스택 키워드
 */

/**
 * @param {object} props
 * @param {RoleConfig} props.role
 * @param {boolean} props.selected
 * @param {() => void} props.onSelect
 */
export default function RoleCard({ role, selected, onSelect }) {
  const Icon = role.icon

  return (
    <Card selected={selected} onClick={onSelect} className="p-8 group">
      <div className="flex items-start gap-5">
        {/* 아이콘 영역: 선택 또는 hover 시 파란색으로 전환 */}
        <div
          className={[
            'p-4 rounded-2xl transition-all duration-200 shrink-0',
            selected
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white',
          ].join(' ')}
        >
          <Icon size={32} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {role.title}
            </h3>
            {selected && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                선택됨
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">{role.desc}</p>
          <p className="mt-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            {role.badge}
          </p>
        </div>
      </div>
    </Card>
  )
}

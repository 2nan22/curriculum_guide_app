import { useState } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { useMissionGuide } from '../../hooks/useMissionGuide.js'

export default function MissionList({ missions, nodeLabel, role, level, onAskTutor }) {
  const [checked, setChecked] = useState({})
  const [openMission, setOpenMission] = useState(null)
  const { guide, loading: guideLoading, load: loadGuide } = useMissionGuide(nodeLabel, role, level)

  function toggle(i) {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }))
  }

  function handleMissionClick(mission) {
    if (openMission === mission) {
      setOpenMission(null)
    } else {
      setOpenMission(mission)
      loadGuide(mission)
    }
  }

  return (
    <div className="space-y-3">
      {missions.map((mission, i) => (
        <div key={i}>
          <button
            onClick={() => handleMissionClick(mission)}
            className={[
              'w-full flex items-start gap-4 p-5 rounded-3xl border text-left transition-all',
              checked[i]
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5',
            ].join(' ')}
          >
            {checked[i] ? (
              <CheckCircle size={20} className="shrink-0 mt-0.5 text-green-500" />
            ) : (
              <Circle size={20} className="shrink-0 mt-0.5 text-slate-300" />
            )}
            <span className={`text-sm font-semibold leading-relaxed ${checked[i] ? 'line-through opacity-60' : ''}`}>
              {mission}
            </span>
          </button>

          {openMission === mission && (
            <div className="mt-2 ml-2 p-5 bg-slate-50 border border-slate-200 rounded-3xl">
              {guideLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : guide ? (
                <>
                  <ol className="space-y-4">
                    {guide.steps.map((step, j) => (
                      <li key={j} className="flex gap-4">
                        <span className="shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center mt-0.5">
                          {j + 1}
                        </span>
                        <div>
                          <p className="text-sm font-black text-slate-900 mb-1">{step.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {onAskTutor && (
                    <button
                      onClick={() => onAskTutor(`${nodeLabel} - ${openMission} 미션을 수행하는 방법을 자세히 알려주세요.`)}
                      className="mt-4 w-full py-2.5 text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl transition-colors"
                    >
                      AI 튜터에게 자세히 물어보기
                    </button>
                  )}
                  <button
                    onClick={() => toggle(i)}
                    className={[
                      'mt-4 w-full py-2.5 text-xs font-black rounded-2xl border transition-colors',
                      checked[i]
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {checked[i] ? '✓ 완료됨 (취소하기)' : '완료로 표시'}
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

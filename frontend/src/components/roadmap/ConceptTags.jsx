import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function ConceptTags({ concepts }) {
  const [openTerm, setOpenTerm] = useState(null)

  return (
    <div className="grid grid-cols-2 gap-3">
      {concepts.map((concept, i) => {
        const isOpen = openTerm === concept.term
        return (
          <button
            key={i}
            type="button"
            onClick={() => setOpenTerm(isOpen ? null : concept.term)}
            className={[
              'text-left p-4 rounded-2xl border transition-all duration-200',
              isOpen
                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20 col-span-2'
                : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-black tracking-tight ${isOpen ? 'text-white' : 'text-slate-800'}`}>
                {concept.term}
              </span>
              <ChevronDown
                size={14}
                className={[
                  'shrink-0 transition-transform duration-200',
                  isOpen ? 'rotate-180 text-blue-200' : 'text-slate-300',
                ].join(' ')}
              />
            </div>
            {isOpen && (
              <p className="mt-3 text-xs text-blue-100 leading-relaxed font-medium">
                {concept.description}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}

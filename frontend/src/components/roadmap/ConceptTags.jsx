import { useState } from 'react'

export default function ConceptTags({ concepts }) {
  const [openTerm, setOpenTerm] = useState(null)

  return (
    <div className="flex flex-wrap gap-2">
      {concepts.map((concept, i) => {
        const isOpen = openTerm === concept.term
        return (
          <div key={i} className="flex flex-col">
            <button
              onClick={() => setOpenTerm(isOpen ? null : concept.term)}
              className={[
                'px-4 py-2 text-sm font-bold rounded-full border transition-all',
                isOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
              ].join(' ')}
            >
              {concept.term}
            </button>
            {isOpen && (
              <div className="mt-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700 leading-relaxed max-w-full max-h-36 overflow-y-auto">
                {concept.description}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

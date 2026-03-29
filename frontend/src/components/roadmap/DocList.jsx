import { ExternalLink } from 'lucide-react'

export default function DocList({ docs }) {
  if (docs.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-10">공식 문서 정보가 없습니다.</p>
  }
  return (
    <div className="space-y-3">
      {docs.map((doc, i) => (
        <a
          key={i}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-black text-slate-900 text-sm">{doc.title}</p>
            <ExternalLink size={14} className="shrink-0 text-slate-300" />
          </div>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{doc.description}</p>
        </a>
      ))}
    </div>
  )
}

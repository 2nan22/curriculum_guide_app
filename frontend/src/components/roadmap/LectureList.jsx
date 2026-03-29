function inflearnSearchUrl(title) {
  return `https://www.inflearn.com/courses?s=${encodeURIComponent(title)}`
}

function lectureSearchUrl(lec) {
  if (lec.platform === '인프런') return inflearnSearchUrl(lec.title)
  return `https://www.udemy.com/courses/search/?q=${encodeURIComponent(lec.title)}`
}

export default function LectureList({ llmLectures, staticLectures }) {
  const isLlm = llmLectures.length > 0
  const lectures = isLlm ? llmLectures : staticLectures

  if (lectures.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-10">매칭된 강의 추천이 없습니다.</p>
  }
  return (
    <div className="space-y-3">
      {lectures.map((lec, i) => (
        <a
          key={i}
          href={lectureSearchUrl(lec)}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-black text-slate-900 text-sm">{lec.title}</p>
            {lec.free && (
              <span className="shrink-0 text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                FREE
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            {lec.platform}
            {lec.instructor && ` · ${lec.instructor}`}
          </p>
          {lec.description && (
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{lec.description}</p>
          )}
        </a>
      ))}
    </div>
  )
}

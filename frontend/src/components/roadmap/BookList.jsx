function yes24SearchUrl(title) {
  return `https://www.yes24.com/Product/Search?query=${encodeURIComponent(title)}`
}

export default function BookList({ llmBooks, staticBooks }) {
  const isLlm = llmBooks.length > 0
  const books = isLlm ? llmBooks : staticBooks

  if (books.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-10">매칭된 서적 추천이 없습니다.</p>
  }
  return (
    <div className="space-y-3">
      {books.map((book, i) => (
        <a
          key={i}
          href={yes24SearchUrl(book.title)}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-md transition-all"
        >
          <p className="font-black text-slate-900 text-sm">{book.title}</p>
          <p className="text-slate-400 text-xs mt-1">{book.author}</p>
          {book.description && (
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{book.description}</p>
          )}
          {book.level && (
            <div className="flex gap-1 mt-2">
              {book.level.map((lv) => (
                <span key={lv} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                  {lv}
                </span>
              ))}
            </div>
          )}
        </a>
      ))}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { getQuotesForRole } from '../data/loadingQuotes'

function useLoadingQuotes(role, intervalMs = 4000) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentIndex(0)
  }, [role])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const quotes = getQuotesForRole(role)
        return (prev + 1) % quotes.length
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [role, intervalMs])

  const quotes = getQuotesForRole(role)
  return { currentQuote: quotes[currentIndex] }
}

export default useLoadingQuotes

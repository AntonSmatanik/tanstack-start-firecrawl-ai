import { useEffect, useState } from 'react'

export function useDebouncedSearch(
  initialValue: string,
  onSearch: (value: string) => void,
  delay = 500,
) {
  const [searchInput, setSearchInput] = useState(initialValue)

  useEffect(() => {
    if (searchInput !== initialValue) {
      const timeoutId = setTimeout(() => {
        onSearch(searchInput)
      }, delay)

      return () => clearTimeout(timeoutId)
    }
  }, [searchInput, initialValue, onSearch, delay])

  return { searchInput, setSearchInput }
}

'use client'

import { useEffect, useState } from 'react'

export default function LoadingDots({ label }: { label?: string }) {
  const [dots, setDots] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d % 3) + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span>
      {label}
      {'.'.repeat(dots)}
      {'\u00A0'.repeat(3 - dots)}
    </span>
  )
}

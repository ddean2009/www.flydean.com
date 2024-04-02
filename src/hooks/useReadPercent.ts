import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

export const useReadPercent = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const postRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ container: postRef })

  useLayoutEffect(() => {
    postRef.current = document.getElementById('__blog-post-container')
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', latest => {
    setScrollProgress(latest)
  })

  const readPercent = useMemo(() => {
    return Math.round(scrollProgress * 100)
  }, [scrollProgress])

  return {
    readPercent,
  }
}

import React, { useState, useEffect } from 'react'

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    // 清理函数，在组件卸载时移除事件监听
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // 空数组作为第二个参数，只在组件挂载和卸载时执行一次

  return windowSize
}

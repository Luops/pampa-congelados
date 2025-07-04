"use client"

import { useEffect, useRef, useState } from "react"

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeOptions {
  threshold?: number
  preventDefaultTouchmoveEvent?: boolean
  trackMouse?: boolean
}

export function useSwipe(handlers: SwipeHandlers, options: SwipeOptions = {}) {
  const { threshold = 50, preventDefaultTouchmoveEvent = false, trackMouse = false } = options

  const elementRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const minSwipeDistance = threshold

  const onTouchStart = (e: TouchEvent | MouseEvent) => {
    setTouchEnd(null)
    setIsDragging(true)

    if ("touches" in e) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      })
    } else if (trackMouse) {
      setTouchStart({
        x: e.clientX,
        y: e.clientY,
      })
    }
  }

  const onTouchMove = (e: TouchEvent | MouseEvent) => {
    if (!touchStart || !isDragging) return

    let currentX: number
    let currentY: number

    if ("touches" in e) {
      currentX = e.touches[0].clientX
      currentY = e.touches[0].clientY
    } else if (trackMouse) {
      currentX = e.clientX
      currentY = e.clientY
    } else {
      return
    }

    const deltaX = currentX - touchStart.x
    const deltaY = currentY - touchStart.y

    // Atualizar offset para animação visual
    setDragOffset(deltaX)

    setTouchEnd({ x: currentX, y: currentY })

    if (preventDefaultTouchmoveEvent) {
      e.preventDefault()
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) {
      setIsDragging(false)
      setDragOffset(0)
      return
    }

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance
    const isUpSwipe = distanceY > minSwipeDistance
    const isDownSwipe = distanceY < -minSwipeDistance

    // Executar handlers baseado na direção do swipe
    if (isLeftSwipe && handlers.onSwipeLeft) {
      handlers.onSwipeLeft()
    } else if (isRightSwipe && handlers.onSwipeRight) {
      handlers.onSwipeRight()
    } else if (isUpSwipe && handlers.onSwipeUp) {
      handlers.onSwipeUp()
    } else if (isDownSwipe && handlers.onSwipeDown) {
      handlers.onSwipeDown()
    }

    setIsDragging(false)
    setDragOffset(0)
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Touch events
    element.addEventListener("touchstart", onTouchStart, { passive: false })
    element.addEventListener("touchmove", onTouchMove, { passive: false })
    element.addEventListener("touchend", onTouchEnd)

    // Mouse events (se habilitado)
    if (trackMouse) {
      element.addEventListener("mousedown", onTouchStart)
      element.addEventListener("mousemove", onTouchMove)
      element.addEventListener("mouseup", onTouchEnd)
      element.addEventListener("mouseleave", onTouchEnd)
    }

    return () => {
      element.removeEventListener("touchstart", onTouchStart)
      element.removeEventListener("touchmove", onTouchMove)
      element.removeEventListener("touchend", onTouchEnd)

      if (trackMouse) {
        element.removeEventListener("mousedown", onTouchStart)
        element.removeEventListener("mousemove", onTouchMove)
        element.removeEventListener("mouseup", onTouchEnd)
        element.removeEventListener("mouseleave", onTouchEnd)
      }
    }
  }, [touchStart, touchEnd, isDragging, handlers, trackMouse])

  return {
    ref: elementRef,
    isDragging,
    dragOffset,
  }
}

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Point } from '../domain/geometry'

export interface DragUpdate {
  readonly delta: Point
  readonly client: Point
}

export interface PointerDragHandlers {
  onStart?: (origin: Point) => void
  onMove: (update: DragUpdate) => void
  onEnd: (update: DragUpdate) => void
  onCancel?: () => void
}

export function usePointerDrag(handlers: PointerDragHandlers) {
  const handlersRef = useRef(handlers)
  useLayoutEffect(() => {
    handlersRef.current = handlers
  })

  const stopActiveDrag = useRef<(() => void) | null>(null)
  useEffect(() => () => stopActiveDrag.current?.(), [])

  return useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !event.isPrimary) return
    event.preventDefault()

    const target = event.currentTarget
    const { pointerId } = event
    const origin: Point = { x: event.clientX, y: event.clientY }
    const toUpdate = (e: PointerEvent): DragUpdate => ({
      delta: { x: e.clientX - origin.x, y: e.clientY - origin.y },
      client: { x: e.clientX, y: e.clientY },
    })

    let frame = 0
    let latest: DragUpdate | null = null

    const handleMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      latest = toUpdate(e)
      frame ||= requestAnimationFrame(() => {
        frame = 0
        if (latest) handlersRef.current.onMove(latest)
      })
    }
    const handleUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      stop()
      handlersRef.current.onEnd(toUpdate(e))
    }
    const handleCancel = () => {
      stop()
      handlersRef.current.onCancel?.()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel()
    }

    function stop() {
      cancelAnimationFrame(frame)
      target.removeEventListener('pointermove', handleMove)
      target.removeEventListener('pointerup', handleUp)
      target.removeEventListener('pointercancel', handleCancel)
      target.removeEventListener('lostpointercapture', handleCancel)
      window.removeEventListener('keydown', handleKeyDown)
      if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
      stopActiveDrag.current = null
    }

    target.setPointerCapture(pointerId)
    target.addEventListener('pointermove', handleMove)
    target.addEventListener('pointerup', handleUp)
    target.addEventListener('pointercancel', handleCancel)
    target.addEventListener('lostpointercapture', handleCancel)
    window.addEventListener('keydown', handleKeyDown)
    stopActiveDrag.current = stop

    handlersRef.current.onStart?.(origin)
  }, [])
}

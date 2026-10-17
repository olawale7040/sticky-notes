import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Point } from '../domain/types'

export interface DragUpdate {
  readonly delta: Point
  readonly client: Point
}

export interface PointerDragHandlers {
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
    stopActiveDrag.current = startDrag(event, () => handlersRef.current)
  }, [])
}

function startDrag(
  event: ReactPointerEvent<HTMLElement>,
  getHandlers: () => PointerDragHandlers,
): () => void {
  const target: HTMLElement = event.currentTarget
  const { pointerId } = event
  const origin: Point = { x: event.clientX, y: event.clientY }
  const listeners = new AbortController()
  const options = { signal: listeners.signal }
  let frame = 0

  const toUpdate = (e: PointerEvent): DragUpdate => ({
    delta: { x: e.clientX - origin.x, y: e.clientY - origin.y },
    client: { x: e.clientX, y: e.clientY },
  })

  const stop = () => {
    cancelAnimationFrame(frame)
    listeners.abort()
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
  }

  const cancel = () => {
    stop()
    getHandlers().onCancel?.()
  }

  target.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerId !== pointerId) return
      const update = toUpdate(e)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => getHandlers().onMove(update))
    },
    options,
  )
  target.addEventListener(
    'pointerup',
    (e) => {
      if (e.pointerId !== pointerId) return
      stop()
      getHandlers().onEnd(toUpdate(e))
    },
    options,
  )
  target.addEventListener('pointercancel', cancel, options)
  target.addEventListener('lostpointercapture', cancel, options)
  window.addEventListener('keydown', (e) => e.key === 'Escape' && cancel(), options)
  target.setPointerCapture(pointerId)

  return stop
}

import { fireEvent, render, screen } from '@testing-library/react'
import { usePointerDrag, type PointerDragHandlers } from './usePointerDrag'

function Handle(handlers: PointerDragHandlers) {
  const onPointerDown = usePointerDrag(handlers)
  return <div data-testid="handle" onPointerDown={onPointerDown} />
}

function setup() {
  const handlers = { onMove: vi.fn(), onEnd: vi.fn(), onCancel: vi.fn() }
  render(<Handle {...handlers} />)
  return { handle: screen.getByTestId('handle'), ...handlers }
}

const pointer = { pointerId: 1, isPrimary: true, button: 0 }

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('usePointerDrag', () => {
  it('reports movement relative to where the drag started', () => {
    const { handle, onMove, onEnd } = setup()

    fireEvent.pointerDown(handle, { ...pointer, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(handle, { ...pointer, clientX: 130, clientY: 90 })
    vi.advanceTimersToNextFrame()
    fireEvent.pointerUp(handle, { ...pointer, clientX: 150, clientY: 80 })

    expect(onMove).toHaveBeenCalledWith({ delta: { x: 30, y: -10 }, client: { x: 130, y: 90 } })
    expect(onEnd).toHaveBeenCalledWith({ delta: { x: 50, y: -20 }, client: { x: 150, y: 80 } })
  })

  it('cancels on Escape and ignores the rest of the gesture', () => {
    const { handle, onMove, onEnd, onCancel } = setup()

    fireEvent.pointerDown(handle, { ...pointer, clientX: 0, clientY: 0 })
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.pointerMove(handle, { ...pointer, clientX: 50, clientY: 50 })
    fireEvent.pointerUp(handle, { ...pointer, clientX: 50, clientY: 50 })
    vi.advanceTimersToNextFrame()

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onMove).not.toHaveBeenCalled()
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('does not start a drag with a non-primary button', () => {
    const { handle, onEnd } = setup()

    fireEvent.pointerDown(handle, { ...pointer, button: 2 })
    fireEvent.pointerUp(handle, pointer)

    expect(onEnd).not.toHaveBeenCalled()
  })
})

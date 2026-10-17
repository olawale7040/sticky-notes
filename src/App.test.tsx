import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

const SYNC_TIMEOUT = { timeout: 3000 }

async function renderApp() {
  const result = render(<App />)
  const board = await screen.findByRole('main', { name: 'Notes board' }, SYNC_TIMEOUT)
  return { ...result, board }
}

async function reload(unmount: () => void) {
  unmount()
  return renderApp()
}

beforeEach(() => localStorage.clear())

describe('Sticky notes app', () => {
  it('shows a loading state, then an empty board', async () => {
    render(<App />)
    expect(screen.getByText('Loading notes…')).toBeInTheDocument()
    expect(
      await screen.findByRole('main', { name: 'Notes board' }, SYNC_TIMEOUT),
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })

  it('creates a note on double-click and keeps its text after reload', async () => {
    const user = userEvent.setup()
    const { board, unmount } = await renderApp()

    await user.dblClick(board)
    await user.type(screen.getByRole('textbox', { name: 'Note text' }), 'Buy milk')
    await screen.findByText('All changes saved', {}, SYNC_TIMEOUT)

    await reload(unmount)
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Buy milk')
  })

  it('changes a note color and keeps it after reload', async () => {
    const user = userEvent.setup()
    const { board, unmount } = await renderApp()

    await user.dblClick(board)
    const note = screen.getByRole('article')
    await user.click(within(note).getByRole('button', { name: 'green' }))
    expect(within(note).getByRole('button', { name: 'green' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await screen.findByText('All changes saved', {}, SYNC_TIMEOUT)

    await reload(unmount)
    expect(
      within(screen.getByRole('article')).getByRole('button', { name: 'green' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('brings a clicked note in front of the others', async () => {
    const user = userEvent.setup()
    const { board } = await renderApp()

    await user.dblClick(board)
    await user.dblClick(board)
    const [first, second] = screen.getAllByRole('article')
    const zIndex = (el: HTMLElement | undefined) => Number(el?.style.zIndex)
    expect(zIndex(second)).toBeGreaterThan(zIndex(first))

    await user.click(within(first!).getByRole('textbox', { name: 'Note text' }))
    expect(zIndex(first)).toBeGreaterThan(zIndex(second))
  })
})

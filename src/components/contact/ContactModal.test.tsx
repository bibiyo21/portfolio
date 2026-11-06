import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../ui/Button'
import { useContactModal } from '../../hooks/useContactModal'
import { renderWithApp } from '../../test/render'

function Opener() {
  const { openModal } = useContactModal()
  return <Button onClick={openModal}>Open contact</Button>
}

async function openAndFill(user: ReturnType<typeof userEvent.setup>, overrides: Record<string, string> = {}) {
  renderWithApp(<Opener />)
  await user.click(screen.getByRole('button', { name: 'Open contact' }))
  const dialog = await screen.findByRole('dialog', { name: "Let's Start a Conversation" })
  const values = { 'Full Name': 'Ada Lovelace', 'Email Address': 'ada@example.com', Subject: 'Hello there', Message: 'A message long enough to send.', ...overrides }
  for (const [label, value] of Object.entries(values)) {
    if (value) await user.type(within(dialog).getByLabelText(label), value)
  }
  return dialog
}

const execute = vi.fn()

describe('ContactModal', () => {
  beforeEach(() => {
    execute.mockReset().mockResolvedValue('tok-1')
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'test-site-key')
    // The Google script is never loaded in tests: a stub stands in for window.grecaptcha.
    window.grecaptcha = { ready: (cb: () => void) => cb(), execute }
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    delete window.grecaptcha
  })

  it('shows required-field errors and does not call the API on an empty submit', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderWithApp(<Opener />)
    await user.click(screen.getByRole('button', { name: 'Open contact' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    expect(within(dialog).getByText('Please enter your full name.')).toBeInTheDocument()
    expect(within(dialog).getByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(within(dialog).getByText('Please add a subject.')).toBeInTheDocument()
    expect(within(dialog).getByText('Please write at least 10 characters.')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Full Name')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects an invalid email', async () => {
    const user = userEvent.setup()
    const dialog = await openAndFill(user, { 'Email Address': 'nope' })
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    expect(within(dialog).getByText('Please enter a valid email address.')).toBeInTheDocument()
  })

  it('posts the form and shows success only after the API confirms', async () => {
    let resolve!: (r: Response) => void
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((r) => (resolve = r)))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const dialog = await openAndFill(user)
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    const sending = await within(dialog).findByRole('button', { name: /sending/i })
    expect(sending).toBeDisabled()
    expect(screen.queryByText('Inquiry sent.')).not.toBeInTheDocument()
    resolve(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    expect(await screen.findByText('Inquiry sent.')).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/contact')
    expect(JSON.parse(init.body as string)).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com', website: '', recaptchaToken: 'tok-1' })
    expect(execute).toHaveBeenCalledWith('test-site-key', { action: 'contact_submit' })
  })

  it('shows the server error and never claims success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Delivery failed.' }), { status: 502 })))
    const user = userEvent.setup()
    const dialog = await openAndFill(user)
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Delivery failed.')
    expect(screen.queryByText('Inquiry sent.')).not.toBeInTheDocument()
  })

  it('offers a mailto fallback and states the message was not sent when unconfigured', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'not_configured' }), { status: 503 })))
    const user = userEvent.setup()
    const dialog = await openAndFill(user)
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    const alert = await within(dialog).findByRole('alert')
    expect(alert).toHaveTextContent(/not\s+sent/i)
    expect(within(alert).getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^mailto:/))
  })

  it('closes with Escape and with the Close button', async () => {
    const user = userEvent.setup()
    renderWithApp(<Opener />)
    await user.click(screen.getByRole('button', { name: 'Open contact' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Open contact' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps the honeypot out of the tab order and hidden from assistive tech', async () => {
    const user = userEvent.setup()
    renderWithApp(<Opener />)
    await user.click(screen.getByRole('button', { name: 'Open contact' }))
    const dialog = await screen.findByRole('dialog')
    const honeypot = dialog.querySelector<HTMLInputElement>('input[name="website"]')!
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('asks Google for a fresh token on every submission', async () => {
    execute.mockResolvedValueOnce('tok-first').mockResolvedValueOnce('tok-second')
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'captcha_failed' }), { status: 403 }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const dialog = await openAndFill(user)
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    await within(dialog).findByRole('alert')
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const tokens = fetchMock.mock.calls.map((c) => JSON.parse((c[1] as RequestInit).body as string).recaptchaToken)
    expect(tokens).toEqual(['tok-first', 'tok-second'])
  })

  it('does not submit when a token cannot be obtained, and says nothing was sent', async () => {
    execute.mockRejectedValue(new Error('blocked'))
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const dialog = await openAndFill(user)
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    const alert = await within(dialog).findByRole('alert')
    expect(alert).toHaveTextContent(/could not complete the human check/i)
    expect(alert).toHaveTextContent(/not\s+sent/i)
    expect(within(alert).getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^mailto:/))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Inquiry sent.')).not.toBeInTheDocument()
  })

  it('does not submit when no site key is configured, and offers the mailto fallback', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const dialog = await openAndFill(user)
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    const alert = await within(dialog).findByRole('alert')
    expect(alert).toHaveTextContent(/not\s+sent/i)
    expect(within(alert).getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^mailto:/))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    ['captcha_failed', 403, /could not confirm that this request came from a person/i],
    ['captcha_unavailable', 503, /human check is unavailable/i],
  ])('shows a retry message and the mailto fallback for %s', async (code, status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code }), { status })))
    const user = userEvent.setup()
    const dialog = await openAndFill(user)
    await user.click(within(dialog).getByRole('button', { name: 'Submit Inquiry' }))
    const alert = await within(dialog).findByRole('alert')
    expect(alert).toHaveTextContent(message)
    expect(alert).toHaveTextContent(/not\s+sent/i)
    expect(within(alert).getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^mailto:/))
    expect(screen.queryByText('Inquiry sent.')).not.toBeInTheDocument()
  })

  it("shows Google's required notice with working policy links in place of the badge", async () => {
    const user = userEvent.setup()
    renderWithApp(<Opener />)
    await user.click(screen.getByRole('button', { name: 'Open contact' }))
    const notice = await screen.findByTestId('recaptcha-notice')
    expect(notice).toHaveTextContent('This site is protected by reCAPTCHA')
    expect(within(notice).getByRole('link', { name: /Privacy Policy/ })).toHaveAttribute('href', 'https://policies.google.com/privacy')
    expect(within(notice).getByRole('link', { name: /Terms of Service/ })).toHaveAttribute('href', 'https://policies.google.com/terms')
  })

  it('does not load the Google script until the form is opened', async () => {
    delete window.grecaptcha
    const user = userEvent.setup()
    renderWithApp(<Opener />)
    expect(document.querySelector('script[src*="recaptcha"]')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Open contact' }))
    await waitFor(() => expect(document.querySelector('script[src*="recaptcha/api.js?render=test-site-key"]')).not.toBeNull())
    document.querySelectorAll('script[src*="recaptcha"]').forEach((s) => s.remove())
  })
})

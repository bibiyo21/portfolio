import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  subject: z.string().trim().min(3, 'Please add a subject.').max(150),
  message: z.string().trim().min(10, 'Please write at least 10 characters.').max(4000),
  // Honeypot: real visitors never fill this in.
  website: z.string().max(0).optional().default(''),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactFieldErrors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>

export type ContactResult =
  | { status: 'success' }
  | { status: 'fallback'; reason: string }
  | { status: 'error'; message: string }

export async function submitContact(input: ContactInput, recaptchaToken: string): Promise<ContactResult> {
  let res: Response
  try {
    res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, recaptchaToken }),
    })
  } catch {
    return { status: 'fallback', reason: 'The inquiry service could not be reached.' }
  }

  let body: { ok?: boolean; error?: string; code?: string } = {}
  try {
    body = (await res.json()) as typeof body
  } catch {
    // Non-JSON response (for example a dev server that serves index.html for /api/contact).
  }
  // Only report success when the API explicitly confirms delivery.
  if (res.ok && body.ok === true) return { status: 'success' }
  if (res.ok) return { status: 'fallback', reason: 'The inquiry service is not available right now.' }
  // The server could not confirm the visitor is human, or could not reach Google. Nothing was sent.
  if (body.code === 'captcha_failed') {
    return { status: 'fallback', reason: 'We could not confirm that this request came from a person.' }
  }
  if (body.code === 'captcha_unavailable') {
    return { status: 'fallback', reason: 'The human check is unavailable right now. Please try again in a moment.' }
  }
  if (res.status === 404 || res.status === 503 || body.code === 'not_configured') {
    return { status: 'fallback', reason: 'The inquiry service is not available right now.' }
  }
  if (res.status === 429) {
    return { status: 'error', message: 'Too many requests. Please wait a few minutes and try again.' }
  }
  return { status: 'error', message: body.error ?? 'Something went wrong. Please try again.' }
}

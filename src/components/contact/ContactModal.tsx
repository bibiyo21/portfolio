import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { useContactModal } from '../../hooks/useContactModal'
import { profile } from '../../lib/content-loader'
import {
  contactSchema,
  submitContact,
  type ContactFieldErrors,
  type ContactInput,
} from '../../lib/contact'
import { Button } from './Button'
import { Modal } from './Modal'

type Phase =
  | { name: 'idle' }
  | { name: 'sending' }
  | { name: 'success' }
  | { name: 'error'; message: string }
  | { name: 'fallback'; reason: string }

const empty: ContactInput = { name: '', email: '', subject: '', message: '', website: '' }

function Field({
  label,
  error,
  children,
  id,
}: {
  label: string
  error?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => React.ReactNode
  id: string
}) {
  const errId = `${id}-err`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.8125rem] text-ink-soft">
        {label}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errId : undefined })}
      {error ? (
        <p id={errId} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border bg-white px-4 py-3.5 text-base text-charcoal outline-none transition-shadow placeholder:text-ink-mute/70 focus:border-burgundy-hover focus:shadow-[0_0_0_4px_rgba(88,28,53,0.14)] aria-[invalid=true]:border-danger border-line-strong'

export function ContactModal() {
  const { open, setOpen } = useContactModal()
  const [values, setValues] = useState<ContactInput>(empty)
  const [errors, setErrors] = useState<ContactFieldErrors>({})
  const [phase, setPhase] = useState<Phase>({ name: 'idle' })
  const base = useId()

  const set = (key: keyof ContactInput) => (value: string) => setValues((v) => ({ ...v, [key]: value }))

  const reset = () => {
    setValues(empty)
    setErrors({})
    setPhase({ name: 'idle' })
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next && phase.name === 'success') window.setTimeout(reset, 300)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = contactSchema.safeParse(values)
    if (!parsed.success) {
      const next: ContactFieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'name' || key === 'email' || key === 'subject' || key === 'message') {
          next[key] ??= issue.message
        }
      }
      setErrors(next)
      setPhase({ name: 'idle' })
      return
    }
    setErrors({})
    setPhase({ name: 'sending' })
    const result = await submitContact(parsed.data)
    if (result.status === 'success') setPhase({ name: 'success' })
    else if (result.status === 'fallback') setPhase({ name: 'fallback', reason: result.reason })
    else setPhase({ name: 'error', message: result.message })
  }

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(values.subject || 'Portfolio inquiry')}&body=${encodeURIComponent(
    `${values.message}\n\n${values.name}\n${values.email}`.trim(),
  )}`

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={profile.contact.modalTitle}
      description={profile.contact.modalDescription}
    >
      {phase.name === 'success' ? (
        <div role="status" className="rounded-[20px] bg-peach-soft p-6">
          <p className="flex items-center gap-2 text-success">
            <CheckCircle2 className="size-5" aria-hidden />
            <strong className="font-medium">Inquiry sent.</strong>
          </p>
          <p className="mt-2 text-ink-soft">Thank you. I will get back to you as soon as I can.</p>
          <div className="mt-6">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label="Contact inquiry form">
          <Field id={`${base}-name`} label="Full Name" error={errors.name}>
            {(p) => (
              <input
                {...p}
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => set('name')(e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field id={`${base}-email`} label="Email Address" error={errors.email}>
            {(p) => (
              <input
                {...p}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={(e) => set('email')(e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field id={`${base}-subject`} label="Subject" error={errors.subject}>
            {(p) => (
              <input
                {...p}
                name="subject"
                type="text"
                value={values.subject}
                onChange={(e) => set('subject')(e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field id={`${base}-message`} label="Message" error={errors.message}>
            {(p) => (
              <textarea
                {...p}
                name="message"
                rows={5}
                value={values.message}
                onChange={(e) => set('message')(e.target.value)}
                className={`${inputClass} resize-y`}
              />
            )}
          </Field>

          {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(e) => set('website')(e.target.value)}
              />
            </label>
          </div>

          {phase.name === 'error' ? (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger/10 p-4 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {phase.message}
            </p>
          ) : null}
          {phase.name === 'fallback' ? (
            <div role="alert" className="rounded-xl bg-peach-soft p-4 text-sm text-ink-soft">
              <p className="flex items-start gap-2 text-charcoal">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-burgundy" aria-hidden />
                {phase.reason} Your message was <strong className="font-medium">not</strong> sent.
              </p>
              <p className="mt-2">
                You can send it from your email app instead:{' '}
                <a href={mailto} className="font-medium text-burgundy underline underline-offset-4">
                  open email to {profile.email}
                </a>
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" loading={phase.name === 'sending'} arrow>
              {phase.name === 'sending' ? 'Sending…' : 'Submit Inquiry'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

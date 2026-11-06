import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface ContactModalValue {
  open: boolean
  setOpen: (open: boolean) => void
  openModal: () => void
}

const ContactModalContext = createContext<ContactModalValue | null>(null)

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({ open, setOpen, openModal: () => setOpen(true) }), [open])
  return <ContactModalContext.Provider value={value}>{children}</ContactModalContext.Provider>
}

export function useContactModal(): ContactModalValue {
  const ctx = useContext(ContactModalContext)
  if (!ctx) throw new Error('useContactModal must be used inside ContactModalProvider')
  return ctx
}

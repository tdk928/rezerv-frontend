import { useEffect } from 'react'
import { Button } from './Button'

/** Custom confirm dialog — еднакъв във всички браузъри (не native window.confirm). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Премахни',
  cancelLabel = 'Отказ',
  confirming = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="glass-strong w-full max-w-md rounded-3xl p-6 shadow-xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold tracking-tight text-ink">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={confirming}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={confirming}>
            {confirming ? 'Премахване…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

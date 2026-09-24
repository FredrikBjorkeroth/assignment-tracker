import { useState } from 'react'
import { createPortal } from 'react-dom'

interface NotesModalProps {
  initialNotes: string
  onSave: (notes: string) => void
  onClose: () => void
  saving: boolean
}

export function NotesModal({
  initialNotes,
  onSave,
  onClose,
  saving,
}: NotesModalProps) {
  const [notes, setNotes] = useState(initialNotes)

  return createPortal(
    <div className="notes-modal-backdrop" onClick={onClose}>
      <div
        className="notes-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit notes"
        onClick={(e) => e.stopPropagation()}
      >
        <textarea
          className="notes-modal-textarea"
          value={notes}
          disabled={saving}
          autoFocus
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="notes-modal-actions">
          <button type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="notes-modal-save"
            onClick={() => onSave(notes)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

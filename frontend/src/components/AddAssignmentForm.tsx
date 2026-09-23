import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { createAssignment } from '../api/assignments'
import type { Assignment } from '../api/assignments'

interface AddAssignmentFormProps {
  onAdded: (assignment: Assignment) => void
}

export function AddAssignmentForm({ onAdded }: AddAssignmentFormProps) {
  const [link, setLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    const trimmed = link.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)
    try {
      const created = await createAssignment({ link: trimmed })
      onAdded(created)
      setLink('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add assignment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-assignment-form">
      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Paste a link..."
        disabled={submitting}
      />
      <button type="submit" disabled={submitting || !link.trim()}>
        {submitting ? 'Adding...' : 'Add'}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

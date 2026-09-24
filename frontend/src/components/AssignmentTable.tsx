import { useState } from 'react'
import type { Assignment, AssignmentStatus } from '../api/assignments'
import {
  ASSIGNMENT_STATUSES,
  deleteAssignment,
  updateAssignment,
} from '../api/assignments'
import { NotesModal } from './NotesModal'

const PAGE_SIZE = 20
const RATINGS = [1, 2, 3, 4, 5]

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  CONSIDERING: 'Considering',
  APPLIED: 'Applied',
  DROPPED: 'Dropped',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  DECLINED: 'Declined',
}

interface AssignmentTableProps {
  assignments: Assignment[]
  onUpdated: (assignment: Assignment) => void
  onDeleted: (id: number) => void
}

export function AssignmentTable({
  assignments,
  onUpdated,
  onDeleted,
}: AssignmentTableProps) {
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(assignments.length / PAGE_SIZE))
  const clampedPage = Math.min(page, pageCount - 1)
  const pageItems = assignments.slice(
    clampedPage * PAGE_SIZE,
    (clampedPage + 1) * PAGE_SIZE,
  )

  return (
    <div className="assignment-table">
      <table>
        <thead>
          <tr>
            <th>Link</th>
            <th>Technologies</th>
            <th>Skill Match</th>
            <th>Interest</th>
            <th>Status</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 && (
            <tr>
              <td colSpan={7}>No assignments yet.</td>
            </tr>
          )}
          {pageItems.map((assignment) => (
            <AssignmentRow
              key={assignment.id}
              assignment={assignment}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
            />
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          type="button"
          disabled={clampedPage === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span>
          Page {clampedPage + 1} of {pageCount}
        </span>
        <button
          type="button"
          disabled={clampedPage >= pageCount - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

interface AssignmentRowProps {
  assignment: Assignment
  onUpdated: (assignment: Assignment) => void
  onDeleted: (id: number) => void
}

function AssignmentRow({ assignment, onUpdated, onDeleted }: AssignmentRowProps) {
  const [technologiesText, setTechnologiesText] = useState(
    assignment.technologies.join(', '),
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notesOpen, setNotesOpen] = useState(false)

  const busy = saving || deleting

  async function save(changes: {
    technologies?: string[]
    skillMatch?: number | null
    interest?: number | null
    status?: AssignmentStatus
    notes?: string | null
  }) {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateAssignment(assignment.id, {
        link: assignment.link,
        technologies: changes.technologies ?? assignment.technologies,
        skillMatch:
          changes.skillMatch !== undefined
            ? changes.skillMatch
            : assignment.skillMatch,
        interest:
          changes.interest !== undefined
            ? changes.interest
            : assignment.interest,
        status: changes.status ?? assignment.status,
        notes: changes.notes !== undefined ? changes.notes : assignment.notes,
      })
      onUpdated(updated)
      return true
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update assignment.',
      )
      return false
    } finally {
      setSaving(false)
    }
  }

  function handleTechnologiesBlur() {
    const technologies = technologiesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (
      technologies.join(', ') !== assignment.technologies.join(', ')
    ) {
      save({ technologies })
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete this assignment?\n${assignment.link}`,
    )
    if (!confirmed) return

    setDeleting(true)
    setError(null)
    try {
      await deleteAssignment(assignment.id)
      onDeleted(assignment.id)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete assignment.',
      )
      setDeleting(false)
    }
  }

  async function handleSaveNotes(notes: string) {
    const ok = await save({ notes: notes.trim() === '' ? null : notes })
    if (ok) setNotesOpen(false)
  }

  return (
    <>
      <tr>
        <td>
          <a href={assignment.link} target="_blank" rel="noreferrer">
            {assignment.link}
          </a>
        </td>
        <td>
          <input
            type="text"
            className="cell-input"
            value={technologiesText}
            disabled={busy}
            onChange={(e) => setTechnologiesText(e.target.value)}
            onBlur={handleTechnologiesBlur}
          />
        </td>
        <td>
          <RatingSelect
            value={assignment.skillMatch}
            disabled={busy}
            onChange={(skillMatch) => save({ skillMatch })}
          />
        </td>
        <td>
          <RatingSelect
            value={assignment.interest}
            disabled={busy}
            onChange={(interest) => save({ interest })}
          />
        </td>
        <td>
          <select
            className="cell-select"
            value={assignment.status}
            disabled={busy}
            onChange={(e) => save({ status: e.target.value as AssignmentStatus })}
          >
            {ASSIGNMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </td>
        <td>
          <button
            type="button"
            className="notes-button"
            disabled={busy}
            onClick={() => setNotesOpen(true)}
          >
            {assignment.notes ? 'Edit notes' : 'Add notes'}
          </button>
        </td>
        <td>
          <button
            type="button"
            className="delete-button"
            disabled={busy}
            onClick={handleDelete}
            aria-label="Delete assignment"
            title="Delete assignment"
          >
            <TrashIcon />
          </button>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={7} className="form-error">
            {error}
          </td>
        </tr>
      )}
      {notesOpen && (
        <NotesModal
          initialNotes={assignment.notes ?? ''}
          saving={saving}
          onSave={handleSaveNotes}
          onClose={() => setNotesOpen(false)}
        />
      )}
    </>
  )
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h12" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6" />
      <path d="M5.5 6l.5 9.5A1.5 1.5 0 0 0 7.5 17h5a1.5 1.5 0 0 0 1.5-1.5L14.5 6" />
      <path d="M8.5 9v5" />
      <path d="M11.5 9v5" />
    </svg>
  )
}

interface RatingSelectProps {
  value: number | null
  disabled: boolean
  onChange: (value: number | null) => void
}

function RatingSelect({ value, disabled, onChange }: RatingSelectProps) {
  return (
    <select
      className="cell-select"
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) =>
        onChange(e.target.value === '' ? null : Number(e.target.value))
      }
    >
      <option value="">—</option>
      {RATINGS.map((rating) => (
        <option key={rating} value={rating}>
          {rating}
        </option>
      ))}
    </select>
  )
}

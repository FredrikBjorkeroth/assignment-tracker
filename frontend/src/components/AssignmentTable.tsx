import { useState } from 'react'
import type { Assignment } from '../api/assignments'
import { deleteAssignment, updateAssignment } from '../api/assignments'

const PAGE_SIZE = 20
const RATINGS = [1, 2, 3, 4, 5]

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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 && (
            <tr>
              <td colSpan={5}>No assignments yet.</td>
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

  const busy = saving || deleting

  async function save(changes: {
    technologies?: string[]
    skillMatch?: number | null
    interest?: number | null
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
      })
      onUpdated(updated)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update assignment.',
      )
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
          <button
            type="button"
            className="delete-button"
            disabled={busy}
            onClick={handleDelete}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={5} className="form-error">
            {error}
          </td>
        </tr>
      )}
    </>
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

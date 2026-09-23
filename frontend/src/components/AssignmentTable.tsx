import { useState } from 'react'
import type { Assignment } from '../api/assignments'

const PAGE_SIZE = 20

interface AssignmentTableProps {
  assignments: Assignment[]
}

export function AssignmentTable({ assignments }: AssignmentTableProps) {
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
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 && (
            <tr>
              <td colSpan={4}>No assignments yet.</td>
            </tr>
          )}
          {pageItems.map((assignment) => (
            <tr key={assignment.id}>
              <td>
                <a href={assignment.link} target="_blank" rel="noreferrer">
                  {assignment.link}
                </a>
              </td>
              <td>
                {assignment.technologies.length > 0
                  ? assignment.technologies.join(', ')
                  : '—'}
              </td>
              <td>{assignment.skillMatch ?? '—'}</td>
              <td>{assignment.interest ?? '—'}</td>
            </tr>
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

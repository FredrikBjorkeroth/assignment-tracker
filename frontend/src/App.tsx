import { useEffect, useState } from 'react'
import { fetchAssignments } from './api/assignments'
import type { Assignment } from './api/assignments'
import { AddAssignmentForm } from './components/AddAssignmentForm'
import { AssignmentTable } from './components/AssignmentTable'
import './App.css'

function sortByIdDesc(items: Assignment[]) {
  return [...items].sort((a, b) => b.id - a.id)
}

// The backend can take a little while to finish booting (e.g. right after
// `docker compose up`), during which requests fail outright rather than
// coming back as a normal HTTP error. Retry with backoff instead of
// surfacing that as a load failure.
const MAX_LOAD_ATTEMPTS = 10
const RETRY_DELAY_MS = 2000

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadWithRetry() {
      for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt++) {
        try {
          const data = await fetchAssignments()
          if (!cancelled) {
            setAssignments(sortByIdDesc(data))
            setLoadError(null)
          }
          return
        } catch (err) {
          if (attempt === MAX_LOAD_ATTEMPTS) {
            if (!cancelled) {
              setLoadError(
                err instanceof Error
                  ? err.message
                  : 'Failed to load assignments.',
              )
            }
            return
          }
          await delay(RETRY_DELAY_MS)
        }
      }
    }

    loadWithRetry().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  function handleAdded(created: Assignment) {
    setAssignments((prev) => sortByIdDesc([created, ...prev]))
  }

  function handleUpdated(updated: Assignment) {
    setAssignments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    )
  }

  function handleDeleted(id: number) {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="app">
      <h1>Assignments</h1>
      <AddAssignmentForm onAdded={handleAdded} />
      {loading && (
        <div className="loading-indicator" role="status" aria-live="polite">
          <span className="spinner" />
          Loading assignments...
        </div>
      )}
      {loadError && <p className="form-error">{loadError}</p>}
      {!loading && !loadError && (
        <AssignmentTable
          assignments={assignments}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

export default App

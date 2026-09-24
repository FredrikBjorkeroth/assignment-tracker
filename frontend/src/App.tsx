import { useEffect, useState } from 'react'
import { fetchAssignments } from './api/assignments'
import type { Assignment } from './api/assignments'
import { AddAssignmentForm } from './components/AddAssignmentForm'
import { AssignmentTable } from './components/AssignmentTable'
import './App.css'

function sortByIdDesc(items: Assignment[]) {
  return [...items].sort((a, b) => b.id - a.id)
}

function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetchAssignments()
      .then((data) => setAssignments(sortByIdDesc(data)))
      .catch((err) =>
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load assignments.',
        ),
      )
      .finally(() => setLoading(false))
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
      {loading && <p>Loading...</p>}
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

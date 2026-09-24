export interface Assignment {
  id: number
  link: string
  technologies: string[]
  skillMatch: number | null
  interest: number | null
}

export interface AssignmentInput {
  link: string
  technologies?: string[]
  skillMatch?: number | null
  interest?: number | null
}

export type CreateAssignmentInput = AssignmentInput

const BASE_URL = '/api/assignments'

export async function fetchAssignments(): Promise<Assignment[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    throw new Error(`Failed to load assignments (${res.status})`)
  }
  return res.json()
}

export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<Assignment> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(`Failed to add assignment (${res.status})`)
  }
  return res.json()
}

export async function deleteAssignment(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    throw new Error(`Failed to delete assignment (${res.status})`)
  }
}

export async function updateAssignment(
  id: number,
  input: AssignmentInput,
): Promise<Assignment> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(`Failed to update assignment (${res.status})`)
  }
  return res.json()
}

export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'

export type Project = {
    id: string
    title: string
    description: string
    image: string
    owner: string
    category: string | null
    location: string | null
    volunteersNeeded: number
    volunteerRequirements: string | null
    status: ProjectStatus
    tags: string[]
    createdAt: string
    updatedAt: string
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completado',
    CLOSED: 'Cerrado'
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
    OPEN: 'success',
    IN_PROGRESS: 'primary',
    COMPLETED: 'secondary',
    CLOSED: 'danger'
}

export const PROJECT_CATEGORIES = [
    'Mejora vegetal',
    'Conservación',
    'Agronomía',
    'Agroecología',
    'Semillas',
    'Investigación',
    'Educación',
    'Otro'
] as const

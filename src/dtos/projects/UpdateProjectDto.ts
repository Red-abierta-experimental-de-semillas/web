import type { ProjectStatus } from '@/model/Project'

export type UpdateProjectDto = {
    title?: string
    description?: string
    image?: string
    category?: string | null
    location?: string | null
    volunteersNeeded?: number
    volunteerRequirements?: string | null
    status?: ProjectStatus
    tags?: string[]
}

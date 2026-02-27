export type CreateProjectDto = {
    title: string
    description: string
    image: string
    category: string | null
    location: string | null
    volunteersNeeded: number
    volunteerRequirements: string | null
    tags: string[]
}

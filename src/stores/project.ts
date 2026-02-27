import { defineStore } from 'pinia'
import { type Project } from '@/model/Project'
import { type ProjectMembership } from '@/model/ProjectMembership'
import type { CreateProjectDto } from '@/dtos/projects/CreateProjectDto'
import type { UpdateProjectDto } from '@/dtos/projects/UpdateProjectDto'
import { projectService } from '@/services/projectService'

export const useProjectStore = defineStore('project', {
    state: () => ({
        projects: [] as Project[],
        currentProjectMembers: [] as ProjectMembership[],
        isLoading: true,
        filters: {
            searchBar: '',
            category: null as string | null,
            status: null as string | null
        }
    }),
    getters: {
        getProjects(state): Project[] {
            const { searchBar, category, status } = state.filters
            const searchUpper = searchBar.toUpperCase()

            return state.projects
                .filter((project) => {
                    if (searchBar && !(
                        project.title.toUpperCase().includes(searchUpper) ||
                        project.description.toUpperCase().includes(searchUpper)
                    )) return false

                    if (category && project.category !== category) return false
                    if (status && project.status !== status) return false

                    return true
                })
                .sort((a, b) => {
                    // Más recientes primero
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                })
        },
        getProjectById: (state) => {
            return (id: string) => state.projects.find(p => p.id === id) || null
        },
        getAcceptedMembers(state): ProjectMembership[] {
            return state.currentProjectMembers.filter(m => m.status === 'ACCEPTED')
        },
        getPendingMembers(state): ProjectMembership[] {
            return state.currentProjectMembers.filter(m => m.status === 'PENDING')
        }
    },
    actions: {
        async fetch() {
            try {
                this.projects = []
                this.isLoading = true
                const data = await projectService.getProjects()
                this.projects = data.map((p: Project) => ({
                    ...p,
                    tags: [...(p.tags ?? [])].sort()
                }) as Project)
            } catch (error) {
                console.error('Error fetching projects:', error)
            } finally {
                this.isLoading = false
            }
        },
        async fetchMembers(projectId: string) {
            try {
                this.currentProjectMembers = await projectService.getProjectMembers(projectId)
            } catch (error) {
                console.error('Error fetching members:', error)
            }
        },
        async create(dto: CreateProjectDto): Promise<Project> {
            try {
                const created = await projectService.createProject(dto)
                this.projects.push(created)
                return created
            } catch (reason) {
                return await Promise.reject(reason)
            }
        },
        async update(id: string, dto: UpdateProjectDto): Promise<Project> {
            try {
                const updated = await projectService.updateProject(id, dto)
                const index = this.projects.findIndex(p => p.id === id)
                if (index >= 0) {
                    this.projects[index] = updated
                }
                return updated
            } catch (error) {
                return await Promise.reject(error)
            }
        },
        async delete(id: string) {
            try {
                await projectService.deleteProject(id)
                const index = this.projects.findIndex(p => p.id === id)
                if (index >= 0) {
                    this.projects.splice(index, 1)
                }
            } catch (error) {
                return Promise.reject(error)
            }
        },
        async join(projectId: string, message: string | null = null): Promise<ProjectMembership> {
            try {
                return await projectService.joinProject(projectId, message)
            } catch (error) {
                return Promise.reject(error)
            }
        },
        async manageMember(projectId: string, membershipId: string, action: 'ACCEPTED' | 'REJECTED') {
            try {
                const result = await projectService.manageMember(projectId, membershipId, action)
                const index = this.currentProjectMembers.findIndex(m => m.id === membershipId)
                if (index >= 0) {
                    this.currentProjectMembers[index] = result
                }
                return result
            } catch (error) {
                return Promise.reject(error)
            }
        },
        setSearchBarFilter(searchBar: string) {
            this.filters.searchBar = searchBar
        }
    }
})

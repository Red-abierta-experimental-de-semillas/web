import api from './api'
import type { Project } from '@/model/Project'
import type { ProjectMembership } from '@/model/ProjectMembership'
import type { CreateProjectDto } from '@/dtos/projects/CreateProjectDto'
import type { UpdateProjectDto } from '@/dtos/projects/UpdateProjectDto'

export const projectService = {
    async getProjects(): Promise<Project[]> {
        const response = await api.get('/projects')
        return response.data.projects
    },

    async getProject(id: string): Promise<Project> {
        const response = await api.get(`/projects/${id}`)
        return response.data
    },

    async createProject(dto: CreateProjectDto): Promise<Project> {
        const response = await api.post('/projects', dto)
        return response.data
    },

    async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
        const response = await api.put(`/projects/${id}`, dto)
        return response.data
    },

    async deleteProject(id: string): Promise<void> {
        await api.delete(`/projects/${id}`)
    },

    async joinProject(projectId: string, message: string | null = null): Promise<ProjectMembership> {
        const response = await api.post(`/projects/${projectId}/join`, { message })
        return response.data
    },

    async getProjectMembers(projectId: string): Promise<ProjectMembership[]> {
        const response = await api.get(`/projects/${projectId}/members`)
        return response.data.members
    },

    async manageMember(projectId: string, membershipId: string, action: 'ACCEPTED' | 'REJECTED'): Promise<ProjectMembership> {
        const response = await api.put(`/projects/${projectId}/members/${membershipId}`, { action })
        return response.data
    },

    async getDiscussionPosts(projectId: string): Promise<any[]> {
        const response = await api.get(`/projects/${projectId}/discussions`)
        return response.data.posts
    },

    async createDiscussionPost(projectId: string, content: string, userName: string, userImage: string, attachments?: any[], replyToPostId?: string): Promise<any> {
        const response = await api.post(`/projects/${projectId}/discussions`, { content, userName, userImage, attachments, replyToPostId })
        return response.data
    }
}

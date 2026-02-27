export type MembershipRole = 'OWNER' | 'VOLUNTEER'
export type MembershipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export type ProjectMembership = {
    id: string
    projectId: string
    userId: string
    role: MembershipRole
    status: MembershipStatus
    message: string | null
    joinedAt: string
}

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
    PENDING: 'Pendiente',
    ACCEPTED: 'Aceptado',
    REJECTED: 'Rechazado'
}

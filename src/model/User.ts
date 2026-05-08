export type EmailNotificationPreferences = {
  notifyForumPosts: boolean
  notifyNewProjects: boolean
  notifyProjectUpdates: boolean
}

export type User = {
  id: string
  name: string
  image: string
  have: string []
  want: string []
  experience: string | null
  interests: string | null
  location: string | null
  email: string | null
  emailNotifications: EmailNotificationPreferences
}

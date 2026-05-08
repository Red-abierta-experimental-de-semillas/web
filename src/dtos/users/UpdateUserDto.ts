import type { EmailNotificationPreferences } from '@/model/User'

export type UpdateUserDto = {
  name?: string
  image?: string
  have?: string[]
  want?: string[]
  offer?: string[]
  experience?: string
  interests?: string
  location?: string
  emailNotifications?: Partial<EmailNotificationPreferences>
}

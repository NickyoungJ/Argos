export type UserTier = 'FREE' | 'STANDARD' | 'PRO'

export type MonitorMode = 'VISUAL' | 'SEMANTIC'

export type LogStatus = 'CHANGED' | 'UNCHANGED' | 'ERROR'

export interface User {
  id: string
  email: string
  phone_number: string | null
  tier: UserTier
  credits: number
  created_at: string
}

export interface Monitor {
  id: string
  user_id: string
  url: string
  product_name: string
  target_option: string | null
  target_selector: string | null // CSS selector for focused monitoring
  mode: MonitorMode
  frequency: number
  is_active: boolean
  last_checked_at: string | null
  fail_count: number
  created_at: string
}

export interface Log {
  id: string
  monitor_id: string
  status: LogStatus
  message: string
  created_at: string
}


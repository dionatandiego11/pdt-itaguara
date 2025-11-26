export interface AdminMetrics {
  repositories: number
  proposals: number
  issues: number
  users: number
}

export interface AdminActivity {
  last_admin_login: string | null
  new_users_week: number
  new_repositories_week: number
}

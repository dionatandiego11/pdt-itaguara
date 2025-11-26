export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'duplicate'
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent'
export type IssueType = 'bug' | 'feature' | 'improvement' | 'policy' | 'infrastructure' | 'service'

export interface Issue {
  id: number
  number: number
  slug: string
  repository_id: number
  author_id: number
  assigned_to_id?: number | null
  title: string
  description: string
  type: IssueType
  status: IssueStatus
  priority: IssuePriority
  tags: string[]
  location?: string | null
  estimated_cost?: number | null
  budget_category?: string | null
  comments_count: number
  reactions_count: number
  created_at: string
  updated_at: string
  closed_at?: string | null
}

export interface IssueComment {
  id: number
  issue_id: number
  author_id: number
  content: string
  created_at: string
  updated_at: string
}

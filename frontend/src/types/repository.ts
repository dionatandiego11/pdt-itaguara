export type RepositoryVisibility = 'public' | 'private' | 'government' | 'affiliates_only'
export type RepositoryType = 'jurisdiction' | 'policy_area' | 'budget'

export interface RepositoryOwner {
  id: number
  username: string
  full_name?: string | null
}

export interface Repository {
  id: number
  name: string
  slug: string
  description?: string | null
  type: RepositoryType
  visibility: RepositoryVisibility
  owner_id?: number | null
  owner?: RepositoryOwner | null
  jurisdiction_name?: string | null
  jurisdiction_type?: string | null
  allow_public_proposals: boolean
  allow_public_voting: boolean
  require_verification_for_voting: boolean
  quorum_percentage: number
  voting_period_days: number
  min_signatures_for_voting: number
  proposals_count: number
  issues_count: number
  contributors_count: number
  is_active: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Commit {
  id: number
  repository_id: number
  author_id: number
  message: string
  content: string
  previous_commit_id?: number
  created_at: string
}

export interface File {
  id: number
  repository_id: number
  name: string
  content: string
  current_commit_id: number
  created_at: string
  updated_at: string
}

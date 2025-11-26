export type ProposalStatus =
  | 'draft'
  | 'discussion'
  | 'awaiting_review'
  | 'threshold_reached'
  | 'voting'
  | 'approved'
  | 'rejected'
  | 'withdrawn'

export type ProposalType =
  | 'amendment'
  | 'new_law'
  | 'repeal'
  | 'budget_alteration'

export interface Proposal {
  id: number
  number: string
  slug: string
  repository_id: number
  author_id: number
  title: string
  summary: string
  justification: string
  full_text: string
  type: ProposalType
  status: ProposalStatus
  branch_name: string
  target_branch: string
  signatures_count: number
  comments_count: number
  votes_count: number
  quorum_required: number | null
  threshold_percentage: number | null
  created_at: string
  updated_at: string
}

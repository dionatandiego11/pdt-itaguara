export interface Vote {
  id: string
  proposal_id: string
  user_id: string
  option: 'YES' | 'NO' | 'ABSTAIN'
  encrypted_vote?: string
  created_at: string
}

export interface VotingSession {
  id: string
  proposal_id: string
  status: 'PENDING' | 'ACTIVE' | 'CLOSED'
  start_date: string
  end_date: string
  yes_count: number
  no_count: number
  abstain_count: number
  total_participants: number
  quorum_required: number
  approval_threshold: number
}

export interface VoteResult {
  proposal_id: string
  status: 'APPROVED' | 'REJECTED'
  yes_percentage: number
  no_percentage: number
  total_votes: number
  quorum_reached: boolean
}

export type VoteChoice = 'yes' | 'no' | 'abstain'

export interface VotingStats {
  total_votes: number
  yes_votes: number
  no_votes: number
  abstain_votes: number
}

export interface UserVotingState {
  has_voted: boolean
  choice?: VoteChoice | null
}

export interface ActiveVotingSession {
  proposal_id: number
  repository_id: number
  session_id: number
  title: string
  summary: string
  starts_at: string
  ends_at: string
  stats: VotingStats
  user_state: UserVotingState
}

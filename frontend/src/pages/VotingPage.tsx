import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Clock, Loader2, MinusCircle, Search, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AxiosError } from 'axios'
import { Proposal, ProposalStatus } from '@/types/proposal'
import type { ActiveVotingSession, VoteChoice } from '@/types/voting'
import { apiClient } from '@/services/api'

type VoteApiError = {
  detail?: string
}

type VoteOption = {
  value: VoteChoice
  label: string
  description: string
  icon: LucideIcon
  accent: string
}

const voteOptions: VoteOption[] = [
  {
    value: 'yes',
    label: 'A favor',
    description: 'Concordo com a proposta e desejo que seja aprovada.',
    icon: ThumbsUp,
    accent: 'text-emerald-600',
  },
  {
    value: 'no',
    label: 'Contra',
    description: 'Nao concordo com esta proposta e voto contra.',
    icon: ThumbsDown,
    accent: 'text-rose-600',
  },
  {
    value: 'abstain',
    label: 'Abstencao',
    description: 'Prefiro nao me posicionar nesta votacao.',
    icon: MinusCircle,
    accent: 'text-slate-600',
  },
]

const PREPARING_STATUSES: ProposalStatus[] = ['discussion', 'awaiting_review', 'threshold_reached']

export function VotingPage() {
  const [sessions, setSessions] = useState<ActiveVotingSession[]>([])
  const [preparingProposals, setPreparingProposals] = useState<Proposal[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingPreparing, setLoadingPreparing] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSession, setSelectedSession] = useState<ActiveVotingSession | null>(null)
  const [voteChoice, setVoteChoice] = useState<VoteChoice | null>(null)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [voteMessage, setVoteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadActiveSessions = async () => {
    setLoadingSessions(true)
    try {
      const data = await apiClient.getActiveVotingSessions()
      setSessions(data)
    } catch (error) {
      console.error('Erro ao carregar sessoes de votacao ativas:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const loadPreparingProposals = async () => {
    setLoadingPreparing(true)
    try {
      const requests = PREPARING_STATUSES.map((status) => apiClient.getProposals({ status }))
      const results = await Promise.all(requests)
      const merged = new Map<number, Proposal>()
      results.flat().forEach((proposal) => {
        merged.set(proposal.id, proposal)
      })
      setPreparingProposals(Array.from(merged.values()))
    } catch (error) {
      console.error('Erro ao carregar propostas em preparacao:', error)
    } finally {
      setLoadingPreparing(false)
    }
  }

  useEffect(() => {
    loadActiveSessions()
    loadPreparingProposals()
  }, [])

  const openVoteModal = (session: ActiveVotingSession) => {
    if (session.user_state.has_voted) return
    setSelectedSession(session)
    setVoteChoice(null)
    setVoteMessage(null)
  }

  const closeVoteModal = () => {
    if (isSubmittingVote) return
    setSelectedSession(null)
    setVoteChoice(null)
    setVoteMessage(null)
  }

  const handleVoteSubmit = async () => {
    if (!selectedSession || !voteChoice) return
    setIsSubmittingVote(true)
    try {
      await apiClient.vote(String(selectedSession.proposal_id), voteChoice)

      setSessions((prev) =>
        prev.map((session) => {
          if (session.proposal_id !== selectedSession.proposal_id) {
            return session
          }
          const updatedSession: ActiveVotingSession = {
            ...session,
            stats: {
              total_votes: session.stats.total_votes + 1,
              yes_votes: session.stats.yes_votes + (voteChoice === 'yes' ? 1 : 0),
              no_votes: session.stats.no_votes + (voteChoice === 'no' ? 1 : 0),
              abstain_votes: session.stats.abstain_votes + (voteChoice === 'abstain' ? 1 : 0),
            },
            user_state: {
              has_voted: true,
              choice: voteChoice,
            },
          }
          setSelectedSession(updatedSession)
          return updatedSession
        })
      )

      setVoteMessage({ type: 'success', text: 'Voto confirmado!' })
      setTimeout(() => {
        closeVoteModal()
      }, 1200)
    } catch (error) {
      const axiosError = error as AxiosError<VoteApiError>
      const serverMessage = axiosError.response?.data?.detail
      setVoteMessage({
        type: 'error',
        text: serverMessage ?? 'Nao foi possivel registrar o voto. Tente novamente em instantes.',
      })
    } finally {
      setIsSubmittingVote(false)
    }
  }

  const searchTermLower = searchTerm.toLowerCase()
  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) =>
        [session.title, session.summary].some((value) => value.toLowerCase().includes(searchTermLower))
      ),
    [sessions, searchTermLower]
  )

  const filteredPreparing = useMemo(
    () =>
      preparingProposals.filter((proposal) =>
        [proposal.title, proposal.summary].some((value) => value.toLowerCase().includes(searchTermLower))
      ),
    [preparingProposals, searchTermLower]
  )

  const getVoteLabel = (value: VoteChoice | null | undefined) =>
    value ? voteOptions.find((option) => option.value === value)?.label ?? '' : ''

  const getProgressInfo = (startsAt: string, endsAt: string) => {
    const start = new Date(startsAt).getTime()
    const end = new Date(endsAt).getTime()
    const now = Date.now()

    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      return { percent: 0, label: 'Sem prazo definido' }
    }

    if (now <= start) {
      return {
        percent: 0,
        label: formatRemainingTime(start - now, true),
      }
    }

    const total = end - start
    const elapsed = now - start
    const remaining = Math.max(end - now, 0)
    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100))

    return {
      percent,
      label: remaining === 0 ? 'Encerrada' : formatRemainingTime(remaining, false),
    }
  }

  const formatRemainingTime = (milliseconds: number, isFutureStart: boolean) => {
    if (milliseconds <= 0) {
      return isFutureStart ? 'Inicia em instantes' : 'Encerrada'
    }
    const hours = Math.ceil(milliseconds / (1000 * 60 * 60))
    if (hours < 24) {
      return `${isFutureStart ? 'Inicia' : 'Termina'} em ${hours}h`
    }
    const days = Math.ceil(hours / 24)
    return `${isFutureStart ? 'Inicia' : 'Termina'} em ${days} dia${days > 1 ? 's' : ''}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Votacoes Ativas</h1>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar votacoes ou propostas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {loadingSessions ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 card">
                <p className="text-gray-600 mb-2">Nenhuma votacao ativa no momento.</p>
                <p className="text-sm text-gray-500">
                  Acompanhe abaixo as propostas em preparacao e mobilize assinaturas para habilitar a votacao.
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const progress = getProgressInfo(session.starts_at, session.ends_at)
                return (
                  <div key={session.proposal_id} className="card relative overflow-hidden">
                    {session.user_state.has_voted && (
                      <div className="absolute right-0 top-0 bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Voto registrado
                      </div>
                    )}

                    <Link to={`/proposals/${session.proposal_id}`} className="hover:text-primary-600">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{session.title}</h3>
                    </Link>
                    <p className="text-gray-600">{session.summary}</p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div className="card bg-gray-50">
                        <p className="font-semibold text-gray-900">Votos registrados</p>
                        <p className="text-2xl">{session.stats.total_votes}</p>
                      </div>
                      <div className="card bg-gray-50">
                        <p className="font-semibold text-gray-900">Votos a favor</p>
                        <p className="text-2xl text-emerald-600">{session.stats.yes_votes}</p>
                      </div>
                      <div className="card bg-gray-50">
                        <p className="font-semibold text-gray-900">Votos contra</p>
                        <p className="text-2xl text-rose-600">{session.stats.no_votes}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-2 font-semibold text-gray-700">
                          <Clock className="w-4 h-4 text-primary-500" />
                          {progress.label}
                        </span>
                        <span>{progress.percent.toFixed(0)}% do prazo</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${progress.percent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Link to={`/proposals/${session.proposal_id}`} className="btn-outline text-center">
                        Ver detalhes
                      </Link>

                      {session.user_state.has_voted ? (
                        <button
                          type="button"
                          className="btn-secondary flex items-center justify-center gap-2 text-sm opacity-80"
                          disabled
                        >
                          <CheckCircle className="w-4 h-4" />
                          Voce votou: {getVoteLabel(session.user_state.choice)}
                        </button>
                      ) : (
                        <button type="button" className="btn-primary" onClick={() => openVoteModal(session)}>
                          Votar agora
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Em preparacao</h2>
            {loadingPreparing && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Propostas que ainda estao reunindo assinaturas ou aguardando parecer tecnico.
          </p>

          {filteredPreparing.length === 0 ? (
            <div className="card text-center text-sm text-gray-500">Nenhuma proposta em preparacao encontrada.</div>
          ) : (
            <div className="space-y-4">
              {filteredPreparing.map((proposal) => (
                <div key={proposal.id} className="card">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mt-1">{proposal.summary}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{proposal.signatures_count} assinaturas</span>
                      <span>{proposal.votes_count} votos</span>
                      <Link to={`/proposals/${proposal.id}`} className="btn-outline text-xs whitespace-nowrap">
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center px-4 py-10 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={closeVoteModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Fechar modal de votacao"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Participar da votacao</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">{selectedSession.title}</h2>
              <p className="text-gray-600 mt-4">{selectedSession.summary}</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {voteOptions.map((option) => {
                const Icon = option.icon
                const isSelected = voteChoice === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVoteChoice(option.value)}
                    className={`rounded-2xl border p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 ${
                      isSelected ? 'border-primary-600 bg-primary-50 shadow-lg' : 'border-gray-200 hover:border-primary-200'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${option.accent}`} />
                    <p className="mt-4 font-semibold text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </button>
                )
              })}
            </div>

            {voteMessage && (
              <div
                className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                  voteMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {voteMessage.text}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="btn-outline" onClick={closeVoteModal} disabled={isSubmittingVote}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary flex items-center gap-2"
                onClick={handleVoteSubmit}
                disabled={!voteChoice || isSubmittingVote}
              >
                {isSubmittingVote ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando voto...
                  </>
                ) : (
                  'Confirmar voto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

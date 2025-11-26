import { useState, useEffect } from 'react'
import { Plus, Search, Filter, GitMerge, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Proposal, ProposalStatus } from '@/types/proposal'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/context/authStore'

export function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { user } = useAuthStore()

  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    try {
      const data = await apiClient.getProposals()
      setProposals(data)
    } catch (error) {
      console.error('Erro ao carregar propostas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (proposalId: number) => {
    if (!window.confirm('Tem certeza que deseja apagar esta proposta?')) return
    try {
      await apiClient.deleteProposal(proposalId)
      setProposals((prev) => prev.filter((proposal) => proposal.id !== proposalId))
    } catch (error) {
      console.error('Erro ao apagar proposta:', error)
    }
  }

  const statusLabels: Record<ProposalStatus, string> = {
    draft: 'Rascunho',
    discussion: 'Discussão Pública',
    awaiting_review: 'Aguardando Parecer',
    threshold_reached: 'Limiar Atingido',
    voting: 'Em Votação',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
    withdrawn: 'Retirada',
  }

  const statuses = Object.keys(statusLabels) as ProposalStatus[]

  const getStatusColor = (status: ProposalStatus) => {
    const colors: Record<ProposalStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      discussion: 'bg-blue-100 text-blue-700',
      awaiting_review: 'bg-amber-100 text-amber-700',
      threshold_reached: 'badge-primary',
      voting: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      withdrawn: 'bg-gray-100 text-gray-600',
    }
    return colors[status] || 'badge-primary'
  }

  const canDelete = (proposal: Proposal) =>
    !!user && (user.is_superuser || proposal.author_id === user.id)

  const normalizedSearch = searchTerm.toLowerCase()
  const filteredProposals = proposals.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(normalizedSearch) ||
      prop.summary.toLowerCase().includes(normalizedSearch)
    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900">Propostas</h1>
            <Link to="/proposals/new" className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nova Proposta
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar propostas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">Todos os status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-gray-600 mb-4">Nenhuma proposta encontrada</p>
            <Link to="/proposals/new" className="btn-primary">
              Criar primeira proposta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <div key={proposal.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to={`/proposals/${proposal.id}`}
                      className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600"
                    >
                      {proposal.title}
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{proposal.summary}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <GitMerge className="w-4 h-4 mr-1 text-primary-500" />
                        Repo #{proposal.repository_id}
                      </span>
                      <span>✍️ {proposal.signatures_count} assinaturas</span>
                      <span>🗳️ {proposal.votes_count} votos</span>
                      <span>{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${getStatusColor(proposal.status)}`}>
                      {statusLabels[proposal.status]}
                    </span>
                    {canDelete(proposal) && (
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="text-red-600 text-xs flex items-center gap-1 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        Apagar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

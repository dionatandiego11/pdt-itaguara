import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, Trash2, Pencil, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/services/api'
import { Proposal } from '@/types/proposal'
import { useAuthStore } from '@/context/authStore'
import { TERMINOLOGY } from '@/utils/terminology'

export function ProposalDetailsPage() {
  const { proposalId } = useParams<{ proposalId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!proposalId) return
      try {
        const data = await apiClient.getProposalById(proposalId)
        setProposal(data)
      } catch (err) {
        console.error('Erro ao carregar proposta', err)
        setError(`Não foi possível carregar a ${TERMINOLOGY.PULL_REQUEST.toLowerCase()}.`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [proposalId])

  const canEdit =
    !!user && proposal && (user.is_superuser || proposal.author_id === user.id)

  const handleDelete = async () => {
    if (!proposal || !window.confirm(`Deseja realmente apagar esta ${TERMINOLOGY.PULL_REQUEST.toLowerCase()}?`)) return
    try {
      await apiClient.deleteProposal(proposal.id)
      navigate('/proposals')
    } catch (err) {
      console.error('Erro ao apagar proposta', err)
      setError(`Não foi possível apagar a ${TERMINOLOGY.PULL_REQUEST.toLowerCase()}.`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-center">
        <p className="text-gray-600">{error || `${TERMINOLOGY.PULL_REQUEST} não encontrada.`}</p>
        <Link to="/proposals" className="btn-primary">
          Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" />
          <Link to="/proposals" className="text-primary-600 hover:underline">
            Voltar para {TERMINOLOGY.PULL_REQUESTS}
          </Link>
        </div>

        <div className="card space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">{TERMINOLOGY.PULL_REQUEST} #{proposal.number}</p>
              <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
              <p className="text-gray-600 mt-2">{proposal.summary}</p>
            </div>
            {canEdit && (
              <div className="flex gap-3">
                <Link
                  to={`/proposals/${proposal.id}/edit`}
                  className="btn-outline flex items-center gap-2 text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn-outline border-red-300 text-red-600 flex items-center gap-2 text-sm hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Apagar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Justificativa
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{proposal.justification}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Texto completo</h3>
              <p className="text-gray-700 whitespace-pre-line">{proposal.full_text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

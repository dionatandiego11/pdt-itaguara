import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookCopy, Loader2, ShieldCheck, Users2, Pencil, Trash2, User, Calendar } from 'lucide-react'
import { apiClient } from '@/services/api'
import { Repository } from '@/types/repository'
import { useAuthStore } from '@/context/authStore'

import { TERMINOLOGY } from '@/utils/terminology'

export function RepositoryDetailsPage() {
  const { repositoryId } = useParams()
  const navigate = useNavigate()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    const loadRepository = async () => {
      if (!repositoryId) return
      try {
        const data = await apiClient.getRepository(repositoryId)
        setRepository(data)
      } catch (fetchError) {
        console.error('Erro ao carregar repositório', fetchError)
        setError(`Não foi possível carregar as informações da ${TERMINOLOGY.REPOSITORY}.`)
      } finally {
        setLoading(false)
      }
    }

    loadRepository()
  }, [repositoryId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (error || !repository) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4 px-4">
        <p className="text-lg text-gray-600">{error || `${TERMINOLOGY.REPOSITORY} não encontrada.`}</p>
        <Link to="/repositories" className="btn-primary">
          Voltar para {TERMINOLOGY.REPOSITORIES}
        </Link>
      </div>
    )
  }

  const canEdit = !!user && repository && (user.is_superuser || repository.owner_id === user.id)

  const handleDelete = async () => {
    if (!repository || !window.confirm(`Deseja remover esta ${TERMINOLOGY.REPOSITORY}?`)) return
    try {
      await apiClient.deleteRepository(repository.id)
      navigate('/repositories')
    } catch (err) {
      console.error('Erro ao remover repositório', err)
      setError(`Não foi possível apagar a ${TERMINOLOGY.REPOSITORY}.`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <Link to="/repositories" className="text-primary-600 hover:underline">
                Voltar para {TERMINOLOGY.REPOSITORIES}
              </Link>
            </p>
            <h1 className="text-4xl font-bold text-gray-900">{repository.name}</h1>
            <p className="text-gray-600 mt-2">{repository.description || 'Sem descrição.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-500" />
            <span className="badge">
              {repository.visibility === 'public'
                ? 'Público'
                : repository.visibility === 'affiliates_only'
                  ? 'Apenas Filiados'
                  : repository.visibility === 'government'
                    ? 'Governamental'
                    : 'Privado'}
            </span>
            {canEdit && (
              <>
                <Link
                  to={`/repositories/${repository.id}/edit`}
                  className="btn-outline text-sm flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn-outline text-sm flex items-center gap-2 border-red-300 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Apagar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Informações do Proprietário e Data de Criação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repository.owner && (
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Proprietário</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {repository.owner.full_name || repository.owner.username}
                  </p>
                  {repository.owner.full_name && (
                    <p className="text-sm text-gray-500">@{repository.owner.username}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Criado em</h3>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(repository.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(repository.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Jurisdição</h2>
            <p className="text-gray-900 text-lg font-medium">
              {repository.jurisdiction_name || 'Não informado'}
            </p>
            <p className="text-sm text-gray-500">{repository.jurisdiction_type || '-'}</p>
          </div>
          <div className="card space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Configuração</h2>
            <p className="text-gray-900 text-lg font-medium">
              Quorum {repository.quorum_percentage}% • {repository.voting_period_days} dias de votação
            </p>
            <p className="text-sm text-gray-500">
              {repository.min_signatures_for_voting} assinaturas para abrir votação
            </p>
          </div>
          <div className="card space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Estatísticas</h2>
            <p className="flex items-center gap-2 text-gray-900 text-lg font-medium">
              <BookCopy className="w-5 h-5 text-primary-500" />
              {repository.proposals_count} propostas
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Users2 className="w-4 h-4 text-primary-500" />
              {repository.contributors_count} contribuidores
            </p>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Permissões</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              • {repository.allow_public_proposals ? 'Aceita' : 'Não aceita'} propostas públicas
            </li>
            <li>• {repository.allow_public_voting ? 'Permite' : 'Não permite'} votação pública</li>
            <li>
              • {repository.require_verification_for_voting ? 'Exige' : 'Dispensa'} verificação para
              votar
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

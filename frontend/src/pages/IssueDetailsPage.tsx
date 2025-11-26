import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Loader2, Trash2, Pencil, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/services/api'
import { Issue } from '@/types/issue'
import { useAuthStore } from '@/context/authStore'

export function IssueDetailsPage() {
  const { issueId } = useParams<{ issueId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!issueId) return
      try {
        const data = await apiClient.getIssueById(Number(issueId))
        setIssue(data)
      } catch (err) {
        console.error('Erro ao carregar demanda', err)
        setError('Não foi possível carregar a demanda.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [issueId])

  const canEdit = !!user && issue && (user.is_superuser || issue.author_id === user.id)

  const handleDelete = async () => {
    if (!issue || !window.confirm('Deseja apagar esta demanda?')) return
    try {
      await apiClient.deleteIssue(issue.id)
      navigate('/issues')
    } catch (err) {
      console.error('Erro ao apagar demanda', err)
      setError('Não foi possível apagar a demanda.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-center">
        <p className="text-gray-600">{error || 'Demanda não encontrada.'}</p>
        <Link to="/issues" className="btn-primary">
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
          <Link to="/issues" className="text-primary-600 hover:underline">
            Voltar para Demandas
          </Link>
        </div>

        <div className="card space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
              <p className="text-gray-600 mt-2">{issue.description}</p>
              <div className="mt-4 text-sm text-gray-500 space-x-4">
                <span>Status: {issue.status}</span>
                <span>Prioridade: {issue.priority}</span>
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-3">
                <Link
                  to={`/issues/${issue.id}/edit`}
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

          {issue.tags && issue.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              {issue.tags.map((tag) => (
                <span key={tag} className="badge-primary">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

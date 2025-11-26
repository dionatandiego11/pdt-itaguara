import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, FileWarning, Loader2 } from 'lucide-react'
import { apiClient } from '@/services/api'
import { Repository } from '@/types/repository'
import { IssuePriority, IssueStatus, IssueType } from '@/types/issue'

interface IssueFormState {
  repositoryId: string
  title: string
  description: string
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  tags: string
  location: string
  estimated_cost?: number
  budget_category: string
}

const issueTypes: { value: IssueType; label: string }[] = [
  { value: 'bug', label: 'Bug/Problema' },
  { value: 'feature', label: 'Nova funcionalidade' },
  { value: 'improvement', label: 'Melhoria' },
  { value: 'policy', label: 'Política pública' },
  { value: 'infrastructure', label: 'Infraestrutura' },
  { value: 'service', label: 'Serviço público' },
]

const priorityLabels: Record<IssuePriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

const statusLabels: Record<IssueStatus, string> = {
  open: 'Aberta',
  in_progress: 'Em andamento',
  resolved: 'Resolvida',
  closed: 'Fechada',
  duplicate: 'Duplicada',
}

export function NewIssuePage() {
  const navigate = useNavigate()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [form, setForm] = useState<IssueFormState>({
    repositoryId: '',
    title: '',
    description: '',
    type: 'bug',
    priority: 'medium',
    status: 'open',
    tags: '',
    location: '',
    budget_category: '',
  })

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        const data = await apiClient.getRepositories()
        setRepositories(data)
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, repositoryId: String(data[0].id) }))
        }
      } catch (repoError) {
        console.error('Erro ao carregar repositórios', repoError)
        setError('Não foi possível carregar os repositórios. Tente novamente.')
      } finally {
        setLoadingRepos(false)
      }
    }
    loadRepositories()
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'estimated_cost' && value ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.repositoryId) {
      setError('Selecione um repositório para vincular a demanda.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await apiClient.createIssue({
        repository_id: Number(form.repositoryId),
        title: form.title,
        description: form.description,
        type: form.type,
        priority: form.priority,
        status: form.status,
        tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()) : [],
        location: form.location || undefined,
        estimated_cost: form.estimated_cost,
        budget_category: form.budget_category || undefined,
      })
      setSuccessMessage('Demanda registrada com sucesso! Redirecionando...')
      setTimeout(() => navigate('/issues'), 1200)
    } catch (submitError) {
      console.error('Erro ao criar demanda', submitError)
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível criar a demanda. Tente novamente.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <Link to="/issues" className="text-primary-600 hover:underline">
                Voltar para Demandas
              </Link>
            </p>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <FileWarning className="w-9 h-9 text-primary-600" />
              Nova Demanda
            </h1>
            <p className="text-gray-600 mt-2">
              Registre problemas, ideias de melhoria ou pedidos de serviço associados a um
              repositório.
            </p>
          </div>
          <AlertTriangle className="w-10 h-10 text-primary-500 hidden md:block" />
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger-700 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 rounded-lg border border-success-200 bg-success-50 p-4 text-success-700 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Repositório</label>
              {loadingRepos ? (
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Carregando repositórios...</span>
                </div>
              ) : repositories.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum repositório disponível.{' '}
                  <Link to="/repositories/new" className="text-primary-600 underline">
                    Crie um repositório primeiro
                  </Link>
                  .
                </p>
              ) : (
                <select
                  name="repositoryId"
                  value={form.repositoryId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {repositories.map((repo) => (
                    <option key={repo.id} value={repo.id}>
                      {repo.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select name="type" value={form.type} onChange={handleChange} className="input-field">
                  {issueTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="input-field"
                >
                  {Object.entries(priorityLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status inicial</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Localização</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Bairro, rua, unidade pública..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Descreva resumidamente o problema"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição detalhada</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input-field"
                rows={6}
                placeholder="Explique o problema, impacto e contexto."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex.: mobilidade, drenagem, serviço"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separe por vírgulas para facilitar a categorização.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria orçamentária</label>
                <input
                  type="text"
                  name="budget_category"
                  value={form.budget_category}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex.: Infraestrutura, Saúde, Educação"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimativa de custo (opcional)
              </label>
              <input
                type="number"
                name="estimated_cost"
                value={form.estimated_cost ?? ''}
                onChange={handleChange}
                className="input-field"
                min={0}
                placeholder="Informe em reais"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Link to="/issues" className="btn-outline text-center">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || repositories.length === 0}
                className="btn-primary inline-flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar demanda'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

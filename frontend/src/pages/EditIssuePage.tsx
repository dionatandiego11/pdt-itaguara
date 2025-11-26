import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/services/api'
import { Issue, IssuePriority, IssueStatus, IssueType } from '@/types/issue'

const issueTypes: IssueType[] = [
  'bug',
  'feature',
  'improvement',
  'policy',
  'infrastructure',
  'service',
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

export function EditIssuePage() {
  const { issueId } = useParams<{ issueId: string }>()
  const navigate = useNavigate()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'bug' as IssueType,
    priority: 'medium' as IssuePriority,
    status: 'open' as IssueStatus,
    tags: '',
    location: '',
    estimated_cost: '',
    budget_category: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!issueId) return
      try {
        const data = await apiClient.getIssueById(Number(issueId))
        setIssue(data)
        setForm({
          title: data.title,
          description: data.description,
          type: data.type,
          priority: data.priority,
          status: data.status,
          tags: (data.tags || []).join(', '),
          location: data.location || '',
          estimated_cost: data.estimated_cost ? String(data.estimated_cost) : '',
          budget_category: data.budget_category || '',
        })
      } catch (err) {
        console.error('Erro ao carregar demanda', err)
        setError('Não foi possível carregar a demanda.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [issueId])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!issueId) return
    setSaving(true)
    setError(null)
    try {
      await apiClient.updateIssue(Number(issueId), {
        title: form.title,
        description: form.description,
        type: form.type,
        priority: form.priority,
        status: form.status,
        location: form.location,
        budget_category: form.budget_category || undefined,
        tags: form.tags
          ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : undefined,
      })
      navigate(`/issues/${issueId}`)
    } catch (err) {
      console.error('Erro ao atualizar demanda', err)
      setError('Não foi possível atualizar a demanda.')
    } finally {
      setSaving(false)
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
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
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
          <Link to={`/issues/${issue.id}`} className="text-primary-600 hover:underline">
            Voltar para detalhes
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900">Editar Demanda</h1>

        {error && (
          <div className="rounded border border-danger-200 bg-danger-50 p-3 text-danger-700 text-sm">
            {error}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  {issueTypes.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
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
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input-field"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input-field"
                rows={5}
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
                  placeholder="mobilidade, drenagem..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Localização</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria orçamentária</label>
                <input
                  type="text"
                  name="budget_category"
                  value={form.budget_category}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimativa de custo</label>
                <input
                  type="number"
                  name="estimated_cost"
                  value={form.estimated_cost}
                  onChange={handleChange}
                  className="input-field"
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary flex items-center" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

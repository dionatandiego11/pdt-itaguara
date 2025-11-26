import { useEffect, useState, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { apiClient } from '@/services/api'
import { Repository, RepositoryType, RepositoryVisibility } from '@/types/repository'
import { Loader2, ArrowLeft } from 'lucide-react'
import { TERMINOLOGY } from '@/utils/terminology'

const visibilityOptions: RepositoryVisibility[] = ['public', 'affiliates_only', 'private', 'government']
const typeOptions: RepositoryType[] = ['jurisdiction', 'policy_area', 'budget']

type RepositoryFormState = {
  name: string
  description: string
  type: RepositoryType
  visibility: RepositoryVisibility
  jurisdiction_name: string
  jurisdiction_type: string
  quorum_percentage: number
  voting_period_days: number
  min_signatures_for_voting: number
  allow_public_proposals: boolean
  allow_public_voting: boolean
  require_verification_for_voting: boolean
}

export function EditRepositoryPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>()
  const navigate = useNavigate()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [form, setForm] = useState<RepositoryFormState>({
    name: '',
    description: '',
    type: 'policy_area',
    visibility: 'public',
    jurisdiction_name: '',
    jurisdiction_type: '',
    quorum_percentage: 10,
    voting_period_days: 7,
    min_signatures_for_voting: 500,
    allow_public_proposals: true,
    allow_public_voting: true,
    require_verification_for_voting: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRepository = async () => {
      if (!repositoryId) return
      try {
        const data = await apiClient.getRepository(repositoryId)
        setRepository(data)
        setForm({
          name: data.name,
          description: data.description ?? '',
          type: data.type,
          visibility: data.visibility,
          jurisdiction_name: data.jurisdiction_name ?? '',
          jurisdiction_type: data.jurisdiction_type ?? '',
          quorum_percentage: data.quorum_percentage,
          voting_period_days: data.voting_period_days,
          min_signatures_for_voting: data.min_signatures_for_voting,
          allow_public_proposals: data.allow_public_proposals,
          allow_public_voting: data.allow_public_voting,
          require_verification_for_voting: data.require_verification_for_voting,
        })
      } catch (repoError) {
        console.error('Erro ao carregar repositório', repoError)
        setError(`Não foi possível carregar a ${TERMINOLOGY.REPOSITORY.toLowerCase()}.`)
      } finally {
        setLoading(false)
      }
    }

    loadRepository()
  }, [repositoryId])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target
    let formatted: string | number | boolean = value

    if (type === 'checkbox' && event.target instanceof HTMLInputElement) {
      formatted = event.target.checked
    } else if (
      ['quorum_percentage', 'voting_period_days', 'min_signatures_for_voting'].includes(name)
    ) {
      formatted = Number(value)
    } else if (name === 'type') {
      formatted = value as RepositoryType
    } else if (name === 'visibility') {
      formatted = value as RepositoryVisibility
    }

    setForm((prev) => ({
      ...prev,
      [name]: formatted,
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!repositoryId) return
    setSaving(true)
    setError(null)
    try {
      await apiClient.updateRepository(Number(repositoryId), form)
      navigate(`/repositories/${repositoryId}`)
    } catch (submitError) {
      console.error('Erro ao atualizar repositório', submitError)
      const message =
        submitError instanceof Error
          ? submitError.message
          : `Não foi possível atualizar a ${TERMINOLOGY.REPOSITORY.toLowerCase()}.`
      setError(message)
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

  if (!repository) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-gray-600">{TERMINOLOGY.REPOSITORY} não encontrada.</p>
        <Link to="/repositories" className="btn-primary">
          Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <Link to={`/repositories/${repository.id}`} className="text-primary-600 hover:underline">
            Voltar para detalhes
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Editar {TERMINOLOGY.REPOSITORY}</h1>

        <div className="card">
          {error && (
            <div className="mb-4 rounded border border-danger-200 bg-danger-50 p-3 text-danger-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select name="type" value={form.type} onChange={handleChange} className="input-field">
                  {typeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input-field"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Jurisdição</label>
                <input
                  type="text"
                  name="jurisdiction_name"
                  value={form.jurisdiction_name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <input
                  type="text"
                  name="jurisdiction_type"
                  value={form.jurisdiction_type}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Visibilidade</label>
              <select
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
                className="input-field"
              >
                {visibilityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'affiliates_only' ? 'Apenas Filiados' : opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quorum (%)</label>
                <input
                  type="number"
                  name="quorum_percentage"
                  value={form.quorum_percentage}
                  onChange={handleChange}
                  className="input-field"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Período de votação</label>
                <input
                  type="number"
                  name="voting_period_days"
                  value={form.voting_period_days}
                  onChange={handleChange}
                  className="input-field"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assinaturas mínimas</label>
                <input
                  type="number"
                  name="min_signatures_for_voting"
                  value={form.min_signatures_for_voting}
                  onChange={handleChange}
                  className="input-field"
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="allow_public_proposals"
                  checked={form.allow_public_proposals}
                  onChange={handleChange}
                />
                Permitir propostas públicas
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="allow_public_voting"
                  checked={form.allow_public_voting}
                  onChange={handleChange}
                />
                Permitir votação pública
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="require_verification_for_voting"
                  checked={form.require_verification_for_voting}
                  onChange={handleChange}
                />
                Exigir verificação para votar
              </label>
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

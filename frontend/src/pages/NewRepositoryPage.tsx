import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Info, Loader2, Shield } from 'lucide-react'
import { apiClient } from '@/services/api'
import { RepositoryType, RepositoryVisibility } from '@/types/repository'
import { useAuthStore } from '@/context/authStore'
import { TERMINOLOGY } from '@/utils/terminology'

type FormState = {
  name: string
  description: string
  type: RepositoryType
  visibility: RepositoryVisibility
  jurisdiction_name: string
  jurisdiction_type: string
  allow_public_proposals: boolean
  allow_public_voting: boolean
  require_verification_for_voting: boolean
  quorum_percentage: number
  voting_period_days: number
  min_signatures_for_voting: number
}

const repositoryTypes: { value: RepositoryType; label: string; helper: string }[] = [
  {
    value: 'jurisdiction',
    label: 'Jurisdição',
    helper: 'Abrange todo um ente federativo (município, estado, país).',
  },
  {
    value: 'policy_area',
    label: 'Área de Política',
    helper: 'Projetos focados em um tema específico (ex: código de obras).',
  },
  {
    value: 'budget',
    label: 'Orçamento',
    helper: 'Planejamento de receitas e despesas participativas.',
  },
]

const visibilityOptions: { value: RepositoryVisibility; label: string; helper: string }[] = [
  {
    value: 'public',
    label: 'Público',
    helper: 'Qualquer cidadão pode consultar e propor.',
  },
  {
    value: 'affiliates_only',
    label: 'Apenas Filiados',
    helper: 'Apenas filiados verificados podem acessar.',
  },
  {
    value: 'government',
    label: 'Governamental',
    helper: 'Aberto para leitura; contribuições moderadas.',
  },
  {
    value: 'private',
    label: 'Privado',
    helper: 'Acesso restrito à equipe autorizada.',
  },
]

export function NewRepositoryPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    type: 'policy_area',
    visibility: 'public',
    jurisdiction_name: '',
    jurisdiction_type: 'Municipal',
    allow_public_proposals: true,
    allow_public_voting: true,
    require_verification_for_voting: true,
    quorum_percentage: 10,
    voting_period_days: 7,
    min_signatures_for_voting: 500,
  })

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target
    let formatted: string | number | boolean = value

    if (type === 'checkbox' && event.target instanceof HTMLInputElement) {
      formatted = event.target.checked
    } else if (
      ['quorum_percentage', 'voting_period_days', 'min_signatures_for_voting'].includes(name)
    ) {
      formatted = Number(value)
    }

    setForm((prev) => ({
      ...prev,
      [name]: formatted,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      await apiClient.createRepository({
        name: form.name,
        description: form.description,
        type: form.type,
        visibility: form.visibility,
        jurisdiction_name: form.jurisdiction_name,
        jurisdiction_type: form.jurisdiction_type,
        allow_public_proposals: form.allow_public_proposals,
        allow_public_voting: form.allow_public_voting,
        require_verification_for_voting: form.require_verification_for_voting,
        quorum_percentage: form.quorum_percentage,
        voting_period_days: form.voting_period_days,
        min_signatures_for_voting: form.min_signatures_for_voting,
      })
      setSuccessMessage(`${TERMINOLOGY.REPOSITORY} criada com sucesso! Redirecionando...`)
      setTimeout(() => navigate('/repositories'), 1200)
    } catch (submitError) {
      console.error('Erro ao criar repositório', submitError)
      const message =
        submitError instanceof Error
          ? submitError.message
          : `Não foi possível criar a ${TERMINOLOGY.REPOSITORY.toLowerCase()}. Tente novamente.`
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || (!user.is_verified && !user.is_superuser)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4 px-4">
        <p className="text-lg text-gray-600">Apenas filiados podem criar novas {TERMINOLOGY.REPOSITORIES.toLowerCase()}.</p>
        <Link to="/repositories" className="btn-primary">
          Voltar para {TERMINOLOGY.REPOSITORIES}
        </Link>
      </div>
    )
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
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-9 h-9 text-primary-600" />
              {TERMINOLOGY.NEW_REPOSITORY}
            </h1>
            <p className="text-gray-600 mt-2">
              Centralize propostas e discussões vinculadas a uma lei, programa ou jurisdição.
            </p>
          </div>
          <Shield className="w-10 h-10 text-primary-500 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome da {TERMINOLOGY.REPOSITORY}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ex: Plano Diretor Municipal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de {TERMINOLOGY.REPOSITORY}
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {repositoryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={`Conte o objetivo e escopo desta ${TERMINOLOGY.REPOSITORY.toLowerCase()}.`}
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
                    placeholder="Prefeitura de São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de jurisdição
                  </label>
                  <input
                    type="text"
                    name="jurisdiction_type"
                    value={form.jurisdiction_type}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Municipal, Estadual, Federal..."
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
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {visibilityOptions.find((o) => o.value === form.visibility)?.helper}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="allow_public_proposals"
                    checked={form.allow_public_proposals}
                    onChange={handleChange}
                  />
                  <span>Permitir propostas públicas</span>
                </label>
                <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="allow_public_voting"
                    checked={form.allow_public_voting}
                    onChange={handleChange}
                  />
                  <span>Permitir votação pública</span>
                </label>
                <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="require_verification_for_voting"
                    checked={form.require_verification_for_voting}
                    onChange={handleChange}
                  />
                  <span>Exigir verificação para votar</span>
                </label>
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
                  <label className="block text-sm font-medium text-gray-700">
                    Período de votação (dias)
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700">
                    Assinaturas para votar
                  </label>
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

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Link to="/repositories" className="btn-outline text-center">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary inline-flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    `Criar ${TERMINOLOGY.REPOSITORY}`
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="card space-y-4">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Boas práticas</h2>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
              <li>Prefira nomes claros que indiquem o escopo da {TERMINOLOGY.REPOSITORY.toLowerCase()}.</li>
              <li>Visibilidade governamental é útil quando somente equipes internas podem propor.</li>
              <li>
                Ajuste o quorum e assinaturas conforme a relevância do assunto para evitar spam.
              </li>
              <li>Permitir propostas públicas aumenta o engajamento da comunidade.</li>
              <li>Guarde a justificativa da configuração para auditorias futuras.</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}

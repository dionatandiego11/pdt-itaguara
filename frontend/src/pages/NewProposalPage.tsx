import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Info, Loader2, Sparkles } from 'lucide-react'
import { apiClient } from '@/services/api'
import { Repository } from '@/types/repository'

const proposalTypes = [
  { value: 'amendment', label: 'Emenda a lei existente' },
  { value: 'new_law', label: 'Nova lei' },
  { value: 'repeal', label: 'Revogação' },
  { value: 'budget_alteration', label: 'Alteração orçamentária' },
]

interface ProposalForm {
  repositoryId: string
  proposalType: string
  title: string
  summary: string
  fullText: string
}

export function NewProposalPage() {
  const navigate = useNavigate()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<ProposalForm>({
    repositoryId: '',
    proposalType: proposalTypes[0].value,
    title: '',
    summary: '',
    fullText: '',
  })

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const data = await apiClient.getRepositories()
        setRepositories(data)
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, repositoryId: String(data[0].id) }))
        }
      } catch (repoError) {
        console.error('Erro ao carregar repositórios', repoError)
        setError('Não foi possível carregar os repositórios.')
      } finally {
        setLoadingRepos(false)
      }
    }

    fetchRepos()
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const branchName = useMemo(() => {
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
    return `feature/${slug || 'nova-proposta'}`
  }, [form.title])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.repositoryId) {
      setError('Escolha o repositório para vincular a proposta.')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.createProposal(form.repositoryId, {
        title: form.title,
        summary: form.summary,
        justification: form.summary || form.fullText.slice(0, 120),
        full_text: form.fullText,
        type: form.proposalType,
        branch_name: branchName,
        target_branch: 'main',
      })
      setSuccess('Proposta criada com sucesso! Redirecionando...')
      setTimeout(() => navigate('/proposals'), 1200)
    } catch (submitError) {
      console.error('Erro ao criar proposta', submitError)
      const message =
        submitError instanceof Error ? submitError.message : 'Não foi possível criar a proposta.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <Link to="/proposals" className="text-primary-600 hover:underline">
                Voltar para Propostas
              </Link>
            </p>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-9 h-9 text-primary-600" />
              Nova Proposta
            </h1>
            <p className="text-gray-600 mt-2">
              Preencha os campos essenciais para registrar sua proposta de maneira objetiva.
            </p>
          </div>
          <FileText className="hidden md:block w-12 h-12 text-primary-500" />
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded border border-green-200 bg-green-50 text-green-700 p-3 text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
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
                    Não há repositórios disponíveis.{' '}
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
                  <label className="block text-sm font-medium text-gray-700">Tipo de Proposta</label>
                  <select
                    name="proposalType"
                    value={form.proposalType}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    {proposalTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
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
                  placeholder="Ex: Atualização do Plano Diretor Municipal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Resumo executivo</label>
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  className="input-field"
                  rows={4}
                  placeholder="Descreva o objetivo e o impacto em linguagem simples."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Texto completo</label>
                <textarea
                  name="fullText"
                  value={form.fullText}
                  onChange={handleChange}
                  className="input-field"
                  rows={10}
                  placeholder="Inclua o texto legal completo, anexos ou detalhamentos."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Branch será criada automaticamente como {branchName}.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Link to="/proposals" className="btn-outline text-center">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingRepos ||
                    repositories.length === 0 ||
                    !form.repositoryId
                  }
                  className="btn-primary inline-flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Criar proposta'
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="card space-y-4">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Diretrizes rápidas</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Escolha o repositório que representa a lei, programa ou plano relacionado.</li>
              <li>Use o resumo para explicar o objetivo em linguagem acessível.</li>
              <li>O texto completo deve refletir o conteúdo legal ou a alteração proposta.</li>
              <li>A justificativa é gerada a partir do resumo, então mantenha-o claro e direto.</li>
              <li>
                A branch do Git é criada automaticamente; não é necessário preencher informações técnicas.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}

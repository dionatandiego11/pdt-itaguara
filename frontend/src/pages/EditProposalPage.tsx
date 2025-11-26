import { useEffect, useState, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/services/api'
import { Proposal } from '@/types/proposal'

export function EditProposalPage() {
  const { proposalId } = useParams<{ proposalId: string }>()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [form, setForm] = useState({
    title: '',
    summary: '',
    justification: '',
    full_text: '',
    branch_name: '',
    target_branch: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!proposalId) return
      try {
        const data = await apiClient.getProposalById(proposalId)
        setProposal(data)
        setForm({
          title: data.title,
          summary: data.summary,
          justification: data.justification,
          full_text: data.full_text,
          branch_name: data.branch_name,
          target_branch: data.target_branch,
        })
      } catch (err) {
        console.error('Erro ao carregar proposta', err)
        setError('Não foi possível carregar a proposta.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [proposalId])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!proposalId) return
    setSaving(true)
    setError(null)
    try {
      await apiClient.updateProposal(Number(proposalId), form)
      navigate(`/proposals/${proposalId}`)
    } catch (err) {
      console.error('Erro ao atualizar proposta', err)
      setError('Não foi possível atualizar a proposta.')
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

  if (!proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-600">{error || 'Proposta não encontrada.'}</p>
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
          <Link to={`/proposals/${proposal.id}`} className="text-primary-600 hover:underline">
            Voltar para detalhes
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Editar Proposta</h1>

        {error && (
          <div className="rounded border border-danger-200 bg-danger-50 p-3 text-danger-700 text-sm">
            {error}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-medium text-gray-700">Resumo</label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                className="input-field"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Justificativa</label>
              <textarea
                name="justification"
                value={form.justification}
                onChange={handleChange}
                className="input-field"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Texto completo</label>
              <textarea
                name="full_text"
                value={form.full_text}
                onChange={handleChange}
                className="input-field"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input
                  type="text"
                  name="branch_name"
                  value={form.branch_name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch alvo</label>
                <input
                  type="text"
                  name="target_branch"
                  value={form.target_branch}
                  onChange={handleChange}
                  className="input-field"
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

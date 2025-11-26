import { useState, useEffect } from 'react'
import { Plus, Search, AlertTriangle, Filter, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Issue, IssuePriority, IssueStatus } from '@/types/issue'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/context/authStore'

export function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { user } = useAuthStore()

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    try {
      const data = await apiClient.getIssues()
      setIssues(data)
    } catch (error) {
      console.error('Erro ao carregar demandas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (issueId: number) => {
    if (!window.confirm('Tem certeza que deseja apagar esta demanda?')) return
    try {
      await apiClient.deleteIssue(issueId)
      setIssues((prev) => prev.filter((issue) => issue.id !== issueId))
    } catch (error) {
      console.error('Erro ao apagar demanda:', error)
    }
  }

  const priorities: IssuePriority[] = ['low', 'medium', 'high', 'urgent']
  const priorityLabels: Record<IssuePriority, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente',
  }

  const statusList: IssueStatus[] = ['open', 'in_progress', 'resolved', 'closed', 'duplicate']
  const statusLabels: Record<IssueStatus, string> = {
    open: 'Aberta',
    in_progress: 'Em andamento',
    resolved: 'Resolvida',
    closed: 'Fechada',
    duplicate: 'Duplicada',
  }

  const getPriorityColor = (priority: IssuePriority) => {
    const colors: Record<IssuePriority, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-primary-100 text-primary-700',
      high: 'badge-warning',
      urgent: 'badge-danger',
    }
    return colors[priority] || 'badge-primary'
  }

  const canDelete = (issue: Issue) =>
    !!user && (user.is_superuser || issue.author_id === user.id)

  const normalizedSearch = searchTerm.toLowerCase()
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(normalizedSearch) ||
      issue.description.toLowerCase().includes(normalizedSearch)
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter
    return matchesSearch && matchesPriority && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900">Demandas</h1>
            <Link to="/issues/new" className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nova Demanda
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar demandas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Todas as prioridades</option>
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">Todos os status</option>
                {statusList.map((status) => (
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
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12 card">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Nenhuma demanda encontrada</p>
            <Link to="/issues/new" className="btn-primary">
              Criar primeira demanda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 block"
                    >
                      {issue.title}
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{issue.description}</p>
                    <div className="flex items-center space-x-2 text-sm">
                      {(issue.tags || []).map((tag) => (
                        <span key={tag} className="badge-primary">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 text-sm">
                    <span className={`badge ${getPriorityColor(issue.priority)}`}>
                      {priorityLabels[issue.priority]}
                    </span>
                    <span className="text-xs text-gray-500">{statusLabels[issue.status]}</span>
                    <span className="text-xs text-gray-500">💬 {issue.comments_count}</span>
                    {canDelete(issue) && (
                      <button
                        onClick={() => handleDelete(issue.id)}
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

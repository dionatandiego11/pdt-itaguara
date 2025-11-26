import type React from 'react'
import { useEffect, useMemo, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/context/authStore'
import { apiClient } from '@/services/api'
import { User } from '@/types/auth'
import { AdminActivity, AdminMetrics } from '@/types/admin'
import { Repository } from '@/types/repository'
import { Proposal, ProposalStatus } from '@/types/proposal'
import { Issue, IssuePriority, IssueStatus } from '@/types/issue'
import {
  Loader2,
  Shield,
  Users,
  FileText,
  Github,
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  Plus,
  X,
  Eye,
  Mail,
  UserCheck,
  Activity,
  Lock,
  Ban,
  LogIn,
  AlertCircle,
} from 'lucide-react'

const ACCESS_LEVELS = [
  {
    value: 'REGISTERED',
    label: 'Registrado',
    description: 'Pode comentar, abrir demandas e assinar propostas.',
  },
  {
    value: 'FILIADO',
    label: 'Filiado',
    description: 'Participa de votações e pode criar propostas.',
  },
  {
    value: 'SPECIAL',
    label: 'Especial',
    description: 'Moderadores ou gestores de políticas públicas.',
  },
]

const PROPOSAL_STATUSES: ProposalStatus[] = [
  'draft',
  'discussion',
  'awaiting_review',
  'threshold_reached',
  'voting',
  'approved',
  'rejected',
  'withdrawn',
]

const ISSUE_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved', 'closed', 'duplicate']
const ISSUE_PRIORITIES: IssuePriority[] = ['low', 'medium', 'high', 'urgent']
const REPOSITORY_VISIBILITIES: Array<Repository['visibility']> = ['public', 'private', 'government']

const MAIN_ADMIN_EMAIL = 'admin@civicgit.org'

const LEVEL_FROM_NUMBER: Record<number, string> = {
  0: 'REGISTERED',
  1: 'REGISTERED',
  2: 'FILIADO',
  3: 'SPECIAL',
}

const normalizeLevel = (value: string | number | undefined) => {
  if (typeof value === 'number') {
    return LEVEL_FROM_NUMBER[value] ?? 'REGISTERED'
  }
  return typeof value === 'string' ? value : 'REGISTERED'
}

type AdminTab = 'dashboard' | 'users' | 'repositories' | 'proposals' | 'issues' | 'settings' | 'audit'

interface NewUserForm {
  username: string
  email: string
  password: string
  full_name: string
  level: string
}

export function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [activity, setActivity] = useState<AdminActivity | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [loadingProposals, setLoadingProposals] = useState(true)
  const [loadingIssues, setLoadingIssues] = useState(true)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [savingRepoId, setSavingRepoId] = useState<number | null>(null)
  const [savingProposalId, setSavingProposalId] = useState<number | null>(null)
  const [savingIssueId, setSavingIssueId] = useState<number | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [deletingRepoId, setDeletingRepoId] = useState<number | null>(null)
  const [deletingProposalId, setDeletingProposalId] = useState<number | null>(null)
  const [deletingIssueId, setDeletingIssueId] = useState<number | null>(null)
  const [edits, setEdits] = useState<Record<number, Partial<User>>>({})
  const [repoEdits, setRepoEdits] = useState<Record<number, Partial<Repository>>>({})
  const [proposalEdits, setProposalEdits] = useState<Record<number, Partial<Proposal>>>({})
  const [issueEdits, setIssueEdits] = useState<Record<number, Partial<Issue>>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [repoFilter, setRepoFilter] = useState('')
  const [proposalFilter, setProposalFilter] = useState('')
  const [issueFilter, setIssueFilter] = useState('')
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState<number | null>(null)
  const [showRepoDetails, setShowRepoDetails] = useState<number | null>(null)
  const [showProposalDetails, setShowProposalDetails] = useState<number | null>(null)
  const [showIssueDetails, setShowIssueDetails] = useState<number | null>(null)
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    level: 'REGISTERED',
  })
  const STATUS_OPTIONS = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'desligado', label: 'Desligado' },
    { value: 'Usuário', label: 'Usuário' },
    { value: 'filiado', label: 'Filiado' },
    { value: 'Admin', label: 'Admin' },
  ]

  useEffect(() => {
    if (!isLoading && (!user || !user.is_superuser)) {
      navigate('/')
      return
    }

    const load = async () => {
      try {
        const [metricsData, usersData, reposData, proposalsData, issuesData, activityData] =
          await Promise.all([
            apiClient.getAdminMetrics(),
            apiClient.getUsers(),
            apiClient.getAdminRepositories().catch(() => []),
            apiClient.getAdminProposals().catch(() => []),
            apiClient.getAdminIssues().catch(() => []),
            apiClient.getAdminActivity().catch(() => null),
          ])

        setMetrics(metricsData)
        setUsers(
          usersData.map((u) => ({
            ...u,
            level: normalizeLevel(u.level),
          })),
        )
        setRepositories(reposData)
        setProposals(proposalsData)
        setIssues(issuesData)
        setActivity(
          activityData ?? {
            last_admin_login: null,
            new_users_week: 0,
            new_repositories_week: 0,
          },
        )
      } catch (err) {
        console.error('Falha ao carregar painel administrativo', err)
        setError('Não foi possível carregar as informações administrativas.')
      } finally {
        setLoadingUsers(false)
        setLoadingRepos(false)
        setLoadingProposals(false)
        setLoadingIssues(false)
      }
    }

    if (user?.is_superuser) {
      load()
    }
  }, [user, isLoading, navigate])

  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.full_name ?? '').toLowerCase().includes(term),
    )
  }, [users, filter])

  const deriveStatus = (u: User, pending: Partial<User>) => {
    const isActive = pending.is_active ?? u.is_active
    const isAdmin = pending.is_superuser ?? u.is_superuser
    const level = normalizeLevel(pending.level ?? u.level)

    if (!isActive) return 'desligado'
    if (isAdmin) return 'Admin'
    if (level === 'FILIADO') return 'filiado'
    if (level === 'REGISTERED') return 'Usuário'
    return 'ativo'
  }

  const applyStatusChange = (userId: number, current: User, value: string) => {
    const updates: Partial<User> = {}
    switch (value) {
      case 'desligado':
        updates.is_active = false
        break
      case 'Admin':
        updates.is_active = true
        updates.is_superuser = true
        break
      case 'filiado':
        updates.is_active = true
        updates.is_superuser = false
        updates.level = 'FILIADO'
        break
      case 'Usuário':
        updates.is_active = true
        updates.is_superuser = false
        updates.level = 'REGISTERED'
        break
      case 'ativo':
      default:
        updates.is_active = true
        break
    }

    setEdits((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        ...updates,
      },
    }))
  }

  const filteredRepositories = useMemo(() => {
    const term = repoFilter.trim().toLowerCase()
    if (!term) return repositories
    return repositories.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        (r.description ?? '').toLowerCase().includes(term) ||
        r.owner?.username?.toLowerCase().includes(term) ||
        r.owner?.full_name?.toLowerCase().includes(term),
    )
  }, [repositories, repoFilter])

  const filteredProposals = useMemo(() => {
    const term = proposalFilter.trim().toLowerCase()
    if (!term) return proposals
    return proposals.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        (p.summary ?? '').toLowerCase().includes(term),
    )
  }, [proposals, proposalFilter])

  const filteredIssues = useMemo(() => {
    const term = issueFilter.trim().toLowerCase()
    if (!term) return issues
    return issues.filter(
      (i) =>
        i.title.toLowerCase().includes(term) ||
        (i.description ?? '').toLowerCase().includes(term),
    )
  }, [issues, issueFilter])

  const lastAdminLoginText = useMemo(() => {
    if (!activity?.last_admin_login) return 'Sem registros'
    const date = new Date(activity.last_admin_login)
    if (Number.isNaN(date.getTime())) return 'Sem registros'
    return date.toLocaleString('pt-BR')
  }, [activity])

  const handleEditChange = (userId: number, field: keyof User, value: any) => {
    setEdits((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }))
  }

  const handleSaveUser = async (userId: number) => {
    const pending = edits[userId]
    if (!pending || Object.keys(pending).length === 0) return

    setSavingUserId(userId)
    try {
      console.log('Enviando atualização de usuário:', { userId, pending })
      const updated = await apiClient.updateUser(userId, pending)
      console.log('Resposta da atualização:', updated)

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...updated, level: normalizeLevel(updated.level) } : u,
        ),
      )

      setEdits((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })

      setSuccess('Usuário atualizado com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err)
      console.error('Erro detalhado:', err.response?.data)
      setError(err.response?.data?.detail || 'Não foi possível atualizar o usuário.')
    } finally {
      setSavingUserId(null)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário? Esta ação é irreversível.')) return

    setDeletingUserId(userId)
    try {
      await apiClient.deleteUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setSuccess('Usuário deletado com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao deletar usuário', err)
      setError(err.response?.data?.detail || 'Não foi possível deletar o usuário.')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleDeleteRepository = async (repoId: number) => {
    if (!confirm('Tem certeza que deseja deletar este repositório? Esta ação é irreversível.')) return

    setDeletingRepoId(repoId)
    try {
      await apiClient.deleteRepository(repoId)
      setRepositories((prev) => prev.filter((r) => r.id !== repoId))
      setSuccess('Repositório deletado com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao deletar repositório', err)
      setError(err.response?.data?.detail || 'Não foi possível deletar o repositório.')
    } finally {
      setDeletingRepoId(null)
    }
  }

  const handleDeleteProposal = async (proposalId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta proposta? Esta ação é irreversível.')) return

    setDeletingProposalId(proposalId)
    try {
      await apiClient.deleteProposal(proposalId)
      setProposals((prev) => prev.filter((p) => p.id !== proposalId))
      setSuccess('Proposta deletada com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao deletar proposta', err)
      setError(err.response?.data?.detail || 'Não foi possível deletar a proposta.')
    } finally {
      setDeletingProposalId(null)
    }
  }

  const handleDeleteIssue = async (issueId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta demanda? Esta ação é irreversível.')) return

    setDeletingIssueId(issueId)
    try {
      await apiClient.deleteIssue(issueId)
      setIssues((prev) => prev.filter((i) => i.id !== issueId))
      setSuccess('Demanda deletada com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao deletar demanda', err)
      setError(err.response?.data?.detail || 'Não foi possível deletar a demanda.')
    } finally {
      setDeletingIssueId(null)
    }
  }

  const startEditingRepository = (repo: Repository) => {
    setRepoEdits((prev) => ({
      ...prev,
      [repo.id]: {
        name: repo.name,
        description: repo.description ?? '',
        visibility: repo.visibility,
      },
    }))
  }

  const handleRepositoryEditChange = (repoId: number, field: keyof Repository, value: any) => {
    setRepoEdits((prev) => ({
      ...prev,
      [repoId]: {
        ...(prev[repoId] ?? {}),
        [field]: value,
      },
    }))
  }

  const cancelRepositoryEdit = (repoId: number) => {
    setRepoEdits((prev) => {
      const next = { ...prev }
      delete next[repoId]
      return next
    })
  }

  const handleSaveRepositoryEdits = async (repoId: number) => {
    const pending = repoEdits[repoId]
    if (!pending) return

    setSavingRepoId(repoId)
    try {
      const updated = await apiClient.adminUpdateRepository(repoId, pending)
      setRepositories((prev) => prev.map((repo) => (repo.id === repoId ? updated : repo)))
      cancelRepositoryEdit(repoId)
      setSuccess('Repositório atualizado com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao atualizar repositório', err)
      setError(err.response?.data?.detail || 'Não foi possível atualizar o repositório.')
    } finally {
      setSavingRepoId(null)
    }
  }

  const startEditingProposal = (proposal: Proposal) => {
    setProposalEdits((prev) => ({
      ...prev,
      [proposal.id]: {
        title: proposal.title,
        summary: proposal.summary,
        status: proposal.status,
      },
    }))
  }

  const handleProposalEditChange = (proposalId: number, field: keyof Proposal, value: any) => {
    setProposalEdits((prev) => ({
      ...prev,
      [proposalId]: {
        ...(prev[proposalId] ?? {}),
        [field]: value,
      },
    }))
  }

  const cancelProposalEdit = (proposalId: number) => {
    setProposalEdits((prev) => {
      const next = { ...prev }
      delete next[proposalId]
      return next
    })
  }

  const handleSaveProposalEdits = async (proposalId: number) => {
    const pending = proposalEdits[proposalId]
    if (!pending) return

    setSavingProposalId(proposalId)
    try {
      const updated = await apiClient.adminUpdateProposal(proposalId, pending)
      setProposals((prev) =>
        prev.map((proposal) => (proposal.id === proposalId ? updated : proposal)),
      )
      cancelProposalEdit(proposalId)
      setSuccess('Proposta atualizada com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao atualizar proposta', err)
      setError(err.response?.data?.detail || 'Não foi possível atualizar a proposta.')
    } finally {
      setSavingProposalId(null)
    }
  }

  const startEditingIssue = (issue: Issue) => {
    setIssueEdits((prev) => ({
      ...prev,
      [issue.id]: {
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
      },
    }))
  }

  const handleIssueEditChange = (issueId: number, field: keyof Issue, value: any) => {
    setIssueEdits((prev) => ({
      ...prev,
      [issueId]: {
        ...(prev[issueId] ?? {}),
        [field]: value,
      },
    }))
  }

  const cancelIssueEdit = (issueId: number) => {
    setIssueEdits((prev) => {
      const next = { ...prev }
      delete next[issueId]
      return next
    })
  }

  const handleSaveIssueEdits = async (issueId: number) => {
    const pending = issueEdits[issueId]
    if (!pending) return

    setSavingIssueId(issueId)
    try {
      const updated = await apiClient.adminUpdateIssue(issueId, pending)
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? updated : issue)))
      cancelIssueEdit(issueId)
      setSuccess('Demanda atualizada com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao atualizar demanda', err)
      setError(err.response?.data?.detail || 'Não foi possível atualizar a demanda.')
    } finally {
      setSavingIssueId(null)
    }
  }

  const handleNewUserSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newUserForm.username || !newUserForm.email || !newUserForm.password) {
      setError('Por favor, preencha os campos obrigatórios: usuário, email e senha.')
      return
    }

    try {
      const created = await apiClient.createUser({
        username: newUserForm.username,
        email: newUserForm.email,
        password: newUserForm.password,
        full_name: newUserForm.full_name || undefined,
      })
      setUsers((prev) => [{ ...created, level: normalizeLevel(created.level) }, ...prev])
      setNewUserForm({
        username: '',
        email: '',
        password: '',
        full_name: '',
        level: 'REGISTERED',
      })
      setShowNewUserForm(false)
      setSuccess('Usuário criado com sucesso!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Erro ao criar usuário', err)
      const errorMsg = err.response?.data?.detail || 'Erro ao criar usuário'
      setError(errorMsg)
    }
  }

  if (isLoading || !user || !user.is_superuser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    )
  }

  const selectedUser = showUserDetails ? users.find((u) => u.id === showUserDetails) : null

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg border border-gray-200">
          <Shield className="w-8 h-8 text-primary-600" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
            <p className="text-gray-600 text-sm">
              Gerencie usuários, conteúdo e configurações do sistema
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-red-900 hover:text-red-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 p-4 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">{success}</div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-900 hover:text-green-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[
              { id: 'dashboard' as const, label: 'Dashboard', icon: Activity },
              { id: 'users' as const, label: 'Usuários', icon: Users },
              { id: 'repositories' as const, label: 'Repositórios', icon: Github },
              { id: 'proposals' as const, label: 'Propostas', icon: FileText },
              { id: 'issues' as const, label: 'Demandas', icon: AlertTriangle },
              { id: 'settings' as const, label: 'Configurações', icon: Settings },
              { id: 'audit' as const, label: 'Auditoria', icon: Lock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  icon={<Github className="w-6 h-6" />}
                  label="Repositórios"
                  value={metrics?.repositories ?? 0}
                  color="blue"
                />
                <StatCard
                  icon={<FileText className="w-6 h-6" />}
                  label="Propostas"
                  value={metrics?.proposals ?? 0}
                  color="green"
                />
                <StatCard
                  icon={<AlertTriangle className="w-6 h-6" />}
                  label="Demandas"
                  value={metrics?.issues ?? 0}
                  color="orange"
                />
                <StatCard
                  icon={<Users className="w-6 h-6" />}
                  label="Usuários"
                  value={metrics?.users ?? 0}
                  color="purple"
                />
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Atividade Recente
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <LogIn className="w-4 h-4 mt-0.5 text-primary-600" />
                      <span>
                        Ultimo login de admin: <strong>{lastAdminLoginText}</strong>
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 mt-0.5 text-green-600" />
                      <span>
                        Novos usuarios nesta semana:{' '}
                        <strong>{activity?.new_users_week ?? 0}</strong>
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Github className="w-4 h-4 mt-0.5 text-blue-600" />
                      <span>
                        Novos repositorios nesta semana:{' '}
                        <strong>{activity?.new_repositories_week ?? 0}</strong>
                      </span>
                    </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Saúde do Sistema
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Conectado
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cache (Redis)</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Ativo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Gerenciar Usuários</h2>
                    <p className="text-sm text-gray-600">Total de usuários: {users.length}</p>
                  </div>
                  <button
                    onClick={() => setShowNewUserForm(!showNewUserForm)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                  </button>
                </div>

                {/* New User Form */}
                {showNewUserForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Criar Novo Usuário</h3>
                    <form onSubmit={handleNewUserSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Usuário"
                          value={newUserForm.username}
                          onChange={(e) =>
                            setNewUserForm({ ...newUserForm, username: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newUserForm.email}
                          onChange={(e) =>
                            setNewUserForm({ ...newUserForm, email: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Nome Completo (opcional)"
                          value={newUserForm.full_name}
                          onChange={(e) =>
                            setNewUserForm({ ...newUserForm, full_name: e.target.value })
                          }
                          className="input-field"
                        />
                        <input
                          type="password"
                          placeholder="Senha"
                          value={newUserForm.password}
                          onChange={(e) =>
                            setNewUserForm({ ...newUserForm, password: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="btn-primary">
                          Criar Usuário
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewUserForm(false)}
                          className="btn-outline"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Filtrar por nome, email ou usuário..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input-field w-full"
                  />
                </div>

                {/* Users Table */}
                {loadingUsers ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    Nenhum usuário encontrado.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Usuário
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Nível
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((u) => {
                          const pending = edits[u.id] || {}
                          const disableAdminChange = u.email === MAIN_ADMIN_EMAIL
                          return (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {u.username}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                              <td className="px-4 py-3 text-sm">
                                <select
                                  className="input-field text-sm w-32"
                                  value={pending.level ?? u.level}
                                  onChange={(e) =>
                                    handleEditChange(u.id, 'level', e.target.value)
                                  }
                                  disabled={disableAdminChange}
                                >
                                  {ACCESS_LEVELS.map((level) => (
                                    <option key={level.value} value={level.value}>
                                      {level.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <select
                                  className="input-field text-sm w-36"
                                  value={deriveStatus(u, pending)}
                                  onChange={(e) => applyStatusChange(u.id, u, e.target.value)}
                                  disabled={disableAdminChange}
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-sm flex gap-2">
                                <button
                                  onClick={() =>
                                    setShowUserDetails(
                                      showUserDetails === u.id ? null : u.id,
                                    )
                                  }
                                  className="btn-outline text-xs px-2 py-1"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                {edits[u.id] && !disableAdminChange && (
                                  <button
                                    onClick={() => handleSaveUser(u.id)}
                                    disabled={savingUserId === u.id}
                                    className="btn-primary text-xs px-2 py-1"
                                  >
                                    {savingUserId === u.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      'Salvar'
                                    )}
                                  </button>
                                )}
                                {!disableAdminChange && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={deletingUserId === u.id}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors disabled:opacity-50"
                                  >
                                    {deletingUserId === u.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* User Details Modal */}
              {selectedUser && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Detalhes do Usuário
                    </h3>
                    <button
                      onClick={() => setShowUserDetails(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usuário
                      </label>
                      <p className="text-gray-900 font-medium">{selectedUser.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedUser.full_name || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nível de Acesso
                      </label>
                      <p className="text-gray-900 font-medium">
                        {
                          ACCESS_LEVELS.find((l) => l.value === selectedUser.level)
                            ?.label
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        {selectedUser.is_active ? (
                          <>
                            <UserCheck className="w-4 h-4 text-green-600" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 text-red-600" />
                            Inativo
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Privilégio
                      </label>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        {selectedUser.is_superuser ? (
                          <>
                            <Shield className="w-4 h-4 text-purple-600" />
                            Administrador
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-gray-400" />
                            Usuário Regular
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Repositories Tab */}
          {activeTab === 'repositories' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Gerenciar Repositórios
                  </h2>
                  <p className="text-sm text-gray-600">Total: {repositories.length}</p>
                </div>
                <input
                  type="text"
                  placeholder="Filtrar por nome ou proprietário..."
                  value={repoFilter}
                  onChange={(e) => setRepoFilter(e.target.value)}
                  className="input-field w-full md:w-80"
                />
              </div>

              {loadingRepos ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
              ) : filteredRepositories.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Nenhum repositório encontrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRepositories.map((repo) => {
                    const repoDraft = repoEdits[repo.id]
                    return (
                      <div
                        key={repo.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Github className="w-4 h-4 text-gray-400" />
                              <h3 className="font-semibold text-gray-900">
                                {repo.name}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  repo.visibility === 'public'
                                    ? 'bg-blue-100 text-blue-800'
                                    : repo.visibility === 'private'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {repo.visibility}
                              </span>
                              {!repo.is_active && (
                                <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                                  Inativo
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {repo.description || 'Sem descrição'}
                            </p>
                            <div className="flex gap-6 text-sm text-gray-500 mt-3">
                              <span>📝 {repo.proposals_count} propostas</span>
                              <span>🐛 {repo.issues_count} demandas</span>
                              <span>👥 {repo.contributors_count} contribuidores</span>
                            </div>
                            {repo.owner && (
                              <div className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Proprietário:</span>{' '}
                                {repo.owner.full_name || repo.owner.username}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditingRepository(repo)}
                              disabled={!!repoDraft}
                              className="btn-outline text-xs px-2 py-1 disabled:opacity-50"
                            >
                              <Settings className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                setShowRepoDetails(
                                  showRepoDetails === repo.id ? null : repo.id,
                                )
                              }
                              className="btn-outline text-xs px-2 py-1"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteRepository(repo.id)}
                              disabled={deletingRepoId === repo.id}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors disabled:opacity-50"
                            >
                              {deletingRepoId === repo.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {repoDraft && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="font-semibold text-gray-700 text-sm">
                                  Nome
                                </label>
                                <input
                                  className="input-field mt-1"
                                  value={repoDraft.name ?? ''}
                                  onChange={(e) =>
                                    handleRepositoryEditChange(
                                      repo.id,
                                      'name',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700 text-sm">
                                  Visibilidade
                                </label>
                                <select
                                  className="input-field mt-1"
                                  value={repoDraft.visibility ?? repo.visibility}
                                  onChange={(e) =>
                                    handleRepositoryEditChange(
                                      repo.id,
                                      'visibility',
                                      e.target.value,
                                    )
                                  }
                                >
                                  {REPOSITORY_VISIBILITIES.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="font-semibold text-gray-700 text-sm">
                                  Descrição
                                </label>
                                <textarea
                                  className="input-field mt-1"
                                  rows={3}
                                  value={repoDraft.description ?? ''}
                                  onChange={(e) =>
                                    handleRepositoryEditChange(
                                      repo.id,
                                      'description',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                type="button"
                                className="btn-primary flex items-center justify-center gap-2"
                                onClick={() => handleSaveRepositoryEdits(repo.id)}
                                disabled={savingRepoId === repo.id}
                              >
                                {savingRepoId === repo.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                  </>
                                ) : (
                                  'Salvar alterações'
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn-outline"
                                onClick={() => cancelRepositoryEdit(repo.id)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {!repoDraft && showRepoDetails === repo.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-semibold text-gray-700">ID</label>
                                <p className="text-gray-600">{repo.id}</p>
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700">
                                  Slug
                                </label>
                                <p className="text-gray-600">{repo.slug}</p>
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700">
                                  Tipo
                                </label>
                                <p className="text-gray-600">{repo.type}</p>
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700">
                                  Quórum
                                </label>
                                <p className="text-gray-600">
                                  {repo.quorum_percentage}%
                                </p>
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700">
                                  Período de Votação
                                </label>
                                <p className="text-gray-600">
                                  {repo.voting_period_days} dias
                                </p>
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700">
                                  Mín. de Assinaturas
                                </label>
                                <p className="text-gray-600">
                                  {repo.min_signatures_for_voting}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Proposals Tab */}
          {activeTab === 'proposals' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Gerenciar Propostas
                  </h2>
                  <p className="text-sm text-gray-600">Total: {proposals.length}</p>
                </div>
                <input
                  type="text"
                  placeholder="Filtrar por título..."
                  value={proposalFilter}
                  onChange={(e) => setProposalFilter(e.target.value)}
                  className="input-field w-full md:w-80"
                />
              </div>

              {loadingProposals ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Nenhuma proposta encontrada.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProposals.map((proposal) => {
                    const proposalDraft = proposalEdits[proposal.id]
                    return (
                      <div
                        key={proposal.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <h3 className="font-semibold text-gray-900">
                                {proposal.title}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  proposal.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : proposal.status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : proposal.status === 'voting'
                                        ? 'bg-blue-100 text-blue-800'
                                        : proposal.status === 'draft'
                                          ? 'bg-gray-100 text-gray-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {proposal.status}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                                {proposal.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {proposal.summary || 'Sem resumo'}
                            </p>
                            <div className="text-sm text-gray-500 mt-2">
                              <span>Nº {proposal.number}</span> • Branch:{' '}
                              {proposal.branch_name}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditingProposal(proposal)}
                              disabled={!!proposalDraft}
                              className="btn-outline text-xs px-2 py-1 disabled:opacity-50"
                            >
                              <Settings className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                setShowProposalDetails(
                                  showProposalDetails === proposal.id
                                    ? null
                                    : proposal.id,
                                )
                              }
                              className="btn-outline text-xs px-2 py-1"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteProposal(proposal.id)}
                              disabled={deletingProposalId === proposal.id}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors disabled:opacity-50"
                            >
                              {deletingProposalId === proposal.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {proposalDraft && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="font-semibold text-gray-700 text-sm">
                                  Título
                                </label>
                                <input
                                  className="input-field mt-1"
                                  value={proposalDraft.title ?? ''}
                                  onChange={(e) =>
                                    handleProposalEditChange(
                                      proposal.id,
                                      'title',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700 text-sm">
                                  Status
                                </label>
                                <select
                                  className="input-field mt-1"
                                  value={proposalDraft.status ?? proposal.status}
                                  onChange={(e) =>
                                    handleProposalEditChange(
                                      proposal.id,
                                      'status',
                                      e.target.value,
                                    )
                                  }
                                >
                                  {PROPOSAL_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="font-semibold text-gray-700 text-sm">
                                  Resumo
                                </label>
                                <textarea
                                  className="input-field mt-1"
                                  rows={3}
                                  value={proposalDraft.summary ?? ''}
                                  onChange={(e) =>
                                    handleProposalEditChange(
                                      proposal.id,
                                      'summary',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                type="button"
                                className="btn-primary flex items-center justify-center gap-2"
                                onClick={() => handleSaveProposalEdits(proposal.id)}
                                disabled={savingProposalId === proposal.id}
                              >
                                {savingProposalId === proposal.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                  </>
                                ) : (
                                  'Salvar alterações'
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn-outline"
                                onClick={() => cancelProposalEdit(proposal.id)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {!proposalDraft && showProposalDetails === proposal.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="space-y-2 text-sm">
                              <div>
                                <label className="font-semibold text-gray-700">
                                  Justificação
                                </label>
                                <p className="text-gray-600">
                                  {proposal.justification || 'Não informada'}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="font-semibold text-gray-700">
                                    Branch Alvo
                                  </label>
                                  <p className="text-gray-600">
                                    {proposal.target_branch}
                                  </p>
                                </div>
                                <div>
                                  <label className="font-semibold text-gray-700">
                                    Repositório
                                  </label>
                                  <p className="text-gray-600">
                                    ID: {proposal.repository_id}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Issues Tab */}
          {activeTab === 'issues' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Gerenciar Demandas
                  </h2>
                  <p className="text-sm text-gray-600">Total: {issues.length}</p>
                </div>
                <input
                  type="text"
                  placeholder="Filtrar por título..."
                  value={issueFilter}
                  onChange={(e) => setIssueFilter(e.target.value)}
                  className="input-field w-full md:w-80"
                />
              </div>

              {loadingIssues ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Nenhuma demanda encontrada.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIssues.map((issue) => {
                    const issueDraft = issueEdits[issue.id]
                    return (
                      <div
                        key={issue.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-gray-400" />
                              <h3 className="font-semibold text-gray-900">
                                {issue.title}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  issue.status === 'open'
                                    ? 'bg-blue-100 text-blue-800'
                                    : issue.status === 'in_progress'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : issue.status === 'resolved'
                                        ? 'bg-green-100 text-green-800'
                                        : issue.status === 'closed'
                                          ? 'bg-gray-100 text-gray-800'
                                          : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {issue.status}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  issue.priority === 'urgent'
                                    ? 'bg-red-100 text-red-800'
                                    : issue.priority === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : issue.priority === 'medium'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {issue.priority}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                                {issue.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {(issue.description ?? '').substring(0, 100)}...
                            </p>
                            <div className="flex gap-6 text-sm text-gray-500 mt-2">
                              <span>#{issue.number}</span>
                              <span>💬 {issue.comments_count} comentários</span>
                              <span>😊 {issue.reactions_count} reações</span>
                            </div>
                            {issue.location && (
                              <div className="text-sm text-gray-600 mt-1">
                                📍 {issue.location}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditingIssue(issue)}
                              disabled={!!issueDraft}
                              className="btn-outline text-xs px-2 py-1 disabled:opacity-50"
                            >
                              <Settings className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                setShowIssueDetails(
                                  showIssueDetails === issue.id ? null : issue.id,
                                )
                              }
                              className="btn-outline text-xs px-2 py-1"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteIssue(issue.id)}
                              disabled={deletingIssueId === issue.id}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors disabled:opacity-50"
                            >
                              {deletingIssueId === issue.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {issueDraft && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="font-semibold text-gray-700 text-sm">
                                  Título
                                </label>
                                <input
                                  className="input-field mt-1"
                                  value={issueDraft.title ?? ''}
                                  onChange={(e) =>
                                    handleIssueEditChange(
                                      issue.id,
                                      'title',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700 text-sm">
                                  Status
                                </label>
                                <select
                                  className="input-field mt-1"
                                  value={issueDraft.status ?? issue.status}
                                  onChange={(e) =>
                                    handleIssueEditChange(
                                      issue.id,
                                      'status',
                                      e.target.value,
                                    )
                                  }
                                >
                                  {ISSUE_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="font-semibold text-gray-700 text-sm">
                                  Prioridade
                                </label>
                                <select
                                  className="input-field mt-1"
                                  value={issueDraft.priority ?? issue.priority}
                                  onChange={(e) =>
                                    handleIssueEditChange(
                                      issue.id,
                                      'priority',
                                      e.target.value,
                                    )
                                  }
                                >
                                  {ISSUE_PRIORITIES.map((priority) => (
                                    <option key={priority} value={priority}>
                                      {priority}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="font-semibold text-gray-700 text-sm">
                                  Descrição
                                </label>
                                <textarea
                                  className="input-field mt-1"
                                  rows={3}
                                  value={issueDraft.description ?? ''}
                                  onChange={(e) =>
                                    handleIssueEditChange(
                                      issue.id,
                                      'description',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                type="button"
                                className="btn-primary flex items-center justify-center gap-2"
                                onClick={() => handleSaveIssueEdits(issue.id)}
                                disabled={savingIssueId === issue.id}
                              >
                                {savingIssueId === issue.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                  </>
                                ) : (
                                  'Salvar alterações'
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn-outline"
                                onClick={() => cancelIssueEdit(issue.id)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {!issueDraft && showIssueDetails === issue.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="space-y-2 text-sm">
                              <div>
                                <label className="font-semibold text-gray-700">
                                  Descrição Completa
                                </label>
                                <p className="text-gray-600">{issue.description}</p>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="font-semibold text-gray-700">
                                    Repositório
                                  </label>
                                  <p className="text-gray-600">
                                    ID: {issue.repository_id}
                                  </p>
                                </div>
                                <div>
                                  <label className="font-semibold text-gray-700">
                                    Criada em
                                  </label>
                                  <p className="text-gray-600">
                                    {new Date(issue.created_at).toLocaleDateString(
                                      'pt-BR',
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <label className="font-semibold text-gray-700">
                                    Atualizada em
                                  </label>
                                  <p className="text-gray-600">
                                    {new Date(issue.updated_at).toLocaleDateString(
                                      'pt-BR',
                                    )}
                                  </p>
                                </div>
                              </div>
                              {issue.estimated_cost && (
                                <div>
                                  <label className="font-semibold text-gray-700">
                                    Custo Estimado
                                  </label>
                                  <p className="text-gray-600">
                                    R${' '}
                                    {issue.estimated_cost.toLocaleString('pt-BR')}
                                  </p>
                                </div>
                              )}
                              {issue.budget_category && (
                                <div>
                                  <label className="font-semibold text-gray-700">
                                    Categoria Orçamentária
                                  </label>
                                  <p className="text-gray-600">
                                    {issue.budget_category}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Configurações do Sistema
                </h2>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Modo de Manutenção
                        </h3>
                        <p className="text-sm text-gray-600">
                          Desabilita acesso de usuários comuns ao sistema
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="cursor-pointer" />
                        <span className="text-sm font-medium text-gray-700">
                          Ativar
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Permitir Registros
                        </h3>
                        <p className="text-sm text-gray-600">
                          Permite que novos usuários se registrem no sistema
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Ativar
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Auditoria de Ações
                        </h3>
                        <p className="text-sm text-gray-600">
                          Registra todas as ações do admin no sistema
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Ativar
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          OAuth2 Gov.br
                        </h3>
                        <p className="text-sm text-gray-600">
                          Habilita login via Gov.br para autenticação
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Ativar
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Log de Auditoria
              </h2>
              <div className="text-center py-10 text-gray-500">
                Registro de auditoria será exibido aqui em breve.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

function StatCard({ icon, value, label, color = 'blue' }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  } as const

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4">
      <div className={`rounded-full ${colors[color]} p-3`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}




import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Pencil, User, BookCopy, ShieldCheck, Users2, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/services/api'
import { Repository, RepositoryVisibility } from '@/types/repository'
import { useAuthStore } from '@/context/authStore'
import { TERMINOLOGY } from '@/utils/terminology'

const visibilityLabels: Record<RepositoryVisibility, string> = {
  public: 'Público',
  private: 'Privado',
  government: 'Governamental',
  affiliates_only: 'Apenas Filiados',
}

const visibilityClass: Record<RepositoryVisibility, string> = {
  public: 'badge-primary',
  private: 'bg-gray-100 text-gray-700',
  government: 'badge-warning',
  affiliates_only: 'bg-purple-100 text-purple-800',
}

export function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuthStore()

  useEffect(() => {
    loadRepositories()
  }, [])

  const loadRepositories = async () => {
    try {
      const data = await apiClient.getRepositories()
      setRepositories(data)
    } catch (error) {
      console.error('Erro ao carregar repositórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (repoId: number) => {
    if (!window.confirm(`Tem certeza que deseja apagar esta ${TERMINOLOGY.REPOSITORY}?`)) return
    try {
      await apiClient.deleteRepository(repoId)
      setRepositories((prev) => prev.filter((repo) => repo.id !== repoId))
    } catch (error) {
      console.error('Erro ao apagar repositório:', error)
    }
  }

  const canManage = (repo: Repository) =>
    !!user && (user.is_superuser || repo.owner_id === user.id)

  const filteredRepositories = repositories.filter((repo) =>
    [repo.name, repo.description].some((text) =>
      text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const canCreate = user && (user.is_verified || user.is_superuser)

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{TERMINOLOGY.REPOSITORIES}</h1>
            <p className="text-gray-600 mt-2">
              Explore e participe das discussões nas {TERMINOLOGY.REPOSITORIES.toLowerCase()}.
            </p>
          </div>
          {canCreate && (
            <Link to="/repositories/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {TERMINOLOGY.NEW_REPOSITORY}
            </Link>
          )}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Buscar ${TERMINOLOGY.REPOSITORIES.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepositories.length === 0 ? (
              <div className="col-span-full text-center py-12 card">
                <p className="text-gray-600">Nenhuma {TERMINOLOGY.REPOSITORY.toLowerCase()} encontrada.</p>
              </div>
            ) : (
              filteredRepositories.map((repo) => (
                <div key={repo.id} className="card hover:shadow-lg transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                      <BookCopy className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`badge ${visibilityClass[repo.visibility]}`}>
                        {visibilityLabels[repo.visibility]}
                      </span>
                      {canManage(repo) && (
                        <div className="flex gap-2 text-xs">
                          <Link
                            to={`/repositories/${repo.id}/edit`}
                            className="text-blue-600 flex items-center gap-1 hover:text-blue-700"
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(repo.id)}
                            className="text-red-600 flex items-center gap-1 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                            Apagar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link to={`/repositories/${repo.id}`} className="block">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {repo.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {repo.description || 'Sem descrição.'}
                    </p>
                  </Link>

                  {/* Informações do Proprietário */}
                  {repo.owner && (
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">{repo.owner.full_name || repo.owner.username}</span>
                        {repo.owner.full_name && <span className="text-gray-500"> @{repo.owner.username}</span>}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      {repo.proposals_count} propostas
                    </span>
                    <span className="flex items-center gap-1">
                      <Users2 className="w-4 h-4" />
                      {repo.contributors_count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

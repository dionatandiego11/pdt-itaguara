import { useEffect, useState, FormEvent } from 'react'
import { useAuthStore } from '@/context/authStore'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/services/api'
import { Loader2, Save, UserCircle2 } from 'lucide-react'

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const { isLoading } = useAuthStore()
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      })
    }
  }, [user])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const updated = await apiClient.updateProfile(form)
      setUser(updated)
      setMessage('Perfil atualizado com sucesso!')
    } catch (submitError) {
      console.error('Erro ao atualizar perfil', submitError)
      const msg =
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível atualizar o perfil.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center gap-4">
          <UserCircle2 className="w-12 h-12 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil de {user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações básicas</h2>

          {message && (
            <div className="mb-4 rounded-lg border border-success-200 bg-success-50 p-3 text-success-700 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 p-3 text-danger-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome completo</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="input-field"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Biografia</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="input-field"
                rows={4}
                placeholder="Conte um pouco sobre você e sua atuação cívica."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Localização</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Cidade, estado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary inline-flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

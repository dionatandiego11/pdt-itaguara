import { useState } from 'react'
import { useAuthStore } from '@/context/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Phone } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    passwordConfirm: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const usernameTrimmed = formData.username.trim()
    const usernameValid = /^[a-zA-Z0-9_]{3,}$/.test(usernameTrimmed)
    if (!usernameValid) {
      setError('Usuário deve ter pelo menos 3 caracteres e conter apenas letras, números ou _')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('As senhas não correspondem')
      return
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres')
      return
    }

    try {
      await register(usernameTrimmed, formData.email, formData.password, formData.fullName)
      navigate('/')
    } catch (err) {
      const detail = (err as any)?.response?.data?.detail
      setError(detail || (err instanceof Error ? err.message : 'Erro ao registrar'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CivicGit</h1>
            <p className="text-gray-600">Crie sua conta</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Joao Silva"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="seu_usuario"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? 'Criando conta...' : 'Registrar'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

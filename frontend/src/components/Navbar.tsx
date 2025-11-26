import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Home,
  FileText,
  Vote,
  AlertCircle,
  LogOut,
  Menu,
  X,
  Github,
  User,
  Shield,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = useMemo(() => {
    const links = [
      { path: '/', label: 'Home', icon: Home },
      { path: '/repositories', label: 'Repositórios', icon: Github },
      { path: '/proposals', label: 'Propostas', icon: FileText },
      { path: '/voting', label: 'Votação', icon: Vote },
      { path: '/issues', label: 'Demandas', icon: AlertCircle },
    ]
    return links
  }, [user])

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-gradient-pdt sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Branding */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="font-bold text-lg bg-gradient-pdt bg-clip-text text-transparent">📋</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-sm text-white leading-none">PDT Itaguara</span>
              <span className="text-xs text-blue-100">Democracia Direta</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-all ${
                  isActive(path)
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.is_superuser && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-amber-400 text-amber-900 hover:bg-amber-300 transition-colors flex items-center space-x-1 shadow-md"
                  >
                    <Shield className="w-4 h-4" />
                    <span>ADM</span>
                  </Link>
                )}
                <Link to="/profile" className="text-white hover:text-blue-100 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={() => logout()} className="text-white hover:text-blue-100 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
                {user && <span className="text-sm font-medium text-blue-50">{user.username}</span>}
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-md text-sm font-medium text-primary-600 bg-white hover:bg-blue-50 transition-colors">
                  Entrar
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-md text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors shadow-md">
                  Registrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 bg-primary-600">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all ${
                  isActive(path)
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-white border-opacity-20">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white hover:bg-opacity-10 flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white hover:bg-opacity-10 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-white border-opacity-20">
                <Link to="/login" className="block px-4 py-2 rounded-md text-center text-sm font-medium text-primary-600 bg-white hover:bg-blue-50">
                  Entrar
                </Link>
                <Link to="/register" className="block px-4 py-2 rounded-md text-center text-sm font-medium bg-accent-500 text-white hover:bg-accent-600">
                  Registrar
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/context/authStore'
import { Link } from 'react-router-dom'
import { ArrowRight, Github, Vote, FileText, AlertCircle, Zap, Users, Shield, Lightbulb } from 'lucide-react'
import { apiClient } from '@/services/api'

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore()
  const [stats, setStats] = useState({
    proposals: 0,
    repositories: 0,
    votes: 0,
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const levelLabels: Record<string, string> = {
    ANONYMOUS: 'Anônimo',
    REGISTERED: 'Registrado',
    VERIFIED: 'Verificado',
    SPECIAL: 'Especial',
  }

  useEffect(() => {
    if (!isAuthenticated) return

    const loadStats = async () => {
      setLoadingStats(true)
      try {
        const [proposals, repositories] = await Promise.all([
          apiClient.getProposals(),
          apiClient.getRepositories(),
        ])
        const proposalsByUser = user
          ? proposals.filter((proposal) => proposal.author_id === user.id).length
          : proposals.length

        setStats({
          proposals: proposalsByUser,
          repositories: repositories.length,
          votes: user?.contributions_count ?? 0,
        })
      } catch (error) {
        console.error('Erro ao carregar métricas do usuário', error)
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [isAuthenticated, user])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-pdt opacity-90"></div>
        <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h100v100H0z" fill="none" stroke="white" stroke-width="0.5"/%3E%3C/svg%3E")'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-white bg-opacity-20 rounded-full">
              <span className="text-white text-sm font-semibold">🇧🇷 Plataforma de Democracia Direta</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              PDT Itaguara<br />
              <span className="text-accent-300">Gestão Participativa</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Plataforma de participação cidadã com controle de versão. Crie propostas, vote com segurança e participe das decisões que impactam sua comunidade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/proposals" className="px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-lg inline-flex items-center justify-center">
                    Explorar Propostas
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/repositories" className="px-8 py-4 bg-white bg-opacity-10 border-2 border-white text-white font-bold rounded-lg hover:bg-opacity-20 transition-all inline-flex items-center justify-center">
                    Meus Repositórios
                    <Github className="ml-2 w-5 h-5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-lg inline-flex items-center justify-center">
                    Começar Agora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/login" className="px-8 py-4 bg-white bg-opacity-10 border-2 border-white text-white font-bold rounded-lg hover:bg-opacity-20 transition-all">
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Funcionalidades Principais
          </h2>
          <p className="text-xl text-gray-600">
            Ferramentas poderosas para democracia participativa e transparência
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Github className="w-8 h-8" />}
            title="Repositórios"
            description="Organize propostas e documentos em repositórios temáticos com controle de versão"
            color="from-blue-500 to-primary-600"
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="Propostas"
            description="Crie e gerencie propostas de forma colaborativa com histórico completo"
            color="from-primary-600 to-accent-500"
          />
          <FeatureCard
            icon={<Vote className="w-8 h-8" />}
            title="Votação Segura"
            description="Sistema de votação com auditoria, transparência e rastreabilidade total"
            color="from-accent-500 to-green-500"
          />
          <FeatureCard
            icon={<AlertCircle className="w-8 h-8" />}
            title="Demandas"
            description="Registre problemas e sugestões da comunidade de forma estruturada"
            color="from-orange-500 to-red-500"
          />
        </div>
      </section>

      {/* Additional Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard
              icon={<Zap className="w-8 h-8" />}
              title="Rápido e Eficiente"
              description="Interface intuitiva e responsiva para participar de qualquer lugar"
            />
            <BenefitCard
              icon={<Shield className="w-8 h-8" />}
              title="Seguro e Transparente"
              description="Criptografia de ponta a ponta e auditoria completa de todas as ações"
            />
            <BenefitCard
              icon={<Users className="w-8 h-8" />}
              title="Participativo"
              description="Construído para a comunidade por cidadãos engajados"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && (
        <section className="bg-gradient-pdt text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Bem-vindo, {user?.full_name || user?.username}! 👋
              </h2>
              <p className="text-xl text-blue-100">
                Você está logado como <span className="font-bold">{user?.username}</span> {' '}
                {user?.level && `(${levelLabels[user.level] || user.level})`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard
                number={loadingStats ? '...' : stats.proposals}
                label="Propostas Criadas"
                icon={<FileText className="w-6 h-6" />}
              />
              <StatCard
                number={loadingStats ? '...' : stats.votes}
                label="Votos Realizados"
                icon={<Vote className="w-6 h-6" />}
              />
              <StatCard
                number={loadingStats ? '...' : stats.repositories}
                label="Repositórios"
                icon={<Github className="w-6 h-6" />}
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-blue-50 rounded-2xl p-12">
          <Lightbulb className="w-16 h-16 text-primary-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Sua voz importa
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de cidadãos que já estão participando de decisões que impactam Itaguara
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 bg-gradient-pdt text-white font-bold rounded-lg hover:shadow-lg transition-all">
                Criar Conta Gratuitamente
              </Link>
              <Link to="/login" className="px-8 py-3 bg-white border-2 border-primary-600 text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-all">
                Fazer Login
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

type FeatureCardProps = {
  icon: ReactNode
  title: string
  description: string
  color: string
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden group">
      <div className={`h-1 bg-gradient-to-r ${color}`}></div>
      <div className="p-8">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

type BenefitCardProps = {
  icon: ReactNode
  title: string
  description: string
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

type StatCardProps = {
  number: string | number
  label: string
  icon: ReactNode
}

function StatCard({ number, label, icon }: StatCardProps) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <div className="text-5xl font-bold mb-3">{number}</div>
      <p className="text-blue-100 text-lg">{label}</p>
    </div>
  )
}

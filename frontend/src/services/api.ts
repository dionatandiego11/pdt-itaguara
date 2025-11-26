import axios, { AxiosInstance } from 'axios'
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth'
import { Repository } from '@/types/repository'
import { Proposal } from '@/types/proposal'
import { Issue } from '@/types/issue'
import { AdminActivity, AdminMetrics } from '@/types/admin'
import type { ActiveVotingSession, VoteChoice } from '@/types/voting'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    const response = await this.client.post('/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post('/v1/auth/register', data)
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/v1/auth/me')
    return response.data
  }

  async updateProfile(data: Partial<Pick<User, 'full_name' | 'bio' | 'location' | 'website'>>): Promise<User> {
    const response = await this.client.put<User>('/v1/users/me', data)
    return response.data
  }

  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/v1/users')
    return response.data
  }

  async updateUser(userId: number, data: Partial<Pick<User, 'full_name' | 'level' | 'bio' | 'location' | 'website' | 'is_active' | 'is_superuser'>>) {
    console.log('API: updateUser chamado com', { userId, data })
    const response = await this.client.put<User>(`/v1/users/${userId}`, data)
    console.log('API: resposta recebida', response.data)
    return response.data
  }

  async createUser(data: { username: string; email: string; password: string; full_name?: string }): Promise<User> {
    const response = await this.client.post<User>('/v1/users', data)
    return response.data
  }

  async deleteUser(userId: number): Promise<void> {
    await this.client.delete(`/v1/users/${userId}`)
  }

  async logout(): Promise<void> {
    await this.client.post('/v1/auth/logout')
  }

  // Repository endpoints
  async getRepositories(): Promise<Repository[]> {
    const response = await this.client.get<Repository[]>('/v1/repositories')
    return response.data
  }

  async getRepository(id: string | number): Promise<Repository> {
    const response = await this.client.get<Repository>(`/v1/repositories/${id}`)
    return response.data
  }

  async createRepository(data: Partial<Repository>): Promise<Repository> {
    const response = await this.client.post<Repository>('/v1/repositories', data)
    return response.data
  }

  async updateRepository(id: number, data: Partial<Repository>) {
    const response = await this.client.put<Repository>(`/v1/repositories/${id}`, data)
    return response.data
  }

  async deleteRepository(id: number) {
    await this.client.delete(`/v1/repositories/${id}`)
  }

  // Proposal endpoints
  async getProposals(params?: { repositoryId?: string | number; status?: string; search?: string }) {
    const response = await this.client.get<Proposal[]>('/v1/proposals', {
      params: {
        repository_id: params?.repositoryId,
        status: params?.status,
        search: params?.search,
      },
    })
    return response.data
  }

  async getProposalById(proposalId: string | number) {
    const response = await this.client.get<Proposal>(`/v1/proposals/${proposalId}`)
    return response.data
  }

  async createProposal(repositoryId: string, data: any) {
    const response = await this.client.post(`/v1/repositories/${repositoryId}/proposals`, data)
    return response.data
  }

  async updateProposal(proposalId: number, data: Partial<Proposal>) {
    const response = await this.client.put<Proposal>(`/v1/proposals/${proposalId}`, data)
    return response.data
  }

  async deleteProposal(proposalId: number) {
    await this.client.delete(`/v1/proposals/${proposalId}`)
  }

  // Vote endpoints
  async getActiveVotingSessions(): Promise<ActiveVotingSession[]> {
    const response = await this.client.get<ActiveVotingSession[]>('/v1/voting/sessions/active')
    return response.data
  }

  async vote(proposalId: string | number, option: VoteChoice) {
    const response = await this.client.post(`/v1/votes/proposals/${proposalId}/vote`, { option })
    return response.data
  }

  async getProposalVotes(proposalId: string) {
    const response = await this.client.get(`/v1/proposals/${proposalId}/votes`)
    return response.data
  }

  // Issue endpoints
  async getIssues(params?: {
    repositoryId?: string | number
    status?: string
    priority?: string
    search?: string
  }) {
    const response = await this.client.get<Issue[]>('/v1/issues', {
      params: {
        repository_id: params?.repositoryId,
        status: params?.status,
        priority: params?.priority,
        search: params?.search,
      },
    })
    return response.data
  }

  async getIssueById(issueId: number) {
    const response = await this.client.get<Issue>(`/v1/issues/${issueId}`)
    return response.data
  }

  async createIssue(data: any) {
    const response = await this.client.post<Issue>('/v1/issues', data)
    return response.data
  }

  async updateIssue(issueId: number, data: Partial<Issue>) {
    const response = await this.client.put<Issue>(`/v1/issues/${issueId}`, data)
    return response.data
  }

  async deleteIssue(issueId: number) {
    await this.client.delete(`/v1/issues/${issueId}`)
  }

  async getAdminRepositories(): Promise<Repository[]> {
    const response = await this.client.get<Repository[]>('/v1/admin/repositories')
    return response.data
  }

  async adminUpdateRepository(id: number, data: Partial<Repository>): Promise<Repository> {
    const response = await this.client.put<Repository>(`/v1/admin/repositories/${id}`, data)
    return response.data
  }

  async getAdminProposals(): Promise<Proposal[]> {
    const response = await this.client.get<Proposal[]>('/v1/admin/proposals')
    return response.data
  }

  async adminUpdateProposal(id: number, data: Partial<Proposal>): Promise<Proposal> {
    const response = await this.client.put<Proposal>(`/v1/admin/proposals/${id}`, data)
    return response.data
  }

  async getAdminIssues(): Promise<Issue[]> {
    const response = await this.client.get<Issue[]>('/v1/admin/issues')
    return response.data
  }

  async adminUpdateIssue(id: number, data: Partial<Issue>): Promise<Issue> {
    const response = await this.client.put<Issue>(`/v1/admin/issues/${id}`, data)
    return response.data
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    const response = await this.client.get<AdminMetrics>('/v1/admin/metrics')
    return response.data
  }

  async getAdminActivity(): Promise<AdminActivity> {
    const response = await this.client.get<AdminActivity>('/v1/admin/activity')
    return response.data
  }

  getClient() {
    return this.client
  }
}

export const apiClient = new ApiClient()

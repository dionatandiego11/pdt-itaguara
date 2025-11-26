import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/context/authStore'

// Components
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Pages
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { RepositoriesPage } from '@/pages/RepositoriesPage'
import { ProposalsPage } from '@/pages/ProposalsPage'
import { VotingPage } from '@/pages/VotingPage'
import { IssuesPage } from '@/pages/IssuesPage'
import { NewProposalPage } from '@/pages/NewProposalPage'
import { NewRepositoryPage } from '@/pages/NewRepositoryPage'
import { RepositoryDetailsPage } from '@/pages/RepositoryDetailsPage'
import { NewIssuePage } from '@/pages/NewIssuePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { EditRepositoryPage } from '@/pages/EditRepositoryPage'
import { ProposalDetailsPage } from '@/pages/ProposalDetailsPage'
import { EditProposalPage } from '@/pages/EditProposalPage'
import { IssueDetailsPage } from '@/pages/IssueDetailsPage'
import { EditIssuePage } from '@/pages/EditIssuePage'
import { AdminPage } from '@/pages/AdminPage'

// Styles
import '@/styles/index.css'

export function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repositories"
              element={
                <ProtectedRoute>
                  <RepositoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repositories/new"
              element={
                <ProtectedRoute>
                  <NewRepositoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repositories/:repositoryId"
              element={
                <ProtectedRoute>
                  <RepositoryDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repositories/:repositoryId/edit"
              element={
                <ProtectedRoute>
                  <EditRepositoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals"
              element={
                <ProtectedRoute>
                  <ProposalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/new"
              element={
                <ProtectedRoute>
                  <NewProposalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/:proposalId"
              element={
                <ProtectedRoute>
                  <ProposalDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/:proposalId/edit"
              element={
                <ProtectedRoute>
                  <EditProposalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voting"
              element={
                <ProtectedRoute>
                  <VotingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute>
                  <IssuesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues/new"
              element={
                <ProtectedRoute>
                  <NewIssuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues/:issueId"
              element={
                <ProtectedRoute>
                  <IssueDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues/:issueId/edit"
              element={
                <ProtectedRoute>
                  <EditIssuePage />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

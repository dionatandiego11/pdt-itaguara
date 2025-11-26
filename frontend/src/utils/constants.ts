export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const VOTING_OPTIONS = {
  YES: 'SIM',
  NO: 'NÃO',
  ABSTAIN: 'ABSTENÇÃO',
}

export const PROPOSAL_STATUS = {
  DRAFT: 'Rascunho',
  OPEN: 'Aberto',
  VOTING: 'Em Votação',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  MERGED: 'Mesclado',
}

export const ISSUE_PRIORITY = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const USER_LEVELS = {
  ANONYMOUS: 'Anônimo',
  REGISTERED: 'Registrado',
  VERIFIED: 'Verificado',
  SPECIAL: 'Especial',
}

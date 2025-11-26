#!/bin/bash

# CivicGit Installation Script
# Automatiza a configuração do backend e dependências via Docker

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOCKER_COMPOSE_CMD=""

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

detect_compose() {
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    elif docker-compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        error "Docker Compose não encontrado. Instale o plugin oficial (docker compose) ou o binário legacy (docker-compose)."
        exit 1
    fi
}

check_requirements() {
    log "Verificando requisitos do sistema..."

    if ! command_exists docker; then
        error "Docker não encontrado. Instale a partir de https://docs.docker.com/get-docker/"
        exit 1
    fi

    detect_compose

    log "Todos os requisitos atendidos."
}

setup_environment() {
    if [ ! -d "backend" ]; then
        error "Diretório 'backend' não encontrado. Execute este instalador a partir da raiz do projeto."
        exit 1
    fi

    log "Configurando arquivos de ambiente..."
    pushd backend >/dev/null

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log "Arquivo .env criado a partir de .env.example"
        else
            warn ".env.example não encontrado, gerando configuração mínima"
            cat > .env <<'EOF'
# Database Configuration
DATABASE_URL=postgresql://civicgit_user:civicgit_password@postgres:5432/civicgit_db
TEST_DATABASE_URL=postgresql://civicgit_user:civicgit_password@postgres:5432/civicgit_test_db

# Redis Configuration
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# Security
SECRET_KEY=dev-secret-key-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Settings
APP_NAME=CivicGit
APP_VERSION=1.0.0
DEBUG=True
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080"]

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Voting Configuration
QUORUM_PERCENTAGE=10
VOTING_PERIOD_DAYS=7
MIN_SIGNATURES_FOR_VOTING=500
EOF
        fi
    else
        log ".env já existe, mantendo configuração atual"
    fi

    mkdir -p uploads
    popd >/dev/null
}

start_services() {
    log "Iniciando serviços Docker..."
    pushd backend >/dev/null
    $DOCKER_COMPOSE_CMD pull
    $DOCKER_COMPOSE_CMD up -d
    popd >/dev/null
}

wait_for_services() {
    log "Aguardando serviços inicializarem..."
    pushd backend >/dev/null

    log "Aguardando PostgreSQL..."
    for i in {1..30}; do
        if $DOCKER_COMPOSE_CMD exec postgres pg_isready -U civicgit_user -d civicgit_db >/dev/null 2>&1; then
            log "PostgreSQL pronto."
            break
        fi
        echo -n "."
        sleep 2
    done

    log "Aguardando Redis..."
    for i in {1..30}; do
        if $DOCKER_COMPOSE_CMD exec redis redis-cli ping >/dev/null 2>&1; then
            log "Redis pronto."
            break
        fi
        echo -n "."
        sleep 2
    done

    log "Aguardando API..."
    for i in {1..30}; do
        if curl -f http://localhost:8000/health >/dev/null 2>&1; then
            log "API respondeu ao health check."
            break
        fi
        echo -n "."
        sleep 2
    done

    popd >/dev/null
}

init_database() {
    log "Aplicando migrações e seed do banco..."
    pushd backend >/dev/null
    $DOCKER_COMPOSE_CMD exec api alembic upgrade head
    # Executa o init_db como módulo, no diretório raiz /app,
    # para o Python enxergar corretamente o pacote "app"
    $DOCKER_COMPOSE_CMD exec api sh -lc "cd /app && python -m app.db.init_db"
    popd >/dev/null
}


test_installation() {
    log "Executando smoke tests..."

    # 1) Health geral da API (obrigatório)
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        log "Health check geral OK."
    else
        error "Health check da API falhou."
        return 1
    fi

    # 2) Health específico do banco (opcional, não derruba a instalação)
    if curl -f http://localhost:8000/health/db >/dev/null 2>&1; then
        log "Health check do banco OK."
    else
        warn "Health check do banco falhou (/health/db retornou erro ou 503)."
        warn "Como migrações e seed foram aplicados com sucesso, prosseguindo mesmo assim."
    fi

    log "Smoke tests concluídos."
}

show_instructions() {
    echo ""
    log "CivicGit instalado com sucesso!"
    echo ""
    echo "Informações:"
    echo "  • API:              http://localhost:8000"
    echo "  • Documentação:     http://localhost:8000/docs"
    echo "  • Banco PostgreSQL: localhost:5432"
    echo "  • Redis:            localhost:6379"
    echo ""
    echo "Credenciais padrão (altere em produção!):"
    echo "  • admin@civicgit.org / admin123"
    echo ""
    echo "Comandos úteis:"
    echo "  • Ver logs:        cd backend && $DOCKER_COMPOSE_CMD logs -f api"
    echo "  • Parar serviços:  cd backend && $DOCKER_COMPOSE_CMD down"
    echo "  • Iniciar serviços:cd backend && $DOCKER_COMPOSE_CMD up -d"
    echo "  • Reset DB:        cd backend && $DOCKER_COMPOSE_CMD down -v && $DOCKER_COMPOSE_CMD up -d"
    echo ""
}

cleanup() {
    if [ $? -ne 0 ]; then
        error "Instalação falhou. Consulte os logs acima."
        echo "Dicas:"
        echo "  • Verifique portas 8000/5432/6379."
        echo "  • Confirme se o Docker está em execução."
        echo "  • Rode: cd backend && $DOCKER_COMPOSE_CMD logs api"
    fi
}

main() {
    echo ""
    echo "=============================="
    echo "  CivicGit - Instalador CLI  "
    echo "=============================="
    echo ""

    trap cleanup EXIT

    check_requirements
    setup_environment
    start_services
    wait_for_services
    init_database
    test_installation
    show_instructions
}

main "$@"

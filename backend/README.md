# CivicGit Backend

Backend API para o CivicGit - Sistema de Democracia Direta com Versionamento

## 🚀 Tecnologias Utilizadas

- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e message broker
- **Celery** - Sistema de filas para tarefas assíncronas
- **Docker** - Containerização
- **JWT** - Autenticação via tokens

## 📋 Funcionalidades

### 🔐 Autenticação e Autorização
- Sistema de níveis de usuário (Anônimo, Registrado, Verificado, Especial)
- Integração com Gov.br (OAuth2)
- Tokens JWT com refresh
- Multi-factor authentication (MFA)

### 📂 Repositórios
- Criação de repositórios para jurisdições ou áreas de política
- Configurações personalizadas por repositório
- Sistema de permissões e visibilidade

### 📝 Propostas (Pull Requests)
- Criação de propostas de emenda
- Sistema de branches e merges
- Assinaturas e limiares configuráveis
- Ciclo de vida completo (rascunho → votação → resultado)

### 🐛 Issues (Demandas)
- Reporte de problemas e sugestões
- Sistema de comentários e threads
- Categorização e priorização
- Atribuição e acompanhamento

### 🗳️ Votação
- Múltiplos métodos de votação (simples, qualificada, ranqueada)
- Votação secreta com auditoria
- Sistema de quorum e limiares
- Proteção contra fraude

### 📊 Versionamento
- Controle de versão Git-like para leis
- Commits com autor e justificativa
- Visualização de diffs
- Sistema de blame/responsabilização

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Cliente     │    │      API        │    │   Banco de Dados│
│   (Frontend)    │◄──►│   (FastAPI)     │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cache/MQ      │
                       │     (Redis)     │
                       └─────────────────┘
```

### Microsserviços
- **IAM Service**: Identidade e acesso
- **Repository Service**: Gerenciamento de repositórios
- **Proposal Service**: Propostas e versionamento
- **Vote Service**: Sistema de votação
- **Notification Service**: Notificações e emails

## 🚦 Instalação Rápida

### Método 1: Instalação Automatizada (Recomendado)

```bash
# Após clonar o repositório, na raiz do projeto:
chmod +x install.sh
./install.sh
```

O script valida os pré-requisitos, aplica as migrações (`alembic upgrade head`) e popula dados básicos automaticamente.

### Método 2: Docker Compose

```bash
# Clonar repositório
git clone https://github.com/civicgit/civicgit.git
cd civicgit/backend

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar serviços
docker compose up -d

# Aplicar migrações e seed
docker compose exec api alembic upgrade head
docker compose exec api python app/db/init_db.py
```

### Método 3: Instalação Manual

```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
alembic upgrade head
python app/db/init_db.py

# Iniciar aplicação
uvicorn app.main:app --reload
```

## 📚 Documentação da API

A documentação interativa da API está disponível em:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Endpoints Principais

#### Autenticação
- `POST /api/v1/auth/login` - Login de usuário
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Informações do usuário

#### Repositórios
- `GET /api/v1/repositories` - Listar repositórios
- `POST /api/v1/repositories` - Criar repositório
- `GET /api/v1/repositories/{id}` - Detalhes do repositório

#### Propostas
- `GET /api/v1/proposals` - Listar propostas
- `POST /api/v1/proposals` - Criar proposta
- `GET /api/v1/proposals/{id}` - Detalhes da proposta
- `POST /api/v1/proposals/{id}/sign` - Assinar proposta

#### Issues
- `GET /api/v1/issues` - Listar issues
- `POST /api/v1/issues` - Criar issue
- `GET /api/v1/issues/{id}` - Detalhes da issue
- `POST /api/v1/issues/{id}/comments` - Adicionar comentário

#### Votação
- `POST /api/v1/votes` - Votar em uma proposta
- `GET /api/v1/votes/results/{proposal_id}` - Resultados da votação

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/civicgit

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-here

# OAuth2
GOV_BR_CLIENT_ID=your-gov-br-client-id
GOV_BR_CLIENT_SECRET=your-gov-br-client-secret

# Application
DEBUG=True
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080"]
```

### Configuração de Votação

```env
# Percentual mínimo para quorum
QUORUM_PERCENTAGE=10

# Período de votação em dias
VOTING_PERIOD_DAYS=7

# Mínimo de assinaturas para votação
MIN_SIGNATURES_FOR_VOTING=500
```

## Migrações de Banco

O schema é versionado com **Alembic** (arquivos em `app/db/migrations/`). Principais comandos:

```bash
# Aplicar migrations (ambiente local)
alembic upgrade head

# Criar nova migration
alembic revision --autogenerate -m "sua mensagem"
```

Executando via Docker Compose:

```bash
cd backend
docker compose exec api alembic upgrade head
```

## 🧪 Testes

```bash
# Rodar todos os testes
pytest

# Rodar apenas testes do backend
pytest backend/tests -q

# Rodar testes com cobertura
pytest --cov=app --cov-report=html

# Rodar testes específicos
pytest tests/test_auth.py
pytest tests/test_proposals.py
```

## 🚀 Deploy

### Produção com Docker

```bash
# Build para produção
docker compose -f docker-compose.prod.yml build

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

### Deploy com Kubernetes

```bash
# Aplicar configurações
kubectl apply -f k8s/

# Verificar status
kubectl get pods
kubectl get services
```

## 🔒 Segurança

### Práticas Implementadas
- Autenticação JWT com refresh tokens
- Hash de senhas com bcrypt
- Proteção contra SQL injection (SQLAlchemy ORM)
- Validação de entrada de dados (Pydantic)
- CORS configurável
- Rate limiting
- Auditoria de ações

### Recomendações para Produção
- Usar HTTPS sempre
- Configurar rate limiting
- Implementar WAF
- Manter dependências atualizadas
- Usar secrets management
- Configurar monitoring e alerting

## 📊 Monitoramento

### Health Checks
- `/health` - Status geral da aplicação
- `/health/db` - Status do banco de dados
- `/health/redis` - Status do Redis

### Métricas
- Tempo de resposta da API
- Taxa de erro
- Uso de recursos
- Número de usuários ativos
- Estatísticas de votação

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a AGPLv3 - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Comunidade

- [Discord](https://discord.gg/civicgit)
- [Forum](https://forum.civicgit.org)
- [GitHub Issues](https://github.com/civicgit/civicgit/issues)

## 🙏 Agradecimentos

- Comunidade FastAPI
- Contribuidores do SQLAlchemy
- Desenvolvedores do PostgreSQL
- Todos os contribuidores open source

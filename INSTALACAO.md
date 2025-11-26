# Tutorial de Instalação Local - CivicGit Backend

## 🚀 Guia Rápido de Instalação

Este tutorial irá guiá-lo através da instalação completa do backend do CivicGit em sua máquina local.

## 📋 Pré-requisitos

### Software Necessário:
- **Docker** 20.10 ou superior
- **Docker Compose** 2.0 ou superior
- **Git** para clonar o repositório
- **Python** 3.11+ (para desenvolvimento local)
- **PostgreSQL** 15+ (opcional, se não usar Docker)
- **Redis** 7+ (opcional, se não usar Docker)

### Sistema Operacional:
- **Windows**: Windows 10/11 com WSL2
- **macOS**: macOS 10.15 ou superior
- **Linux**: Ubuntu 20.04+, Fedora 35+, ou similar

### Recursos de Hardware:
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **CPU**: 2 cores ou mais
- **Espaço em Disco**: Mínimo 2GB livres

## 🔧 Instalação Passo a Passo

### 1. Clonar o Repositório

```bash
# Clone o repositório do CivicGit
git clone https://github.com/civicgit/civicgit.git
cd civicgit/backend
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env  # ou use seu editor preferido
```

**Configurações importantes no arquivo .env:**

```env
# Database Configuration
DATABASE_URL=postgresql://civicgit_user:civicgit_password@localhost:5432/civicgit_db

# Redis Configuration  
REDIS_URL=redis://localhost:6379/0

# Security (MUDE ESTE VALOR EM PRODUÇÃO!)
SECRET_KEY=sua-chave-secreta-super-segura-aqui

# Application Settings
DEBUG=True
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
```

### 3. Método 1: Instalação com Docker Compose (Recomendado)

#### Opção A: Instalação Completa com Todos os Serviços

```bash
# Iniciar todos os serviços (PostgreSQL, Redis, API, Celery)
docker-compose up -d

# Verificar se todos os serviços estão rodando
docker-compose ps

# Ver logs dos serviços
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
```

#### Opção B: Apenas Banco de Dados e Redis

```bash
# Iniciar apenas PostgreSQL e Redis
docker-compose up -d postgres redis

# Instalar dependências localmente
pip install -r requirements.txt

# Iniciar a API localmente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Método 2: Instalação Manual Sem Docker

#### Instalar PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (com Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Criar banco de dados:**
```bash
sudo -u postgres psql

# Dentro do PostgreSQL
CREATE DATABASE civicgit_db;
CREATE USER civicgit_user WITH PASSWORD 'civicgit_password';
GRANT ALL PRIVILEGES ON DATABASE civicgit_db TO civicgit_user;
\q
```

#### Instalar Redis

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS (com Homebrew):**
```bash
brew install redis
brew services start redis
```

#### Instalar Dependências Python

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

### 5. Inicializar o Banco de Dados

```bash
# Criar diretório de uploads
mkdir -p uploads

# Inicializar banco de dados
python app/db/init_db.py

# Ou use Alembic para migrations (opcional)
alembic upgrade head
```

### 6. Verificar Instalação

```bash
# Testar health check
curl http://localhost:8000/health

# Testar health check do banco de dados
curl http://localhost:8000/health/db

# Acessar documentação da API
open http://localhost:8000/docs
```

## 🧪 Testando a Aplicação

### 1. Criar Usuário de Teste

```bash
# Usar endpoint de registro
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpassword123",
    "full_name": "Test User"
  }'
```

### 2. Fazer Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpassword123"
```

### 3. Listar Repositórios

```bash
# Usar o token recebido do login
curl -X GET "http://localhost:8000/api/v1/repositories" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔧 Comandos Úteis

### Docker Compose

```bash
# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis

# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reconstruir imagens
docker-compose build

# Executar comandos dentro do container
docker-compose exec api python app/db/init_db.py
docker-compose exec api alembic upgrade head
```

### Desenvolvimento

```bash
# Rodar testes
pytest

# Rodar testes com cobertura
pytest --cov=app --cov-report=html

# Formatar código
black app/
isort app/

# Verificar tipos
mypy app/
```

## 🚨 Solução de Problemas

### Problema: Porta já em uso
```bash
# Verificar processos usando a porta 8000
lsof -i :8000

# Ou usar outra porta
docker-compose up -d
# Editar docker-compose.yml e mudar porta: "8001:8000"
```

### Problema: Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando
docker-compose logs postgres

# Resetar banco de dados
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose up -d
```

### Problema: Permissões de arquivo
```bash
# Ajustar permissões do diretório de uploads
sudo chown -R $USER:$USER uploads/
chmod -R 755 uploads/
```

## 📚 Próximos Passos

1. **Explorar a API**: Acesse http://localhost:8000/docs para ver todos os endpoints
2. **Criar Repositórios**: Use POST /api/v1/repositories para criar seus primeiros repositórios
3. **Criar Propostas**: Use POST /api/v1/proposals para criar propostas
4. **Configurar Frontend**: Instale o frontend para interface gráfica completa

## 🆘 Suporte

Se encontrar problemas durante a instalação:

1. Verifique os logs com `docker-compose logs`
2. Consulte a [documentação completa](documentacao.html)
3. Abra uma issue no repositório do GitHub
4. Entre em contato com a comunidade

## 📄 Licença

Este projeto está licenciado sob a AGPLv3. Veja o arquivo LICENSE para mais detalhes.
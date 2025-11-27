# CivicGit - Sistema de Democracia Direta

CivicGit é uma plataforma de democracia direta com versionamento de leis, inspirada no Git. O sistema permite que cidadãos proponham, debatam e votem em emendas legislativas de forma transparente e auditável.

## 🏗️ Arquitetura do Sistema

O projeto é dividido em duas partes principais:

*   **Backend**: Uma API robusta construída com **FastAPI**, utilizando **PostgreSQL** como banco de dados, **Redis** para cache/filas e **Celery** para tarefas assíncronas. Todo o ambiente é containerizado com **Docker**.
*   **Frontend**: Uma interface moderna e responsiva construída com **React**, **Vite** e **Tailwind CSS**.

## 🚀 Tecnologias Utilizadas

### Backend
*   **FastAPI**: Framework web de alta performance.
*   **PostgreSQL**: Banco de dados relacional.
*   **SQLAlchemy**: ORM para interação com o banco de dados.
*   **Redis**: Gerenciamento de cache e filas de mensagens.
*   **Celery**: Processamento de tarefas em segundo plano.
*   **Docker & Docker Compose**: Orquestração de containers.

### Frontend
*   **React**: Biblioteca para construção de interfaces.
*   **Vite**: Build tool rápida para desenvolvimento web.
*   **Tailwind CSS**: Framework CSS utilitário.
*   **TypeScript**: Superset JavaScript com tipagem estática.
*   **Zustand**: Gerenciamento de estado leve e rápido.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

*   [Docker](https://docs.docker.com/get-docker/) e Docker Compose
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   Git

## 🛠️ Instalação e Execução

### 1. Configuração do Backend

O backend possui um script de instalação automatizado que configura o ambiente Docker, banco de dados e variáveis de ambiente.

```bash
# Na raiz do projeto, execute:
./install.sh
```

Este script irá:
1.  Verificar os requisitos (Docker).
2.  Criar o arquivo `.env` (se não existir).
3.  Subir os containers (API, Banco, Redis).
4.  Aguardar os serviços estarem prontos.
5.  Rodar as migrações do banco de dados.
6.  Executar testes de verificação (health checks).

Após a instalação, a API estará disponível em `http://localhost:8000`.

### 2. Configuração do Frontend

Para configurar o frontend, utilize o script dedicado:

```bash
# Na raiz do projeto, execute:
./install-frontend.sh
```

Este script irá instalar todas as dependências do Node.js necessárias.

### 3. Executando a Aplicação

Com o backend rodando (via Docker), inicie o servidor de desenvolvimento do frontend:

```bash
cd frontend
npm run dev
```

Acesse a aplicação em seu navegador: `http://localhost:5173`

## 📚 Documentação da API

A documentação interativa da API (Swagger UI) pode ser acessada em:

*   **Swagger UI**: http://localhost:8000/docs
*   **ReDoc**: http://localhost:8000/redoc

## 📂 Estrutura do Projeto

```
pdt-itaguara/
├── backend/                # Código fonte da API (FastAPI)
│   ├── app/                # Aplicação principal
│   ├── docker-compose.yml  # Configuração dos containers
│   └── requirements.txt    # Dependências Python
├── frontend/               # Código fonte da Interface (React)
│   ├── src/                # Componentes, páginas e lógica
│   ├── package.json        # Dependências Node.js
│   └── vite.config.ts      # Configuração do Vite
├── install.sh              # Script de instalação do Backend
└── install-frontend.sh     # Script de instalação do Frontend
```

## 🔧 Comandos Úteis

### Backend (dentro da pasta `backend`)

*   **Ver logs da API**: `docker-compose logs -f api`
*   **Parar serviços**: `docker-compose down`
*   **Reiniciar serviços**: `docker-compose restart`
*   **Rodar testes**: `docker-compose exec api pytest`

### Frontend (dentro da pasta `frontend`)

*   **Iniciar servidor dev**: `npm run dev`
*   **Build para produção**: `npm run build`
*   **Linting**: `npm run lint`

## 🤝 Contribuição

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`).
3.  Faça o Commit de suas mudanças (`git commit -m 'Adiciona MinhaFeature'`).
4.  Faça o Push para a Branch (`git push origin feature/MinhaFeature`).
5.  Abra um Pull Request.

## 📄 Licença

Este projeto está licenciado sob a licença AGPLv3. Veja o arquivo `LICENSE` para mais detalhes.
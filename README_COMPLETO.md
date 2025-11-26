# Democracia Direta - Sistema Completo

Um sistema moderno de democracia direta com versionamento, permitindo que cidadãos participem ativamente nas decisões que impactam sua comunidade.

## 📋 Estrutura do Projeto

```
democracia-direta/
├── backend/              # FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
├── frontend/             # React TypeScript frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── documentacao.html     # Documentação HTML
├── INSTALACAO.md         # Guia de instalação
├── FRONTEND_GUIDE.md     # Guia específico do frontend
└── README.md            # Este arquivo
```

## 🚀 Tecnologias

### Backend
- **FastAPI** - Framework web moderno
- **Python 3.9+** - Linguagem de programação
- **PostgreSQL** - Banco de dados relacional
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validação de dados
- **JWT** - Autenticação segura
- **Docker** - Containerização

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Linguagem tipada
- **Vite** - Build tool rápido
- **TailwindCSS** - Estilização utilitária
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP

## 🎯 Funcionalidades Principais

### 🔐 Autenticação e Autorização
- ✅ Sistema de registro e login
- ✅ Autenticação via JWT tokens
- ✅ Níveis de usuário (Anônimo, Registrado, Verificado, Especial)
- ✅ Integração com Gov.br (OAuth2) - *em desenvolvimento*
- ✅ Multi-factor authentication - *planejado*

### 📂 Repositórios
- ✅ Criar repositórios para temas específicos
- ✅ Gerenciamento de permissões
- ✅ Configurações personalizadas
- ✅ Listagem e busca de repositórios

### 📝 Propostas (Pull Requests)
- ✅ Criar propostas de emenda
- ✅ Sistema de branches e merges
- ✅ Assinaturas e limiares configuráveis
- ✅ Ciclo de vida completo (rascunho → votação → resultado)
- ✅ Visualização de diffs

### 🗳️ Votação
- ✅ Interface de votação
- ✅ Múltiplos métodos de votação (simples, qualificada)
- ✅ Sistema de quorum
- ✅ Auditoria e transparência

### 🐛 Issues (Demandas)
- ✅ Reporte de problemas e sugestões
- ✅ Sistema de comentários
- ✅ Categorização e priorização
- ✅ Atribuição e acompanhamento

### 📊 Versionamento
- ✅ Controle de versão Git-like
- ✅ Commits com autor e justificativa
- ✅ Visualização de histórico
- ✅ Sistema de responsabilização

## 📦 Instalação Rápida

### Opção 1: Docker Compose (Recomendado)

```bash
cd backend
cp .env.example .env
docker-compose up -d
```

O sistema estará disponível em:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Documentação API: http://localhost:8000/docs

### Opção 2: Instalação Manual

#### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar migrations (se aplicável)
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🔧 Configuração

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/civicgit
SECRET_KEY=sua_chave_secreta_muito_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000/api
```

## 🧪 Desenvolvimento

### Rodando em Desenvolvimento

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Testando a API

A documentação interativa está disponível em: http://localhost:8000/docs

### Demo Credentials

```
Username: admin
Password: admin
```

## 📚 API Endpoints Principais

### Autenticação
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `GET /api/v1/auth/me` - Usuário atual
- `POST /api/v1/auth/logout` - Logout

### Repositórios
- `GET /api/v1/repositories` - Listar repositórios
- `POST /api/v1/repositories` - Criar repositório
- `GET /api/v1/repositories/{id}` - Obter repositório

### Propostas
- `GET /api/v1/repositories/{repo_id}/proposals` - Listar propostas
- `POST /api/v1/repositories/{repo_id}/proposals` - Criar proposta
- `GET /api/v1/proposals/{id}` - Obter proposta

### Votação
- `POST /api/v1/proposals/{id}/vote` - Votar
- `GET /api/v1/proposals/{id}/votes` - Obter votos

Ver documentação completa em `/docs` (Swagger UI)

## 🗂️ Estrutura de Pastas Importantes

### Backend
```
backend/app/
├── main.py              # Entrada da aplicação
├── api/v1/              # Rotas da API
├── core/                # Configurações centrais
├── models/              # Modelos de banco de dados
├── schemas/             # Schemas Pydantic
└── db/                  # Configurações de banco
```

### Frontend
```
frontend/src/
├── components/          # Componentes React
├── pages/               # Páginas da aplicação
├── services/            # Serviços de API
├── hooks/               # Custom hooks
├── context/             # State management
├── types/               # Tipos TypeScript
└── utils/               # Utilitários
```

## 📖 Documentação Detalhada

- **Backend**: Ver `backend/README.md`
- **Frontend**: Ver `frontend/README.md`
- **Guia de Instalação**: Ver `INSTALACAO.md`
- **Guia Frontend**: Ver `FRONTEND_GUIDE.md`

## 🚀 Deploy

### Vercel (Frontend)
```bash
cd frontend
npm run build
vercel deploy --prod
```

### Heroku (Backend)
```bash
heroku login
heroku create sua-app-backend
git push heroku main
```

### AWS / DigitalOcean
Ver documentação específica em `INSTALACAO.md`

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature: `git checkout -b feature/AmazingFeature`
3. Commit suas mudanças: `git commit -m 'Add AmazingFeature'`
4. Push para a branch: `git push origin feature/AmazingFeature`
5. Abra um Pull Request

## 📝 Roadmap

- [ ] Integração com Gov.br (OAuth2)
- [ ] Multi-factor authentication (MFA)
- [ ] Sistema de notificações em tempo real (WebSocket)
- [ ] Relatórios e analytics
- [ ] Suporte a múltiplos idiomas
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com blockchain para auditoria

## 🐛 Reportar Bugs

Para reportar bugs, abra uma issue no GitHub com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. real
- Informações do sistema (OS, navegador, Node.js version, etc.)

## ❓ FAQ

**P: Como faço para votar em uma proposta?**
R: Navegue até a seção "Votações" ou abra uma proposta em votação e clique no botão "Votar".

**P: Posso criar múltiplos repositórios?**
R: Sim, usuários registrados podem criar quantos repositórios precisarem.

**P: Como funciona o sistema de assinaturas?**
R: Propostas precisam atingir um número mínimo de assinaturas antes de entrar em votação.

**P: Os votos são secretos?**
R: Sim, o sistema suporta votação secreta com auditoria.

## 📞 Suporte

- 📧 Email: support@civicgit.org
- 💬 Comunidade: [Discord](https://discord.gg/civicgit)
- 🐛 Issues: [GitHub Issues](https://github.com/civicgit/civicgit/issues)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- Dionatan Diego
- Comunidade CivicGit

## 🙏 Agradecimentos

Obrigado a todos os contribuidores e à comunidade que torna este projeto possível!

---

**Última atualização**: Novembro 2024
**Status**: Em desenvolvimento ativo
**Versão**: 1.0.0-alpha

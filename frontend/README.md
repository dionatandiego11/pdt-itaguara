# Frontend - CivicGit

Frontend moderno e responsivo para a plataforma de Democracia Direta Digital.

## 🚀 Tecnologias

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderno e rápido
- **TailwindCSS** - Estilização utilitária
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 📁 Estrutura

```
frontend/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes React
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços de API
│   ├── hooks/           # Custom hooks
│   ├── context/         # Context e stores (Zustand)
│   ├── types/           # Tipos TypeScript
│   ├── styles/          # Estilos globais
│   ├── utils/           # Utilitários
│   ├── App.tsx          # Componente raiz
│   └── main.tsx         # Entrada da aplicação
├── package.json         # Dependências
├── tsconfig.json        # Configuração TypeScript
├── vite.config.ts       # Configuração Vite
├── tailwind.config.js   # Configuração Tailwind
└── README.md            # Este arquivo
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000/api
```

## 📄 Páginas Principais

- **Home** (`/`) - Página inicial
- **Login** (`/login`) - Autenticação
- **Register** (`/register`) - Registro
- **Repositories** (`/repositories`) - Gerenciamento de repositórios
- **Proposals** (`/proposals`) - Listagem e gerenciamento de propostas
- **Voting** (`/voting`) - Votações ativas
- **Issues** (`/issues`) - Demandas da comunidade

## 🎨 Tema e Cores

O projeto usa um sistema de cores baseado em Tailwind CSS com paleta customizada:

- **Primary**: Azul céu (#0ea5e9)
- **Success**: Verde (#16a34a)
- **Warning**: Âmbar (#d97706)
- **Danger**: Vermelho (#dc2626)

## 🔐 Autenticação

- JWT tokens armazenados em localStorage
- Interceptadores automáticos em requisições
- Renovação de tokens implementada
- Proteção de rotas com ProtectedRoute

## 📱 Responsividade

Todo o design é mobile-first e responsivo para:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

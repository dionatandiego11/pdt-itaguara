# Frontend Installation Guide for CivicGit

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation Steps

#### Option 1: Using Installation Script (Recommended)

```bash
# From the project root
chmod +x install-frontend.sh
./install-frontend.sh
```

#### Option 2: Manual Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env.local

# Edit .env.local and set your API URL
# VITE_API_URL=http://localhost:8000/api
```

## Development

### Start Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Variables

Create `.env.local` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api
```

## Building for Production

```bash
cd frontend
npm run build
npm run preview  # Preview the production build locally
```

The build output will be in the `dist` directory.

## Project Structure

```
frontend/
├── public/              # Static files (favicons, etc.)
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── Loading.tsx
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RepositoriesPage.tsx
│   │   ├── ProposalsPage.tsx
│   │   ├── VotingPage.tsx
│   │   └── IssuesPage.tsx
│   ├── services/        # API and external services
│   │   └── api.ts       # Axios client with interceptors
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useFetch.ts
│   ├── context/         # State management (Zustand stores)
│   │   └── authStore.ts
│   ├── types/           # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── repository.ts
│   │   ├── proposal.ts
│   │   ├── vote.ts
│   │   └── issue.ts
│   ├── utils/           # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── notifications.ts
│   ├── styles/          # Global styles
│   │   └── index.css
│   ├── App.tsx          # Root component with routing
│   └── main.tsx         # Application entry point
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── index.html           # HTML template
```

## Key Features

### 🔐 Authentication
- JWT-based authentication
- Automatic token refresh
- Protected routes
- Login/Register pages

### 📄 Pages
- **Home**: Landing page with features overview
- **Login**: User authentication
- **Register**: New user account creation
- **Repositories**: View and manage repositories
- **Proposals**: Create and vote on proposals
- **Voting**: Active voting sessions
- **Issues**: Community issues and demands

### 🎨 UI Components
- Responsive navbar
- Protected route wrapper
- Custom buttons with variants
- Badge components
- Modal component
- Loading states
- Skeleton loaders

### 📡 API Integration
- Axios client with interceptors
- Automatic auth token attachment
- Error handling and logging
- Base URL configuration

### 🎯 State Management
- Zustand for authentication state
- Custom hooks for data fetching
- Efficient re-rendering

## Available Scripts

```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## Styling

The project uses **TailwindCSS** for styling with custom configuration:

### Custom Colors
- Primary: Sky blue (`#0ea5e9`)
- Success: Green (`#16a34a`)
- Warning: Amber (`#d97706`)
- Danger: Red (`#dc2626`)

### Custom Classes
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outline button
- `.btn-danger` - Danger button
- `.card` - Card container
- `.input-field` - Input field styling
- `.badge` - Badge styling
- `.badge-primary`, `.badge-success`, etc. - Colored badges

## API Integration

The API client is configured in `src/services/api.ts`:

```typescript
import { apiClient } from '@/services/api'

// Login
await apiClient.login({ username, password })

// Get repositories
await apiClient.getRepositories()

// Get proposals
await apiClient.getProposals(repositoryId)

// Vote on proposal
await apiClient.vote(proposalId, option)
```

### Authentication Interceptors
- Automatically adds JWT token to requests
- Redirects to login on 401 errors
- Handles token refresh

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify deploy --prod
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Troubleshooting

### Port already in use
If port 5173 is already in use, Vite will automatically use the next available port.

### CORS errors
Ensure the backend API is configured to accept requests from the frontend URL.

### TypeScript errors
Run `npm run type-check` to identify and fix TypeScript issues.

### Module not found errors
Ensure all imports use the correct path aliases:
- `@/` - src directory
- `@components/` - src/components
- `@pages/` - src/pages
- `@services/` - src/services
- etc.

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests and linting: `npm run lint && npm run type-check`
4. Commit: `git commit -am 'Add my feature'`
5. Push: `git push origin feature/my-feature`
6. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub or contact the team.

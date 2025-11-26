#!/bin/bash

# Frontend Installation Script for CivicGit

echo "🚀 CivicGit Frontend Installation"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo "✓ npm version: $(npm -v)"

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✓ Frontend dependencies installed successfully!"

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Available commands:"
echo "  npm run dev         - Start development server"
echo "  npm run build       - Build for production"
echo "  npm run preview     - Preview production build"
echo "  npm run lint        - Run ESLint"
echo "  npm run type-check  - Run TypeScript type checking"
echo ""
echo "📝 Next steps:"
echo "  1. Configure .env.local with your API URL (see .env.example)"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Open http://localhost:5173 in your browser"
echo ""

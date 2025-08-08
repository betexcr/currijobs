#!/bin/bash

# Currijobs Setup Script
echo "🚀 Setting up Currijobs development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
EOF
    echo "⚠️  Please update .env with your Supabase credentials"
fi

# Setup Husky for git hooks
echo "🐕 Setting up Husky..."
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run format"

# Run initial lint and format
echo "🔧 Running initial lint and format..."
npm run lint:fix
npm run format

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Run 'npm start' to start the development server"
echo "3. Run 'npm test' to run tests"
echo "4. Run 'npm run lint' to check code quality" 
#!/bin/bash

# Household Spending Tracker - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Household Spending Tracker MVP..."
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env files
echo "⚙️  Creating environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "ℹ️  backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "ℹ️  frontend/.env already exists"
fi
echo ""

# Initialize database
echo "🗄️  Initializing database..."
npm run db:init --workspace=backend
echo "✅ Database initialized with default categories"
echo ""

# Success message
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start development servers: npm run dev:all"
echo "   2. Open http://localhost:5173 in your browser"
echo "   3. Upload sample-transactions.csv to test"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Implementation: MVP-IMPLEMENTATION.md"
echo "   - Full README: README.md"
echo ""
echo "Happy tracking! 🎉"

#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building the application..."
npm run build

# Pull environment variables from Vercel
echo "🔑 Pulling environment variables..."
vercel env pull .env.production.local

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:push

echo "✅ Deployment complete!" 
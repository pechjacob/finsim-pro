#!/bin/bash

# Restart Dev Servers Script
# Stops running dev servers and restarts them

echo "🔄 Restarting dev servers..."

# Kill existing dev servers (if running)
echo "  Stopping existing servers..."
pkill -f "vite.*3000" 2>/dev/null || true
pkill -f "docusaurus.*dev" 2>/dev/null || true

# Wait for processes to exit
sleep 2

# Start dev servers
echo "  Starting dev servers..."
npm run dev:all &

echo "✅ Dev servers restarting in background"
echo "   App: http://localhost:3000/finsim-pro/"
echo "   Docs: http://localhost:3001/finsim-pro/docs/"

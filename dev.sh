#!/bin/bash

# Development startup script for Saguaro Strikers

echo "🚀 Starting Saguaro Strikers in development mode..."

# Start backend in background
echo "📡 Starting backend API server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "📡 Backend:  http://localhost:5001"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

#!/bin/bash

# ReachInbox Setup Script
# This script sets up the ReachInbox Email Aggregator project

set -e

echo "🚀 Setting up ReachInbox Email Aggregator..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_status "Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    pnpm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_warning "Please edit backend/.env with your configuration!"
    fi
    
    cd ..
    print_success "Backend setup complete!"
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    pnpm install
    
    cd ..
    print_success "Frontend setup complete!"
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    # Start Docker services
    docker-compose up -d elasticsearch
    
    # Wait for Elasticsearch to be ready
    print_status "Waiting for Elasticsearch to be ready..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
            print_success "Elasticsearch is ready!"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Elasticsearch failed to start within 60 seconds"
        exit 1
    fi
}

# Create development scripts
create_scripts() {
    print_status "Creating development scripts..."
    
    # Backend start script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ReachInbox Backend..."
cd backend
pnpm run dev
EOF
    chmod +x start-backend.sh
    
    # Frontend start script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ReachInbox Frontend..."
cd frontend
pnpm run dev
EOF
    chmod +x start-frontend.sh
    
    # Full start script
    cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ReachInbox Email Aggregator..."

# Start infrastructure
echo "Starting infrastructure services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Start backend
echo "Starting backend..."
cd backend
pnpm run dev &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../frontend
pnpm run dev &
FRONTEND_PID=$!

echo "✅ ReachInbox is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "Elasticsearch: http://localhost:9200"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait

# Cleanup
echo "Stopping services..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
docker-compose down
EOF
    chmod +x start-all.sh
    
    print_success "Development scripts created!"
}

# Main setup function
main() {
    echo "🎯 ReachInbox Email Aggregator Setup"
    echo "=================================="
    echo ""
    
    # Check requirements
    check_requirements
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Start infrastructure
    start_infrastructure
    
    # Create development scripts
    create_scripts
    
    echo ""
    print_success "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit backend/.env with your email credentials and API keys"
    echo "2. Run './start-all.sh' to start the application"
    echo "3. Or run './start-backend.sh' and './start-frontend.sh' separately"
    echo ""
    echo "Access the application:"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:3001"
    echo "- Elasticsearch: http://localhost:9200"
    echo ""
    echo "For production deployment, use:"
    echo "docker-compose -f docker-compose.prod.yml up -d"
}

# Run main function
main "$@"

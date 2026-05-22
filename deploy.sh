#!/bin/bash

# Web Andalay Deployment Script
# Usage: ./deploy.sh [build|test|deploy|logs]

set -e

APP_NAME="web-andalay"
IMAGE_NAME="web-andalay"
PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to build Docker image
build_image() {
    print_header "Building Docker Image"
    
    # Navigate to project root
    cd ../..
    
    print_status "Building $IMAGE_NAME from apps/web-andalay/Dockerfile..."
    docker build -t $IMAGE_NAME -f apps/web-andalay/Dockerfile .
    
    print_status "Image built successfully!"
    docker images | grep $IMAGE_NAME
}

# Function to test the application
test_app() {
    print_header "Testing Application"
    
    # Stop existing container if running
    if docker ps -q -f name=$APP_NAME; then
        print_status "Stopping existing container..."
        docker stop $APP_NAME
        docker rm $APP_NAME
    fi
    
    # Run container
    print_status "Starting container for testing..."
    docker run -d \
        --name $APP_NAME \
        -p $PORT:3000 \
        -e NODE_ENV=production \
        -e NEXT_TELEMETRY_DISABLED=1 \
        -e PORT=3000 \
        -e HOSTNAME="0.0.0.0" \
        -e NEXT_PUBLIC_API_URL="http://localhost:3010/v1" \
        -e NEXT_PUBLIC_API_KEY="VsMYJzbrxrlvzLgSou+6SzwPVPk2rWotAFjuYga5rPHn1ODsxY2RP/i3PcWINEAK" \
        -e NEXT_PUBLIC_API_PUBLIC_KEY="77225ce5801cdeb9098880b621186ce3" \
        $IMAGE_NAME
    
    # Wait for app to start
    print_status "Waiting for application to start..."
    sleep 15
    
    # Check container status first
    print_status "Checking container status..."
    if docker ps -q -f name=$APP_NAME > /dev/null; then
        print_status "✅ Container is running"
        docker ps --filter name=$APP_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_error "❌ Container failed to start or crashed"
        print_warning "Container logs:"
        docker logs $APP_NAME
        exit 1
    fi
    
    # Test if app is responding
    print_status "Testing application response..."
    RETRY_COUNT=0
    MAX_RETRIES=6
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f http://localhost:$PORT > /dev/null 2>&1; then
            print_status "✅ Application is responding successfully!"
            echo "Application is running at: http://localhost:$PORT"
            
            # Show some basic app info
            echo ""
            print_status "Application health check:"
            curl -s http://localhost:$PORT | head -n 5 || echo "Could not fetch page content"
            return 0
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            print_warning "Attempt $RETRY_COUNT/$MAX_RETRIES failed, retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    print_error "❌ Application is not responding after $MAX_RETRIES attempts"
    print_warning "Container status:"
    docker ps --filter name=$APP_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    print_warning "Container logs:"
    docker logs $APP_NAME
    exit 1
}

# Function to deploy (build + test)
deploy() {
    print_header "Full Deployment"
    build_image
    test_app
    print_status "🚀 Deployment completed successfully!"
}

# Function to show logs
show_logs() {
    print_header "Container Logs"
    if docker ps -q -f name=$APP_NAME; then
        print_status "Showing logs for running container..."
        docker logs -f $APP_NAME
    elif docker ps -aq -f name=$APP_NAME; then
        print_warning "Container exists but is not running. Showing last logs..."
        docker logs $APP_NAME
    else
        print_error "Container $APP_NAME does not exist"
        exit 1
    fi
}

# Function to debug application issues
debug() {
    print_header "Debug Information"
    
    # Check if container exists
    if docker ps -aq -f name=$APP_NAME; then
        print_status "Container status:"
        docker ps -a --filter name=$APP_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.CreatedAt}}"
        
        echo ""
        print_status "Container logs (last 50 lines):"
        docker logs --tail 50 $APP_NAME
        
        # If container is running, test connectivity
        if docker ps -q -f name=$APP_NAME; then
            echo ""
            print_status "Testing connectivity..."
            if curl -f http://localhost:$PORT > /dev/null 2>&1; then
                print_status "✅ Application is responding"
            else
                print_warning "❌ Application is not responding on port $PORT"
            fi
        fi
    else
        print_warning "No container named $APP_NAME found"
    fi
    
    echo ""
    print_status "Docker images:"
    docker images | grep -E "(REPOSITORY|$IMAGE_NAME)"
}

# Function to cleanup
cleanup() {
    print_header "Cleanup"
    
    # Stop and remove container
    if docker ps -q -f name=$APP_NAME; then
        print_status "Stopping container..."
        docker stop $APP_NAME
    fi
    
    if docker ps -aq -f name=$APP_NAME; then
        print_status "Removing container..."
        docker rm $APP_NAME
    fi
    
    # Remove image
    if docker images -q $IMAGE_NAME; then
        print_status "Removing image..."
        docker rmi $IMAGE_NAME
    fi
    
    print_status "Cleanup completed!"
}

# Function to show status
show_status() {
    print_header "Application Status"
    
    if docker ps -q -f name=$APP_NAME; then
        print_status "✅ Container is running"
        docker ps --filter name=$APP_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
        echo ""
        print_status "Testing application response..."
        if curl -f http://localhost:$PORT > /dev/null 2>&1; then
            print_status "✅ Application is responding"
        else
            print_warning "⚠️  Application is not responding"
        fi
    else
        print_warning "❌ Container is not running"
    fi
}

# Main script logic
case "${1:-deploy}" in
    "build")
        build_image
        ;;
    "test")
        test_app
        ;;
    "deploy")
        deploy
        ;;
    "logs")
        show_logs
        ;;
    "debug")
        debug
        ;;
    "cleanup"|"clean")
        cleanup
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  build    - Build Docker image only"
        echo "  test     - Test the application (runs container)"
        echo "  deploy   - Full deployment (build + test)"
        echo "  logs     - Show container logs"
        echo "  debug    - Show detailed debug information"
        echo "  status   - Show application status"
        echo "  cleanup  - Stop container and remove image"
        echo "  help     - Show this help message"
        echo ""
        echo "Default: deploy"
        ;;
    *)
        print_error "Unknown command: $1"
        print_status "Run '$0 help' for usage information"
        exit 1
        ;;
esac
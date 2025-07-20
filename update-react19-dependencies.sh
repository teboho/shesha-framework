#!/bin/bash

# React 19 Dependencies Update Script
# This script updates all packages to React 19 compatible versions

set -e  # Exit on any error

echo "🚀 Starting React 19 Dependencies Update..."
echo "================================================"

# Function to print colored output
print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

print_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

# Function to check if directory exists
check_directory() {
    if [ ! -d "$1" ]; then
        print_error "Directory $1 not found!"
        return 1
    fi
    return 0
}

# Function to backup package.json
backup_package_json() {
    local dir=$1
    if [ -f "$dir/package.json" ]; then
        cp "$dir/package.json" "$dir/package.json.backup"
        print_info "Backed up $dir/package.json"
    fi
}

# Function to install dependencies
install_dependencies() {
    local dir=$1
    local package_name=$2
    
    print_info "Installing dependencies for $package_name..."
    
    cd "$dir"
    
    # Clear npm cache
    npm cache clean --force
    
    # Remove node_modules and package-lock.json for clean install
    rm -rf node_modules package-lock.json
    
    # Install with legacy peer deps flag
    if npm install --legacy-peer-deps; then
        print_success "$package_name dependencies installed successfully"
    else
        print_error "Failed to install dependencies for $package_name"
        return 1
    fi
    
    cd - > /dev/null
}

# Function to verify installation
verify_installation() {
    local dir=$1
    local package_name=$2
    
    print_info "Verifying $package_name installation..."
    
    cd "$dir"
    
    # Check if React 19 is installed
    if npm list react 2>/dev/null | grep -q "19."; then
        print_success "$package_name: React 19 installed correctly"
    else
        print_warning "$package_name: React version verification failed"
    fi
    
    # Check if Next.js 15 is installed (where applicable)
    if npm list next 2>/dev/null | grep -q "15."; then
        print_success "$package_name: Next.js 15 installed correctly"
    elif [ "$package_name" != "frontend-packages" ]; then
        print_warning "$package_name: Next.js version check failed"
    fi
    
    cd - > /dev/null
}

# Main execution
echo "📋 Pre-flight checks..."

# Check if we're in the right directory
if [ ! -f "NEXTJS_15_UPGRADE.md" ] && [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check Node.js version
node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 20 ]; then
    print_error "Node.js 20 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version check passed: $(node --version)"

# Directories to update
declare -A packages=(
    ["shesha-reactjs"]="Shesha ReactJS Library"
    ["shesha-starter/frontend-packages"]="Frontend Packages"
    ["shesha-starter/frontend"]="Frontend Application"
)

# Backup all package.json files
echo ""
echo "📁 Creating backups..."
for dir in "${!packages[@]}"; do
    if check_directory "$dir"; then
        backup_package_json "$dir"
    fi
done

# Install dependencies for each package
echo ""
echo "📦 Installing dependencies..."
for dir in "${!packages[@]}"; do
    package_name="${packages[$dir]}"
    
    if check_directory "$dir"; then
        echo ""
        echo "----------------------------------------"
        print_info "Processing $package_name ($dir)"
        echo "----------------------------------------"
        
        if install_dependencies "$dir" "$package_name"; then
            verify_installation "$dir" "$package_name"
        else
            print_error "Installation failed for $package_name"
            echo "You can restore the backup with: cp $dir/package.json.backup $dir/package.json"
        fi
    else
        print_warning "Skipping $package_name - directory not found"
    fi
done

# Final verification
echo ""
echo "🔍 Final verification..."
echo "========================"

# Check all critical packages
print_info "Checking React 19 installation across all packages..."

all_good=true
for dir in "${!packages[@]}"; do
    if check_directory "$dir"; then
        cd "$dir"
        
        # Check React version
        react_version=$(npm list react --depth=0 2>/dev/null | grep react@ | head -1 | sed 's/.*react@//' | cut -d' ' -f1)
        if [[ "$react_version" == 19.* ]]; then
            print_success "$dir: React $react_version ✓"
        else
            print_error "$dir: React version issue - found $react_version"
            all_good=false
        fi
        
        cd - > /dev/null
    fi
done

echo ""
if [ "$all_good" = true ]; then
    echo "🎉 SUCCESS! All packages updated to React 19 compatible versions"
    echo ""
    print_success "Next steps:"
    echo "  1. Test your applications: npm run build"
    echo "  2. Run type checking: npm run type-check"
    echo "  3. Run linting: npm run lint"
    echo "  4. Run tests: npm test"
    echo ""
    print_info "Documentation available in:"
    echo "  - REACT19_DEPENDENCIES_UPDATE.md"
    echo "  - NEXTJS_15_UPGRADE.md"
    echo "  - ROLLUP_NEXTJS15_COMPATIBILITY.md"
else
    print_error "Some packages may have installation issues. Please check the output above."
    echo ""
    print_info "To restore backups if needed:"
    for dir in "${!packages[@]}"; do
        echo "  cp $dir/package.json.backup $dir/package.json"
    done
fi

echo ""
echo "📊 Installation Summary:"
echo "========================"
for dir in "${!packages[@]}"; do
    if check_directory "$dir"; then
        echo "📁 $dir"
        cd "$dir"
        
        # Show key package versions
        react_version=$(npm list react --depth=0 2>/dev/null | grep react@ | head -1 | sed 's/.*react@//' | cut -d' ' -f1 || echo "Not found")
        next_version=$(npm list next --depth=0 2>/dev/null | grep next@ | head -1 | sed 's/.*next@//' | cut -d' ' -f1 || echo "Not found")
        antd_version=$(npm list antd --depth=0 2>/dev/null | grep antd@ | head -1 | sed 's/.*antd@//' | cut -d' ' -f1 || echo "Not found")
        
        echo "   React: $react_version"
        echo "   Next.js: $next_version"
        echo "   Ant Design: $antd_version"
        echo ""
        
        cd - > /dev/null
    fi
done

print_info "Update completed! Check the logs above for any issues."
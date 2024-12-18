#!/bin/bash

# MoeWeb Browser Build and Install Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required dependencies
function check_dependencies() {
    echo -e "${YELLOW}Checking system dependencies...${NC}"
    
    # Check for Node.js
    if ! command -v node &> /dev/null
    then
        echo -e "${YELLOW}Node.js is not installed. Installing...${NC}"
        # Node.js installation (use appropriate method based on OS)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install node
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux (Ubuntu/Debian)
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "win32"* ]]; then
            # Windows (requires manual download from nodejs.org)
            echo -e "${YELLOW}Please download Node.js from https://nodejs.org${NC}"
            exit 1
        fi
    fi

    # Check for npm
    if ! command -v npm &> /dev/null
    then
        echo -e "${YELLOW}npm is not installed. Installing...${NC}"
        sudo apt-get install npm
    fi
}

# Main installation function
function install_moeweb() {
    # Clone the repository
    echo -e "${GREEN}Cloning MoeWeb repository...${NC}"
    git clone https://github.com/danish-mar/moeweb.git
    cd moeweb

    # Install dependencies
    echo -e "${GREEN}Installing dependencies...${NC}"
    npm install

    # Build the application
    echo -e "${GREEN}Building MoeWeb...${NC}"
    npm run build

    # Install the application
    echo -e "${GREEN}Installing MoeWeb...${NC}"
    npm run install
}

# Uninstall function
function uninstall_moeweb() {
    echo -e "${YELLOW}Uninstalling MoeWeb...${NC}"
    npm uninstall -g moeweb
    rm -rf ~/moeweb
}

# Main script execution
function main() {
    # Check for help flag
    if [[ "$1" == "--help" ]]; then
        echo "MoeWeb Browser Installation Script"
        echo "Usage:"
        echo "  ./install.sh         - Install MoeWeb"
        echo "  ./install.sh uninstall  - Uninstall MoeWeb"
        exit 0
    fi

    # Check dependencies
    check_dependencies

    # Perform action based on argument
    case "$1" in
        "uninstall")
            uninstall_moeweb
            ;;
        *)
            install_moeweb
            ;;
    esac

    echo -e "${GREEN}MoeWeb installation complete!${NC}"
}

# Run the main function with arguments
main "$@"
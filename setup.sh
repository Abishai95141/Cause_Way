#!/usr/bin/env bash
# ============================================================================
# Causeway — One-Shot Ubuntu Setup Script
# ============================================================================
# Run:  chmod +x setup.sh && ./setup.sh
#
# What this does:
#   1. Installs system packages (Python 3.11, Node 20, Docker)
#   2. Starts infrastructure (Postgres, Redis, MinIO, Qdrant)
#   3. Creates Python venv and installs backend dependencies
#   4. Creates .env from defaults if missing
#   5. Installs frontend dependencies
#   6. Waits for all services to be healthy
#   7. Prints final status
# ============================================================================

set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[  OK]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()    { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }
header()  { echo -e "\n${BOLD}═══════════════════════════════════════════════════${NC}"; echo -e "${BOLD}  $*${NC}"; echo -e "${BOLD}═══════════════════════════════════════════════════${NC}\n"; }

# ── Resolve project root (where this script lives) ─────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

header "Causeway Setup — Ubuntu"
info "Project root: $PROJECT_ROOT"

# ============================================================================
# 1. System Dependencies
# ============================================================================
header "Step 1/6 — System Dependencies"

sudo apt-get update -qq

# ── Python 3.11+ ───────────────────────────────────────────────────
if command -v python3.11 &>/dev/null || command -v python3.12 &>/dev/null || command -v python3.13 &>/dev/null; then
    PYTHON_CMD=$(command -v python3.13 || command -v python3.12 || command -v python3.11)
    success "Python already installed: $($PYTHON_CMD --version)"
else
    info "Installing Python 3.11 ..."
    sudo apt-get install -y -qq software-properties-common
    sudo add-apt-repository -y ppa:deadsnakes/ppa
    sudo apt-get update -qq
    sudo apt-get install -y -qq python3.11 python3.11-venv python3.11-dev
    PYTHON_CMD="python3.11"
    success "Installed $($PYTHON_CMD --version)"
fi

# Ensure venv + pip modules are available for the detected Python
PYTHON_VERSION=$($PYTHON_CMD -c "import sys; print(f'{sys.version_info.minor}')")
sudo apt-get install -y -qq "python3.${PYTHON_VERSION}-venv" "python3.${PYTHON_VERSION}-dev" 2>/dev/null || true
sudo apt-get install -y -qq python3-pip 2>/dev/null || true

# ── Node.js 20 LTS ────────────────────────────────────────────────
if command -v node &>/dev/null; then
    NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        success "Node.js already installed: $(node -v)"
    else
        warn "Node.js $(node -v) is too old, installing v20 ..."
        INSTALL_NODE=true
    fi
else
    INSTALL_NODE=true
fi

if [ "${INSTALL_NODE:-false}" = true ]; then
    info "Installing Node.js 20 LTS ..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
    success "Installed Node.js $(node -v), npm $(npm -v)"
fi

# ── Docker + Docker Compose ────────────────────────────────────────
if command -v docker &>/dev/null; then
    success "Docker already installed: $(docker --version)"
else
    info "Installing Docker ..."
    sudo apt-get install -y -qq ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    success "Installed Docker $(docker --version)"
fi

# Add current user to docker group (avoids sudo for docker commands)
if ! groups "$USER" | grep -qw docker; then
    info "Adding $USER to docker group (takes effect on next login) ..."
    sudo usermod -aG docker "$USER"
    warn "You may need to log out and back in, or run: newgrp docker"
fi

# Ensure Docker daemon is running
if ! sudo systemctl is-active --quiet docker; then
    sudo systemctl start docker
    sudo systemctl enable docker
fi
success "Docker daemon is running"

# ── Build tools (needed by some Python packages) ───────────────────
sudo apt-get install -y -qq build-essential libpq-dev curl git 2>/dev/null || true

# ============================================================================
# 2. Start Infrastructure Services
# ============================================================================
header "Step 2/6 — Docker Infrastructure"

cd "$PROJECT_ROOT"

info "Starting Postgres, Redis, MinIO, Qdrant via docker compose ..."
sudo docker compose up -d

success "Infrastructure containers started"

# ============================================================================
# 3. Python Backend Setup
# ============================================================================
header "Step 3/6 — Python Backend"

cd "$PROJECT_ROOT"

if [ ! -d ".venv" ]; then
    info "Creating Python virtual environment ..."
    $PYTHON_CMD -m venv .venv
    success "Virtual environment created at .venv/"
else
    success "Virtual environment already exists"
fi

info "Activating venv and installing dependencies ..."
# shellcheck disable=SC1091
source .venv/bin/activate

pip install --upgrade pip -q
pip install -e ".[dev]" -q

success "Backend dependencies installed"

# ============================================================================
# 4. Environment File
# ============================================================================
header "Step 4/6 — Environment Configuration"

cd "$PROJECT_ROOT"

if [ ! -f ".env" ]; then
    info "Creating .env from defaults ..."
    cat > .env <<'ENVFILE'
DATABASE_URL=postgresql+asyncpg://causeway:causeway_dev@localhost:5432/causeway
REDIS_URL=redis://localhost:6379/0
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=causeway
MINIO_SECRET_KEY=causeway_dev_key
MINIO_BUCKET=causeway-docs
MINIO_SECURE=False
QDRANT_HOST=localhost
QDRANT_PORT=6333
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
DEBUG=True
LOG_LEVEL=INFO
ENVFILE
    warn ".env created — EDIT IT to set your GOOGLE_AI_API_KEY"
else
    success ".env already exists"
    # Check if API key is a placeholder
    if grep -q "your_google_ai_api_key_here" .env 2>/dev/null; then
        warn "GOOGLE_AI_API_KEY is still a placeholder — edit .env before running"
    fi
fi

# ============================================================================
# 5. Frontend Setup
# ============================================================================
header "Step 5/6 — Frontend (React)"

cd "$PROJECT_ROOT/frontend/ui"

info "Installing npm dependencies ..."
npm install --silent 2>/dev/null

success "Frontend dependencies installed"

# ============================================================================
# 6. Wait for Services to be Healthy
# ============================================================================
header "Step 6/6 — Health Checks"

cd "$PROJECT_ROOT"

wait_for_port() {
    local name=$1 host=$2 port=$3 timeout=${4:-30}
    local elapsed=0
    while ! (echo > /dev/tcp/"$host"/"$port") 2>/dev/null; do
        if [ $elapsed -ge $timeout ]; then
            warn "$name did not become ready on port $port within ${timeout}s"
            return 1
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    success "$name is ready on port $port"
}

wait_for_port "PostgreSQL" localhost 5432 30
wait_for_port "Redis"      localhost 6379 15
wait_for_port "MinIO"      localhost 9000 30
wait_for_port "Qdrant"     localhost 6333 30

# ============================================================================
# Done!
# ============================================================================
header "Setup Complete!"

echo -e "${GREEN}${BOLD}Everything is ready. To run Causeway:${NC}\n"

echo -e "  ${CYAN}1. Start the backend:${NC}"
echo -e "     cd $PROJECT_ROOT"
echo -e "     source .venv/bin/activate"
echo -e "     uvicorn src.api.main:app --host 0.0.0.0 --port 8000\n"

echo -e "  ${CYAN}2. Start the frontend (in another terminal):${NC}"
echo -e "     cd $PROJECT_ROOT/frontend/ui"
echo -e "     npm run dev\n"

echo -e "  ${CYAN}3. Open in browser:${NC}"
echo -e "     Frontend:    http://localhost:8080"
echo -e "     API Docs:    http://localhost:8000/docs"
echo -e "     Health:      http://localhost:8000/health"
echo -e "     MinIO:       http://localhost:9001\n"

if grep -q "your_google_ai_api_key_here" "$PROJECT_ROOT/.env" 2>/dev/null; then
    echo -e "  ${YELLOW}⚠  Don't forget to set your GOOGLE_AI_API_KEY in .env${NC}\n"
fi

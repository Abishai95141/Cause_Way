# Causeway

> Agentic decision support with causal world models built from documents.

Causeway ingests documents, retrieves evidence, constructs causal DAGs, and answers decision questions with traceable reasoning. It supports:

- **Mode 1**: world model construction (discover variables/edges from evidence)
- **Mode 2**: decision support (query existing models, escalate when needed)
- **Human-in-the-loop review**: inspect, patch, approve, reject, and bridge models

---

## Table of Contents

- [What You Get](#what-you-get)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Quick Start (Local)](#quick-start-local)
- [Frontend (UI)](#frontend-ui)
- [Backend API](#backend-api)
- [Environment Configuration](#environment-configuration)
- [Testing & Quality](#testing--quality)
- [Deploy to GCP (Public URL)](#deploy-to-gcp-public-url)
- [Troubleshooting](#troubleshooting)

---

## What You Get

- **Document pipeline**: upload, store, index, retrieve
- **Causal engine**: build DAGs and reason over paths
- **Operational protocol**: route between construction/review/decision flows
- **Modern React UI**: dashboard, documents, model explorer, approval review, bridges, admin
- **Persistence + infra**: PostgreSQL, Redis, MinIO, Qdrant

---

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy (async)
- PostgreSQL
- Redis
- MinIO (S3-compatible object store)
- Qdrant (vector DB)
- NetworkX + PyWhyLLM

### Frontend
- React 18 + TypeScript
- Vite
- TanStack Query
- React Router
- Tailwind + shadcn/ui
- React Flow + dagre

---

## Repository Layout

```text
src/                  # Backend application code
  api/                # FastAPI app + routes
  causal/             # DAG, pathing, conflict/temporal logic
  extraction/         # Document extraction
  haystack_svc/       # Retrieval pipelines
  modes/              # Mode 1 / Mode 2 orchestrators
  protocol/           # State machine + routing
  storage/            # DB/object store services
frontend/ui/          # React + Vite product UI
migrations/           # DB migrations
tests/                # Python tests
prototype/            # Streamlit prototype
docker-compose.yml    # Local infra services (db/cache/object/vector)
```

---

## Quick Start (Local)

### 1) Prerequisites

- Python **3.11+**
- Node.js **18+**
- Docker + Docker Compose

### 2) Start infrastructure services

From repository root:

```bash
docker compose up -d
```

This starts:
- Postgres (`5432`)
- Redis (`6379`)
- MinIO (`9000`, console `9001`)
- Qdrant (`6333`)

### 3) Run backend API

From repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .

# set required env vars in shell or .env (see Environment Configuration)
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

Health checks:
- `http://localhost:8000/health`
- `http://localhost:8000/metrics`

### 4) Run frontend UI

In another terminal:

```bash
cd frontend/ui
npm install
npm run dev
```

Open: `http://localhost:8080`

> Dev proxy in Vite forwards `/api`, `/health`, `/metrics` to backend `localhost:8000`.

---

## Frontend (UI)

Main pages:

- Dashboard
- Documents
- World Model Builder
- Model Explorer
- Approval Review
- Decision Support
- Bridges
- Admin
- Settings

Build for production:

```bash
cd frontend/ui
npm run build
npm run preview
```

---

## Backend API

Base API prefix: `/api/v1`

High-level endpoint groups:

- **System**: `/health`, `/metrics`
- **Documents**: upload/list/get/delete/index
- **Search**: semantic evidence retrieval
- **Mode 1**: run/status
- **Mode 2**: run/status
- **World Models**: list/get/patch/approve/reject
- **Bridges**: list/get/edges/concepts
- **Protocol**: status/history
- **Admin**: reset/config
- **Training**: start/status

Interactive docs (when backend is running):
- `http://localhost:8000/docs`

---

## Environment Configuration

Causeway loads env from `.env` (if present) and process env.

Common variables:

```bash
DATABASE_URL=postgresql+asyncpg://causeway:causeway_dev@localhost:5432/causeway
REDIS_URL=redis://localhost:6379/0
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=causeway
MINIO_SECRET_KEY=causeway_dev_key
MINIO_BUCKET=causeway-docs
MINIO_SECURE=false
QDRANT_HOST=localhost
QDRANT_PORT=6333
GOOGLE_AI_API_KEY=your_key_here
DEBUG=false
LOG_LEVEL=INFO
```

---

## Testing & Quality

From repository root:

```bash
pytest
```

Frontend:

```bash
cd frontend/ui
npm run test
npm run lint
```

Type-check frontend:

```bash
cd frontend/ui
npx tsc --noEmit
```

---

## Deploy to GCP (Public URL)

This repo is ready for VM-based deployment with Nginx reverse proxy.

### Recommended architecture

- **Compute Engine VM** (Ubuntu 22.04+)
- Docker Compose for infra services
- FastAPI backend as systemd service
- Frontend static build served by Nginx
- Nginx proxies `/api`, `/health`, `/metrics` to backend

### Steps

1. Create VM and reserve static external IP
2. Open firewall for `80` and `443`
3. Install Docker, Docker Compose plugin, Nginx, Python 3.11+, Node 18+
4. Clone repo and run infra:

```bash
git clone https://github.com/Abishai95141/Cause_Way.git
cd Cause_Way
docker compose up -d
```

5. Configure production env variables (strong credentials + API keys)
6. Run backend via systemd on `127.0.0.1:8000`
7. Build frontend:

```bash
cd frontend/ui
npm ci
npm run build
```

8. Serve `frontend/ui/dist` with Nginx
9. Add Nginx proxy rules for backend paths
10. Point your domain A record to VM static IP
11. Install TLS cert with Certbot (`https://your-domain`)

> Keep frontend API base as relative path (`""`) so Nginx handles routing.

---

## Troubleshooting

- **Frontend cannot call API**
  - Verify backend is up on `:8000`
  - Check Nginx proxy rules for `/api`, `/health`, `/metrics`
- **Upload/index failures**
  - Confirm MinIO and Qdrant containers are healthy
- **DB connection issues**
  - Check `DATABASE_URL` and Postgres health
- **Gemini/LLM errors**
  - Confirm `GOOGLE_AI_API_KEY` is set and valid

---

If you want, I can also add:
- a production `nginx` config file,
- backend `systemd` unit file,
- and a one-command `deploy.sh` template for your GCP VM.

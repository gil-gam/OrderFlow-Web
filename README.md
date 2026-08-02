<p align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 10" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</p>

<h1 align="center">OrderFlow-Web</h1>

<p align="center">
  <strong>Production-grade Order Management System</strong><br/>
  Frontend: Angular 18 | Backend: .NET 10 | Database: PostgreSQL 16
</p>

<p align="center">
  <a href="https://orderflow-web.vercel.app" target="_blank">🌐 Frontend (Vercel)</a>
  ·
  <a href="https://orderflow-api.up.railway.app/swagger" target="_blank">🔗 API / Swagger (Railway)</a>
  ·
  <a href="https://github.com/gil-gam/OrderFlow-Api" target="_blank">📦 API Repository</a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Docker](#docker)
- [Deploy](#deploy)
- [Contact](#contact)

---

## Overview

**OrderFlow** is a full-stack order management system built with modern engineering practices:

| Layer | Technology | Highlights |
|---|---|---|
| **Frontend** | Angular 18 | Standalone Components, Signals, Reactive Forms, Tailwind CSS |
| **Backend** | .NET 10 | Clean Architecture, CQRS (MediatR), JWT Auth, OpenTelemetry |
| **Database** | PostgreSQL 16 | EF Core 10, Npgsql, Migrations |
| **Infrastructure** | Docker / Nginx | Multi-stage build, CI/CD, GitHub Container Registry |

The frontend follows a **4-state pattern** (Loading → Empty → Error → Ready) for every data-driven view, ensuring a robust user experience. Security is handled via **JWT authentication** with automatic token injection and centralized error handling.

---

## Architecture

orderflow-web/
├── src/app/
│   ├── core/                     # Services, Guards, Interceptors, Models
│   ├── features/                 # Auth, Dashboard, Orders, Products, Categories, Customers
│   └── shared/                   # Layouts, 4-state components, Confirm Dialog
├── Dockerfile                    # Multi-stage: Node build → Nginx serve
├── nginx.conf                    # SPA routing + security headers
└── setup.sh                      # One-command local setup



---

## Features

### 🔐 Authentication
- User registration and login with JWT
- Route guards (`authGuard`, `loginGuard`) with redirect support
- Automatic token injection via HTTP interceptor
- Centralized 401 error handling

### CRUD Operations
- **Categories** — Create, list, update, delete
- **Products** — Create, list, update, delete
- **Customers** — Create, list, update, delete
- **Orders** — Create with dynamic FormArray (multiple items), list with status, detail view

### Dashboard
- Aggregated metrics: total orders, products, customers, categories
- Clean card-based layout with loading states

### Quality
- **143 tests** (138 unit + 5 integration) — all passing
- **CI**: lint → test (with coverage) → build
- **CD**: Docker image push to GHCR on main

---

## Screenshots

<!-- TODO: Add screenshots and GIFs after local run -->

| Auth Flow | CRUD Operations | Order Creation |
|---|---|---|
| *TODO* | *TODO* | *TODO* |

> 💡 *Tip: Use [ScreenToGif](https://www.screentogif.com) (Windows) or [Kap](https://getkap.co) (macOS) to record 10-15s demos.*

---

## Tech Stack

### Frontend

| Category | Technology |
|---|---|
| **Framework** | Angular 18 (Standalone Components) |
| **Language** | TypeScript 5.x |
| **State Management** | Signals (`signal`, `computed`) |
| **UI** | Tailwind CSS 3.x |
| **Forms** | Reactive Forms with FormArray (Orders) |
| **HTTP** | Functional Interceptors (JWT, Error) |
| **Testing** | Jasmine + Karma |

### Backend

| Category | Technology |
|---|---|
| **Runtime** | .NET 10 — ASP.NET Core Controllers |
| **Language** | C# 13 |
| **OR/M** | Entity Framework Core 10 + Npgsql |
| **CQRS** | MediatR |
| **Auth** | JWT Bearer |
| **Observability** | OpenTelemetry (Traces + Metrics + Prometheus) |
| **Documentation** | Swagger / OpenAPI |
| **Testing** | xUnit + FluentAssertions + Testcontainers + WebApplicationFactory |

### Infrastructure

| Category | Technology |
|---|---|
| **Container** | Docker + Docker Compose |
| **Web Server** | Nginx 1.27 (alpine) — SPA routing, Gzip, security headers |
| **CI/CD** | GitHub Actions |
| **Registry** | GitHub Container Registry (GHCR) |

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| .NET SDK | 10.x | `dotnet --version` |
| Docker | 24+ | `docker --version` |
| Node.js | 22.x | `node --version` |
| npm | 10+ | `npm --version` |
| EF Core CLI | latest | `dotnet ef --version` *(install: `dotnet tool install --global dotnet-ef`)* |

---

## Quick Start

The fastest way to get both projects running locally.

### 1. Clone the repositories
```bash
md orderflow 
cd orderflow

git clone https://github.com/gil-gam/OrderFlow-Api.git
git clone https://github.com/gil-gam/OrderFlow-Web.git
```

### 2. Run the setup script

```bash
cd orderflow/OrderFlow-Web
```
*Open the folder with **Git Bash** and run:*
```bash 
chmod +x setup.sh
./setup.sh
```

The script automates everything:

| Step | Action |
|---|---|
| 1 | Starts PostgreSQL via Docker Compose |
| 2 | Waits for database readiness |
| 3 | Applies EF Core migrations |
| 4 | Starts the API (dotnet run on port 5220) |
| 5 | Installs frontend dependencies (npm ci) |
| 6 | Starts Angular dev server (ng serve on port 4200) |

### 3. Access the application

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| API (Swagger) | http://localhost:5220/swagger |
| Database | localhost:5432 (user: orderflow, password: orderflow123) |


#### 3.1. and then, if you need new access again, run (Git Bash):

- go to the api directory and run: *git restore .*
- go to the web directory and run: *./setup.sh*


### 4. First-time usage

- Register a new user at /auth/register
- Login at /auth/login
- Start creating categories, products, customers, and orders

*To stop: press Ctrl+C in the terminal.*


## Manual Setup

If you prefer to run each step manually instead of using the setup script.

Terminal 1 — API

```bash
cd orderflow/OrderFlow-Api

# Start database
docker compose up -d postgres

# Apply migrations
dotnet ef database update --project src/OrderFlow.Infrastructure --startup-project src/OrderFlow.Api

# Run the API (port 5220)
dotnet run --project src/OrderFlow.Api
```

Terminal 2 — Frontend

```bash
cd orderflow/OrderFlow-Web

# Install dependencies
npm ci --legacy-peer-deps

# Start Angular dev server (port 4200) with proxy
ng serve --port 4200 --proxy-config proxy.conf.json
```

## Testing

```bash
cd OrderFlow-Web
ng test --watch=false --browsers ChromeHeadless --code-coverage
```


| Test Type | Count |
|---|---|
| Unit tests | 138 |
| Integration tests | 5 |
| **Total** | **143** |


## CI/CD

### CI — Continuous Integration
Triggered on push and pull_request to main.

```bash 
steps:
  - Checkout + Setup .NET 10
  - dotnet restore + build
  - dotnet test (unit + integration)
  - npm ci + ng test + ng build
```

### CD — Continuous Deployment
Triggered on successful CI on main.

```bash
steps:
  - Login to GHCR
  - Build multi-arch Docker image
  - Push to ghcr.io/gil-gam/orderflow-web:latest
```


## Docker

### Development

```bash
# Start only the database
docker compose up -d postgres

# Start everything (API + database)
cd OrderFlow-Api
docker compose up --build
```

### Production (Frontend)

```bash
cd OrderFlow-Web

# Build image
docker build -t orderflow-web

# Run container
docker run -d -p 80:80 orderflow-web
```

The production Nginx configuration includes:
- SPA fallback routing
- Gzip compression
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)



## Deploy

### Placeholder — deploy pending

### Frontend (Vercel)

🔗 https://orderflow-web.vercel.app


| Setting | Value |
|---|---|
| Framework Preset | Angular |
| Build Command | npm run build |
| Output Directory | dist/order-flow-web/browser |
| Node Version | 22.x |



### API (Railway)

🔗 https://orderflow-api.up.railway.app/swagger


| Variable | Value |
|---|---|
| ASPNETCORE_ENVIRONMENT | Production |
| Jwt__Key | (32+ characters) |
| PostgreSQL | Railway Plugin (auto-injected) |




## Contact

Gilberto Andreatta 

<img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="Gilberto Andreatta" />

#
Built with .NET 10 · Angular 18 · PostgreSQL 16 · Docker · GitHub Actions


# 🐳 CommunityHub Backend - Docker Setup

## Quick Start

### Development Environment
```bash
# Clone and setup
git clone <your-repo>
cd communityhub-backend

# Start development environment
npm run docker:dev

# View logs
npm run docker:logs

# Access database
npm run docker:db
```

### Production Environment
```bash
# Build and start production
npm run docker:prod

# Stop production
npm run docker:stop:prod
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build development image |
| `npm run docker:build:prod` | Build production image |
| `npm run docker:dev` | Start development environment |
| `npm run docker:dev:detached` | Start in background |
| `npm run docker:prod` | Start production environment |
| `npm run docker:stop` | Stop development environment |
| `npm run docker:logs` | View application logs |
| `npm run docker:shell` | Access container shell |
| `npm run docker:db` | Access PostgreSQL CLI |
| `npm run docker:clean` | Clean all Docker data |

## 🌐 Service URLs

| Service | Development | Production |
|---------|-------------|------------|
| **Backend API** | http://localhost:3000 | http://localhost:3000 |
| **PostgreSQL** | localhost:5432 | Internal only |
| **PgAdmin** | http://localhost:5050 | Not available |
| **Redis** | localhost:6379 | Internal only |

### PgAdmin Credentials
- **Email:** admin@communityhub.com  
- **Password:** admin123

## 🔧 Configuration

### Environment Files
- `.env.docker` - Development configuration
- `.env.production` - Production configuration (DO NOT COMMIT)

### Development Override
```bash
# Copy and customize environment
cp .env.docker .env.local
# Edit .env.local with your values
```

## 🚀 AWS Deployment Preparation

### 1. Build Production Image
```bash
npm run docker:build:prod
```

### 2. Tag for ECR
```bash
docker tag communityhub-backend:prod <aws-account-id>.dkr.ecr.<region>.amazonaws.com/communityhub-backend:latest
```

### 3. Push to ECR
```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/communityhub-backend:latest
```

## 📊 Health Checks

### Application Health
```bash
curl http://localhost:3000/health
```

### Database Health
```bash
docker-compose exec postgres pg_isready -U postgres -d communityhub
```

## 🔍 Troubleshooting

### View All Logs
```bash
docker-compose logs
```

### Restart Services
```bash
docker-compose restart app
```

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

### Performance Monitoring
```bash
docker stats
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   NestJS App    │    │   PostgreSQL    │
│   (Production)  │◄──►│   (Port 3000)   │◄──►│   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │      Redis      │
                       │   (Port 6379)   │
                       └─────────────────┘
```

## 🔒 Security Notes

- Production uses non-root user
- Multi-stage build for smaller images  
- Health checks enabled
- Proper signal handling with dumb-init
- Network isolation
- Volume persistence for data
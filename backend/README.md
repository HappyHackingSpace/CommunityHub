# CommunityHub Backend

A modern, multi-tenant community platform backend built with **NestJS 11**, **TypeScript**, **PostgreSQL**, and **Redis**.

## Description

CommunityHub is a comprehensive backend service for managing communities, clubs, tasks, meetings, notifications, and user interactions. It implements a domain-driven design (DDD) architecture with CQRS patterns, real-time WebSocket communication, multi-tenant support, and comprehensive security features.

### Core Features

- **Identity & Authentication**: OAuth2 Google login, JWT-based authorization with role-based access control
- **Multi-Tenant Architecture**: Complete tenant isolation with CLS-based context management
- **Real-Time Notifications**: Socket.io-based WebSocket gateway with Bull queue for async job processing
- **Task Management**: Full task lifecycle with comments, subtasks, attachments, gamification, and activity logging
- **Meeting Management**: Meeting scheduling, participant management, agenda items, resources, and attendance tracking
- **Community & Club Management**: Community creation with admin approval, club management, and membership workflows
- **Activity Feed**: Social post creation, engagement (likes), and feed filtering
- **Security & Moderation**: User reporting, admin moderation, and user banning capabilities
- **API Documentation**: Swagger/OpenAPI and Scalar reference documentation

## Project setup

```bash
$ npm install
```

## Environment Configuration

### Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your local configuration values in `.env`

3. **IMPORTANT:** Never commit `.env` files to Git! They are automatically ignored by `.gitignore`.

### Required Environment Variables

See `.env.example` for all required variables and their descriptions.

### Generating Secrets

**JWT Secret:**
Generate a new secure secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new OAuth 2.0 Client ID for a Web application
3. Add authorized redirect URIs (e.g., `http://localhost:3000/auth/google/callback`)
4. Copy the Client ID and Client Secret to your `.env` file

### Security Best Practices

- **Never commit** `.env` files or real credentials to Git
- Use **strong, unique passwords** for all services (database, Redis, PgAdmin)
- Rotate secrets regularly in production
- Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.) in production
- Enable 2FA/MFA for all critical services and platforms (Google Cloud, AWS, etc.)

## Running the Application

### Using npm

```bash
# development (watch mode)
npm run start:dev

# production mode
npm run start:prod

# standard run
npm run start
```

### Using Docker Compose

```bash
# Start all services (backend, PostgreSQL, Redis, PgAdmin)
docker-compose up -d

# Stop services
docker-compose down
```

Access the application at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Scalar Docs**: http://localhost:3000/reference
- **PgAdmin**: http://localhost:5050

## Architecture Overview

CommunityHub follows a **Domain-Driven Design (DDD)** architecture with clear separation of concerns:

- **Presentation Layer**: REST API controllers with validation and guard-based authorization
- **Application Layer**: CQRS command/query handlers, DTOs, and business logic orchestration
- **Domain Layer**: Core entities, value objects, and domain events
- **Infrastructure Layer**: TypeORM repositories, external service integrations, and persistence logic

### Key Technologies

- **Framework**: NestJS 11 with TypeScript
- **Database**: PostgreSQL with TypeORM, auto-loaded entities and migrations
- **Caching & Queuing**: Redis with Bull for async job processing
- **Real-Time Communication**: Socket.io with JWT-based WebSocket authentication
- **Event System**: NestJS EventEmitter and CQRS for inter-module communication
- **API Documentation**: Swagger/OpenAPI and Scalar interactive reference
- **Multi-Tenancy**: Context Local Storage (CLS) for tenant isolation

## Project Structure

```
src/
├── modules/
│   ├── iam/                 # Identity & Access Management
│   ├── notifications/       # Real-time notifications & preferences
│   ├── tasks/              # Task management & gamification
│   ├── meetings/           # Meeting scheduling & coordination
│   ├── clubs/              # Club management & membership
│   ├── communities/        # Community management & approval
│   ├── activity-feed/      # Social feed & engagement
│   └── security-moderation/ # Reporting & user banning
├── shared/                  # Shared guards, middleware, decorators
└── app.module.ts           # Root module configuration
```

## Resources

- [Project Analysis](./project-analysis.md) - Detailed module documentation and architecture
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Socket.io Documentation](https://socket.io/docs/)
- [Bull Queue Documentation](https://docs.bullmq.io/)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

Once the application is running, explore the API documentation at:

- **Swagger UI**: http://localhost:3000/api
- **Scalar Interactive Reference**: http://localhost:3000/reference

The API includes comprehensive documentation for all endpoints with request/response examples and authentication requirements.

## License

Proprietary - CommunityHub Project

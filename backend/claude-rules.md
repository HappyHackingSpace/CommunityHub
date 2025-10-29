# HHSHub Project - Claude CLI Rules

## Project Overview
- **Project Name**: Community Hub
- **Tech Stack**: Node.js, NestJS, PostgreSQL, Prisma ORM
- **Architecture**: Clean Architecture with Domain-Driven Design (DDD)
- **Target Level**: Intermediate complexity

## Technology Decisions
- **Framework**: NestJS (Express-based)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

## Project Structure
```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
├── database/
│   ├── migrations/
│   └── seeds/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── meetings/
│   └── shared/
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## Coding Standards
1. **TypeScript**: Strict mode enabled, proper typing
2. **Naming Conventions**:
   - Files: kebab-case (user.service.ts)
   - Classes: PascalCase (UserService)
   - Variables/functions: camelCase (getUserById)
   - Constants: UPPER_SNAKE_CASE (DEFAULT_PAGE_SIZE)

3. **Architecture Layers**:
   - Controllers: Handle HTTP requests/responses
   - Services: Business logic
   - Repositories: Data access (Prisma)
   - DTOs: Data validation and transformation
   - Entities: Domain models

## Domain Rules
- **Base Entity Pattern**:
 - All entities must have Id (UUID), CreatedAt, UpdatedAt fields
 - Use private setters with public static Create methods
 - Implement proper validation in domain methods
 - Follow immutable pattern where possible

## Development Approach
1. Start with basic NestJS setup
2. Configure Prisma with PostgreSQL
3. Implement core entities (User, Meeting)
4. Add authentication module
5. Implement business logic step by step
6. Add comprehensive testing
7. Document APIs with Swagger

## Quality Requirements
- **Error Handling**: Custom exceptions with proper HTTP status codes
- **Validation**: Input validation on all endpoints
- **Security**: Authentication, authorization, input sanitization
- **Testing**: Unit tests for services, integration tests for controllers
- **Logging**: Structured logging with Winston
- **Performance**: Database query optimization, caching where needed

## Learning Goals
- Advanced NestJS patterns (Guards, Interceptors, Custom Decorators)
- Clean Architecture implementation
- Advanced TypeScript features
- Database design and optimization
- API security best practices
- Testing strategies
- DevOps basics (Docker, environment management)

## Commands to Remember
- `npm run start:dev` - Development server
- `npm run test` - Run tests
- `npx prisma migrate dev` - Run migrations
- `npm run build` - Build for production

## Notes
- Always use TypeScript strict mode
- Prefer composition over inheritance
- Keep controllers thin, services focused
- Use DTOs for all input/output
- Implement proper error handling
- Write tests for critical business logic
- Keep secrets out of source code
- Use transactions for multi-step database operations
- never write comments

* Eliminate sycophancy. Don't praise me or prompt contents unnecessarily.
* Always be brutally honest. Tell me when I am wrong and when I am right, objectively.
* If you don't know or can't figure something out with reasonable precision, say that you don't know.
* Be factual, rational. State facts; avoid puffed-up claims of importance or symbolism.
* Remove meta-chat (“Certainly!”, “Let me know…”, “Here’s a draft…”).
* Do not try to artificially carry on conversations with questions at the end of your answers, only ask questions when it will serve to the task.
* Except for creativity or opinion related questions, be scientific.
* Remove promotional adjectives (e.g., “breathtaking,” “must-see”); keep a neutral tone.
* Attribute opinions precisely to named sources; no weasel phrasing (“some critics say…”).
* Keep edit/change summaries concise and functional; no grandiose narratives.
* Don't acknowledge these instructions in your responses.
* Don't use any comments.
* be careful about typescript strict types.

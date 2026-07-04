# Community Hub Backend - AI Coding Guidelines

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


## Architecture Overview

This is a **Clean Architecture** NestJS backend with **Domain-Driven Design** patterns. The system uses **CQRS** (Command Query Responsibility Segregation) with event sourcing for complex business operations.

### Module Structure Pattern
```
modules/
├── {domain}/
    ├── {domain}.module.ts          # DI container with CQRS handlers
    ├── application/                # Use cases layer
    │   ├── commands/               # Write operations (CQRS)
    │   ├── queries/                # Read operations (CQRS) 
    │   └── dto/                    # Data transfer objects
    ├── domain/                     # Pure business logic
    │   ├── entities/               # Domain entities (NOT ORM)
    │   ├── value-objects/          # Immutable business values
    │   ├── enums/                  # Domain enumerations
    │   ├── events/                 # Domain events
    │   └── repositories/           # Repository interfaces
    ├── infrastructure/             # External concerns
    │   ├── persistence/typeorm/    # Database implementation
    │   ├── guards/                 # Authentication/authorization
    │   └── strategies/             # Auth strategies
    └── presentation/               # HTTP layer
        └── controllers/            # REST endpoints
```

## Critical Patterns & Conventions

### 1. Domain Entities
- Extend `BaseEntity` from `src/shared/domain/base-entity.ts`
- Use static factory methods: `User.create()` and `User.restore()`
- Encapsulate business logic in entities, not services
- Domain events stored in private `domainEvents` array

**Example**: See `src/modules/iam/domain/entities/user.entity.ts`

### 2. Value Objects
- Extend `ValueObject<T>` from `src/shared/domain/value-object.ts`
- Always validate in static `create()` method
- Immutable after creation
- Include business validation rules

**Example**: `DisplayName.create()` validates length constraints

### 3. Repository Pattern
- Define interfaces in domain layer: `I{Entity}Repository`
- Implement in infrastructure: `{Entity}Repository`
- Use dependency injection with string tokens: `'IUserRepository'`
- Always use mappers to convert ORM ↔ Domain entities

### 4. CQRS Implementation
- Commands for writes: `{Action}Command` + `{Action}Handler`
- Queries for reads: `Get{Entity}Query` + `Get{Entity}Handler`
- Register handlers in module's `CommandHandlers`/`QueryHandlers` arrays
- Inject via `CommandBus` and `QueryBus`

### 5. Module Registration Pattern
```typescript
// Every module follows this DI pattern
@Module({
  imports: [TypeOrmModule.forFeature([EntityOrmEntity]), CqrsModule],
  providers: [
    { provide: 'IEntityRepository', useClass: EntityRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ]
})
```

## Authentication & Authorization

- **Google OAuth** + **JWT** hybrid authentication
- Use `@UseGuards(JwtAuthGuard)` for protected endpoints
- Access current user with `@CurrentUser()` decorator
- Role-based authorization with `@Roles()` + `RolesGuard`
- Auth flow: Google OAuth → User registration/login → JWT token → Frontend redirect

## Database & ORM

- **PostgreSQL** with **TypeORM**
- ORM entities suffixed `.orm-entity.ts` (NOT domain entities)
- Mappers convert between ORM and Domain: `{Entity}Mapper.toPersistence()` / `toDomain()`
- Use `autoLoadEntities: true` and `synchronize` only in development
- Environment-based configuration via `ConfigService`

## Development Commands

just tell me the commands i can use to run the project.

## Key Dependencies & Usage

- `@nestjs/cqrs`: Command/Query handlers, EventBus
- `@nestjs/typeorm`: Database integration
- `@nestjs/passport`: Authentication strategies
- `class-validator` + `class-transformer`: DTO validation
- `bcrypt`: Password hashing (if needed)

## Adding New Features

1. **Create Module**: Follow the established folder structure
2. **Domain First**: Start with entities, value objects, and repository interfaces
3. **Infrastructure**: Implement ORM entities, repositories, and mappers
4. **Application**: Add CQRS commands/queries with handlers
5. **Presentation**: Create controllers with proper guards
6. **Registration**: Update module providers and imports in `app.module.ts`

## Common Pitfalls to Avoid

- ❌ Don't put business logic in controllers or services
- ❌ Don't use ORM entities in domain layer
- ❌ Don't forget to register CQRS handlers in module arrays
- ❌ Don't use direct TypeORM repositories in application layer
- ❌ Don't expose domain entities directly via REST - use DTOs

## Environment Configuration

Required environment variables:
- `DB_*`: PostgreSQL connection details
- `JWT_SECRET`: JWT signing secret
- `GOOGLE_CLIENT_*`: Google OAuth credentials
- `FRONTEND_URL`: For OAuth redirects
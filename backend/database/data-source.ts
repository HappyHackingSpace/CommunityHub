import { join } from 'path';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource used by the migration CLI (see the `migration:*` scripts
 * in package.json). Connection values come from the environment, falling back
 * to the defaults documented in `.env.example`.
 */
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'communityhub',
  entities: [
    join(__dirname, '..', 'src', '**', '*.orm-entity.{ts,js}'),
    join(__dirname, '..', 'src', '**', '*.schema.{ts,js}'),
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});

export default AppDataSource;

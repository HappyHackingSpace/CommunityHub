import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: '.env.local' });

// Determine if we're running compiled JavaScript or TypeScript
const isCompiled = __filename.endsWith('.js');
const extension = isCompiled ? 'js' : 'ts';
const baseDir = isCompiled ? 'dist' : 'src';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'communityhub',
  entities: [
    path.join(__dirname, `../**/*.schema.${extension}`),
  ],
  migrations: [path.join(__dirname, `migrations/*.${extension}`)],
  synchronize: false,
  logging: true,
});

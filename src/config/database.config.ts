import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER,
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNC === 'true',
  autoLoadEntities: process.env.DATABASE_AUTOLOAD === 'true',
}));

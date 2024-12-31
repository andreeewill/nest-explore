import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export async function dropDatabase(config: ConfigService): Promise<void> {
  try {
    // Create connection to the datasource
    const AppDataSource = new DataSource({
      type: 'postgres',
      synchronize: config.get('database.synchronize'), // should not use this in prod
      port: config.get('database.port'),
      username: config.get('database.user'),
      password: config.get('database.password'),
      host: config.get('database.host'),
      database: config.get('DATABASE_NAME'),
    });

    // Drop all tables
    await AppDataSource.dropDatabase();

    // Close connection
    await AppDataSource.destroy();
  } catch (error) {
    console.log('err', error);
    throw error;
  }
}

import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

import { completeUser } from './users-post.e2ee-spec.data-sample';
import { dropDatabase } from 'test/helpers/drop-database.helper';
import { bootstratNestApplication } from 'test/helpers/bootstarp-nest-application.helper';

describe('Users controller @Post Endpoints (e2e)', () => {
  let app: INestApplication;
  let config: ConfigService;

  beforeEach(async () => {
    // instantiating application
    console.log('BEFOREEACH');
    app = await bootstratNestApplication();
    console.log('app', app);
    config = app.get(ConfigService);
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(() => resolve('ok'), 1000));

    console.log('ok', config);
    await dropDatabase(config);

    console.log('ok2');
    await app.close();
  });

  it('/users - Endpoint is public', () => {
    console.log(completeUser);

    return request(app.getHttpServer()).post('/users').send({}).expect(400);
  });
});

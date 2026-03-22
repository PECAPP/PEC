import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    const email = `meta_admin_${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'Passw0rd!',
        name: 'Meta Admin',
        role: 'college_admin',
      })
      .expect(201);

    adminToken = registerResponse.body.access_token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  const listEndpoints = [
    '/courses',
    '/attendance',
    '/enrollments',
    '/timetable',
  ];

  it.each(listEndpoints)(
    'GET %s returns strict meta contract',
    async (endpoint) => {
      const response = await request(app.getHttpServer())
        .get(endpoint)
        .query({ limit: 5, offset: 0 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(typeof response.body.meta.total).toBe('number');
      expect(typeof response.body.meta.limit).toBe('number');
      expect(typeof response.body.meta.offset).toBe('number');
      expect(Number.isInteger(response.body.meta.total)).toBe(true);
      expect(Number.isInteger(response.body.meta.limit)).toBe(true);
      expect(Number.isInteger(response.body.meta.offset)).toBe(true);
      expect(response.body.meta.total).toBeGreaterThanOrEqual(0);
      expect(response.body.meta.limit).toBeGreaterThanOrEqual(1);
      expect(response.body.meta.offset).toBeGreaterThanOrEqual(0);
    },
  );
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

describe('Security (e2e)', () => {
  describe('Auth Rate Limit', () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      configureApp(app);
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    it('limits repeated failed login attempts on /auth/login', async () => {
      for (let i = 0; i < 8; i += 1) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'no-user@example.com',
            password: 'WrongPassw0rd!',
          })
          .expect(401);
      }

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'no-user@example.com',
          password: 'WrongPassw0rd!',
        })
        .expect(429);
    });
  });

  describe('HTTPS Redirect (production)', () => {
    let app: INestApplication;
    const previousNodeEnv = process.env.NODE_ENV;

    beforeAll(async () => {
      process.env.NODE_ENV = 'production';

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      configureApp(app);
      await app.init();
    });

    afterAll(async () => {
      process.env.NODE_ENV = previousNodeEnv;
      await app.close();
    });

    it('redirects insecure requests to HTTPS in production', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(301);
      expect(response.headers.location).toContain('https://');
    });

    it('allows request when forwarded proto is https in production', async () => {
      await request(app.getHttpServer())
        .get('/')
        .set('x-forwarded-proto', 'https')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Headers & CORS', () => {
    let app: INestApplication;
    const previousNodeEnv = process.env.NODE_ENV;
    const previousCorsOrigins = process.env.CORS_ORIGINS;
    const previousCorsCreds = process.env.CORS_ALLOW_CREDENTIALS;

    beforeAll(async () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGINS = 'https://app.example.com';
      process.env.CORS_ALLOW_CREDENTIALS = 'true';

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      configureApp(app);
      await app.init();
    });

    afterAll(async () => {
      process.env.NODE_ENV = previousNodeEnv;
      process.env.CORS_ORIGINS = previousCorsOrigins;
      process.env.CORS_ALLOW_CREDENTIALS = previousCorsCreds;
      await app.close();
    });

    it('sets hardening headers and disables x-powered-by', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .set('x-forwarded-proto', 'https')
        .expect(200);

      expect(response.headers['content-security-policy']).toContain(
        "default-src 'none'",
      );
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('allows configured CORS origins only', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .set('Origin', 'https://app.example.com')
        .set('x-forwarded-proto', 'https')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe(
        'https://app.example.com',
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});

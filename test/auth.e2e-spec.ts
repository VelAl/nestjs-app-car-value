import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { SanitizedUserDto } from '../src/users/users.dtos';
import { isSanitizedUserDto } from '../src/utils';

describe('Authentication E2E', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const email = 'test_1@test.com';
    return request(app.getHttpServer())
      .post('/users/signup')
      .send({ email, password: 'test' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body as SanitizedUserDto;
        expect(id).toBeDefined();
        expect(email).toBe(email);
      });
  });

  it('signup as a new user then get the currently signed in user', async () => {
    const email = 'test_2@test.com';
    const password = 'test';

    const res = await request(app.getHttpServer())
      .post('/users/signup')
      .send({ email, password })
      .expect(201);

    const { id } = res.body as SanitizedUserDto;

    const cookie = res.get('Set-Cookie');

    const get_user_by_id_response = await request(app.getHttpServer())
      .get(`/users/${id}`)
      .set('Cookie', cookie!)
      .expect(200);

    const rawBody: unknown = get_user_by_id_response.body;

    if (!isSanitizedUserDto(rawBody)) {
      throw new Error('Invalid response body shape');
    }

    expect(rawBody.id).toBe(id);
    expect(rawBody.email).toBe(email);
  });
});

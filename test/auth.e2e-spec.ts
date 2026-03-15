import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { SanitizedUserDto } from 'src/users/users.dtos';

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
});

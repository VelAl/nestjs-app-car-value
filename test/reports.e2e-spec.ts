import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { UserRole } from '../src/app.types';

type CreateReportPayload = {
  make: string;
  model: string;
  year: number;
  lng: number;
  lat: number;
  mileage: number;
  price: number;
};

type ReportResponse = CreateReportPayload & {
  id: number;
  approved: boolean;
  userId: number;
};

type EstimateResponse = {
  price: number | string | null;
};

const baseReport: Omit<CreateReportPayload, 'price' | 'mileage'> = {
  make: 'bmw',
  model: 'x5',
  year: 2020,
  lng: 45,
  lat: 45,
};

describe('Reports E2E', () => {
  let app: INestApplication<App>;
  let usersRepo: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersRepo = app.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await app.close();
  });

  const signup = async (email: string) => {
    const response = await request(app.getHttpServer())
      .post('/users/signup')
      .send({ email, password: 'test' })
      .expect(201);

    const cookie = response.get('Set-Cookie');

    if (!cookie) {
      throw new Error('Expected auth cookie after signup');
    }

    return cookie;
  };

  const createReport = async (
    cookie: string[],
    report: CreateReportPayload,
    expectedStatus = 201,
  ) => {
    return request(app.getHttpServer())
      .post('/reports')
      .set('Cookie', cookie)
      .send(report)
      .expect(expectedStatus);
  };

  it('creates a report only for authenticated users', async () => {
    await createReport(
      [],
      {
        ...baseReport,
        mileage: 10000,
        price: 25000,
      },
      401,
    );

    const cookie = await signup('report_user_1@test.com');
    const response = await createReport(cookie, {
      ...baseReport,
      mileage: 10000,
      price: 25000,
    });
    const createdReport = response.body as ReportResponse;

    expect(createdReport).toMatchObject({
      approved: false,
      make: baseReport.make,
      model: baseReport.model,
      year: baseReport.year,
      lng: baseReport.lng,
      lat: baseReport.lat,
      mileage: 10000,
      price: 25000,
    });
    expect(createdReport.id).toBeDefined();
    expect(createdReport.userId).toBeDefined();
  });

  it('returns estimate using nearby approved reports', async () => {
    const regularUserCookie = await signup('report_user_2@test.com');

    const firstReport = await createReport(regularUserCookie, {
      ...baseReport,
      mileage: 10000,
      price: 20000,
    });
    const secondReport = await createReport(regularUserCookie, {
      ...baseReport,
      mileage: 12000,
      price: 22000,
    });
    const thirdReport = await createReport(regularUserCookie, {
      ...baseReport,
      mileage: 9000,
      price: 21000,
    });
    const firstReportBody = firstReport.body as ReportResponse;
    const secondReportBody = secondReport.body as ReportResponse;
    const thirdReportBody = thirdReport.body as ReportResponse;

    await createReport(regularUserCookie, {
      ...baseReport,
      mileage: 11000,
      price: 50000,
    });

    const adminCookie = await signup('report_admin@test.com');

    await usersRepo.update(
      { email: 'report_admin@test.com' },
      { role: UserRole.ADMIN },
    );

    await request(app.getHttpServer())
      .patch(`/reports/${firstReportBody.id}`)
      .set('Cookie', regularUserCookie)
      .send({ approved: true })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/reports/${firstReportBody.id}`)
      .set('Cookie', adminCookie)
      .send({ approved: true })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/reports/${secondReportBody.id}`)
      .set('Cookie', adminCookie)
      .send({ approved: true })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/reports/${thirdReportBody.id}`)
      .set('Cookie', adminCookie)
      .send({ approved: true })
      .expect(200);

    const estimateResponse = await request(app.getHttpServer())
      .get('/reports/estimate')
      .query({
        make: baseReport.make,
        model: baseReport.model,
        year: 2021,
        lng: 44,
        lat: 44,
        mileage: 11000,
      })
      .expect(200);
    const estimateBody = estimateResponse.body as EstimateResponse;

    expect(Number(estimateBody.price)).toBe(21000);
  });
});

# Car Value Estimator API

A RESTful API that estimates used car prices based on crowd-sourced reports. Users submit sale prices for vehicles they own; the system averages approved reports with similar make, model, year, mileage, and location to produce an estimate for any queried car.

## About this project

Hands-on course project from [NestJS: The Complete Developer's Guide](https://www.udemy.com/course/nestjs-the-complete-developers-guide/) (Stephen Grider), covering auth, guards, interceptors, TypeORM, and E2E testing.  
[Certificate of completion](https://ude.my/UC-a75dccd8-5a9c-44d1-b16e-447c71736535)

---

## What it does

- **Auth** — sign up / sign in / sign out via cookie-based sessions; passwords hashed with `scrypt` + salt
- **Reports** — authenticated users submit car sale reports (make, model, year, mileage, location, price)
- **Approval** — admins approve or reject submitted reports
- **Estimation** — query `/reports/estimate` to get an average price from up to 3 approved reports matching make/model, ±3 years, ±5° lat/lng, sorted by closest mileage

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | NestJS 11 (Express) |
| Language | TypeScript 5 |
| ORM | TypeORM 0.3 |
| Database | SQLite (file-based, zero setup) |
| Auth | cookie-session + scrypt |
| Validation | class-validator / class-transformer |
| Config | @nestjs/config + `.env.*` files |
| Testing | Jest + Supertest (unit + E2E) |

---

## Key patterns

- **Dependency injection** — NestJS constructor-based DI throughout
- **DTO validation + serialization** — separate DTOs for input (class-validator) and output (class-transformer `@Expose`)
- **Custom guards** — `AuthGuard` (session check) and `AdminGuard` (role check) protecting routes declaratively
- **Custom decorator** — `@CurrentUser()` pulls the authenticated user from the request inside controllers
- **Interceptors** — `SerializeInterceptor` strips sensitive fields (e.g. password) from responses
- **Middleware** — `CurrentUserMiddleware` resolves the user entity from the session on every request
- **Environment-split databases** — `.env.dev` / `.env.test` point to separate SQLite files so E2E tests never touch dev data

---

## Project structure

```
src/
├── users/          auth, user CRUD, session handling
├── reports/        report submission, approval, estimate endpoint
├── guards/         AuthGuard, AdminGuard
├── interceptors/   SerializeInterceptor
└── app.module.ts   root config, middleware registration

test/               E2E specs (auth flows, report & estimate flows)
```

---

## Running locally

```bash
npm install
npm run start:dev   # http://localhost:3000
```

```bash
npm run test        # unit tests
npm run test:e2e    # end-to-end tests
```

> Requires Node 20+. No external database needed — SQLite files are created automatically.

---

## API overview

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users/signup` | — | Register |
| POST | `/users/signin` | — | Sign in |
| POST | `/users/signout` | user | Sign out |
| GET | `/users/:id` | user | Get user |
| PATCH | `/users/:id` | user | Update user |
| DELETE | `/users/:id` | user | Delete user |
| POST | `/reports` | user | Submit a report |
| PATCH | `/reports/:id` | admin | Approve / reject |
| GET | `/reports/estimate` | — | Get price estimate |

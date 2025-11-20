# Backend — Auth (Login) & Users Documentation

This document describes the Login (Auth) and Users modules, how to test them, and the environment variables relevant for authentication and lockout behavior.

## Endpoints (Auth)

- `POST /api/auth/login` — Login with `username` or `email` and `password`.
  - Request JSON example:
    ```json
    { "username": "devadmin", "password": "12345678" }
    ```
  - Success response: `200` with `{ accessToken, refreshToken, user }`.
  - Failure responses:
    - `401` `{"message":"Credenciales inválidas"}` — wrong username/password.
    - `401` `{"message":"Cuenta bloqueada temporalmente"}` — user locked due to repeated failed attempts.

- `POST /api/auth/register` — Create new user (Register DTO).
- `POST /api/auth/refresh` — Refresh tokens.
- `GET /api/auth/me` — Get profile (requires auth).
- `POST /api/auth/logout` — Logout (stateless here, just a log).
- `PATCH /api/auth/change-password` — Change password (requires current password).

## Endpoints (Users)

- `GET /api/users` — List users.
- `POST /api/users` — Create user (admin).
- `GET /api/users/:id` — Get user.
- `PATCH /api/users/:id` — Update user.
- `PATCH /api/users/:id/password` — Update user password (admin or self).
- `PATCH /api/users/:id/toggle-active` — Toggle active flag.

## User entity notes

- Database column `password` is mapped in the entity to the property `passwordHash` via TypeORM decorator.
- Important fields used by auth logic:
  - `passwordHash` (DB column `password`) — bcrypt hash stored.
  - `failedLoginAttempts` (DB column `failed_login_attempts`) — integer counter.
  - `lockedUntil` (DB column `locked_until`) — timestamp when lock expires (nullable).
  - `lastLogin` (DB column `last_login`) — timestamp of last successful login.

## Password hashing

- Backend uses bcrypt with configurable salt rounds (default 12 in `auth.service.ts`).
- When you need to update a user's password from scripts, generate a bcrypt hash with the same salt rounds and save it to the `password` column.

## Lockout behavior

- Configurable via environment variables (see below). Defaults used by service if env vars are not present:
  - `MAX_FAILED_ATTEMPTS`: 5
  - `LOCK_DURATION_MINUTES`: 30

- On failed login the server increments `failedLoginAttempts`. When it reaches `MAX_FAILED_ATTEMPTS` the server sets `lockedUntil = now + LOCK_DURATION_MINUTES`.

## Environment variables (backend)

Recommended `.env` keys for the backend (add to your environment or `.env`):

- `SRC_DATABASE_URL` — e.g. `postgres://postgres:password@localhost:5432/erp_carniceria`
- `STAGING_DATABASE_URL` — staging DB URL if used.
- `JWT_SECRET` — secret for signing JWT.
- `JWT_EXPIRATION` — e.g. `15m`.
- `JWT_REFRESH_EXPIRATION` — e.g. `7d`.
- `MAX_FAILED_ATTEMPTS` — e.g. `10` (optional override).
- `LOCK_DURATION_MINUTES` — e.g. `30`.

## Quick test steps

1. Ensure the backend is running (from `/backend`):
   ```bash
   npm run start:dev
   ```

2. Test login (single-line curl):
   ```bash
   curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"devadmin","password":"12345678"}'
   ```

3. Expected successful response contains `accessToken`, `refreshToken`, and `user` object.

4. If you receive `Cuenta bloqueada temporalmente`:
   - Inspect DB: `SELECT failed_login_attempts, locked_until FROM users WHERE username='devadmin';`
   - To immediately unlock (DB admin): `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE username = 'devadmin';`

## Notes for maintainers

- The code uses `User.passwordHash` property to read/write the DB `password` column; do not rename the DB column without updating the entity mapping.
- Keep `bcrypt` salt rounds consistent across scripts and runtime.
- Use environment variables to tune lockout policy in production.

If you want, I can add these env keys to a root `/.env.example` or `backend/.env.example` file and commit it.
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

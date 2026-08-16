# Nest Commerce API

A NestJS backend for an e-commerce platform — auth, catalog, cart, orders, Stripe payments, reviews, and admin tooling, backed by PostgreSQL via Prisma.

## Stack

- **NestJS 11** on Express
- **Prisma ORM 7** + PostgreSQL (via `@prisma/adapter-pg`)
- **Stripe** for payments, **Resend** for transactional email
- **Passport JWT** for auth (access + refresh tokens)
- **Swagger** for API docs

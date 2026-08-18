# Nest Commerce API

Nest Commerce is a production-style e-commerce backend built with NestJS, secured with role-based access control (USER, ADMIN, DRIVER). It handles JWT authentication with email verification and password reset, a product/category catalog, cart and checkout, order lifecycle management, Stripe-powered payments with webhook reconciliation and refunds, and admin-only management endpoints — with transactional email notifications throughout via Resend.

## Stack

- **NestJS 11** on Express
- **Prisma ORM 7** + PostgreSQL (via `@prisma/adapter-pg`)
- **Stripe** for payments, **Resend** for transactional email
- **Passport JWT** for auth (access + refresh tokens)
- **Swagger** for API docs

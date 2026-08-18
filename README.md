# Nest Commerce

A full-stack e-commerce platform for a luxury jewelry storefront - NestJS
API + Next.js storefront, in one repo. Real auth (JWT access/refresh,
email verification, password reset), a product/category catalog, cart
and checkout, Stripe-powered payments with webhook reconciliation, order
history, saved addresses, and product reviews — role-gated for
`USER`/`ADMIN`/`DRIVER`.

## Structure

```
nest-commerce/
├── api/       # NestJS backend — REST API, Prisma/PostgreSQL, Stripe, Resend
└── client/    # Next.js frontend — App Router, Server Actions, TanStack Query
```

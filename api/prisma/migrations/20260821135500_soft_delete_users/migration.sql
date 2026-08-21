-- AlterTable: users are now soft-deleted (anonymized + deletedAt set)
-- instead of hard-deleted, so Order/Payment history survives account
-- deletion for accounting/tax/dispute records.
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);

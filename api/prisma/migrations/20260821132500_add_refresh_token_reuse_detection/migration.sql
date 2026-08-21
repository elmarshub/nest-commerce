-- AlterTable
ALTER TABLE "users" ADD COLUMN "refreshTokenId" TEXT,
ADD COLUMN "previousRefreshTokenId" TEXT;

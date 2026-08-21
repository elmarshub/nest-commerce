-- AlterTable: drop the old single-slot refresh token tracking on User
ALTER TABLE "users" DROP COLUMN IF EXISTS "refreshToken";
ALTER TABLE "users" DROP COLUMN IF EXISTS "refreshTokenId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "previousRefreshTokenId";

-- CreateTable: one row per login/device, so rotation and reuse detection
-- are scoped per session instead of shared across a user's whole account
CREATE TABLE "refresh_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "currentRefreshTokenId" TEXT NOT NULL,
    "previousRefreshTokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "refresh_sessions_userId_idx" ON "refresh_sessions"("userId");

ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

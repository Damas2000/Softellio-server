-- Add portalAccess field to users table
ALTER TABLE "users" ADD COLUMN "portalAccess" BOOLEAN NOT NULL DEFAULT false;

-- Create portal_sessions table
CREATE TABLE "portal_sessions" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_sessions_pkey" PRIMARY KEY ("id")
);

-- Create indexes for portal_sessions
CREATE UNIQUE INDEX "portal_sessions_token_key" ON "portal_sessions"("token");
CREATE INDEX "portal_sessions_userId_idx" ON "portal_sessions"("userId");
CREATE INDEX "portal_sessions_token_expiresAt_idx" ON "portal_sessions"("token", "expiresAt");
CREATE INDEX "portal_sessions_expiresAt_idx" ON "portal_sessions"("expiresAt");

-- Add foreign key
ALTER TABLE "portal_sessions" ADD CONSTRAINT "portal_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index on portalAccess for quick filtering
CREATE INDEX "users_portalAccess_idx" ON "users"("portalAccess");
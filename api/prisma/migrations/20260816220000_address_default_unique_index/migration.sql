-- Ensure at most one default address per user, enforced at the database level
-- to close a race window between the existingCount check and the create/update
-- transaction in AddressesService.
CREATE UNIQUE INDEX "addresses_userId_default_unique" ON "addresses"("userId") WHERE "isDefault" = true;

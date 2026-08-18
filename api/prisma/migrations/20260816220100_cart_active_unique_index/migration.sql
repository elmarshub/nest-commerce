-- Ensure at most one not-yet-checked-out cart per user, enforced at the
-- database level to close a race window between the lookup and create in
-- CartsService.getOrCreateActiveCart.
CREATE UNIQUE INDEX "carts_userId_active_unique" ON "carts"("userId") WHERE "checkedOut" = false;

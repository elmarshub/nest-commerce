import { Throttle } from '@nestjs/throttler';

// strict rate for auth, payments
export const StrictThrottle = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 3,
    },
  });

//   moderate rate for orders
export const ModerateThrottle = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 5,
    },
  });

//   relaxed rate for read operation
export const RelaxedThrottle = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 5,
    },
  });

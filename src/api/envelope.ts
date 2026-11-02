import type { ApiEnvelope } from '@/types';

import { ApiError } from './errors';

/**
 * Unwraps a backend envelope, turning `success:false` and missing bodies
 * into `ApiError`s that already carry the backend message.
 */
export function unwrapEnvelope<T>(envelope: ApiEnvelope<T> | null | undefined, fallbackMessage: string): T {
  if (envelope === null || envelope === undefined) {
    throw new ApiError(fallbackMessage);
  }
  if (envelope.success !== true) {
    const message = typeof envelope.message === 'string' ? envelope.message.trim() : '';
    throw new ApiError(message.length > 0 ? message : fallbackMessage);
  }
  return envelope.data;
}

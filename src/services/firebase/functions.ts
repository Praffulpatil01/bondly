import { httpsCallable, type HttpsCallableResult } from 'firebase/functions';
import { functions } from './config';

// ============================================
// Cloud Functions Service
// ============================================

/**
 * Call a Firebase Cloud Function by name.
 * Provides type safety for request and response.
 */
export async function callFunction<TRequest = unknown, TResponse = unknown>(
  functionName: string,
  data?: TRequest,
): Promise<TResponse> {
  const callable = httpsCallable<TRequest, TResponse>(functions, functionName);
  const result: HttpsCallableResult<TResponse> = await callable(data as TRequest);
  return result.data;
}

/**
 * Pre-defined callable function references.
 * Add new function references here as Cloud Functions are created.
 */
export const cloudFunctions = {
  // Example: sendNotification: (data: SendNotificationPayload) => callFunction('sendNotification', data),
} as const;

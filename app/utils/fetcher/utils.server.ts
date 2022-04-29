import type { HttpSucceedResponse, HttpResponse } from './types';

export function succeedAll<T, K>(
  res: HttpResponse<T, K>[],
): res is HttpSucceedResponse<T>[] {
  // data が全て Truthy
  return res.every(({ data }) => !!data);
}

export function failedSome<T, K>(
  res: HttpResponse<T, K>[],
): res is HttpResponse<T, K>[] {
  // err がいずれか Truthy
  return res.some(({ err }) => !!err);
}

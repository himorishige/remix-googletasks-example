import type { HttpData, HttpError, HttpResponse } from './types';

export async function fetchData<T, K>(
  // Native fetch を return する関数
  fetcher: () => Promise<Response>,
): Promise<HttpResponse<T, K>> {
  const r = await fetcher();
  const d = await r.json();
  const { status } = r;
  if (r.ok) {
    // HttpData型に畳み込む
    const res: HttpData = { data: d, status };
    return res;
  }
  // HttpError型に畳み込む
  const res_1: HttpError = { err: d, status };
  return res_1;
}

export type HttpData<T = any> = {
  data: T;
  status: number;
};

export type HttpError<T = any> = {
  err: T;
  status: number;
};

export type HttpSucceedResponse<T> = HttpData<T> & {
  err?: undefined;
};

export type HttpFailedResponse<T> = HttpError<T> & {
  data?: undefined;
};

export type HttpResponse<T, K> = HttpSucceedResponse<T> | HttpFailedResponse<K>;

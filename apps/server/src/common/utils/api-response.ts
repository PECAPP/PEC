export type ApiMeta = {
  limit?: number;
  offset?: number;
  total?: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: ApiMeta;
};

export const ok = <T>(data: T, meta?: ApiMeta): ApiSuccess<T> => ({
  success: true,
  data,
  ...(meta ? { meta } : {}),
});

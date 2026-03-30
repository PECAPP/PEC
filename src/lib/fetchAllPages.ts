import api from '@/lib/api';

type Envelope<T> = {
  success?: boolean;
  data?: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
};

const toArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as Envelope<T[]>;
    if (Array.isArray(envelope.data)) {
      return envelope.data;
    }
  }

  return [];
};

const getTotal = (payload: unknown): number | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const meta = (payload as Envelope<unknown>).meta;
  if (!meta || typeof meta.total !== 'number') {
    return null;
  }

  return meta.total;
};

export async function fetchAllPages<T>(
  path: string,
  params: Record<string, unknown> = {},
  pageSize = 200,
): Promise<T[]> {
  const baseParams = { ...params };
  delete (baseParams as Record<string, unknown>).limit;
  delete (baseParams as Record<string, unknown>).offset;

  const firstPage = await api.get(path, {
    params: { ...baseParams, limit: pageSize, offset: 0 },
  });

  const firstData = toArray<T>(firstPage.data);
  const total = getTotal(firstPage.data);

  if (total !== null) {
    if (total <= firstData.length) {
      return firstData;
    }

    const remainingOffsets: number[] = [];
    for (let offset = firstData.length; offset < total; offset += pageSize) {
      remainingOffsets.push(offset);
    }

    const remainingPages = await Promise.all(
      remainingOffsets.map((offset) =>
        api.get(path, {
          params: { ...baseParams, limit: pageSize, offset },
        }),
      ),
    );

    return [
      ...firstData,
      ...remainingPages.flatMap((page) => toArray<T>(page.data)),
    ];
  }

  // Fallback for endpoints that do not return meta.total.
  const all = [...firstData];
  let offset = firstData.length;
  let lastPageSize = firstData.length;

  while (lastPageSize === pageSize) {
    const page = await api.get(path, {
      params: { ...baseParams, limit: pageSize, offset },
    });
    const rows = toArray<T>(page.data);
    if (rows.length === 0) {
      break;
    }
    all.push(...rows);
    offset += rows.length;
    lastPageSize = rows.length;
  }

  return all;
}

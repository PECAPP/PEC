type ListQuery = {
  limit?: number;
  offset?: number;
  cursorId?: string; // Added for cursor-based pagination
};

type FindManyCountDelegate<TItem, TWhere, TOrderBy> = {
  findMany: (args: {
    where?: TWhere;
    take?: number;
    skip?: number;
    cursor?: any;
    orderBy?: TOrderBy | TOrderBy[];
  }) => Promise<TItem[]>;
  count: (args: { where?: TWhere }) => Promise<number>;
};

export type PaginatedResult<TItem> = {
  items: TItem[];
  total: number;
  limit: number;
  offset?: number;
  nextCursor?: string | null;
};

export abstract class BaseRepository {
  protected resolvePagination(
    query: ListQuery,
    defaultLimit: number,
    maxLimit = 200,
  ): { take: number; skip: number } {
    const requestedLimit = query.limit ?? defaultLimit;
    const take = Math.min(Math.max(requestedLimit, 1), maxLimit);
    const skip = Math.max(query.offset ?? 0, 0);

    return { take, skip };
  }

  // Legacy Offset Pagination
  protected async findManyWithCount<TItem, TWhere, TOrderBy>(
    delegate: FindManyCountDelegate<TItem, TWhere, TOrderBy>,
    options: {
      query: ListQuery;
      defaultLimit: number;
      maxLimit?: number;
      where?: TWhere;
      orderBy?: TOrderBy | TOrderBy[];
    },
  ): Promise<PaginatedResult<TItem>> {
    const { take, skip } = this.resolvePagination(
      options.query,
      options.defaultLimit,
      options.maxLimit,
    );

    const [items, total] = await Promise.all([
      delegate.findMany({ where: options.where,
        take,
        skip,
        orderBy: options.orderBy,
      }),
      delegate.count({ where: options.where }),
    ]);

    return {
      items,
      total,
      limit: take,
      offset: skip,
    };
  }

  // Optimized Cursor Pagination for Heavy Tables
  protected async findManyWithCursor<TItem extends { id: string }, TWhere, TOrderBy>(
    delegate: FindManyCountDelegate<TItem, TWhere, TOrderBy>,
    options: {
      query: ListQuery;
      defaultLimit: number;
      maxLimit?: number;
      where?: TWhere;
      orderBy?: TOrderBy | TOrderBy[];
    },
  ): Promise<PaginatedResult<TItem>> {
    const requestedLimit = options.query.limit ?? options.defaultLimit;
    const take = Math.min(Math.max(requestedLimit, 1), options.maxLimit ?? 200);
    const cursor = options.query.cursorId ? { id: options.query.cursorId } : undefined;

    const [items, total] = await Promise.all([
      delegate.findMany({
        where: options.where,
        take: take + 1, // Fetch one extra to check if there is a next page
        skip: cursor ? 1 : 0, // Skip the cursor itself
        cursor: cursor,
        orderBy: options.orderBy,
      }),
      delegate.count({ where: options.where }),
    ]);

    let nextCursor: string | null = null;
    if (items.length > take) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      items,
      total,
      limit: take,
      nextCursor,
    };
  }
}

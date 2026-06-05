type ListQuery = {
  limit?: number;
  offset?: number;
};

type FindManyCountDelegate<TItem, TWhere, TOrderBy> = {
  findMany: (args: {
    where?: TWhere;
    take: number;
    skip: number;
    orderBy?: TOrderBy | TOrderBy[];
  }) => Promise<TItem[]>;
  count: (args: { where?: TWhere }) => Promise<number>;
};

export type PaginatedResult<TItem> = {
  items: TItem[];
  total: number;
  limit: number;
  offset: number;
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
      delegate.findMany({
        where: options.where,
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
}

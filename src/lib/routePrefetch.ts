const prefetched = new Set<string>();
let routeImportMapPromise: Promise<
  Record<string, () => Promise<unknown>>
> | null = null;

const loadRouteImportMap = async () => {
  if (!routeImportMapPromise) {
    routeImportMapPromise = import("./routePrefetchMap").then(
      (mod) => mod.routeImportMap,
    );
  }
  return routeImportMapPromise;
};

export async function prefetchRoute(path: string) {
  if (process.env.NODE_ENV !== "production" || prefetched.has(path)) {
    return;
  }

  const routeImportMap = await loadRouteImportMap();
  const importer = routeImportMap[path];
  if (!importer) return;

  prefetched.add(path);
  await importer().catch(() => {
    prefetched.delete(path);
  });
}

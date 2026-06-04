const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const normalizeApiBasePath = (value: string) => {
  const trimmed = value.trim();
  const ensuredLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return ensuredLeadingSlash.replace(/\/$/, "") || "/api";
};

export const resolveApiBaseUrl = () => {
  const configuredBase = API_BASE_URL.trim();

  if (!configuredBase) {
    return "/api";
  }

  if (configuredBase.startsWith("http")) {
    return configuredBase.replace(/\/$/, "");
  }

  const normalizedPath = normalizeApiBasePath(configuredBase);

  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalizedPath}`;
  }

  return new URL(normalizedPath, SITE_URL).toString();
};

export const buildApiUrl = (route: string, params?: Record<string, any>) => {
  const baseUrl = resolveApiBaseUrl();

  if (
    !route.startsWith("http") &&
    route.startsWith("/") &&
    baseUrl.startsWith("http")
  ) {
    const base = new URL(baseUrl);
    const basePath =
      base.pathname && base.pathname !== "/" ? base.pathname.replace(/\/$/, "") : "";
    const merged = `${base.origin}${basePath}${route}`;
    const url = new URL(merged);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, String(item)));
          return;
        }
        url.searchParams.set(key, String(value));
      });
    }
    return url.toString();
  }

  const url = route.startsWith("http") ? new URL(route) : new URL(route, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, String(item)));
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

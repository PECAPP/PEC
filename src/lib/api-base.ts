const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const resolveApiBaseUrl = () => {
  if (API_BASE_URL.startsWith("http")) {
    return API_BASE_URL;
  }
  if (API_BASE_URL.startsWith("/") && typeof window !== "undefined") {
    return `${window.location.origin}${API_BASE_URL}`;
  }
  if (API_BASE_URL.startsWith("/")) {
    return new URL(API_BASE_URL, SITE_URL).toString();
  }
  return API_BASE_URL;
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

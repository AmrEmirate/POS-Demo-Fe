/**
 * Cloud Multi-Tenant POS & Accounting API Client (Demo Sandbox Mode)
 * Terisolasi 100% di browser (localStorage + in-memory) tanpa menyentuh database produksi.
 */
import { handleDemoRequest } from './demoBackend';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('dimsum_intan_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('dimsum_intan_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('dimsum_intan_token');
};

export const getTenantSlug = (): string | null => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('tenant');
    if (querySlug) return querySlug.toLowerCase().trim();

    const host = window.location.hostname;
    if (host && (host.includes('.posmu.cloud') || host.includes('.vimtk.cloud'))) {
      const parts = host.split('.');
      if (parts.length >= 3 && parts[0] !== 'api' && parts[0] !== 'admin' && parts[0] !== 'www') {
        let extracted = parts[0].toLowerCase();
        if (extracted.startsWith('pos-')) {
          extracted = extracted.replace(/^pos-/, '');
        }
        return extracted;
      }
    }
  }

  return localStorage.getItem('dimsum_tenant_slug');
};

export const setTenantSlug = (slug: string): void => {
  localStorage.setItem('dimsum_tenant_slug', slug);
};

export const clearTenantSlug = (): void => {
  localStorage.removeItem('dimsum_tenant_slug');
};

export const getActiveTenantId = (): string | null => {
  return localStorage.getItem('dimsum_active_tenant_id');
};

export const setActiveTenantId = (id: string): void => {
  localStorage.setItem('dimsum_active_tenant_id', id);
};

export const clearActiveTenantId = (): void => {
  localStorage.removeItem('dimsum_active_tenant_id');
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    return await handleDemoRequest<T>(endpoint, options);
  } catch (err: any) {
    throw new ApiError(400, err?.message || 'Terjadi kesalahan pada simulasi demo');
  }
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  postForm: <T>(endpoint: string, formData: FormData) =>
    apiRequest<T>(endpoint, { method: 'POST', body: formData }),
  put: <T>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};

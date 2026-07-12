const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const AUTH_TOKEN_KEY = 'transitops_token';
const AUTH_USER_KEY  = 'transitops_user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'DISPATCHER';
  isActive: boolean;
}

async function request<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg =
      json?.message ??
      (json?.errors ? Object.values(json.errors).flat().join('; ') : null) ??
      'Request failed';
    throw new Error(msg);
  }
  return json as T;
}

interface AuthResponse {
  status: string;
  data: { user: AuthUser; token: string };
}

export const authService = {
  /** Sign in with email + password. Stores JWT & user in localStorage. */
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await request<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.user));
    return res.data.user;
  },

  /** Register a new account. Stores JWT & user in localStorage. */
  async register(
    name: string,
    email: string,
    password: string,
    role: AuthUser['role'],
  ): Promise<AuthUser> {
    const res = await request<AuthResponse>('/auth/register', { name, email, password, role });
    localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.user));
    return res.data.user;
  },

  /** Remove all auth data from localStorage. */
  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

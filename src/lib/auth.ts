import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ACCESS_COOKIE = "srt2prompt_access_token";
const REFRESH_COOKIE = "srt2prompt_refresh_token";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type SupabaseAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
  error?: string;
  error_description?: string;
  msg?: string;
};

function supabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for auth.");
  return value.replace(/\/$/, "");
}

function supabaseKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for auth.");
  return value;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}

type AuthSession = {
  user: AuthUser;
  accessToken: string | undefined;
  refreshToken: string | undefined;
};

export async function signUpWithEmail(input: { name: string; email: string; password: string }): Promise<AuthSession> {
  const response = await fetch(`${supabaseUrl()}/auth/v1/signup`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: { name: input.name }
    })
  });

  const data = (await response.json()) as SupabaseAuthResponse;
  if (!response.ok) throw new Error(authError(data, "Could not create account."));
  if (data.access_token && data.refresh_token) setAuthCookies(data.access_token, data.refresh_token);
  return { user: normalizeUser(data.user), accessToken: data.access_token, refreshToken: data.refresh_token };
}

export async function signInWithEmail(input: { email: string; password: string }): Promise<AuthSession> {
  const response = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      email: input.email,
      password: input.password
    })
  });

  const data = (await response.json()) as SupabaseAuthResponse;
  if (!response.ok || !data.access_token || !data.refresh_token) {
    throw new Error(authError(data, "Invalid email or password."));
  }

  setAuthCookies(data.access_token, data.refresh_token);
  return { user: normalizeUser(data.user), accessToken: data.access_token, refreshToken: data.refresh_token };
}

export async function signOut() {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (token) {
    await fetch(`${supabaseUrl()}/auth/v1/logout`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        Authorization: `Bearer ${token}`
      }
    }).catch(() => null);
  }

  cookies().delete(ACCESS_COOKIE);
  cookies().delete(REFRESH_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
  if (!token && !refreshToken) return null;
  if (!token && refreshToken) return refreshSession(refreshToken);
  if (!token) return null;

  const user = await fetchUser(token);
  if (user) return user;
  if (refreshToken) return refreshSession(refreshToken);
  return null;
}

async function fetchUser(token: string) {
  const response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: {
      ...authHeaders(),
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) return null;
  const data = (await response.json()) as SupabaseAuthResponse["user"];
  return normalizeUser(data);
}

async function refreshSession(refreshToken: string) {
  const response = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  const data = (await response.json()) as SupabaseAuthResponse;
  if (!response.ok || !data.access_token || !data.refresh_token) return null;
  setAuthCookies(data.access_token, data.refresh_token);
  return normalizeUser(data.user);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return "http://localhost:3000";
}

function authHeaders() {
  const key = supabaseKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json"
  };
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  try {
    cookies().set(ACCESS_COOKIE, accessToken, cookieOptions(60 * 60));
    cookies().set(REFRESH_COOKIE, refreshToken, cookieOptions(60 * 60 * 24 * 30));
  } catch {
    // Server components can read cookies but cannot always write them.
  }
}

export function getGoogleOAuthUrl() {
  const appUrl = getAppUrl();
  const redirectTo = `${appUrl.replace(/\/$/, "")}/auth/callback`;
  const params = new URLSearchParams({
    provider: "google",
    redirect_to: redirectTo
  });

  return `${supabaseUrl()}/auth/v1/authorize?${params.toString()}`;
}

function normalizeUser(user?: SupabaseAuthResponse["user"]): AuthUser {
  if (!user?.id || !user.email) {
    throw new Error("Supabase did not return a valid user.");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name
  };
}

function authError(data: SupabaseAuthResponse, fallback: string) {
  return data.error_description || data.msg || data.error || fallback;
}

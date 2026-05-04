import axios from "axios";
import { Role, User } from "../types/index";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Authenticates a lab technician against the Supabase `lab_users` table.
 * Calls the `login_lab_user` RPC which verifies the bcrypt password and
 * returns a session token + user info.
 */
export async function login(
  staffId: string,
  password: string,
): Promise<{ token: string; role: Role; user: User }> {
  try {
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/login_lab_user`,
      { p_staff_id: staffId, p_password: password },
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;
    return {
      token: data.token,
      role: data.role as Role,
      user: data.user as User,
    };
  } catch (error: any) {
    // Supabase RPC errors surface in error.response.data.message
    const msg =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message;
    throw new AuthError(msg || "Invalid staff ID or password.");
  }
}

/**
 * Server-side logout is handled by token expiry.
 * Local session is cleared by AuthContext.
 */
export async function logout(): Promise<void> {
  // no-op: local SecureStore cleanup is done in AuthContext
}

export async function getCurrentUser(): Promise<User | null> {
  return null;
}

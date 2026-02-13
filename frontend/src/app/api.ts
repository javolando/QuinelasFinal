import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  withCredentials: true,
});

export type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

export async function apiMe(): Promise<User | null> {
  try {
    const r = await api.get("/auth/me");
    return r.data.user as User;
  } catch {
    return null;
  }
}

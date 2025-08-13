import { apiRequest } from "./queryClient";

export async function loginAdmin(password: string): Promise<void> {
  await apiRequest("POST", "/api/login", { password });
}

export async function logoutAdmin(): Promise<void> {
  await apiRequest("POST", "/api/logout");
}

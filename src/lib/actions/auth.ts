"use server";

import { cookies } from "next/headers";

export async function logout() {
  cookies().delete("auth_token");
  return { success: true };
}

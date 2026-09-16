import { ok } from "@/lib/utils/api";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  const res = ok({});
  res.cookies.set({ name: COOKIE_NAME, value: "", path: "/", maxAge: 0 });
  return res;
}

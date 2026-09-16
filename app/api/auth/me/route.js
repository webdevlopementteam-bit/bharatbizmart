import { getCurrentUser } from "@/lib/auth/session";
import { ok } from "@/lib/utils/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return ok({ user: null });
  return ok({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      vendor: user.vendor || null,
      avatar: user.avatar || null,
    },
  });
}

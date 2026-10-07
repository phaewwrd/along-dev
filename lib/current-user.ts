import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type CurrentUserDTO } from "@/lib/auth";

export async function getCurrentUser(): Promise<CurrentUserDTO | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };
}

export async function requireCurrentUser(): Promise<CurrentUserDTO> {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return user;
}

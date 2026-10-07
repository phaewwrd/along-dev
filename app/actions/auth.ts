"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/current-user";

export async function signOut() {
  if (!(await getCurrentUser())) redirect("/login");

  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

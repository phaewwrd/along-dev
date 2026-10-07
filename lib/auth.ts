import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000", process.env.NEXT_PUBLIC_APP_URL!],
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  secret:
    process.env.BETTER_AUTH_SECRET ?? "along-development-secret-change-me",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});

export type CurrentUserDTO = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter((o): o is string => Boolean(o)),

  emailAndPassword: {
    enabled: true,
  },
});

export type CurrentUserDTO = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

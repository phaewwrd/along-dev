import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,

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

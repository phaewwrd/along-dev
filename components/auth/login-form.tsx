"use client";

import { createAuthClient } from "better-auth/react";
import { useState } from "react";

const authClient = createAuthClient();

export function LoginForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setPending(true);

    try {
      const result = await authClient.signIn.email({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
        callbackURL: "/",
      });

      if (result.error) setError(result.error.message ?? "Unable to sign in.");
    } catch {
      setError("Unable to sign in. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" action={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

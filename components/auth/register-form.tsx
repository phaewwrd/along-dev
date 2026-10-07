"use client";

import { createAuthClient } from "better-auth/react";
import { useState } from "react";

const authClient = createAuthClient();

export function RegisterForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setPending(true);

    try {
      const result = await authClient.signUp.email({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
        callbackURL: "/",
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to create your account.");
      }
    } catch {
      setError(
        "Unable to create your account. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" action={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" type="text" autoComplete="name" required />
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
        autoComplete="new-password"
        minLength={8}
        required
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

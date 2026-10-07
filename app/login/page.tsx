import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-brand">
          <span className="brand-mark">A</span>
          <span>along</span>
        </div>
        <p className="eyebrow">Workspace access</p>
        <h1 id="login-title">Welcome back.</h1>
        <p className="auth-copy">
          Sign in to continue moving your projects forward.
        </p>
        <LoginForm />
        <p className="auth-switch">
          New to along? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

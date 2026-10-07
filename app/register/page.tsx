import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="register-title">
        <div className="auth-brand">
          <span className="brand-mark">A</span>
          <span>along</span>
        </div>
        <p className="eyebrow">Start collaborating</p>
        <h1 id="register-title">Create your account.</h1>
        <p className="auth-copy">
          Set up your workspace and keep your projects moving.
        </p>
        <RegisterForm />
        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

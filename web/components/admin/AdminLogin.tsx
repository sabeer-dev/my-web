"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export function AdminLogin({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const message = state.error ?? notice;

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="eyebrow">Sabeer Market · Staff</p>
        <h1>Price manager</h1>
        <p>Sign in with the admin account you created in Supabase Authentication.</p>

        <form action={formAction} className="admin-login-form">
          <label className="admin-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="admin-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </label>

          {message ? <p className="admin-banner is-error">{message}</p> : null}

          <button className="button button-primary" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="admin-note">
          No public sign-up. Create the account in Supabase Dashboard → Authentication → Users,
          then give it the <code>admin</code> app role.
        </p>
      </div>
    </div>
  );
}

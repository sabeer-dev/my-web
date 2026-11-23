"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/admin/actions";
import { Icon } from "./AdminIcons";

const initialState: LoginState = {};

export function AdminLogin({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const message = state.error ?? notice;

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <aside className="admin-login-aside">
          <span className="admin-brand-mark">s.</span>
          <p className="eyebrow">Sabeer Market · Staff</p>
          <h1>Keep the board honest.</h1>
          <p className="admin-login-aside-copy">
            One calm place to update today&apos;s food prices across Nigeria&apos;s busiest
            markets.
          </p>
          <div className="admin-login-highlights">
            <div>
              <Icon name="activity" size={17} />
              <span>Live price updates</span>
            </div>
            <div>
              <Icon name="store" size={17} />
              <span>Market coverage</span>
            </div>
            <div>
              <Icon name="shield" size={17} />
              <span>Staff-only access</span>
            </div>
          </div>
          <p className="admin-login-aside-foot">Price manager · Internal workspace</p>
        </aside>

        <section className="admin-login-panel">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to continue</h2>
          <p className="admin-login-intro">
            Use the admin account created in Supabase Authentication.
          </p>

          <form action={formAction} className="admin-login-form">
            <label className="admin-field">
              <span>Email address</span>
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

            {message ? (
              <p className="admin-banner is-error" role="alert">
                <Icon name="alert" size={16} />
                <span>{message}</span>
              </p>
            ) : null}

            <button className="button button-primary admin-login-submit" type="submit" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
              {pending ? null : <Icon name="external" size={15} />}
            </button>
          </form>

          <p className="admin-note">
            No public sign-up. Accounts are created in the Supabase dashboard and given the{" "}
            <code>admin</code> app role.
          </p>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type LoginState } from "@/app/seller/actions";
import { Icon } from "@/components/admin/AdminIcons";

const initialState: LoginState = {};

export function SellerLogin({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const message = state.error ?? notice;

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <aside className="admin-login-aside">
          <span className="admin-brand-mark">s.</span>
          <p className="eyebrow">Sabeer Market · Sellers</p>
          <h1>Update your prices.</h1>
          <p className="admin-login-aside-copy">
            Keep your stall information current. Your edits go straight to the public price
            board after you save.
          </p>
          <div className="admin-login-highlights">
            <div>
              <Icon name="tag" size={17} />
              <span>Only your assigned items</span>
            </div>
            <div>
              <Icon name="activity" size={17} />
              <span>Instant public updates</span>
            </div>
            <div>
              <Icon name="shield" size={17} />
              <span>Verified seller access</span>
            </div>
          </div>
          <p className="admin-login-aside-foot">Seller portal · Market partners</p>
        </aside>

        <section className="admin-login-panel">
          <p className="eyebrow">Market partner</p>
          <h2>Seller sign in</h2>
          <p className="admin-login-intro">
            Sign in with the email you registered with. New market partners can create an account
            first.
          </p>

          <form action={formAction} className="admin-login-form">
            <label className="admin-field">
              <span>Email address</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@market.ng"
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
              {pending ? "Signing in…" : "Sign in to seller portal"}
            </button>
          </form>

          <p className="admin-note">
            New here? <Link className="text-link" href="/seller/register">Register as a seller</Link>.
            Need help? Email{" "}
            <a href="mailto:shehuusmanumar176@gmail.com?subject=Seller%20account%20request">
              shehuusmanumar176@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

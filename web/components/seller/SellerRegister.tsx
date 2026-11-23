"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerSeller, type RegisterState } from "@/app/seller/actions";
import type { AdminMarket } from "@/lib/admin-types";
import { Icon } from "@/components/admin/AdminIcons";

const initialState: RegisterState = {};

export function SellerRegister({ markets }: { markets: AdminMarket[] }) {
  const [state, formAction, pending] = useActionState(registerSeller, initialState);
  const message = state.error ?? state.success;

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <aside className="admin-login-aside">
          <span className="admin-brand-mark">s.</span>
          <p className="eyebrow">Sabeer Market · Sellers</p>
          <h1>Join the market.</h1>
          <p className="admin-login-aside-copy">
            Register your stall, tell us what you sell, and our team will verify your account before
            you can update prices.
          </p>
          <div className="admin-login-highlights">
            <div>
              <Icon name="users" size={17} />
              <span>Free seller account</span>
            </div>
            <div>
              <Icon name="tag" size={17} />
              <span>Update only your items</span>
            </div>
            <div>
              <Icon name="shield" size={17} />
              <span>Verified before access</span>
            </div>
          </div>
          <p className="admin-login-aside-foot">Seller portal · Market partners</p>
        </aside>

        <section className="admin-login-panel">
          <p className="eyebrow">Market partner</p>
          <h2>Seller registration</h2>
          <p className="admin-login-intro">
            Create your account below. An administrator reviews each registration and assigns the
            price items you can manage.
          </p>

          <form action={formAction} className="admin-login-form">
            <div className="admin-fields admin-fields-register">
              <label className="admin-field">
                <span>Your name</span>
                <input name="name" required minLength={2} autoComplete="name" placeholder="Ada Okafor" />
              </label>
              <label className="admin-field">
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@market.ng"
                />
              </label>
              <label className="admin-field">
                <span>Phone number</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+234 800 000 0000"
                />
              </label>
              <label className="admin-field">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="admin-field admin-field-wide">
                <span>Market you cover</span>
                <select name="market" defaultValue="">
                  <option value="">Choose a market (optional)</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field admin-field-wide">
                <span>Anything we should know?</span>
                <input
                  name="note"
                  maxLength={200}
                  placeholder="Stall name or products you sell (optional)"
                />
              </label>
            </div>

            {message ? (
              <p
                className={`admin-banner ${state.success ? "is-success" : "is-error"}`}
                role={state.success ? "status" : "alert"}
              >
                <Icon name={state.success ? "check" : "alert"} size={16} />
                <span>{message}</span>
              </p>
            ) : null}

            <button className="button button-primary admin-login-submit" type="submit" disabled={pending}>
              {pending ? "Creating account…" : "Create seller account"}
            </button>
          </form>

          <p className="admin-note">
            Already registered? <Link className="text-link" href="/seller">Sign in</Link>. Your account
            stays paused until an administrator verifies it.
          </p>
        </section>
      </div>
    </div>
  );
}

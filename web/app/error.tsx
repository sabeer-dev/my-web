"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="section-pad" style={{ paddingTop: "80px", paddingBottom: "120px", maxWidth: "620px" }}>
      <p className="eyebrow">Something went wrong</p>
      <h1 style={{ fontFamily: "var(--display)", fontWeight: 400, fontSize: "44px", margin: "0 0 14px" }}>
        We could not load this page.
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.7, marginBottom: "24px" }}>
        This is usually a temporary problem with the store. Try again, or email us if it keeps happening.
      </p>
      <button className="button button-dark" type="button" onClick={reset}>Try again</button>
    </main>
  );
}

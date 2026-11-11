import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section-pad" style={{ paddingTop: "80px", paddingBottom: "120px", maxWidth: "620px" }}>
      <p className="eyebrow">Page not found</p>
      <h1 style={{ fontFamily: "var(--display)", fontWeight: 400, fontSize: "44px", margin: "0 0 14px" }}>
        This page has gone off-grid.
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.7, marginBottom: "24px" }}>
        The page you asked for does not exist. Everything we sell is one click away.
      </p>
      <Link className="button button-dark" href="/">Back to the shop</Link>
    </main>
  );
}

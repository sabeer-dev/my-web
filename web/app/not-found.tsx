import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404 · Empty aisle</p>
      <h1>That shelf is <em>empty.</em></h1>
      <p>The page you&apos;re looking for isn&apos;t on today&apos;s board. Head back to the market and check the prices.</p>
      <Link className="button button-dark" href="/#prices">Back to today&apos;s prices <span aria-hidden="true">↘</span></Link>
    </main>
  );
}

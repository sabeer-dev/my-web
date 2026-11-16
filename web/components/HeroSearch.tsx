"use client";

import { useEffect, useState, type FormEvent } from "react";

export function HeroSearch() {
  const [value, setValue] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) setValue(query);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const query = value.trim();

    if (query) params.set("q", query);
    else params.delete("q");

    const search = params.toString();
    window.location.assign(`${window.location.pathname}${search ? `?${search}` : ""}#prices`);
  }

  return (
    <form className="hero-search" id="hero-search" role="search" aria-label="Search food prices" onSubmit={handleSubmit}>
      <span className="hero-search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="10.8" cy="10.8" r="6.4" />
          <path d="m16 16 4.2 4.2" />
        </svg>
      </span>
      <input
        type="search"
        name="q"
        id="hero-search-input"
        placeholder="Search rice, tomatoes, beans..."
        autoComplete="off"
        aria-label="Search food prices"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button className="button button-primary" type="submit">Check prices</button>
    </form>
  );
}

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <div className="announcement">
        <span className="announcement-dot" aria-hidden="true" />
        <span>Food prices checked every morning</span>
        <span className="announcement-sep" aria-hidden="true">·</span>
        <span>24 markets. 180+ everyday items.</span>
        <a href="mailto:shehuusmanumar176@gmail.com?subject=Free%20market%20price%20alert">
          Get a free alert ↗
        </a>
      </div>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

export function money(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export function RelativeTime({ value }: { value: string | null }) {
  const [label, setLabel] = useState("—");

  useEffect(() => {
    if (!value) return;
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return;

    const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
    if (minutes < 1) setLabel("Just now");
    else if (minutes < 60) setLabel(`${minutes}m ago`);
    else if (minutes < 1440) setLabel(`${Math.floor(minutes / 60)}h ago`);
    else if (minutes < 10080) setLabel(`${Math.floor(minutes / 1440)}d ago`);
    else
      setLabel(
        new Date(time).toLocaleDateString("en-NG", {
          day: "2-digit",
          month: "short",
          timeZone: "UTC"
        })
      );
  }, [value]);

  return <time dateTime={value ?? undefined}>{label}</time>;
}

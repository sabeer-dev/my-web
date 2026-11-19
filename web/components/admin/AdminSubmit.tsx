"use client";

import { useFormStatus } from "react-dom";

export function AdminSubmit({
  label = "Save",
  pendingLabel = "Saving…"
}: {
  label?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className="button button-primary button-small" type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

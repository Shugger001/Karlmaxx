"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./SupabaseConfigBanner.module.css";

type Props = {
  message: ReactNode;
};

/** Hides the yellow setup strip on `/admin` so the private dashboard stays clean. */
export function SupabaseConfigBannerInner({ message }: Props) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className={styles.banner} role="status">
      {message}
    </div>
  );
}

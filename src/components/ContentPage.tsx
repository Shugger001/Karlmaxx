import type { ReactNode } from "react";
import styles from "./ContentPage.module.css";

export function ContentPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
      </header>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

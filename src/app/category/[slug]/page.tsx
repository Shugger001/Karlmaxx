import { ProductGrid } from "@/components/ProductGrid";
import Link from "next/link";
import styles from "./page.module.css";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ label?: string }>;
};

function fromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const title = query.label?.trim() || fromSlug(slug);

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" prefetch={false}>
            Home
          </Link>
          <span className={styles.sep} aria-hidden>
            /
          </span>
          <span>Category</span>
          <span className={styles.sep} aria-hidden>
            /
          </span>
          <span className={styles.current}>{title}</span>
        </nav>
        <p className={styles.kicker}>Category</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.sub}>Explore products curated for this category.</p>
      </header>
      <ProductGrid />
    </section>
  );
}

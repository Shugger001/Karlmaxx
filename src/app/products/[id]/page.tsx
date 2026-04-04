import { ProductDetail } from "@/components/ProductDetail";
import styles from "./product.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className={styles.page}>
      <ProductDetail productId={id} />
    </div>
  );
}

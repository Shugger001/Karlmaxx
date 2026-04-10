import { CheckoutForm } from "@/components/CheckoutForm";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.lead}>
          Complete your order with secure payment and premium support. Prefer chat?
          Checkout via WhatsApp in one tap.
        </p>
      </header>
      <CheckoutForm />
    </div>
  );
}

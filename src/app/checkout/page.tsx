import { CheckoutForm } from "@/components/CheckoutForm";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.lead}>
          Complete your purchase securely with Paystack, or reach our concierge on
          WhatsApp.
        </p>
      </header>
      <CheckoutForm />
    </div>
  );
}

import { ContentPage } from "@/components/ContentPage";
import faqStyles from "@/components/ContentPage.module.css";
import { SITE_CONTACT } from "@/lib/siteContact";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Common questions about shopping and checkout at ${SITE_CONTACT.legalName}.`,
};

const ITEMS = [
  {
    q: "How do I pay?",
    a: "Checkout is powered by Paystack. You can complete payment with supported cards and mobile money where available. We never store your full card number on our servers.",
  },
  {
    q: "How do I track my order?",
    a: "Open Track order in the menu and enter your order reference (from your Paystack receipt) plus the email you used at checkout. You can also use a tracking token from support. Shipment stages update when our team moves your order along.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "Contact us as soon as possible via email. If fulfillment has not started, we will do our best to help. See our shipping page for timelines.",
  },
  {
    q: "Do you deliver outside Ghana?",
    a: "Delivery zones and fees depend on your address and courier options. Message us with your location for a clear answer before you order.",
  },
  {
    q: "How do I create an account?",
    a: "Use Sign up in the header to register. You can sign in later to speed through checkout and review your profile.",
  },
  {
    q: "Something looks wrong with my profile or admin access.",
    a: "Sign out and back in. If the issue persists, email us with the address you used to register so we can check your account.",
  },
] as const;

export default function FaqPage() {
  return (
    <ContentPage
      title="Frequently asked questions"
      lead="Quick answers about payments, orders, and accounts."
    >
      {ITEMS.map((item) => (
        <section key={item.q} className={faqStyles.faqItem}>
          <h2 className={faqStyles.faqQ}>{item.q}</h2>
          <p className={faqStyles.faqA}>{item.a}</p>
        </section>
      ))}
      <p style={{ marginTop: "1.5rem" }}>
        Still stuck? <Link href="/contact">Contact us</Link> or read{" "}
        <Link href="/shipping">shipping &amp; returns</Link>.
      </p>
    </ContentPage>
  );
}

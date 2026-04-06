import { ContentPage } from "@/components/ContentPage";
import { SITE_CONTACT } from "@/lib/siteContact";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: `Delivery and returns information for ${SITE_CONTACT.legalName}.`,
};

export default function ShippingPage() {
  return (
    <ContentPage
      title="Shipping & returns"
      lead="Policies below are a starting point — adjust timelines and fees to match how you actually fulfil orders."
    >
      <h2>Processing</h2>
      <p>
        Orders are typically confirmed after successful payment. Packing and
        handoff to the courier usually follows within 1–2 business days unless
        stated otherwise on the product or at checkout.
      </p>
      <h2>Delivery</h2>
      <p>
        Rates and estimated transit times depend on your location and the
        carrier. You will receive the details that apply to your order at
        checkout or by email.
      </p>
      <h2>Returns & exchanges</h2>
      <ul>
        <li>Contact us within 7 days of delivery if an item is wrong or faulty.</li>
        <li>Items should be unused, with tags and original packaging where possible.</li>
        <li>Refunds or replacements are issued after we receive and inspect the return.</li>
      </ul>
      <h2>Need help?</h2>
      <p>
        Email <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a> or
        visit <Link href="/contact">Contact</Link>.
      </p>
    </ContentPage>
  );
}

import { ContentPage } from "@/components/ContentPage";
import styles from "@/components/ContentPage.module.css";
import { SITE_CONTACT, whatsappChatUrl } from "@/lib/siteContact";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach ${SITE_CONTACT.legalName} for orders and product questions.`,
};

export default function ContactPage() {
  const wa = whatsappChatUrl();

  return (
    <ContentPage
      title="Contact us"
      lead="We are happy to help with orders, sizing questions, and delivery details."
    >
      <h2>Email</h2>
      <p>
        <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
      </p>
      {SITE_CONTACT.phoneDisplay && SITE_CONTACT.phoneTel ? (
        <>
          <h2>Phone</h2>
          <p>
            <a href={`tel:${SITE_CONTACT.phoneTel}`}>{SITE_CONTACT.phoneDisplay}</a>
          </p>
        </>
      ) : null}
      <div className={styles.actions}>
        <a className={styles.btnPrimary} href={`mailto:${SITE_CONTACT.email}`}>
          Send email
        </a>
        {wa ? (
          <a
            className={styles.btnGhost}
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        ) : null}
        <Link className={styles.btnGhost} href="/faq">
          Read FAQ
        </Link>
      </div>
    </ContentPage>
  );
}

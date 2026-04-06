export type SocialNetworkId =
  | "instagram"
  | "facebook"
  | "x"
  | "tiktok"
  | "youtube";

export type SocialLink = {
  id: SocialNetworkId;
  href: string;
  label: string;
};

/**
 * Public social profile URLs. Set in `.env.local` / hosting (never secrets).
 * Only `https?://` URLs are accepted.
 */
export function getSocialLinks(): SocialLink[] {
  const out: SocialLink[] = [];

  const push = (id: SocialNetworkId, envKey: string, label: string) => {
    const raw = process.env[envKey]?.trim();
    if (!raw || !/^https?:\/\//i.test(raw)) return;
    out.push({ id, href: raw, label });
  };

  push("instagram", "NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL", "Instagram");
  push("facebook", "NEXT_PUBLIC_SOCIAL_FACEBOOK_URL", "Facebook");
  push("x", "NEXT_PUBLIC_SOCIAL_X_URL", "X");
  push("tiktok", "NEXT_PUBLIC_SOCIAL_TIKTOK_URL", "TikTok");
  push("youtube", "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL", "YouTube");

  return out;
}

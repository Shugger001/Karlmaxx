"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

const PLACEHOLDER = "/placeholder-product.svg";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  /** When false, skip ambient photo drift. Default true. */
  photoMotion?: boolean;
  /** `subtle` — small avatars / cart rows / admin thumbs; `rev` — alternate pan. */
  photoMotionVariant?: "default" | "rev" | "subtle";
};

function isRemoteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function mergeClassName(
  photoMotion: boolean | undefined,
  variant: "default" | "rev" | "subtle",
  className: string | undefined,
): string | undefined {
  const motionClass =
    photoMotion === false
      ? ""
      : variant === "subtle"
        ? "photo-surface-motion-subtle"
        : variant === "rev"
          ? "photo-surface-motion-rev"
          : "photo-surface-motion";
  const merged = [motionClass, className].filter(Boolean).join(" ");
  return merged || undefined;
}

/** Falls back to a local placeholder when remote URLs fail (invalid hosts, 404, etc.). */
export function SafeImage({
  src,
  className,
  photoMotion = true,
  photoMotionVariant = "default",
  ...rest
}: SafeImageProps) {
  const [resolved, setResolved] = useState(src);
  useEffect(() => {
    setResolved(src);
  }, [src]);

  /** Skip the optimizer for remote files so Picsum/CDN redirects and edge cases still load. */
  const unoptimized = isRemoteUrl(resolved);

  return (
    // `alt` is supplied by callers via `rest` (ProductCard/ProductDetail pass it).
    // eslint-disable-next-line jsx-a11y/alt-text -- spread from ImageProps
    <Image
      {...rest}
      src={resolved}
      className={mergeClassName(photoMotion, photoMotionVariant, className)}
      unoptimized={unoptimized}
      onError={() => {
        setResolved((r) => (r === PLACEHOLDER ? r : PLACEHOLDER));
      }}
    />
  );
}

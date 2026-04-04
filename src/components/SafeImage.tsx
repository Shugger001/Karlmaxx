"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

const PLACEHOLDER = "/placeholder-product.svg";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
};

function isRemoteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/** Falls back to a local placeholder when remote URLs fail (invalid hosts, 404, etc.). */
export function SafeImage({ src, ...rest }: SafeImageProps) {
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
      unoptimized={unoptimized}
      onError={() => {
        setResolved((r) => (r === PLACEHOLDER ? r : PLACEHOLDER));
      }}
    />
  );
}

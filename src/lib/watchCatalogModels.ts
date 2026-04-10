/**
 * Display names and indicative retail in GHS for each on-disk watch asset under
 * /public/catalog/watches. Used when a watch SKU gallery is entirely this
 * local pool (no custom uploads / external URLs).
 *
 * USD to cedis is approximate (~12.5x) for relative shelf positioning, not live FX.
 */

export type WatchCatalogModel = {
  brand: string;
  /** Short product title shown on cards and detail */
  name: string;
  /** Indicative street-style retail in Ghana cedis */
  priceGhs: number;
};

const BY_PATH: Record<string, WatchCatalogModel> = {
  "/catalog/watches/watch-01.jpeg": {
    brand: "Breguet",
    name: "Classique Date · white enamel dial",
    priceGhs: 298_500,
  },
  "/catalog/watches/watch-02.png": {
    brand: "Fossil",
    name: "Inscription · green dial · square case",
    priceGhs: 2_249,
  },
  "/catalog/watches/watch-03.png": {
    brand: "Coach",
    name: "Perry · gold case · red leather",
    priceGhs: 1_699,
  },
  "/catalog/watches/watch-04.png": {
    brand: "Salvatore Ferragamo",
    name: "Vega · steel bracelet · silver dial",
    priceGhs: 13_149,
  },
  "/catalog/watches/watch-05.png": {
    brand: "Fossil",
    name: "Neutra Chronograph · cream dial · FS5380",
    priceGhs: 1_749,
  },
  "/catalog/watches/watch-06.png": {
    brand: "Michael Kors",
    name: "Bradshaw Chronograph · rose gold-tone",
    priceGhs: 2_649,
  },
  "/catalog/watches/watch-07.png": {
    brand: "Coach",
    name: "Kent Chronograph · blue dial · leather",
    priceGhs: 3_399,
  },
  "/catalog/watches/watch-08.png": {
    brand: "Tom Ford",
    name: "Ocean Plastic N.004 · black braided strap",
    priceGhs: 15_599,
  },
  "/catalog/watches/watch-09.png": {
    brand: "Tom Ford",
    name: "Ocean Plastic N.002 · black dial",
    priceGhs: 15_599,
  },
  "/catalog/watches/watch-10.png": {
    brand: "Coach",
    name: "Park · glitter dial · rose gold bracelet",
    priceGhs: 2_349,
  },
  "/catalog/watches/watch-11.png": {
    brand: "Fossil",
    name: "Carraway · two-tone · black dial · FS6012",
    priceGhs: 2_049,
  },
  "/catalog/watches/watch-12.png": {
    brand: "TRIWA",
    name: "Humanium Metal 39 · slate dial · leather",
    priceGhs: 3_099,
  },
  "/catalog/watches/watch-13.png": {
    brand: "Fossil",
    name: "Nate Chronograph · black steel · JR1401",
    priceGhs: 1_599,
  },
  "/catalog/watches/watch-14.png": {
    brand: "Fossil",
    name: "Autobahn Chronograph · two-tone bracelet",
    priceGhs: 2_499,
  },
  "/catalog/watches/watch-15.png": {
    brand: "Guess",
    name: "Continental · day-date · green dial",
    priceGhs: 2_499,
  },
  "/catalog/watches/watch-16.png": {
    brand: "Breda",
    name: "Jane · white leather · gold case",
    priceGhs: 2_049,
  },
};

const LOCAL_WATCH_PREFIX = "/catalog/watches/watch-";

export function isLocalWatchCatalogPath(url: string): boolean {
  const t = url.trim();
  return t.startsWith(LOCAL_WATCH_PREFIX);
}

/** True when every gallery URL is a known on-disk watch asset (no uploads / Pexels). */
export function galleryIsOnlyLocalWatchAssets(urls: string[]): boolean {
  if (urls.length === 0) return false;
  return urls.every((u) => {
    const t = u.trim();
    return isLocalWatchCatalogPath(t) && Boolean(BY_PATH[t]);
  });
}

/** Lead image path must exist in the catalog map. */
export function watchCatalogModelForGallery(urls: string[]): WatchCatalogModel | null {
  if (!galleryIsOnlyLocalWatchAssets(urls)) return null;
  const lead = urls[0]!.trim();
  return BY_PATH[lead] ?? null;
}

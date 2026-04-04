-- Replace product image URLs with stable Picsum (seeded) URLs so thumbnails and galleries load reliably.
-- Picsum redirects from picsum.photos → fastly.picsum.photos; both are allowlisted in next.config.ts.
-- Preserves existing color option names and hex values; only the `image` field on each variant is rewritten.

UPDATE public.products AS p
SET
  images = ARRAY[
    format('https://picsum.photos/seed/%s/800/1067', md5(p.id::text || 'img0')),
    format('https://picsum.photos/seed/%s/800/1067', md5(p.id::text || 'img1')),
    format('https://picsum.photos/seed/%s/800/1067', md5(p.id::text || 'img2'))
  ],
  color_options = COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_set(
          t.elem,
          '{image}',
          to_jsonb(
            format(
              'https://picsum.photos/seed/%s/800/1067',
              md5(p.id::text || 'c' || t.ord::text)
            )
          )
        )
        ORDER BY t.ord
      )
      FROM jsonb_array_elements(COALESCE(p.color_options, '[]'::jsonb)) WITH ORDINALITY AS t (elem, ord)
    ),
    '[]'::jsonb
  );

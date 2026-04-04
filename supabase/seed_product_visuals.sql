-- Optional: run in Supabase SQL Editor to refresh product imagery when remote Unsplash IDs break (404).
-- Mirrors migrations/003_stable_picsum_product_images.sql — keeps each row's colour names/hex, rewrites URLs only.
-- next.config.ts must allow https://picsum.photos and https://fastly.picsum.photos for next/image.

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

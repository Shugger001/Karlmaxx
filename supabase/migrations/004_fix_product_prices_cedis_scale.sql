-- Fix prices stored 100× too large (e.g. 185000 in DB → should be 1850.00 GHS for ₵1,850.00 display).
-- Paystack still uses pesewas at checkout via cedisToPesewas(price); `price` must be whole cedis.
--
-- BEFORE RUNNING — preview:
--   SELECT id, name, price AS current_db,
--          round((price / 100)::numeric, 2) AS after_divide
--   FROM public.products
--   ORDER BY name;
--
-- If only some SKUs are wrong, update those rows in the Admin UI or with:
--   UPDATE public.products SET price = 1850.00 WHERE id = '…';
--
-- If your entire catalog used the wrong scale, run the UPDATE below once.

UPDATE public.products
SET price = round((price / 100)::numeric, 2);

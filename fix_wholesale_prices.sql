-- Fixing wholesale prices to represent the FULL MINIMUM PACK price instead of unit price where applicable.
-- Bombas de Defumación (16u x 300 = 4800)
UPDATE public.wholesale_products 
SET wholesale_price = 4800.00 
WHERE name = 'Bombas de Defumación';

-- Eco Sahumerios (18u x 325 = 5850)
UPDATE public.wholesale_products 
SET wholesale_price = 5850.00 
WHERE name = 'Eco Sahumerios';

-- Tibetanos (18u x 315 = 5670)
UPDATE public.wholesale_products 
SET wholesale_price = 5670.00 
WHERE name = 'Tibetanos';

-- Verify current state
SELECT name, wholesale_price, min_total_qty, (wholesale_price / min_total_qty) as unit_price 
FROM public.wholesale_products;

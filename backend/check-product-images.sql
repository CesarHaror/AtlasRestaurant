-- Verificar si el producto "Arrachera Marinada" existe y tiene imágenes
SELECT 
    id,
    name,
    sku,
    image_url IS NOT NULL as has_image,
    thumbnail_url IS NOT NULL as has_thumbnail,
    LENGTH(image_url) as image_size,
    LENGTH(thumbnail_url) as thumbnail_size,
    created_at,
    updated_at
FROM products
WHERE name ILIKE '%arrachera%' OR name ILIKE '%marinada%'
ORDER BY updated_at DESC
LIMIT 10;

-- Ver la longitud exacta de los campos de imagen
SELECT 
    id,
    name,
    LENGTH(CAST(image_url AS TEXT)) as image_length,
    LENGTH(CAST(thumbnail_url AS TEXT)) as thumbnail_length
FROM products
WHERE image_url IS NOT NULL OR thumbnail_url IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;

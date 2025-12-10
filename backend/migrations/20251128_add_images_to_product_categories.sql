-- Add image columns to product_categories table
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_image_url ON product_categories(image_url);

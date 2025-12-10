import { useEffect, useState } from 'react';
import { Button, Spin, Image } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { categoriesService } from '../services/api';
import './CategoryCarousel.css';

interface ProductCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryCarouselProps {
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  selectedCategoryId,
  onCategorySelect,
}) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesService.getAll();
        // La API de backend devuelve un array directo de categorías
        const data = Array.isArray(response.data) ? response.data : [];
        setCategories(data as ProductCategory[]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <Spin />;
  if (categories.length === 0) return null; // No mostrar si no hay categorías

  return (
    <div className="category-carousel-container">
      <div className="category-carousel">
        <Button
          size="small"
          icon={<ClearOutlined />}
          onClick={() => onCategorySelect(null)}
          type={selectedCategoryId === null ? 'primary' : 'default'}
          className="category-button"
        >
          Todas
        </Button>

        {categories
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name))
          .map((category) => (
            <Button
              key={category.id}
              size="small"
              type={selectedCategoryId === category.id ? 'primary' : 'default'}
              onClick={() => onCategorySelect(category.id)}
              className="category-button"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', width: '100%' }}>
                {category.thumbnailUrl && (
                  <Image
                    src={category.thumbnailUrl.startsWith('http') ? category.thumbnailUrl : `http://localhost:3000${category.thumbnailUrl}`}
                    alt={category.name}
                    width={20}
                    height={20}
                    style={{ objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                    preview={false}
                  />
                )}
                <span style={{ fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.name}</span>
              </div>
            </Button>
          ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;

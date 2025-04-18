
import { Product } from "@/services/api";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  wishlisted?: string[];
  onWishlistToggle?: () => void;
  emptyMessage?: string;
}

const ProductGrid = ({ 
  products, 
  wishlisted = [], 
  onWishlistToggle,
  emptyMessage = "No products found."
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard 
          key={product._id} 
          product={product} 
          isWishlisted={wishlisted.includes(product._id)}
          onWishlistToggle={onWishlistToggle}
        />
      ))}
    </div>
  );
};

export default ProductGrid;

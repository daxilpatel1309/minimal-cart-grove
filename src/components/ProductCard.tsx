
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cartAPI, wishlistAPI } from "@/services/api";

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
}

const ProductCard = ({ 
  product, 
  isWishlisted = false,
  onWishlistToggle
}: ProductCardProps) => {
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(isWishlisted);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      setIsAddingToCart(true);
      const response = await cartAPI.addToCart(product._id);
      if (response.success) {
        toast.success(`${product.name} added to cart!`);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      setIsAddingToWishlist(true);
      
      if (isInWishlist) {
        const response = await wishlistAPI.removeFromWishlist(product._id);
        if (response.success) {
          setIsInWishlist(false);
          toast.success(`${product.name} removed from wishlist!`);
          if (onWishlistToggle) onWishlistToggle();
        }
      } else {
        const response = await wishlistAPI.addToWishlist(product._id);
        if (response.success) {
          setIsInWishlist(true);
          toast.success(`${product.name} added to wishlist!`);
          if (onWishlistToggle) onWishlistToggle();
        }
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  // Default placeholder image if no images are available
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://placehold.co/400x300?text=No+Image";

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img 
            src={productImage} 
            alt={product.name} 
            className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-0 right-0 p-2">
          <button
            onClick={handleToggleWishlist}
            disabled={isAddingToWishlist}
            className={`p-2 rounded-full ${
              isInWishlist 
                ? 'bg-red-50 text-red-500' 
                : 'bg-white text-gray-400 hover:text-red-500'
            } shadow-sm transition-colors`}
          >
            <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="font-medium text-gray-800 mb-1 hover:text-brand-purple transition-colors">
            {truncateText(product.name, 50)}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-400 mr-1">
            <Star size={16} fill="currentColor" />
          </div>
          <span className="text-sm text-gray-600">
            {product.rating_avg || "New"}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-3">
          {truncateText(product.description, 60)}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-brand-purple hover:bg-brand-darkPurple text-white p-2 rounded-full transition-colors"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

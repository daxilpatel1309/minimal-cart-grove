
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productsAPI, Product, reviewsAPI, Review, cartAPI, wishlistAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ThumbsUp, 
  ThumbsDown 
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import ProductGrid from "@/components/ProductGrid";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Fetch product, reviews and check wishlist status
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch product details
        const productResponse = await productsAPI.getById(id);
        if (productResponse.success && productResponse.data) {
          setProduct(productResponse.data);
          
          // Fetch related products (placeholder - in real app would fetch based on category)
          const allProductsResponse = await productsAPI.getAll();
          if (allProductsResponse.success && allProductsResponse.data) {
            const related = allProductsResponse.data
              .filter(p => p._id !== id)
              .sort(() => 0.5 - Math.random())
              .slice(0, 4);
            setRelatedProducts(related);
          }
          
          // Fetch reviews
          const reviewsResponse = await reviewsAPI.getProductReviews(id);
          if (reviewsResponse.success && reviewsResponse.data) {
            setReviews(reviewsResponse.data);
          }
          
          // Check if product is in wishlist
          if (isAuthenticated) {
            const wishlistResponse = await wishlistAPI.getWishlist();
            if (wishlistResponse.success && wishlistResponse.data) {
              const isWishlisted = wishlistResponse.data.some((item: Product) => item._id === id);
              setIsInWishlist(isWishlisted);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, isAuthenticated]);

  const handlePrevImage = () => {
    if (!product?.images?.length) return;
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product?.images?.length) return;
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleChangeQuantity = (value: number) => {
    if (value < 1 || (product && value > product.stock)) return;
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await cartAPI.addToCart(product._id, quantity);
      if (response.success) {
        toast.success(`Added ${quantity} ${quantity > 1 ? "items" : "item"} to cart`);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        const response = await wishlistAPI.removeFromWishlist(product._id);
        if (response.success) {
          setIsInWishlist(false);
          toast.success(`${product.name} removed from wishlist`);
        }
      } else {
        const response = await wishlistAPI.addToWishlist(product._id);
        if (response.success) {
          setIsInWishlist(true);
          toast.success(`${product.name} added to wishlist`);
        }
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || !isAuthenticated) return;
    
    if (!userReview.comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const response = await reviewsAPI.createReview({
        product_id: product._id,
        rating: userReview.rating,
        comment: userReview.comment,
      });
      
      if (response.success && response.data) {
        toast.success("Review submitted successfully");
        setReviews([...reviews, response.data]);
        setUserReview({ rating: 5, comment: "" });
        setIsReviewDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  // Default placeholder image if no images are available
  const productImage = product?.images && product.images.length > 0 
    ? product.images[selectedImage] 
    : "https://placehold.co/600x400?text=No+Image";

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-500 mb-4">
              {error || "Product not found"}
            </h2>
            <Link to="/">
              <Button className="bg-brand-purple hover:bg-brand-darkPurple">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-500 hover:text-brand-purple">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link to="/products" className="text-gray-500 hover:text-brand-purple">
                    Products
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-700 truncate max-w-[200px]">
                    {product.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[400px]">
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-brand-purple"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-brand-purple"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded border-2 ${
                        idx === selectedImage
                          ? "border-brand-purple"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Product thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-yellow-400 mr-2">
                    {Array(5)
                      .fill(null)
                      .map((_, idx) => (
                        <Star
                          key={idx}
                          size={18}
                          fill={idx < calculateAverageRating() ? "currentColor" : "none"}
                          strokeWidth={1}
                        />
                      ))}
                  </div>
                  <span className="text-gray-500">
                    {calculateAverageRating().toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
                
                <div className="text-2xl font-bold text-brand-purple mb-4">
                  ${product.price.toFixed(2)}
                </div>
                
                <div className="prose prose-sm text-gray-600 mb-4">
                  <p>{product.description}</p>
                </div>
              </div>
              
              <div className="border-t border-b border-gray-100 py-4 my-6">
                <div className="flex items-center mb-4">
                  <div className="w-24 text-gray-600">Status:</div>
                  {product.stock > 0 ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      In Stock ({product.stock} available)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-gray-600">Category:</div>
                  <Badge variant="outline" className="bg-gray-50">
                    {product.category_id || "Uncategorized"}
                  </Badge>
                </div>
              </div>
              
              {/* Quantity and Add to Cart */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <span className="mr-4 text-gray-600">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => handleChangeQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-gray-600 hover:text-brand-purple disabled:text-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleChangeQuantity(parseInt(e.target.value) || 1)}
                      className="w-12 text-center border-none focus:ring-0"
                    />
                    <button
                      onClick={() => handleChangeQuantity(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-3 py-2 text-gray-600 hover:text-brand-purple disabled:text-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.stock < 1}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-darkPurple"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleToggleWishlist}
                    disabled={isAddingToWishlist}
                    variant="outline"
                    className={isInWishlist ? "text-red-500 border-red-200" : ""}
                  >
                    {isAddingToWishlist ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2"></div>
                    ) : (
                      <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs (Description, Reviews, etc.) */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="py-2">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <p className="text-gray-600">{product.description}</p>
                
                {/* This would typically come from the product data */}
                <h4 className="text-lg font-medium mt-6 mb-2">Features</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>High quality materials</li>
                  <li>Durable construction</li>
                  <li>Easy to use</li>
                  <li>Versatile application</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="py-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  Customer Reviews ({reviews.length})
                </h3>
                
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-brand-purple hover:bg-brand-darkPurple"
                      disabled={!isAuthenticated}
                    >
                      Write a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Rating
                        </label>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setUserReview({ ...userReview, rating })}
                              className="p-1"
                            >
                              <Star
                                size={24}
                                className="text-yellow-400"
                                fill={userReview.rating >= rating ? "currentColor" : "none"}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Your Review
                        </label>
                        <Textarea 
                          value={userReview.comment}
                          onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                          placeholder="Share your experience with this product..." 
                          rows={4}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        className="bg-brand-purple hover:bg-brand-darkPurple"
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                      >
                        {isSubmittingReview ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          "Submit Review"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
                              <div className="flex items-center text-yellow-400 mr-2">
                                {Array(5)
                                  .fill(null)
                                  .map((_, idx) => (
                                    <Star
                                      key={idx}
                                      size={16}
                                      fill={idx < review.rating ? "currentColor" : "none"}
                                      strokeWidth={1}
                                    />
                                  ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="text-gray-400 hover:text-green-500">
                              <ThumbsUp size={16} />
                            </button>
                            <button className="text-gray-400 hover:text-red-500">
                              <ThumbsDown size={16} />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">You might also like</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

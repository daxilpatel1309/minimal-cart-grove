
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartAPI, CartItem, ordersAPI } from "@/services/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Trash, 
  Plus, 
  Minus, 
  CreditCard, 
  ArrowRight 
} from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      if (response.success && response.data) {
        setCartItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    // Prevent invalid quantity
    if (quantity < 1) return;
    
    try {
      const response = await cartAPI.updateQuantity(productId, quantity);
      if (response.success) {
        setCartItems(prev => 
          prev.map(item => 
            item.product_id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      if (response.success) {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    setTimeout(() => {
      toast.error("Invalid or expired promo code");
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setPlacingOrder(true);
    try {
      const response = await ordersAPI.placeOrder("credit_card");
      if (response.success) {
        toast.success("Order placed successfully!");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Cart</h1>
          <div className="text-gray-500">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4 flex justify-center">
              <ShoppingCart size={64} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/">
              <Button className="bg-brand-purple hover:bg-brand-darkPurple">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Cart items list */}
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.product_id}>
                      <div className="flex flex-wrap md:flex-nowrap items-center">
                        {/* Product image */}
                        <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden mr-4 mb-4 md:mb-0">
                          <img
                            src={item.image || "https://placehold.co/100x100?text=Product"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product info */}
                        <div className="flex-grow mb-4 md:mb-0">
                          <Link to={`/products/${item.product_id}`} className="hover:text-brand-purple">
                            <h3 className="font-medium">{item.name}</h3>
                          </Link>
                          <p className="text-brand-purple font-medium mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Quantity controls */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:text-brand-purple"
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="text"
                              value={item.quantity}
                              readOnly
                              className="w-10 text-center border-none focus:ring-0"
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:text-brand-purple"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Link to="/">
                    <Button variant="outline">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Promo code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Promo Code
                  </label>
                  <div className="flex">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="rounded-r-none"
                    />
                    <Button
                      onClick={handleApplyPromoCode}
                      disabled={isApplyingPromo || !promoCode}
                      className="rounded-l-none bg-brand-purple hover:bg-brand-darkPurple"
                    >
                      {isApplyingPromo ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={placingOrder || cartItems.length === 0}
                  className="w-full bg-brand-purple hover:bg-brand-darkPurple flex items-center justify-center gap-2"
                >
                  {placingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Proceed to Checkout
                    </>
                  )}
                </Button>
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

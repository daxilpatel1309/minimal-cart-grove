
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  User,
  Package,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-brand-purple">ShopEase</span>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block flex-grow max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-full bg-brand-softGray border-0 focus:ring-2 focus:ring-brand-purple"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-2 text-gray-400 hover:text-brand-purple"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="p-2 relative group">
                  <ShoppingCart size={24} className="text-gray-700 group-hover:text-brand-purple transition-colors" />
                </Link>
                <Link to="/wishlist" className="p-2 relative group">
                  <Heart size={24} className="text-gray-700 group-hover:text-brand-purple transition-colors" />
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 focus:ring-0">
                      <span className="font-medium">
                        {user?.first_name}
                      </span>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      Hello, {user?.first_name}!
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex w-full cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex w-full cursor-pointer items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {user?.role === "seller" && (
                      <DropdownMenuItem asChild>
                        <Link to="/seller/dashboard" className="flex w-full cursor-pointer items-center">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Seller Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="flex w-full cursor-pointer items-center">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={logout} className="flex w-full cursor-pointer items-center text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-brand-purple hover:bg-brand-darkPurple text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search - visible on mobile only */}
        <div className="mt-4 block md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-full bg-brand-softGray border-0 focus:ring-2 focus:ring-brand-purple"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-2 text-gray-400 hover:text-brand-purple"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-100 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-brand-purple">
                    <User size={20} />
                    <span>Profile</span>
                  </Link>
                  <Link to="/orders" className="flex items-center space-x-2 text-gray-700 hover:text-brand-purple">
                    <Package size={20} />
                    <span>My Orders</span>
                  </Link>
                  <Link to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-brand-purple">
                    <ShoppingCart size={20} />
                    <span>Cart</span>
                  </Link>
                  <Link to="/wishlist" className="flex items-center space-x-2 text-gray-700 hover:text-brand-purple">
                    <Heart size={20} />
                    <span>Wishlist</span>
                  </Link>
                  {user?.role === "seller" && (
                    <Link to="/seller/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-brand-purple">
                      <Package size={20} />
                      <span>Seller Dashboard</span>
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link to="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-brand-purple">
                      <Package size={20} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 text-red-500 hover:text-red-600"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login">
                    <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-brand-purple hover:bg-brand-darkPurple text-white w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

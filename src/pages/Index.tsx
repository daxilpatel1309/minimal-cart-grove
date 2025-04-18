
import { useState, useEffect } from "react";
import { productsAPI, Product, categoriesAPI, Category } from "@/services/api";
import ProductGrid from "@/components/ProductGrid";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsResponse = await productsAPI.getAll();
        const categoriesResponse = await categoriesAPI.getAll();
        
        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data);
        }
        
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search, price range, and categories
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Price filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(product.category_id);
    
    return matchesSearch && matchesPrice && matchesCategory;
  });

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
  };

  const toggleFilterMenu = () => {
    setFilterMenuOpen(!filterMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-brand-softGray to-white rounded-2xl p-8 mb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 text-brand-deepPurple">
              Discover Amazing Products
            </h1>
            <p className="text-lg mb-6 text-gray-600">
              Find the best products from trusted sellers at competitive prices. Start shopping today!
            </p>
            <div className="relative max-w-lg">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-base rounded-full"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>
        </div>
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Button 
            onClick={toggleFilterMenu}
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            <Filter size={18} />
            {filterMenuOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop (always visible) and Mobile (togglable) */}
          <div className={`lg:w-1/4 ${filterMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm text-brand-purple hover:text-brand-darkPurple"
                >
                  Clear all
                </Button>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-4">Price Range</h3>
                <Slider
                  defaultValue={[0, 1000]}
                  value={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={handlePriceRangeChange}
                  className="mb-4"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    ${priceRange[0]}
                  </span>
                  <span className="text-sm text-gray-500">
                    ${priceRange[1]}
                  </span>
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-4">Categories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <div key={category._id} className="flex items-center">
                        <Checkbox
                          id={`category-${category._id}`}
                          checked={selectedCategories.includes(category._id)}
                          onCheckedChange={() => handleCategoryChange(category._id)}
                        />
                        <Label
                          htmlFor={`category-${category._id}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No categories available</p>
                  )}
                </div>
              </div>
              
              {/* Mobile Only - Close Button */}
              <div className="lg:hidden mt-4">
                <Button 
                  onClick={() => setFilterMenuOpen(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Product Listing */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {searchQuery 
                  ? `Search results for "${searchQuery}"` 
                  : "All Products"}
              </h2>
              <span className="text-gray-500">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Active Filter Tags */}
            {(searchQuery || selectedCategories.length > 0 || 
              priceRange[0] > 0 || priceRange[1] < 1000) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <div className="bg-brand-softGray px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <span>Search: {searchQuery}</span>
                    <X 
                      size={14} 
                      className="cursor-pointer" 
                      onClick={() => setSearchQuery("")}
                    />
                  </div>
                )}
                
                {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <div className="bg-brand-softGray px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <span>Price: ${priceRange[0]} - ${priceRange[1]}</span>
                    <X 
                      size={14} 
                      className="cursor-pointer" 
                      onClick={() => setPriceRange([0, 1000])}
                    />
                  </div>
                )}
                
                {selectedCategories.map((categoryId) => {
                  const category = categories.find(c => c._id === categoryId);
                  return category ? (
                    <div 
                      key={categoryId}
                      className="bg-brand-softGray px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <span>{category.name}</span>
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => handleCategoryChange(categoryId)}
                      />
                    </div>
                  ) : null;
                })}
                
                {(searchQuery || selectedCategories.length > 0 || 
                  priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <button
                    onClick={clearFilters}
                    className="text-brand-purple hover:underline text-sm flex items-center"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-brand-purple hover:bg-brand-darkPurple"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
                <Button 
                  onClick={clearFilters}
                  className="bg-brand-purple hover:bg-brand-darkPurple"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <h3 className="text-xl font-bold text-brand-purple mb-4">ShopEase</h3>
              <p className="text-gray-600 mb-4">
                Your one-stop shop for all your needs. Quality products, competitive prices.
              </p>
            </div>
            
            <div className="w-full md:w-1/3 md:px-8 mb-8 md:mb-0">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-600 hover:text-brand-purple transition-colors">Home</a></li>
                <li><a href="/products" className="text-gray-600 hover:text-brand-purple transition-colors">Products</a></li>
                <li><a href="/about" className="text-gray-600 hover:text-brand-purple transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-brand-purple transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div className="w-full md:w-1/3">
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-600 mb-2">Email: support@shopease.com</p>
              <p className="text-gray-600 mb-2">Phone: (123) 456-7890</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
